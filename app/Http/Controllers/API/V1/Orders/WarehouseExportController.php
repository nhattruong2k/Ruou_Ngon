<?php

namespace App\Http\Controllers\API\V1\Orders;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\WarehouseExportRequest;
use App\Models\OrderStatus;
use App\Repositories\FunctionRepository;
use App\Repositories\Orders\WarehouseExportRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WarehouseExportController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $wareHouseExportRepository;
    protected $functionRepository;

    public function __construct(
        WarehouseExportRepository $wareHouseExportRepository,
        FunctionRepository $functionRepository
    ) {
        $this->wareHouseExportRepository = $wareHouseExportRepository;
        $this->functionRepository = $functionRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'warehouseExports' => $this->wareHouseExportRepository->getAll($request),
            'typeExports' => $this->functionRepository->functionExportWarehouse(config('contants.function_types.export_warehouse'),
                $request),
            'orderStatus' => OrderStatus::where('type_id', 1)->get()
        ], 'Warehouse Export List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  WarehouseExportRequest  $request
     * @return Response
     */
    public function store(WarehouseExportRequest $request)
    {
        $warehouseExport = $this->wareHouseExportRepository->create($request);

        if (empty($warehouseExport['status'])) {
            return $this->responseError($warehouseExport, $warehouseExport['message']);
        }

        return $this->responseSuccess($warehouseExport, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(WarehouseExportRequest $request, $id)
    {
        $warehouseExport = $this->wareHouseExportRepository->update($request, $id);

        if (empty($warehouseExport['status'])) {
            return $this->responseError($warehouseExport, $warehouseExport['message']);
        }

        return $this->responseSuccess($warehouseExport, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->wareHouseExportRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function removeItems(Request $request)
    {
        $response = $this->wareHouseExportRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function removeOrderItems(Request $request)
    {
        $response = $this->wareHouseExportRepository->removeOrderItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function checkQuantityBeforeCreate(Request $request)
    {
        $response = $this->wareHouseExportRepository->checkQuantityBeforeCreate($request);

        return $this->responseSuccess($response, 'Successful');
    }

    public function getOrderExportById($id)
    {
        $response = $this->wareHouseExportRepository->getOrderExportById($id);

        return $this->responseSuccess($response, 'Successful');
    }
}
