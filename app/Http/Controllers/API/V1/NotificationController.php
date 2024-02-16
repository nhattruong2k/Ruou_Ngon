<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Repositories\NotificationRepository;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    use ResponseTrait;

    protected $notificationRepository;

    public function __construct(
        NotificationRepository $notificationRepository
    ) {
        $this->notificationRepository = $notificationRepository;
    }

    public function index(Request $request): JsonResponse
    {
        return $this->responseSuccess([
            'notifications' => $this->notificationRepository->getAll($request),
            'countNotiNotViewed' => $this->notificationRepository->countNotiNotViewed($request),
            'totalNoti' => Notification::where('user_id', Auth::user()->id)->count(),
        ], 'Notification List Successfully !');
    }

    public function seenNoti(Request $request)
    {
        $response = $this->notificationRepository->seenNoti($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Update success!');
    }
}
