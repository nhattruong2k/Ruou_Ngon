<?php

namespace App\Models;

use App\Models\Tagert;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class TagertUser extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tagert_users';

    protected $fillable = [
        'tagert_id',
        'user_id',
        'tagerts',
        'created_at',
        'updated_at',
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function tagert(){
        return $this->belongsTo(Tagert::class,'tagert_id');
    }
}