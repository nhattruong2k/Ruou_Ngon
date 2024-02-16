<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::get('/get-url', function () {
//     Mail::send([], [], function ($message) {
//         $message->to('quanghuy060392@gmail.com', "huy")->subject('gửi mail rrrr')->setBody('<p>bádjahsdhasdhj</p>',  'text/html');
//     });
// });
Route::get('/get-url', function () {
    return asset('');
});
Route::group([
    'prefix' => 'auth'
], function () {
    Route::post('login', [\App\Http\Controllers\API\V1\AuthController::class, 'login'])->name('auth.login');
    Route::post('logout', [\App\Http\Controllers\API\V1\AuthController::class, 'logout'])->name('auth.logout');
    Route::post('refresh', [\App\Http\Controllers\API\V1\AuthController::class, 'refresh'])->name('auth.refresh');
    Route::get('me', [\App\Http\Controllers\API\V1\AuthController::class, 'me'])->name('auth.me');
    Route::post('verify-email-reset-password', [\App\Http\Controllers\API\V1\UserController::class, 'verifyEmailResetPassword'])->name('auth.verify-email-reset-password');
    Route::post('reset-password', [\App\Http\Controllers\API\V1\UserController::class, 'resetPassword'])->name('auth.reset-password');
});
Route::group([
    'middleware' => 'jwt.verify',
    'namespace' => 'App\\Http\\Controllers\\API\V1'
], function () {
    Route::get('wards/{id}', [\App\Http\Controllers\API\V1\GeographicBoundaryController::class, 'getWardOfDistrict']);

    Route::post(
        'rm-order-item-warehouse-export',
        [\App\Http\Controllers\API\V1\Orders\WarehouseExportController::class, 'removeOrderItems']
    );
    Route::post(
        'check-quantity-before-create',
        [\App\Http\Controllers\API\V1\Orders\WarehouseExportController::class, 'checkQuantityBeforeCreate']
    );
    Route::get(
        'get-order-export-by-id/{id}',
        [\App\Http\Controllers\API\V1\Orders\WarehouseExportController::class, 'getOrderExportById']
    );

    Route::post('rm-order-import-warehouse', [\App\Http\Controllers\API\V1\Orders\ImportWarehouseController::class, 'removeItems']);
    Route::get('get-order-refund-by-id/{id}', [\App\Http\Controllers\API\V1\Orders\ImportWarehouseController::class, 'getOrderRefundById']);
    Route::get('get-order-import-by-id/{id}', [\App\Http\Controllers\API\V1\Orders\ImportWarehouseController::class, 'getOrderImportById']);


    Route::post('remove-good-brand', [\App\Http\Controllers\API\V1\GoodBrandController::class, 'removeItems']);
    Route::post('get-good-by-goodCategory', [\App\Http\Controllers\API\V1\GoodController::class, 'getGoodByCategory']);

    Route::post('get-parties-by-employee', [\App\Http\Controllers\API\V1\PartiesController::class, 'getPartiesByEmployee']);
    Route::get('get-debt-current-by-party/{party_id}', [\App\Http\Controllers\API\V1\PartiesController::class, 'getDebtCurrentByParty']);
    Route::get('get-party-by-id/{party_id}', [\App\Http\Controllers\API\V1\PartiesController::class, 'getPartyById']);

    Route::post('get-sale-receipt-by-id', [\App\Http\Controllers\API\V1\Orders\SaleReceiptController::class, 'getSaleReceiptById']);
    Route::post('rm-sales-receipt', [\App\Http\Controllers\API\V1\Orders\SaleReceiptController::class, 'removeItems']);
    Route::post('rm-order-item-sales-receipt', [\App\Http\Controllers\API\V1\Orders\SaleReceiptController::class, 'removeOrderItems']);
    Route::post('order-refund', [\App\Http\Controllers\API\V1\Orders\SaleReceiptController::class, 'createOrderRefund']);
    Route::get('get-good-inventory/{warehouse_id}', [\App\Http\Controllers\API\V1\Orders\SaleReceiptController::class, 'getGoodInventory']);

    Route::post('get-order-gift-by-id', [\App\Http\Controllers\API\V1\Orders\OrderGiftController::class, 'getOrderGiftById']);
    Route::post('rm-order-gift', [\App\Http\Controllers\API\V1\Orders\OrderGiftController::class, 'removeItems']);
    Route::post('rm-order-item-order-gift', [\App\Http\Controllers\API\V1\Orders\OrderGiftController::class, 'removeOrderItems']);
    Route::post('rm-gift-item-order-gift', [\App\Http\Controllers\API\V1\Orders\OrderGiftController::class, 'removeGiftItems']);

    // Export Excel is Customer
    Route::get(
        'exportExcel-customer',
        [\App\Http\Controllers\API\V1\CustomerCareController::class, 'exportExcel']
    )->name('exportExcel-customer');
    // Export Excel is workDaily
    Route::get(
        'exportExcel-workDaily',
        [\App\Http\Controllers\API\V1\DailyWorkController::class, 'exportExcel']
    )->name('exportExcel-workDaily');

    //ORDER
    Route::get(
        'get-order-by-party',
        [\App\Http\Controllers\API\V1\Orders\PaymentOrderController::class, 'getOrderByParty']
    )->name('get-order-by-party');
    Route::get('get-order-refund-by-party', [\App\Http\Controllers\API\V1\Orders\SaleReceiptController::class, 'getOrderRefundByParty']);
    Route::post('create-refund-order', [\App\Http\Controllers\API\V1\Orders\SaleReceiptController::class, 'createOrderRefundV2']);
    Route::post('update-order-refund/{id}', [\App\Http\Controllers\API\V1\Orders\ImportWarehouseController::class, 'updateOrderRefund']);

    //Report
    Route::get('get-party-reports', [\App\Http\Controllers\API\V1\ReportController::class, 'getPartyReports'])->name('get-party-reports');
    Route::get(
        'export-excel-party-reports',
        [\App\Http\Controllers\API\V1\ReportController::class, 'exportExcelPartyReports']
    )->name('export-excel-party-reports');
    Route::get(
        'get-employee-reports',
        [\App\Http\Controllers\API\V1\ReportController::class, 'getEmployeeReports']
    )->name('get-employee-reports');
    Route::get(
        'export-excel-employee-reports',
        [\App\Http\Controllers\API\V1\ReportController::class, 'exportExcelEmployeeReports']
    )->name('export-excel-employee-reports');

    //Download file
    Route::get('download-file/{file}/{folder}', function ($file, $folder) {
        $file = storage_path('app/public/') . $folder . '/' . $file;
        if (file_exists($file)) {
            return response()->download($file);
        }
        return response()->json(['error' => 'Not found file'], 404);
    });

    Route::post('viewed-notification', [\App\Http\Controllers\API\V1\NotificationController::class, 'seenNoti']);

    //contract
    Route::post('rm-conclusion-contract', [\App\Http\Controllers\API\V1\ConclusionContractController::class, 'removeItems']);
    //blog
    Route::get('get-blog-by-id/{blog_id}', [\App\Http\Controllers\API\V1\BlogController::class, 'getBlogById']);
    Route::post('remove-file/{id}', [\App\Http\Controllers\API\V1\BlogController::class, 'removeFile']);

    // Account
    Route::post('update-password', [\App\Http\Controllers\API\V1\UserController::class, 'updatePassword']);

    //Dashboard
    Route::get(
        'get-employee-sales',
        [\App\Http\Controllers\API\V1\DashboardController::class, 'getEmployeeSale']
    )->name('get-employee-sales');
    Route::get(
        'get-employee-admin',
        [\App\Http\Controllers\API\V1\DashboardController::class, 'getEmployeeAdmin']
    )->name('get-employee-admin');

    Route::apiResources([
        'employees' => EmployeeController::class,
        'internal-orgs' => InternalOrganizationController::class,
        'roles' => RoleController::class,
        'permistions' => PermistionController::class,
        'functions' => FunctionController::class,
        'users' => UserController::class,
        'goods' => GoodController::class,
        'good-categories' => GoodCategoryController::class,
        'good-brands' => GoodBrandController::class,
        'customer-care' => CustomerCareController::class,
        'unit-of-measures' => UnitOfMeasureController::class,
        'geographic-boundaries' => GeographicBoundaryController::class,
        'parties' => PartiesController::class,
        'partyTypes' => PartyTypesController::class,
        'cr-categories' => CrCategoryController::class,
        'daily-works' => DailyWorkController::class,
        'warehouse-export' => \Orders\WarehouseExportController::class,
        'order-import-warehouses' => \Orders\ImportWarehouseController::class,
        'tagert-month' => TagertMonthController::class,
        'order-gift' => \Orders\OrderGiftController::class,
        'sales-receipt' => \Orders\SaleReceiptController::class,
        'payments' => PaymentController::class,
        'payment-multiple-orders' => \Orders\PaymentOrderController::class,
        'report-debts' => \Reports\DebtController::class,
        'report-inventory' => \Reports\InventoryController::class,
        'notifications' => NotificationController::class,
        'order-samples' => OrderSampleController::class,
        'file-managements' => FileManagementController::class,
        'conclusion-contract' => ConclusionContractController::class,
        'blogs' => BlogController::class,
        'good-reports' => \Reports\GoodReportController::class,
        'dashboard' => DashboardController::class,
    ]);
});
