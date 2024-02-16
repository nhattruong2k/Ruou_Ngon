<?php

namespace App\Http\Controllers\API\V1\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\WarehouseExportRequest;
use App\Models\Functions;
use App\Repositories\Orders\PaymentOrderRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentOrderController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $paymentOrderRepository;

    public function __construct(PaymentOrderRepository $paymentOrderRepository)
    {
        $this->paymentOrderRepository = $paymentOrderRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'payments' => $this->paymentOrderRepository->getAll($request),
            'paymentStatuses' => $this->paymentOrderRepository->getPaymentStatus()
        ], 'Payment List Successfully!');
    }

    public function getOrderByParty(Request $request): JsonResponse
    {
        $response =  $this->paymentOrderRepository->getOrders($request);
        return $this->responseSuccess([
            'orders' => $response,
        ], 'Order List Successfully !');
    }

    public function show($id)
    {
        return $this->responseSuccess([
            'dataPayment' => $this->paymentOrderRepository->getById($id),
        ], 'Payment item Successfully!');
    }

    public function store(Request $request)
    {
        $warehouseExport = $this->paymentOrderRepository->create($request);

        if (empty($warehouseExport['status'])) {
            return $this->responseError($warehouseExport, $warehouseExport['message']);
        }

        return $this->responseSuccess($warehouseExport, 'Create item success!');
    }

    public function update(Request $request, $id)
    {
        $warehouseExport = $this->paymentOrderRepository->update($request, $id);

        if (empty($warehouseExport['status'])) {
            return $this->responseError($warehouseExport, $warehouseExport['message']);
        }

        return $this->responseSuccess($warehouseExport, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->paymentOrderRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function dowloadFile($file)
    {
        $file =  storage_path('app/public/__payment_attachment__/') . $file;
        return response()->download($file);
    }
}
