<?php

namespace App\Http\Controllers\API\V1\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\OrderGiftRequest;
use App\Repositories\Orders\OrderGiftRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OrderGiftController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $orderGiftRepository;

    public function __construct(OrderGiftRepository $orderGiftRepository)
    {
        $this->orderGiftRepository = $orderGiftRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'orderGifts' => $this->orderGiftRepository->getAll($request),
            'quantity_for_status_tab' => $this->orderGiftRepository->getQuantityForStatusTab($request),
        ], 'Order Gift List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  OrderGiftRequest  $request
     * @return Response
     */
    public function store(OrderGiftRequest $request)
    {
        $orderGift = $this->orderGiftRepository->create($request);

        if (empty($orderGift['status'])) {
            return $this->responseError($orderGift, $orderGift['message']);
        }

        return $this->responseSuccess($orderGift, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(OrderGiftRequest $request, $id)
    {
        $orderGift = $this->orderGiftRepository->update($request, $id);

        if (empty($orderGift['status'])) {
            return $this->responseError($orderGift, $orderGift['message']);
        }

        return $this->responseSuccess($orderGift, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy(Request $request, $id)
    {
        //
    }

    public function removeItems(Request $request)
    {
        $response = $this->orderGiftRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function removeOrderItems(Request $request)
    {
        $response = $this->orderGiftRepository->removeOrderItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function removeGiftItems(Request $request)
    {
        $response = $this->orderGiftRepository->removeGiftItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function getOrderGiftById(Request $request)
    {
        $response = $this->orderGiftRepository->getOrderGiftById($request);

        return $this->responseSuccess($response, 'Successful');
    }
}
