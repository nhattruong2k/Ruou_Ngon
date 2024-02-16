<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\OrganiztionType;
use Exception;

class OrganizationTypeRepository extends BaseRepository
{
    protected $organizationType;

    public function __construct(OrganiztionType $organizationType)
    {
        $this->organizationType = $organizationType;
        parent::__construct($organizationType);
    }

    public function getAll($pagination = false, $request = null)
    {
        $organizationType = $this->organizationType;

        if ($request) {
            $valueSearch = $request->get('name');
            if (!empty($valueSearch)) {
                $organizationType = $organizationType->where('name', 'LIKE', '%' . $valueSearch . '%');
            }
        }

        if ($pagination) {
            return $organizationType->orderBy('id', 'DESC')->paginate(15);
        }

        return $organizationType->orderBy('id', 'DESC')->get();
    }

    public function deleteOrganizationTypes($request)
    {
        try {
            $ids = $request->get('ids');
            if (!empty($ids)) {

                return $this->organizationType->whereIn('id', $ids)->delete();
            }

            return [
                'status' => false,
                'code' => 404,
                'message' => 'items not found.'
            ];
        } catch (\Illuminate\Database\QueryException $ex) {
            return [
                'status' => false,
                'code' => 400,
                'message' => 'Item can not delete!'
            ];
        } catch (Exception $ex) {
            return [
                'status' => false,
                'code' => 400,
                'message' => 'Delete fail.'
            ];
        }
    }

    public function filter($query, $column, $value)
    {
    }

}
