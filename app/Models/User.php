<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tymon\JWTAuth\Contracts\JWTSubject;

use function PHPUnit\Framework\at;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasRoles, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'users';
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'internal_org_id',
        'name',
        'code',
        'active_flag',
        'sex',
        'date_of_birth',
        'email',
        'phone',
        'address',
        'password',
        'username',
        'hire_date',
        'position',
        'created_by',
        'updated_by',
        'photo',
        'otp'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public $guard_name = 'api';

    public function internalOrg()
    {
        return $this->belongsTo(InternalOrg::class);
    }

    public function getMe()
    {
        return $this->with(['roles.permissions'])->find(auth()->user()->id);
    }

    public function parties()
    {
        return $this->hasMany(Parties::class, 'consultant_id', 'id');
    }

    public function tagertUsers()
    {
        return $this->hasMany(TagertUser::class, 'user_id');
    }

    public function getTotalOrderByEmployeeAttribute()
    {
        $totalOrder = $this->parties->sum('total_order_sales_by_party');
        return $totalOrder;
    }

    public function getTotalOrderGiftByEmployeeAttribute()
    {
        $totalOrder = $this->parties->sum('total_order_gift_by_party');
        return $totalOrder;
    }

    public function getTotalPaymentByEmployeeAttribute()
    {
        $totalPayment = $this->parties->sum('total_payment_by_party');
        return $totalPayment;
    }

    public function getTotalTagertAttribute()
    {
        $total = $this->tagertUsers->sum('tagerts');
        return $total;
    }
}
