<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\Permistion;
use App\Models\Role;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PermistionRepository extends BaseRepository
{
    protected $permistion;
    protected $role;

    public function __construct(Permistion $permistion, Role $role)
    {
        $this->permistion = $permistion;
        $this->role = $role;
        parent::__construct($permistion);
    }

    public function getAll($request = null)
    {
        $query = $this->permistion->with(['screen'])
            ->when($request->filled('name'), function ($query) use ($request) {
                return $query = $query->where('name', 'like', '%' . $request->get('name') . '%');
            })
            ->when($request->filled('screen') && $request->get('screen') != 'all', function ($query) use ($request) {
                $query = $query->where('screen_id', $request->get('screen'));
            });

        return $query->get();
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $request->merge([
                'guard_name' => 'api'
            ]);
            $this->permistion->create($request->all());

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

            $permistion = $this->permistion->find($id);
            if ($permistion) $permistion->update($request->all());
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

    public function filter($query, $column, $value)
    {
    }
}
