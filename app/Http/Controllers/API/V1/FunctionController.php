<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Repositories\FunctionRepository;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class FunctionController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $functionRepository;

    public function __construct(FunctionRepository $functionRepository)
    {
        $this->functionRepository = $functionRepository;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $functions = $this->functionRepository->getAll($request);

        return $this->responseSuccess([
            'data' => $functions
        ], 'functions List Successfully!');
    }
}
