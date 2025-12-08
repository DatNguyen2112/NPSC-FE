import { Draft, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, EStatusState, Pagination, QueryParams } from '@models';
import { API, routerLinks } from '@utils';

const name = 'CodeType';
const action = {
  ...new Action<CodeTypeModel, EStatusCodeType>(name),
  getCodeTypeByKey: createAsyncThunk(
    name + '/getCodeTypeByKey',
    async ({ params, keyApi, keyData = 'pagination' }: { params: QueryParams; keyApi: string; keyData: string }) => {
      const res = await API.get<Pagination<CodeTypeModel>>(`${routerLinks(name, 'api')}/${keyApi}`, params);
      return { data: res?.data, keyData };
    },
  ),
  getUnit: createAsyncThunk(
    name + 'getUnit',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/don-vi-tinh`, param),
  ),
  getPurposeReceipts: createAsyncThunk(
    name + 'getPurposeReceipts',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/purpose_receipts`, param),
  ),
  getExpenditurePurposes: createAsyncThunk(
    name + 'getExpenditurePurposes',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/expenditure_purposes`, param),
  ),
  getPaymentMethods: createAsyncThunk(
    name + 'getPaymentMethods',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/payment_methods`, param),
  ),
  // Kho
  getInventories: createAsyncThunk(
    name + 'getInventories',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/kho`, param),
  ),
  // Lý do trả hàng
  getReturnedReason: createAsyncThunk(
    name + 'getReturnedReason',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/returned_reason`, param),
  ),

  // Loại phiếu nhập kho
  getInventoryReceiptTypesList: createAsyncThunk(
    name + 'getInventoryReceiptTypesList',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/inventory-import-types`, param),
  ),
  // Loại phiếu xuất kho
  getInventoryIssueTypesList: createAsyncThunk(
    name + 'getInventoryIssueTypesList',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/inventory-export-types`, param),
  ),

  // Nhóm khách hàng
  getGroupCustomer: createAsyncThunk(
    name + 'getGroupCustomer',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/customer-group`, param),
  ),
  // Nhóm nhà cung cấp
  getGroupSupplier: createAsyncThunk(
    name + 'getGroupSupplier',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/supplier-group`, param),
  ),
  // Danh sách VAT
  getVATList: createAsyncThunk(
    name + 'getVATList',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/vat-list`, param),
  ),
  // Lý do kiểm hàng
  getInventoryCheckNoteReason: createAsyncThunk(
    name + 'getInventoryCheckNoteReason',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/inventory-check-note-reason`, param),
  ),
  // Nhóm người nộp
  getEntityGroup: createAsyncThunk(
    name + 'getEntityGroup',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/payment-group`, param),
  ),
  // Loại khách hàng
  getCustomerType: createAsyncThunk(
    name + 'getCustomerType',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/customer-type`, param),
  ),
  // Nguồn khách hàng
  getCustomerSource: createAsyncThunk(
    name + 'getCustomerSource',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/customer-source`, param),
  ),
  // Tag Công việc
  getTaskTag: createAsyncThunk(
    name + 'getTaskTag',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/task-type`, param),
  ),
  // Status Công việc
  getTaskStatus: createAsyncThunk(
    name + 'getTaskStatus',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/task-status`, param),
  ),

  //EVN
  // Loại cấp điện áp
  getVoltageType: createAsyncThunk(
    name + 'getVoltageType',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/voltage-type`, param),
  ),

  // Loại chủ đầu tư
  getOwnerType: createAsyncThunk(
    name + 'getOwnerType',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/owner-type`, param),
  ),

  // Loại dịch vụ tư vấn
  getConsultService: createAsyncThunk(
    name + 'getConsultService',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/consult-service`, param),
  ),

  // Phòng ban
  getOrganizationStructure: createAsyncThunk(
    name + 'getOrganizationStructure',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/organization-structure`, param),
  ),

  // Mẫu quy trình
  getProcessTemplate: createAsyncThunk(
    name + 'getProcessTemplate',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/process-template`, param),
  ),

  // Chủ đầu tư
  getInvestor: createAsyncThunk(
    name + 'getInvestor',
    async (param: QueryParams) =>
      await API.get<Pagination<CodeTypeModel>>(`${routerLinks('CodeType', 'api')}/investor`, param),
  ),
};
export const codeTypeSlice = createSlice({
  ...new Slice<CodeTypeModel, EStatusCodeType>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.getCodeTypeByKey.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusState.getPending;
      })
      .addCase(action.getCodeTypeByKey.fulfilled, (state, action) => {
        const { ...res } = action.payload;
        state[res.keyData] = res.data as Draft<Pagination<CodeTypeModel>>;
        state.isLoading = false;
        state.status = EStatusState.getFulfilled;
      })
      .addCase(action.getCodeTypeByKey.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusState.getRejected;
      })
      .addCase(action.getUnit.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getUnitPending;
      })
      .addCase(action.getUnit.fulfilled, (state, action) => {
        if (action.payload) {
          state.pagination = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getUnitFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getUnit.rejected, (state) => {
        state.status = EStatusCodeType.getUnitRejected;
        state.isLoading = false;
      })
      .addCase(action.getPurposeReceipts.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getPurposeReceiptsPending;
      })
      .addCase(action.getPurposeReceipts.fulfilled, (state, action) => {
        if (action.payload) {
          state.purposeReceipts = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getPurposeReceiptsFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getPurposeReceipts.rejected, (state) => {
        state.status = EStatusCodeType.getPurposeReceiptsRejected;
        state.isLoading = false;
      })
      .addCase(action.getExpenditurePurposes.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getExpenditurePurposesPending;
      })
      .addCase(action.getExpenditurePurposes.fulfilled, (state, action) => {
        if (action.payload) {
          state.expenditurePurposes = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getExpenditurePurposesFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getExpenditurePurposes.rejected, (state) => {
        state.status = EStatusCodeType.getExpenditurePurposesRejected;
        state.isLoading = false;
      })

      // Phương thức thanh toán
      .addCase(action.getPaymentMethods.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getPaymentMethodsPending;
      })
      .addCase(action.getPaymentMethods.fulfilled, (state, action) => {
        if (action.payload) {
          state.paymentMethods = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getPaymentMethodsFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getPaymentMethods.rejected, (state) => {
        state.status = EStatusCodeType.getPaymentMethodsRejected;
        state.isLoading = false;
      })

      // Lý do trả hàng
      .addCase(action.getReturnedReason.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getReturnedReasonPending;
      })
      .addCase(action.getReturnedReason.fulfilled, (state, action) => {
        if (action.payload) {
          state.returnedReason = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getReturnedReasonFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getReturnedReason.rejected, (state) => {
        state.status = EStatusCodeType.getReturnedReasonRejected;
        state.isLoading = false;
      })

      // Nhóm khách hàng
      .addCase(action.getGroupCustomer.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getGroupCustomerPending;
      })
      .addCase(action.getGroupCustomer.fulfilled, (state, action) => {
        if (action.payload) {
          state.groupCustomer = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getGroupCustomerFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getGroupCustomer.rejected, (state) => {
        state.status = EStatusCodeType.getGroupCustomerRejected;
        state.isLoading = false;
      })

      // Nhóm nhà cung cấp
      .addCase(action.getGroupSupplier.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getGroupSupplierPending;
      })
      .addCase(action.getGroupSupplier.fulfilled, (state, action) => {
        if (action.payload) {
          state.groupSupplier = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getGroupSupplierFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getGroupSupplier.rejected, (state) => {
        state.status = EStatusCodeType.getGroupSupplierRejected;
        state.isLoading = false;
      })

      // Kho
      .addCase(action.getInventories.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getInventoriesPending;
      })
      .addCase(action.getInventories.fulfilled, (state, action) => {
        if (action.payload) {
          state.inventories = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getInventoriesFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getInventories.rejected, (state) => {
        state.status = EStatusCodeType.getInventoriesRejected;
        state.isLoading = false;
      })
      // Loại phiếu nhập kho
      .addCase(action.getInventoryReceiptTypesList.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getInventoryReceiptTypesListPending;
      })
      .addCase(action.getInventoryReceiptTypesList.fulfilled, (state, action) => {
        if (action.payload) {
          state.inventoriesReceiptTypesList = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getInventoryReceiptTypesListFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getInventoryReceiptTypesList.rejected, (state) => {
        state.status = EStatusCodeType.getInventoryReceiptTypesListRejected;
        state.isLoading = false;
      })
      // Loại phiếu xuất kho
      .addCase(action.getInventoryIssueTypesList.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getInventoryIssueTypesListPending;
      })
      .addCase(action.getInventoryIssueTypesList.fulfilled, (state, action) => {
        if (action.payload) {
          state.inventoriesIssueTypesList = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getInventoryIssueTypesListFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getInventoryIssueTypesList.rejected, (state) => {
        state.status = EStatusCodeType.getInventoryIssueTypesListRejected;
        state.isLoading = false;
      })

      // Lý do kiểm kho
      .addCase(action.getInventoryCheckNoteReason.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getInventoryCheckNoteReasonPending;
      })
      .addCase(action.getInventoryCheckNoteReason.fulfilled, (state, action) => {
        if (action.payload) {
          state.inventoriesCheckNoteReason = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getInventoryCheckNoteReasonFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getInventoryCheckNoteReason.rejected, (state) => {
        state.status = EStatusCodeType.getInventoryCheckNoteReasonRejected;
        state.isLoading = false;
      })

      // Danh sách thuế
      .addCase(action.getVATList.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getVATListPending;
      })
      .addCase(action.getVATList.fulfilled, (state, action) => {
        if (action.payload) {
          state.vatList = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getVATListFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getVATList.rejected, (state) => {
        state.status = EStatusCodeType.getVATListRejected;
        state.isLoading = false;
      })

      // Nhóm người nộp
      .addCase(action.getEntityGroup.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getEntityGroupPending;
      })
      .addCase(action.getEntityGroup.fulfilled, (state, action) => {
        if (action.payload) {
          state.entityGroup = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getEntityGroupFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getEntityGroup.rejected, (state) => {
        state.status = EStatusCodeType.getEntityGroupRejected;
        state.isLoading = false;
      })

      // Loại khách hàng
      .addCase(action.getCustomerType.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getCustomerTypePending;
      })
      .addCase(action.getCustomerType.fulfilled, (state, action) => {
        if (action.payload) {
          state.listCustomerType = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getCustomerTypeFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getCustomerType.rejected, (state) => {
        state.status = EStatusCodeType.getCustomerTypeRejected;
        state.isLoading = false;
      })

      // Nguồn khách hàng
      .addCase(action.getCustomerSource.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getCustomerSourcePending;
      })
      .addCase(action.getCustomerSource.fulfilled, (state, action) => {
        if (action.payload) {
          state.listCustomerSource = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getCustomerSourceFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getCustomerSource.rejected, (state) => {
        state.status = EStatusCodeType.getCustomerSourceRejected;
        state.isLoading = false;
      })
      // Tag công việc
      .addCase(action.getTaskTag.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getTaskTagPending;
      })
      .addCase(action.getTaskTag.fulfilled, (state, action) => {
        if (action.payload) {
          state.taskTags = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getTaskTagFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getTaskTag.rejected, (state) => {
        state.status = EStatusCodeType.getTaskTagRejected;
        state.isLoading = false;
      })
      // Status công việc
      .addCase(action.getTaskStatus.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getTaskStatusPending;
      })
      .addCase(action.getTaskStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.taskStatus = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getTaskStatusFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getTaskStatus.rejected, (state) => {
        state.status = EStatusCodeType.getTaskStatusRejected;
        state.isLoading = false;
      })

      //EVN

      // Loại cấp điện áp
      .addCase(action.getVoltageType.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getVoltageTypePending;
      })
      .addCase(action.getVoltageType.fulfilled, (state, action) => {
        if (action.payload) {
          state.voltageTypeData = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getVoltageTypeFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getVoltageType.rejected, (state) => {
        state.status = EStatusCodeType.getVoltageTypeRejected;
        state.isLoading = false;
      })

      // Loại chủ đầu tư
      .addCase(action.getOwnerType.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getOwnerTypePending;
      })
      .addCase(action.getOwnerType.fulfilled, (state, action) => {
        if (action.payload) {
          state.ownerTypeData = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getOwnerTypeFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getOwnerType.rejected, (state) => {
        state.status = EStatusCodeType.getOwnerTypeRejected;
        state.isLoading = false;
      })

      // Loại dịch vụ tư vấn
      .addCase(action.getConsultService.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getConsultServicePending;
      })
      .addCase(action.getConsultService.fulfilled, (state, action) => {
        if (action.payload) {
          state.consultServiceData = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getConsultServiceFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getConsultService.rejected, (state) => {
        state.status = EStatusCodeType.getConsultServiceRejected;
        state.isLoading = false;
      })

      // Phòng ban
      .addCase(action.getOrganizationStructure.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getOrganizationStructurePending;
      })
      .addCase(action.getOrganizationStructure.fulfilled, (state, action) => {
        if (action.payload) {
          state.organizationData = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getOrganizationStructureFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getOrganizationStructure.rejected, (state) => {
        state.status = EStatusCodeType.getOrganizationStructureRejected;
        state.isLoading = false;
      })

      // Mẫu quy trình
      .addCase(action.getProcessTemplate.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getProcessTemplatePending;
      })
      .addCase(action.getProcessTemplate.fulfilled, (state, action) => {
        if (action.payload) {
          state.processTemplateData = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getProcessTemplateFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getProcessTemplate.rejected, (state) => {
        state.status = EStatusCodeType.getProcessTemplateRejected;
        state.isLoading = false;
      })

      // Chủ đầu tư
      .addCase(action.getInvestor.pending, (state, action) => {
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusCodeType.getInvestorPending;
      })
      .addCase(action.getInvestor.fulfilled, (state, action) => {
        if (action.payload) {
          state.investorData = action.payload.data as Draft<Pagination<CodeTypeModel>>;
          state.status = EStatusCodeType.getInvestorFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getInvestor.rejected, (state) => {
        state.status = EStatusCodeType.getInvestorRejected;
        state.isLoading = false;
      });
  }),
});
export const CodeTypeFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateCodeType<CodeTypeModel>),
    set: (values: StateCodeType<CodeTypeModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getCodeTypeByKey: (params: QueryParams, keyApi: string, keyData: string) =>
      dispatch(action.getCodeTypeByKey({ params, keyApi, keyData })),
    // getFrequency: (param: QueryParams) => dispatch(action.getfrequency(param)),
    // getRequestLevel: (param: QueryParams) => dispatch(action.getRequestLevel(param)),
    getUnit: (param: QueryParams) => dispatch(action.getUnit(param)),
    getPurposeReceipts: (param: QueryParams) => dispatch(action.getPurposeReceipts(param)),
    getExpenditurePurposes: (param: QueryParams) => dispatch(action.getExpenditurePurposes(param)),
    getPaymentMethods: (param: QueryParams) => dispatch(action.getPaymentMethods(param)),
    getInventories: (param: QueryParams) => dispatch(action.getInventories(param)),
    getReturnedReason: (param: QueryParams) => dispatch(action.getReturnedReason(param)),
    // Loại phiếu nhập kho
    getInventoryReceiptTypesList: (param: QueryParams) => dispatch(action.getInventoryReceiptTypesList(param)),
    // Loại phiếu xuất kho
    getInventoryIssueTypesList: (param: QueryParams) => dispatch(action.getInventoryIssueTypesList(param)),
    // Nhóm khách hàng
    getCustomerGroup: (param: QueryParams) => dispatch(action.getGroupCustomer(param)),
    // Nhóm nhà cung cấp
    getSupplierGroup: (param: QueryParams) => dispatch(action.getGroupSupplier(param)),
    // Danh sách VAT
    getVATList: (param: QueryParams) => dispatch(action.getVATList(param)),
    // Lý do kiêm kho
    getInventoryCheckNoteReason: (param: QueryParams) => dispatch(action.getInventoryCheckNoteReason(param)),
    // Nhón người nộp
    getEntityGroup: (param: QueryParams) => dispatch(action.getEntityGroup(param)),
    // Loại khách hàng
    getCustomerType: (param: QueryParams) => dispatch(action.getCustomerType(param)),
    // Nguồn khách hàng
    getCustomerSource: (param: QueryParams) => dispatch(action.getCustomerSource(param)),
    // Tag công việc
    getTaskTag: (param: QueryParams) => dispatch(action.getTaskTag(param)),
    // Tag công việc
    getTaskStatus: (param: QueryParams) => dispatch(action.getTaskStatus(param)),
    // EVN
    getVoltageType: (param: QueryParams) => dispatch(action.getVoltageType(param)),
    getOwnerType: (param: QueryParams) => dispatch(action.getOwnerType(param)),
    getOrganizationStructure: (param: QueryParams) => dispatch(action.getOrganizationStructure(param)),
    getProcessTemplate: (param: QueryParams) => dispatch(action.getProcessTemplate(param)),
    getInvestor: (param: QueryParams) => dispatch(action.getInvestor(param)),
    getConsultService: (param: QueryParams) => dispatch(action.getConsultService(param)),
  };
};

interface StateCodeType<T> extends State<T, EStatusCodeType> {
  isEdit?: boolean;
  returnedReason?: Pagination<CodeTypeModel>;
  paymentMethods?: Pagination<CodeTypeModel>;
  expenditurePurposes?: Pagination<CodeTypeModel>;
  purposeReceipts?: Pagination<CodeTypeModel>;
  inventories?: Pagination<CodeTypeModel>;
  inventoriesReceiptTypesList?: Pagination<CodeTypeModel>;
  inventoriesIssueTypesList?: Pagination<CodeTypeModel>;
  inventoriesCheckNoteReason?: Pagination<CodeTypeModel>;
  groupCustomer?: Pagination<CodeTypeModel>;
  groupSupplier?: Pagination<CodeTypeModel>;
  vatList?: Pagination<CodeTypeModel>;
  entityGroup?: Pagination<CodeTypeModel>;
  listCustomerType?: Pagination<CodeTypeModel>;
  listCustomerSource?: Pagination<CodeTypeModel>;
  vatGTGTList?: Pagination<CodeTypeModel>;
  taskTags?: Pagination<CodeTypeModel>;
  taskStatus?: Pagination<CodeTypeModel>;

  //EVN
  voltageTypeData?: Pagination<CodeTypeModel>;
  ownerTypeData?: Pagination<CodeTypeModel>;
  consultServiceData?: Pagination<CodeTypeModel>;
  organizationData?: Pagination<CodeTypeModel>;
  processTemplateData?: Pagination<CodeTypeModel>;
  investorData?: Pagination<CodeTypeModel>;

  // data after draggable
  organizationDataAfterDrag?: any;
}
export class CodeTypeModel extends CommonEntity {
  constructor(
    public id: string,
    public title?: string,
    public code?: string,
    public translations?: string,
    public description?: string,
    public iconClass?: string,
    public codeTypeItems?: any,
    public type?: string,
  ) {
    super();
  }
}

export enum EStatusCodeType {
  getFrequencyPending = 'getFrequencyPending',
  getFrequencyFulfilled = 'getFrequencyFulfilled',
  getFrequencyRejected = 'getFrequencyRejected',
  getRequestLevelPending = 'getRequestLevelPending',
  getRequestLevelFulfilled = 'getRequestLevelFulfilled',
  getRequestLevelRejected = 'getRequestLevelRejected',
  getUnitPending = 'getUnitPending',
  getUnitFulfilled = 'getUnitFulfilled',
  getUnitRejected = 'getUnitRejected',
  getPurposeReceiptsPending = 'getPurposeReceiptsPending',
  getPurposeReceiptsFulfilled = 'getPurposeReceiptsFulfilled',
  getPurposeReceiptsRejected = 'getPurposeReceiptsRejected',
  getExpenditurePurposesPending = 'getExpenditurePurposesPending',
  getExpenditurePurposesFulfilled = 'getExpenditurePurposesFulfilled',
  getExpenditurePurposesRejected = 'getExpenditurePurposesRejected',
  getPaymentMethodsPending = 'getPaymentMethodsPending',
  getPaymentMethodsFulfilled = 'getPaymentMethodsFulfilled',
  getPaymentMethodsRejected = 'getPaymentMethodsRejected',
  // Kho
  getInventoriesPending = 'getInventoriesPending',
  getInventoriesFulfilled = 'getInventoriesFulfilled',
  getInventoriesRejected = 'getInventoriesRejected',
  //Lý do trả hàng
  getReturnedReasonPending = 'getReturnedReasonPending',
  getReturnedReasonFulfilled = 'getReturnedReasonFulfilled',
  getReturnedReasonRejected = 'getReturnedReasonRejected',
  //Nhóm khách hàng
  getGroupCustomerPending = 'getGroupCustomerPending',
  getGroupCustomerFulfilled = 'getGroupCustomerFulfilled',
  getGroupCustomerRejected = 'getGroupCustomerRejected',
  //Nhóm nhà cung cấp
  getGroupSupplierPending = 'getGroupSupplierPending',
  getGroupSupplierFulfilled = 'getGroupSupplierFulfilled',
  getGroupSupplierRejected = 'getGroupSupplierRejected',
  // Loại phiếu nhập kho
  getInventoryReceiptTypesListPending = 'getInventoryReceiptTypesListPending',
  getInventoryReceiptTypesListFulfilled = 'getInventoryReceiptTypesListFulfilled',
  getInventoryReceiptTypesListRejected = 'getInventoryReceiptTypesListRejected',
  // Lý do kiểm kho
  getInventoryCheckNoteReasonPending = 'getInventoryCheckNoteReasonPending',
  getInventoryCheckNoteReasonFulfilled = 'getInventoryCheckNoteReasonFulfilled',
  getInventoryCheckNoteReasonRejected = 'getInventoryCheckNoteReasonRejected',
  // Loại phiếu xuất kho
  getInventoryIssueTypesListPending = 'getInventoryIssueTypesListPending',
  getInventoryIssueTypesListFulfilled = 'getInventoryIssueTypesListFulfilled',
  getInventoryIssueTypesListRejected = 'getInventoryIssueTypesListRejected',
  // Danh sách VAT
  getVATListPending = 'getVATListPending',
  getVATListFulfilled = 'getVATListFulfilled',
  getVATListRejected = 'getVATListRejected',
  // Nhóm người nộp
  getEntityGroupPending = 'getEntityGroupPending',
  getEntityGroupFulfilled = 'getEntityGroupFulfilled',
  getEntityGroupRejected = 'getEntityGroupRejected',
  // Loại khách hàng
  getCustomerTypePending = 'getCustomerTypePending',
  getCustomerTypeFulfilled = 'getCustomerTypeFulfilled',
  getCustomerTypeRejected = 'getCustomerTypeRejected',
  // Nguồn khách hàng
  getCustomerSourcePending = 'getCustomerSourcePending',
  getCustomerSourceFulfilled = 'getCustomerSourceFulfilled',
  getCustomerSourceRejected = 'getCustomerSourceRejected',
  // Task tags
  getTaskTagPending = 'getTaskTagPending',
  getTaskTagFulfilled = 'getTaskTagFulfilled',
  getTaskTagRejected = 'getTaskTagRejected',
  // Task status
  getTaskStatusPending = 'getTaskStatusPending',
  getTaskStatusFulfilled = 'getTaskStatusFulfilled',
  getTaskStatusRejected = 'getTaskStatusRejected',

  //EVN

  // Loại cấp điện áp
  getVoltageTypePending = 'getVoltageTypePending',
  getVoltageTypeFulfilled = 'getVoltageTypeFulfilled',
  getVoltageTypeRejected = 'getVoltageTypeRejected',

  // Loại chủ đầu tư
  getOwnerTypePending = 'getOwnerTypePending',
  getOwnerTypeFulfilled = 'getOwnerTypeFulfilled',
  getOwnerTypeRejected = 'getOwnerTypeRejected',

  // Loại dịch vụ tư vấn
  getConsultServicePending = 'getConsultServicePending',
  getConsultServiceFulfilled = 'getConsultServiceFulfilled',
  getConsultServiceRejected = 'getConsultServiceRejected',

  // Phòng ban
  getOrganizationStructurePending = 'getOrganizationStructurePending',
  getOrganizationStructureFulfilled = 'getOrganizationStructureFulfilled',
  getOrganizationStructureRejected = 'getOrganizationStructureRejected',

  // Mẫu quy trình
  getProcessTemplatePending = 'getProcessTemplatePending',
  getProcessTemplateFulfilled = 'getProcessTemplateFulfilled',
  getProcessTemplateRejected = 'getProcessTemplateRejected',

  // Chủ đầu tư
  getInvestorPending = 'getInvestorPending',
  getInvestorFulfilled = 'getInvestorFulfilled',
  getInvestorRejected = 'getInvestorRejected',
}
