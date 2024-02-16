<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SettingModel extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'settings';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'properties',
        'function_id',
        'comment',
    ];

    public $timestamps = false;

    public function function()
    {
        return $this->belongsTo(Functions::class);
    }

    public function getPropertiesAttribute($value)
    {
        return json_decode($value, true);
    }
}
