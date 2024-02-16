<?php

namespace App\Repositories;

use App\Models\Notification;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationRepository extends BaseRepository
{
    protected $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;

        parent::__construct($notification);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = $request->get('rows_per_page');

        $query = $this->notification->with([
            'order' => function ($q) {
                $q->select(['id', 'code']);
            },
            'party' => function ($q) {
                $q->select(['id', 'code']);
            },
        ])->where('user_id', Auth::user()->id);

        return $query->orderBy('created_at', 'DESC')->paginate($rowsPerPage);
    }

    public function countNotiNotViewed()
    {
        return $this->notification
            ->where('user_id', Auth::user()->id)
            ->where('is_view', config('contants.notification_status.not_viewed'))
            ->count();
    }

    public function seenNoti($request = null)
    {
        DB::beginTransaction();
        try {
            $notiId = $request->id ?? null;
            $type = $request->type ?? null;

            $query = $this->notification->where('user_id', Auth::user()->id);

            if ($type === 'read') {
                $query->where('id', $notiId)->update(['is_read' => config('contants.notification_status.read')]);
            } else {
                $query->update(['is_view' => config('contants.notification_status.viewed')]);
            }

            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'Update success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return [
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage(),
                'data' => false
            ];
        }
    }
}
