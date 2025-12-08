import { CommonEntity, EStatusState, QueryParams } from '@models';
import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';

const name = 'Address';
const action = {
  ...new Action<Address, EStatusAddress>(name),
  getByType: createAsyncThunk(
    name + '/getByType',
    async ({ type, ma }: { type: string; ma: string }) => await API.get(`${routerLinks(name, 'api')}/${type}`, { ma }),
  ),
  getTinh: createAsyncThunk(name + '/getTinh', async () => await API.get(`http://npsc.geneat.pro/api/v1/tinh`)),
  getHuyen: createAsyncThunk(
    name + '/getHuyen',
    async ( params: QueryParams ) => await API.get(`http://npsc.geneat.pro/api/v1/huyen`, params),
  ),
  getXa: createAsyncThunk(
    name + '/getXa',
    async ( params: QueryParams ) => await API.get(`http://npsc.geneat.pro/api/v1/phuong`, params),
  ),
  getFilterTinh: createAsyncThunk(
    name + '/getFilterTinh',
    async ({ filter }: { filter: string }) => await API.get(`${routerLinks(name, 'api')}/filter-tinh`, { filter }),
  ),
  getFilterHuyen: createAsyncThunk(
    name + '/getFilterHuyen',
    async ({ filter }: { filter: string }) => await API.get(`${routerLinks(name, 'api')}/filter-huyen`, { filter }),
  ),
};
export const addressSlice = createSlice(
  new Slice<Address, EStatusAddress>(action, { list: [] }, (builder) => {
    builder
      .addCase(action.getByType.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusAddress.getByTypePending;
      })
      .addCase(action.getByType.fulfilled, (state, action) => {
        if (action.payload) {
          state.list = action.payload.data;
          state.status = EStatusAddress.getByTypeFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getByType.rejected, (state) => {
        state.status = EStatusAddress.getByTypeRejected;
        state.isLoading = false;
      })
      .addCase(action.getTinh.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.isTinhLoading = true;
        state.status = EStatusAddress.getTinhPending;
      })
      .addCase(action.getTinh.fulfilled, (state, action) => {
        if (action.payload) {
          state.listTinh = (action.payload.data as Draft<Address[]>).map((item: any) => ({
            value: item.provinceCode,
            label: item.provinceName,
          }));
          state.status = EStatusAddress.getTinhFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
        state.isTinhLoading = false;
      })
      .addCase(action.getTinh.rejected, (state: StateAddress<Address>) => {
        state.status = EStatusAddress.getTinhRejected;
        state.isLoading = false;
        state.isTinhLoading = false;
      })
      .addCase(action.getHuyen.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.isHuyenLoading = true;
        state.status = EStatusAddress.getHuyenPending;
      })
      .addCase(action.getHuyen.fulfilled, (state, action) => {
        if (action.payload) {
          state.listHuyen = (action.payload.data as Draft<Address[]>).map((item: any) => ({
            value: item.districtCode,
            label: item.districtName,
          }));
          state.status = EStatusAddress.getHuyenFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
        state.isHuyenLoading = false;
      })
      .addCase(action.getHuyen.rejected, (state: StateAddress<Address>) => {
        state.status = EStatusAddress.getHuyenRejected;
        state.isLoading = false;
        state.isHuyenLoading = false;
      })
      .addCase(action.getXa.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusAddress.getXaPending;
      })
      .addCase(action.getXa.fulfilled, (state, action) => {
        if (action.payload) {
          state.listXa = (action.payload.data as Draft<Address[]>).map((item: any) => ({
            value: item.communeCode,
            label: item.communeName,
          }));
          state.status = EStatusAddress.getXaFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getXa.rejected, (state: StateAddress<Address>) => {
        state.status = EStatusAddress.getXaRejected;
        state.isLoading = false;
      })
      .addCase(action.getFilterTinh.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.isTinhLoading = true;
        state.status = EStatusAddress.getFilterTinhPending;
      })
      .addCase(action.getFilterTinh.fulfilled, (state, action) => {
        if (action.payload) {
          state.listTinh = (action.payload.data as Draft<Address[]>).map((item: any) => ({
            value: item.id,
            label: item.ten,
          }));
          state.status = EStatusAddress.getFilterTinhFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
        state.isTinhLoading = false;
      })
      .addCase(action.getFilterTinh.rejected, (state) => {
        state.status = EStatusAddress.getFilterTinhRejected;
        state.isLoading = false;
        state.isTinhLoading = false;
      })
      .addCase(action.getFilterHuyen.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.isHuyenLoading = true;
        state.status = EStatusAddress.getFilterHuyenPending;
      })
      .addCase(action.getFilterHuyen.fulfilled, (state, action) => {
        if (action.payload) {
          state.listHuyen = (action.payload.data as Draft<Address[]>).map((item: any) => ({
            value: item.id,
            label: item.ten,
          }));
          state.status = EStatusAddress.getFilterTinhFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
        state.isHuyenLoading = false;
      })
      .addCase(action.getFilterHuyen.rejected, (state) => {
        state.status = EStatusAddress.getFilterHuyenRejected;
        state.isLoading = false;
        state.isHuyenLoading = false;
      });
  }),
);
export const AddressFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...(useTypedSelector((state) => state[action.name]) as StateAddress<Address>),
    set: (values: StateAddress<Address>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateAddress<Address> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: Address) => dispatch(action.post({ values })),
    put: (values: Address) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getByType: (value: { type: string; ma: string }) => dispatch(action.getByType(value)),
    getTinh: () => dispatch(action.getTinh()),
    getHuyen: (params: QueryParams) => dispatch(action.getHuyen(params)),
    getXa: (params: QueryParams) => dispatch(action.getXa(params)),
    getFilterTinh: (params: { filter: string }) => dispatch(action.getFilterTinh(params)),
    getFilterHuyen: (params: { filter: string }) => dispatch(action.getFilterHuyen(params)),
  };
};
interface StateAddress<T> extends State<T, EStatusAddress> {
  list?: T[];
  isTinhLoading?: boolean;
  listTinh?: T[];
  isHuyenLoading?: boolean;
  listHuyen?: T[];
  isXaLoading?: boolean;
  listXa?: T[];
}
export class Address extends CommonEntity {
  constructor(
    public value: string = '',
    public label: string = '',
    public ma: string = '',
    public ten: string = '',
    public type: string = '',
  ) {
    super();
  }
}

export type ProvinceModel = {
  provinceCode?: number;
  provinceName?: string;
  totalDistrictShipDelay?: number;
  totalDistrictShipStop?: number;
  provinceName_VP?: string;
};
export type DistrictModel = {
  districtCode?: number;
  districtName?: string;
  totalDistrictShipDelay?: number;
  totalDistrictShipStop?: number;
  provinceCode?: number;
  description?: string;
  districtName_VP?: string;
};
export type WardModel = {
  communeCode?: number;
  communeName?: string;
  districtCode?: number;
  communeFullName?: string;
  wardName_VP?: string;
};

export enum EStatusAddress {
  getByTypePending = 'getByTypePending',
  getByTypeFulfilled = 'getByTypeFulfilled',
  getByTypeRejected = 'getByTypeRejected',
  getTinhPending = 'getTinhPending',
  getTinhFulfilled = 'getTinhFulfilled',
  getTinhRejected = 'getTinhRejected',
  getHuyenPending = 'getHuyenPending',
  getHuyenFulfilled = 'getHuyenFulfilled',
  getHuyenRejected = 'getHuyenRejected',
  getXaPending = 'getXaPending',
  getXaFulfilled = 'getXaFulfilled',
  getXaRejected = 'getXaRejected',
  getFilterTinhPending = 'getFilterTinhPending',
  getFilterTinhFulfilled = 'getFilterTinhFulfilled',
  getFilterTinhRejected = 'getFilterTinhRejected',
  getFilterHuyenPending = 'getFilterHuyenPending',
  getFilterHuyenFulfilled = 'getFilterHuyenFulfilled',
  getFilterHuyenRejected = 'getFilterHuyenRejected',
}
