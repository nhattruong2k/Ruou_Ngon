<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tagert extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tagerts';

    protected $fillable = [
        'month',
        'created_by',
        'update_by',
        'created_at',
        'updated_at',
    ];

    public $timestamps = true;

    public function tagertUsers()
    {
        return $this->hasMany(TagertUser::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTotalTargetAttribute()
    {
        return $this->tagertUsers()->sum('tagerts');
    }
}
