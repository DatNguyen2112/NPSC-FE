import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, EStatusState, Pagination, QueryParams } from '@models';
import { API, routerLinks } from '@utils';
import { Message } from '@core/message';
import { customMessage } from '../../index';

const name = 'CashAndBank';

const action = {
  ...new Action<CashAndBankModel, EStatusCashAndBank>(name),
  suspendAccount: createAsyncThunk(name + 'suspendAccount', async ({ id }: { id: string }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/suspend-account/${id}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),

  reactiveAccount: createAsyncThunk(name + 'reactiveAccount', async ({ id }: { id: string }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/reactive-account/${id}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),

  getAllTransactions: createAsyncThunk(
    name + '/getAllTransactions',
    async () => await API.get(`${routerLinks(name, 'api')}/list-group-account`),
  ),

  getCashAndBankTreeList: createAsyncThunk(
    name + '/getCashAndBankTreeList',
    async () => await API.get(`${routerLinks(name, 'api')}/tree-list-group-account`),
  ),

  // Thống kê tiền ngân hàng theo thời gian
  getAnalyzeCashAndBank: createAsyncThunk(
    name + '/getAnalyzeCashAndBank',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/cash-and-bank-analyze`, params),
  ),
};

export const CashAndBankSlice = createSlice(
  new Slice<CashAndBankModel, EStatusCashAndBank>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.suspendAccount.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusCashAndBank.suspendAccountPending;
      })
      .addCase(action.suspendAccount.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusCashAndBank.suspendAccountFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.suspendAccount.rejected, (state) => {
        state.status = EStatusCashAndBank.suspendAccountRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.reactiveAccount.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusCashAndBank.reactiveAccountPending;
      })
      .addCase(action.reactiveAccount.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusCashAndBank.reactiveAccountFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.reactiveAccount.rejected, (state) => {
        state.status = EStatusCashAndBank.reactiveAccountRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getAllTransactions.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusCashAndBank.getAllTransactionsPending;
      })
      .addCase(action.getAllTransactions.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status = EStatusCashAndBank.getAllTransactionsFulfilled;
        state.transactionsData = action.payload.data;
      })
      .addCase(action.getAllTransactions.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusCashAndBank.getAllTransactionsRejected;
      })

      // Danh sách dạng cây
      .addCase(action.getCashAndBankTreeList.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusCashAndBank.getCashAndBankTreeListPending;
      })
      .addCase(action.getCashAndBankTreeList.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status = EStatusCashAndBank.getCashAndBankTreeListFulfilled;
        state.cashAndBankTreeListData = action.payload.data;
      })
      .addCase(action.getCashAndBankTreeList.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusCashAndBank.getCashAndBankTreeListRejected;
      })

      // Biến động số dư theo thời gian
      .addCase(action.getAnalyzeCashAndBank.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusCashAndBank.getAnalyzeCashAndBankPending;
      })
      .addCase(action.getAnalyzeCashAndBank.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status = EStatusCashAndBank.getAnalyzeCashAndBankFulfilled;
        state.analyzeCashAndBank = action.payload.data;
      })
      .addCase(action.getAnalyzeCashAndBank.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusCashAndBank.getAnalyzeCashAndBankRejected;
      });
  }),
);

export const CashAndBankFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateCashAndBank<CashAndBankModel>),
    set: (values: StateCashAndBank<CashAndBankModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateCashAndBank<CashAndBankModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: CashAndBankModel) => dispatch(action.post({ values })),
    put: (values: CashAndBankModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    suspendAccount: ({ id }: { id: string | any }) => dispatch(action.suspendAccount({ id })),
    reactiveAccount: ({ id }: { id: string | any }) => dispatch(action.reactiveAccount({ id })),
    getAllTransactions: () => dispatch(action.getAllTransactions()),
    getAnalyzeCashAndBank: (params: QueryParams) => dispatch(action.getAnalyzeCashAndBank(params)),
    getCashAndBankTreeList: () => dispatch(action.getCashAndBankTreeList()),
  };
};
interface StateCashAndBank<T> extends State<T, EStatusCashAndBank> {
  isOpenCashAndBankType?: boolean;
  isOpenCashModal?: boolean;
  isOpenBankModal?: boolean;
  isOpenWalletModal?: boolean;
  isOpenInvestmentFundModal?: boolean;
  transactionsData?: any;
  analyzeCashAndBank?: any;
  cashAndBankTreeListData?: any;
}

export class CashAndBankModel extends CommonEntity {
  constructor(
    public id: string | any,
    public paymentTypeCode: string | any,
    public accountTypeCode: string | any,
    public accountTypeIcon?: string,
    public accountNumber?: string | any,
    public bankCode?: string | any,
    public bankName?: string,
    public bankImageUrl?: string,
    public walletCode?: string | any,
    public walletName?: string,
    public walletImageUrl?: string,
    public accountOwner?: string,
    public accountBalance?: number,
    public accountBalanceDate?: string,
    public phoneNumber?: string,
    public statusCode?: string,
  ) {
    super();
  }
}

export class CashAndBankTreeViewModel extends CommonEntity {
  constructor(
    public title?: string | any,
    public code?: string | any,
    public children?: CashAndBankModel | any,
  ) {
    super();
  }
}

export enum EStatusCashAndBank {
  suspendAccountPending = 'suspendAccountPending',
  suspendAccountFulfilled = 'suspendAccountFulfilled',
  suspendAccountRejected = 'suspendAccountRejected',

  reactiveAccountPending = 'reactiveAccountPending',
  reactiveAccountFulfilled = 'reactiveAccountFulfilled',
  reactiveAccountRejected = 'reactiveAccountRejected',

  getAllTransactionsPending = 'getAllTransactionsPending',
  getAllTransactionsFulfilled = 'getAllTransactionsFulfilled',
  getAllTransactionsRejected = 'getAllTransactionsRejected',

  getAnalyzeCashAndBankPending = 'getAnalyzeCashAndBankPending',
  getAnalyzeCashAndBankFulfilled = 'getAnalyzeCashAndBankFulfilled',
  getAnalyzeCashAndBankRejected = 'getAnalyzeCashAndBankRejected',

  getCashAndBankTreeListPending = 'getCashAndBankTreeListPending',
  getCashAndBankTreeListFulfilled = 'getCashAndBankTreeListFulfilled',
  getCashAndBankTreeListRejected = 'getCashAndBankTreeListRejected',
}
