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
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  phoneOutOne: icon('phone_call_1'),
  setting: icon('settings'),
  repair: icon('id_screwdriver-wrench'),
};
const level1 = ['admin'];
const level2 = ['admin', 'manager'];
const level3 = ['admin', 'manager', 'user'];
const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'Hệ Thống',
    permissions: level3,
    items: [
      {
        title: 'Tổ chức',
        path: PATH_DASHBOARD.organiztion.list,
        icon: ICONS.dashboard,
        permissions: level3,
      },
      {
        title: 'Nhân viên',
        path: PATH_DASHBOARD.employee.list,
        icon: ICONS.ecommerce,
        permissions: level3,
      },
      {
        title: 'Danh mục',
        path: PATH_DASHBOARD.crCategory.list,
        icon: ICONS.menuItem,
        permissions: level3,
      },
      {
        title: 'Khách hàng',
        path: PATH_DASHBOARD.parties.root,
        icon: ICONS.user,
        permissions: level3,
        children: [
          {
            title: 'Loại khách hàng',
            path: PATH_DASHBOARD.parties.types,
            permissions: level3,
          },
          {
            title: 'Khách hàng',
            path: PATH_DASHBOARD.parties.list,
            permissions: level3,
          },
        ],
      },
      {
        title: 'Quản lý hồ sơ',
        path: PATH_DASHBOARD.fileManager.list,
        icon: ICONS.menuItem,
        permissions: level3,
      },
      {
        title: 'Phân quyền',
        path: PATH_DASHBOARD.userPermistion.root,
        icon: ICONS.banking,
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
      },
    ],
  },

  {
    subheader: 'Bán hàng',
    permissions: level1,
    items: [
      {
        title: 'Sản phẩm',
        path: PATH_DASHBOARD.good.root,
        icon: ICONS.menuItem,
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
        title: 'Mục tiêu tháng',
        path: PATH_DASHBOARD.tagertMonth.list,
        icon: ICONS.external,
      },
      {
        title: 'Đơn hàng mẫu',
        path: PATH_DASHBOARD.orderSample.list,
        icon: ICONS.booking,
      },
      {
        title: 'Quản lý đơn hàng',
        path: PATH_DASHBOARD.salesReceipt.root,
        icon: ICONS.invoice,
        children: [
          {
            title: 'Danh sách',
            path: PATH_DASHBOARD.salesReceipt.list,
          },
          {
            title: 'Tạo đơn hàng',
            path: PATH_DASHBOARD.salesReceipt.create,
          }
        ]
      },
      {
        title: 'Đơn hàng tặng',
        path: PATH_DASHBOARD.orderGift.list,
        icon: ICONS.label
      },
      {
        title: 'Trả hàng',
        path: PATH_DASHBOARD.refundOrder.create,
        icon: ICONS.menuItem,
        permissions: level1,

      },
      {
        title: 'Quản lý thanh toán',
        path: PATH_DASHBOARD.paymentMultipleOrder.root,
        icon: ICONS.menuItem,
        permissions: level1,
        children: [
          {
            title: 'Danh sách',
            path: PATH_DASHBOARD.paymentMultipleOrder.list,
            permissions: level1,
          },
          {
            title: 'Tạo thanh toán',
            path: PATH_DASHBOARD.paymentMultipleOrder.create,
            permissions: level1,
          },
        ],
      },
    ],
  },
  {
    subheader: 'Kho',
    permissions: level2,
    items: [
      {
        title: 'Xuất - Nhập kho',
        path: PATH_DASHBOARD.order.root,
        icon: ICONS.menuItem,
        permissions: level2,
        children: [
          {
            title: 'Nhập kho',
            path: PATH_DASHBOARD.importWarehouse.list,
            permissions: level2,
          },
          {
            title: 'Xuất kho',
            path: PATH_DASHBOARD.exportWarehouse.list,
            permissions: level2,
          },
        ],
      },
    ],
  },
  {
    subheader: 'Công việc',
    permissions: level3,
    items: [
      {
        title: 'Nhân viên báo cáo',
        path: PATH_DASHBOARD.workDaily.list,
        permissions: level3,
      },
    ],
  },
  {
    subheader: 'Báo cáo',
    items: [
      {
        title: 'Lịch sử khách hàng',
        path: PATH_DASHBOARD.customerCare.list,
      },
      {
        title: 'Công nợ',
        path: PATH_DASHBOARD.debts.list,
      },
      {
        title: 'Doanh thu theo khách hàng',
        path: PATH_DASHBOARD.revenueCustomer.list,
      },
      {
        title: 'Doanh thu theo nhân viên',
        path: PATH_DASHBOARD.revenueEmployee.list,
      },
      {
        title: 'Xuất nhập tồn',
        path: PATH_DASHBOARD.importInventory.list,
      },
    ],
  },
];

export default navConfig;
