<?php
return [
    'functions' => [
        'import_buy' => 1, // nhập mua
        'import_orther' => 5, // nhập khác
        'import_transfer' => 3, // nhập chuyển
        'export_orther' => 2, // xuất khác
        'export_transfer' => 4, // xuất chuyển
        'sale_receipt' => 6, // bán hàng
        'refund' => 7, // Trả hàng
        'payment' => 8, // Thanh toán đơn hàng
        'refund_payment' => 9, // Thanh toán trả
        'gift' => 10, // Quà tặng
        'import_refund' => 11, // Nhập trả
        'party' => 12, // Khách hàng
    ],

    'function_code' => [
        'import_buy' => '', // nhập mua
        'import_orther' => '', // nhập khác
        'import_transfer' => '', // nhập chuyển
        'export_orther' => '', // xuất khác
        'export_transfer' => '', // xuất chuyển
        'sale_receipt' => '', // bán hàng
        'refund' => 'TH', // Trả hàng
        'payment' => 'TTBH', // Thanh toán đơn hàng
        'refund_payment' => '', // Thanh toán trả
        'gift' => '', // Quà tặng
        'import_refund' => '', // Nhập trả
    ],

    'function_types' => [
        'import_warehouse' => 1, // nhập kho
        'export_warehouse' => 2, // xuất kho
        'sale_receipt' => 3, // bán hàng
    ],

    'order_status' => [
        // status of warehouse
        'pending' => 1,
        'completed' => 2,
        'completed_transfer' => 3,

        // status of sale receipt
        'created_sale_receipt' => 4, // Đã tạo phiếu
        'pending_sale_receipt' => 5, // Chờ duyệt
        'confirm_sale_receipt' => 6, // Duyệt
        'reject_sale_receipt' => 7, // Từ chối
        'paying_sale_receipt' => 8, // Đang thanh toán
        'success_sale_receipt' => 9, // Hoàn thành
        'refund_sale_receipt' => 10, // Đơn trả lại
        'pending_export' => 11, // Chờ xuất kho
        'exported' => 12, // Đã xuất kho
        'success_payment' => 16, // Đã thanh toán
    ],

    'payment_method' => [
        'cash' => 1, // Tiền mặt
        'transfer' => 2, // Chuyển khoản
    ],

    'payment_status' => [
        'pending' => 1, // Chờ duyệt
        'approved' => 2, // Đã duyệt
        'decline' => 3, // Từ chối
    ],

    'notification_status' => [
        'unread' => 0,
        'read' => 1,
        'not_viewed' => 0,
        'viewed' => 1
    ],

    'contract_type' => [
        'contract_good' => 1,
        'contract_travel' => 2
    ],

    'contract_status' => [
        'pending' => 1,
        'confirm' => 2,
    ],

    'product_status' => [
        'new' => 1,
    ],

    'productable_type' => [
        'good' => 'App\Models\Good',
    ],

    'payment_type' => [
        'debt' => 1, // Thanh toán công nợ
        'order' => 2, // Thanh toán đơn hàng
    ],
];
