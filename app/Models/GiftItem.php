<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GiftItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'gift_items';

    protected $fillable = [
        'order_id',
        'name',
        'quantity',
        'price',
        'created_by',
        'updated_by'
    ];
}
