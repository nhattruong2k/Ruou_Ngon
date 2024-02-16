<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItemSample extends Model
{
    use HasFactory;

    protected $table = 'order_item_samples';

    protected $fillable = [
        'good_id',
        'order_sample_id',
        'discount',
        'percent_discount'
    ];

    public $timestamps = true;

    public function good()
    {
        return $this->belongsTo(Good::class);
    }
}
