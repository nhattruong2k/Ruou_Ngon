<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConclusionContract extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contracts';
    protected $dates = ['deleted_at'];

    protected $fillable = [
        'party_id',
        'type_id',
        'date',
        'amount',
        'code',
        'comment',
        'attachment',
        'created_by',
        'updated_by',
        'status_id',
        'created_by',
        'update_by',
        'finish_day'
    ];

    public $timestamps = true;

    public function party()
    {
        return $this->belongsTo(Parties::class, 'party_id');
    }

    public function orderStatus()
    {
        return $this->belongsTo(OrderStatus::class, 'status_id', 'id');
    }

    public function contractGoods()
    {
        return $this->hasMany(ContractGoods::class, 'contract_id', 'id');
    }

    public static function generateCode($date, $functionAbbreviation)
    {
        $year = $date ? Carbon::parse($date)->format('Y') : Carbon::now()->format('Y');

        $month = $date ? Carbon::parse($date)->format('m') : Carbon::now()->format('m');

        $yearAndMonthFormat = Carbon::parse($date)->format('y').$month;

        $total = self::withTrashed()
            ->whereYear('date', $year)
            ->whereMonth('date', $month);
        
        $total = $total->count();
        $number = str_pad($total + 1, 4, '0', STR_PAD_LEFT);

        return "{$functionAbbreviation}{$yearAndMonthFormat}-{$number}";
    }
}
