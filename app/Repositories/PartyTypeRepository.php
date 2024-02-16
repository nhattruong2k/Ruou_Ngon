<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\PartyType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PartyTypeRepository extends BaseRepository
{
    protected $partyType;

    public function __construct(PartyType $partyType)
    {
        $this->partyType = $partyType;
        parent::__construct($partyType);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        $user = Auth::user();
        $query = $this->partyType->withCount(['parties' => function ($q) use ($user) {
            if ($user->hasRole('sales')) {
                $q->where('consultant_id', $user->id);
            } else if ($user->hasRole('accountant')) {
                $q->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
            } else {
                $q;
            }
        }])->orderBy('id', 'ASC');

        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');


        if (isset($request['name'])) {
            $name = $request->get('name');
        }

        if (!empty($name)) {
            $query->where('name', 'like', '%' . $name . '%');
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
            $partyTypeIds = $request->get('ids');
            $partyTypes = $this->partyType->withCount('parties')->whereIn('id', $partyTypeIds)->get();

            foreach ($partyTypes as $partyType) {
                $check = DB::table('parties')->where('party_type_id', $partyType->id)->exists();
                if ($check) {
                    throw new Exception('Dữ liệu muốn xóa đã phát sinh dữ liệu nên không thể xóa!', 400);
                } else $partyType->delete();
            }
            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'Xóa thành công!'
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
