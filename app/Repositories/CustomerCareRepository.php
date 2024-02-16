<?php

namespace App\Repositories;

use App\Models\CustomerCare;
use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\Auth;

class CustomerCareRepository extends BaseRepository
{
    protected $customerCare;

    public function __construct(CustomerCare $customerCare)
    {
        $this->customerCare = $customerCare;
        parent::__construct($customerCare);
    }

    public function filter($query, $column, $value)
    {
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        $user = Auth::user();

        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');

        $query = $this->customerCare->with(['customerCareType', 'party',  'party.employee'])
            ->when(($request->filled('name')), function ($query) use ($request) {

                return $query->whereRelation('party', 'name', 'LIKE', '%' . $request->get('name') . '%');
            })
            ->when(($request->get('filter_start_date')) && $request->filled('filter_end_date'), function ($query) use ($request) {

                return $query->whereBetween('date', [$request['filter_start_date'], $request['filter_end_date']]);
            })
            ->when(
                $user->hasRole('accountant'),
                function ($query) use ($user) {
                    return $query->whereRelation('party.employee', 'internal_org_id', '=', $user->internal_org_id);
                }
            )
            ->when(
                $user->hasRole('sales'),
                function ($query) use ($user) {
                    return $query->whereRelation('party', 'created_by', '=', $user->id);
                }
            );

        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }

        return $query->orderBy('id', 'DESC')->get();
    }
}
