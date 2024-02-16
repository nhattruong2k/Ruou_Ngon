<?php

namespace App\Console\Commands;

use App\Models\DailyProductBalance;
use App\Models\MonthlyProductBalance;
use Carbon\Carbon;
use Illuminate\Console\Command;

class MonthlyInventoryCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'balanced:monthly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update inventory monthly';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $date = Carbon::now()->add(-1, 'month');
        $month = $date->format('m');
        $year = $date->format('Y');
        $dailyBalances = DailyProductBalance::all();
        if ($dailyBalances->count() > 0) {
            foreach ($dailyBalances as $item_daily) {
                $monthBalance = MonthlyProductBalance::where('productable_id', $item_daily->productable_id)
                    ->where('organization_id', $item_daily->organization_id)
                    ->whereYear('year_month', $year)
                    ->whereMonth('year_month', $month)
                    ->first();
                if ($monthBalance) {
                    $params = $monthBalance->toArray();
                    $params['closing_quantity'] = $item_daily->opening_quantity;
                    $monthBalance->update($params);
                }
                $paramsCurrentMonth['productable_type'] = $item_daily->productable_type;
                $paramsCurrentMonth['productable_id'] = $item_daily->productable_id;
                $paramsCurrentMonth['organization_id'] = $item_daily->organization_id;
                $paramsCurrentMonth['year_month'] = Carbon::now()->format('Y-m-d');
                $paramsCurrentMonth['opening_quantity'] = $item_daily->opening_quantity;
                $paramsCurrentMonth['closing_quantity'] = $item_daily->opening_quantity;
                $paramsCurrentMonth['inward_quantity'] = 0;
                $paramsCurrentMonth['outward_quantity'] = 0;
                MonthlyProductBalance::create($paramsCurrentMonth);
            }
        }
    }
}
