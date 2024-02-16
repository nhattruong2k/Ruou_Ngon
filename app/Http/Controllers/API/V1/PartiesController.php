<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Repositories\CustomerCareRepository;
use App\Repositories\PartyTypeRepository;
use Illuminate\Http\Request;
use App\Repositories\PartiesRepository;
use App\Http\Requests\CustomerRequest;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\Parties\PartiesRequest;

class PartiesController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $partiesRepository;
    protected $partyTypeRepository;
    protected $customerCareRepository;

    public function __construct(
        PartiesRepository      $partiesRepository,
        PartyTypeRepository    $partyTypeRepository,
        CustomerCareRepository $customerCareRepository
    ) {
        $this->partiesRepository = $partiesRepository;
        $this->partyTypeRepository = $partyTypeRepository;
        $this->customerCareRepository = $customerCareRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'parties' => $this->partiesRepository->getAll($request),
            'partyTypes' => $this->partyTypeRepository->getAll(),
        ], 'Customers List Successfully !');
    }

    public function getAllPartiesNotExistFlt()
    {
        return $this->responseSuccess([
            'parties' => $this->partiesRepository->getAllPartiesNotExistFlt()
        ], 'Parties List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(PartiesRequest $request)
    {
        $parties = $this->partiesRepository->create($request);


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
    public function update(PartiesRequest $request, $id)
    {
        $parties = $this->partiesRepository->update($request, $id);

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
        $response = $this->partiesRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function getPartiesByEmployee(Request $request): JsonResponse
    {
        $response = $this->partiesRepository->getPartiesByEmployee($request);

        return $this->responseSuccess($response, 'Customers List Successfully !');
    }

    public function getDebtCurrentByParty($party_id)
    {
        $debtCurrent = $this->partiesRepository->getDebtCurrentByParty($party_id);
        $orderSample = $this->partiesRepository->getOrderSampleByParty($party_id);

        return $this->responseSuccess([
            'debtCurrent' => $debtCurrent,
            'orderSample' => $orderSample,
        ], 'Successfully !');
    }

    public function getPartyById($party_id)
    {
        $response = $this->partiesRepository->getPartyById($party_id);

        return $this->responseSuccess($response, 'Get Party Successfully !');
    }
}
