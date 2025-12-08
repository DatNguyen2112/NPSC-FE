import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { API, routerLinks } from '@utils';

const name = 'KhachHang';
// const action = new Action<KhachHangModel>(name);
const action = {
  ...new Action<CustomerModel, EStatusKhachHang>(name),
  getCheckQuotes: createAsyncThunk(name + 'getCheckQuotes', async (id: string) => {
    const { data } = await API.get(`/khach-hang/${id}/quotes`);
    return data;
  }),
  deleteCustomers: createAsyncThunk(name + 'deleteCustomers', async ({ ids }: { ids: string[] }) => {
    const res = await API.delete(`${routerLinks(name, 'api')}?${ids.map((id) => `ids=${id}`).join('&')}`);
    return res;
  }),
  getCustomerSummary: createAsyncThunk(
    name + '/getCustomerSummary',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/customer-summary`, params),
  ),
};
export const khachHangSlice = createSlice(
  new Slice<CustomerModel, EStatusKhachHang>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.getCustomerSummary.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusKhachHang.getCustomerSummaryPending;
      })
      .addCase(action.getCustomerSummary.fulfilled, (state: StateKhachHang<CustomerModel>, action: any) => {
        state.isLoading = false;
        state.status = EStatusKhachHang.getCustomerSummaryFulfilled;
        state.customerSummary = action.payload.data;
      })
      .addCase(action.getCustomerSummary.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusKhachHang.getCustomerSummaryRejected;
      })

      .addCase(action.getCheckQuotes.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusKhachHang.getCheckQuotesPending;
      })
      .addCase(action.getCheckQuotes.fulfilled, (state, action) => {
        state.isKhachHangInBaoGia = action.payload;
        state.isLoading = false;
        state.status = EStatusKhachHang.getCheckQuotesFulfilled;
      })
      .addCase(action.getCheckQuotes.rejected, (state) => {
        state.status = EStatusKhachHang.getCheckQuotesRejected;
        state.isLoading = false;
      })
      .addCase(action.deleteCustomers.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusKhachHang.deleteCustomersPending;
      })
      .addCase(action.deleteCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusKhachHang.deleteCustomersFulfilled;
        state.responseDeleteCustomers = action.payload.data;
      })
      .addCase(action.deleteCustomers.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusKhachHang.deleteCustomersRejected;
      });
  }),
);
export const CustomerFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateKhachHang<CustomerModel>),
    set: (values: StateKhachHang<CustomerModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateKhachHang<CustomerModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: CustomerModel) => dispatch(action.post({ values })),
    put: (values: CustomerModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getCheckQuotes: (id: string) => dispatch(action.getCheckQuotes(id)),
    deleteCustomers: (ids: string[]) => dispatch(action.deleteCustomers({ ids })),
    getCustomerSummary: (params: QueryParams) => dispatch(action.getCustomerSummary(params)),
  };
};
interface StateKhachHang<T> extends State<T, EStatusKhachHang> {
  isEdit?: boolean;
  visible?: boolean;
  isFilter?: boolean;
  isDetail?: boolean;
  quotedCustomer?: boolean;
  radioChecker?: string;
  selectedRowKeys?: string[];
  isOpen?: boolean;
  name?: string;
  debtDateRange?: any[];
  isVisibleTooltip?: boolean;
  isLoading?: boolean;
  openModalDelete?: boolean;
  responseDeleteCustomers?: any;
  showDeleted?: boolean;
  showCannotDeleted?: boolean;
  newTabItems?: any;
  customerSummary?: any;
  isCreateCustomerService?: boolean;
  isUpdateCustomer?: boolean;
  isOpenModalCustomerService?: boolean;
  isOpenShowMoreComment?: boolean;

  // Filter
  customerType?: string;
  customerGroupCode?: string;
  code?: string;
  phoneNumber?: string;
  dateRange?: string[] | any;
  isActive?: boolean;

  // handle logic update customer service module
  customerServiceId?: string;
  customerServiceItems?: any;

  // Active key
  activeKey?: string;

  // comment module
  mentionList?: string[] | any;
  mentionListWhenOnChange?: string[] | any;
  commentId?: string | any;
  contentItem?: string | any;
  keyboardName?: string | any;
  multipleTagger?: string[] | any;
  multipleTaggerInModal?: string[] | any;
  editorContent?: string;
  titleModal?: string | any;

}
export class CustomerModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public name?: string,
    public customerType?: string | any,
    public customerSource?: string[] | any,
    public taxCode?: string,
    public note?: string,
    public debtAmount?: number,
    public phoneNumber?: string,
    public address?: string,
    public birthdate?: string,
    public website?: string,
    public sex?: string,
    public fax?: string,
    public email?: string,
    public linkFacebook?: string,
    public linkTiktok?: string,
    public linkTelegram?: string,
    public isActive?: boolean,
    public lichSuChamSoc?: any,
    public nhuCauBanDau?: string,
    public informationToCopy?: string,
    public initialRequirement?: string,
    public totalCareTimes?: number,
    public totalDaysLastCare?: number,
    public totalQuotationCount?: number,
    public provinceCode?: number,
    public provinceName?: string,
    public districtCode?: number,
    public districtName?: string,
    public wardCode?: number,
    public wardName?: string,
    public listPersonInCharge?: string[],
  ) {
    super();
  }
}

export type T_CustomerFilterFields = {
  fullTextSearch?: string;
  customerType?: string;
  customerGroupCode?: string;
  name?: string;
  code?: string;
  phoneNumber?: string;
  isActive?: boolean;
  dateRange?: string[] | any;
};
export type KhachHangFormValue = {
  code?: string;
  name?: string;
  taxCode?: string;
  note?: string;
  debtAmount?: number;
  phoneNumber?: string;
  address?: string;
  baoGia?: string;
  birthdate?: string;
  linkFacebook?: string;
  linkTiktok?: string;
  linkTelegram?: string;
  customerType?: string;
  customerSource?: string[];
  initialRequirement?: string;
  listPersonInCharge?: string[] | any;
  website?: string;
  sex?: string;
  fax?: string;
  email?: string;
  province?: {
    value: string;
    label: string;
  };
  district?: {
    value: string;
    label: string;
  };
  ward?: {
    value: string;
    label: string;
  };
  provinceCode?: number;
  provinceName?: string;
  districtCode?: number;
  districtName?: string;
  wardCode?: number;
  wardName?: string;
  isActive?: boolean;
  customerGroupCode?: string;
  paymentMethod?: string;
};
export type KhachHangCreateUpdateModel = {
  code?: string;
  name?: string;
  customerType?: string | any;
  customerSource?: string[];
  taxCode?: string;
  note?: string;
  debtAmount?: number;
  phoneNumber?: string;
  address?: string;
  baoGia?: string;
  birthdate?: string;
  linkFacebook?: string;
  linkTiktok?: string;
  linkTelegram?: string;
  type?: string[];
  initialRequirement?: string;
  website?: string;
  sex?: string;
  fax?: string;
  email?: string;
  provinceCode?: number;
  provinceName?: string;
  districtCode?: number;
  districtName?: string;
  wardCode?: number;
  wardName?: string;
  isActive?: boolean;
  customerGroupCode?: string;
  listPersonInCharge?: string[] | any;
  paymentMethod?: string;
};

export enum EStatusKhachHang {
  idle = 'idle',
  getCheckQuotesPending = 'getCheckQuotesPending',
  getCheckQuotesFulfilled = 'getCheckQuotesFulfilled',
  getCheckQuotesRejected = 'getCheckQuotesRejected',
  deleteCustomersPending = 'deleteCustomersPending',
  deleteCustomersFulfilled = 'deleteCustomersFulfilled',
  deleteCustomersRejected = 'deleteCustomersRejected',

  getCustomerSummaryPending = 'getCustomerSummaryPending',
  getCustomerSummaryFulfilled = 'getCustomerSummaryFulfilled',
  getCustomerSummaryRejected = 'getCustomerSummaryRejected',
}
