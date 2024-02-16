<?php

namespace App\Repositories\Reports;

use App\Models\Order;
use App\Models\Good;
use App\Models\OrderItem;
use App\Models\Parties;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GoodReportRepository extends BaseRepository
{
    protected $parties;
    protected $order;
    protected $good;
    protected $orderItem;

    public function __construct(
        Parties $parties,
        Order $order,
        Good $good,
        OrderItem $orderItem
    ) {
        $this->parties = $parties;
        $this->order = $order;
        $this->good = $good;
        $this->orderItem = $orderItem;
        parent::__construct($parties);
    }

    public function reportGood($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->good->select('id', 'good_category_id', 'name', 'code');

        $query->with([
            'orderItems' => function ($q) {
                $q->select('id', 'order_id', 'warehouse_id', 'good_id');
            },
        ])->whereHas('orderItems', function ($q) {
            $q->select('id', 'order_id', 'warehouse_id', 'good_id');
        });

        if ($rowsPerPage) {
            $pagination = $query->paginate($rowsPerPage);
            return $pagination;
        }
        return $query->get();
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->orderItem
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('goods', 'order_items.good_id', '=', 'goods.id')
            ->join('internal_orgs', 'order_items.warehouse_id', '=', 'internal_orgs.id')
            ->join('good_categories', 'goods.good_category_id', '=', 'good_categories.id')
            ->leftJoin('good_categories as good_categorie_parent', 'good_categories.parent_id', '=', 'good_categorie_parent.id')
            ->select(
                DB::raw('SUM(order_items.discount * order_items.quantity) as total_price'),
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                'goods.name',
                'goods.code',
                'good_categories.name as category_name',
                'good_categorie_parent.name as category_parent_name',
                'order_items.warehouse_id',
                'order_items.good_id',
                'internal_orgs.name as internal_org_name'
            )
            ->groupBy([
                'order_items.warehouse_id',
                'order_items.good_id',
                'goods.name',
                'goods.code',
                'good_categories.name',
                'good_categorie_parent.name',
                'internal_orgs.name'
            ])->when(
                $request->get('filter_name'),
                function ($q) use ($request) {
                    return $q->where('goods.name', 'like', '%' . $request->get('filter_name') . '%')
                        ->orWhere('goods.code', 'like', '%' . $request->get('filter_name') . '%');
                }
            )->when(
                $request->get('filter_warehouse') && $request->get('filter_warehouse') != 'all',
                function ($q) use ($request) {
                    return $q->where('order_items.warehouse_id', '=', $request->get('filter_warehouse'));
                }
            )->when(
                $request->filled('filter_start_date') && $request->filled('filter_end_date'),
                function ($query) use ($request) {
                    return $query->whereBetween('orders.date', [$request['filter_start_date'], $request['filter_end_date']]);
                }
            )->when(
                $request->filled('filter_start_date') && $request->filled('filter_end_date'),
                function ($query) use ($request) {
                    return $query->whereBetween('orders.date', [$request['filter_start_date'], $request['filter_end_date']]);
                }
            );


        if ($rowsPerPage) {
            $pagination = $query->paginate($rowsPerPage);
            return $pagination;
        }
        return $query->get();
    }
}
