<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'orders';
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'function_id',
        'order_status_id',
        'party_id',
        'reference_id',
        'date',
        'code',
        'comment',
        'created_by',
        'updated_by',
        'date_debt',
        'order_sample_id',
        'vat_rate'
    ];

    // protected $appends = [
    //     'total_item_good',
    //     'total_item_good_price',
    //     'warehouse',
    //     'total_quantity',
    //     'total_price',
    // ];

    protected static function boot()
    {
        parent::boot();
        static::deleting(function ($order) {
            $order->orderItems()->delete();
        });
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function function ()
    {
        return $this->belongsTo(Functions::class);
    }

    public function getWarehouseAttribute()
    {
        if (empty($this->orderItems[0]->internalOrg)) {
            return null;
        }
        return [
            'id' => !empty($this->orderItems[0]) ? $this->orderItems[0]->internalOrg->id : null,
            'name' => !empty($this->orderItems[0]) ? $this->orderItems[0]->internalOrg->name : null,
            'address' => !empty($this->orderItems[0]) ? $this->orderItems[0]->internalOrg?->address : null,
            'ward' => !empty($this->orderItems[0]) ? $this->orderItems[0]->internalOrg?->ward?->name : null,
            'province' => !empty($this->orderItems[0]) ? $this->orderItems[0]->internalOrg?->province?->name : null,
            'district' => !empty($this->orderItems[0]) ? $this->orderItems[0]->internalOrg?->district?->name : null,
        ];
    }

    public function party()
    {
        return $this->belongsTo(Parties::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'id', 'created_by');
    }

    public function orderReference()
    {
        return $this->belongsTo(Order::class, 'reference_id');
    }

    public function getTotalItemGoodAttribute()
    {
        if (!count($this->orderItems)) {
            return 0;
        }

        $total = 0;
        foreach ($this->orderItems as $item) {
            $total += $item->quantity;
        }

        return $total;
    }

    public function orderStatus()
    {
        return $this->belongsTo(OrderStatus::class, 'order_status_id', 'id');
    }

    public function getTotalItemGoodPriceAttribute()
    {
        if (!count($this->orderItems)) {
            return 0;
        }

        $total = 0;
        foreach ($this->orderItems as $item) {
            $total += $item->price;
        }

        return $total;
    }

    public static function getTotalByFunction($function)
    {
        return self::where('function_id', config('contants.function_types.'.$function))->count();
    }

    public static function generateCode($functionId, $date, $functionAbbreviation, $wareHouseId = null)
    {
        $year = $date ? Carbon::parse($date)->format('Y') : Carbon::now()->format('Y');

        $month = $date ? Carbon::parse($date)->format('m') : Carbon::now()->format('m');

        $yearAndMonthFormat = Carbon::parse($date)->format('y').$month;

        // if ($wareHouseId) {
        //     $warehouse = InternalOrg::findOrFail($wareHouseId, ['code']);
        // } else {
        //     $warehouse = (new User)->getMe()->employee->employments[0]->department;
        // }

        $total = self::withTrashed()->where('function_id', $functionId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month);
        if ($functionId === 3) {
            $total = $total->whereNotNull('code');
        }
        $total = $total->count();
        $number = str_pad($total + 1, 4, '0', STR_PAD_LEFT);

        return "{$functionAbbreviation}{$yearAndMonthFormat}-{$number}";
    }

    public function getTotalQuantityAttribute()
    {
        if (!count($this->orderItems)) {
            return 0;
        }
        $total = $this->orderItems->sum('quantity');
        return $total;
    }

    public function orderChildReference()
    {
        return $this->belongsTo(Order::class, 'id', 'reference_id');
    }

    public function getTotalPriceAttribute()
    {
        if (!count($this->orderItems)) {
            return 0;
        }

        $total = $this->orderItems->sum(function ($item) {
            $vat = empty($item->vat_rate) ? 0 : $item->vat_rate;
            $discount = empty($item->discount) ? 0 : $item->discount;
            $totalGood = $item->price * $item->quantity;
            $totalVat = ($totalGood * $vat) / 100;
            return $totalGood + $totalVat - ($totalGood - ($discount * $item->quantity));
        });

        return $total;
    }

    public function orderOrderStatuses()
    {
        return $this->hasMany(OrderOrderStatus::class);
    }

    public function payment()
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentItems()
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function giftItems()
    {
        return $this->hasMany(GiftItem::class);
    }

    public function getTotalPriceGiftAttribute()
    {
        $priceOrderItems = 0;
        $priceOrderGifts = 0;

        if (count($this->orderItems)) {
            $priceOrderItems = $this->orderItems->sum(function ($item) {
                $discount = empty($item->discount) ? 0 : $item->discount;
                return $discount * $item->quantity;
            });
        }

        if (count($this->giftItems)) {
            $priceOrderGifts = $this->giftItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });
        }

        return $priceOrderItems + $priceOrderGifts;
    }

    public function getInfoDebtAttribute()
    {
        $totalUndueDebt = 0;
        $totalOverdueDebt = 0;
        $overdueDate = 0;
        $totalDoubtfulDebt = 0;

        $dateCreateOrder = Carbon::parse($this->date)->addDays($this->date_debt);
        $parseEndDate = Carbon::parse($this->filter_end_date);
        $dateDoubtfulOrder = Carbon::parse($this->date)->addDays($this->party->max_debt_date);
        $remainPrice = $this->total_price - $this->paymentItems->sum('amount');

        if ($dateCreateOrder->gte($parseEndDate)) {
            $totalUndueDebt = $remainPrice;
        } else {
            if ($dateDoubtfulOrder->lte($parseEndDate)) {
                $totalDoubtfulDebt += $remainPrice;
            } else {
                $totalOverdueDebt += $remainPrice;
            }

            $overdueDate = $dateCreateOrder->diffInDays($parseEndDate) + 1;
        }

        return [
            'undue_debt' => $totalUndueDebt,
            'overdue_debt' => $totalOverdueDebt,
            'overdue_date' => $overdueDate,
            'doubtful_debt' => $totalDoubtfulDebt
        ];
    }

    public function getStatusOrderAfterExportAttribute()
    {
        $id = $this->id;

        $paid = false;

        $statusPaid = $this->orderOrderStatuses()
            ->where('order_id', $id)
            ->where('order_status_id', config('contants.order_status.success_payment'))
            ->exists();
        $totalPayment = $this->paymentItems->sum('amount');
        $totalPrice = $this->total_price;

        if ($totalPayment == $totalPrice || $statusPaid || $totalPrice == 0) {
            $paid = true;
        }

        $refunded = $this->orderOrderStatuses()
            ->where('order_id', $id)
            ->where('order_status_id', config('contants.order_status.refund_sale_receipt'))
            ->exists();

        return [
            'paid' => $paid,
            'refunded' => $refunded
        ];
    }
}
