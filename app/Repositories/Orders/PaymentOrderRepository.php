<?php

namespace App\Repositories\Orders;

use App\Models\DailyProductBalance;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderOrderStatus;
use App\Models\Parties;
use App\Models\Payment;
use App\Models\PaymentItem;
use App\Models\PaymentOldDebt;
use App\Models\PaymentStatus;
use App\Repositories\BaseRepository;
use App\Services\UploadService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentOrderRepository extends BaseRepository
{
    protected $payment;
    protected $paymentItem;
    protected $paymentStatus;
    protected $orderOrderStatus;
    protected $order;
    protected $orderItem;
    protected $dailyProductBalance;
    protected $parties;
    protected $paymentOldDebt;

    public function __construct(
        Payment $payment,
        PaymentItem $paymentItem,
        OrderOrderStatus $orderOrderStatus,
        Order $order,
        OrderItem $orderItem,
        DailyProductBalance $dailyProductBalance,
        PaymentStatus $paymentStatus,
        Parties $parties,
        PaymentOldDebt $paymentOldDebt,
    ) {
        $this->paymentItem = $paymentItem;
        $this->payment = $payment;
        $this->paymentStatus = $paymentStatus;
        $this->orderOrderStatus = $orderOrderStatus;
        $this->order = $order;
        $this->orderItem = $orderItem;
        $this->dailyProductBalance = $dailyProductBalance;
        $this->parties = $parties;
        $this->paymentOldDebt = $paymentOldDebt;

        parent::__construct($order);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }
        $user = Auth::user();

        $query = $this->payment->with(['paymentItems', 'party', 'party.employee', 'user'])
            ->when(
                $request->filled('filter_status') && $request->get('filter_status') != 'all',
                function ($query) use ($request) {
                    return $query->where('payment_status_id', $request->get('filter_status'));
                }
            )
            ->when($request->filled('filter_name'), function ($query) use ($request) {
                return $query->where(function ($queryCode) use ($request) {
                    $queryCode->whereRelation('party', 'name', 'like', '%' . $request->get('filter_name') . '%')
                        ->orWhereRelation('party', 'code', 'like', '%' . $request->get('filter_name') . '%')
                        ->orWhere('code', 'like', '%' . $request->get('filter_name') . '%');
                });
            })->when(
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

        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('id', 'DESC')->get();
    }

    public function getById($id)
    {
        $query = $this->payment->with([
            'paymentItems',
            'party',
            'user',
            'paymentOldDebts' => function ($query) {
                $query->select([
                    'id',
                    'party_id',
                    'payment_id',
                    'amount'
                ]);
            }
        ])->find($id);

        $orderIds = $query->paymentItems->pluck('order_id')->groupBy(function ($orderId) {
            return $orderId;
        })->keys()->toArray();

        $party = $this->parties->with([
            'paymentOldDebts' => function ($query) use ($id) {
                $query->where('payment_id', $id)->select(['id', 'payment_id', 'party_id', 'amount']);
            }
        ])
            ->where('id', $query->party_id)
            ->first([
                'id',
                'old_debt',
            ]);


        $orders = $this->order->with([
            'orderItems.good.unitOfMeasure',
            'paymentItems' => function ($q) use ($id) {
                $q->where('payment_id', '!=', $id)->whereRelation(
                    'payment',
                    'payment_status_id',
                    '=',
                    config('contants.payment_status.approved')
                );
            },
        ])
            ->whereIn('id', $orderIds)->get()->append(['total_price']);

        return ['payment' => $query, 'orders' => $orders, 'party' => $party];
    }

    public function getOrders($request = null)
    {
        $query = $this->order->with([
            'orderItems.good.unitOfMeasure',
            'paymentItems' => function ($q) {
                $q->whereRelation('payment', 'payment_status_id', '=', config('contants.payment_status.approved'));
            }
        ])
            ->when($request->filled('party_id'), function ($query) use ($request) {
                return $query->where('party_id', '=', $request->get('party_id'));
            })->whereIn(
                'order_status_id',
                [
                    config('contants.order_status.created_sale_receipt'),
                    config('contants.order_status.confirm_sale_receipt'),
                    config('contants.order_status.paying_sale_receipt'),
                    config('contants.order_status.exported'),
                ]
            );
        $dataQuery = $query->get()->append(['total_price']);

        $orders = [];

        // Get order is paying
        foreach ($dataQuery as $item) {
            $isSuccessPayment = $this->orderOrderStatus
                ->where('order_id', $item->id)
                ->where('order_status_id', '!=', config('contants.order_status.success_payment'))
                ->exists();

            if ($isSuccessPayment) {
                $orders[] = $item;
            }
        }

        return $orders;
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $orders = $request->get('orders') ?? null;

            if (empty($orders)) {
                throw new Exception('Vui lòng chọn đơn hàng cần thanh toán!', 404);
            }
            $filePath = '';
            if ($request->hasFile('attachment_file')) {
                $file = $request->file('attachment_file');
                $uploadService = app(UploadService::class);
                $uploadService->dir = '__payment_attachment__';
                $filePath = $uploadService->handleUploadedFile($file);
                $request->merge(['attachment' => $filePath]);
            }
            $request->merge([
                'code' => Payment::generateCode(
                    config('contants.functions.payment'),
                    $request['date'],
                    config('contants.function_code.payment')
                ),
                'function_id' => config('contants.functions.payment'),
                'payment_method_id' => config('contants.payment_method.cash'),
                'amount' => $request['total_amount'],
                'total_amount' => $request['total_amount'],
            ]);

            $payment = $this->payment->create($request->all());

            foreach ($orders as $item) {
                if ($item['type'] == config('contants.payment_type.debt')) {
                    $party = $this->parties->find($item['id']);

                    if ($party) {
                        $this->paymentOldDebt->create([
                            'payment_id' => $payment->id,
                            'party_id' => $party->id,
                            'amount' => $item['amount'],
                            'date' => $request->date
                        ]);
                    } else {
                        throw new Exception('Không tìm thấy khách hàng', 404);
                    }
                } else {
                    $order = $this->order->find($item['id']);
                    if ($order && isset($item['amount']) && (float)$item['amount'] > 0) {
                        // payment item
                        $this->paymentItem->create([
                            'payment_id' => $payment->id,
                            'order_id' => $order->id,
                            'amount' => $item['amount'],
                            'created_at' => Carbon::now()
                        ]);
                    }
                    // else {
                    //     throw new Exception('Không tìm thấy đơn hàng!', 404);
                    // }
                }
            }

            DB::commit();

            return [
                'status' => true,
                'data' => $payment,
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
            $payment = $this->payment->find($id);
            if ($payment) {
                $payment->update(['payment_status_id' => config('contants.payment_status.' . $request['status_payment'])]);

                $orders = $request->get('orders') ?? null;

                if (config('contants.payment_status.' . $request['status_payment']) == config('contants.payment_status.approved')) {

                    foreach ($orders as $item) {
                        if ($item['type'] == config('contants.payment_type.order')) {
                            $order = $this->order->find($item['id']);

                            if ($order) {
                                // update status order
                                $orderStatus = array();

                                $isExported = $this->orderOrderStatus
                                    ->where('order_id', $order->id)
                                    ->where('order_status_id', config('contants.order_status.exported'))
                                    ->exists();

                                if ($item['amount'] < $item['total']) {

                                    if (!$isExported) {
                                        $order->update(['order_status_id' => config('contants.order_status.paying_sale_receipt')]);
                                        $orderStatus = [
                                            'order_id' => $order->id,
                                            'order_status_id' => config('contants.order_status.paying_sale_receipt')
                                        ];

                                        $this->createHistoryOrder($orderStatus);
                                    }
                                } else {

                                    if ($isExported) {
                                        $order->update(['order_status_id' => config('contants.order_status.success_sale_receipt')]);
                                        $orderStatus = [
                                            'order_id' => $order->id,
                                            'order_status_id' => config('contants.order_status.success_sale_receipt')
                                        ];

                                        $this->createHistoryOrder([
                                            'order_id' => $order->id,
                                            'order_status_id' => config('contants.order_status.success_payment')
                                        ]);
                                        $this->createHistoryOrder($orderStatus);
                                    } else {
                                        $order->update(['order_status_id' => config('contants.order_status.success_payment')]);
                                        $orderStatus = [
                                            'order_id' => $order->id,
                                            'order_status_id' => config('contants.order_status.success_payment')
                                        ];

                                        $this->createHistoryOrder($orderStatus);
                                    }
                                }
                            } else {
                                throw new Exception('Không tìm thấy đơn hàng!', 404);
                            }
                        } else {
                            if ($item['type'] == config('contants.payment_type.debt')) {
                                $party = $this->parties->find($request->party_id);
                                if ($party) {
                                    $oldDebtRemain = $party->old_debt - $item['amount'];
                                    $party->update(['old_debt' => $oldDebtRemain]);
                                } else {
                                    throw new Exception('Không tìm thấy khách hàng', 404);
                                }
                            }
                        }
                    }
                } else {
                    foreach ($orders as $item) {
                        if ($item['type'] == config('contants.payment_type.debt')) {
                            $party = $this->parties->find($request->party_id);
                            if ($party) {
                                $oldDebtRemain = $party->old_debt + $item['amount'];
                                $party->update(['old_debt' => $oldDebtRemain]);
                            } else {
                                throw new Exception('Không tìm thấy khách hàng', 404);
                            }
                        }
                    }
                }
            } else {
                throw new Exception('Không tìm thấy thanh toán đơn hàng!', 404);
            }

            DB::commit();
            return [
                'status' => true,
                'code' => 200,
                'data' => $payment,
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
            $paymentIds = $request->get('ids');
            $payment = $this->payment->with(['paymentItems'])->whereIn('id', $paymentIds)->get();
            foreach ($payment as $item) {
                if ($item->payment_status_id == config('contants.payment_status.approved')) {
                    throw new Exception(
                        'Không thể xóa thanh toán đã được duyệt. Vui lòng kiểm tra lại danh sách thanh toán muốn xóa!',
                        400
                    );
                }
                $this->paymentItem->where('payment_id', $item->id)->delete();
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

    public function getPaymentStatus()
    {
        $user = Auth::user();
        $statuses = $this->paymentStatus->get();
        foreach ($statuses as $item) {
            $item->count = $this->payment->with(['party', 'party.employee'])
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
                )
                ->where('payment_status_id', $item->id)->count();
        }
        return $statuses;
    }

    /**
     * @param  array  $orderStatus
     * @return void
     */
    public function createHistoryOrder(array $orderStatus): void
    {
        $cloneOrderStatus = $orderStatus;
        $cloneOrderStatus['date'] = Carbon::now()->isoFormat('YYYY-MM-DD HH:mm:ss');

        $orderOrderStatus = $this->orderOrderStatus->where(
            'order_id',
            $orderStatus['order_id']
        )->where(
            'order_status_id',
            $orderStatus['order_status_id']
        )->first();
        if ($orderOrderStatus) {
            $orderOrderStatus->update(['date', Carbon::now()]);
        } else {
            $this->orderOrderStatus->create($cloneOrderStatus);
        }
    }
}
