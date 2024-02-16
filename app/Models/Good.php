<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Good extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'goods';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'good_category_id',
        'unit_of_measure_id',
        'name',
        'code',
        'description',
        'volume',
        'alcohol_level',
        'origin',
        'photo',
        'price',
        'discount_rate',
        'max_discount_rate',
        'created_by',
        'updated_by',
        'photo_export',
        'product_area',
        'apllelation',
        'producer',
        'season',
        'grape',
        'attachedfiles',
        'exp',
    ];

    public $timestamps = true;

    protected $appends = ['quatity_order', 'total_sale'];

    public function goodCategory()
    {
        return $this->belongsTo(GoodCategories::class);
    }

    public function goodBrand()
    {
        return $this->belongsTo(GoodBrand::class);
    }

    public function unitOfMeasure()
    {
        return $this->belongsTo(UnitOfMeasure::class);
    }

    public function priceItems()
    {
        return $this->morphMany(PriceItem::class, 'productable');
    }

    public function serviceAppointment()
    {
        return $this->morphMany(ServiceAppointment::class, 'productable');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'good_id');
    }

    public function monthlyProductBalance()
    {
        return $this->hasMany(MonthlyProductBalance::class, 'productable_id', 'id');
    }

    /*
     * Method used for function report inventory
     * If using it please check variables filter_start_date and filter_end_date
     * */
    private function totalGoodByType($type, $filterStartDate, $filterEndDate, $filterWarehouse)
    {
        $functionIns = [];
        $statusIns = [];

        if ($type === 'import') {
            $functionIns = [
                config('contants.functions.import_buy'),
                config('contants.functions.import_orther'),
                config('contants.functions.import_transfer'),
                config('contants.functions.refund'),
            ];

            $statusIns = [
                config('contants.order_status.completed'),
                config('contants.order_status.refund_sale_receipt'),
                config('contants.order_status.exported'),
            ];
        } else {
            $functionIns = [
                config('contants.functions.export_orther'),
                config('contants.functions.export_transfer'),
                config('contants.functions.sale_receipt'),
                config('contants.functions.gift'),
            ];

            $statusIns = [
                config('contants.order_status.completed'),
                config('contants.order_status.exported'),
            ];
        }

        $total = $this->orderItems()->whereHas(
            'order',
            function ($q) use ($functionIns, $statusIns, $filterStartDate, $filterEndDate, $filterWarehouse) {
                return $q
                    ->whereIn('order_status_id', $statusIns)
                    ->whereIn('function_id', $functionIns)
                    ->whereBetween('date', [$filterStartDate, $filterEndDate]);
            }
        )->where('warehouse_id', $filterWarehouse)->get();

        return $total->sum('quantity');
    }

    public function getTotalImportAttribute()
    {
        $filterStartDate = Carbon::parse($this->filter_start_date);
        $filterEndDate = Carbon::parse($this->filter_end_date);
        $filterWarehouse = $this->filter_warehouse;

        return $this->totalGoodByType('import', $filterStartDate, $filterEndDate, $filterWarehouse);
    }

    public function getTotalExportAttribute()
    {
        $filterStartDate = Carbon::parse($this->filter_start_date);
        $filterEndDate = Carbon::parse($this->filter_end_date);
        $filterWarehouse = $this->filter_warehouse;

        return $this->totalGoodByType('export', $filterStartDate, $filterEndDate, $filterWarehouse);
    }

    public function getBeginInventoryAttribute()
    {
        $filterStartDate = Carbon::parse($this->filter_start_date);
        $filterWarehouse = $this->filter_warehouse;
        $begin_inventory_date = Carbon::parse($filterStartDate)->add(-1, 'day');
        $cloneDate = $begin_inventory_date->copy();
        $startMonth = $cloneDate->startOfMonth();

        $begin_inventory_import = $this->totalGoodByType('import', $startMonth, $begin_inventory_date, $filterWarehouse);
        $begin_inventory_export = $this->totalGoodByType('export', $startMonth, $begin_inventory_date, $filterWarehouse);

        $monthlyProduct = (int) $this->monthlyProductBalance()
            ->whereMonth('year_month', $startMonth)
            ->where('organization_id', $filterWarehouse)
            ->first()?->opening_quantity;

        return ($monthlyProduct + $begin_inventory_import - $begin_inventory_export) ?? 0;
    }

    private function totalOrder()
    {
        $functionIns = [
            config('contants.functions.sale_receipt') // 6 bán hàng
        ];
        $functionRefundedIns = [config('contants.functions.refund')]; // 7 Trả hàng

        $statusIns = [
            config('contants.order_status.reject_sale_receipt') // 7 Từ chối
        ];

        $query = $this->orderItems()->whereHas(
            'order',
            function ($q) use ($functionIns, $statusIns, $functionRefundedIns) {
                return  $q->whereIn('function_id',  $functionIns)->whereNotIn('order_status_id', $statusIns);
            }
        );

        return $query;
    }

    public function getQuatityOrderAttribute()
    {
        return $this->totalOrder()->sum('quantity');
    }

    public function getTotalSaleAttribute()
    {
        $totalSale = 0;
        $products = $this->totalOrder()->get();
        foreach( $products as  $product){
            $totalSale += $product['quantity'] * $product['discount'];
        }
        return $totalSale;
    }
    // --------------------------------------------------------------------

}
