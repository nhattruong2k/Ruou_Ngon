<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'payments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'function_id',
        'order_id',
        'payment_method_id',
        'party_id',
        'code',
        'date',
        'amount',
        'total_amount',
        'description',
        'customer_signature',
        'receiver',
        'comment',
        'payment_status_id',
        'attachment'
    ];

    public $timestamps = false;

    public function paymentItems()
    {
        return $this->hasMany(PaymentItem::class);
    }

    public function paymentOldDebts()
    {
        return $this->hasMany(PaymentOldDebt::class);
    }

    public function paymentStatus()
    {
        return $this->belongsTo(PaymentStatus::class);
    }

    public function party()
    {
        return $this->belongsTo(Parties::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'receiver');
    }

    public static function generateCode($functionId, $date, $functionAbbreviation, $wareHouseId = null)
    {
        $year = $date ? Carbon::parse($date)->format('Y') : Carbon::now()->format('Y');

        $month = $date ? Carbon::parse($date)->format('m') : Carbon::now()->format('m');

        $yearAndMonthFormat = Carbon::parse($date)->format('y').$month;

        $total = self::withTrashed()->where('function_id', $functionId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->count();
        $number = str_pad($total + 1, 4, '0', STR_PAD_LEFT);

        return "{$functionAbbreviation}{$yearAndMonthFormat}-{$number}";
    }
}
