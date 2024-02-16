<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Repositories\GoodCategoryRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class GoodCategoryController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $goodCategoryRepository;

    public function __construct(GoodCategoryRepository $goodCategoryRepository)
    {
        $this->goodCategoryRepository = $goodCategoryRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $goodCategories = $this->goodCategoryRepository->getAll($request);

        return $this->responseSuccess([
            'goodCategories' => $goodCategories
        ], 'Good categories List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $goodCategory = $this->goodCategoryRepository->create($request);

        if (!$goodCategory['data']) {
            return $this->responseError($goodCategory, 'Create item fail');
        }

        return $this->responseSuccess($goodCategory, 'Create item success!');
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
        $goodCategory = $this->goodCategoryRepository->update($request, $id);

        return $this->responseSuccess($goodCategory, 'Update model success!');
    }
    
    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->goodCategoryRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
