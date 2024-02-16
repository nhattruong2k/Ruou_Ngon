<?php

namespace App\Http\Controllers\API\V1\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\SaleReceiptRequest;
use App\Repositories\Orders\SaleReceiptRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SaleReceiptController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $saleReceiptRepository;

    public function __construct(SaleReceiptRepository $saleReceiptRepository)
    {
        $this->saleReceiptRepository = $saleReceiptRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'salesReceipt' => $this->saleReceiptRepository->getAll($request),
            'quantity_for_status_tab' => $this->saleReceiptRepository->getQuantityForStatusTab($request),
        ], 'Sales Receipt List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  SaleReceiptRequest  $request
     * @return Response
     */
    public function store(SaleReceiptRequest $request)
    {
        $saleReceipt = $this->saleReceiptRepository->create($request);

        if (empty($saleReceipt['status'])) {
            return $this->responseError($saleReceipt, $saleReceipt['message']);
        }

        return $this->responseSuccess($saleReceipt, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(SaleReceiptRequest $request, $id)
    {
        $saleReceipt = $this->saleReceiptRepository->update($request, $id);

        if (empty($saleReceipt['status'])) {
            return $this->responseError($saleReceipt, $saleReceipt['message']);
        }

        return $this->responseSuccess($saleReceipt, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        //
    }

    public function removeItems(Request $request)
    {
        $response = $this->saleReceiptRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function removeOrderItems(Request $request)
    {
        $response = $this->saleReceiptRepository->removeOrderItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function getSaleReceiptById(Request $request)
    {
        $response = $this->saleReceiptRepository->getSaleReceiptById($request);

        return $this->responseSuccess($response, 'Successful');
    }

    public function createOrderRefund(Request $request)
    {
        $response = $this->saleReceiptRepository->createOrderRefund($request);

        return $this->responseSuccess($response, 'Successful');
    }

    public function getOrderRefundByParty(Request $request): JsonResponse
    {
        $response =  $this->saleReceiptRepository->getOrders($request);
        return $this->responseSuccess([
            'orders' => $response,
        ], 'Order List Successfully !');
    }

    public function createOrderRefundV2(Request $request)
    {
        $response = $this->saleReceiptRepository->createOrderRefundV2($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'create item success!');
    }

    public function getGoodInventory($warehouse_id)
    {
        $response =  $this->saleReceiptRepository->getGoodInventory($warehouse_id);
        return $this->responseSuccess([
            'invetories' => $response,
        ], 'Order List Successfully !');
    }
}
