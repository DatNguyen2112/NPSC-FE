import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Action } from './action';
import { Slice, State } from './slice';
import {
  addressSlice,
  codeTypeManagementSlice,
  codeTypeSlice,
  dataSlice,
  dataTypeSlice,
  globalSlice,
  navigationSlice,
  objMapUserSlice,
  parameterSlice,
  postSlice,
  postTypeSlice,
  roleSlice,
  typesCodeTypeManagementSlice,
  userSlice,
  publicityLevelSlice,
  quanLyNguoiDungSlice,
  phongBanSlice,
  chucVuSlice,
  nhomVatTuSlice,
  productSlice,
  nhaCungCapSlice,
  duAnSlice,
  khachHangSlice,
  rolesSlice,
  lSCSSlice,
  purchaseOrderSlice,
  thuChiSlice,
  thongKeSlice,
  socialInsuranceFacadeSlice,
  quotationSlice,
  debtTransactionSlice,
  inventoryNoteSlice,
  customerServiceCommentSlice,
  eInvoiceSlice,
  ConstructionSlice,
  contractSlice,
  tenantSlice,
  MaterialRequestSlice,
  quanLyTaiSanSlice,
  baoTriTaiSanSlice,
  taskManagementSlice,
  thanhLyTaiSanSlice,
  advanceRequestSlice,
  assetGroupSlice,
  assetTypeSlice,
  measureUnitSlice,
  assetLocationSlice,
  assetAllocationSlice,
  chartOfAccountCodeTypeManagementSlice,
  phuongTienSlice,
  laiXeSlice,
  loaiXeSlice,
  vehicleRequestSlice,
  projectTemplateSlice,
  InvestorSlice,
  InvestorTypeSlice,
  WeekReportSlice,
  taskSlice,
  taskUsageHistorySlice,
  taskCommentSlice,
  taskNotificationSlice,
  rightMapRoleSlice,
  taskPersonalSlice,
} from './';
import { cauHinhNhanSuSlice } from './cau-hinh-nhan-su';
import { stockTransactionSlice } from './stock-transaction';
import { PurchaseOrderReturnSlice } from './purchase-order-return';
import { dashboardSlice } from './dashboard';
import { warehouseTransferNoteSlice } from './warehouse-transfer-note';
import { chatbotSlice } from './share-directory/chatbot';
import { feedbackSlice } from './feed-back';
import { CashAndBankSlice } from './CashAndBank';
import { SocialMediaSlice } from './social-media';
import { rightModelSlice } from './rights';
import { issueManagementSlice } from './issue-management';

const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
  });
};
const useAppDispatch = () => useDispatch<ReturnType<typeof setupStore>['dispatch']>();
const useTypedSelector: TypedUseSelectorHook<ReturnType<typeof rootReducer>> = useSelector;
export { setupStore, useAppDispatch, useTypedSelector, Action, Slice };
export type { State };

export * from './address';
export * from './code';
export * from './code/type';
export * from './code/chart-of-accounts';
export * from './codetype';
export * from './data';
export * from './data/type';
export * from './global';
export * from './navigation';
export * from './obj-map-user';
export * from './parameter';
export * from './post';
export * from './post/type';
export * from './user';
export * from './user/role';
export * from './address';
export * from './codetype';
export * from './publicity-level';
// MANH KHANH
export * from './share-directory/phong-ban';
export * from './share-directory/chuc-vu';
export * from './share-directory/nhom-vat-tu';
export * from './share-directory/vat-tu';
export * from './share-directory/nha-cung-cap';
export * from './share-directory/chatbot';
export * from './share-directory/du-an';
export * from './share-directory/khach-hang';
export * from './quan-tri-nguoi-dung/quan-ly-nhom-nguoi-dung';
export * from './quan-tri-nguoi-dung/quan-ly-nguoi-dung';
export * from './lich-su-cham-soc';
export * from './purchase-order';
export * from './thu-chi';
export * from './thong-ke';
export * from './social-insurance';
export * from './cau-hinh-nhan-su';
export * from './quotation';
export * from './debt-transaction';
export * from './inventory-note';
export * from './customer-service-comment';
export * from './e-invoice';
export * from './construction';
export * from './contract';
export * from './tenants';
export * from './material-request';
export * from './advance-request';
export * from './tai-san/quan-ly-tai-san';
export * from './tai-san/bao-tri-tai-san';
export * from './tai-san/thanh-ly-tai-san';
export * from './tai-san/asset-group';
export * from './tai-san/asset-type';
export * from './task-management';
export * from './tai-san/measure-unit';
export * from './tai-san/asset-location';
export * from './tai-san/asset-allocation';
export * from './quan-ly-phuong-tien';
export * from './quan-ly-lai-xe';
export * from './share-directory/khach-hang';
export * from './quan-ly-loai-xe';
export * from './vehicle-request';
export * from './project-template';
export * from './Investor';
export * from './InvestorType';
export * from './ConstructionWeekReport';
export * from './task';
export * from './task-usage-history';
export * from './task-comment';
export * from './rights';
export * from './social-media';
export * from './task-notification';
export * from './right-map-role';
export * from './task-personal';

const rootReducer = combineReducers({
  [globalSlice.name]: globalSlice.reducer,
  [userSlice.name]: userSlice.reducer,
  [roleSlice.name]: roleSlice.reducer,
  [codeTypeManagementSlice.name]: codeTypeManagementSlice.reducer,
  [typesCodeTypeManagementSlice.name]: typesCodeTypeManagementSlice.reducer,
  [chartOfAccountCodeTypeManagementSlice.name]: chartOfAccountCodeTypeManagementSlice.reducer,
  [dataSlice.name]: dataSlice.reducer,
  [dataTypeSlice.name]: dataTypeSlice.reducer,
  [parameterSlice.name]: parameterSlice.reducer,
  [navigationSlice.name]: navigationSlice.reducer,
  [objMapUserSlice.name]: objMapUserSlice.reducer,
  [postSlice.name]: postSlice.reducer,
  [postTypeSlice.name]: postTypeSlice.reducer,
  [addressSlice.name]: addressSlice.reducer,
  [codeTypeSlice.name]: codeTypeSlice.reducer,
  [publicityLevelSlice.name]: publicityLevelSlice.reducer,
  [quanLyTaiSanSlice.name]: quanLyTaiSanSlice.reducer,
  [baoTriTaiSanSlice.name]: baoTriTaiSanSlice.reducer,
  [taskManagementSlice.name]: taskManagementSlice.reducer,
  [thanhLyTaiSanSlice.name]: thanhLyTaiSanSlice.reducer,

  //MẠNH KHANH
  [phongBanSlice.name]: phongBanSlice.reducer,
  [chucVuSlice.name]: chucVuSlice.reducer,
  [nhomVatTuSlice.name]: nhomVatTuSlice.reducer,
  [productSlice.name]: productSlice.reducer,
  [nhaCungCapSlice.name]: nhaCungCapSlice.reducer,
  [duAnSlice.name]: duAnSlice.reducer,
  [khachHangSlice.name]: khachHangSlice.reducer,
  [rolesSlice.name]: rolesSlice.reducer,
  [quanLyNguoiDungSlice.name]: quanLyNguoiDungSlice.reducer,
  [lSCSSlice.name]: lSCSSlice.reducer,
  [purchaseOrderSlice.name]: purchaseOrderSlice.reducer,
  [thuChiSlice.name]: thuChiSlice.reducer,
  [thongKeSlice.name]: thongKeSlice.reducer,
  [socialInsuranceFacadeSlice.name]: socialInsuranceFacadeSlice.reducer,
  [cauHinhNhanSuSlice.name]: cauHinhNhanSuSlice.reducer,
  [quotationSlice.name]: quotationSlice.reducer,
  [stockTransactionSlice.name]: stockTransactionSlice.reducer,
  [debtTransactionSlice.name]: debtTransactionSlice.reducer,
  [PurchaseOrderReturnSlice.name]: PurchaseOrderReturnSlice.reducer,
  [inventoryNoteSlice.name]: inventoryNoteSlice.reducer,
  [rightMapRoleSlice.name]: rightMapRoleSlice.reducer,
  [dashboardSlice.name]: dashboardSlice.reducer,
  [chatbotSlice.name]: chatbotSlice.reducer,
  [warehouseTransferNoteSlice.name]: warehouseTransferNoteSlice.reducer,
  [customerServiceCommentSlice.name]: customerServiceCommentSlice.reducer,
  [eInvoiceSlice.name]: eInvoiceSlice.reducer,
  [ConstructionSlice.name]: ConstructionSlice.reducer,
  [contractSlice.name]: contractSlice.reducer,
  [tenantSlice.name]: tenantSlice.reducer,
  [MaterialRequestSlice.name]: MaterialRequestSlice.reducer,
  [advanceRequestSlice.name]: advanceRequestSlice.reducer,
  [assetGroupSlice.name]: assetGroupSlice.reducer,
  [assetTypeSlice.name]: assetTypeSlice.reducer,
  [measureUnitSlice.name]: measureUnitSlice.reducer,
  [assetLocationSlice.name]: assetLocationSlice.reducer,
  [assetAllocationSlice.name]: assetAllocationSlice.reducer,
  [feedbackSlice.name]: feedbackSlice.reducer,
  [CashAndBankSlice.name]: CashAndBankSlice.reducer,
  [phuongTienSlice.name]: phuongTienSlice.reducer,
  [laiXeSlice.name]: laiXeSlice.reducer,
  [loaiXeSlice.name]: loaiXeSlice.reducer,
  [vehicleRequestSlice.name]: vehicleRequestSlice.reducer,
  [SocialMediaSlice.name]: SocialMediaSlice.reducer,
  [issueManagementSlice.name]: issueManagementSlice.reducer,
  [projectTemplateSlice.name]: projectTemplateSlice.reducer,
  [InvestorSlice.name]: InvestorSlice.reducer,
  [InvestorTypeSlice.name]: InvestorTypeSlice.reducer,
  [WeekReportSlice.name]: WeekReportSlice.reducer,
  [taskSlice.name]: taskSlice.reducer,
  [taskUsageHistorySlice.name]: taskUsageHistorySlice.reducer,
  [taskCommentSlice.name]: taskCommentSlice.reducer,
  [rightModelSlice.name]: rightModelSlice.reducer,
  [taskNotificationSlice.name]: taskNotificationSlice.reducer,
  [taskPersonalSlice.name]: taskPersonalSlice.reducer,
});
