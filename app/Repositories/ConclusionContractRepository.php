<?php

namespace App\Repositories;

use App\Models\ConclusionContract;
use App\Models\ContractGoods;
use App\Services\UploadFileManagement;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ConclusionContractRepository extends BaseRepository
{

    protected $conclusionContract;
    protected $contractGoods;

    public function __construct(ConclusionContract $conclusionContract, ContractGoods $contractGoods)
    {
        $this->conclusionContract = $conclusionContract;
        $this->contractGoods = $contractGoods;
        parent::__construct($conclusionContract);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }
        $statusTab = $request->status_tab;
        $filterCode = $request->filter_code;
        $filterStartDate = $request->filter_start_date;
        $filterEndDate = $request->filter_end_date;
        $filterContract = $request->filter_contract;

        $contract_good = 'contract_good';
        $contract_travel = 'contract_travel';

        $query = $this->conclusionContract->with([
            'party' => function ($q) {
                $q->select(['id', 'name', 'code', 'party_type_id']);
            },
            'orderStatus' => function ($q) {
                $q->select(['id', 'name']);
            },
        ]);

        switch ($statusTab) {
            case $contract_good:
                $query = $query->where('type_id', config('contants.contract_type.contract_good'));
                break;
            case $contract_travel:
                $query = $query->where('type_id', config('contants.contract_type.contract_travel'));
                break;
        }

        if (!empty($filterStartDate) && !empty($filterEndDate)) {
            $query = $query->whereBetween('date', [$filterStartDate, $filterEndDate]);
        }
        if (!empty($filterStartDate) && empty($filterEndDate)) {
            $query = $query->where('date', '>=', $filterStartDate);
        }
        if (empty($filterStartDate) && !empty($filterEndDate)) {
            $query = $query->where('date', '<=', $filterEndDate);
        }
        if (!empty($filterCode)) {
            $query = $query->where(function ($queryCode) use ($filterCode) {
                $queryCode->whereRelation('party', 'name', 'LIKE', '%' . $filterCode . '%')
                    ->orWhereRelation('party', 'code', 'LIKE', '%' . $filterCode . '%')
                    ->orWhere('code', 'LIKE', '%' . $filterCode . '%');
            });
        }

        if (!empty($filterContract) && $filterContract !== 'all') {
            $query = $query->where('status_id', $filterContract);
        }

        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }

        return $query->orderBy('id', 'DESC')->get();
    }

    public function getById($id)
    {

        $query = $this->conclusionContract->with([
            'contractGoods', 'contractGoods.good' => function ($q) {
                $q->select(['id', 'name', 'code', 'price']);
            }
        ])->find($id);

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

            $dataFile = [];
            if ($request->hasFile('attachment_file')) {
                foreach ($request->file('attachment_file') as $key => $file) {
                    $uploadService = app(UploadFileManagement::class);
                    $uploadService->dir = '__contract_attachment__';
                    $fileData = $uploadService->handleUploadedFile($file);
                    $dataFile[$key]['path'] = $fileData->path;
                    $dataFile[$key]['name'] = $fileData->filename;
                }
            }

            $request->merge([
                'created_by' => Auth::user()->id,
                'date' => $request->date,
                'code' => ConclusionContract::generateCode($request->date, 'HD'),
                'amount' => $request['amount'],
                'type_id' => $request['type_id'],
                'party_id' => $request['party_id'],
                'status_id' => 1,
                'attachment' => json_encode($dataFile),
            ]);

            if ($request['type_id'] == config('contants.contract_type.contract_travel')) {
                $contract = $this->conclusionContract->create($request->all());
            } else {
                $contractGoods = $request->good ?? null;
                if (!isset($request->good)) {
                    throw new Exception('Vui lòng chọn sản phẩm và nhập số lượng sản phẩm', 400);
                }
                foreach ($contractGoods as $contractGood) {
                    if (empty($contractGood['quantity'])) {
                        throw new Exception('Vui lòng nhập số lượng sản phẩm', 400);
                    }
                }

                $contract = $this->conclusionContract->create($request->all());

                foreach ($contractGoods as $contractGood) {
                    $this->contractGoods->create([
                        'contract_id' => $contract->id,
                        'good_id' => $contractGood['good_id'],
                        'quantity' => $contractGood['quantity'],
                        'quantity_monthly' => $contractGood['quantity_monthly'],
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

            $date = $request->date ?? null;

            $contractGoods = $request->good ?? null;

            $contract = $this->conclusionContract->find($id);

            $code = $contract->code;

            $dateNew = Carbon::parse($date)->isoFormat('YYMM');
            $dateOld = Carbon::parse($contract->date)->isoFormat('YYMM');
            if ($dateOld != $dateNew) {
                $code = ConclusionContract::generateCode($request->date, 'HD');
            }

            if ($request->status_id == config('contants.contract_status.confirm')) {
                $contract->update(['status_id' => 2]);
            } else {
                $request->merge([
                    'updated_by' => Auth::user()->id,
                    'date' => $date,
                    'code' => $code,
                    'amount' => $request['amount'],
                    'type_id' => $request['type_id'],
                    'party_id' => $request['party_id'],

                ]);


                $fileRemoved = $request->file_removes ?? null;
                if ($fileRemoved) {
                    $uploadService = app(UploadFileManagement::class);
                    foreach ($fileRemoved as $file) {
                        $path = storage_path('app/public/__contract_attachment__/' . $file['path']);
                        $uploadService->removeDirectory($path);
                    }
                }

                $requestFiles = $request->attachment_file ?? null;
                $dataFile = [];
                if ($requestFiles) {
                    foreach ($requestFiles as $key => $attachmentFile) {
                        if (is_object($attachmentFile)) {
                            $file = $attachmentFile;
                            $uploadService = app(UploadFileManagement::class);
                            $uploadService->dir = '__contract_attachment__';
                            $fileData = $uploadService->handleUploadedFile($file);
                            $dataFile[$key]['path'] = $fileData->path;
                            $dataFile[$key]['name'] = $fileData->filename;
                        } else {
                            $dataFile[] = $attachmentFile;
                        }
                    }
                }
                $request->merge([
                    'attachment' => json_encode($dataFile),
                ]);

                if ($request['type_id'] == config('contants.contract_type.contract_travel')) {
                    $contract->update($request->all());
                    $this->contractGoods->where('contract_id', $id)->forceDelete();
                } else {
                    if (!isset($request->good)) {
                        throw new Exception('Vui lòng chọn sản phẩm và nhập số lượng sản phẩm', 400);
                    }
                    foreach ($contractGoods as $contractGood) {
                        if (empty($contractGood['quantity'])) {
                            throw new Exception('Vui lòng nhập số lượng sản phẩm', 400);
                        }
                    }

                    $contract->update($request->all());

                    $this->contractGoods->where('contract_id', $id)->forceDelete();
                    foreach ($contractGoods as $contractGood) {
                        $this->contractGoods->create([
                            'contract_id' => $contract->id,
                            'good_id' => $contractGood['good_id'],
                            'quantity' => $contractGood['quantity'],
                            'quantity_monthly' => $contractGood['quantity_monthly'],
                        ]);
                    }
                }
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
            $contractIds = $request->get('ids');

            $contractQuery = $this->conclusionContract->whereIn('id', $contractIds);

            $check = $this->conclusionContract->whereIn('id', $contractIds)->where('amount_order', '>', 0)->exists();
            if ($check) {
                throw new Exception('Hợp đồng đã phát sinh dữ liệu bạn không được phép xóa!', 400);
            }

            $checkConfirm = $this->conclusionContract->whereIn('id', $contractIds)->where(
                'status_id',
                config('contants.contract_type.contract_travel')
            )->exists();
            if ($checkConfirm) {
                throw new Exception('Chỉ được xóa hợp đồng ở trạng thái chờ duyệt!', 400);
            }

            $contractQuery->delete();

            $this->contractGoods->whereIn('contract_id', $contractIds)->delete();

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
