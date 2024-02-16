<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContractGoods extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'contract_goods';
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'contract_id',
        'good_id',
        'quantity',
        'quantity_monthly',
    ];

    public function contract()
    {
        return $this->belongsTo(ConclusionContract::class, 'contract_id');
    }

    public function good()
    {
        return $this->belongsTo(Good::class, 'good_id');
    }
}
