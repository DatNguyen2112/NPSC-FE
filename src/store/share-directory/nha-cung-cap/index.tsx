import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { API, routerLinks } from '@utils';
import { customMessage } from '../../../index';

const name = 'NhaCungCap';
const action = {
  ...new Action<NhaCungCapModel, EStatusNhaCungCap>(name),
  deleteSuppliers: createAsyncThunk(name + 'deleteSuppliers', async ({ ids }: { ids: string[] }) => {
    const res = await API.delete(`${routerLinks(name, 'api')}?${ids.map((id) => `ids=${id}`).join('&')}`);
    return res;
  }),
};

export const nhaCungCapSlice = createSlice(
  new Slice<NhaCungCapModel, EStatusNhaCungCap>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.deleteSuppliers.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusNhaCungCap.deleteSuppliersPending;
      })
      .addCase(action.deleteSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusNhaCungCap.deleteSuppliersFulfilled;
        state.responseDeleteCustomers = action.payload.data;
      })
      .addCase(action.deleteSuppliers.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusNhaCungCap.deleteSuppliersRejected;
      });
  }),
);
export const NhaCungCapFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateNhaCungCap<NhaCungCapModel>),
    set: (values: StateNhaCungCap<NhaCungCapModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateNhaCungCap<NhaCungCapModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: NhaCungCapModel) => dispatch(action.post({ values })),
    put: (values: NhaCungCapModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    deleteSuppliers: (ids: string[]) => dispatch(action.deleteSuppliers({ ids })),
  };
};
interface StateNhaCungCap<T> extends State<T, EStatusNhaCungCap> {
  isEdit?: boolean;
  isFilter?: boolean;
  detailItemCC?: any;
  detailItemVT?: any;
  subTotal?: number | any;
  totalQuantity?: number | any;
  selectedRowKeys?: string[];
  debtDateRange?: any[];
  isVisibleTooltip?: boolean;
  responseDeleteCustomers?: any;
  openModalDelete?: boolean;
  showDeleted?: boolean;
  showCannotDeleted?: boolean;
  listAccountBanking?: any;
  isMapVisible?: boolean;
}
export class NhaCungCapModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public name?: string,
    public phoneNumber?: string,
    public address?: string,
    public note?: string,
    public email?: string,
    public taxCode?: string,
    public description?: string,
    public website?: string,
    public fax?: string,
    public isActive?: boolean,
    public totalDebtAmount?: number,
    public provinceCode?: number,
    public districtCode?: number,
    public wardCode?: number,
    public provinceName?: string,
    public districtName?: string,
    public wardName?: string,
    public supplierGroupCode?: string,
    public nguoiPhuTrach?: string,
    public listAccountBanking?: any,
    public paymentMethod?: string,
  ) {
    super();
  }
}

export enum EStatusNhaCungCap {
  idle = 'idle',
  deleteSuppliersPending = 'deleteCustomersPending',
  deleteSuppliersFulfilled = 'deleteCustomersFulfilled',
  deleteSuppliersRejected = 'deleteCustomersRejected',
}
