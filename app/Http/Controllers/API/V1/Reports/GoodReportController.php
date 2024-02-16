<?php

namespace App\Http\Controllers\API\V1\Reports;

use App\Http\Controllers\Controller;
use App\Repositories\Reports\GoodReportRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GoodReportController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $goodReportRepository;

    public function __construct(GoodReportRepository $goodReportRepository)
    {
        $this->goodReportRepository = $goodReportRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'report' => $this->goodReportRepository->getAll($request)
        ], 'good report list successfully!');
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function reportGood(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'reportProduct' => $this->goodReportRepository->reportGood($request)
        ], 'Good report list success!');
    }
}
