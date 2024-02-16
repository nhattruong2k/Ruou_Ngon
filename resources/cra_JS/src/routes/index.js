import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from '../auth/AuthGuard';
import GuestGuard from '../auth/GuestGuard';
// layouts
import MainLayout from '../layouts/main';
import SimpleLayout from '../layouts/simple';
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config';
//
import {
  // Auth
  LoginPage,
  RegisterPage,
  VerifyCodePage,
  NewPasswordPage,
  ResetPasswordPage,
  // Dashboard: General
  DashboardPage,
  // GeneralFilePage,
  PermissionDeniedPage,
  //
  Page500,
  Page403,
  Page404,
  HomePage,
  FaqsPage,
  AboutPage,
  Contact,
  PricingPage,
  PaymentPage,
  ComingSoonPage,
  MaintenancePage,

  //
  InternalOrganizationListPage,
  EmployeeListPage,
  PartiesListPage,
  GoodListPage,
  GoodCategoryListPage,
  UserPermistionListPage,
  RoleListPage,
  CrCategoryListPage,
  WorkDailyListPage,
  ImportWarehouseListPage,
  WarehouseExportPage,
  SaleReceiptListPage,
  SaleReceiptDetailPage,
  SaleReceiptPaymentDetaiPage,
  CustomerCarePage,
  UserListPage,
  PartyTypesListPage,
  TagertMonthListPage,
  OrderGiftPage,
  OrderGiftDetail,
  DebtsListPage,
  RenvenueCustomerListPage,
  RenvenueEmployeeListPage,
  ImportInventoryListPage,
  PaymentOrderCreatePage,
  PaymentListPage,
  DebtsDetail,
  OrderSampleListPage,
  FileManagerPage,
  RefundOrderCreatePage,
  ConclusionContractPage,
  BlogListPage,
  BlogViewDetailPage,
  ChangePasswordPage,
  ProductReportListPage,
} from './elements';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // Auth
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <LoginPage /> },
        { path: 'register-unprotected', element: <RegisterPage /> },
        {
          element: <CompactLayout />,
          children: [
            { path: 'reset-password', element: <ResetPasswordPage /> },
            { path: 'new-password', element: <NewPasswordPage /> },
            { path: 'verify', element: <VerifyCodePage /> },
          ],
        },
      ],
    },

    // Dashboard
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'app', element: <DashboardPage /> },
        {
          path: 'internal-organization',
          children: [
            { element: <Navigate to="/dashboard/internal-organization/list" replace />, index: true },
            { path: 'list', element: <InternalOrganizationListPage /> },
          ],
        },
        {
          path: 'employee',
          children: [
            { element: <Navigate to="/dashboard/employee/list" replace />, index: true },
            { path: 'list', element: <EmployeeListPage /> },
          ],
        },

        {
          path: 'parties',
          children: [
            { element: <Navigate to="/dashboard/parties/list" replace />, index: true },
            { path: 'list', element: <PartiesListPage /> },
            { path: 'types', element: <PartyTypesListPage /> },
            { path: 'list/:id', element: <PartiesListPage /> },
          ],
        },

        {
          path: 'good',
          children: [
            { element: <Navigate to="/dashboard/good/list" replace />, index: true },
            { path: 'list', element: <GoodListPage /> },
          ],
        },
        {
          path: 'good',
          children: [
            { element: <Navigate to="/dashboard/good/category" replace />, index: true },
            { path: 'category', element: <GoodCategoryListPage /> },
          ],
        },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/list" replace />, index: true },
            { path: 'list', element: <UserListPage /> },
            { path: 'roles', element: <RoleListPage /> },
            { path: 'permistion', element: <UserPermistionListPage /> },
          ],
        },
        {
          path: 'conclusion-contract',
          children: [
            { element: <Navigate to="/dashboard/conclusion-contract/list" replace />, index: true },
            { path: 'list', element: < ConclusionContractPage /> },
          ],
        },
        {
          path: 'parties',
          children: [
            { element: <Navigate to="/dashboard/parties/cr-list" replace />, index: true },
            { path: 'cr-list', element: <CrCategoryListPage /> },
          ],
        },
        {
          path: 'warehouse',
          children: [
            {
              path: 'import-warehouse',
              children: [
                { path: 'list', element: <ImportWarehouseListPage /> },
                { path: 'list/:id', element: <ImportWarehouseListPage /> },
              ],
            },
            {
              path: 'export-warehouse',
              children: [
                { path: 'list', element: <WarehouseExportPage /> },
                { path: 'list/:id', element: <WarehouseExportPage /> },
              ],
            },
          ],
        },
        {
          path: 'order',
          children: [
            // { element: <Navigate to="/dashboard/order/sale-receipt/list" replace />, index: true },
            { path: 'sale-receipt/list', element: <SaleReceiptListPage /> },
            { path: 'sale-receipt/create', element: <SaleReceiptDetailPage /> },
            { path: 'sale-receipt/:id/:currentMode', element: <SaleReceiptDetailPage /> },
            { path: 'sale-receipt/detailPayment/:id/:currentMode', element: <SaleReceiptPaymentDetaiPage /> },
            { path: 'order-sample/list/', element: <OrderSampleListPage /> },
            { path: 'order-gift/list', element: <OrderGiftPage /> },
            { path: 'order-gift/create', element: <OrderGiftDetail /> },
            { path: 'order-gift/:id/:currentMode', element: <OrderGiftDetail /> },
            { path: 'refund-order/create', element: <RefundOrderCreatePage /> },
            { path: 'refund-order/:id/edit', element: <RefundOrderCreatePage /> },
          ],
        },
        {
          path: 'payment',
          children: [
            // { element: <Navigate to="/dashboard/payment/list" replace />, index: true },
            { path: 'list', element: <PaymentListPage /> },
            { path: 'create', element: <PaymentOrderCreatePage /> },
            { path: ':id/edit', element: <PaymentOrderCreatePage /> },
          ],
        },
        { path: 'permission-denied', element: <PermissionDeniedPage /> },
        {
          path: 'work-daily',
          children: [
            { element: <Navigate to="/dashboard/work-daily/list" replace />, index: true },
            { path: 'list', element: <WorkDailyListPage /> },
          ],
        },
        {
          path: 'parties',
          children: [
            { element: <Navigate to="/dashboard/parties/customer-care" replace />, index: true },
            { path: 'customer-care', element: <CustomerCarePage /> },
          ],
        },
        {
          path: 'file-manager',
          children: [
            { path: 'list', element: <FileManagerPage /> },
            { path: 'list/:id', element: <FileManagerPage /> },
          ],
        },
        {
          path: 'tagert-month',
          children: [
            { element: <Navigate to="/dashboard/tagert-month/list" replace />, index: true },
            { path: 'list', element: <TagertMonthListPage /> },
          ],
        },
        {
          path: 'debts',

          children: [
            { element: <Navigate to="/dashboard/debts/list" replace />, index: true },
            { path: 'list', element: <DebtsListPage /> },
            { path: ':id', element: <DebtsDetail /> },
          ],
        },
        {
          path: 'renvenue-customer',
          children: [
            { element: <Navigate to="/dashboard/renvenue-customer/list" replace />, index: true },
            { path: 'list', element: <RenvenueCustomerListPage /> },
          ],
        },
        {
          path: 'renvenue-employee',
          children: [
            { element: <Navigate to="/dashboard/renvenue-employee/list" replace />, index: true },
            { path: 'list', element: <RenvenueEmployeeListPage /> },
          ],
        },
        {
          path: 'import-inventory',
          children: [
            { element: <Navigate to="/dashboard/import-inventory/list" replace />, index: true },
            { path: 'list', element: <ImportInventoryListPage /> },
          ],
        },
        {
          path: 'good-report',
          children: [
            { element: <Navigate to="/dashboard/good-report/list" replace />, index: true },
            { path: 'list', element: <ProductReportListPage /> },
          ],
        },
        {
          path: 'blog',
          children: [
            { element: <Navigate to="/dashboard/blog/list" replace />, index: true },
            { path: 'list', element: <BlogListPage /> },
            { path: 'list/:id', element: <BlogViewDetailPage /> },
          ],
        },
        { path: 'change-password', element: <ChangePasswordPage /> },
      ],
    },

    // Main Routes
    {
      element: <MainLayout />,
      children: [
        { element: <Navigate to={'auth/login'} replace />, index: true },
        { path: 'about-us', element: <AboutPage /> },
        { path: 'contact-us', element: <Contact /> },
        { path: 'faqs', element: <FaqsPage /> },
        // Demo Components
      ],
    },
    {
      element: <SimpleLayout />,
      children: [
        { path: 'pricing', element: <PricingPage /> },
        { path: 'payment', element: <PaymentPage /> },
      ],
    },
    {
      element: <CompactLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoonPage /> },
        { path: 'maintenance', element: <MaintenancePage /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <Page404 /> },
        { path: '403', element: <Page403 /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
