export const PARTY_TYPE = {
  flt: 1, // Khách lẻ,
  installment_partner: 7, // đối tác trả góp
};

export const FUNCTIONS = {
  import_buy: 1, // nhập mua
  import_orther: 5, // nhập khác
  import_transfer: 3, // nhập chuyển
  export_orther: 2, // xuất khác
  export_transfer: 4, // xuất chuyển
  payment_order: { id: 8, code: 'TTBH' }, // thanh toán bán hàng
  sale_receipt: 6, // bán hàng
  gift: 10, // Quà tặng
  import_refund: 11, // Nhập trả
  party: 12, // Khách hàng
  refund: 7, // Trả hàng
};

export const STATUSES = {
  pending: 1,
  confirm: 2,
  success: 3,

  // status of sale receipt
  created_sale_receipt: 4, // Đã tạo phiếu
  pending_sale_receipt: 5, // Chờ duyệt
  confirm_sale_receipt: 6, // Duyệt
  reject_sale_receipt: 7, // Từ chối
  paying_sale_receipt: 8, // Đang thanh toán
  success_sale_receipt: 9, // Hoàn thành
  refund_sale_receipt: 10, // Đơn trả lại
  pending_export: 11, // Chờ xuất kho
  exported: 12, // Đã xuất kho
  success_payment: 16, // Đã thanh toán
};

export const PAGES_ID = {
  internal_orgs: 1,
  employee: 2,
  categories: 3,
  parties: 4,
};

export const FOLDER_IMAGE = {
  user: '__employee_photos__',
  good: '__good_photos__',
  party_attachment: '__party_attachment__',
  payment_attachment: '__payment_attachment__',
  payment_photos: '__payment_photos__',
  file_managements: '__file_managements__',
  good_attachment: '__good_attachments__',
  blog_attachment: '__blog_attachments__',
};

export const FOLDER_FILES = {
  conclusionContract: '__contract_attachment__',
};

export const NOTIFICATION_STATUS = {
  unread: 0,
  read: 1,
  not_viewed: 0,
  viewed: 1,
};

export const CONTRACT_TYPES = {
  good: 1, // hợp đồng sản phẩm
  travel: 2, // hợp đồng du lịch
}

export const PAYMENT_TYPE = {
  debt: 1, // Thanh toán công nợ
  order: 2, // Thanh toán đơn hàng
};

export const COOKIE_TABLE_COLUMN = {
  good: 'goodColumns',
};