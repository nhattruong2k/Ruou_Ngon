<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Repositories\PositionRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class PositionController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $positionRepository;

    public function __construct(PositionRepository $positionRepository)
    {
        $this->positionRepository = $positionRepository;
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $postions = $this->positionRepository->getAll($request);
        
        return $this->responseSuccess([
            'positions' => $postions
        ], 'Postions List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $position = $this->positionRepository->create($request);

        return $this->responseSuccess($position, 'Create item success!');
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
        $position = $this->positionRepository->update($request, $id);

        return $this->responseSuccess($position, 'Update model success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
