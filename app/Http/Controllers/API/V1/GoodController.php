<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\GoodRequest;
use App\Models\UnitOfMeasure;
use Illuminate\Http\Request;
use App\Repositories\GoodRepository;
use App\Repositories\GoodBrandRepository;
use App\Repositories\GoodCategoryRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class GoodController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $goodRepository;
    protected $goodBrandRepository;
    protected $goodCategoryRepository;

    public function __construct(
        GoodRepository $goodRepository,
        GoodBrandRepository $goodBrandRepository,
        GoodCategoryRepository $goodCategoryRepository
    ) {
        $this->goodRepository = $goodRepository;
        $this->goodBrandRepository = $goodBrandRepository;
        $this->goodCategoryRepository = $goodCategoryRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'goods' => $this->goodRepository->getAll($request),
            'goodBrands' => $this->goodBrandRepository->getAll($request),
            'goodCategories' => $this->goodCategoryRepository->getAll(),
            'unitOfMeasures' => UnitOfMeasure::get()
        ], 'Goods List Successfully !');
    }

        /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGoodByCategory(Request $request): JsonResponse
    {
        $goodCategory = $this->goodRepository->getGoodByCategory($request);

        return $this->responseSuccess($goodCategory, 'Good by goodCategory list success!');
    }

    public function getAllGoodOthers()
    {
        return $this->responseSuccess([
            'goods' => $this->goodRepository->getAllGoodOthers()
        ], 'Goods List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(GoodRequest $request)
    {
        $good = $this->goodRepository->create($request);

        if (!$good['status']) {
            return $this->responseError($good, 'Create item fail!');
        }

        return $this->responseSuccess($good, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(GoodRequest $request, $id)
    {
        $good = $this->goodRepository->update($request, $id);
        return $this->responseSuccess($good, 'Update model success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->goodRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
