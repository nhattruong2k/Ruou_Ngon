<?php

namespace App\Http\Controllers\API\V1;

use App\Exports\ReportEmployeeExport;
use App\Exports\ReportPartyExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use App\Repositories\ReportRepository;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $reportRepository;

    public function __construct(ReportRepository $reportRepository)
    {
        $this->reportRepository = $reportRepository;
    }

    public function getPartyReports(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'reports' => $this->reportRepository->getAllPartieReports($request),
        ], 'Report List Successfully !');
    }

    public function exportExcelPartyReports(Request $request)
    {
        $reports = $this->reportRepository->getAllPartieReports($request);

        return Excel::download(new ReportPartyExport($reports), 'export_party.xlsx');
    }

    public function getEmployeeReports(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'reports' => $this->reportRepository->getAllEmployeeReports($request),
        ], 'Report List Successfully !');
    }

    public function exportExcelEmployeeReports(Request $request)
    {
        $reports = $this->reportRepository->getAllEmployeeReports($request);

        return Excel::download(new ReportEmployeeExport($reports), 'export_employee.xlsx');
    }
}
