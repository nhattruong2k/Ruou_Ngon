<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\InternalOrg;
use App\Models\Order;
use App\Models\OrderItem;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InternalOrganizationRepository extends BaseRepository
{
    protected $internalOrg;
    protected $orderItem;

    public function __construct(InternalOrg $internalOrg, OrderItem $orderItem)
    {
        $this->internalOrg = $internalOrg;
        $this->orderItem = $orderItem;
        parent::__construct($internalOrg);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $query = $this->internalOrg->with(['province', 'ward', 'district']);

        if (!empty($request->name)) {
            $query = $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->name . '%')
                    ->orWhere('code', 'like', '%' . $request->name . '%');
            });
        }

        if ($rowsPerPage) {
            return $query->paginate($rowsPerPage);
        }

        return $query->get();
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

            $Ids = $request->get('ids');
            $internalOrgs = $this->internalOrg->whereIn('id', $Ids)->get();
            foreach ($internalOrgs as $item) {
                $check = $this->orderItem->where('warehouse_id', $item->id)->exists();
                if ($check) {
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

    public function getCurrentUserWarehouse()
    {
        $currentUserWarehouse = InternalOrg::whereRelation('employments', 'employee_id', Auth::id())
            ->where('internal_org_type_id', config('contants.internal_org_types.warehouse'))
            ->select('id', 'name');
        return $currentUserWarehouse->latest()->first();
    }
}
