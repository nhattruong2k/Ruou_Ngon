<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'feature_id',
        'is_read',
        'is_view',
        'function_id'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'feature_id');
    }

    public function party(): BelongsTo
    {
        return $this->belongsTo(Parties::class, 'feature_id');
    }

    public function createNotiWhenAddNew($data)
    {
        $featureId = $data['feature_id'];
        $functionId = $data['function_id'];

        $users = User::all()->pluck('id');
        foreach ($users as $user) {
            $this->create([
                'user_id' => $user,
                'feature_id' => $featureId,
                'function_id' => $functionId,
                'is_read' => config('contants.notification_status.unread'),
                'is_view' => config('contants.notification_status.not_viewed'),
            ]);
        }
    }
}
