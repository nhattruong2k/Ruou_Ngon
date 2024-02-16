<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderSample extends Model
{
    use HasFactory;

    protected $table = 'order_samples';

    protected $fillable = [
        'party_id',
        'comment',
    ];

    public $timestamps = true;


    public function orderItemSamples()
    {
        return $this->hasMany(OrderItemSample::class);
    }

    public function party()
    {
        return $this->belongsTo(Parties::class);
    }
}
