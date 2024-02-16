<?php

namespace App\Repositories;

use App\Models\FileManagement;
use App\Models\Good;
use App\Models\ContractGoods;
use App\Models\GoodCategories;
use App\Models\OrderItem;
use App\Services\UploadFileManagement;
use App\Services\UploadService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class GoodRepository extends BaseRepository
{
    protected $good;
    protected $goodCategory;
    protected $fileManagement;
    protected $orderItem;
    protected $contractGoods;

    public function __construct(ContractGoods $contractGoods, GoodCategories $goodCategory, Good $good, FileManagement $fileManagement, OrderItem $orderItem)
    {
        $this->good = $good;
        $this->goodCategory = $goodCategory;
        $this->contractGoods = $contractGoods;
        $this->fileManagement = $fileManagement;
        $this->orderItem = $orderItem;
        parent::__construct($good);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->good->with(['goodBrand', 'unitOfMeasure', 'goodCategory']);

        if (!empty($request->get('filter_name'))) {
            $query = $query->where('name', 'LIKE', '%' . $request->filter_name . '%')
                ->orWhere('code', 'LIKE', '%' . $request->filter_name . '%');
        }
        if (!empty($request->get('origin'))) {
            $query = $query->where('origin', 'LIKE', '%' . $request->origin . '%')
                ->orWhere('origin', 'LIKE', '%' . $request->origin . '%');
        }
        if (!empty($request->get('filter_good_type')) && $request->get('filter_good_type') != 'all') {
            $arrayCategory = $this->getAllChildIds($request->get('filter_good_type'));
            // $query = $this->filter($query, 'good_category_id', $request->get('filter_good_type'));
            $query = $query->whereIn('good_category_id', $arrayCategory);
        }

        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('id', 'DESC')
            ->get();
    }

    public function getAllGoodOthers()
    {
        return $this->good->with(['goodBrand', 'unitOfMeasure', 'goodCategory'])
            ->join('good_categories', 'goods.good_category_id', '=', 'good_categories.id')
            ->join('good_groups', 'good_groups.id', '=', 'good_categories.good_group_id')
            ->whereNotIn('good_groups.code', ['PHUTUNG'])
            ->select(['good_groups.name as good_gr_name', 'good_categories.name as category_name', 'goods.*'])
            ->get();
    }

    public function filter($query, $column, $value)
    {
        return $query = $query->where($column, $value);
    }

    public function getGoodByCategory($request = null)
    {
        $idsGoods = $request->input('ids');
        $goodCategories = $this->goodCategory->with(['categoriesByGoods.unitOfMeasure', 'categoriesByGoods' => function ($quqery) use ($idsGoods) {
            $quqery->whereIn('id', $idsGoods);
        }])->whereHas('categoriesByGoods', function ($q) use ($idsGoods) {
            $q->whereIn('id', $idsGoods);
        });

        $arrCategories = $goodCategories->WhereNull('parent_id')->get()->toArray();

        $goodChildrenCategories = $this->goodCategory->with(['children.categoriesByGoods.unitOfMeasure', 'children.categoriesByGoods' => function ($quqery) use ($idsGoods) {
            $quqery->whereIn('id', $idsGoods);
        }])->whereHas('children.categoriesByGoods', function ($q) use ($idsGoods) {
            $q->whereIn('id', $idsGoods);
        });

        $arrChildrenCategories = $goodChildrenCategories->get()->toArray();

        return array_merge($arrCategories, $arrChildrenCategories);
    }

    public function create($request)
    {
        try {
            DB::beginTransaction();
            $filePath = '';

            // Create image of good
            if ($request->hasFile('photo_image')) {
                $file = $request->file('photo_image');
                $uploadService = app(UploadService::class);
                $uploadService->dir = '__good_photos__';
                $filePath = $uploadService->handleUploadedFile($file);
                $request->merge(['photo' => $filePath]);
            }

            // Create image quote of good
            if ($request->hasFile('photo_quote')) {
                $file = $request->file('photo_quote');
                $uploadService = app(UploadService::class);
                $uploadService->dir = '__good_photos__';
                $filePath = $uploadService->handleUploadedFile($file);
                $request->merge(['photo_export' => $filePath]);
            }

            // Create file attachment of good
            $attachFiles = [];
            if (!empty($request->attachFiles)) {
                foreach ($request->attachFiles as $attachFile) {
                    $file = $attachFile;
                    $uploadService = app(UploadFileManagement::class);
                    $uploadService->dir = '__good_attachments__';
                    $filePath = $uploadService->handleUploadedFile($file);
                    $attachFiles[] = [
                        'name' => $filePath->filename,
                        'path' => $filePath->path,
                    ];
                }
                $request->merge(['attachedfiles' => json_encode($attachFiles)]);
            }

            $request->merge(['created_by' => Auth::user()->id]);

            $this->good->create($request->all());

            $uploadService = app(UploadFileManagement::class);
            $request['folder_name'] = $request['name'];
            $fileData = $uploadService->handleNewFolder($request);

            if (isset($request['name']) && !empty($request['name'])) {
                $request->merge([
                    'name' => $fileData->filename,
                    'path' => $fileData->path,
                    'created_by' => auth()->user()->id,
                    'type' => $fileData->type,
                    'created_at' => Carbon::now(),
                    'parent_id' => 1
                ]);
                $this->fileManagement->create($request->all());
            }
            DB::commit();

            return [
                'data' => true,
                'code' => 201,
                'status' => true,
                'message' => 'Create item success'
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

            $good = $this->good->find($id);
            if ($good) {
                $filePath = '';

                // Update image of good
                if ($request->hasFile('photo_image')) {
                    $uploadService = app(UploadService::class);
                    if (!empty($good->photo)) {
                        $path = storage_path('app/public/__good_photos__/' . $good->photo);
                        $uploadService->removeDirectory($path);
                    }

                    $file = $request->file('photo_image');
                    $uploadService->dir = '__good_photos__';
                    $filePath = $uploadService->handleUploadedFile($file);
                    $request->merge(['photo' => $filePath]);
                }

                // Update image of quote
                if ($request->hasFile('photo_quote')) {
                    $uploadService = app(UploadService::class);
                    if (!empty($good->photo_export)) {
                        $path = storage_path('app/public/__good_photos__/' . $good->photo_export);
                        $uploadService->removeDirectory($path);
                    }

                    $file = $request->file('photo_quote');
                    $uploadService->dir = '__good_photos__';
                    $filePath = $uploadService->handleUploadedFile($file);
                    $request->merge(['photo_export' => $filePath]);
                }

                // Remove file attachment of good
                $fileRemoved = $request->fileRemoved ?? null;
                if ($fileRemoved) {
                    $uploadService = app(UploadFileManagement::class);
                    foreach ($fileRemoved as $file) {
                        $path = storage_path('app/public/__good_attachments__/' . $file['path']);
                        $uploadService->removeDirectory($path);
                    }
                }

                // Update file attachment of good
                $requestFiles = $request->attachFiles ?? null;
                $attachFiles = [];
                if ($requestFiles) {
                    foreach ($requestFiles as $attachFile) {
                        if (is_object($attachFile)) {
                            $file = $attachFile;
                            $uploadService = app(UploadFileManagement::class);
                            $uploadService->dir = '__good_attachments__';
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
                $request->merge(['attachedfiles' => json_encode($attachFiles)]);

                $request->merge(['updated_by' => Auth::user()->id]);

                $good->update($request->all());
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

    public function getGoodLatestPrice($request = null)
    {
        $query = $this->good->with([
            'unitOfMeasure', 'goodCategory', 'priceItems' => function ($query) {
                $query->latest('id');
            }
        ]);

        if (!empty($request->get('filter_good_type')) && $request->get('filter_good_type') != 'all') {
            $query = $this->filter($query, 'good_category_id', $request->get('filter_good_type'));
        }

        return $query->orderBy('id', 'DESC')
            ->get();
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
            $goodIds = $request->get('ids');
            $goods = $this->good->whereIn('id', $goodIds)->get();
            foreach ($goods as $good) {
                $check = $this->orderItem->where('good_id', $good->id)->exists();
                $checkConclusionContract = $this->contractGoods->where('good_id', $good->id)->exists();
                if ($check || $checkConclusionContract) {
                    throw new Exception('Dữ liệu muốn xóa đã phát sinh dữ liệu nên không thể xóa!', 400);
                } else {
                    $good->delete();
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

    function getAllChildIds($parentId)
    {
        $childIds = [];

        $childIds[] = $parentId;

        $children = DB::table('good_categories')
            ->where('parent_id', $parentId)
            ->get();

        foreach ($children as $child) {
            $childIds = array_merge($childIds, $this->getAllChildIds($child->id));
        }

        return $childIds;
    }
}
