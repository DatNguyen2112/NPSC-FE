import { CommonEntity, QueryParams } from '@models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'QuanLyTaiSan';
const action = {
  ...new Action<TaiSan, EStatusTaiSan>(name),
  getAssetStatus: createAsyncThunk(
    name + '/count-by-status',
    async (params: QueryParams) => await API.get<TaiSan>(`${routerLinks(name, 'api')}/count-by-status`, params),
  ),
  reportDamage: createAsyncThunk(name + 'reportDamage', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${values?.id}/report-damage`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  reportLost: createAsyncThunk(name + 'reportLost', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${values?.id}/report-lost`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  reportDestroyed: createAsyncThunk(name + 'reportDestroyed', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${values?.id}/report-destroyed`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  allocate: createAsyncThunk(name + 'allocate', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${values?.id}/allocate`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  revoke: createAsyncThunk(name + 'revoke', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${values?.id}/revoke`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  transfer: createAsyncThunk(name + 'transfer', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${values?.id}/transfer`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  allocateEmail: createAsyncThunk(name + 'allocateEmail', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${values?.id}/allocate-email`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  revokeEmail: createAsyncThunk(name + 'revokeEmail', async ({ values }: { values: TaiSan }) => {
    const res = await API.put(
      `${routerLinks(name, 'api')}/${values?.id}/${values?.isTransfer ? 'transfer' : 'revoke'}-email`,
      values,
    );
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
};

export const quanLyTaiSanSlice = createSlice(
  new Slice<TaiSan, EStatusTaiSan>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.getAssetStatus.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaiSan.getAssetStatusPending;
      })
      .addCase(action.getAssetStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assetStatus = action.payload.data;
        state.status = EStatusTaiSan.getAssetStatusFulfilled;
      })
      .addCase(action.getAssetStatus.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaiSan.getAssetStatusRejected;
      })
      .addCase(action.reportDamage.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.reportDamagePending;
      })
      .addCase(action.reportDamage.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.reportDamageRejected;
      })
      .addCase(action.reportDamage.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.reportDamageFulfilled;
      })
      .addCase(action.reportLost.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.reportLostPending;
      })
      .addCase(action.reportLost.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.reportLostRejected;
      })
      .addCase(action.reportLost.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.reportLostFulfilled;
      })
      .addCase(action.reportDestroyed.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.reportDestroyedPending;
      })
      .addCase(action.reportDestroyed.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.reportDestroyedRejected;
      })
      .addCase(action.reportDestroyed.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.reportDestroyedFulfilled;
      })
      .addCase(action.allocate.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.allocatePending;
      })
      .addCase(action.allocate.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.allocateRejected;
      })
      .addCase(action.allocate.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.allocateFulfilled;
      })
      .addCase(action.revoke.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.revokePending;
      })
      .addCase(action.revoke.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.revokeRejected;
      })
      .addCase(action.revoke.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.revokeFulfilled;
      })
      .addCase(action.transfer.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.transferPending;
      })
      .addCase(action.transfer.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.transferRejected;
      })
      .addCase(action.transfer.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.transferFulfilled;
      })
      .addCase(action.allocateEmail.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.allocateEmailPending;
      })
      .addCase(action.allocateEmail.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.allocateEmailRejected;
      })
      .addCase(action.allocateEmail.fulfilled, (state) => {
        state.isFormLoading = false;
        state.isGrant = false;
        state.isRevoke = false;
        state.status = EStatusTaiSan.allocateEmailFulfilled;
      })
      .addCase(action.revokeEmail.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusTaiSan.revokeEmailPending;
      })
      .addCase(action.revokeEmail.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusTaiSan.revokeEmailRejected;
      })
      .addCase(action.revokeEmail.fulfilled, (state) => {
        state.isFormLoading = false;
        state.isGrant = false;
        state.isRevoke = false;
        state.status = EStatusTaiSan.revokeEmailFulfilled;
      });
  }),
);
export const QuanLyTaiSanFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateQuanLyTaiSan<TaiSan>),
    set: (values: StateQuanLyTaiSan<TaiSan>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateQuanLyTaiSan<TaiSan> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: TaiSan) => dispatch(action.post({ values })),
    put: (values: TaiSan) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getAssetStatus: (params: QueryParams) => dispatch(action.getAssetStatus(params)),
    reportDamage: (values: TaiSan) => dispatch(action.reportDamage({ values })),
    reportLost: (values: TaiSan) => dispatch(action.reportLost({ values })),
    reportDestroyed: (values: TaiSan) => dispatch(action.reportDestroyed({ values })),
    allocate: (values: TaiSan) => dispatch(action.allocate({ values })),
    revoke: (values: TaiSan) => dispatch(action.revoke({ values })),
    transfer: (values: TaiSan) => dispatch(action.transfer({ values })),
    allocateEmail: (values: TaiSan) => dispatch(action.allocateEmail({ values })),
    revokeEmail: (values: TaiSan) => dispatch(action.revokeEmail({ values })),
  };
};
interface StateQuanLyTaiSan<T> extends State<T, EStatusTaiSan> {
  isEdit?: boolean;
  visible?: boolean;
  isFilter?: boolean;
  isDetail?: boolean;
  assetStatus?: any;
  currentSavedFilterCount?: number;
  // Bộ lọc
  isFilterUsed?: boolean;
  filterName?: any;
  popoverVisible?: boolean;
  assetManagementSavedFilters?: SavedFilter[];
  selectedRowKeysTable?: string[];
  isGrant?: boolean;
  isAllocate?: boolean;
  isRevoke?: boolean;
  isBulkCreate?: boolean;
  isDuplicate?: boolean;
  isLost?: boolean;
  isCancel?: boolean;
  isMaintenance?: boolean;
  isMaintenanceUpdate?: boolean;
  isDamage?: boolean;
  isLiquidation?: boolean;
  isLiquidationUpdate?: boolean;
  assetUsageHistories?: AssetUsageHistory[];
}

interface SavedFilter {
  id: string;
  name: string;
  filter: string;
}
export class TaiSan extends CommonEntity {
  constructor(
    public code?: string, // Mã tài sản
    public name?: string, // Tên tài sản
    public assetTypeCode?: string, // Mã loai tài sản
    public assetTypeName?: string, // Tên loai tài sản
    public groupCode?: string, // mã nhóm tài sản
    public groupName?: string, // tên nhóm tài sản
    public description?: string, // Mô tả chi tiết về tài sản
    public purchasedDate?: string, // Ngày mua (có thể là định dạng ISO)
    public assetLocationId?: string, // Id vị trí tài sản
    public assetLocationName?: string, // Tên vị trí tài sản
    public depreciation?: number, // Khấu hao
    public startOfUseDate?: string, // Ngày bắt đầu sử dụng tài sản
    public maintenanceCycle?: number, // Chu kỳ bảo trì
    public status?: string, // Trạng thái của tài sản
    public serial?: string, // Số serial của tài sản
    public originalPrice?: number, // Nguyên giá của tài sản
    public origin?: string, // Xuất xứ của tài sản
    public originBrand?: string, // Hãng sản xuất
    public certificateNumber?: string, // Số chứng từ
    public certificateDate?: string, // Ngày cấp chứng từ
    public manufactureDate?: string, // Ngày sản xuất
    public images?: any[], // Tài liệu đính kèm (ví dụ: hợp đồng, chứng từ)
    public documents?: any[], // Tài liệu đính kèm (ví dụ: hợp đồng, chứng từ)
    public incidentDate?: string, // Ngày xảy ra sự cố
    public compensationAmount?: number, // Số tiền bồi thường
    public userId?: string, // Id người sử dụng tài sản
    public executionDate?: string, // Ngày thực hiện
    public allowedOperations?: string[], // Các thao tác được phép thực hiện trên tài sản
    public isAllocate?: boolean, // Xác nhận hay từ chối cấp phát tài sản qua email
    public isTransfer?: boolean,
  ) {
    super();
  }
}

export enum EStatusTaiSan {
  getAssetStatusPending = 'getAssetStatusPending',
  getAssetStatusFulfilled = 'getAssetStatusFulfilled',
  getAssetStatusRejected = 'getAssetStatusRejected',
  // Báo hỏng
  reportDamagePending = 'reportDamagePending',
  reportDamageFulfilled = 'reportDamageFulfilled',
  reportDamageRejected = 'reportDamageRejected',
  // Báo mất
  reportLostPending = 'reportLostPending',
  reportLostFulfilled = 'reportLostFulfilled',
  reportLostRejected = 'reportLostRejected',
  // Báo hủy
  reportDestroyedPending = 'reportDestroyedPending',
  reportDestroyedFulfilled = 'reportDestroyedFulfilled',
  reportDestroyedRejected = 'reportDestroyedRejected',
  // Cấp phát
  allocatePending = 'allocatePending',
  allocateFulfilled = 'allocateFulfilled',
  allocateRejected = 'allocateRejected',
  // Thu hồi
  revokePending = 'revokePending',
  revokeFulfilled = 'revokeFulfilled',
  revokeRejected = 'revokeRejected',
  // Điều chuyển
  transferPending = 'transferPending',
  transferFulfilled = 'transferFulfilled',
  transferRejected = 'transferRejected',
  // Xác nhận cấp phát qua email
  allocateEmailPending = 'allocateEmailPending',
  allocateEmailFulfilled = 'allocateEmailFulfilled',
  allocateEmailRejected = 'allocateEmailRejected',
  // Xác nhận thu hồi qua email
  revokeEmailPending = 'revokeEmailPending',
  revokeEmailFulfilled = 'revokeEmailFulfilled',
  revokeEmailRejected = 'revokeEmailRejected',
}
export class AssetUsageHistory extends CommonEntity {
  constructor(
    public assetId?: string,
    public assetName?: string,
    public assetCode?: string,
    public operation?: string,
    public locationId?: string,
    public locationName?: string,
    public userId?: string,
    public userName?: string,
    public cost?: number,
    public description?: string,
  ) {
    super();
  }
}
