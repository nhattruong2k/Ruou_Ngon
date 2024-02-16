<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyWork extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'employee_id',
    'date',
    'orther_work'
  ];

  public $timestamps = false;

  public function employee()
  {
    return $this->belongsTo(User::class, 'employee_id');
  }

  public function workCategories()
  {
    return $this->belongsToMany(WorkCategory::class, 'daily_work_categories', 'daily_work_id', 'work_category_id');
  }
}
