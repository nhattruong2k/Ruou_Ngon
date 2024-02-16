<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyWorkCategory extends Model
{
  use HasFactory;

  protected $fillable = [
    'daily_work_id',
    'work_category_id'
  ];

  public $timestamps = false;
}
