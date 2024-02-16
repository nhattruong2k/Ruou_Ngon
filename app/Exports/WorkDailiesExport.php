<?php

namespace App\Exports;

use App\Models\DailyWork;
use Maatwebsite\Excel\Concerns\FromCollection;
use Exception;
use App\Exceptions\InternalErrorException;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;


class WorkDailiesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $dailyWork;

    public function __construct($dailyWork)
    {
        $this->dailyWork  = $dailyWork;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function headings(): array
    {
        return [
            'Nhân viên báo cáo',
            'Ngày báo cáo',
            // 'Danh sách công việc',
            'Nội dung công việc',
        ];
    }

    /**
     * @return \Illuminate\Support\Collection
     */

    public function collection()
    {
        return $this->dailyWork;
    }

    public function map($row): array
    {
        // $listWorkCategories = !empty(($row['workCategories'])) ? $row['workCategories'] : [];
        // $strWorkCategories = '';
        // if (count($listWorkCategories) > 0) {
        //     foreach ($listWorkCategories as $key => $workCategory) {
        //         $strWorkCategories .= $workCategory->name . ', ';
        //     }
        // }
        return [
            // dd(empty(trim($row['orther_work']))),
            'Nhân viên báo cáo' => trim($row['employee']['name']),
            'Ngày báo cáo' => trim($row['date']),
            // 'Danh sách công việc' => trim(rtrim($strWorkCategories, ', ')),
            'Nội dung công việc' => empty(trim($row['orther_work'])) ? trim($row['orther_work']) : '',
        ];
    }
}
