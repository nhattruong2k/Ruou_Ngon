<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PartiesType\PartiesTypeRequest;
use App\Repositories\PartyTypeRepository;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class PartyTypesController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $partyTypeRepository;

    public function __construct(
        PartyTypeRepository $partyTypeRepository,
    ) {
        $this->partyTypeRepository = $partyTypeRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'partyTypes' => $this->partyTypeRepository->getAll($request),
        ], 'partyTypes List Successfully !');
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PartiesTypeRequest $request)
    {
        $partyTypes = $this->partyTypeRepository->create($request);

        return $this->responseSuccess($partyTypes, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(PartiesTypeRequest $request, $id)
    {
        $partyTypes = $this->partyTypeRepository->update($request, $id);

        return $this->responseSuccess($partyTypes, 'Update model success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->partyTypeRepository->removeItems($request);

        return $this->responseSuccess($response, 'Remove item success!');
    }


    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
}
