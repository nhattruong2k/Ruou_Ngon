<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Functions extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'functions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'function_type_id',
        'parent_id',
        'name'
    ];

    public function setting()
    {
        return $this->hasOne(SettingModel::class, 'function_id');
    }

    public function orders()
    {
        return $this->hasOne(Order::class, 'function_id');
    }
}
