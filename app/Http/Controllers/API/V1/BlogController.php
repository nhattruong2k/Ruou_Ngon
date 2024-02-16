<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Repositories\BlogRepository;
use Illuminate\Http\JsonResponse;
use App\Traits\ResponseTrait;

class BlogController extends Controller
{
    use ResponseTrait;
    //
    protected $blogRepository;
    public function __construct(BlogRepository $blogRepository)
    {
        $this->blogRepository = $blogRepository;
    }

    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'blogs' => $this->blogRepository->getAll($request)
        ], 'Blogs List Successfully !');
    }

    public function store(Request $request)
    {
        $blog = $this->blogRepository->create($request);

        if (!$blog['status']) {
            return $this->responseError($blog, 'Create item fail!');
        }

        return $this->responseSuccess($blog, 'Create item success!');
    }

    public function getBlogById($blog_id)
    {
        $response = $this->blogRepository->getBlogById($blog_id);

        return $this->responseSuccess($response, 'Get Blog Successfully !');
    }

    public function update(Request $request, $id)
    {
        $response = $this->blogRepository->update($request, $id);
        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }
        return $this->responseSuccess($response, 'Update model success!');
    }

    public function destroy(Request $request)
    {
        $response = $this->blogRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }

    public function removeFile(Request $request, $id)
    {
        $response = $this->blogRepository->removeFile($request, $id);

        return $this->responseSuccess($response, 'Remove file success!');
    }
}
