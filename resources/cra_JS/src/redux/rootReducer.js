import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices

import geographicBoundaries from './slices/geographicBoundaries';
import internalOrgReducer from './slices/internalOrg';
import employeeReducer from './slices/employee';
import partiesReducer from './slices/parties';
import goodReducer from './slices/good';
import goodCategoryReducer from './slices/goodCategory';
import userReducer from './slices/user';
import roleReducer from './slices/role';
import crCategoryReducer from './slices/crCategory';
import importWarehouseReducer from './slices/importWarehouse';
import FunctionTypeReducer from './slices/functionType';
import UtilReducer from './slices/utils';
import DailyWorkReducer from './slices/dailywork';
import WarehouseExportReducer from './slices/warehouseExport';
import SaleReceiptReducer from './slices/saleReceipt'
import CustomerCareReducer from './slices/customerCare';
import ScreenReportReducer from './slices/screenReport';
import PermissionReducer from './slices/permission';
import PartyTypesReducer from './slices/partyTypes';
import TagertMonthReducer from './slices/tagertMonth';
import OrderGiftReducer from './slices/orderGift';
import PaymentOrderReducer from './slices/paymentOrder';
import NotificationReducer from './slices/notification'
import OrderSampleReducer from './slices/orderSample';
import FileManagementReducer from './slices/fileManagements';
import ConclusionContractReducer from './slices/conclusionContract';
import BlogReducer from './slices/blog';
import DashboardReducer from './slices/dashboard';


// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

const productPersistConfig = {
  key: 'product',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['sortBy', 'checkout'],
};

const rootReducer = combineReducers({
  geographic: geographicBoundaries,
  internalOrg: internalOrgReducer,
  employee: employeeReducer,
  parties: partiesReducer,
  good: goodReducer,
  goodCategory: goodCategoryReducer,
  user: userReducer,
  role: roleReducer,
  crCategory: crCategoryReducer,
  importWarehouse: importWarehouseReducer,
  functionType: FunctionTypeReducer,
  util: UtilReducer,
  dailywork: DailyWorkReducer,
  screenReport: ScreenReportReducer,
  warehouseExport: WarehouseExportReducer,
  saleReceipt: SaleReceiptReducer,
  customerCare: CustomerCareReducer,
  permission: PermissionReducer,
  partyTypes: PartyTypesReducer,
  tagertMonth: TagertMonthReducer,
  orderGift: OrderGiftReducer,
  paymentOrder: PaymentOrderReducer,
  notification: NotificationReducer,
  orderSample: OrderSampleReducer,
  fileManagement: FileManagementReducer,
  conclusionContract: ConclusionContractReducer,
  blog: BlogReducer,
  dashboard: DashboardReducer,
});

export { rootPersistConfig, rootReducer };
