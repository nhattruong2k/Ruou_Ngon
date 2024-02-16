<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kalnoy\Nestedset\NodeTrait;

class Organiztion extends Model
{
    use NodeTrait, HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'internal_orgs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'organization_type_id',
        'name',
        'tin',
        'slg',
        '_lgt',
        '_rgt',
        'parent_id',
        'phone',
        'address',
        'ward_id',
        'district_id',
        'province_id',
        'property',
        'email'
    ];

    public function organiztionType()
    {
        return $this->belongsTo(OrganiztionType::class, 'organization_type_id');
    }

    public function organiztion()
    {
        return $this->belongsTo(Organiztion::class, 'parent_id');
    }
}
