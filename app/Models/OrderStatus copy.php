<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderStatus extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'order_statuses';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'status_id',
        'date',
        'created_by',
        'created_at',
    ];

    public $timestamps = true;

    public function status()
    {
        return $this->belongsTo(StatusModel::class, 'status_id');
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
