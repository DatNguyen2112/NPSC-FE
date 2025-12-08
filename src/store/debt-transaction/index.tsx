import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, Pagination, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';

const name = 'DebtTransaction';
const action = {
  ...new Action<DebtTransactionModel, EStatusDebtTransaction>(name),
  getReport: createAsyncThunk(name + 'getReport', async (params: QueryParams) => {
    const res = await API.get<DebtTransactionReport[]>(`${routerLinks(name, 'api')}/report`, params);
    return res;
  }),
};
export const debtTransactionSlice = createSlice(
  new Slice<DebtTransactionModel, EStatusDebtTransaction>(action, {}, (builder) => {
    builder
      .addCase(action.getReport.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusDebtTransaction.getReportPending;
      })
      .addCase(action.getReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusDebtTransaction.getReportFulfilled;
        state.debtList = action.payload?.data;
      })
      .addCase(action.getReport.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusDebtTransaction.getReportRejected;
      });
  }),
);
export const DebtTransactionFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateDebtTransaction<DebtTransactionModel>),
    set: (values: StateDebtTransaction<DebtTransactionModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: any;
      keyState?: keyof StateDebtTransaction<DebtTransactionModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: DebtTransactionModel) => dispatch(action.post({ values })),
    getReport: (params: QueryParams) => dispatch(action.getReport(params)),
  };
};
interface StateDebtTransaction<T> extends State<T, EStatusDebtTransaction> {
  debtList?: Pagination<DebtTransactionReport>;
  // state của báo cáo công nợ khách hàng
  isDebtReportModalGlossaryCustomerVisible?: boolean;
  isDebtReportModalPositiveCustomerVisible?: boolean;
  isDebtReportModalNegativeCustomerVisible?: boolean;
  customerId?: string;

  // state của báo cáo công nợ nhà cung cấp
  isDebtReportModalGlossarySupplierVisible?: boolean;
  isDebtReportModalPositiveSupplierVisible?: boolean;
  isDebtReportModalNegativeSupplierVisible?: boolean;
  supplierId?: string;
}
export class DebtTransactionModel extends CommonEntity {
  constructor(
    public id?: string,
    public entityId?: string,
    public entityCode?: string,
    public entityType?: string,
    public entityName?: string,
    public originalDocumentId?: string,
    public originalDocumentCode?: string,
    public originalDocumentType?: OriginalDocumentType,
    public changeAmount?: number,
    public debtAmount?: number,
    public action?: string,
    public note?: string,
  ) {
    super();
  }
}

export type DebtTransactionReport = {
  entityId: string;
  entityCode: string;
  entityType: string;
  entityName: string;
  openingDebt: number;
  debtIncrease: number;
  debtDecrease: number;
  debtRemain: number;
  closingDebt: number;
};

type OriginalDocumentType =
  | 'receipt_voucher'
  | 'payment_voucher'
  | 'sales_order'
  | 'purchase_order'
  | 'customer_return'
  | 'supplier_return';

export type DebtReportFilter = {
  entityType?: 'customer' | 'supplier';
  dateRange?: string[];
  minClosingDebt?: number;
  maxClosingDebt?: number;
  positive?: boolean;
  fullTextSearch?: string;
};

export enum EStatusDebtTransaction {
  getReportPending = 'getReportPending',
  getReportFulfilled = 'getReportFulfilled',
  getReportRejected = 'getReportRejected',
}
