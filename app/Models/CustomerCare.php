<?php

namespace App\Models;

use App\Models\CustomerCareType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerCare extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'customer_cares';

    protected $fillable = [
        'date',
        'customer_care_type_id',
        'description',
        'party_id'
    ];

    public $timestamps = true;

    public function customerCareType()
    {
        return $this->belongsTo(CustomerCareType::class);
    }

    public function party()
    {
        return $this->belongsTo(Parties::class);
    }
}
