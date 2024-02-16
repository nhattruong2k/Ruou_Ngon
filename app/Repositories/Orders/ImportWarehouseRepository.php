<?php

namespace App\Repositories\Orders;

use App\Models\DailyProductBalance;
use App\Models\Good;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderOrderStatus;
use App\Repositories\BaseRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ImportWarehouseRepository extends BaseRepository
{
    protected $order;
    protected $orderItem;
    protected $dailyProductBalance;
    protected $notification;
    protected $orderOrderStatus;

    public function __construct(
        Order $order,
        OrderItem $orderItem,
        DailyProductBalance $dailyProductBalance,
        Notification $notification,
        OrderOrderStatus $orderOrderStatus,
    ) {
        $this->order = $order;
        $this->orderItem = $orderItem;
        $this->dailyProductBalance = $dailyProductBalance;
        $this->notification = $notification;
        $this->orderOrderStatus = $orderOrderStatus;
        parent::__construct($order);
    }

    public function getAll($request = null)
    {
        $user = Auth::user();
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->order->with([
            'function',
            'employee',
            'orderItems.good',
            'orderItems.good.unitOfMeasure',
            'orderStatus',
            'orderReference.employee',
            'orderReference.orderItems.internalOrg',
        ])
            ->when($request->filled('function_id'), function ($query) use ($request) {
                if ($request->get('function_id') == config('contants.functions.import_transfer')) {
                    return $query->where('function_id', $request->get('function_id'))
                        ->whereRelation(
                            'orderReference',
                            'order_status_id',
                            '>=',
                            config('contants.order_status.completed')
                        );
                } else {
                    if ($request->get('function_id') == config('contants.functions.import_refund')) {
                        return $query->where('function_id', config('contants.functions.refund'));
                    } else {
                        return $query->where('function_id', $request->get('function_id'));
                    }
                }
            })->when(
                $request->filled('order_status_id') && $request->get('order_status_id') != 'all',
                function ($query) use ($request) {
                    return $query->where('order_status_id', $request->get('order_status_id'));
                }
            )->when(
                $request->filled('filter_start_date') && $request->filled('filter_end_date'),
                function ($query) use ($request) {
                    // if ($request->get('function_id') != config('contants.functions.import_transfer')) {
                    return $query->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']]);
                    // }
                }
            )->when($request->filled('filter_name'), function ($query) use ($request) {
                return $query->where('code', 'like', '%'.$request->get('filter_name').'%');
            })->when(
                $request->filled('filter_warehouse') && $request->get('filter_warehouse') != 'all',
                function ($query) use ($request) {
                    return $query->whereRelation('orderItems', 'warehouse_id', '=', $request->get('filter_warehouse'));
                }
            )->when(
                $user->hasRole('warehouse'),
                function ($query) use ($user) {
                    return $query->whereRelation('orderItems', 'warehouse_id', '=', $user->internal_org_id);
                }
            );

        if ($rowsPerPage) {
            $pagination = $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
            $pagination->getCollection()->each(function ($order) {
                $order->append(['total_quantity', 'warehouse']);
            });
            return $pagination;
        }
        return $query->orderBy('id', 'DESC')->get();
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->get('items') ?? null;

            if (empty($orderItems)) {
                throw new Exception('Danh sách xe rỗng', 404);
            }

            $request->merge([
                'code' => Order::generateCode(
                    $request['function_id']['id'],
                    $request['date'],
                    $request['function_id']['code']
                ),
                'function_id' => $request['function_id']['id'],
                'order_status_id' => 1,
                'created_by' => $request['employee_id'],
            ]);

            $order = $this->order->create($request->all());

            foreach ($orderItems as $dataOrderItem) {

                $this->orderItem->create([
                    'order_id' => $order->id,
                    'warehouse_id' => $request['internal_org_id'],
                    'good_id' => $dataOrderItem['good_id']['id'],
                    'quantity' => $dataOrderItem['quantity'],
                    'created_by' => Auth::user()->id,
                    'consultant_id' => $request['employee_id']
                ]);
            }

            // create notification of order
            $this->notification->createNotiWhenAddNew([
                'feature_id' => $order->id,
                'function_id' => $request->function_id
            ]);

            DB::commit();

            return [
                'status' => true,
                'data' => true,
                'code' => 201,
                'message' => 'Create item success'
            ];
        } catch (Exception $exception) {

            DB::rollBack();

            return [
                'status' => false,
                'data' => false,
                'code' => 400,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function update($request, $id)
    {

        DB::beginTransaction();
        try {

            switch ($request['function_id']['id']) {
                case config('contants.functions.import_transfer'):
                    $this->updateOrderTransfer($request, $id);
                    break;
                default:
                    $this->updateOrder($request, $id);
                    break;
            }

            DB::commit();
            return [
                'status' => true,
                'code' => 200,
                'data' => true,
                'message' => 'Update success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();

            return [
                'status' => false,
                'data' => false,
                'code' => 400,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function updateOrder($request, $id)
    {
        $orderItems = $request->get('items') ?? null;

        if (empty($orderItems)) {
            throw new Exception('Danh sách sản phẩm rỗng', 404);
        }

        $order = $this->order->find($id);

        if ($order) {
            $dateNew = Carbon::parse($request->get('date'))->isoFormat('YYMM');
            $dateOld = Carbon::parse($order->date)->isoFormat('YYMM');

            if ($dateOld != $dateNew) {
                $request->merge([
                    'code' => Order::generateCode(
                        $request['function_id']['id'],
                        $request['date'],
                        $request['function_id']['code']
                    ),
                    'date' => $request['date']
                ]);
            }

            $request->merge([
                'function_id' => $request['function_id']['id'],
                'order_status_id' => isset($request['order_status_id']) ? $request['order_status_id'] : 1,
                'created_by' => $request['employee_id'],
            ]);

            $order->update($request->all());

            foreach ($orderItems as $dataOrderItem) {
                $orderItem = $this->orderItem->updateOrCreate(
                    [
                        'id' => $dataOrderItem['order_item_id']
                    ],
                    [
                        'order_id' => $order->id,
                        'warehouse_id' => $request['internal_org_id'],
                        'good_id' => $dataOrderItem['good_id']['id'],
                        'quantity' => $dataOrderItem['quantity'],
                        'updated_by' => Auth::user()->id,
                        'consultant_id' => $request['employee_id']
                    ]
                );

                if ($order->order_status_id == 2) {
                    $balance = $this->getBalance(
                        $orderItem->warehouse_id,
                        $orderItem->good_id,
                        Good::class
                    );
                    if ($balance) {
                        $this->updateDailyBalance($balance, $orderItem, 'import');
                    } else {
                        $this->dailyProductBalance->create([
                            'product_status_id' => 1,
                            'organization_id' => $request['internal_org_id'],
                            'productable_id' => $dataOrderItem['good_id']['id'],
                            'productable_type' => Good::class,
                            'opening_quantity' => $dataOrderItem['quantity'],
                            'date' => Carbon::now()
                        ]);
                    }
                }
            }

            if (isset($request['delete_ids']) && !empty($request['delete_ids'])) {
                $this->orderItem->whereIn('id', $request['delete_ids'])->delete();
            }
        } else {
            throw new Exception('Không tìm thấy phiếu này', 404);
        }
    }

    public function updateOrderTransfer($request, $id)
    {
        $order = $this->order->find($id);
        if ($order) {
            // $order->update(['order_status_id', config('contants.order_status.completed_transfer')]);
            $orderTransfer = $this->order->with(['orderItems'])->firstWhere('reference_id', $id);
            if ($orderTransfer) {
                $code = Order::generateCode(
                    $request['function_id']['id'],
                    $request['date'],
                    $request['function_id']['code']
                );

                $request->merge([
                    'code' => $code,
                    'date' => $request['date'],
                    'function_id' => $request['function_id']['id'],
                    'order_status_id' => isset($request['order_status_id']) ? $request['order_status_id'] : 1,
                    'created_by' => $request['employee_id'],
                ]);

                $orderTransfer->update($request->all());

                foreach ($orderTransfer->orderItems as $dataOrderItem) {
                    $dataOrderItem->update([
                        'warehouse_id' => $request['internal_org_id'],
                        'updated_by' => Auth::user()->id,
                        'consultant_id' => $request['employee_id']
                    ]);

                    if ($order->order_status_id == 2) {
                        $balance = $this->getBalance(
                            $dataOrderItem->warehouse_id,
                            $dataOrderItem->good_id,
                            Good::class
                        );
                        if ($balance) {
                            $this->updateDailyBalance($balance, $dataOrderItem, 'import');
                        } else {

                            $this->dailyProductBalance->create([
                                'product_status_id' => 1,
                                'organization_id' => $request['internal_org_id'],
                                'productable_id' => $dataOrderItem->good_id,
                                'productable_type' => Good::class,
                                'opening_quantity' => $dataOrderItem['quantity'],
                                'date' => Carbon::now()
                            ]);
                        }
                    }
                }
            } else {
                throw new Exception('Không tìm thấy phiếu nhập chuyển', 404);
            }
        } else {
            throw new Exception('Không tìm thấy phiếu này', 404);
        }
    }

    public function getBalance($organizationId, $productId, $productType)
    {
        $balance = $this->dailyProductBalance->where([
            ['organization_id', $organizationId],
            ['productable_id', $productId],
            ['productable_type', $productType]
        ])->select('id', 'opening_quantity')->first();

        return $balance;
    }

    public function updateDailyBalance($balance, $orderItem, $type)
    {
        switch ($type) {
            case 'import':

                $balance->update([
                    'opening_quantity' => $balance->opening_quantity + $orderItem->quantity
                ]);

                break;
            case 'export':

                if ($balance->opening_quantity > 0 && $balance->opening_quantity >= $orderItem->quantity) {
                    $balance->update([
                        'opening_quantity' => $balance->opening_quantity - $orderItem->quantity
                    ]);
                } else {
                    throw new Exception('Phụ tùng trong kho không đủ số lượng. Vui lòng kiểm tra lại!');
                }

                break;
        }
    }

    public function removeItems($request)
    {
        $rules = [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|min:1',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return [
                'code' => 400,
                'status' => false,
                'data' => $validator->errors(),
                'message' => 'Validation errors'
            ];
        }

        DB::beginTransaction();
        try {
            $orderIds = $request->get('ids');
            $orders = $this->order->with(['orderItems'])->whereIn('id', $orderIds)->get();
            foreach ($orders as $item) {
                $this->orderItem->where('order_id', $item->id)->delete();
                $item->delete();
            }
            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'Delete items success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return [
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage(),
                'data' => false
            ];
        }
    }

    public function getOrderRefundById($id)
    {

        $referenceIds = $this->orderItem->where('order_id', $id)->groupby('reference_id')->pluck('reference_id')->toArray();
        $orderReference = $this->orderItem->whereIn('id', $referenceIds)->groupby('order_id')->pluck('order_id')->toArray();

        $orderRefund = $this->order->with([
            'employee' => function ($q) {
                $q->select([
                    'id',
                    'name',
                ]);
            },
            'party' => function ($q) {
                $q->select([
                    'id',
                    'code',
                    'name'
                ]);
            },
            'orderStatus' => function ($q) {
                $q->select([
                    'id',
                    'name'
                ]);
            },
            'orderItems' => function ($q) {
                $q->select([
                    'id',
                    'order_id',
                    'warehouse_id',
                    'good_id',
                    'quantity',
                    'party_id',
                    'reference_id'
                ]);
            },
            'orderItems.internalOrg' => function ($q) {
                $q->select([
                    'id',
                    'name',
                ]);
            },
            'orderItems.good' => function ($q) {
                $q->select([
                    'id',
                    'unit_of_measure_id',
                    'name',
                    'code'
                ]);
            },
            'orderItems.good.unitOfMeasure' => function ($q) {
                $q->select([
                    'id',
                    'name'
                ]);
            },
        ])->where('id', $id)->select([
            'id',
            'function_id',
            'order_status_id',
            'party_id',
            'reference_id',
            'date',
            'code',
            'comment',
            'created_by',
        ])->first()->append(['warehouse']);

        $saleReceipt = $this->order->with([
            'orderItems' => function ($q) {
                $q->select([
                    'id',
                    'order_id',
                    'warehouse_id',
                    'good_id',
                    'quantity',
                    'party_id',
                    'price'
                ]);
            },
            'orderItems.good' => function ($q) {
                $q->select([
                    'id',
                    'unit_of_measure_id',
                    'name',
                    'code'
                ]);
            },
            'orderItems.good.unitOfMeasure'
        ])->whereIn('id', $orderReference)->select([
            'id',
            'function_id',
            'order_status_id',
            'party_id',
            'reference_id',
            'date',
            'code',
            'comment',
            'created_by',
        ])->get();

        return [
            'orderRefund' => $orderRefund,
            'orderSaleReceipt' => $saleReceipt
        ];
    }

    public function updateOrderRefund($request, $id)
    {
        DB::beginTransaction();
        try {
            $order_sale_id = '';
            $order = $this->order->with('orderItems')->find($id);
            foreach ($order->orderItems as $item) {
                $itemReference = $this->orderItem->find($item->reference_id);
                if ($itemReference) {
                    $order_sale_id = $itemReference->order_id;
                    $remainQuantity = $itemReference->quantity - $item->quantity;
                    if ($remainQuantity < 0) {
                        throw new Exception('Số lượng hàng trả vượt quá số lượng hàng của phiếu bán', 400);
                    } else {
                        $itemReference->update([
                            'quantity' => $remainQuantity
                        ]);
                        $this->importWarehouse($itemReference->warehouse_id, $item);
                    }
                }
            }

            $order->update([
                'order_status_id' => config('contants.order_status.confirm_sale_receipt')
            ]);
            if ($order_sale_id) {
                $this->orderOrderStatus->create([
                    'order_id' => $order_sale_id,
                    'order_status_id' => config('contants.order_status.refund_sale_receipt'),
                    'date' => Carbon::now(),
                ]);
            }

            // $this->order->where('id', $id)->update([
            //     'order_status_id' => config('contants.order_status.confirm_sale_receipt')
            // ]);

            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'update order success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return [
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage(),
                'data' => false
            ];
        }
    }

    public function importWarehouse($warehouse_id, $itemImport)
    {
        $productBalance = $this->dailyProductBalance
            ->where('organization_id', $warehouse_id)
            ->where('productable_id', $itemImport['good_id'])
            ->first();

        $quantity = $productBalance->opening_quantity + $itemImport['quantity'];
        $productBalance->update(['opening_quantity' => $quantity]);
    }

    public function getOrderImportById($id)
    {
        return $this->order->with([
            'function',
            'employee',
            'orderItems.good',
            'orderStatus',
            'orderReference.employee',
            'orderReference.orderItems.internalOrg',
        ])->findOrFail($id);
    }
}
