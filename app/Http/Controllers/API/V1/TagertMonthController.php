<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TagertMonth\TagertMonthRequest;
use App\Repositories\TagertMonthRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagertMonthController extends Controller
{
    use ResponseTrait;

    protected $tagertMonthRepository;

    public function __construct(TagertMonthRepository $tagertMonthRepository)
    {
        $this->tagertMonthRepository = $tagertMonthRepository;
    }

    public function index(Request $request): JsonResponse
    {
        $tagerts = $this->tagertMonthRepository->getAll($request);
        return $this->responseSuccess([
            'tagerts' => $tagerts
        ], 'Customer List Successfully !');
    }

    public function store(Request $request)
    {
        $data = $this->tagertMonthRepository->create($request);

        if (!$data['status']) {
            return $this->responseError($data, $data['message']);
        }

        return $this->responseSuccess($data, 'Create item success!');
    }

    public function show(Request $request, $id): JsonResponse
    {
        return $this->responseSuccess([
            'tagertsSample' => $this->tagertMonthRepository->getById($id),
        ], 'Tagert Sample Successfully !');
    }


    public function update(Request $request, $id)
    {
        $tagerts = $this->tagertMonthRepository->update($request, $id);

        if (empty($tagerts['status'])) {
            return $this->responseError($tagerts, $tagerts['message']);
        }

        return $this->responseSuccess($tagerts, 'Update item success!');
    }

    public function destroy(Request $request, $id)
    {
        $response = $this->tagertMonthRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
