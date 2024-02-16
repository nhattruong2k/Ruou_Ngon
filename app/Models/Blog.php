<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Blog extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'blogs';

    protected $fillable = [
        'title',
        'description',
        'attachments',
        'created_by',
        'updated_by'
    ];
    public $timestamps = true;

    public function internalOrg()
    {
        return $this->belongsTo(InternalOrg::class);
    }

    public function blogInternalOrg()
    {
        return $this->hasMany(blogInternalOrg::class);
    }

    public function blogEmployee()
    {
        return $this->hasMany(BlogEmployee::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
