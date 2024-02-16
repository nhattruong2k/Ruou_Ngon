<?php

namespace App\Models;

use App\Models\CustomerCareType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class FileManagement extends Model
{
    use HasFactory;

    protected $table = 'file_managements';

    protected $fillable = [
        'parent_id',
        'name',
        'path',
        'type',
        'created_at',
        'created_by'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
