<?php

namespace App\Http\Controllers\API\V1\Reports;

use App\Http\Controllers\Controller;
use App\Repositories\Reports\DebtRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DebtController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $debtRepository;

    public function __construct(DebtRepository $debtRepository)
    {
        $this->debtRepository = $debtRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'debts' => $this->debtRepository->getAll($request)
        ], 'Debt List Successfully!');
    }

    public function show(Request $request, $id)
    {
        return $this->responseSuccess([
            'dataDebt' => $this->debtRepository->getById($request),
        ], 'Debt item Successfully!');
    }

    public function store(Request $request)
    {
        //
    }

    public function update(Request $request, $id)
    {
        //
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
}
