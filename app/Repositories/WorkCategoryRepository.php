<?php

namespace App\Repositories;

use App\Models\WorkCategory;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Validator;

class WorkCategoryRepository extends BaseRepository
{
    protected $workCategory;

    public function __construct(WorkCategory $workCategory)
    {
        $this->workCategory = $workCategory;
        parent::__construct($workCategory);
    }

    public function filter($query, $column, $value)
    {
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $isWork = $request->get('currentTab') === 'work';

        $query = $this->workCategory->when(($request->filled('name') && $isWork), function ($query) use ($request) {

            return $query->where('work_categories.name', 'like', '%' . $request->get('name') . '%');
        });

        if ($rowsPerPage) {
            return $query->orderBy('work_categories.id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('work_categories.id', 'DESC')->get();
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
            $workCategoryIds = $request->get('ids');
            $works = $this->workCategory->whereIn('id', $workCategoryIds)->get();
            foreach ($works as $work) {
                $this->workCategory->find($work->id)->delete();
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
