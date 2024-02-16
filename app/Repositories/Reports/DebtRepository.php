<?php

namespace App\Repositories\Reports;

use App\Models\Order;
use App\Models\Parties;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\Auth;

class DebtRepository extends BaseRepository
{
    protected $parties;
    protected $order;

    public function __construct(
        Parties $parties,
        Order $order
    ) {
        $this->parties = $parties;
        $this->order = $order;
        parent::__construct($parties);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $filterWarehouse = $request->get('filter_warehouse');
        $filterName = $request->get('filter_name');
        $filterStartDate = $request->get('filter_start_date');
        $filterEndDate = $request->get('filter_end_date');

        $statusIns = [
            config('contants.order_status.created_sale_receipt'),
            config('contants.order_status.pending_sale_receipt'),
            config('contants.order_status.confirm_sale_receipt'),
            config('contants.order_status.paying_sale_receipt'),
        ];

        $statusNotIns = [
            config('contants.order_status.pending_sale_receipt'),
            config('contants.order_status.reject_sale_receipt'),
            config('contants.order_status.success_sale_receipt'),
        ];

        $user = Auth::user();

        $query = $this->parties->with([
            'orders' => function ($q) use ($filterWarehouse, $filterStartDate, $filterEndDate, $statusNotIns) {
                $orders = $q
                    ->where('function_id', config('contants.functions.sale_receipt'))
                    ->whereNotIn('order_status_id', $statusNotIns);

                // filter range date
                if (!empty($filterStartDate) && !empty($filterEndDate)) {
                    $orders = $orders->whereBetween('date', [$filterStartDate, $filterEndDate]);
                }
                if (!empty($filterStartDate) && empty($filterEndDate)) {
                    $orders = $orders->where('date', '>=', $filterStartDate);
                }
                if (empty($filterStartDate) && !empty($filterEndDate)) {
                    $orders = $orders->where('date', '<=', $filterEndDate);
                }

                // filter by warehouse
                if (!empty($filterWarehouse) && $filterWarehouse !== 'all') {
                    $orders = $orders->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                        return $queryOrderItem->where('warehouse_id', $filterWarehouse);
                    });
                }

                return $orders->select([
                    'id',
                    'function_id',
                    'order_status_id',
                    'party_id',
                    'date',
                    'code',
                    'date_debt'
                ]);
            },
            'orders.orderItems' => function ($q) {
                return $q->select([
                    'id',
                    'order_id',
                    'warehouse_id',
                    'good_id',
                    'price',
                    'quantity',
                    'vat_rate',
                    'discount',
                    'consultant_id',
                    'party_id',
                    'created_by',
                    'update_by',
                ]);
            },
            'orders.payment' => function ($q) {
                return $q->select([
                    'id',
                    'function_id',
                    'order_id',
                    'payment_method_id',
                    'party_id',
                    'receiver',
                    'code',
                    'date',
                    'warehouse_id',
                    'amount',
                    'total_amount',
                    'payment_status_id',
                ]);
            },
            'orders.paymentItems' => function ($q) use ($filterStartDate, $filterEndDate) {
                return $q->whereHas('payment', function ($queryPayment) use ($filterStartDate, $filterEndDate) {
                    return $queryPayment
                        ->where('payment_status_id', config('contants.payment_status.approved'))
                        ->whereDate('date', '<=', $filterEndDate)
                        ->whereDate('date', '>=', $filterStartDate);
                })->select(['id', 'payment_id', 'order_id', 'amount']);
            },
            'employee' => function ($q) {
                return $q->select(['id', 'name']);
            }
        ])
            ->whereHas('orders', function ($q) use ($statusIns, $request) {

                $q->where('function_id', config('contants.functions.sale_receipt'))
                    ->whereIn('order_status_id', $statusIns)
                    ->when(($request->get('filter_start_date')) && $request->filled('filter_end_date'),
                        function ($queryDate) use ($request) {
                            return $queryDate->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']]);
                        });
            })->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('created_by', '=', $user->id);
                }
            );

        // filter by warehouse
        if (!empty($filterWarehouse) && $filterWarehouse !== 'all') {
            $query = $query->whereHas('orders.orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                return $queryOrderItem->where('warehouse_id', $filterWarehouse);
            });
        }

        // filter by code
        if (!empty($filterName)) {
            $query = $query->where(function ($queryCode) use ($filterName) {
                $queryCode->whereRelation('employee', 'name', 'LIKE', '%'.$filterName.'%')
                    ->orWhere('name', 'LIKE', '%'.$filterName.'%');
            });
        }

        if ($rowsPerPage) {
            $pagination = $query->orderBy('id', 'DESC')->select([
                'id',
                'code',
                'name',
                'consultant_id',
                'debt_limit',
                'max_debt_date',
            ])->paginate($rowsPerPage);

            $pagination->getCollection()->each(function ($order) {
                $order->append(['remain_price', 'due_debt']);
            });

            return $pagination;
        }
        return $query->orderBy('id', 'DESC')->get()->append(['remain_price', 'due_debt']);
    }

    public function getById($request)
    {
        $partyId = $request->id;
        $filterStartDate = $request->filter_start_date ?? null;
        $filterEndDate = $request->filter_end_date ?? null;
        $filterWarehouse = $request->filter_warehouse ?? null;

        $statusNotIns = [
            config('contants.order_status.pending_sale_receipt'),
            config('contants.order_status.reject_sale_receipt'),
            config('contants.order_status.success_sale_receipt'),
        ];

        $this->order->filter_end_date = ($filterEndDate);

        $query = $this->order->with([
            'orderItems' => function ($q) {
                return $q->select([
                    'id',
                    'order_id',
                    'warehouse_id',
                    'good_id',
                    'price',
                    'quantity',
                    'vat_rate',
                    'discount',
                    'consultant_id',
                    'party_id',
                    'created_by',
                    'update_by',
                ]);
            },
            'payment' => function ($q) use ($filterStartDate, $filterEndDate) {
                return $q->select([
                    'id',
                    'function_id',
                    'order_id',
                    'payment_method_id',
                    'party_id',
                    'receiver',
                    'code',
                    'date',
                    'warehouse_id',
                    'amount',
                    'total_amount',
                    'payment_status_id',
                ]);
            },
            'paymentItems' => function ($q) use ($filterStartDate, $filterEndDate) {
                return $q->whereHas('payment', function ($queryPayment) use ($filterStartDate, $filterEndDate) {
                    return $queryPayment
                        ->whereDate('date', '<=', $filterEndDate)
                        ->whereDate('date', '>=', $filterStartDate)
                        ->where('payment_status_id', config('contants.payment_status.approved'));
                });
            },
            // 'paymentItems',
            'employee' => function ($q) {
                return $q->select(['id', 'name']);
            },
            'party' => function ($q) {
                return $q->select([
                    'id',
                    'code',
                    'name',
                    'consultant_id',
                    'debt_limit',
                    'max_debt_date'
                ]);
            }
        ])
            ->where('function_id', config('contants.functions.sale_receipt'))
            ->whereNotIn('order_status_id', $statusNotIns)
            ->where('party_id', $partyId);

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

        // filter by warehouse
        if (!empty($filterWarehouse) && $filterWarehouse !== 'all') {
            $query = $query->whereHas('orderItems', function ($queryOrderItem) use ($filterWarehouse) {
                return $queryOrderItem->where('warehouse_id', $filterWarehouse);
            });
        }

        $newQuery = $query->orderBy('id', 'DESC')->get([
            'id',
            'function_id',
            'order_status_id',
            'party_id',
            'date',
            'code',
            'created_by',
            'updated_by',
            'date_debt',
        ]);

        $newQuery = $newQuery->map(function ($item) use ($filterEndDate) {
            $item->filter_end_date = $filterEndDate;

            return $item;
        });

        return $newQuery->append(['info_debt', 'total_price']);
    }
}
