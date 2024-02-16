<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\Employment;
use App\Models\Employee;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmploymentRepository extends BaseRepository
{
    protected $employment;
    protected $employee;
    const INTERNAL_ORG_TYPE_WAREHOUSE = 2;
    public function __construct(Employment $employment, Employee $employee)
    {
        $this->employment = $employment;
        $this->employee = $employee;
        parent::__construct($employment);
    }

    public function getAll($request = null)
    {
        $query = $this->employment->with(['department', 'position', 'employee']);

        if (!empty($request->filter_employee_id)) {
            $query->whereHas('department', function ($queryHas) {
                $queryHas->where('internal_org_type_id', self::INTERNAL_ORG_TYPE_WAREHOUSE);
            });

            $query = $query->where('employments.employee_id', $request->filter_employee_id);
        }

        return $query->orderBy('id', 'DESC')->get();
    }

    public function create($request)
    {
        try {
            DB::beginTransaction();
            $employeeId = $request->get('employee_id');
            $fromDate = $request->get('from_date');
            $employee = $this->employee->findOrFail($employeeId);

            $employmentBefore = $this->employment->getEmploymentBefore($employee->id, $fromDate);
            $employmentAfter = $this->employment->getEmploymentAfter($employee->id, $fromDate);

            if (!empty($employmentAfter)) {
                $thruDate = Carbon::createFromFormat('Y-m-d', $employmentAfter->from_date)->subDays(1);
                $request->merge([
                    'thru_date' => $thruDate
                ]);
            }

            $employment = $this->employment->create($request->all());

            if (!empty($employmentBefore)) {
                $employmentBefore->thru_date = Carbon::createFromFormat('Y-m-d', $employment->from_date)->subDays(1);
                $employmentBefore->save();
            }

            DB::commit();
            return [
                'code' =>  201,
                'status' => true,
                'message' => 'Create item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error($exception->getMessage());

            return [
                'code' =>  400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function removeItems($request)
    {
        try {
            if (!empty($request->items)) {
                $idItems = $request->items;
                $this->employment->whereIn('id', $idItems)->delete();

                return [
                    'code' => 200,
                    'status' => true,
                    'data' => true,
                    'message' => 'Delete items success'
                ];
            }

            throw new Exception('Not found');
        } catch (Exception $exception) {

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
        return $query = $query->where($column, 'like', '%' . $value . '%');

    }
}
