<?php

namespace App\Http\Controllers\API\V1;

use App\Models\DailyWork;
use App\Models\WorkCategory;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use App\Exports\WorkDailiesExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Repositories\DailyWorkRepository;
use App\Repositories\AccountantRepository;

class DailyWorkController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $dailyWorkRepository;

    public function __construct(DailyWorkRepository $dailyWorkRepository)
    {
        $this->dailyWorkRepository = $dailyWorkRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Respmysqlonse
     */
    public function index(Request $request): JsonResponse
    {
        $dailyWork = $this->dailyWorkRepository->getAll($request);

        return $this->responseSuccess([
            'dailyWorks' => $dailyWork,
            'workCategories' => WorkCategory::all(),
        ], 'List daily work success!');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $response = $this->dailyWorkRepository->create($request);

        if (!($response['data'])) {
            return $this->responseError($response, $response['message']);
        }

        return $this->responseSuccess($response, 'Create item success');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $response = $this->dailyWorkRepository->update($request, $id);
        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }
        return $this->responseSuccess($response, 'Update item success!');
    }

    /**
     * Remove the mutiple resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function exportExcel(Request $request)
    {
        $dailyWork = $this->dailyWorkRepository->getAll($request);
        return Excel::download(new WorkDailiesExport($dailyWork), 'export.xlsx');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->dailyWorkRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
