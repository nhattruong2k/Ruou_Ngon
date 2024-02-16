<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role as RoleModelSpatie;

class Role extends RoleModelSpatie
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'roles';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'guard_name',
        'day_restriction',
        'creator_restriction_flag'
    ];

    public $timestamps = true;

    public $guard_name = 'api';

    public function permistions()
    {
        return $this->belongsToMany(Permistion::class, 'role_has_permissions', 'role_id', 'permission_id');
    }
}
