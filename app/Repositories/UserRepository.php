<?php

namespace App\Repositories;

use App\Mail\VerifyEmailResetPassword;
use App\Models\Role;
use App\Models\User;
use Auth;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserRepository extends BaseRepository
{
    protected $user;
    protected $role;

    public function __construct(User $user, Role $role)
    {
        $this->user = $user;
        $this->role = $role;
        parent::__construct($user);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->user->with('roles')
            ->when(
                $request->get('name'),
                function ($query) use ($request) {
                    return $query->where('name', 'like', '%' . $request->get('name') . '%')
                        ->orWhereRelation('roles', 'name', 'like', '%' . $request->get('name') . '%');
                }
            );

        if ($rowsPerPage) {
            return $query->paginate($rowsPerPage);
        }
        return $query->get();
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $users = $this->user->where('id', $request->get('employees'))->get();

            foreach ($users as $user) {
                $user->assignRole($request->input('roles'));
            }

            DB::commit();

            return [
                'data' => true,
                'code' => 201,
                'status' => true,
                'message' => 'create item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception'.$exception->getMessage());

            return [
                'data' => false,
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function update($request, $id)
    {
        DB::beginTransaction();
        try {
            $users = $this->user->where('id', $request->get('employees'))->get();

            foreach ($users as $user) {
                DB::table('model_has_roles')->where('model_id', $user->id)->delete();
                $user->assignRole($request->input('roles'));
            }

            DB::commit();

            return [
                'data' => true,
                'code' => 201,
                'status' => true,
                'message' => 'update item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception'.$exception->getMessage());

            return [
                'data' => false,
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function filter($query, $column, $value)
    {
    }

    public function updatePassword($request)
    {
        if (!Hash::check($request->old_password, Auth::user()->password)) {
            throw new Exception('Mật khẩu cũ không đúng', 400);
        }

        $newPassword = Hash::make($request->new_password);

        $this->user->findOrFail(Auth::user()->id)->update(['password' => $newPassword]);
    }

    public function verifyEmailResetPassword($request)
    {
        $email = $request->email ?? null;
        $query = $this->user->where('email', $email);

        if (!$query->exists()) {
            throw new Exception('Email bạn vừa nhập không tồn tại !!', 400);
        }

        if ($email) {
            $otp = rand(100000, 999999);
            Mail::to($email)->send(new VerifyEmailResetPassword($otp));
            $user = $query->first();
            $this->user->findOrFail($user->id)->update(['otp' => $otp]);
        }
    }

    public function resetPassword($request)
    {
        $otp = $request->otp ?? null;
        $email = $request->email ?? null;
        $password = $request->password ?? null;
        $query = $this->user->where('email', $email);

        if (!$query->where('otp', $otp)->exists()) {
            throw new Exception('Mã xác thực không đúng !!', 400);
        }

        $user = $query->first();
        $hashPassword = Hash::make($password);

        $this->user->findOrFail($user->id)->update(['otp' => null, 'password' => $hashPassword]);
    }
}
