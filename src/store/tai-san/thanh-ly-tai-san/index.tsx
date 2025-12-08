import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'ThanhLyTaiSan';
const action = {
  ...new Action<ThanhLy, EStatusThanhLy>(name),
  getAssetLiquidationStatus: createAsyncThunk(
    name + '/count-by-status',
    async (params: QueryParams) => await API.get<ThanhLy>(`${routerLinks(name, 'api')}/count-by-status`, params),
  ),
};

export const thanhLyTaiSanSlice = createSlice(
  new Slice<ThanhLy, EStatusThanhLy>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.getAssetLiquidationStatus.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThanhLy.getAssetLiquidationStatusPending;
      })
      .addCase(action.getAssetLiquidationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusThanhLy.getAssetLiquidationStatusFulfilled;
        state.assetLiquidationStatus = action.payload.data;
      })
      .addCase(action.getAssetLiquidationStatus.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThanhLy.getAssetLiquidationStatusRejected;
      });
  }),
);
export const ThanhLyTaiSanFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateThanhLyTaiSan<ThanhLy>),
    set: (values: StateThanhLyTaiSan<ThanhLy>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateThanhLyTaiSan<ThanhLy> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: ThanhLy) => dispatch(action.post({ values })),
    put: (values: ThanhLy) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getAssetLiquidationStatus: (params: QueryParams) => dispatch(action.getAssetLiquidationStatus(params)),
  };
};
interface StateThanhLyTaiSan<T> extends State<T> {
  isEdit?: boolean;
  visible?: boolean;
  isFilter?: boolean;
  isDetail?: boolean;
  assetLiquidationStatus?: any;
  currentSavedFilterCount?: number;

  // Bộ lọc
  isFilterUsed?: boolean;
  filterName?: any;
  popoverVisible?: boolean;
  assetLiquidationSavedFilters?: SavedFilter[];

  // Thêm nhanh sản phẩm
  assetList?: any;
  isProductModalOpen?: boolean;
  selectedAssets?: any[];
  assetListMany?: any[];
}

interface SavedFilter {
  id: string;
  name: string;
  filter: string;
}
export class ThanhLy extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public assetId?: string,
    public assetName?: string,
    public liquidationDate?: string,
    public decisionNumber?: string,
    public liquidatorId?: string,
    public liquidatorName?: string,
    public liquidationValue?: number,
    public liquidationReason?: string,
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

export interface AssetLiquidationItems {
  id: string; // id
  assetId: string; // Mã tài sản
  assetName: string; // Tên tài sản
  liquidationSheetId: string; // Mã phiếu thanh lý
  placeOfUseId: string; // ID vị trí sử dụng
  placeOfUseName: string; // Tên vị trí sử dụng
  originalPrice: number; // Nguyên giá
  liquidationReason: number; // Lý do thanh lý
  liquidationPrice: number; //  Giá thanh lý
}

export enum EStatusThanhLy {
  getAssetLiquidationStatusPending = 'getAssetLiquidationStatusPending',
  getAssetLiquidationStatusFulfilled = 'getAssetLiquidationStatusFulfilled',
  getAssetLiquidationStatusRejected = 'getAssetLiquidationStatusRejected',
}
