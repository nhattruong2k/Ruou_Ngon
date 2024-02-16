<?php

namespace App\Repositories;

use App\Models\Parties;
use App\Models\User;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\Auth;

class ReportRepository extends BaseRepository
{
    protected $parties;
    protected $employee;

    public function __construct(Parties $parties, User $employee)
    {
        $this->parties = $parties;
        $this->employee = $employee;
        parent::__construct($parties);
    }

    public function getAllPartieReports($request = null)
    {
        $rowsPerPage = 0;
        $user = Auth::user();

        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $query = $this->parties->select('id', 'code', 'name')
            ->with([
                'orders' => function ($queryOrder) use ($request) {
                    $queryOrder->select('id', 'function_id', 'party_id', 'reference_id', 'date', 'code', 'vat_rate', 'order_status_id')
                        ->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']])
                        ->where('function_id', config('contants.functions.sale_receipt'))
                        ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')]);
                },
                'orders.orderItems' => function ($queryOrder) {
                    $queryOrder->select('id', 'order_id', 'warehouse_id', 'price', 'quantity', 'vat_rate', 'discount', 'party_id');
                },
                'orders.paymentItems' => function ($queryOrder) use ($request) {
                    $queryOrder->select('id', 'payment_id', 'order_id', 'amount')
                        ->whereHas('payment', function ($queryPayment) use ($request) {
                            $queryPayment
                                ->where('payment_status_id', config('contants.payment_status.approved'))
                                ->whereBetween('date', [$request['filter_start_date'] . ' 00:00:00', $request['filter_end_date'] . ' 23:59:59']);
                        });
                },
                'orders.paymentItems.payment' => function ($queryOrder) {
                    $queryOrder->select('id', 'function_id', 'order_id', 'party_id', 'date', 'total_amount', 'payment_status_id');
                },
            ])
            ->withCount(['orders' => function ($queryOrder) use ($request) {
                $queryOrder
                    ->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']])
                    ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')]);
            }])
            ->when(($request->filled('name')), function ($query) use ($request) {

                return $query->where('name', 'LIKE', '%' . $request->get('name') . '%');
            })
            ->when(($request->filled('party')), function ($query) use ($request) {

                return $query->whereIn('id', $request->get('party'));
            })
            ->when(
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
            )
            ->orderBy('orders_count', 'desc');

        if ($rowsPerPage) {
            $pagination = $query->paginate($rowsPerPage);

            $pagination->getCollection()->each(function ($order) {
                $order->append(['total_order_by_party', 'total_payment_by_party']);
            });

            return $pagination;
        }

        return $query->get()->append(['total_order_by_party', 'total_payment_by_party']);
    }

    public function getAllEmployeeReports($request = null)
    {
        $rowsPerPage = 0;
        $user = Auth::user();

        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $query = $this->employee->select('id', 'code', 'name')
            ->with([
                'tagertUsers' => function ($queryOrder) use ($request) {
                    $queryOrder->select('id', 'tagert_id', 'user_id', 'tagerts')
                        ->whereRelation('tagert', function ($queryTagert) use ($request) {
                            $queryTagert->whereBetween('month', [$request['filter_start_date'], $request['filter_end_date']]);;
                        });
                },
                'parties' => function ($queryOrder) {
                    $queryOrder->select('id', 'consultant_id');
                },
                'parties.orders' => function ($queryOrder) use ($request) {
                    $queryOrder->select('id', 'function_id', 'party_id', 'reference_id', 'date', 'code', 'vat_rate', 'order_status_id')
                        ->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']])
                        ->whereIn('function_id', [config('contants.functions.sale_receipt'), config('contants.functions.gift')])
                        ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')]);
                },
                'parties.orders.orderItems' => function ($queryOrder) {
                    $queryOrder->select('id', 'order_id', 'warehouse_id', 'price', 'quantity', 'vat_rate', 'discount', 'party_id');
                },
                'parties.orders.paymentItems' => function ($queryOrder) use ($request) {
                    $queryOrder->select('id', 'payment_id', 'order_id', 'amount')
                        ->whereHas('payment', function ($queryPayment) use ($request) {
                            $queryPayment->whereBetween('date', [$request['filter_start_date'] . ' 00:00:00', $request['filter_end_date'] . ' 23:59:59']);
                        });
                },
                'parties.orders.paymentItems.payment' => function ($queryOrder) {
                    $queryOrder->select('id', 'function_id', 'order_id', 'party_id', 'date', 'total_amount', 'payment_status_id');
                },
                'parties.orders.giftItems' => function ($queryOrder) {
                    $queryOrder->select('id', 'order_id', 'price', 'quantity');
                },
            ])
            // ->withCount(['orders' => function ($queryOrder) use ($request) {
            //     $queryOrder
            //         ->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']])
            //         ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')]);
            // }])
            ->when(($request->filled('name')), function ($query) use ($request) {

                return $query->where('name', 'LIKE', '%' . $request->get('name') . '%');
            })
            ->when(($request->filled('employees')), function ($query) use ($request) {

                return $query->whereIn('id', $request->get('employees'));
            })->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->where('internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('id', '=', $user->id);
                }
            );
        if ($rowsPerPage) {
            $pagination = $query->orderBy('id', 'desc')->paginate($rowsPerPage);

            $pagination->getCollection()->each(function ($order) {
                $order->append(['total_order_by_employee', 'total_order_gift_by_employee', 'total_payment_by_employee', 'total_tagert']);
            });

            return $pagination;
        }

        return $query->get()->append(['total_order_by_employee', 'total_order_gift_by_employee', 'total_payment_by_employee', 'total_tagert']);
    }
}
