<?php

namespace App\Exports;

use App\Models\CustomerCare;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomerCareExport implements FromCollection, WithHeadings, WithMapping
{
    protected $customerCareRepository;

    public function __construct($customerCareRepository)
    {
        $this->customerCareRepository  = $customerCareRepository;
    }
     /**
     * @return \Illuminate\Support\Collection
     */
    public function headings(): array
    {
        return [
            'Ngày báo cáo',
            'Lịch sử chăm sóc',
            'Tên khách hàng',
            'Người tạo',
            'Mô tả',
        ];
    }
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->customerCareRepository;
    }

    public function map($row): array
    {   
        return [
            'Ngày báo cáo' => !is_null($row['date']) ? trim($row['date']) : '',
            'Lịch sử chăm sóc' => !is_null($row['customerCareType']['name'])? trim($row['customerCareType']['name']) : '',
            'Tên khách hàng' => !is_null($row['party']) ? trim($row['party']['name']) : '',
            'Người tạo' => !is_null($row['party']['employee']) ? trim($row['party']['employee']['name']) : '',
            'Mô tả' => !is_null($row['description']) ? trim($row['description']) : '',
        ];
    }
}
