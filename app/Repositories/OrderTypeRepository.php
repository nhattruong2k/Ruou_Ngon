<?php

namespace App\Repositories;

use App\Models\OrderType;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Validator;

class OrderTypeRepository extends BaseRepository
{
    protected $orderType;

    public function __construct(OrderType $orderType)
    {
        $this->orderType = $orderType;
        parent::__construct($orderType);
    }

    public function filter($query, $column, $value)
    {
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $isOrderType = $request->get('currentTab') === 'orderType';

        $query = $this->orderType->when(($request->filled('name') && $isOrderType), function ($query) use ($request) {

            return $query->where('order_types.name', 'like', '%' . $request->get('name') . '%');
        });

        if ($rowsPerPage) {
            return $query->orderBy('order_types.id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('order_types.id', 'DESC')->get();
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
            $orderTypeListIds = $request->get('ids');
            $orderTypes = $this->orderType->whereIn('id', $orderTypeListIds)->get();
            foreach ($orderTypes as $orderTypeItem) {
                $this->orderType->find($orderTypeItem->id)->delete();
                $orderTypeItem->delete();
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
