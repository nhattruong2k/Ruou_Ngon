// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  // fileManager: path(ROOTS_DASHBOARD, '/files-manager'),
  permissionDenied: path(ROOTS_DASHBOARD, '/permission-denied'),
  blank: path(ROOTS_DASHBOARD, '/blank'),
  general: {
    app: path(ROOTS_DASHBOARD, '/app'),
    ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    banking: path(ROOTS_DASHBOARD, '/banking'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
    file: path(ROOTS_DASHBOARD, '/file'),
  },
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    new: path(ROOTS_DASHBOARD, '/user/new'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    account: path(ROOTS_DASHBOARD, '/user/account'),
    edit: (name) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
  },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
    new: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    view: (name) => path(ROOTS_DASHBOARD, `/e-commerce/product/${name}`),
    edit: (name) => path(ROOTS_DASHBOARD, `/e-commerce/product/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    demoView: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-air-force-1-ndestrukt'),
  },
  invoice: {
    root: path(ROOTS_DASHBOARD, '/invoice'),
    list: path(ROOTS_DASHBOARD, '/invoice/list'),
    new: path(ROOTS_DASHBOARD, '/invoice/new'),
    view: (id) => path(ROOTS_DASHBOARD, `/invoice/${id}`),
    edit: (id) => path(ROOTS_DASHBOARD, `/invoice/${id}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1/edit'),
    demoView: path(ROOTS_DASHBOARD, '/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5'),
  },
  organiztion: {
    root: path(ROOTS_DASHBOARD, '/internal-organization'),
    list: path(ROOTS_DASHBOARD, '/internal-organization/list'),
  },
  employee: {
    root: path(ROOTS_DASHBOARD, '/employee'),
    list: path(ROOTS_DASHBOARD, '/employee/list'),
  },
  employment: {
    root: path(ROOTS_DASHBOARD, '/employment'),
    list: path(ROOTS_DASHBOARD, '/employment/list'),
  },
  parties: {
    root: path(ROOTS_DASHBOARD, '/parties'),
    list: path(ROOTS_DASHBOARD, '/parties/list'),
    types: path(ROOTS_DASHBOARD, '/parties/types'),
    search: (id) => path(ROOTS_DASHBOARD, `/parties/list/${id}`),
  },
  partner: {
    root: path(ROOTS_DASHBOARD, '/partner'),
    list: path(ROOTS_DASHBOARD, '/partner/list'),
  },
  vehicle: {
    root: path(ROOTS_DASHBOARD, '/vehicle'),
    list: path(ROOTS_DASHBOARD, '/vehicle/list'),
  },
  good: {
    root: path(ROOTS_DASHBOARD, '/good'),
    list: path(ROOTS_DASHBOARD, '/good/list'),
    category: path(ROOTS_DASHBOARD, '/good/category'),
  },

  price: {
    root: path(ROOTS_DASHBOARD, '/price'),
    list: path(ROOTS_DASHBOARD, '/price/list'),
  },
  vehiclePrice: {
    root: path(ROOTS_DASHBOARD, '/vehicle-price'),
    list: path(ROOTS_DASHBOARD, '/vehicle-price/list'),
  },
  userPermistion: {
    root: path(ROOTS_DASHBOARD, '/user'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    roles: path(ROOTS_DASHBOARD, '/user/roles'),
    permistion: path(ROOTS_DASHBOARD, '/user/permistion'),
  },
  service: {
    root: path(ROOTS_DASHBOARD, '/service'),
    list: path(ROOTS_DASHBOARD, '/service/list'),
  },
  crCategory: {
    root: path(ROOTS_DASHBOARD, '/parties'),
    list: path(ROOTS_DASHBOARD, '/parties/cr-list'),
  },
  callManagement: {
    root: path(ROOTS_DASHBOARD, '/call'),
    list: path(ROOTS_DASHBOARD, '/call/list'),
  },
  config: {
    root: path(ROOTS_DASHBOARD, '/config'),
    list: path(ROOTS_DASHBOARD, '/config/list'),
  },
  // blog: {
  //   root: path(ROOTS_DASHBOARD, '/blog'),
  //   posts: path(ROOTS_DASHBOARD, '/blog/posts'),
  //   new: path(ROOTS_DASHBOARD, '/blog/new'),
  //   view: (title) => path(ROOTS_DASHBOARD, `/blog/post/${title}`),
  //   demoView: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
  // },
  accountant: {
    root: path(ROOTS_DASHBOARD, '/accountant'),
    list: path(ROOTS_DASHBOARD, '/accountant/list'),
    accountTransaction: path(ROOTS_DASHBOARD, '/accountant/transaction'),
  },
  retail: {
    root: path(ROOTS_DASHBOARD, '/retail'),
    list: path(ROOTS_DASHBOARD, '/retail/list'),
  },
  order: {
    root: path(ROOTS_DASHBOARD, '/order'),
    list: path(ROOTS_DASHBOARD, '/order/list'),
  },
  importWarehouse: {
    list: path(ROOTS_DASHBOARD, '/warehouse/import-warehouse/list'),
    search: (id) => path(ROOTS_DASHBOARD, `/warehouse/import-warehouse/list/${id}`),
  },
  exportWarehouse: {
    list: path(ROOTS_DASHBOARD, '/warehouse/export-warehouse/list'),
    search: (id) => path(ROOTS_DASHBOARD, `/warehouse/export-warehouse/list/${id}`),
  },
  servicewholesale: {
    root: path(ROOTS_DASHBOARD, '/service-wholesale'),
    list: path(ROOTS_DASHBOARD, '/service-wholesale/list'),
    importBuy: path(ROOTS_DASHBOARD, '/service-wholesale/import-buy'),
    ordersWarehouseServiceInternal: path(ROOTS_DASHBOARD, '/service-wholesale/orders-warehouse'),
  },
  repairService: {
    root: path(ROOTS_DASHBOARD, '/repair-service'),
    list: path(ROOTS_DASHBOARD, '/repair-service/list'),
  },
  workDaily: {
    root: path(ROOTS_DASHBOARD, '/work-daily'),
    list: path(ROOTS_DASHBOARD, '/work-daily/list'),
  },
  salesReceipt: {
    root: path(ROOTS_DASHBOARD, '/order'),
    list: path(ROOTS_DASHBOARD, '/order/sale-receipt/list'),
    create: path(ROOTS_DASHBOARD, '/order/sale-receipt/create'),
    edit: (id, mode) => path(ROOTS_DASHBOARD, `/order/sale-receipt/${id}/${mode}`),
    payment: (id, mode) => path(ROOTS_DASHBOARD, `/order/sale-receipt/detailPayment/${id}/${mode}`),
  },
  customerCare: {
    root: path(ROOTS_DASHBOARD, '/parties'),
    list: path(ROOTS_DASHBOARD, '/parties/customer-care'),
  },
  tagertMonth: {
    root: path(ROOTS_DASHBOARD, '/tagert-month'),
    list: path(ROOTS_DASHBOARD, '/tagert-month/list'),
  },
  orderGift: {
    root: path(ROOTS_DASHBOARD, '/order'),
    list: path(ROOTS_DASHBOARD, '/order/order-gift/list'),
    create: path(ROOTS_DASHBOARD, `/order/order-gift/create`),
    edit: (id, mode) => path(ROOTS_DASHBOARD, `/order/order-gift/${id}/${mode}`),
  },
  debts: {
    root: path(ROOTS_DASHBOARD, '/debts'),
    list: path(ROOTS_DASHBOARD, '/debts/list'),
    detail: (id) => path(ROOTS_DASHBOARD, `/debts/${id}`),
  },
  revenueCustomer: {
    root: path(ROOTS_DASHBOARD, '/renvenue-customer'),
    list: path(ROOTS_DASHBOARD, '/renvenue-customer/list'),
  },
  revenueEmployee: {
    root: path(ROOTS_DASHBOARD, '/renvenue-employee'),
    list: path(ROOTS_DASHBOARD, '/renvenue-employee/list'),
  },
  importInventory: {
    root: path(ROOTS_DASHBOARD, '/import-inventory'),
    list: path(ROOTS_DASHBOARD, '/import-inventory/list'),
  },
  goodReport: {
    root: path(ROOTS_DASHBOARD, '/good-report'),
    list: path(ROOTS_DASHBOARD, '/good-report/list'),
  },
  paymentMultipleOrder: {
    root: path(ROOTS_DASHBOARD, '/payment'),
    list: path(ROOTS_DASHBOARD, '/payment/list'),
    create: path(ROOTS_DASHBOARD, '/payment/create'),
    edit: (id) => path(ROOTS_DASHBOARD, `/payment/${id}/edit`),
  },
  orderSample: {
    root: path(ROOTS_DASHBOARD, '/order'),
    list: path(ROOTS_DASHBOARD, '/order/order-sample/list'),
  },

  fileManager: {
    list: path(ROOTS_DASHBOARD, '/file-manager/list'),
    viewFolder: (id) => path(ROOTS_DASHBOARD, `/file-manager/list/${id}`),
  },

  refundOrder: {
    root: path(ROOTS_DASHBOARD, '/order'),
    list: path(ROOTS_DASHBOARD, '/order/refund-order/list'),
    create: path(ROOTS_DASHBOARD, '/order/refund-order/create'),
    edit: (id) => path(ROOTS_DASHBOARD, `/order/refund-order/${id}/edit`),
  },

  conclusionContract: {
    root: path(ROOTS_DASHBOARD, '/conclusion-contract'),
    list: path(ROOTS_DASHBOARD, '/conclusion-contract/list'),
  },

  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    list: path(ROOTS_DASHBOARD, '/blog/list'),
    view: (id) => path(ROOTS_DASHBOARD, `/blog/list/${id}`),
  },
  dashboard: {
    app: path(ROOTS_DASHBOARD, '/app'),
  },

  changePassword: path(ROOTS_DASHBOARD, '/change-password'),
};

export const PATH_DOCS = {
  root: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
};

export const PATH_ZONE_ON_STORE = 'https://mui.com/store/items/zone-landing-page/';

export const PATH_MINIMAL_ON_STORE = 'https://mui.com/store/items/minimal-dashboard/';

export const PATH_FREE_VERSION = 'https://mui.com/store/items/minimal-dashboard-free/';

export const PATH_FIGMA_PREVIEW =
  'https://www.figma.com/file/OBEorYicjdbIT6P1YQTTK7/%5BPreview%5D-Minimal-Web.15.10.22?node-id=0%3A1';
