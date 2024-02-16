<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use App\Models\Province;
use App\Models\District;
use App\Models\Ward;

class GeographicBoundaryController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'provinces' => Province::with(['districts'])->get(),
            'districts' => District::get()
        ], 'provinces List Successfully!');
    }
    
    public function getDistrictByProvinceId($id)
    {
        $districts = District::findAll(['province_id' => $id]);

        return $this->responseSuccess([
            'districts' => $districts
        ], 'districts List Successfully!');
    }

    public function getWardOfDistrict($id)
    {
        $wards = Ward::where('district_id', $id)->get();

        return $this->responseSuccess([
            'wards' => $wards
        ], 'wards List Successfully!');
    }
}
