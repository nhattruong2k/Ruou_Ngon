<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'order_items';
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'warehouse_id',
        'good_id',
        'cost',
        'price',
        'quantity',
        'percent_discount',
        'adjustment_amount',
        'discount',
        'credit_account_id',
        'debit_account_id',
        'inventory_debit_account_id',
        'inventory_credit_account_id',
        'vat_rate',
        'technician_id',
        'container_number',
        'consultant_id',
        'technician_id',
        'comment',
        'vat_rate',
        'refunded',
        'guarantee_id',
        'consultant_id',
        'party_id',
        'refunded',
        'created_by'
    ];

    protected $appends = ['total_good'];

    public function consultant()
    {
        return $this->hasOne(User::class, 'id', 'consultant_id');
    }

    public function internalOrg()
    {
        return $this->belongsTo(InternalOrg::class, 'warehouse_id', 'id');
    }

    public function productStatus()
    {
        return $this->hasOne(ProductStatus::class, 'id', 'product_status_id');
    }

    public function good()
    {
        return $this->belongsTo(Good::class);
    }

    public function getTotalGoodAttribute()
    {
        $orderItem = $this;
        $priceGood = $orderItem->price;
        $vat =   empty($orderItem->vat_rate) ? 0 : $orderItem->vat_rate;
        $coefficient = empty($orderItem->percent_discount) ? 0 : $orderItem->percent_discount;
        $quantity = $orderItem->quantity;
        $total = $priceGood * $quantity - ($priceGood * $quantity * $coefficient) / 100 + ($priceGood * $quantity * $vat) / 100;
        return $total;
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }
}
