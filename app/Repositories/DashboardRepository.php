<?php

namespace App\Repositories;

use App\Models\Blog;
use App\Models\InternalOrg;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Repositories\BaseRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use stdClass;

class DashboardRepository extends BaseRepository
{
    protected $blogs;
    protected $employee;
    protected $warehouse;
    protected $orderItem;
    protected $order;

    public function __construct(Blog $blogs, User $employee, InternalOrg $warehouse, OrderItem $orderItem, Order $order)
    {
        $this->blogs = $blogs;
        $this->employee = $employee;
        $this->warehouse = $warehouse;
        $this->orderItem = $orderItem;
        $this->order = $order;
        parent::__construct($blogs, $employee, $warehouse);
    }

    public function getAll($pagination = false, $request = null)
    {
        $user = Auth::user();

        $blogs = $this->blogs->with('user', 'user.roles');
        // if ($user) {
        //     foreach ($user->roles as $role) {
        //         $blogs->whereHas('user.roles', function ($query) use ($role) {
        //             $query->where('id', $role->id);
        //         });
        //     }
        // }
        if ($pagination) {
            return $blogs->orderBy('id', 'DESC')->paginate(5);
        }

        return $blogs->orderBy('id', 'DESC')->get();
    }


    public function getAllEmployee($request = null)
    {
        $user = Auth::user();

        $resultSales = $this->order
            ->selectRaw('MONTH(date) as month, SUM(order_items.discount * order_items.quantity) as total')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->whereYear('date', $request->get('filter_date'))
            ->where('function_id', '=', 6)
            ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')])
            ->when($request->get('filter_warehouse') && $request->get('filter_warehouse') != 'all', function ($q) use ($request) {
                return $q->whereRelation('orderItems', 'warehouse_id', '=', $request->get('filter_warehouse'));
            })
            ->groupBy('month')
            ->get();

        $resultRevenue = $this->order
            ->with(['orderItems'])
            ->selectRaw('MONTH(date) as month, SUM(payment_items.amount) as total')
            ->join('payment_items', 'orders.id', '=', 'payment_items.order_id')
            ->whereYear('date', $request->get('filter_date'))
            ->where('function_id', '=', 6)
            ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')])
            ->when($request->get('filter_warehouse') && $request->get('filter_warehouse') != 'all', function ($q) use ($request) {
                return $q->whereRelation('orderItems', 'warehouse_id', '=', $request->get('filter_warehouse'));
            })
            ->groupBy('month')
            ->get();

        $data = new stdClass();
        $data->resultSales = $resultSales;
        $data->resultRevenue = $resultRevenue;
        return $data;
    }

    // public function getAllEmployee_bak($request = null)
    // {
    //     $query = $this->employee->select('id', 'code', 'name')
    //         ->with([
    //             'parties' => function ($queryOrder) {
    //                 $queryOrder->select('id', 'consultant_id');
    //             },
    //             'parties.orders' => function ($queryOrder) use ($request) {
    //                 $queryOrder->select('id', 'function_id', 'party_id', 'reference_id', 'date', 'code', 'vat_rate', 'order_status_id')
    //                     ->whereYear('date', $request['filter_date'])
    //                     ->whereIn('function_id', [config('contants.functions.sale_receipt')])
    //                     ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')]);
    //             },
    //             'parties.orders.orderItems' => function ($queryOrder) use ($request) {
    //                 $queryOrder->select('id', 'order_id', 'warehouse_id', 'price', 'quantity', 'vat_rate', 'discount', 'party_id')
    //                     ->when(
    //                         $request->filled('filter_warehouse') && $request->get('filter_warehouse') != 'all',
    //                         function ($query) use ($request) {
    //                             return $query->where('warehouse_id', '=', $request->get('filter_warehouse'));
    //                         }
    //                     );
    //             },
    //             'parties.orders.paymentItems' => function ($queryOrder) use ($request) {
    //                 $queryOrder->select('id', 'payment_id', 'order_id', 'amount')
    //                     ->whereHas('payment', function ($queryPayment) use ($request) {
    //                         $queryPayment->whereYear('date', $request['filter_date'])
    //                             ->when(
    //                                 $request->filled('filter_warehouse') && $request->get('filter_warehouse') != 'all',
    //                                 function ($query) use ($request) {
    //                                     return $query->where('warehouse_id', '=', $request->get('filter_warehouse'));
    //                                 }
    //                             );
    //                     });
    //             },
    //             'parties.orders.paymentItems.payment' => function ($queryOrder) {
    //                 $queryOrder->select('id', 'function_id', 'order_id', 'party_id', 'date', 'total_amount', 'payment_status_id');
    //             },
    //         ]);

    //     return $query->get()->append(['total_order_by_employee_admin',  'total_payment_by_employee_admin']);
    // }

    // public function getRenvenueEmployee($request = null)
    // {
    //     $user = Auth::user();
    //     $query = $this->employee->select('id', 'code', 'name')
    //         ->with([
    //             'parties' => function ($queryOrder) {
    //                 $queryOrder->select('id', 'consultant_id');
    //             },
    //             'parties.orders' => function ($queryOrder) use ($request) {
    //                 $queryOrder->select('id', 'function_id', 'party_id', 'reference_id', 'date', 'code', 'vat_rate', 'order_status_id')
    //                     ->whereYear('date', $request['filter_date'])
    //                     ->whereIn('function_id', [config('contants.functions.sale_receipt')])
    //                     ->whereNotIn('order_status_id', [config('contants.order_status.pending_sale_receipt'), config('contants.order_status.reject_sale_receipt')]);
    //             },
    //             'parties.orders.orderItems' => function ($queryOrder) {
    //                 $queryOrder->select('id', 'order_id', 'warehouse_id', 'price', 'quantity', 'vat_rate', 'discount', 'party_id');
    //             },
    //             'parties.orders.paymentItems' => function ($queryOrder) use ($request) {
    //                 $queryOrder->select('id', 'payment_id', 'order_id', 'amount')
    //                     ->whereHas('payment', function ($queryPayment) use ($request) {
    //                         $queryPayment->whereYear('date', $request['filter_date']);
    //                     });
    //             },
    //             'parties.orders.paymentItems.payment' => function ($queryOrder) {
    //                 $queryOrder->select('id', 'function_id', 'order_id', 'party_id', 'date', 'total_amount', 'payment_status_id');
    //             },
    //             'parties.orders.giftItems' => function ($queryOrder) {
    //                 $queryOrder->select('id', 'order_id', 'price', 'quantity');
    //             },
    //         ])
    //         ->where('id', Auth::user()->id)
    //         ->whereHas('roles', function ($query) {
    //             $query->where('id', 3);
    //         });

    //     return $query->get()->append(['total_order_by_employee_sales',  'total_payment_by_employee_sales']);
    // }
}
