<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Repositories\DashboardRepository;
use Illuminate\Http\JsonResponse;
use App\Traits\ResponseTrait;

class DashboardController extends Controller
{
    use ResponseTrait;
    //
    protected $dashBoardRepository;
    public function __construct(DashboardRepository $dashBoardRepository)
    {
        $this->dashBoardRepository = $dashBoardRepository;
    }

    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'dashboards' => $this->dashBoardRepository->getAll($request)
        ], 'Blog List In Dashboard Successfully !');
    }

    public function getEmployeeSale(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'reports' => $this->dashBoardRepository->getRenvenueEmployee($request),
        ], 'List Successfully !');
    }

    public function getEmployeeAdmin(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'reports' => $this->dashBoardRepository->getAllEmployee($request),
        ], 'List Successfully !');
    }
}
