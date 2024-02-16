<?php

namespace App\Repositories;

use App\Models\Tagert;
use App\Models\TagertUser;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TagertMonthRepository extends BaseRepository
{
    protected $tagertMonth;
    protected $tagertUser;

    public function __construct(Tagert $tagertMonth, TagertUser $tagertUser)
    {
        $this->tagertMonth = $tagertMonth;
        $this->tagertUser = $tagertUser;
        parent::__construct($tagertMonth);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        $filter = $request->get('filter_date');
        $filterMonth = $request->get('filter_month');

        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->tagertMonth->with(['user', 'tagertUsers']);

        if (!empty($filter)) {
            $query->when(($filter), function ($query) use ($filter) {
                $query->whereYear('month', $filter);
            });
        }

        if (!empty($filterMonth)) {
            $query->when(($filterMonth), function ($q) use ($filterMonth) {
                $q->whereIn(DB::raw('MONTH(month)'), $filterMonth);
            });
        }
        if ($rowsPerPage) {
            $pagination = $query->orderBy('month', 'DESC')->paginate($rowsPerPage);

            $pagination->getCollection()->each(function ($order) {
                $order->append(['total_target']);
            });

            return $pagination;
        }

        return $query->orderBy('month', 'DESC')->get()->append(['total_target']);
    }

    public function getById($id)
    {
        $query = $this->tagertMonth->with('tagertUsers.user')->find($id);
        if ($query) {
            return $query;
        } else {
            return [
                'data' => false,
                'code' => 404,
                'status' => false,
                'message' => 'Không tìm thấy nhân viên!'
            ];
        }
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $date = Carbon::parse($request['month']);

            $tagertUsers = $request->tagertMonths ?? null;

            foreach ($tagertUsers as $tagertUser) {
                if (empty($tagertUser['tagerts'])) {
                    throw new Exception('Vui lòng nhập mục tiêu', 400);
                }
            }

            $user_id = array_map(function ($item) {
                return $item['employee_id'];
            }, $tagertUsers);

            $checkTagerts = $this->tagertUser->with('tagert')->whereIn('user_id', $user_id)->whereHas(
                'tagert',
                function ($query) use ($date) {
                    return $query->whereYear('month', '=', $date->year)->whereMonth('month', '=', $date->month);
                }
            )->exists();

            if ($checkTagerts) {
                throw new Exception('Mục tiêu tháng của nhân viên này đã tồn tại!', 400);
            } else {
                $month = $this->tagertMonth->where('month', $date)->first();
                if (!is_null($month)) {
                    foreach ($tagertUsers as $tagertUser) {
                        $this->tagertUser->create([
                            'tagert_id' => $month->id,
                            'user_id' => $tagertUser['employee_id'],
                            'tagerts' => $tagertUser['tagerts'],
                        ]);
                    }
                } else {
                    $month = $this->tagertMonth->create([
                        'month' => $date,
                        'created_by' => Auth::user()->id,
                    ]);
                    foreach ($tagertUsers as $tagertUser) {
                        $this->tagertUser->create([
                            'tagert_id' => $month->id,
                            'user_id' => $tagertUser['employee_id'],
                            'tagerts' => $tagertUser['tagerts'],
                        ]);
                    }
                }
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
            $date = Carbon::parse($request['month']);

            $tagertUsers = $request->tagertMonths ?? null;
            foreach ($tagertUsers as $tagertUser) {
                if (empty($tagertUser['tagerts'])) {
                    throw new Exception('Vui lòng nhập mục tiêu', 400);
                }
            }
            $user_id = array_map(function ($item) {
                return $item['employee_id'];
            }, $tagertUsers);

            $checkTagerts = $this->tagertUser->with('tagert')->where('tagert_id', '!=', $id)->whereIn(
                'user_id',
                $user_id
            )->whereHas('tagert', function ($query) use ($date) {
                return $query->whereYear('month', '=', $date->year)->whereMonth('month', '=', $date->month);
            })->exists();

            if ($checkTagerts) {
                throw new Exception('Mục tiêu tháng của nhân viên này đã tồn tại!', 400);
            } else {
                $this->tagertUser->with('tagert')->where('tagert_id', '=', $id)->delete();
                $month = $this->tagertMonth->where('month', $date)->first();
                if ($month) {
                    foreach ($tagertUsers as $tagertUser) {
                        $this->tagertUser->create([
                            'tagert_id' => $month->id,
                            'user_id' => $tagertUser['employee_id'],
                            'tagerts' => $tagertUser['tagerts'],
                        ]);
                    }
                }
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
            $month_id = $request->get('ids');

            $this->tagertMonth->whereIn('id', $month_id)->delete();
            $this->tagertUser->whereIn('tagert_id', $month_id)->delete();

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
