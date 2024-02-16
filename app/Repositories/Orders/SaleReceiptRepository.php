<?php

namespace App\Repositories\Orders;

use App\Jobs\SendMailRequest;
use App\Models\DailyProductBalance;
use App\Models\Functions;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderOrderStatus;
use App\Models\PaymentItem;
use App\Repositories\BaseRepository;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SaleReceiptRepository extends BaseRepository
{
    protected $order;
    protected $orderItem;
    protected $function;
    protected $orderOrderStatus;
    protected $dailyProductBalance;
    protected $notification;
    protected $paymentItem;

    public function __construct(
        Order $order,
        OrderItem $orderItem,
        DailyProductBalance $dailyProductBalance,
        Functions $function,
        OrderOrderStatus $orderOrderStatus,
        Notification $notification,
        PaymentItem $paymentItem
    ) {
        $this->order = $order;
        $this->orderItem = $orderItem;
        $this->function = $function;
        $this->dailyProductBalance = $dailyProductBalance;
        $this->orderOrderStatus = $orderOrderStatus;
        $this->notification = $notification;
        $this->paymentItem = $paymentItem;
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
        $filterWarehouse = $request->filter_warehouse;

        // status for tab
        $pending = 'pending';
        $payment = 'payment';
        $pendingExportWarehouse = 'pendingExportWarehouse';
        $exportWarehouse = 'exportWarehouse';

        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $queryPermission = $this->applyPermission('created_by', '');

        $query = $queryPermission->with([
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
            'orderOrderStatuses' => function ($q) {
                $q->select(['order_id', 'order_status_id']);
            },
        ])->where('function_id', config('contants.functions.sale_receipt'));

        if ($user->hasRole('accountant')) {
            $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
        }

        $paymentStatusIds = [
            config('contants.order_status.created_sale_receipt'),
            config('contants.order_status.confirm_sale_receipt'),
            config('contants.order_status.paying_sale_receipt')
        ];
        $pendingExportWarehouseStatusIds = array_merge(
            [config('contants.order_status.success_sale_receipt')],
            $paymentStatusIds
        );

        switch ($statusTab) {
            case $pending:
                $query = $query->where('order_status_id', config('contants.order_status.pending_sale_receipt'));
                break;
            case $payment:
                $query = $query->whereIn('order_status_id', $paymentStatusIds);
                break;
            case $pendingExportWarehouse:
                $query = $query->whereIn('order_status_id', $pendingExportWarehouseStatusIds);
                break;
            case $exportWarehouse:
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
        if (!empty($filterCode)) {
            $query = $query->where(function ($queryCode) use ($filterCode) {
                $queryCode->whereRelation('party', 'name', 'LIKE', '%'.$filterCode.'%')
                    ->orWhereRelation('party', 'code', 'LIKE', '%'.$filterCode.'%')
                    ->orWhere('code', 'LIKE', '%'.$filterCode.'%');
            });
        }

        // filter by code
        if (!empty($statusTab)) {
            switch ($statusTab) {
                case $pending:
                    $query = $query->where('order_status_id', config('contants.order_status.pending_sale_receipt'));
                    break;
                case $payment:
                    $query = $query->whereIn('order_status_id', $paymentStatusIds);
                    break;
                case $pendingExportWarehouse:
                    $query = $query->whereIn('order_status_id', $pendingExportWarehouseStatusIds);
                    break;
                case $exportWarehouse:
                    $query = $query->where('order_status_id', config('contants.order_status.exported'));
                    break;
            }
        }

        // filter by warehouse
        if (!empty($filterWarehouse) && $filterWarehouse !== 'all') {
            $query = $query->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                return $queryOrderItem->where('warehouse_id', $filterWarehouse);
            });
        }

        if ($rowsPerPage) {
            $pagination = $query->orderBy('orders.id', 'DESC')
                ->paginate($rowsPerPage);

            $pagination->getCollection()->each(function ($order) {
                $order->append(['total_price', 'status_order_after_export']);
            });

            return $pagination;
        }
        return $query->orderBy('orders.id', 'DESC')->get()->append(['total_price', 'status_order_after_export']);
    }

    public function getQuantityForStatusTab($request)
    {
        $user = Auth::user();
        $paymentStatusIds = [
            config('contants.order_status.created_sale_receipt'),
            config('contants.order_status.confirm_sale_receipt'),
            config('contants.order_status.paying_sale_receipt')
        ];
        $pendingExportWarehouseStatusIds = array_merge(
            [config('contants.order_status.success_sale_receipt')],
            $paymentStatusIds
        );

        $filterCode = $request->filter_code;
        $filterWarehouse = $request->filter_warehouse;
        $filterStartDate = $request->filter_start_date;
        $filterEndDate = $request->filter_end_date;
        // if ($user->hasRole('accountant')) {
        //     $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
        // }
        $all = $this->order->where('function_id', config('contants.functions.sale_receipt'))
            ->when(($request->filled('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($filterStartDate, $filterEndDate) {
                    return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                }
            )
            ->when($request->filled('filter_code'), function ($query) use ($filterCode) {
                return $query->whereRelation('party', 'name', 'LIKE', '%'.$filterCode.'%')
                    ->orWhere('code', 'LIKE', '%'.$filterCode.'%');
            })
            ->when(
                $request->filled('filter_warehouse') && $filterWarehouse !== 'all',
                function ($query) use ($filterWarehouse) {
                    return $query->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                        return $queryOrderItem->where('warehouse_id', $filterWarehouse);
                    });
                }
            )
            ->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('created_by', $user->id);
                }
            )
            ->count();

        $pending = $this->order->where('function_id', config('contants.functions.sale_receipt'))
            ->where('order_status_id', config('contants.order_status.pending_sale_receipt'))
            ->when(($request->filled('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($filterStartDate, $filterEndDate) {
                    return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                }
            )
            ->when($request->filled('filter_code'), function ($query) use ($filterCode) {
                return $query->whereRelation('party', 'name', 'LIKE', '%'.$filterCode.'%')
                    ->orWhere('code', 'LIKE', '%'.$filterCode.'%')
                    ->where('order_status_id', config('contants.order_status.pending_sale_receipt'));
            })
            ->when(
                $request->filled('filter_warehouse') && $filterWarehouse !== 'all',
                function ($query) use ($filterWarehouse) {
                    return $query->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                        return $queryOrderItem->where('warehouse_id', $filterWarehouse);
                    });
                }
            )->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('created_by', $user->id);
                }
            )
            ->count();

        $payment = $this->order->where('function_id', config('contants.functions.sale_receipt'))
            ->whereIn('order_status_id', $paymentStatusIds)
            ->when(($request->filled('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($filterStartDate, $filterEndDate) {
                    return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                }
            )
            ->when($request->filled('filter_code'), function ($query) use ($filterCode, $paymentStatusIds) {
                return $query->whereRelation('party', 'name', 'LIKE', '%'.$filterCode.'%')
                    ->orWhere('code', 'LIKE', '%'.$filterCode.'%')
                    ->whereIn('order_status_id', $paymentStatusIds);
            })
            ->when(
                $request->filled('filter_warehouse') && $filterWarehouse !== 'all',
                function ($query) use ($filterWarehouse) {
                    return $query->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                        return $queryOrderItem->where('warehouse_id', $filterWarehouse);
                    });
                }
            )->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('created_by', $user->id);
                }
            )
            ->count();

        $pendingExportWarehouse = $this->order->where('function_id', config('contants.functions.sale_receipt'))
            ->whereIn('order_status_id', $pendingExportWarehouseStatusIds)
            ->when(($request->filled('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($filterStartDate, $filterEndDate) {
                    return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                }
            )
            ->when(
                $request->filled('filter_code'),
                function ($query) use ($filterCode, $pendingExportWarehouseStatusIds) {
                    return $query->whereRelation('party', 'name', 'LIKE', '%'.$filterCode.'%')
                        ->orWhere('code', 'LIKE', '%'.$filterCode.'%')
                        ->whereIn('order_status_id', $pendingExportWarehouseStatusIds);
                }
            )
            ->when(
                $request->filled('filter_warehouse') && $filterWarehouse !== 'all',
                function ($query) use ($filterWarehouse) {
                    return $query->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                        return $queryOrderItem->where('warehouse_id', $filterWarehouse);
                    });
                }
            )->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('created_by', $user->id);
                }
            )
            ->count();

        $exportWarehouse = $this->order->where('function_id', config('contants.functions.sale_receipt'))
            ->where('order_status_id', config('contants.order_status.exported'))
            ->when(($request->filled('filter_start_date')) && $request->filled('filter_end_date'),
                function ($query) use ($filterStartDate, $filterEndDate) {
                    return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                }
            )
            ->when($request->filled('filter_code'), function ($query) use ($filterCode) {
                return $query->whereRelation('party', 'name', 'LIKE', '%'.$filterCode.'%')
                    ->orWhere('code', 'LIKE', '%'.$filterCode.'%')
                    ->where('order_status_id', config('contants.order_status.exported'));
            })
            ->when(
                $request->filled('filter_warehouse') && $filterWarehouse !== 'all',
                function ($query) use ($filterWarehouse) {
                    return $query->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                        return $queryOrderItem->where('warehouse_id', $filterWarehouse);
                    });
                }
            )->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('created_by', $user->id);
                }
            )
            ->count();

        return [
            'all' => $all,
            'pending' => $pending,
            'payment' => $payment,
            'pending_export_warehouse' => $pendingExportWarehouse,
            'export_warehouse' => $exportWarehouse
        ];
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->get('order_items') ?? null;
            $href = $request->get('href') ?? null;

            if (empty($orderItems)) {
                throw new Exception('Chi tiết đơn hàng rỗng', 404);
            }

            // Get functions
            $function = $this->function->where('id', config('contants.functions.sale_receipt'))->first();

            $order = $this->order->create([
                'function_id' => $function->id,
                'order_status_id' => $request->status_id,
                'date' => $request->date,
                'code' => Order::generateCode($function->id, $request->date, $function->code),
                'created_by' => $request->employee_id,
                'comment' => $request->comment,
                'date_debt' => $request->date_debt,
                'party_id' => $request->party_id,
                'vat_rate' => empty($request->vat_rate) ? 0 : $request->vat_rate,
                'order_sample_id' => $request->order_sample_id,
            ]);

            foreach ($orderItems as $item) {

                $this->orderItem->create([
                    'order_id' => $order->id,
                    'warehouse_id' => $request->warehouse_id,
                    'good_id' => $item['good_id'],
                    'price' => $item['price'],
                    'percent_discount' => $item['discount'],
                    'discount' => $item['price_after_discount'],
                    'comment' => $request->comment,
                    'party_id' => $request->party_id,
                    'quantity' => $item['quantity'],
                    'vat_rate' => empty($request->vat_rate) ? 0 : $request->vat_rate,
                    'consultant_id' => $request->employee_id,
                    'created_by' => Auth::user()->id
                ]);
            }

            $this->orderOrderStatus->create([
                'order_id' => $order->id,
                'order_status_id' => $request->status_id,
                'date' => Carbon::now(),
            ]);

            // send mail when order with status pending
            if ($request->status_id === config('contants.order_status.pending_sale_receipt')) {
                $config = DB::table('configs')->where('key', 'email')->first();
                if ($config) {
                    $subject = '[Rượu Ngon] Yêu cầu xét duyệt đơn hàng - số chứng từ '.$order->code;
                    $dataSend = array(
                        'code' => $order->code,
                        'date' => $order->date,
                        'party' => $order->party()->first()->name,
                        'url' => str_replace("/create", "/{$order->id}/confirm", $href),
                        'to' => [
                            'address' => $config->value,
                            'name' => 'Admin',
                        ],
                        'subject' => $subject
                    );
                    SendMailRequest::dispatch($dataSend)->delay(now()->addMinutes(0.5));
                }
            }

            // create notification of order
            $this->notification->createNotiWhenAddNew([
                'feature_id' => $order->id,
                'function_id' => config('contants.functions.sale_receipt')
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

    public function update($request, $id)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->get('order_items') ?? null;
            $warehouseId = $request->get('warehouse_id') ?? null;
            $notEnoughGoods = false;

            if (empty($orderItems)) {
                throw new Exception('Chi tiết đơn hàng rỗng', 404);
            }

            // Update quantity of product when confirm export warehouse
            if ($request->status_id === config('contants.order_status.exported')) {
                $notEnoughGoods = $this->dailyProductBalance->updateQuantityWhenExport($orderItems, $warehouseId);
            }

            $order = $this->order->findOrFail($id);

            $isPaymentSuccess = $this->orderOrderStatus
                ->where('order_id', $id)
                ->where('order_status_id', config('contants.order_status.success_payment'))
                ->exists();

            $statusId = $request->status_id;

            if ($isPaymentSuccess && $statusId === config('contants.order_status.exported')) {
                $statusId = config('contants.order_status.success_sale_receipt');
            }

            $code = $order->code;

            $dateNew = Carbon::parse($request->get('date'))->isoFormat('YYMM');
            $dateOld = Carbon::parse($order->date)->isoFormat('YYMM');
            if ($dateOld != $dateNew) {
                $function = $this->function->where('id', config('contants.functions.sale_receipt'))->first();
                $code = Order::generateCode($function->id, $request->date, $function->code);
            }

            $order->update([
                'code' => $code,
                'order_status_id' => $statusId,
                'date' => $request->date,
                'updated_by' => $request->employee_id,
                'comment' => $request->comment,
                'date_debt' => $request->date_debt,
                'party_id' => $request->party_id,
                'vat_rate' => empty($request->vat_rate) ? 0 : $request->vat_rate,
                'order_sample_id' => $request->order_sample_id,
            ]);

            if ($request->status_id === config('contants.order_status.created_sale_receipt') || $request->status_id === config('contants.order_status.pending_sale_receipt')) {
                $this->orderItem->where('order_id', $order->id)->forceDelete();

                foreach ($orderItems as $dataItem) {

                    $this->orderItem->create([
                        'order_id' => $order->id,
                        'warehouse_id' => $request->warehouse_id,
                        'good_id' => $dataItem['good_id'],
                        'price' => $dataItem['price'],
                        'percent_discount' => $dataItem['discount'],
                        'discount' => $dataItem['price_after_discount'],
                        'comment' => $request->comment,
                        'party_id' => $request->party_id,
                        'quantity' => $dataItem['quantity'],
                        'vat_rate' => empty($request->vat_rate) ? 0 : $request->vat_rate,
                        'consultant_id' => $request->employee_id,
                        'created_by' => Auth::user()->id
                    ]);
                }
            }

            // Insert history status for order
            $queryHistoryStatusOrder = $this->orderOrderStatus
                ->where('order_id', $order->id)
                ->where('order_status_id', $request->status_id);

            if ($queryHistoryStatusOrder->exists()) {
                $queryHistoryStatusOrder->update(['date' => Carbon::now()]);
            } else {
                $this->orderOrderStatus->create([
                    'order_id' => $order->id,
                    'order_status_id' => $request->status_id,
                    'date' => Carbon::now(),
                ]);
            }

            if ($isPaymentSuccess && $request->status_id === config('contants.order_status.exported')) {
                $this->orderOrderStatus->create([
                    'order_id' => $order->id,
                    'order_status_id' => config('contants.order_status.success_sale_receipt'),
                    'date' => Carbon::now(),
                ]);
            }

            DB::commit();

            return [
                'status' => true,
                'code' => 200,
                'message' => 'Update success',
                'notEnoughGoods' => $notEnoughGoods
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
                config('contants.order_status.confirm_sale_receipt')
            )->exists();

            $payment = $this->paymentItem->whereIn('order_id', $orderIds)->exists();
            if ($payment) {
                throw new Exception('Có đơn hàng đã phát sinh thanh toán không thể xóa!', 400);
            }

            if ($cantDelete) {
                throw new Exception('Chỉ được xóa đơn hàng ở trạng thái đã lập phiếu hoặc chờ duyệt!', 400);
            }

            $orderQuery->delete();

            $this->orderItem->whereIn('order_id', $orderIds)->delete();

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

    public function getSaleReceiptById($request)
    {
        $saleReceipt = $this->order->with([
            'employee',
            'party' => function ($q) {
                $q->with(['province', 'district', 'ward']);
            },
            'party.orderSample',
            'orderStatus',
            'orderItems',
            'orderItems.internalOrg',
            'orderItems.good',
            'orderItems.good.unitOfMeasure',
            'orderOrderStatuses',
            'paymentItems.payment.user',
        ])->where('id', $request->id)->first()->append(['warehouse']);

        return $saleReceipt;
    }

    public function createOrderRefund($request)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->order_items ?? null;
            $warehouseId = $request->warehouse ?? null;
            $partyId = $request->party_id ?? null;
            $date = $request->date ?? null;
            $employee = $request->employee ?? null;
            $orderId = $request->order_id ?? null;
            $comment = $request->comment ?? null;
            $dateDebt = $request->date_debt ?? null;
            $vatRate = $request->vat_rate ?? null;


            if (empty($orderItems)) {
                throw new Exception('Chi tiết đơn hàng rỗng', 404);
            }

            $order = $this->order->create([
                'function_id' => config('contants.functions.refund'),
                'order_status_id' => config('contants.order_status.pending_sale_receipt'),
                'date' => $date,
                'code' => Order::generateCode(
                    config('contants.functions.refund'),
                    $date,
                    config('contants.function_code.refund')
                ),
                'created_by' => $employee,
                'comment' => $comment,
                'date_debt' => $dateDebt,
                'party_id' => $partyId,
                'reference_id' => $orderId,
                'vat_rate' => $vatRate
            ]);

            foreach ($orderItems as $item) {

                $this->orderItem->create([
                    'order_id' => $order->id,
                    'warehouse_id' => $warehouseId,
                    'good_id' => $item['good_id'],
                    'price' => $item['price'],
                    'discount' => $item['discount'],
                    'comment' => $comment,
                    'party_id' => $partyId,
                    'quantity' => $item['quantityRefund'],
                    'vat_rate' => $vatRate,
                    'consultant_id' => $employee,
                    'created_by' => Auth::user()->id
                ]);
            }

            // Insert history status for order
            $queryHistoryStatusOrder = $this->orderOrderStatus
                ->where('order_id', $orderId)
                ->where('order_status_id', config('contants.order_status.refund_sale_receipt'));

            if ($queryHistoryStatusOrder->exists()) {
                $queryHistoryStatusOrder->update(['date' => Carbon::now()]);
            } else {
                $this->orderOrderStatus->create([
                    'order_id' => $orderId,
                    'order_status_id' => config('contants.order_status.refund_sale_receipt'),
                    'date' => Carbon::now(),
                ]);
            }

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

    public function getOrders($request = null)
    {
        $query = $this->order->with([
            'orderItems.good.unitOfMeasure'
        ])
            ->when($request->filled('party_id'), function ($query) use ($request) {
                return $query->where('party_id', '=', $request->get('party_id'));
            })->whereIn(
                'order_status_id',
                [
                    config('contants.order_status.success_sale_receipt'),
                    config('contants.order_status.exported'),
                ]
            )->whereBetween('date', [$request['from_date'], $request['to_date']]);
        $dataQuery = $query->orderby('id', 'desc')->get()->append(['total_price']);

        $orders = [];

        // Get order is paying
        foreach ($dataQuery as $item) {
            $isSuccessPayment = $this->orderOrderStatus
                ->where('order_id', $item->id)
                ->where('order_status_id', '!=', config('contants.order_status.success_payment'))
                ->exists();

            $quantity = $item->orderItems->sum('quantity');

            if ($isSuccessPayment && $quantity > 0) {
                $orders[] = $item;
            }
        }

        return $orders;
    }

    public function createOrderRefundV2($request)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->order_items ?? null;
            $partyId = $request->party_id ?? null;
            $date = $request->date ?? null;
            $employee = $request->receiver ?? null;
            $comment = $request->comment ?? null;

            if (empty($orderItems)) {
                throw new Exception('Chi tiết sản phẩm rỗng', 400);
            }

            $order = $this->order->create([
                'function_id' => config('contants.functions.refund'),
                'order_status_id' => config('contants.order_status.pending_sale_receipt'),
                'date' => $date,
                'code' => Order::generateCode(
                    config('contants.functions.refund'),
                    $date,
                    config('contants.function_code.refund')
                ),
                'created_by' => $employee,
                'comment' => $comment,
                'party_id' => $partyId
            ]);

            foreach ($orderItems as $item) {
                $orderItemOld = $this->orderItem::find($item['order_item_id']);
                if ($orderItemOld) {
                    $newOrderItem = $orderItemOld->replicate();

                    $newOrderItem->order_id = $order->id;
                    $newOrderItem->quantity = $item['quantity'];
                    $newOrderItem->created_by = Auth::user()->id;
                    $newOrderItem->reference_id = $item['order_item_id'];
                    $newOrderItem->save();
                }
            }

            // create notification of order
            $this->notification->createNotiWhenAddNew([
                'feature_id' => $order->id,
                'function_id' => config('contants.functions.refund')
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

    public function getGoodInventory($warehouse_id)
    {
        return $this->dailyProductBalance->with([
            'good',
        ])->when($warehouse_id, function ($query) use ($warehouse_id) {
            return $query->where('organization_id', $warehouse_id);
        })->orderby('id', 'desc')->get();
    }
}
