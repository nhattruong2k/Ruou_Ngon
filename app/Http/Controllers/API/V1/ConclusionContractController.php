<?php

namespace App\Http\Controllers\API\V1;


use App\Repositories\ConclusionContractRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class ConclusionContractController extends Controller
{

    use ResponseTrait;
    protected $conclusionContractRepository;

    public function __construct(ConclusionContractRepository $conclusionContractRepository)
    {
        $this->conclusionContractRepository = $conclusionContractRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'contracts' => $this->conclusionContractRepository->getAll($request),
        ], 'List Successfully !');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $this->conclusionContractRepository->create($request);

        if (!$data['status']) {
            return $this->responseError($data, $data['message']);
        }

        return $this->responseSuccess($data, 'Create item success!');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id): JsonResponse
    {
        return $this->responseSuccess([
            'conclusionContractSample' => $this->conclusionContractRepository->getById($id),
        ], 'Tagert Sample Successfully !');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
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
        $data = $this->conclusionContractRepository->update($request, $id);

        if (empty($data['status'])) {
            return $this->responseError($data, $data['message']);
        }

        return $this->responseSuccess($data, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function removeItems(Request $request)
    {
        $response = $this->conclusionContractRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
