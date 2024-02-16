<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogEmployee extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'blog_id',
        'employee_id',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class);
    }

    protected $table = 'blog_employees';
}
