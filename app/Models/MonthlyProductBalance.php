<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyProductBalance extends Model
{
    use HasFactory;

    protected $table = 'monthly_product_balances';

    public $timestamps = false;

    protected $fillable = [
        'productable_type',
        'productable_id',
        'organization_id',
        'year_month',
        'opening_quantity',
        'closing_quantity',
        'inward_quantity',
        'outward_quantity',
    ];
}
