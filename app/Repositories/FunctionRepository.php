<?php

namespace App\Repositories;

use App\Models\Functions;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class FunctionRepository extends BaseRepository
{
    protected $function;
    protected $order;

    public function __construct(Functions $function, Order $order)
    {
        $this->function = $function;
        $this->order = $order;
        parent::__construct($function);
    }

    public function getAll($request = null)
    {
        $functions = $this->function->with(['setting']);

        if ($request->filter_function_type) {
            $functions->where('function_type_id', $request->filter_function_type);
        }

        if ($request->filter_name) {
            $functions->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->filter_name . '%');
            });
        }

        if ($request->filter_transaction and $request->filter_transaction != 'all') {
            $functions->where('id', $request->filter_transaction);
        }

        return $functions->orderBy('id', 'ASC')->get();
    }

    public function functionImportWarehouse($function_type_id, $request)
    {
        $user = Auth::user();
        $functions = $this->function->where('function_type_id', $function_type_id)->get();
        $orderStatusId = $request->get('order_status_id');
        $filterStartDate = $request->get('filter_start_date');
        $filterEndDate = $request->get('filter_end_date');
        $functionId = $request->get('function_id');
        $filterName = $request->get('filter_name');
        $filterWarehouse = $request->get('filter_warehouse');

        foreach ($functions as $item) {
            if ($item->id == config('contants.functions.import_transfer')) {
                $item->count = $this->order
                    ->where('function_id', $item->id)
                    ->whereRelation(
                        'orderReference',
                        'order_status_id',
                        '>=',
                        config('contants.order_status.completed')
                    )
                    ->when(
                        $request->filled('order_status_id') && $orderStatusId != 'all',
                        function ($query) use ($orderStatusId) {
                            return $query->where('order_status_id', $orderStatusId);
                        }
                    )
                    ->when(
                        $request->filled('filter_start_date') && $request->filled('filter_end_date'),
                        function ($query) use ($functionId, $filterStartDate, $filterEndDate) {
                            return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                        }
                    )
                    ->when($request->filled('filter_name'), function ($query) use ($filterName) {
                        return $query->where('code', 'like', '%' . $filterName . '%');
                    })
                    ->when(
                        $request->filled('filter_warehouse') && $filterWarehouse != 'all',
                        function ($query) use ($filterWarehouse) {
                            return $query->whereRelation('orderItems', 'warehouse_id', '=', $filterWarehouse);
                        }
                    )->when(
                        $user->hasRole('warehouse'),
                        function ($query) use ($user) {
                            return $query->whereRelation('orderItems', 'warehouse_id', '=', $user->internal_org_id);
                        }
                    )
                    ->count();
            } else {
                if ($item->id == config('contants.functions.import_refund')) {
                    $item->count = $this->order
                        ->where('function_id', config('contants.functions.refund'))
                        ->when(
                            $request->filled('order_status_id') && $orderStatusId != 'all',
                            function ($query) use ($orderStatusId) {
                                return $query->where('order_status_id', $orderStatusId);
                            }
                        )
                        ->when(
                            $request->filled('filter_start_date') && $request->filled('filter_end_date'),
                            function ($query) use ($functionId, $filterStartDate, $filterEndDate) {
                                return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                            }
                        )
                        ->when($request->filled('filter_name'), function ($query) use ($filterName) {
                            return $query->where('code', 'like', '%' . $filterName . '%');
                        })
                        ->when(
                            $request->filled('filter_warehouse') && $filterWarehouse != 'all',
                            function ($query) use ($filterWarehouse) {
                                return $query->whereRelation('orderItems', 'warehouse_id', '=', $filterWarehouse);
                            }
                        )->when(
                            $user->hasRole('warehouse'),
                            function ($query) use ($user) {
                                return $query->whereRelation('orderItems', 'warehouse_id', '=', $user->internal_org_id);
                            }
                        )
                        ->count();
                } else {
                    $item->count = $this->order
                        ->where('function_id', $item->id)
                        ->when(
                            $request->filled('order_status_id') && $orderStatusId != 'all',
                            function ($query) use ($orderStatusId) {
                                return $query->where('order_status_id', $orderStatusId);
                            }
                        )
                        ->when(
                            $request->filled('filter_start_date') && $request->filled('filter_end_date'),
                            function ($query) use ($functionId, $filterStartDate, $filterEndDate) {
                                return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                            }
                        )
                        ->when($request->filled('filter_name'), function ($query) use ($filterName) {
                            return $query->where('code', 'like', '%' . $filterName . '%');
                        })
                        ->when(
                            $request->filled('filter_warehouse') && $filterWarehouse != 'all',
                            function ($query) use ($filterWarehouse) {
                                return $query->whereRelation('orderItems', 'warehouse_id', '=', $filterWarehouse);
                            }
                        )->when(
                            $user->hasRole('warehouse'),
                            function ($query) use ($user) {
                                return $query->whereRelation('orderItems', 'warehouse_id', '=', $user->internal_org_id);
                            }
                        )
                        ->count();
                }
            }
        }
        return $functions;
    }

    public function functionExportWarehouse($function_type_id, $request)
    {
        $user = Auth::user();
        $functions = $this->function->where('function_type_id', $function_type_id)->get();
        $filterStatus = $request->get('filter_status');
        $filterStartDate = $request->get('filter_start_date');
        $filterEndDate = $request->get('filter_end_date');
        $functionId = $request->get('function_id');
        $filterCode = $request->get('filter_code');
        $filterWarehouse = $request->get('filter_warehouse');

        foreach ($functions as $item) {
            $item->count = $this->order
                ->where('function_id', $item->id)
                ->when(
                    $request->filled('order_status_id') && $filterStatus != 'all',
                    function ($query) use ($filterStatus) {
                        return $query->where('order_status_id', $filterStatus);
                    }
                )
                ->when(
                    $request->filled('filter_start_date') && $request->filled('filter_end_date'),
                    function ($query) use ($functionId, $filterStartDate, $filterEndDate) {
                        return $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
                    }
                )
                ->when($request->filled('filter_name'), function ($query) use ($filterCode) {
                    return $query->where('code', 'like', '%' . $filterCode . '%');
                })
                ->when(
                    $request->filled('filter_warehouse') && $filterWarehouse != 'all',
                    function ($query) use ($filterWarehouse) {
                        return $query->whereRelation('orderItems', 'warehouse_id', '=', $filterWarehouse);
                    }
                )->when(
                    $user->hasRole('warehouse'),
                    function ($query) use ($user) {
                        return $query->whereRelation('orderItems', 'warehouse_id', '=', $user->internal_org_id);
                    }
                )
                ->count();
        }
        return $functions;
    }

    public function filter($query, $column, $value)
    {
    }
}
