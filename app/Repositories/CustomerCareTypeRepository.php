<?php

namespace App\Repositories;

use App\Models\CustomerCare;
use App\Models\CustomerCareType;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Validator;

class CustomerCareTypeRepository extends BaseRepository
{
    protected $customerCareType;
    protected $customerCare;

    public function __construct(CustomerCareType $customerCareType, CustomerCare $customerCare)
    {
        $this->customerCareType = $customerCareType;
        $this->customerCare = $customerCare;
        parent::__construct($customerCareType);
    }

    public function filter($query, $column, $value)
    {
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $isCustomerCare = $request->get('currentTab') === 'care';

        $query = $this->customerCareType->when(($request->filled('name') && $isCustomerCare), function ($query) use ($request) {

            return $query->where('customer_care_types.name', 'like', '%' . $request->get('name') . '%');
        });

        if ($rowsPerPage) {
            return $query->orderBy('customer_care_types.id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('customer_care_types.id', 'DESC')->get();
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
            $customerCareIds = $request->get('ids');
            $customerCareTypes = $this->customerCareType->whereIn('id', $customerCareIds)->get();
            foreach ($customerCareTypes as $customerCareItem) {
                $check = $this->customerCare->where('customer_care_type_id', $customerCareItem->id)->exists();
                if ($check) {
                    throw new Exception('Dữ liệu muốn xóa đã phát sinh dữ liệu nên không thể xóa!', 400);
                } else  $customerCareItem->delete();
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
