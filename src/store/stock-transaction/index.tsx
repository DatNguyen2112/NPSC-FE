import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';

import { CommonEntity, Pagination, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'StockTransaction';
const action = {
  ...new Action<StockTransactionModel, EStatusStockTransaction>(name),
  getHistoryOfEachWareHouse: createAsyncThunk(name + 'getHistoryOfEachWareHouse', async (params: QueryParams) => {
    const res = await API.get(`${routerLinks(name, 'api')}/stock-history`, params);
    return res.data;
  }),
  getByWareCode: createAsyncThunk(name + 'getByWareCode', async (wareCode: string) => {
    const res = await API.get(`${routerLinks(name, 'api')}/get-by-ware-code/${wareCode}`, wareCode);
    return res.data;
  }),
  exportListToExcel: createAsyncThunk(name + 'exportListToExcel', async ({ params }: { params: any }) => {
    try {
      // Tạo query string cho các tham số
      const queryString = new URLSearchParams(params).toString();

      const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/export-list-to-excel?${queryString}`, {
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
  }),
};

export const stockTransactionSlice = createSlice(
  new Slice<StockTransactionModel, EStatusStockTransaction>(action, {}, (builder) => {
    builder
      .addCase(action.getByWareCode.pending, (state) => {
        state.status = EStatusStockTransaction.getByWareCodePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.getByWareCode.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.stockByWareCode = action.payload as Draft<Pagination<T_StockTransactionFilterFields>>;
        }
        state.status = EStatusStockTransaction.getByWareCodeFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getByWareCode.rejected, (state: StateStockTransaction<StockTransactionModel>) => {
        state.status = EStatusStockTransaction.getByWareCodeRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getHistoryOfEachWareHouse.pending, (state) => {
        state.status = EStatusStockTransaction.getHistoryOfEachWareHousePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.getHistoryOfEachWareHouse.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.stockHistory = action.payload as Draft<Pagination<T_StockTransactionFilterFields>>;
        }
        state.status = EStatusStockTransaction.getHistoryOfEachWareHouseFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getHistoryOfEachWareHouse.rejected, (state: StateStockTransaction<StockTransactionModel>) => {
        state.status = EStatusStockTransaction.getHistoryOfEachWareHouseRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.pending, (state) => {
        state.status = EStatusStockTransaction.exportExcelPending;
        state.isLoading = true;
      })
      .addCase(action.exportListToExcel.fulfilled, (state) => {
        state.status = EStatusStockTransaction.exportExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.rejected, (state) => {
        state.status = EStatusStockTransaction.exportExcelRejected;
        state.isLoading = false;
      });
  }),
);

export const StockTransactionFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateStockTransaction<StockTransactionModel>),
    set: (values: StateStockTransaction<StockTransactionModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: any;
      keyState?: keyof StateStockTransaction<StockTransactionModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: StockTransactionModel) => dispatch(action.post({ values })),
    put: (values: StockTransactionModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getStockHistoryOfEachWareHouse: (params: QueryParams) => dispatch(action.getHistoryOfEachWareHouse(params)),
    getByWareCode: (wareCode: string) => dispatch(action.getByWareCode(wareCode)),
    exportListToExcel: (params: QueryParams) => dispatch(action.exportListToExcel({ params })),
  };
};
interface StateStockTransaction<T> extends State<T, EStatusStockTransaction> {
  isEdit?: boolean;
  stockHistory?: any;
  stockByWareCode?: any;
  isExportFileModal?: boolean;
}

export enum EStatusStockTransaction {
  getHistoryOfEachWareHouseFulfilled = 'getHistoryOfEachWareHouseFulfilled',
  getHistoryOfEachWareHousePending = 'getHistoryOfEachWareHousePending',
  getHistoryOfEachWareHouseRejected = 'getHistoryOfEachWareHouseRejected',
  getByWareCodePending = 'getByWareCodePending',
  getByWareCodeFulfilled = 'getByWareCodeFulfilled',
  getByWareCodeRejected = 'getByWareCodeRejected',

  //Export excel
  exportExcelPending = 'exportExcelPending',
  exportExcelFulfilled = 'exportExcelFulfilled',
  exportExcelRejected = 'exportExcelRejected',
}

export class StockTransactionModel extends CommonEntity {
  constructor(
    public id: string,
    public productCode?: string,
    public ghiChu?: string,
    public productName?: string,
    public productId?: string,
    public unit?: string,
    public exportInventoryQuantity?: number,
    public stockTransactionQuantity?: number | any,
    public sellableQuantity?: number | any,
    public stockTransactionAmount?: any,
    public exportInventoryAmount?: number,
    public receiptInventoryAmount?: number,
    public receiptInventoryQuantity?: number,
    public totalClosingImportAmount?: number,
    public totalClosingImportQuantity?: number,
    public openingInventoryQuantity?: number,
    public openingInventoryAmount?: number,
    public endingInventoryReceivedAmount?: number,
    public endingInventoryReceivedQuantity?: number,
    public openingInventoryIssuedQuantity?: number,
    public openingInventoryIssuedAmount?: number,
  ) {
    super();
  }
}

export type T_StockTransactionFilterFields = {
  dateRange: string[];
  FullTextSearch?: string;
  waresCode?: string[];
  productIds?: string[];
  type?: string;
};
