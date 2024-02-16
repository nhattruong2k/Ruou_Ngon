<?php

namespace App\Repositories\Orders;

use App\Models\DailyProductBalance;
use App\Models\Functions;
use App\Models\GiftItem;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\BaseRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderGiftRepository extends BaseRepository
{
    protected $order;
    protected $orderItem;
    protected $function;
    protected $dailyProductBalance;
    protected $giftItem;
    protected $notification;
    protected $user;

    public function __construct(
        Order $order,
        OrderItem $orderItem,
        Functions $function,
        DailyProductBalance $dailyProductBalance,
        GiftItem $giftItem,
        Notification $notification,
    ) {
        $this->order = $order;
        $this->orderItem = $orderItem;
        $this->dailyProductBalance = $dailyProductBalance;
        $this->giftItem = $giftItem;
        $this->function = $function;
        $this->notification = $notification;

        parent::__construct($order);
    }

    public function getAll($request = null)
    {
        $user = Auth::user();

        // Get value from request
        $statusTab = $request->status_tab;
        $filterStartDate = $request->filter_start_date;
        $filterEndDate = $request->filter_end_date;
        $filterCode = $request->filter_code;

        // status for tab
        $created = 'created';
        $exported = 'exported';

        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->order->with([
            'orderItems' => function ($q) {
                $q->select(['id', 'order_id', 'price', 'quantity', 'vat_rate', 'discount']);
            },
            'employee' => function ($q) {
                $q->select(['id', 'name', 'code']);
            },
            'party' => function ($q) {
                $q->select(['id', 'name', 'code', 'party_type_id']);
            },
            'party.partyType',
            'orderStatus' => function ($q) {
                $q->select(['id', 'name']);
            },
        ])->where('function_id', config('contants.functions.gift'))
            ->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('party.employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->whereRelation('party', 'created_by', '=', $user->id);
                }
            );

        // filter tab
        switch ($statusTab) {
            case $created:
                $query = $query->where('order_status_id', config('contants.order_status.created_sale_receipt'));
                break;
            case $exported:
                $query = $query->where('order_status_id', config('contants.order_status.exported'));
                break;
        }

        // filter range date
        if (!empty($filterStartDate) && !empty($filterEndDate)) {
            $query = $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
        }
        if (!empty($filterStartDate) && empty($filterEndDate)) {
            $query = $query->where('date', '>=', $filterStartDate);
        }
        if (empty($filterStartDate) && !empty($filterEndDate)) {
            $query = $query->where('date', '<=', $filterEndDate);
        }

        // filter by code
        if (!empty($filterCode)) {
            $query = $query->where(function ($queryCode) use ($filterCode) {
                $queryCode->whereRelation('party', 'name', 'LIKE', '%'.$filterCode.'%')
                    ->orWhereRelation('party', 'code', 'LIKE', '%'.$filterCode.'%')
                    ->orWhere('code', 'LIKE', '%'.$filterCode.'%');
            });

            // ->where('function_id', config('contants.functions.gift'));
        }

        if ($rowsPerPage) {
            $pagination = $query->orderBy('orders.id', 'DESC')->paginate($rowsPerPage);

            $pagination->getCollection()->each(function ($order) {
                $order->append(['total_price_gift']);
            });

            return $pagination;
        }
        return $query->orderBy('orders.id', 'DESC')->get()->append(['total_price_gift']);
    }

    public function getQuantityForStatusTab($request)
    {
        $all = $this->order->where('function_id', config('contants.functions.gift'))
            ->when(($request->get('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($request) {
                    return $query->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']]);
                }
            )
            ->when($request->get('filter_code'), function ($query) use ($request) {
                return $query->whereRelation('party', 'name', 'LIKE', '%'.$request->get('filter_code').'%')
                    ->orWhere('code', 'LIKE', '%'.$request->get('filter_code').'%')
                    ->where('function_id', config('contants.functions.gift'));
            })
            ->count();

        $created = $this->order->where('function_id', config('contants.functions.gift'))
            ->where('order_status_id', config('contants.order_status.created_sale_receipt'))
            ->when(($request->get('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($request) {
                    return $query->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']]);
                }
            )
            ->when($request->get('filter_code'), function ($query) use ($request) {
                return $query->whereRelation('party', 'name', 'LIKE', '%'.$request->get('filter_code').'%')
                    ->orWhere('code', 'LIKE', '%'.$request->get('filter_code').'%')
                    ->where('function_id', config('contants.functions.gift'));
            })
            ->count();

        $exported = $this->order->where('function_id', config('contants.functions.gift'))
            ->where('order_status_id', config('contants.order_status.exported'))
            ->when(($request->get('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($request) {
                    return $query->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']]);
                }
            )
            ->when($request->get('filter_code'), function ($query) use ($request) {
                return $query->whereRelation('party', 'name', 'LIKE', '%'.$request->get('filter_code').'%')
                    ->orWhere('code', 'LIKE', '%'.$request->get('filter_code').'%')
                    ->where('function_id', config('contants.functions.gift'));
            })
            ->count();

        return [
            'all' => $all,
            'created' => $created,
            'exported' => $exported
        ];
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->order_items ?? null;
            $orderGifts = $request->order_gifts ?? null;

            if (empty($orderItems) && empty($orderGifts)) {
                throw new Exception('Chi tiết đơn hàng rỗng', 404);
            }

            // Get functions
            $function = $this->function->where('id', config('contants.functions.gift'))->first();

            // Create order
            $order = $this->order->create([
                'function_id' => $function->id,
                'order_status_id' => $request->status_id,
                'date' => $request->date,
                'code' => Order::generateCode($function->id, $request->date, $function->code),
                'created_by' => $request->employee_id,
                'comment' => $request->comment,
                'date_debt' => $request->date_debt,
                'party_id' => $request->party_id
            ]);

            // Create order item of order
            if ($orderItems) {
                foreach ($orderItems as $item) {

                    $this->orderItem->create([
                        'order_id' => $order->id,
                        'warehouse_id' => $request->warehouse_id,
                        'good_id' => $item['good_id'],
                        'price' => $item['price'],
                        'percent_discount' => $item['percent_discount'],
                        'discount' => $item['discount'],
                        'comment' => $request->comment,
                        'party_id' => $request->party_id,
                        'quantity' => $item['quantity'],
                        'vat_rate' => 0,
                        'consultant_id' => $request->employee_id,
                        'created_by' => Auth::user()->id
                    ]);
                }
            }

            // Create gift item of order
            if ($orderGifts) {
                foreach ($orderGifts as $item) {

                    $this->giftItem->create([
                        'order_id' => $order->id,
                        'name' => $item['good_name'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                        'created_by' => Auth::user()->id
                    ]);
                }
            }

            // create notification of order
            $this->notification->createNotiWhenAddNew([
                'feature_id' => $order->id,
                'function_id' => config('contants.functions.gift')
            ]);

            DB::commit();

            return [
                'status' => true,
                'code' => 201,
                'message' => 'Create item success'
            ];
        } catch (Exception $exception) {

            DB::rollBack();

            return [
                'status' => false,
                'code' => 400,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function update($request, $orderId)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->order_items ?? null;
            $orderGifts = $request->order_gifts ?? null;
            $notEnoughGoods = false;

            if (empty($orderItems) && empty($orderGifts)) {
                throw new Exception('Chi tiết đơn hàng rỗng', 404);
            }

            // Update quantity of product when confirm export warehouse
            if ($request->status_id === config('contants.order_status.exported')) {
                $notEnoughGoods = $this->dailyProductBalance->updateQuantityWhenExport($orderItems, $request->get('warehouse_id'));
            }

            // Update order
            $order = $this->order->findOrFail($orderId);
            $order->update([
                'order_status_id' => $request->status_id,
                'date' => $request->date,
                'updated_by' => $request->employee_id,
                'comment' => $request->comment,
                'date_debt' => $request->date_debt,
                'party_id' => $request->party_id
            ]);

            // Create or update order item when edit order
            if ($orderItems) {
                foreach ($orderItems as $dataItem) {

                    $item = $this->orderItem->find($dataItem['id']);

                    if ($item) {
                        $item->update([
                            'warehouse_id' => $request->warehouse_id,
                            'good_id' => $dataItem['good_id'],
                            'price' => $dataItem['price'],
                            'discount' => $dataItem['discount'],
                            'comment' => $request->comment,
                            'party_id' => $request->party_id,
                            'quantity' => $dataItem['quantity'],
                            'vat_rate' => 0,
                            'consultant_id' => $request->employee_id,
                            'update_by' => Auth::user()->id
                        ]);
                    } else {
                        $this->orderItem->create([
                            'order_id' => $order->id,
                            'warehouse_id' => $request->warehouse_id,
                            'good_id' => $dataItem['good_id'],
                            'price' => $dataItem['price'],
                            'discount' => $dataItem['discount'],
                            'comment' => $request->comment,
                            'party_id' => $request->party_id,
                            'quantity' => $dataItem['quantity'],
                            'vat_rate' => 0,
                            'consultant_id' => $request->employee_id,
                            'created_by' => Auth::user()->id
                        ]);
                    }
                }
            }

            // Create or update gift item when edit order
            if ($orderGifts) {
                foreach ($orderGifts as $dataItem) {

                    $item = $this->giftItem->find($dataItem['id']);

                    if ($item) {
                        $item->update([
                            'name' => $dataItem['good_name'],
                            'quantity' => $dataItem['quantity'],
                            'price' => $dataItem['price'],
                            'update_by' => Auth::user()->id
                        ]);
                    } else {
                        $this->giftItem->create([
                            'order_id' => $order->id,
                            'name' => $dataItem['good_name'],
                            'quantity' => $dataItem['quantity'],
                            'price' => $dataItem['price'],
                            'created_by' => Auth::user()->id
                        ]);
                    }
                }
            }

            DB::commit();

            return [
                'status' => true,
                'code' => 201,
                'message' => 'Update item success',
                'notEnoughGoods' => $notEnoughGoods
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception'.$exception->getMessage());

            return [
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
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

            $orderQuery = $this->order->whereIn('id', $orderIds);

            // Check can't delete if order isn't created or pending
            $orderQueryClone = clone $orderQuery;
            $cantDelete = $orderQueryClone->where(
                'order_status_id',
                '>=',
                config('contants.order_status.exported')
            )->exists();

            if ($cantDelete) {
                throw new Exception('Không thể xóa đơn hàng đã xuất kho', 404);
            }

            $orderQuery->delete();

            $this->orderItem->whereIn('order_id', $orderIds)->delete();

            $this->giftItem->whereIn('order_id', $orderIds)->delete();

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

    public function removeOrderItems($request)
    {
        DB::beginTransaction();
        try {
            $orderItemId = $request->get('id');

            $query = $this->orderItem->find($orderItemId);

            if ($query) {
                $query->delete();
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

    public function removeGiftItems($request)
    {
        DB::beginTransaction();
        try {
            $giftItemId = $request->get('id');

            $query = $this->giftItem->find($giftItemId);

            if ($query) {
                $query->delete();
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

    public function getOrderGiftById($request)
    {
        return $this->order->with([
            'employee',
            'party' => function ($q) {
                $q->with(['province', 'district', 'ward']);
            },
            'orderStatus',
            'orderItems',
            'orderItems.internalOrg',
            'orderItems.good',
            'orderItems.good.unitOfMeasure',
            'giftItems',
        ])->where('id', $request->id)->first()->append(['warehouse']);
    }
}
