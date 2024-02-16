<?php

namespace App\Repositories;

use App\Models\Parties;
use App\Models\Tagert;
use App\Models\TagertUser;
use App\Repositories\BaseRepository;
use App\Models\User;
use App\Services\UploadService;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class EmployeeRepository extends BaseRepository
{
    protected $user;
    protected $parties;
    protected $tagert;
    protected $tagertUser;

    public function __construct(User $user, Parties $parties, Tagert $tagert, TagertUser $tagertUser)
    {
        $this->user = $user;
        $this->parties = $parties;
        $this->tagert = $tagert;
        $this->tagertUser = $tagertUser;
        parent::__construct($user);
    }

    public function getAll($request = null)
    {
        $user = Auth::user();
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $query = $this->user->with(['internalOrg'])
            ->when($request->filled('name'), function ($query) use ($request) {
                return $query = $query->where('name', 'like', '%' . $request->get('name') . '%')
                    ->orWhere('code', 'like', '%' . $request->get('name') . '%');
            })
            ->when($request->filled('employee_status_id') && $request->get('employee_status_id') != 'all', function ($query) use ($request) {
                $query = $query->where('active_flag', $request->get('employee_status_id'));
            })->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->where('internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->where('id', '=', $user->id);
                }
            );


        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('id', 'DESC')->get();
    }

    public function create($request)
    {
        try {
            DB::beginTransaction();
            $filePath = '';
            if ($request->hasFile('photo_image')) {
                $file = $request->file('photo_image');
                $uploadService = app(UploadService::class);
                $filePath = $uploadService->handleUploadedFile($file);
                $request->merge(['photo' => $filePath]);
            }
            if (empty($request['passwordNew'])) {
                $request->merge(['password' => Hash::make('Odinbi123')]);
            } else $request->merge(['password' => Hash::make($request['passwordNew'])]);
            $request->merge(['created_by' => Auth::user()->id]);
            $this->user->create($request->all());

            DB::commit();

            return [
                'code' => 201,
                'status' => true,
                'message' => 'Create item success'
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

            $employee = $this->user->find($id);
            if ($employee) {
                $filePath = '';

                if ($request->hasFile('photo_image')) {
                    $uploadService = app(UploadService::class);
                    if (!empty($employee->photo)) {
                        $path = storage_path('app/public/__employee_photos__/' . $employee->photo);
                        $uploadService->removeDirectory($path);
                    }

                    $file = $request->file('photo_image');

                    $filePath = $uploadService->handleUploadedFile($file);
                    $request->merge(['photo' => $filePath]);
                }
                if (!empty($request['passwordNew'])) {
                    $request->merge(['password' => Hash::make($request['passwordNew'])]);
                }
                $request->merge(['updated_by' => Auth::user()->id]);
                $employee->update($request->all());
            }

            DB::commit();

            return [
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

    public function removeItems($request)
    {
        $rules = [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|min:1',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return [
                'code' => 400,
                'status' => false,
                'data' => $validator->errors(),
                'message' => 'Validation errors'
            ];
        }

        DB::beginTransaction();
        try {
            $employeeIds = $request->get('ids');
            $employees = $this->user->whereIn('id', $employeeIds)->get();
            foreach ($employees as $item) {
                if ($item->id == 1) {
                    throw new Exception('Không thể xóa tài khoản admin!', 400);
                }
                $check = $this->parties->where('consultant_id', $item->id)->exists();
                $checkTagert =  $this->tagertUser->where('user_id', $item->id)->exists();
                if ($check || $checkTagert) {
                    throw new Exception('Dữ liệu muốn xóa đã phát sinh dữ liệu nên không thể xóa!', 400);
                } else $item->delete();
            }

            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'Delete items success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return [
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage(),
                'data' => false
            ];
        }
    }

    public function filter($query, $column, $value)
    {
    }
}
