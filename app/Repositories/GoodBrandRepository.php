<?php

namespace App\Repositories;

use App\Models\GoodBrand;
use App\Repositories\BaseRepository;
use Exception;

class GoodBrandRepository extends BaseRepository
{
    protected $goodBrand;

    public function __construct(GoodBrand $goodBrand)
    {
        $this->goodBrand = $goodBrand;
        parent::__construct($goodBrand);
    }

    public function getAll($request = null)
    {
        return $this->goodBrand->get();
    }

    public function create($request)
    {
        try {
            $arrGoods = $request->all();
            if (!empty($arrGoods)) {
                foreach (array_chunk($arrGoods, 5) as $good) {
                    $this->goodBrand->insert($good);
                }
            }

            return [
                'code' => 404,
                'message' => 'Not found item',
                'data' => false,
                'status' => false
            ];
        } catch (Exception $exception) {

            return [
                'code' => 400,
                'message' => $exception,
                'data' => false,
                'status' => false
            ];
        }
    }

    public function removeItems($request)
    {
        try {
            if (empty($request->items)) {
                return [
                    'code' => 404,
                    'message' => 'Item not found.'
                ];
            }
            $items = $request->items;
            foreach ($items as $item) {
                $model = $this->goodBrand->find($item['id']);

                if (!empty($model)) {
                    $model->delete();
                }
            }

            return [
                'code' => 200,
                'message' => 'Delete success',
                'status' => true,
                'data' => true
            ];
        } catch (Exception $exception) {

            throw $exception;
        }
    }

    public function filter($query, $column, $value)
    {
    }
}
