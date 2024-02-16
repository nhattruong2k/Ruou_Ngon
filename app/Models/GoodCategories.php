<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GoodCategories extends Model
{
    use HasFactory;
    use SoftDeletes;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'good_categories';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'code',
        'comment',
        'parent_id',
        'created_at',
        'updated_at'
    ];

    public function goodCategory()
    {
        return $this->belongsTo(GoodCategories::class, 'parent_id');
    }

    // public function goodGroup()
    // {
    //     return $this->belongsTo(GoodGroup::class);
    // }

    public function goods()
    {
        return $this->hasMany(Good::class);
    }

    public function children()
    {
        return $this->hasMany(GoodCategories::class, 'parent_id', 'id');
    }

    public function categoriesByGoods()
    {
        return $this->hasMany(Good::class, 'good_category_id');
    }

    public function goodCategoryParent()
    {
        return $this->belongsTo(GoodCategories::class, 'parent_id', 'id');
    }
}
