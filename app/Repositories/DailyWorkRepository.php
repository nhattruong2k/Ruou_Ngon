<?php

namespace App\Repositories;

use App\Models\DailyWork;
use App\Models\DailyWorkCategory;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DailyWorkRepository extends BaseRepository
{
    protected $dailyWork;
    protected $dailyWorkCategory;
    public function __construct(DailyWork $dailyWork, DailyWorkCategory $dailyWorkCategory)
    {
        $this->dailyWork = $dailyWork;
        $this->dailyWorkCategory = $dailyWorkCategory;
        parent::__construct($dailyWork);
    }

    public function filter($query, $column, $value)
    {
    }

    public function getAll($request = null)
    {
        $user = Auth::user();
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $query = $this->dailyWork->with(['employee', 'workCategories'])
            ->when(($request->filled('name')), function ($query) use ($request) {

                return $query->whereRelation('employee', 'name', 'LIKE', '%' . $request->get('name') . '%');
            })
            ->when(($request->get('filter_start_date')) && $request->filled('filter_end_date'), function ($query) use ($request) {
                return $query->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']]);
            })
            ->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales') || $user->hasRole('warehouse'),
                function ($query) use ($user) {
                    return $query->where('employee_id', '=', $user->id);
                }
            );

        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('id', 'DESC')->get();
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $dailywork = $this->dailyWork->create($request->all());
            if (!empty($request['work_category_id'])) {
                foreach ($request['work_category_id'] as $item) {
                    $this->dailyWorkCategory->create([
                        'daily_work_id' => $dailywork->id,
                        'work_category_id' => $item['id']
                    ]);
                }
            }

            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'Create items success'
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


    public function update($request, $id)
    {
        DB::beginTransaction();
        try {
            $dailywork = $this->dailyWork->find($id);
            if ($dailywork) {
                $dailywork->update($request->all());
                $this->dailyWorkCategory->where('daily_work_id', $id)->delete();
                if (!empty($request['work_category_id'])) {
                    foreach ($request['work_category_id'] as $item) {
                        $this->dailyWorkCategory->create([
                            'daily_work_id' => $dailywork->id,
                            'work_category_id' => $item['id']
                        ]);
                    }
                }
            }


            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'Update items success'
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
            $workListIds = $request->get('ids');
            $works = $this->dailyWork->whereIn('id', $workListIds)->get();
            foreach ($works as $work) {
                $this->dailyWorkCategory->where('daily_work_id', $work->id)->delete();
                $work->delete();
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
}
