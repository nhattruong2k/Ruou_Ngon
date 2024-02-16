<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\OrderOrderStatus;
use App\Models\Payment;
use App\Models\PaymentItem;
use App\Repositories\BaseRepository;
use App\Services\UploadService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PaymentRepository extends BaseRepository
{
    protected $payment;
    protected $paymentItem;
    protected $order;
    protected $orderOrderStatus;

    public function __construct(
        Payment          $payment,
        PaymentItem      $paymentItem,
        Order            $order,
        OrderOrderStatus $orderOrderStatus
    ) {
        $this->payment = $payment;
        $this->paymentItem = $paymentItem;
        $this->order = $order;
        $this->orderOrderStatus = $orderOrderStatus;
        parent::__construct($payment);
    }

    public function getAll($request = null)
    {
    }

    public function filter($query, $column, $value)
    {
        return $query = $query->where($column, $value);
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $payments = $request->payment_items ?? null;

            foreach ($payments as $dataItem) {
                $filePath = '';

                if ($dataItem['attachFile']) {
                    $uploadedFile = UploadedFile::createFromBase($dataItem['attachFile']);
                    $uploadService = app(UploadService::class);
                    $uploadService->dir = '__payment_attachment__';
                    $filePath = $uploadService->handleUploadedFile($uploadedFile);
                }
                $payment = $this->payment->create([
                    'function_id' => config('contants.functions.payment'),
                    'order_id' => $request->order_id,
                    'payment_method_id' => config('contants.payment_method.cash'),
                    'party_id' => $request->party_id,
                    'receiver' => $request->get('employee_id'),
                    'code' => Payment::generateCode(config('contants.functions.payment'), $request['date_payment'], config('contants.function_code.payment')),
                    'date' => $dataItem['date_payment'],
                    'warehouse_id' => $request->warehouse_id,
                    'total_amount' => $dataItem['price_payment'],
                    'comment' => $dataItem['comment'],
                    'payment_status_id' => config('contants.payment_status.pending'),
                    'attachment' => $filePath
                ]);

                $this->paymentItem->create([
                    'payment_id' => $payment->id,
                    'order_id' => $request->order_id,
                    'amount' => $dataItem['price_payment'],
                    'created_at' => Carbon::now()
                ]);
            }

            DB::commit();

            return [
                'data' => true,
                'code' => 201,
                'status' => true,
                'message' => 'create item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception' . $exception->getMessage());

            return [
                'data' => false,
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
        }
    }
}
