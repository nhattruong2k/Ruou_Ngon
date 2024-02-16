<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Repositories\GoodSubstituteRepository;
use App\Traits\ResponseTrait;
use Exception;
use Illuminate\Http\JsonResponse;

class GoodSubstituteController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $goodSubstituteRepository;

    public function __construct(GoodSubstituteRepository $goodSubstituteRepository)
    {
        $this->goodSubstituteRepository = $goodSubstituteRepository;
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $goodSubtitutes = $this->goodSubstituteRepository->getAll($request);

        return $this->responseSuccess([
            'goodSubtitutes' => $goodSubtitutes
        ], 'goodSubtitutes List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $goodSubtitute = $this->goodSubstituteRepository->create($request);

        return $this->responseSuccess($goodSubtitute, 'Create item success!');
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
        $goodSubtitute = $this->goodSubstituteRepository->update($request, $id);

        return $this->responseSuccess($goodSubtitute, 'Update model success!');
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
