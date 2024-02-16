<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\CustomerRequest;
use App\Repositories\OrderSampleRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class OrderSampleController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $orderSampleRepository;


    public function __construct(OrderSampleRepository $orderSampleRepository)
    {
        $this->orderSampleRepository = $orderSampleRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'orderSample' => $this->orderSampleRepository->getAll($request),
        ], 'Order Sample List Successfully !');
    }


    public function show(Request $request, $id): JsonResponse
    {
        return $this->responseSuccess([
            'orderSample' => $this->orderSampleRepository->getById($id),
        ], 'Order Sample Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $parties = $this->orderSampleRepository->create($request);

        if (empty($parties['status'])) {
            return $this->responseError($parties, $parties['message']);
        }

        return $this->responseSuccess($parties, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $parties = $this->orderSampleRepository->update($request, $id);

        if (empty($parties['status'])) {
            return $this->responseError($parties, $parties['message']);
        }

        return $this->responseSuccess($parties, 'Update model success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->orderSampleRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
