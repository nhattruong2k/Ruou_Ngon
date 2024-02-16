// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{
      width: 1,
      height: 1,
    }}
  />
);

const ICONS = {
  ric_internal_orgs: icon('ric_internal_orgs'),
  ric_employee: icon('ric_employee'),
  ric_party: icon('ric_party'),
  menuItem: icon('ic_menu_item'),
  ric_permission: icon('ric_permission'),
  ric_import_warehouse: icon('ric_import_warehouse'),
  ric_export_warehouse: icon('ric_export_warehouse'),
  ric_file_manager: icon('ric_file_manager'),
  ric_product: icon('ric_product'),
  ric_order_sample: icon('ric_order_sample'),
  ric_order: icon('ric_order'),
  ric_order_gift: icon('ric_order_gift'),
  ric_payment: icon('ric_payment'),
  ric_return_order: icon('ric_return_order'),
  ric_target: icon('ric_target'),
  ric_payment_v2: icon('ric_payment_v2'),
  ric_report_employee: icon('ric_report_employee'),
  ric_history: icon('ric_history'),
  ric_report_IE: icon('ric_report_IE'),
  ric_file_report: icon('ric_file_report'),
  ric_report_bar: icon('ric_report_bar'),
  ric_report_add: icon('ric_report_add'),
  ric_good_report: icon('ric_good_report'),

  blog: icon('ic_blog'),
  cart: icon('ic_cart'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),

  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  phoneOutOne: icon('phone_call_1'),
  setting: icon('settings'),
  repair: icon('id_screwdriver-wrench'),
  contract: icon('ric_contract_line'),
};
const level1 = ['admin'];
const level2 = ['admin', 'accountant'];
const level3 = ['admin', 'sales'];
const level4 = ['admin', 'warehouse'];
const level5 = ['admin', 'accountant', 'sales', 'warehouse'];
const level6 = ['admin', 'sales', 'accountant'];
const level7 = ['admin', 'warehouse', 'accountant'];
const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'Hệ Thống',
    permissions: level6,
    items: [
      {
        title: 'Tổ chức',
        path: PATH_DASHBOARD.organiztion.list,
        icon: ICONS.ric_internal_orgs,
        permissions: level1,
      },
      {
        title: 'Nhân viên',
        path: PATH_DASHBOARD.employee.list,
        icon: ICONS.ric_employee,
        permissions: level1,
      },
      {
        title: 'Khách hàng',
        path: PATH_DASHBOARD.parties.root,
        icon: ICONS.ric_party,
        permissions: level6,
        children: [
          {
            title: 'Phân Loại Khách Hàng',
            path: PATH_DASHBOARD.parties.types,
            permissions: level1,
          },
          {
            title: 'Danh sách khách hàng',
            path: PATH_DASHBOARD.parties.list,
            permissions: level6,
          },
          {
            title: 'Hình Thức CSKH',
            path: PATH_DASHBOARD.crCategory.list,
            permissions: level3,
          },
          {
            title: 'Lịch sử CSKH',
            path: PATH_DASHBOARD.customerCare.list,
            permissions: level6,
          },
        ],
      },

      {
        title: 'Tin tức nội bộ',
        path: PATH_DASHBOARD.blog.list,
        icon: ICONS.blog,
        permissions: level5,
      },
      {
        title: 'Phân quyền',
        path: PATH_DASHBOARD.userPermistion.root,
        icon: ICONS.ric_permission,
        permissions: level1,
        children: [
          {
            title: 'Tài khoản',
            path: PATH_DASHBOARD.userPermistion.list,
            permissions: level1,
          },
          {
            title: 'Vai trò',
            path: PATH_DASHBOARD.userPermistion.roles,
            permissions: level1,
          },
          {
            title: 'Quyền',
            path: PATH_DASHBOARD.userPermistion.permistion,
            permissions: level1,
          },
        ],
      }
    ],
  },

  {
    subheader: 'Quản lý kho',
    permissions: level4,
    items: [
      {
        title: 'Nhập kho',
        path: PATH_DASHBOARD.importWarehouse.list,
        permissions: level4,
        icon: ICONS.ric_import_warehouse
      },
      {
        title: 'Xuất kho',
        path: PATH_DASHBOARD.exportWarehouse.list,
        permissions: level4,
        icon: ICONS.ric_export_warehouse
      },
    ],
  },

  {
    subheader: 'Bán hàng',
    permissions: level6,
    items: [
      {
        title: 'Mục tiêu tháng',
        path: PATH_DASHBOARD.tagertMonth.list,
        icon: ICONS.ric_target,
        permissions: level1,
      },
      {
        title: 'Quản lý đơn hàng',
        path: PATH_DASHBOARD.salesReceipt.root,
        icon: ICONS.ric_order,
        permissions: level6,
        children: [
          {
            title: 'Đơn hàng mẫu',
            path: PATH_DASHBOARD.orderSample.list,
            // icon: ICONS.ric_order_sample,
            permissions: level3,
          },
          {
            title: 'Tạo mới đơn hàng',
            path: PATH_DASHBOARD.salesReceipt.create,
            permissions: level3,
          },
          {
            title: 'Danh sách đơn hàng',
            path: PATH_DASHBOARD.salesReceipt.list,
            permissions: level6,
          },
          {
            title: 'Đơn hàng tặng',
            path: PATH_DASHBOARD.orderGift.list,
            // icon: ICONS.ric_order_gift,
            permissions: level3,
          },
          {
            title: 'Trả hàng',
            path: PATH_DASHBOARD.refundOrder.create,
            // icon: ICONS.ric_return_order,
            permissions: level3,
          },
        ]
      },
      {
        title: 'Thanh toán',
        path: PATH_DASHBOARD.paymentMultipleOrder.root,
        icon: ICONS.ric_payment_v2,
        permissions: level6,
        children: [
          {
            title: 'Tạo mới thanh toán',
            path: PATH_DASHBOARD.paymentMultipleOrder.create,
            permissions: level6,
          },
          {
            title: 'Quản lý thanh toán',
            path: PATH_DASHBOARD.paymentMultipleOrder.list,
            permissions: level6,
          },
        ],
      },
      {
        title: 'Hợp đồng',
        path: PATH_DASHBOARD.conclusionContract.list,
        icon: ICONS.contract,
        permissions: level1,
      },
      {
        title: 'Sản phẩm',
        path: PATH_DASHBOARD.good.root,
        icon: ICONS.ric_product,
        permissions: level1,
        children: [
          {
            title: 'Loại sản phẩm',
            path: PATH_DASHBOARD.good.category,
            permissions: level1,
          },
          {
            title: 'Sản phẩm',
            path: PATH_DASHBOARD.good.list,
            permissions: level1,
          },
        ],
      },
      {
        title: 'Quản lý hồ sơ',
        path: PATH_DASHBOARD.fileManager.list,
        icon: ICONS.ric_file_manager,
        permissions: level1,
      },
    ],
  },


  {
    subheader: 'Báo cáo',
    permissions: level6,
    items: [
      {
        title: 'Công việc hàng ngày',
        path: PATH_DASHBOARD.workDaily.list,
        permissions: level5,
        icon: ICONS.analytics,
      },
      {
        title: 'Xuất nhập tồn',
        path: PATH_DASHBOARD.importInventory.list,
        icon: ICONS.ric_report_IE,
        permissions: level7,
      },
      {
        title: 'Công nợ',
        path: PATH_DASHBOARD.debts.list,
        icon: ICONS.ric_file_report,
        permissions: level6,
      },
      {
        title: 'Doanh thu theo khách hàng',
        path: PATH_DASHBOARD.revenueCustomer.list,
        icon: ICONS.ric_report_bar,
        permissions: level6,
      },
      {
        title: 'Doanh thu theo nhân viên',
        path: PATH_DASHBOARD.revenueEmployee.list,
        icon: ICONS.ric_report_add,
        permissions: level6,
      },
      {
        title: 'Doanh số theo sản phẩm',
        path: PATH_DASHBOARD.goodReport.list,
        icon: ICONS.ric_good_report,
        permissions: level6,
      },
    ],
  },
];

export default navConfig;
