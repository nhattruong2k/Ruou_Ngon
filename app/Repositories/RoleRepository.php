<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\Role;
use App\Models\Permistion;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class RoleRepository extends BaseRepository
{
    protected $role;
    protected $permistion;
    protected $user;

    public function __construct(Role $role, Permistion $permistion, User $user)
    {
        $this->role = $role;
        $this->permistion = $permistion;
        $this->user = $user;
        parent::__construct($role);
    }

    public function getAll($request = null)
    {
        $query = $this->role->with(['permistions']);
        // ->when($request->filled('name'), function ($query) use ($request) {
        //     return $query = $query->where('name', 'like', '%' . $request->get('name') . '%');
        // })
        // ->when($request->filled('screen') && $request->get('screen') != 'all', function ($query) use ($request) {
        //     $query = $query->where('screen_id', $request->get('screen'));
        // });

        return $query->get();
    }

    public function create($request)
    {

        DB::beginTransaction();
        try {
            $role = $this->role->create([
                'name' => $request->get('name'),
                'guard_name' => 'api',
            ]);
            $role->syncPermissions($request->input('permission'));
            DB::commit();

            return [
                'data' => true,
                'code' => 201,
                'status' => true,
                'message' => 'create item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception' . $exception->getMessage());

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
            $role = $this->role->find($id);
            if ($role) {
                $role->update($request->all());
                $role->syncPermissions($request->input('permission'));
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
            Log::error('exception' . $exception->getMessage());

            return [
                'data' => false,
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
        }
    }
}
