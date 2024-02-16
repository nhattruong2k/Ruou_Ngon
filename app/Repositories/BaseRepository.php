<?php

namespace App\Repositories;

use App\Contracts\ModelRepositoryInterface;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BaseRepository implements ModelRepositoryInterface
{
    /**
     * @var Model
     */
    protected $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function getAll()
    {
        return $this->model->get();
    }

    public function getById($id)
    {
        return $this->model->find($id);
    }

    public function create($request)
    {
        try {
            $data = $this->model->create($request->all());
            return [
                'code' => 201,
                'data' => true,
                'message' => 'Create item success',
                'dataReturn' => $data
            ];
        } catch (Exception $exception) {
            Log::error('Ex' . $exception->getMessage() . 'get file ' . $exception->getFile() . ' GET LINE ' . $exception->getLine());
            return [
                'code' => 400,
                'data' => false,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function update($request, $id)
    {
        $model = $this->model->find($id);
        if ($model) {
            return $model = $model->update($request->all());
        }

        return [
            'data' => false,
            'code' => 404,
            'message' => 'Item not found.'
        ];
    }

    public function delete($id)
    {
        $model = $this->model->find($id);
        if ($model) {
            return $model->delete($id);
        }

        return [
            'code' => 404,
            'message' => 'Item not found.'
        ];
    }

    public function filter($query, $column, $value)
    {
    }

    public function getByAttr($attr, $value)
    {
        return $this->model->where($attr, $value);
    }

    public function applyPermission($attr, $value)
    {
        $user = Auth::user();

        if ($user->hasRole('sales')) {
            $value = empty($value) ? $user->id : $value;
            return $this->model->where($attr, $value);
        }

        return $this->model;
    }
}
