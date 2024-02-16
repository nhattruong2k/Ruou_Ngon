<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Screen;
use App\Repositories\PermistionRepository;
use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;

class PermistionController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $permistionRepository;

    public function __construct(PermistionRepository $permistionRepository)
    {
        $this->permistionRepository = $permistionRepository;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $permistions = $this->permistionRepository->getAll($request);

        return $this->responseSuccess([
            'permistions' => $permistions,
            'screens' => Screen::all()
        ], 'Permistions List Successfully!');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $this->permistionRepository->create($request);

        return $this->responseSuccess($data, 'Create item success!');
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
        $data = $this->permistionRepository->update($request, $id);

        return $this->responseSuccess($data, 'Update item success!');
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
