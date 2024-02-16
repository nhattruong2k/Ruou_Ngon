<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Repositories\FileManagementRepository;

class FileManagementController extends Controller
{
    use ResponseTrait;

    protected $fileManagementRepository;

    public function __construct(FileManagementRepository $fileManagementRepository)
    {

        $this->fileManagementRepository = $fileManagementRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $response = $this->fileManagementRepository->getAll($request);

        return $this->responseSuccess([
            'files' => $response['data'],
            'path' => $response['path'],
        ], 'File List Successfully!');
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $response = $this->fileManagementRepository->create($request);

        if (!$response['status']) {
            return $this->responseError($response, 'Create item fail!');
        }

        return $this->responseSuccess($response, 'Create item success!');
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
        $response = $this->fileManagementRepository->update($request, $id);
        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }
        return $this->responseSuccess($response, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {

        $response = $this->fileManagementRepository->delete($id);
        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }
        return $this->responseSuccess($response, 'Remove item success!');
    }
}
