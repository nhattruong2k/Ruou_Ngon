<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ReportPartyExport implements FromCollection, WithHeadings, WithMapping
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
            'Khách hàng',
            'Mã khách hàng',
            'Doanh số',
            'Doanh thu'
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
            'Khách hàng' => $row['name'],
            'Mã khách hàng' => $row['code'],
            'Doanh số' => $row['total_order_by_party'],
            'Doanh thu' => $row['total_payment_by_party']
        ];
    }
}
