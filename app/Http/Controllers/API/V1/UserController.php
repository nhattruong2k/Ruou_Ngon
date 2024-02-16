<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userRepository->getAll($request);

        return $this->responseSuccess([
            'users' => $users
        ], 'Users List Successfully!');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  Request  $request
     * @return Response
     */
    public function store(Request $request)
    {
        $data = $this->userRepository->create($request);

        return $this->responseSuccess($data, 'Create item success!');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function update(Request $request, $id)
    {
        $data = $this->userRepository->update($request, $id);

        return $this->responseSuccess($data, 'Update item success!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        //
    }

    public function updatePassword(Request $request)
    {
        $data = $this->userRepository->updatePassword($request);

        return $this->responseSuccess($data, 'Update password success');
    }

    public function verifyEmailResetPassword(Request $request)
    {
        $data = $this->userRepository->verifyEmailResetPassword($request);

        return $this->responseSuccess($data, 'Send email success');
    }

    public function resetPassword(Request $request)
    {
        $data = $this->userRepository->resetPassword($request);

        return $this->responseSuccess($data, 'Reset password success');
    }
}
