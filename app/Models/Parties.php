<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Parties extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'parties';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'party_type_id',
        'consultant_id',
        'name',
        'code',
        'sex',
        'date_of_birth',
        'phone',
        'address',
        'email',
        'ward_id',
        'district_id',
        'province_id',
        'photo',
        'debt_limit',
        'discount_rate',
        'note',
        'created_by',
        'updated_by',
        'tin',
        'percent',
        'attachment',
        'attachment_note',
        'max_debt_date',
        'old_debt'
    ];

    public $timestamps = true;

    // protected $appends = [
    //     'debt_current',
    //     'remain_price',
    // ];

    private $remainPrice;

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function partyType()
    {
        return $this->belongsTo(PartyType::class);
    }

    public function customerCares()
    {
        return $this->hasMany(CustomerCare::class, 'party_id');
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'consultant_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'party_id');
    }

    public function conclusionContract()
    {
        return $this->hasMany(ConclusionContract::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'party_id');
    }

    public function orderSample()
    {
        return $this->hasOne(OrderSample::class, 'party_id');
    }

    public function paymentOldDebts()
    {
        return $this->hasMany(PaymentOldDebt::class, 'party_id');
    }

    public function getDebtCurrentAttribute()
    {
        return (float) $this->debt_limit - $this->getRemainPrice();
    }

    public function getRemainPriceAttribute()
    {
        return $this->getRemainPrice();
    }

    public function getRemainPrice()
    {
        if (!$this->remainPrice) {

            $totalOrder = $this->orders->sum('total_price');
            $totalPayment = 0;

            foreach ($this->orders as $order) {
                $totalPayment += $order->paymentItems->sum('amount');
            }

            $this->remainPrice = $totalOrder - $totalPayment;
        }

        return $this->remainPrice;
    }

    public function getDueDebtAttribute()
    {
        $totalUndueDebt = 0;
        $totalOverdueDebt = 0;
        $totalDoubtfulDebt = 0;

        foreach ($this->orders as $order) {
            $dateCreateOrder = Carbon::parse($order->date)->addDays($order->date_debt);
            $dateDoubtfulOrder = Carbon::parse($order->date)->addDays($this->max_debt_date);
            $debt = $order->total_price - $order->paymentItems->sum('amount');

            if ($dateCreateOrder->gte(Carbon::now())) {
                $totalUndueDebt += $debt;
            } else {
                if ($dateDoubtfulOrder->lte(Carbon::now())) {
                    $totalDoubtfulDebt += $debt;
                } else {
                    $totalOverdueDebt += $debt;
                }
            }
        }

        return [
            'undue_debt' => $totalUndueDebt,
            'overdue_debt' => $totalOverdueDebt,
            'doubtful_debt' => $totalDoubtfulDebt
        ];
    }

    public function getTotalOrderByPartyAttribute()
    {
        $totalOrder = $this->orders->sum('total_price');
        return $totalOrder;
    }

    public function getTotalPaymentByPartyAttribute()
    {
        $totalPayment = 0;
        foreach ($this->orders as $order) {
            $totalPayment += $order->paymentItems->sum('amount');
        }
        return $totalPayment;
    }

    public function getTotalOrderSalesByPartyAttribute()
    {
        $totalOrder = $this->orders->where('function_id', config('contants.functions.sale_receipt'))->sum('total_price');
        return $totalOrder;
    }

    public function getTotalOrderGiftByPartyAttribute()
    {
        $totalGift = $this->orders->where('function_id', config('contants.functions.gift'))->sum('total_price_gift');
        return $totalGift;
    }

    public function getTotalPriceAttribute()
    {
        return $this->paymentOldDebts->sum('amount');
    }

    public function getIsPaymentAttribute()
    {
        return $this->paymentOldDebts()->whereHas('payment', function ($query) {
            return $query->whereIn('payment_status_id',
                [config('contants.payment_status.approved'), config('contants.payment_status.pending')]);
        })->exists();
    }
}
