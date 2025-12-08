import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'EInvoice';
const action = {
  ...new Action<EInvoiceModel, EStatusEInvoice>(name),
  putPayment: createAsyncThunk(
    name + 'putPayment',
    async ({ id, values }: { id: string; values: PaymentEInvoiceCreateModel }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/payment/${id}`, values);
      return res;
    },
  ),
  putActive: createAsyncThunk(name + 'putActive', async (id: string) => {
    const res = await API.put(`${routerLinks(name, 'api')}/active/${id}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
};
export const eInvoiceSlice = createSlice(
  new Slice<EInvoiceModel, EStatusEInvoice>(action, {}, (builder) => {
    builder
      .addCase(action.putPayment.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusEInvoice.putPaymentPending;
      })
      .addCase(action.putPayment.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusEInvoice.putPaymentFulfilled;
      })
      .addCase(action.putPayment.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusEInvoice.putPaymentRejected;
      })
      // Kích hoạt hợp đồng
      .addCase(action.putActive.pending, (state) => {
        state.isFormLoading = true;
        state.isLoading = true;
        state.status = EStatusEInvoice.putActivePending;
      })
      .addCase(action.putActive.fulfilled, (state) => {
        state.isFormLoading = false;
        state.isLoading = false;
        state.status = EStatusEInvoice.putActiveFulfilled;
      })
      .addCase(action.putActive.rejected, (state) => {
        state.isFormLoading = false;
        state.isLoading = false;
        state.status = EStatusEInvoice.putActiveRejected;
      });
  }),
);
export const EInvoiceFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateEInvoice<EInvoiceModel>),
    set: (values: StateEInvoice<EInvoiceModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateEInvoice<EInvoiceModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: EInvoiceModel) => dispatch(action.post({ values })),
    put: (values: EInvoiceModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    putPayment: ({ id, values }: { id: string; values: PaymentEInvoiceCreateModel }) =>
      dispatch(action.putPayment({ id, values })),
    putActive: (id: string) => dispatch(action.putActive(id)),
  };
};
interface StateEInvoice<T> extends State<T, EStatusEInvoice> {
  isShowPaymentModal?: boolean;
  isVisibleForm?: boolean;
}
export class EInvoiceModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public sellerName?: string,
    public sellerTaxCode?: string,
    public sellerAddress?: string,
    public sellerPhoneNumber?: string,
    public sellerBankAccount?: number,
    public sellerBankName?: string,
    public buyerName?: string,
    public buyerTaxCode?: string,
    public buyerAddress?: string,
    public buyerPhoneNumber?: string,
    public paymentMethodName?: string,
    public buyerBankAccount?: number,
    public buyerBankName?: string,
    public totalBeforeVatAmount?: number,
    public totalVatAmount?: number,
    public totalAmount?: number,
    public totalAmountInWords?: string,
    public paidAmount?: number,
    public stillInDebtAmount?: number,
    public listOfPaymentHistory?: PaymentEInvoiceViewModel[],
    public note?: string,
    public paymentStatusCode?: string,
    public paymentStatusName?: string,
    public paymentStatusColor?: string,
    public eInvoiceItems?: EInvoiceItemModel[],
    public eInvoiceVatAnalytics?: EInvoiceVatAnalyticsModel[],
  ) {
    super();
  }
}

export enum EStatusEInvoice {
  putPaymentPending = 'putPaymentPending',
  putPaymentFulfilled = 'putPaymentFulfilled',
  putPaymentRejected = 'putPaymentRejected',
  putActivePending = 'putActivePending',
  putActiveFulfilled = 'putActiveFulfilled',
  putActiveRejected = 'putActiveRejected',
}

export type EInvoiceItemModel = {
  id?: string;
  lineNumber?: number;
  name?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  lineAmount?: number;
  vatPercent?: number;
  vatAmount?: number;
};

export type EInvoiceVatAnalyticsModel = {
  id?: string;
  synthetic?: string;
  beforeVatAmount?: number;
  vatAmount?: number;
  totalPaymentAmount?: number;
};

export type PaymentEInvoiceCreateModel = {
  paymentMethodCode?: string;
  amount?: number;
  paymentOnDate?: Date;
  note?: string;
};

export type PaymentEInvoiceViewModel = {
  id?: string;
  paymentMethodCode?: string;
  paymentMethodName?: string;
  amount?: number;
  paymentOnDate?: string;
  note?: string;
  paymentByUserName?: string;
};
