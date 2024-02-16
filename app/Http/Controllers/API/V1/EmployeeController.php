<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Repositories\EmployeeRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use App\Imports\EmployeeImport;
use App\Http\Requests\Employees\EmployeeRequest;
use App\Models\EmployeeType;
use Exception;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class EmployeeController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $employeeRepository;


    public function __construct(EmployeeRepository $employeeRepository)
    {
        $this->employeeRepository = $employeeRepository;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $employees = $this->employeeRepository->getAll($request);

        return $this->responseSuccess([
            'employees' => $employees,
        ], 'Employees List Successfully!');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\EmployeeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(EmployeeRequest $request)
    {
        $data = $this->employeeRepository->create($request);

        if (!$data['status']) {
            return $this->responseError($data, $data['message']);
        }

        return $this->responseSuccess($data, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\EmployeeRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(EmployeeRequest $request, $id)
    {
        $response = $this->employeeRepository->update($request, $id);
        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }
        return $this->responseSuccess($response, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->employeeRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
