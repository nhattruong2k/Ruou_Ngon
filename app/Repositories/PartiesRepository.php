<?php

namespace App\Repositories;

use App\Models\CustomerCare;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderSample;
use App\Models\Parties;
use App\Models\PaymentItem;
use App\Services\UploadFileManagement;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PartiesRepository extends BaseRepository
{
    protected $parties;
    protected $customerCares;
    protected $order;
    protected $paymentItem;
    protected $orderSample;
    protected $notification;

    public function __construct(
        Parties $parties,
        CustomerCare $customerCares,
        Order $order,
        PaymentItem $paymentItem,
        OrderSample $orderSample,
        Notification $notification,
    ) {
        $this->parties = $parties;
        $this->customerCares = $customerCares;
        $this->order = $order;
        $this->paymentItem = $paymentItem;
        $this->orderSample = $orderSample;
        $this->notification = $notification;
        parent::__construct($parties);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }
        $user = Auth::user();
        $partyTypeId = $request->get('party_type_id');
        $filterName = $request->get('filter_name');

        $queryPermission = $this->applyPermission('consultant_id', '');

        $query = $queryPermission->with([
            'province', 'district', 'ward', 'partyType', 'customerCares', 'customerCares.customerCareType', 'employee'
        ]);
        if ($user->hasRole('accountant')) {
            $query = $query->whereRelation('employee', 'internal_org_id', '=', $user->internal_org_id);
        }
        if (!empty($partyTypeId) && $partyTypeId != 'all') {
            $query = $this->filter($query, 'party_type_id', $partyTypeId);
        }

        if (!empty($filterName)) {
            $query = $query->where('parties.name', 'like', '%'.$filterName.'%')->orWhere('code', 'like', '%'.$filterName.'%');
        }

        if ($rowsPerPage) {
            $pagination = $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
            $pagination->getCollection()->each(function ($party) {
                $party->append(['is_payment']);
            });

            return $pagination;
        }
        return $query->orderBy('id', 'DESC')->get()->append(['is_payment']);
    }

    public function getAllPartiesNotExistFlt()
    {
        return $this->parties->whereNotIn('party_type_id', [config('contants.parties_types.flt')])->get();
    }

    public function filter($query, $column, $value)
    {
        return $query = $query->where($column, $value);
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            if (is_null($request->get('employee_id'))) {
                $request->merge(['consultant_id' => auth()->user()->id]);
            } else {
                $request->merge(['consultant_id' => $request->get('employee_id')]);
            }

            // Create file attachment of parties
            $attachFiles = [];
            if (!empty($request->attachFiles)) {
                foreach ($request->attachFiles as $attachFile) {
                    $file = $attachFile;
                    $uploadService = app(UploadFileManagement::class);
                    $uploadService->dir = '__party_attachment__';
                    $filePath = $uploadService->handleUploadedFile($file);
                    $attachFiles[] = [
                        'name' => $filePath->filename,
                        'path' => $filePath->path,
                    ];
                }
                $request->merge(['attachment' => json_encode($attachFiles)]);
            }
            $request->merge(['created_by' => auth()->user()->id]);
            $party = $this->parties->create($request->all());
            if (isset($request['customerCares'])) {
                $customerCaresRequest = $request->get('customerCares');

                $customerCareList = [];
                foreach ($customerCaresRequest as $customerCare) {
                    $customerCareList[] = [
                        'party_id' => $party->id,
                        'date' => $customerCare['care_date'],
                        'description' => $customerCare['description'],
                        'customer_care_type_id' => $customerCare['customer_care_type_id']['id'],
                        'created_by' => Auth::user()->id
                    ];
                }
                $this->customerCares->insert($customerCareList);
            }

            // create notification of order
            $this->notification->createNotiWhenAddNew([
                'feature_id' => $party->id,
                'function_id' => config('contants.functions.party')
            ]);

            DB::commit();

            return [
                'data' => true,
                'code' => 201,
                'status' => true,
                'message' => 'create item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception'.$exception->getMessage());

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
            if (!$request->get('employee_id')) {
                $request->merge(['consultant_id' => auth()->user()->id]);
            } else {
                $request->merge(['consultant_id' => $request->get('employee_id')]);
            }
            $request->merge(['updated_by' => auth()->user()->id]);

            $party = $this->parties->find($id);

            // Remove file attachment of parties
            $fileRemoved = $request->fileRemoved ?? null;

            if ($fileRemoved) {
                $uploadService = app(UploadFileManagement::class);
                foreach ($fileRemoved as $file) {
                    $path = storage_path('app/public/__party_attachment__/'.$file['path']);
                    $uploadService->removeDirectory($path);
                }
            }

            // Update file attachment of parties
            $requestFiles = $request->attachFiles ?? null;
            $attachFiles = [];
            if ($requestFiles) {
                foreach ($requestFiles as $attachFile) {
                    if (is_object($attachFile)) {
                        $file = $attachFile;
                        $uploadService = app(UploadFileManagement::class);
                        $uploadService->dir = '__party_attachment__';
                        $filePath = $uploadService->handleUploadedFile($file);
                        $attachFiles[] = [
                            'name' => $filePath->filename,
                            'path' => $filePath->path,
                        ];
                    } else {
                        $attachFiles[] = $attachFile;
                    }
                }
            }
            $request->merge(['attachment' => json_encode($attachFiles)]);

            if ($party) {
                $party->update($request->all());
            }

            if (isset($request['customerCares'])) {
                $customerCaresRequest = $request->get('customerCares');
                foreach ($customerCaresRequest as $customerCare) {
                    $customerCareId = $customerCare['customer_care_id'];
                    $dataRequest = [
                        'party_id' => $party->id,
                        'date' => $customerCare['care_date'] ?? null,
                        'description' => $customerCare['description'] ?? null,
                        'customer_care_type_id' => $customerCare['customer_care_type_id']['id'] ?? null,
                        'updated_by' => Auth::user()->id
                    ];

                    if ($customerCareId) {
                        $this->customerCares->find($customerCareId)->update($dataRequest);
                    } else {
                        $this->customerCares->create($dataRequest);
                    }
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
            Log::error('exception'.$exception->getMessage());

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
            $partyIds = $request->get('ids');
            $this->customerCares->whereIn('party_id', $partyIds)->delete();
            $parties = $this->parties->whereIn('id', $partyIds)->get();
            foreach ($parties as $item) {
                $check = DB::table('orders')->where('party_id', $item->id)->exists();
                if ($check) {
                    throw new Exception('Dữ liệu muốn xóa đã phát sinh dữ liệu nên không thể xóa!', 400);
                } else {
                    $item->delete();
                }
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

    public function getPartiesByEmployee($request)
    {
        $employeeId = $request->get('id');

        return $this->parties->with(['province', 'district', 'ward', 'orderSample'])->where('consultant_id', $employeeId)->get();
    }

    public function getDebtCurrentByParty($party_id)
    {
        $statusNotIn = [config('contants.order_status.reject_sale_receipt'), config('contants.order_status.success_sale_receipt')];

        $orders = $this->order->with('orderItems')
            ->whereNotIn('order_status_id', $statusNotIn)
            ->where('party_id', $party_id)
            ->where('function_id', '=', config('contants.functions.sale_receipt'))
            ->get()->append('total_price');

        $debtCurrent = 0;

        if (count($orders)) {
            $orderIds = $orders->pluck('id');
            $totalOrder = $orders->sum('total_price');

            $payment = $this->paymentItem->whereIn('order_id', $orderIds)
                ->whereRelation('payment', 'payment_status_id', '=', config('contants.payment_status.approved'))->sum('amount');

            $debtCurrent = $totalOrder - $payment;
        }

        return $debtCurrent;
    }

    public function getOrderSampleByParty($party_id)
    {
        $orderSample = $this->orderSample->with(['orderItemSamples.good.unitOfMeasure'])->where('party_id', $party_id)->first();
        return $orderSample;
    }

    public function getPartyById($party_id)
    {
        return $this->parties->with([
            'province',
            'district',
            'ward',
            'partyType',
            'customerCares',
            'customerCares.customerCareType',
            'employee'
        ])->findOrFail($party_id);
    }
}
