<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Repositories\GoodBrandRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class GoodBrandController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $goodBrandRepository;

    public function __construct(GoodBrandRepository $goodBrandRepository)
    {
        $this->goodBrandRepository = $goodBrandRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $goodBrands = $this->goodBrandRepository->getAll($request);

        return $this->responseSuccess([
            'goodBrands' => $goodBrands
        ], 'goodBrands List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $goodBrands = $this->goodBrandRepository->create($request);

        return $this->responseSuccess($goodBrands, 'Create item success!');
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
        $goodBrands = $this->goodBrandRepository->update($request, $id);

        return $this->responseSuccess($goodBrands, 'Update model success!');
    }

    public function removeItems(Request $request)
    {
        $goodBrands = $this->goodBrandRepository->removeItems($request);

        if (!$goodBrands['status']) {
            return $this->responseError($goodBrands, 'Remove Item fail!');
        }

        return $this->responseSuccess($goodBrands, 'Remove Item success!');
    }
}