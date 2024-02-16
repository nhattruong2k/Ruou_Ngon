<?php

namespace App\Services;

use App\Imports\SaleContactImport;
use App\Imports\ServiceContactImport;
use App\Imports\CustomerContactImport;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Exception;

class ImportContactService
{
    public function import($request)
    {
        try {
            switch ($request->type) {
                case 'sale':
                    Excel::import(new SaleContactImport($request), $request->file('file'));
                    break;
                case 'service':
                    Excel::import(new ServiceContactImport($request), $request->file('file'));
                    break;
                case 'customer':
                    Excel::import(new CustomerContactImport($request), $request->file('file'));
                default:
                    break;
            }
        } catch (Exception $exception) {
            Log::error('Throw exception ' . $exception->getFile().' Get message '. $exception->getMessage());
        }
    }
}
