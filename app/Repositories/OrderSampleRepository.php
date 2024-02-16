<?php

namespace App\Repositories;

use App\Models\OrderItemSample;
use App\Models\OrderSample;
use App\Repositories\BaseRepository;
use App\Services\UploadService;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class OrderSampleRepository extends BaseRepository
{
    protected $orderSample;
    protected $orderItemSample;

    public function __construct(
        OrderSample $orderSample,
        OrderItemSample $orderItemSample
    ) {
        $this->orderSample = $orderSample;
        $this->orderItemSample = $orderItemSample;
        parent::__construct($orderSample);
    }

    public function getAll($request = null)
    {
        $user = Auth::user();
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $partyTypeId = $request->get('party_type_id');
        $filterName = $request->get('filter_name');

        $query = $this->orderSample->with(['party', 'party.employee']);

        if ($user->hasRole('sales')) {
            $query->whereRelation('party', 'consultant_id', '=', $user->id);
        } else if ($user->hasRole('accountant')) {
            $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
        }

        if (!empty($filterName)) {
            $query = $query->whereRelation('party', 'name', 'like', '%' . $filterName . '%')
                ->orWhereRelation('party', 'code', 'like', '%' . $filterName . '%');
        }

        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('id', 'DESC')->get();
    }

    public function getById($id)
    {
        $query = $this->orderSample->with(['party', 'orderItemSamples.good'])->find($id);
        if ($query) {
            return $query;
        } else {
            return [
                'data' => false,
                'code' => 404,
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng mẫu!'
            ];
        }
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $checkSample = $this->orderSample->where('party_id', $request['party_id'])->exists();
            if ($checkSample) {
                throw new Exception('Đơn hàng mẫu của khách hàng này đã tồn tại!', 400);
            } else {
                $orderSample = $this->orderSample->create($request->all());
                foreach ($request->get('goods') as $item) {
                    $this->orderItemSample->create([
                        'good_id' => $item['good_id'],
                        'order_sample_id' => $orderSample->id,
                        'discount' => $item['discount'],
                        'percent_discount' => $item['percent_discount'],
                    ]);
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
            $checkSample = $this->orderSample->where('party_id', $request['party_id'])->where('id', '!=', $id)->exists();
            if ($checkSample) {
                throw new Exception('Đơn hàng mẫu của khách hàng này đã tồn tại!', 400);
            } else {
                $orderSample = $this->orderSample->find($id);
                if ($orderSample) {
                    $orderSample->update($request->all());
                    $this->orderItemSample->where('order_sample_id', $id)->delete();

                    foreach ($request->get('goods') as $item) {
                        $this->orderItemSample->create([
                            'good_id' => $item['good_id'],
                            'order_sample_id' => $orderSample->id,
                            'discount' => $item['discount'],
                            'percent_discount' => $item['percent_discount'],
                        ]);
                    }
                } else {
                    throw new Exception('Không tìm thấy!', 404);
                }
            }

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
            $ids = $request->get('ids');
            $orderSamples = $this->orderSample->where('id', $ids)->get();
            foreach ($orderSamples as $item) {
                $this->orderItemSample->where('order_sample_id', $item->id)->delete();
                $item->delete();
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
