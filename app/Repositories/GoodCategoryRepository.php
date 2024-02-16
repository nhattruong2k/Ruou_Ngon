<?php

namespace App\Repositories;

use App\Models\Good;
use App\Models\GoodCategories;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GoodCategoryRepository extends BaseRepository
{
    protected $goodCategory;
    protected $good;

    public function __construct(GoodCategories $goodCategory, Good $good)
    {
        $this->goodCategory = $goodCategory;
        $this->good = $good;
        parent::__construct($goodCategory);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $goodCategories = $this->goodCategory->with(['goodCategory']);
        if (isset($request['filter_name']) && !empty($request->get('filter_name'))) {
            $goodCategories = $goodCategories->where('name', 'LIKE', '%'.$request->filter_name.'%')
                ->orWhere('code', 'LIKE', '%'.$request->filter_name.'%');
        }

        if ($rowsPerPage) {
            return $goodCategories->paginate($rowsPerPage);
        }

        $arrCategories = $goodCategories->get()->toArray();
        return $this->buildTree($arrCategories);
    }

    public function filter($query, $column, $value)
    {
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
            $goods = $this->goodCategory->whereIn('id', $goodIds)->get();
            foreach ($goods as $good) {
                $check = $this->good->where('good_category_id', $good->id)->exists();
                $checkChild = $this->goodCategory->where('parent_id', $good->id)->exists();
                if ($check || $checkChild) {
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

    function buildTree(array $data, $parentId = 0, $level = 0)
    {
        $tree = [];
        $temp = [];
        foreach ($data as $item) {

            if ($item['parent_id'] == $parentId) {
                $item['level'] = $level;
                if ($level > 0) {
                    $item['nameCustom'] = str_repeat("--", $level) . ' ' . $item['name'];
                } else {
                    $item['nameCustom'] = $item['name'];
                }

                // Tính toán số lượng con (count)
                $item['count'] = $this->countChildren($data, $item['id']);

                $tree[] = $item;
                $children = $this->buildTree($data, $item['id'], $level + 1);
                $tree = array_merge($tree, $children);
                $temp[] = $item['id'];
            } else if ($item['parent_id'] > 0) {
                $filteredArray = array_filter($data, function ($value) use ($item) {
                    return $value['id'] == $item['parent_id'];
                });
                $item['nameCustom'] = $item['name'];
                if (count($filteredArray) == 0) {
                    $tree = array_merge($tree, [$item]);
                }
            }
        }

        return $tree;
    }

    function countChildren(array $data, $parentId)
    {
        $count = 0;
        foreach ($data as $item) {
            if ($item['parent_id'] == $parentId) {
                $count++;
                $count += $this->countChildren($data, $item['id']);
            }
        }
        return $count;
    }
}
