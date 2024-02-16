<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use App\Models\UnitOfMeasure;
use Illuminate\Http\JsonResponse;

class UnitOfMeasureController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    public function __construct()
    {
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $unitOfMeasures = UnitOfMeasure::get();
        
        return $this->responseSuccess([
            'unitOfMeasures' => $unitOfMeasures
        ], 'unitOfMeasures List Successfully !');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CustomerRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $unitOfMeasure = UnitOfMeasure::create($request->all());

        return $this->responseSuccess($unitOfMeasure, 'Create item success!');
    }
}
