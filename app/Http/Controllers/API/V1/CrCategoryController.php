<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\CategoryRequest;
use App\Repositories\OrderTypeRepository;
use App\Repositories\WorkCategoryRepository;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Repositories\CustomerCareTypeRepository;

class CrCategoryController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $customerCareTypeRepository;
    protected $workCategoryRepository;
    protected $orderTypeRepository;

    public function __construct(
        CustomerCareTypeRepository $customerCareTypeRepository,
        WorkCategoryRepository     $workCategoryRepository,
        OrderTypeRepository        $orderTypeRepository
    ) {
        $this->customerCareTypeRepository = $customerCareTypeRepository;
        $this->workCategoryRepository = $workCategoryRepository;
        $this->orderTypeRepository = $orderTypeRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'customerCareTypes' => $this->customerCareTypeRepository->getAll($request),
            'workCategories' => $this->workCategoryRepository->getAll($request),
            'orderTypes' => $this->orderTypeRepository->getAll($request)
        ], 'CR category List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\CategoryRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CategoryRequest $request)
    {
        $currentCategory = $request->get('currentTab');

        switch ($currentCategory) {
            case 'care':
                $data = $this->customerCareTypeRepository->create($request);
                break;
            case 'work':
                $data = $this->workCategoryRepository->create($request);
                break;
            case 'orderType':
                $data = $this->orderTypeRepository->create($request);
                break;

            default:
                break;
        }

        return $this->responseSuccess($data, 'Create item success!');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\CustomerCareRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function update(CategoryRequest $request, $id)
    {
        $currentCategory = $request->get('currentTab');

        switch ($currentCategory) {
            case 'care':
                $data = $this->customerCareTypeRepository->update($request, $id);
                break;
            case 'work':
                $data = $this->workCategoryRepository->update($request, $id);
                break;
            case 'orderType':
                $data = $this->orderTypeRepository->update($request, $id);
                break;

            default:
                break;
        }

        return $this->responseSuccess($data, 'Create item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $currentCategory = $request->get('currentTab');

        switch ($currentCategory) {
            case 'care':
                $response = $this->customerCareTypeRepository->removeItems($request);
                break;
            case 'work':
                $response = $this->workCategoryRepository->removeItems($request);
                break;
            case 'orderType':
                $response = $this->orderTypeRepository->removeItems($request);
                break;

            default:
                break;
        }


        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
