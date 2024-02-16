<?php

namespace App\Repositories\Reports;

use App\Models\DailyProductBalance;
use App\Repositories\BaseRepository;

class InventoryRepository extends BaseRepository
{
    protected $dailyProductBalance;

    public function __construct(DailyProductBalance $dailyProductBalance)
    {
        $this->dailyProductBalance = $dailyProductBalance;
        parent::__construct($dailyProductBalance);
    }

    public function getAll($request = null)
    {
        $rowsPerPage = 0;
        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $filterWarehouse = $request->get('filter_warehouse');
        $filterName = $request->get('filter_name');
        $filterStartDate = $request->get('filter_start_date');
        $filterEndDate = $request->get('filter_end_date');

        $query = $this->dailyProductBalance->with([
            'good' => function ($q) {
                $q->select([
                    'id',
                    'unit_of_measure_id',
                    'code',
                    'name'
                ]);
            },
            'good.unitOfMeasure' => function ($q) {
                $q->select([
                    'id',
                    'name'
                ]);
            },
            'internalOrg' => function ($q) {
                $q->select([
                    'id',
                    'name'
                ]);
            }
        ]);

        if (!empty($filterWarehouse) && $filterWarehouse !== 'all') {
            $query = $query->where('organization_id', $filterWarehouse);
        }

        // filter by code or name
        if (!empty($filterName)) {
            $query = $query->whereHas('good', function ($q) use ($filterName) {
                return $q
                    ->where('code', 'LIKE', '%'.$filterName.'%')
                    ->orWhere('name', 'LIKE', '%'.$filterName.'%');
            });
        }

        if ($rowsPerPage) {
            $pagination = $query->orderBy('id', 'DESC')->select([
                'id',
                'productable_id',
                'organization_id',
                'date',
                'opening_quantity'
            ])->paginate($rowsPerPage);

            $pagination->getCollection()->each(function ($dailyProduct) use ($filterStartDate, $filterEndDate, $filterWarehouse) {
                $dailyProduct->filter_start_date = $filterStartDate;
                $dailyProduct->filter_end_date = $filterEndDate;
                $dailyProduct->filter_warehouse = $filterWarehouse;

                $dailyProduct->append(['info_report_inventory']);
            });

            return $pagination;
        }

        $newQuery = $query->orderBy('id', 'DESC')->get([
            'id',
            'productable_id',
            'organization_id',
            'date',
            'opening_quantity'
        ]);

        $newQuery = $newQuery->map(function ($item) use ($filterEndDate, $filterStartDate, $filterWarehouse) {
            $item->filter_start_date = $filterStartDate;
            $item->filter_end_date = $filterEndDate;
            $item->filter_warehouse = $filterWarehouse;

            return $item;
        });

        return $newQuery->append(['info_report_inventory']);
    }
}
