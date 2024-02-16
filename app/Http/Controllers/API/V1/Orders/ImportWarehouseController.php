<?php

namespace App\Http\Controllers\API\V1\Orders;

use App\Http\Controllers\Controller;
use App\Models\OrderStatus;
use App\Repositories\FunctionRepository;
use App\Repositories\Orders\ImportWarehouseRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Respmysqlonse;
use Illuminate\Http\Response;

class ImportWarehouseController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $importWarehouseRepository;
    protected $functionRepository;

    public function __construct(
        ImportWarehouseRepository $importWarehouseRepository,
        FunctionRepository $functionRepository
    ) {
        $this->importWarehouseRepository = $importWarehouseRepository;
        $this->functionRepository = $functionRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return Respmysqlonse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'orderImport' => $this->importWarehouseRepository->getAll($request),
            'functions' => $this->functionRepository->functionImportWarehouse(
                config('contants.function_types.import_warehouse'),
                $request
            ),
            'orderStatus' => OrderStatus::where('type_id', 1)->get()
        ], 'List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $response = $this->importWarehouseRepository->create($request);

        if (!$response['status']) {
            return $this->responseError($response, $response['message']);
        }

        return $this->responseSuccess($response, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        $response = $this->importWarehouseRepository->update($request, $id);

        if (!$response['status']) {
            return $this->responseError($response, $response['message']);
        }

        return $this->responseSuccess($response, 'Update item success!');
    }

    public function destroy(Request $request, $id)
    {
        $response = $this->importWarehouseRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function getOrderRefundById($id)
    {
        $response = $this->importWarehouseRepository->getOrderRefundById($id);

        return $this->responseSuccess($response, 'Successful');
    }

    public function updateOrderRefund(Request $request, $id)
    {
        $response = $this->importWarehouseRepository->updateOrderRefund($request, $id);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Update order success!');
    }

    public function getOrderImportById($id)
    {
        $response = $this->importWarehouseRepository->getOrderImportById($id);

        return $this->responseSuccess($response, 'Successful');
    }
}
