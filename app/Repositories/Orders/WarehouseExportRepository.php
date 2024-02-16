<?php

namespace App\Repositories\Orders;

use App\Models\DailyProductBalance;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Repositories\BaseRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WarehouseExportRepository extends BaseRepository
{
    protected $order;
    protected $orderItem;
    protected $dailyProductBalance;
    protected $notification;

    public function __construct(Order $order, OrderItem $orderItem, DailyProductBalance $dailyProductBalance, Notification $notification)
    {
        $this->order = $order;
        $this->orderItem = $orderItem;
        $this->dailyProductBalance = $dailyProductBalance;
        $this->notification = $notification;

        parent::__construct($order, $orderItem, $dailyProductBalance);
    }

    public function getAll($request = null)
    {
        $user = Auth::user();
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->order->with([
            'employee',
            'function',
            'orderStatus',
            'orderItems',
            'orderItems.internalOrg',
            'orderItems.good',
            'orderItems.good.unitOfMeasure',
            'orderChildReference.orderItems.internalOrg',
        ])
            ->where('function_id', $request->function_id)
            ->whereHas('function', function ($queryFunction) {
                return $queryFunction->where('function_type_id', config('contants.function_types.export_warehouse'));
            });

        // filter range date
        if (!empty($request->filter_start_date) && !empty($request->filter_end_date)) {
            $query = $query->whereBetween('date', [$request->filter_start_date, $request->filter_end_date]);
        }
        if (!empty($request->filter_start_date) && empty($request->filter_end_date)) {
            $query = $query->where('date', '>=', $request->filter_start_date);
        }
        if (empty($request->filter_start_date) && !empty($request->filter_end_date)) {
            $query = $query->where('date', '<=', $request->filter_end_date);
        }

        // filter by code
        if (!empty($request->get('filter_code'))) {
            $query = $query->where('code', 'LIKE', '%' . $request->filter_code . '%');
        }

        // filter by warehouse
        if (!empty($request->get('filter_warehouse')) && $request->get('filter_warehouse') !== 'all') {
            $query = $query->whereHas('orderItems', function ($queryOrderItem) use ($request) {
                return $queryOrderItem->where('warehouse_id', $request->get('filter_warehouse'));
            });
        }

        if (!empty($request->get('filter_status')) && $request->get('filter_status') !== 'all') {
            $query = $query->where('order_status_id', $request->get('filter_status'));
        }
        $query = $query->when(
            $user->hasRole('warehouse'),
            function ($query) use ($user) {
                return $query->whereRelation('orderItems', 'warehouse_id', '=', $user->internal_org_id);
            }
        );
        if ($rowsPerPage) {
            $pagination = $query->orderBy('orders.id', 'DESC')->paginate($rowsPerPage);
            $pagination->getCollection()->each(function ($order) {
                $order->append(['total_quantity', 'warehouse']);
            });

            return $pagination;
        }
        return $query->orderBy('orders.id', 'DESC')->get();
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $orderItems = $request->get('order_items') ?? null;

            $importWarehouseId = $request->get('import_warehouse_id') ?? null;

            if (empty($orderItems)) {
                throw new Exception('Chi tiết đơn hàng rỗng', 404);
            }

            $order = $this->order->create([
                'function_id' => $request->function_id,
                'order_status_id' => config('contants.order_status.pending'),
                'date' => $request->date,
                'code' => Order::generateCode($request->function_id, $request->date, $request->function_code),
                'created_by' => $request->employee_id,
                'comment' => $request->comment,
            ]);

            foreach ($orderItems as $item) {

                $this->orderItem->create([
                    'order_id' => $order->id,
                    'warehouse_id' => $request->export_warehouse_id,
                    'good_id' => $item['good_id'],
                    'comment' => $request->comment,
                    'quantity' => $item['quantity'],
                    'consultant_id' => $request->employee_id,
                    'created_by' => Auth::user()->id
                ]);
            }

            if (!empty($importWarehouseId)) {
                $orderTransfer = $this->order->create([
                    'function_id' => config('contants.functions.import_transfer'),
                    'order_status_id' => config('contants.order_status.pending'),
                    'reference_id' => $order->id
                ]);

                foreach ($orderItems as $item) {

                    $this->orderItem->create([
                        'order_id' => $orderTransfer->id,
                        'warehouse_id' => $request->import_warehouse_id,
                        'good_id' => $item['good_id'],
                        'comment' => $request->comment,
                        'quantity' => $item['quantity'],
                        'consultant_id' => $request->employee_id,
                        'created_by' => Auth::user()->id
                    ]);
                }
            }

            // create notification of order
            $this->notification->createNotiWhenAddNew([
                'feature_id' => $order->id,
                'function_id' => $request->function_id
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
            $orderStatus = $request->get('status') ?? null;
            $functionId = $request->get('function_id') ?? null;
            $childOrderReference = $request->get('order_child_reference') ?? null;
            $notEnoughGoods = false;

            if (empty($orderItems)) {
                throw new Exception('Chi tiết đơn hàng rỗng', 404);
            }

            // Update quantity of product when confirm order
            if ($orderStatus === config('contants.order_status.completed')) {
                $notEnoughGoods = $this->dailyProductBalance->updateQuantityWhenExport($orderItems, $request->get('export_warehouse_id'));
            }

            $order = $this->order->findOrFail($id);

            // Check if export other update warehouse
            $warehouseIdBeforeUpdate = $this->orderItem->where('order_id', $id)->get('warehouse_id');
            if ($warehouseIdBeforeUpdate !== $request->get('export_warehouse_id')) {
                $this->orderItem->where('order_id', $id)->delete();
            }

            // Check if export transfer update warehouse
            if ($functionId === config('contants.functions.export_transfer')) {
                $warehouseChildIdBeforeUpdate = $this->orderItem->where('order_id', $childOrderReference['id'])->get('warehouse_id');

                if ($warehouseChildIdBeforeUpdate !== $request->get('import_warehouse_id')) {
                    $this->orderItem->where('order_id', $childOrderReference['id'])->delete();
                    $this->orderItem->where('order_id', $id)->delete();
                }

                // $orderChild = $this->order->findOrFail($childOrderReference['id']);
                // $orderChild->update(['order_status_id' => $orderStatus]);

                $currentChildItemId = [];
                foreach ($childOrderReference['order_items'] as $childItem) {
                    $currentChildItemId[] = $childItem['id'];
                }
            }

            $order->update([
                'order_status_id' => $orderStatus,
                'date' => $request->date,
                'created_by' => $request->employee_id,
                'comment' => $request->comment,
            ]);

            foreach ($orderItems as $dataItem) {

                $item = $this->orderItem->find($dataItem['id']);

                if ($item) {
                    // Update order item of children order reference
                    if ($functionId === config('contants.functions.export_transfer')) {
                        $this->orderItem
                            ->whereIn('id', $currentChildItemId)
                            ->where('good_id', $item->good_id)
                            ->update([
                                'warehouse_id' => $request->import_warehouse_id,
                                'good_id' => $dataItem['good_id'],
                                'comment' => $request->comment,
                                'quantity' => $dataItem['quantity'],
                                'consultant_id' => $request->employee_id,
                                'created_by' => Auth::user()->id
                            ]);
                    }

                    $item->update([
                        'warehouse_id' => $request->export_warehouse_id,
                        'good_id' => $dataItem['good_id'],
                        'comment' => $request->comment,
                        'quantity' => $dataItem['quantity'],
                        'consultant_id' => $request->employee_id,
                        'created_by' => Auth::user()->id
                    ]);
                } else {
                    $this->orderItem->create([
                        'order_id' => $order->id,
                        'warehouse_id' => $request->export_warehouse_id,
                        'good_id' => $dataItem['good_id'],
                        'comment' => $request->comment,
                        'quantity' => $dataItem['quantity'],
                        'consultant_id' => $request->employee_id,
                        'created_by' => Auth::user()->id
                    ]);

                    if ($functionId === config('contants.functions.export_transfer')) {
                        // create order item of children order reference
                        $this->orderItem->create([
                            'order_id' => $childOrderReference['id'],
                            'warehouse_id' => $request->import_warehouse_id,
                            'good_id' => $dataItem['good_id'],
                            'comment' => $request->comment,
                            'quantity' => $dataItem['quantity'],
                            'consultant_id' => $request->employee_id,
                            'created_by' => Auth::user()->id
                        ]);
                    }
                }
            }

            DB::commit();

            return [
                'status' => true,
                'code' => 200,
                'message' => 'Update success',
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
            $functionId = $request->get('function_id');

            $orderQuery = $this->order->whereIn('id', $orderIds);

            // Check can't delete if order is confirm or success
            $orderQueryClone = clone $orderQuery;
            $cantDelete = $orderQueryClone->where('order_status_id', '>=', config('contants.order_status.completed'))->exists();

            if ($cantDelete) {
                throw new Exception('Không thể xóa đơn hàng đã xác nhận hoặc đã hoàn thành', 404);
            }

            // Delete order transfer
            if ($functionId === config('contants.functions.export_transfer')) {
                $queryOrderTransfer = $this->order->whereIn('reference_id', $orderIds);

                $this->orderItem->whereIn('order_id', $queryOrderTransfer->pluck('id'))->delete();

                $queryOrderTransfer->delete();
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
            $orderId = $request->get('order_id');
            $orderItemId = $request->get('id');
            $functionId = $request->get('function_id');
            $goodId = $request->get('good_id');

            if ($functionId === config('contants.functions.export_transfer')) {
                $orderTransferId = $this->order->where('reference_id', $orderId)->get('id');
                $this->orderItem->where('good_id', $goodId)->where('order_id', $orderTransferId->pluck('id'))->delete();
            }

            $this->orderItem->find($orderItemId)->forceDelete();

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

    public function checkQuantityBeforeCreate($request)
    {
        $canCreate = $this->dailyProductBalance
            ->where('organization_id', $request->get('warehouse_id'))
            ->where('productable_id', $request->get('good_id'))
            ->where('opening_quantity', '>=', $request->get('quantity'))
            ->exists();

        return $canCreate;
    }

    public function getOrderExportById($id)
    {
        return $this->order->with([
            'employee',
            'function',
            'orderStatus',
            'orderItems',
            'orderItems.internalOrg',
            'orderItems.good',
            'orderItems.good.unitOfMeasure',
            'orderChildReference.orderItems.internalOrg',
        ])->findOrFail($id)->append(['total_quantity', 'warehouse']);
    }
}
