<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogInternalOrg extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'blog_id',
        'internal_org_id',
    ];

    public function internalOrg()
    {
        return $this->belongsTo(InternalOrg::class);
    }

    protected $table = 'blog_internal_orgs';
}
