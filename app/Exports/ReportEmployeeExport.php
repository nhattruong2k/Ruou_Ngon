<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ReportEmployeeExport implements FromCollection, WithHeadings, WithMapping
{
    protected $data;

    public function __construct($data)
    {
        $this->data  = $data;
    }
    /**
     * @return \Illuminate\Support\Collection
     */
    public function headings(): array
    {
        return [
            'Tên Nhân viên',
            'Mã Nhân viên',
            'Mục tiêu tháng',
            'Doanh thu',
            'Doanh số bán ra',
            'Chi phí'
        ];
    }
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->data;
    }

    public function map($row): array
    {
        return [
            'Tên Nhân viên' => $row['name'],
            'Mã Nhân viên' => $row['code'],
            'Mục tiêu tháng' => $row['total_tagert'],
            'Doanh số' => $row['total_order_by_employee'],
            'Doanh thu' => $row['total_payment_by_employee'],
            'Chi phí' => $row['total_order_gift_by_employee'],
        ];
    }
}
