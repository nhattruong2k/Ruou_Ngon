<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentItem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payment_items';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payment_id',
        'order_id',
        'amount',
        'description',
        'created_at',
        'modified_at'
    ];

    public $timestamps = false;

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
