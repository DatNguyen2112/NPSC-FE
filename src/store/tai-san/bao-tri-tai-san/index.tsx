import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'BaoTriTaiSan';
const action = {
  ...new Action<PhieuBaoTri, EStatusBaoTri>(name),
  getAssetMaintenanceStatus: createAsyncThunk(
    name + '/count-by-status',
    async (params: QueryParams) => await API.get<PhieuBaoTri>(`${routerLinks(name, 'api')}/count-by-status`, params),
  ),
  complete: createAsyncThunk(name + '/complete', (params: { id: string; completedDate: string }) =>
    API.put(`${routerLinks(name, 'api')}/${params.id}/complete`, { completedDate: params.completedDate }),
  ),
};

export const baoTriTaiSanSlice = createSlice(
  new Slice<PhieuBaoTri, EStatusBaoTri>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.getAssetMaintenanceStatus.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusBaoTri.getAssetMaintenanceStatusPending;
      })
      .addCase(action.getAssetMaintenanceStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusBaoTri.getAssetMaintenanceStatusFulfilled;
        state.assetMaintenanceStatus = action.payload.data;
      })
      .addCase(action.getAssetMaintenanceStatus.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusBaoTri.getAssetMaintenanceStatusRejected;
      })
      // Thêm xử lý cho complete:
      .addCase(action.complete.pending, (state) => {
        state.isLoading = true;
        state.isFormLoading = true;
        state.status = EStatusBaoTri.completePending;
      })
      .addCase(action.complete.fulfilled, (state, action: StateBaoTriTaiSan<PhieuBaoTri>) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.completeModalSheetId = undefined;
        state.status = EStatusBaoTri.completeFulfilled;
      })
      .addCase(action.complete.rejected, (state, action: StateBaoTriTaiSan<PhieuBaoTri>) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.completeModalSheetId = undefined;
        state.status = EStatusBaoTri.completeRejected;
      });
  }),
);
export const BaoTriTaiSanFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateBaoTriTaiSan<PhieuBaoTri>),
    set: (values: StateBaoTriTaiSan<PhieuBaoTri>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateBaoTriTaiSan<PhieuBaoTri> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: PhieuBaoTri) => dispatch(action.post({ values })),
    put: (values: PhieuBaoTri) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getAssetMaintenanceStatus: (params: QueryParams) => dispatch(action.getAssetMaintenanceStatus(params)),
    complete: (params: { id: string; completedDate: string }) => dispatch(action.complete(params)),
  };
};
interface StateBaoTriTaiSan<T> extends State<T, EStatusBaoTri> {
  isEdit?: boolean;
  visible?: boolean;
  isFilter?: boolean;
  isDetail?: boolean;
  completeModalSheetId?: string;
  assetMaintenanceStatus?: any;
  currentSavedFilterCount?: number;
  // Bộ lọc
  isFilterUsed?: boolean;
  filterName?: any;
  popoverVisible?: boolean;
  assetMaintenanceSavedFilters?: SavedFilter[];
}

interface SavedFilter {
  id: string;
  name: string;
  filter: string;
}
export class PhieuBaoTri extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public assetId?: string,
    public assetName?: string,
    public maintenanceType?: string,
    public startDate?: string,
    public maintenancePeriod?: string,
    public performerId?: string,
    public performerName?: string,
    public maintenanceLocation?: string,
    public maintenancePlace?: string,
    public estimatedCost?: number,
    public maintenanceContent?: string,
    public status?: string,
    public createdByUserId?: string,
    public createdByUserName?: string,
    public createdOnDate?: string,
    public lastModifiedByUserId?: string,
    public lastModifiedByUserName?: string,
    public lastModifiedOnDate?: string,
  ) {
    super();
  }
}

export interface MaintenanceContent {
  id: string; // id
  code: string; // Mã nội dung bảo trì
  maintenanceSheetId: string; // Mã phiếu bảo trì
  description: string; // Mô tả chi tiết
  createdDate: string; // Số lượng bảo trì (nếu cần)
  createdPerson: string; // Số lượng bảo trì (nếu cần)
  cost: number; // Chi phí bảo trì
}

export enum EStatusBaoTri {
  getAssetMaintenanceStatusPending = 'getAssetMaintenanceStatusPending',
  getAssetMaintenanceStatusFulfilled = 'getAssetMaintenanceStatusFulfilled',
  getAssetMaintenanceStatusRejected = 'getAssetMaintenanceStatusRejected',
  completePending = 'completePending',
  completeFulfilled = 'completeFulfilled',
  completeRejected = 'completeRejected',
}
