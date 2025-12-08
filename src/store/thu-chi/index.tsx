import { createAsyncThunk, createSlice, isFluxStandardAction } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams, Responses } from '@models';
import { Action, ConstructionModel, ContractModel, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';
import { Dayjs } from 'dayjs';

const name = 'ThuChi';
const action = {
  ...new Action<CashbookTransactionModel, EStatusThuChi>(name),
  getTransactionSummary: createAsyncThunk(
    name + '/getTransactionSummary',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/transaction-summary`, params),
  ),
  cancelVoucherCashbookTransactions: createAsyncThunk(
    name + 'cancelVoucherCashbookTransactions',
    async ({ ids }: { ids: string[] }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/cancel_voucher?${ids.map((id) => `ids=${id}`).join('&')}`);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
  payInvoice: createAsyncThunk(name + 'payInvoice', async (id: string) => {
    const res = await API.put(`${routerLinks(name, 'api')}/payment_invoice?id=${id}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  exportExcelList: createAsyncThunk(name + 'exportExcelList', async (type: TypeExportExcel) => {
    try {
      const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/export-excel-list/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
          'Accept-Language': localStorage.getItem('i18nextLng') || '',
        },
      });

      if (!res.ok) {
        return new Error(res.statusText);
      }

      const blob = await res.blob();

      // Sử dụng biểu thức chính quy để lấy tên file từ Content-Disposition
      const contentDisposition = res.headers.get('Content-Disposition');
      const fileName = decodeURIComponent(
        contentDisposition?.split("filename*=UTF-8''")[1] ?? new Date().toISOString().slice(0, 10),
      );

      // Tải file về máy
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = fileName;
      downloadLink.click();
      window.URL.revokeObjectURL(downloadLink.href);
      customMessage.success({ content: 'Xuất file thành công' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất file';
      customMessage.error({ content: errorMessage });
    }
  }),
  exportExcelListCurrentPage: createAsyncThunk(
    name + 'exportExcelListCurrentPage',
    async ({ type, params }: { type: TypeExportExcel; params: any }) => {
      try {
        // Tạo query string cho các tham số
        const queryString = new URLSearchParams(params).toString();

        const res = await fetch(
          `${linkApi}${routerLinks(name, 'api')}/export-excel-list-current-page/${type}?${queryString}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
              'Accept-Language': localStorage.getItem('i18nextLng') || '',
            },
          },
        );

        if (!res.ok) {
          return new Error(res.statusText);
        }

        const blob = await res.blob();

        // Sử dụng biểu thức chính quy để lấy tên file từ Content-Disposition
        const contentDisposition = res.headers.get('Content-Disposition');
        const fileName = decodeURIComponent(
          contentDisposition?.split("filename*=UTF-8''")[1] ?? new Date().toISOString().slice(0, 10),
        );
        // Tải file về máy
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = fileName;
        downloadLink.click();
        window.URL.revokeObjectURL(downloadLink.href);
        customMessage.success({ content: 'Xuất file thành công' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất file';
        customMessage.error({ content: errorMessage });
      }
    },
  ),
  exportExcelListCurrentPageVoucher: createAsyncThunk(
    name + 'exportExcelListCurrentPageVoucher',
    async ({ params }: { params: any }) => {
      try {
        // Tạo query string cho các tham số
        const queryString = new URLSearchParams(params).toString();

        const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/export-excel-list-vouchers?${queryString}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
            'Accept-Language': localStorage.getItem('i18nextLng') || '',
          },
        });

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        const blob = await res.blob();

        // Sử dụng biểu thức chính quy để lấy tên file từ Content-Disposition
        const contentDisposition = res.headers.get('Content-Disposition');
        const fileName = decodeURIComponent(
          contentDisposition?.split("filename*=UTF-8''")[1] ?? new Date().toISOString().slice(0, 10),
        );
        // Tải file về máy
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = fileName;
        downloadLink.click();
        window.URL.revokeObjectURL(downloadLink.href);
        customMessage.success({ content: 'Xuất file thành công' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất file';
        customMessage.error({ content: errorMessage });
      }
    },
  ),
  getCashFlowReport: createAsyncThunk(name + 'getCashFlowReport', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/cash-flow-report`, params);
  }),
  getDashboardWithNoFilter: createAsyncThunk(name + 'dashboardNoFilter', async (params: AmountParams) => {
    return await API.get(`${routerLinks(name, 'api')}/dashboard-no-filter`,params);
  }),
  getDashboardWithTotal: createAsyncThunk(name + 'dashboardWithTotal', async (params: AmountParams) => {
    return await API.get(`${routerLinks(name, 'api')}/dashboard-total-filter`, params);
  }),
  getReceiptsDashboard: createAsyncThunk(name + 'receiptsDashboard', async (params: ReceiptsExpendituesParams) => {
    params.transactionType = 'THU';
    return await API.get(`${routerLinks(name, 'api')}/receipts-expenditures-dashboard`, params);
  }),
  getExpendituresDashboard: createAsyncThunk(
    name + 'expendituresDashboard',
    async (params: ReceiptsExpendituesParams) => {
      params.transactionType = 'CHI';
      return await API.get(`${routerLinks(name, 'api')}/receipts-expenditures-dashboard`, params);
    },
  ),
  exportCashFlowReportToExcel: createAsyncThunk(
    name + 'exportCashFlowReportToExcel',
    async ({ params }: { params: QueryParams }) => {
      try {
        // Tạo query string cho các tham số
        const queryString = new URLSearchParams({
          page: params.page?.toString() || '1',
          size: params.size?.toString() || '20',
          filter: JSON.stringify(params.filter || {}),
          sort: params.sort?.toString() || '',
        }).toString();
        const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/cash-flow-report/export?${queryString}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
            'Accept-Language': localStorage.getItem('i18nextLng') || '',
          },
        });
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        const blob = await res.blob();
        // Sử dụng biểu thức chính quy để lấy tên file từ Content-Disposition
        const contentDisposition = res.headers.get('Content-Disposition');
        const fileName = decodeURIComponent(
          contentDisposition?.split("filename*=UTF-8''")[1] ?? new Date().toISOString().slice(0, 10),
        );
        // Tải file về máy
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = fileName;
        downloadLink.click();
        window.URL.revokeObjectURL(downloadLink.href);
        console.log('res', res);
        customMessage.success({ content: 'Xuất file thành công' });
      } catch (error) {
        console.log('error', error);
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất file';
        customMessage.error({ content: errorMessage });
      }
    },
  ),
  createMultiple : createAsyncThunk(
    name + 'createMultiple',
    async ({ values }: { values: CashbookTransactionCreateModel }) => {
      const res = await API.post(`${routerLinks(name, 'api')}/create-multiple`, values)
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    }
  )
};
export const thuChiSlice = createSlice(
  new Slice<CashbookTransactionModel, EStatusThuChi>(action, {}, (builder) => {
    builder
      .addCase(action.getTransactionSummary.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.getTransactionSummaryPending;
      })
      .addCase(action.getTransactionSummary.fulfilled, (state: StateThuChi<CashbookTransactionModel>, action: any) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getTransactionSummaryFulfilled;
        state.thongKe = action.payload.data;
      })
      .addCase(action.getTransactionSummary.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getTransactionSummaryRejected;
      })
      .addCase(action.cancelVoucherCashbookTransactions.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.cancelVoucherCashbookTransactionsPending;
      })
      .addCase(action.cancelVoucherCashbookTransactions.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.cancelVoucherCashbookTransactionsFulfilled;
        state.selectedRowKeys = [];
      })
      .addCase(action.cancelVoucherCashbookTransactions.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.cancelVoucherCashbookTransactionsRejected;
      })
      // Export Excel List
      .addCase(action.exportExcelList.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.exportExcelListPending;
      })
      .addCase(action.exportExcelList.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.exportExcelListFulfilled;
      })
      .addCase(action.exportExcelList.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.exportExcelListRejected;
      })
      // Export Excel List Current Page
      .addCase(action.exportExcelListCurrentPage.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.exportExcelListCurrentPagePending;
      })
      .addCase(action.exportExcelListCurrentPage.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.exportExcelListCurrentPageFulfilled;
      })
      .addCase(action.exportExcelListCurrentPage.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.exportExcelListCurrentPageRejected;
      })

      // Xuất excel danh sách sổ quỹ theo query
      .addCase(action.exportExcelListCurrentPageVoucher.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.exportExcelListVoucherPending;
      })
      .addCase(action.exportExcelListCurrentPageVoucher.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.exportExcelListVoucherFulfilled;
      })
      .addCase(action.exportExcelListCurrentPageVoucher.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.exportExcelListVoucherRejected;
      })

      // Báo cáo dòng tiền
      .addCase(action.getCashFlowReport.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.getCashFlowReportPending;
      })
      .addCase(action.getCashFlowReport.fulfilled, (state: StateThuChi<CashbookTransactionModel>, action: any) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getCashFlowReportFulfilled;
        state.data = action.payload.data;
      })
      .addCase(action.getCashFlowReport.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getCashFlowReportRejected;
      })
      //no-filter
      .addCase(action.getDashboardWithNoFilter.pending, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getDashboardWithNoFilterPending;
      })
      .addCase(
        action.getDashboardWithNoFilter.fulfilled,
        (state: StateThuChi<CashbookTransactionModel>, action: any) => {
          state.isLoading = true;
          state.dashboardDataWithNoFilter = action.payload.data.dashboardData;
          state.status = EStatusThuChi.getDashboardWithNoFilterFulfilled;
        },
      )
      .addCase(action.getDashboardWithNoFilter.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getDashboardWithNoFilterRejected;
      })
      //filter
      .addCase(action.getDashboardWithTotal.pending, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getDashboardWithTotalPending;
      })
      .addCase(action.getDashboardWithTotal.fulfilled, (state: StateThuChi<CashbookTransactionModel>, action: any) => {
        state.isLoading = true;
        state.dashboardDataAmount = action.payload.data.dashboardData;
        state.status = EStatusThuChi.getDashboardWithTotalFulfilled;
      })
      .addCase(action.getDashboardWithTotal.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getDashboardWithTotalRejected;
      })
      //next
      .addCase(action.getReceiptsDashboard.pending, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getReceiptsDashboardPending;
      })
      .addCase(action.getReceiptsDashboard.fulfilled, (state: StateThuChi<CashbookTransactionModel>, action: any) => {
        state.isLoading = true;
        console.log(action.payload.data.dashboardData);
        state.receiptsDashboardData = action.payload.data.dashboardData;
        state.status = EStatusThuChi.getReceiptsDashboardFulfilled;
      })
      .addCase(action.getReceiptsDashboard.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getReceiptsDashboardRejected;
      })
      //next
      .addCase(action.getExpendituresDashboard.pending, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getExpendituresDashboardPending;
      })
      .addCase(
        action.getExpendituresDashboard.fulfilled,
        (state: StateThuChi<CashbookTransactionModel>, action: any) => {
          state.isLoading = true;
          state.expendituresDashboardData = action.payload.data.dashboardData;
          state.status = EStatusThuChi.getExpendituresDashboardFulfilled;
        },
      )
      .addCase(action.getExpendituresDashboard.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.getExpendituresDashboardRejected;
      })

      // Thanh toán phiếu thu/chi
      .addCase(action.payInvoice.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.paymentInvoicePending;
      })
      .addCase(action.payInvoice.fulfilled, (state: StateThuChi<CashbookTransactionModel>, action: any) => {
        state.isLoading = false;
        state.status = EStatusThuChi.paymentInvoiceFulfilled;
        state.data = action.payload.data;
      })
      .addCase(action.payInvoice.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.paymentInvoiceRejected;
      })

      .addCase(action.exportCashFlowReportToExcel.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThuChi.exportCashFlowReportToExcelPending;
      })
      .addCase(action.exportCashFlowReportToExcel.fulfilled, (state) => {
        state.status = EStatusThuChi.exportCashFlowReportToExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportCashFlowReportToExcel.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.exportCashFlowReportToExcelRejected;
      })

      // Thêm mới hàng loạt
      .addCase(action.createMultiple.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusThuChi.createMultiplePending;
      })
      .addCase(action.createMultiple.fulfilled, (state: StateThuChi<CashbookTransactionModel>, action: any) => {
        state.status = EStatusThuChi.createMultipleFulfilled;
        state.data = action.payload.data;
        state.isLoading = false;
      })
      .addCase(action.createMultiple.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThuChi.createMultipleRejected;
      });
  }),
);
export const CashbookTransactionFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateThuChi<CashbookTransactionModel>),
    set: (values: StateThuChi<CashbookTransactionModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateThuChi<CashbookTransactionModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: CashbookTransactionModel) => dispatch(action.post({ values })),
    createMultiple: (values: CashbookTransactionCreateModel) => dispatch(action.createMultiple({ values })),
    put: (values: CashbookTransactionModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getTransactionSummary: (params: QueryParams) => dispatch(action.getTransactionSummary(params)),
    cancelVoucherCashbookTransactions: (ids: string[]) => dispatch(action.cancelVoucherCashbookTransactions({ ids })),
    exportExcelList: (type: TypeExportExcel) => dispatch(action.exportExcelList(type)),
    exportExcelListCurrentPage: (type: TypeExportExcel, params: QueryParams) =>
      dispatch(action.exportExcelListCurrentPage({ type, params })),
    exportExcelListCurrentPageVoucher: (params: QueryParams) =>
      dispatch(action.exportExcelListCurrentPageVoucher({ params })),
    getCashFlowReport: (params: QueryParams) => dispatch(action.getCashFlowReport(params)),
    getDashboardWithNoFilter: (params: AmountParams) => dispatch(action.getDashboardWithNoFilter(params)),
    getDashboardWithTotal: (params: AmountParams) => dispatch(action.getDashboardWithTotal(params)),
    getReceiptsDashboard: (params: ReceiptsExpendituesParams) => dispatch(action.getReceiptsDashboard(params)),
    getExpendituresDashboard: (params: ReceiptsExpendituesParams) => dispatch(action.getExpendituresDashboard(params)),
    payInvoice: (id: string) => dispatch(action.payInvoice(id)),
    exportCashFlowReportToExcel: (params: QueryParams) => dispatch(action.exportCashFlowReportToExcel({ params })),
  };
};
interface StateThuChi<T> extends State<T, EStatusThuChi> {
  isEdit?: boolean;
  thongKe?: any;
  khachHang?: string;
  isPhieuChi?: boolean;
  nhaCungCap?: string;
  showDatePicker?: boolean;
  searchCustomer?: string;
  selectedRowKeysReceiptVoucher?: string[];
  activeKey?: string;
  selectedPayerGroupButton?: string;
  selectedCreateOnDateButton?: { fromDate?: string; toDate?: string };
  isFilter?: boolean;
  isFilterVoucher?: boolean;
  isFilterPaymentVoucher?: boolean;
  isPaymentVoucherFilter?: boolean;
  payerGroup?: any;
  searchValue?: string;
  dateRange?: [start: Dayjs | null | undefined, end: Dayjs | null | undefined];
  date?: string[]
  dataCashbookTransaction?: {
    payerGroup?: string;
    id?: string;
  };
  filterCondition?: string
  dateSelectShow?: boolean
  dateRangeCombine?: string[]
  dateRangePayment?: string[]

  // State V2 Receipt Voucher
  placeholderEntityId?: string;
  valueEntityTypeCode?: string;
  isExportFileModalReceiptVoucher?: boolean;
  // State V2 Payment Voucher
  placeholderEntityIdPaymentVC?: string;
  valueEntityTypeCodePaymentVC?: string;
  isExportFileModalPaymentVoucher?: boolean;
  selectedRowKeysPaymentVoucher?: string[];

  // Sổ quỹ
  isExportFileModalVoucher?: boolean;
  dashboardDataWithNoFilter?: any;
  dashboardDataAmount?: any;
  receiptsDashboardData?: any;
  expendituresDashboardData?: any;
}
export class CashbookTransactionModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public entityId?: string,
    public entityCode?: string,
    public entityName?: string,
    public entityTypeCode?: string,
    public entityTypeName?: string,
    public entityUrl?: string,
    public originalDocumentId?: string,
    public originalDocumentType?: string,
    public originalDocumentCode?: string,
    public purposeCode?: string,
    public purposeName?: string,
    public amount?: number,
    public paymentMethodCode?: string,
    public projectId?: string,
    public projectName?: string,
    public paymentMethodName?: string,
    public receiptDate?: string | any,
    public description?: string,
    public reference?: string,
    public typeCode?: number,
    public typeName?: string,
    public subTypeCode?: string,
    public subTypeName?: string,
    public note?: string,
    public isActive?: 'COMPLETED' | 'CANCELED' | 'WAIT_TRANSFER' | any,
    public isDebt?: boolean,
    public transactionTypeCode?: string,
    public contractId?: string,
    public contract?: ContractModel,
    public constructionId?: string,
    public construction?: ConstructionModel,
    public attachments?: any,
    public activityLogs?: any,
    public accountId?: string,
  ) {
    super();
  }
}

export type CashbookTransactionCreateModel =  {
  constructionId?: string
  projectId?: string
  contractId?: string
  accountId?: string
  listCashbookTransaction?: any
}

export enum EStatusThuChi {
  getTransactionSummaryPending = 'getTransactionSummaryPending',
  getTransactionSummaryFulfilled = 'getTransactionSummaryFulfilled',
  getTransactionSummaryRejected = 'getTransactionSummaryRejected',
  cancelVoucherCashbookTransactionsPending = 'deleteVoucherCashbookTransactionsPending',
  cancelVoucherCashbookTransactionsFulfilled = 'deleteCashbookTransactionsFulfilled',
  cancelVoucherCashbookTransactionsRejected = 'deleteVoucherCashbookTransactionsRejected',
  // Export Excel List
  exportExcelListPending = 'exportExcelListPending',
  exportExcelListFulfilled = 'exportExcelListFulfilled',
  exportExcelListRejected = 'exportExcelListRejected',

  // Create multiple cashbookTransaction

  createMultiplePending = 'createMultiplePending',
  createMultipleFulfilled = 'createMultipleFulfilled',
  createMultipleRejected = 'createMultipleRejected',

  // Export Excel List Current Page
  exportExcelListCurrentPagePending = 'exportExcelListCurrentPagePending',
  exportExcelListCurrentPageFulfilled = 'exportExcelListCurrentPageFulfilled',
  exportExcelListCurrentPageRejected = 'exportExcelListCurrentPageRejected',

  // Xuất excel danh sách sổ quỹ theo query
  exportExcelListVoucherPending = 'exportExcelListVoucherPending',
  exportExcelListVoucherFulfilled = 'exportExcelListVoucherFulfilled',
  exportExcelListVoucherRejected = 'exportExcelListVoucherRejected',

  // Báo cáo dòng tiền
  getCashFlowReportPending = 'getCashFlowReportPending',
  getCashFlowReportFulfilled = 'getCashFlowReportFulfilled',
  getCashFlowReportRejected = 'getCashFlowReportRejected',

  // Thanh toán phiếu thu/chi
  paymentInvoicePending = 'paymentInvoicePending',
  paymentInvoiceFulfilled = 'paymentInvoiceFulfilled',
  paymentInvoiceRejected = 'paymentInvoiceRejected',

  // Dashboard
  getDashboardWithNoFilterPending = 'getDashboardWithNoFilterPending',
  getDashboardWithNoFilterFulfilled = 'getDashboardWithNoFilterFulfilled',
  getDashboardWithNoFilterRejected = 'getDashboardWithNoFilterRejected',

  getDashboardWithTotalPending = 'getDashboardWithTotalPending',
  getDashboardWithTotalFulfilled = 'getDashboardWithTotalFulfilled',
  getDashboardWithTotalRejected = 'getDashboardWithTotalRejected',

  getReceiptsDashboardPending = 'getReceiptsDashboardPending',
  getReceiptsDashboardFulfilled = 'getReceiptsDashboardFulfilled',
  getReceiptsDashboardRejected = 'getReceiptsDashboardRejected',

  getExpendituresDashboardPending = 'getExpendituresDashboardPending',
  getExpendituresDashboardFulfilled = 'getExpendituresDashboardFulfilled',
  getExpendituresDashboardRejected = 'getExpendituresDashboardRejected',

  exportCashFlowReportToExcelPending = 'exportCashFlowReportToExcelPending',
  exportCashFlowReportToExcelFulfilled = 'exportCashFlowReportToExcelFulfilled',
  exportCashFlowReportToExcelRejected = 'exportCashFlowReportToExcelRejected',
}
export type CashBookTransactionFormFilter = {
  projectId?: string | any;
  listPaymentMethodCode?: string[];
  listPurposeCode?: string[];
  listReceiptCode?: string[];
  dateRange?: string[];
  isActive?: string;
  entityTypeCodes?: string[];
  FullTextSearch?: string;
  transactionTypeCode?: string;
  activeTab?: string;
};

export type TypeExportExcel = 'THU' | 'CHI';

export type CashFlowReportModel = {
  openingCashBalance: CashFlowReportItem;
  receiptVouchers: ReceiptVouchersModel;
  paymentVouchers: PaymentVouchersModel;
};

export type CashFlowReportItem = {
  title: string;
  startAmount: number | null;
  januaryAmount: number;
  februaryAmount: number;
  marchAmount: number;
  aprilAmount: number;
  mayAmount: number;
  juneAmount: number;
  julyAmount: number;
  augustAmount: number;
  septemberAmount: number;
  octoberAmount: number;
  novemberAmount: number;
  decemberAmount: number;
  totalAmount: number;
};

export type ReceiptVouchersModel = {
  items: CashFlowReportItem[];
  receiptTotalAmount: CashFlowReportItem;
  totalCashBalance: CashFlowReportItem;
};

export type PaymentVouchersModel = {
  items: CashFlowReportItem[];
  paymentTotalAmount: CashFlowReportItem;
  totalCashBalance: CashFlowReportItem;
};

export type ReceiptsExpendituesParams = {
  filter?: string
  transactionType?: TypeExportExcel;
  dateRange?: string[];
  dateType?: string;
};
export type AmountParams = {
  filter?: string;
};
