<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyProductBalance extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'daily_product_balances';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'gl_account_id',
        'productable_type',
        'productable_id',
        'organization_id',
        'product_status_id',
        'date',
        'opening_value',
        'opening_quantity',
    ];

    public function internalOrg()
    {
        return $this->belongsTo(InternalOrg::class, 'organization_id');
    }

    public function productable()
    {
        return $this->morphTo();
    }

    public static function getBalance($organizationId, $productId, $productType)
    {
        $balance = self::where([
            ['productable_id', $productId],
            ['productable_type', $productType]
        ]);

        if (isset($organizationId)) {
            $balance->where('organization_id', $organizationId);
        }

        return $balance->select('id', 'opening_quantity')->first();
    }

    public function updateDailyBalanceQuantity($orderItem, $isUpdate = false)
    {
        $balance = $this->getBalance(
            $orderItem->warehouse_id,
            $orderItem->productable_id,
            $orderItem->productable_type
        );

        if (empty($balance)) {
            return false;
        }

        if ($orderItem->refunded === 1) { // add new condition to check if item is refunded
            $balance->update([
                'opening_quantity' => $balance->opening_quantity + $orderItem->quantity
            ]);
        } else {
            if ($balance->opening_quantity > 0 && $balance->opening_quantity >= $orderItem->quantity && $isUpdate) {
                $balance->update([
                    'opening_quantity' => $balance->opening_quantity - $orderItem->quantity
                ]);
            } else {
                $balance->update([
                    'opening_quantity' => $balance->opening_quantity + $orderItem->quantity
                ]);
            }
        }
    }

    public function good()
    {
        return $this->belongsTo(Good::class, 'productable_id', 'id');
    }

    public function getInfoReportInventoryAttribute()
    {
        $imports = 0;
        $exports = 0;
        $beginInventory = 0;
        $endInventory = 0;

        if (isset($this->good)) {
            $this->good->filter_start_date = $this->filter_start_date;
            $this->good->filter_end_date = $this->filter_end_date;
            $this->good->filter_warehouse = $this->organization_id;

            $imports = $this->good?->total_import;
            $exports = $this->good?->total_export;
            $beginInventory = $this->good?->begin_inventory;
            $endInventory = $beginInventory + $imports - $exports;
        }

        return [
            'good_import' => $imports,
            'good_export' => $exports,
            'begin_inventory' => $beginInventory,
            'end_inventory' => $endInventory
        ];
    }

    public function updateQuantityWhenExport($orderItems, $warehouseId)
    {
        $date = Carbon::now();
        $dateNow = $date->format('Y-m-d');
        $notEnoughGoods = false;

        foreach ($orderItems as $dataItem) {
            $queryDailyProduct = $this
                ->where('organization_id', $warehouseId)
                ->where('productable_id', $dataItem['good_id']);

            $queryClone = clone $queryDailyProduct;

            if (!$queryClone->where('opening_quantity', '>=', $dataItem['quantity'])->exists()) {
                $notEnoughGoods = true;
            }

            $canUpdate = $queryDailyProduct->exists();

            if ($canUpdate) {
                $dailyProduct = $queryDailyProduct->get();
                $dailyProduct = $dailyProduct->map(function ($item) use ($dataItem) {
                    $item['opening_quantity'] -= $dataItem['quantity'];
                    return $item;
                });
                $queryDailyProduct->update([
                    'opening_quantity' => $dailyProduct->first()['opening_quantity'],
                ]);
            } else {
                $this->create([
                    'productable_type' => config('contants.productable_type.good'),
                    'productable_id' => $dataItem['good_id'],
                    'organization_id' => $warehouseId,
                    'product_status_id' => config('contants.product_status.new'),
                    'date' => $dateNow,
                    'opening_quantity' => -$dataItem['quantity']
                ]);
            }
        }

        return $notEnoughGoods;
    }
}
