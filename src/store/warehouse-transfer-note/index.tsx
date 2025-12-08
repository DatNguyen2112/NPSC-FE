import { CommonEntity, EStatusState, QueryParams } from '@models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'WarehouseTransferNote';

const action = {
  ...new Action<WarehouseTransferNoteModel, EStatusWarehouseTransferNote>(name),
  cancelMultiple: createAsyncThunk(name + 'cancelMultiple', async ({ ids }: { ids: string[] }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/cancel-multiple?${ids.map((id) => `ids=${id}`).join('&')}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  transferWarehouse: createAsyncThunk(name + 'transferWarehouse', async (params: QueryParams) => {
    const res = await API.put(`${routerLinks(name, 'api')}/transfer-warehouse/${params.id}`, params);
    if (res.message) await customMessage.success({ type: 'success', content: res.message });
    return res.data;
  }),
  postImportExcel: createAsyncThunk(name + '/postImportExcel', async ({ path }: { path: string }) => {
    const res = await API.post(`${routerLinks(name, 'api')}/excel/import?path=${path}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  postExportExcel: createAsyncThunk(name + '/postExportExcel', async ({ id, path }: { id: string; path: string }) => {
    const res = await fetch(linkApi + `/kiem-kho/excel/export/${id}?path=${path}`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
        'Accept-Language': localStorage.getItem('i18nextLng') || '',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
    if (res.status == 200) {
      const blob = await res.blob();
      const name = res.headers.get('Content-Disposition');
      const fileName = decodeURIComponent(
        res.headers.get('Content-Disposition')?.split("filename*=UTF-8''")[1] ?? new Date().toISOString().slice(0, 10),
      );

      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = fileName;
      downloadLink.click();
      window.URL.revokeObjectURL(downloadLink.href);
    } else {
      await customMessage.error({ content: res.statusText });
    }
  }),
  exportListToExcel: createAsyncThunk(name + 'exportListToExcel', async ({ params }: { params: QueryParams }) => {
    try {
      // Tạo query string cho các tham số
      const queryString = new URLSearchParams({
        page: params.page?.toString() || '1',
        size: params.size?.toString() || '20',
        filter: JSON.stringify(params.filter || {}),
        sort: params.sort?.toString() || '',
      }).toString();

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
export const warehouseTransferNoteSlice = createSlice(
  new Slice<WarehouseTransferNoteModel, EStatusWarehouseTransferNote>(action, {}, (builder) => {
    builder
      .addCase(action.cancelMultiple.pending, (state) => {
        state.isLoading = true;
        state.isFormLoading = true;
        state.status = EStatusWarehouseTransferNote.cancelMultiplePending;
      })
      .addCase(action.cancelMultiple.fulfilled, (state) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.status = EStatusWarehouseTransferNote.cancelMultipleFulfilled;
        state.selectedRowKeys = [];
      })
      .addCase(action.cancelMultiple.rejected, (state) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.status = EStatusWarehouseTransferNote.cancelMultipleRejected;
      })
      .addCase(action.postImportExcel.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusWarehouseTransferNote.postImportExcelPending;
      })
      .addCase(
        action.postImportExcel.fulfilled,
        (state: StateWarehouseTransferNote<WarehouseTransferNoteModel>, action: any) => {
          state.status = EStatusWarehouseTransferNote.postImportExcelFulfilled;
          state.importExcel = action.payload.data;
          state.isFormLoading = false;
        },
      )
      .addCase(action.postImportExcel.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusWarehouseTransferNote.postImportExcelRejected;
      })
      .addCase(action.transferWarehouse.pending, (state) => {
        state.status = EStatusWarehouseTransferNote.transferWarehousePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.transferWarehouse.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusWarehouseTransferNote.transferWarehouseFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.transferWarehouse.rejected, (state) => {
        state.status = EStatusWarehouseTransferNote.transferWarehouseRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.postExportExcel.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusWarehouseTransferNote.postExportExcelPending;
      })
      .addCase(
        action.postExportExcel.fulfilled,
        (state: StateWarehouseTransferNote<WarehouseTransferNoteModel>, action: any) => {
          state.status = EStatusWarehouseTransferNote.postExportExcelFulfilled;
          state.isFormLoading = false;
        },
      )
      .addCase(action.postExportExcel.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusWarehouseTransferNote.postExportExcelRejected;
      })
      .addCase(action.exportListToExcel.pending, (state) => {
        state.status = EStatusWarehouseTransferNote.exportExcelPending;
        state.isLoading = true;
      })
      .addCase(action.exportListToExcel.fulfilled, (state) => {
        state.status = EStatusWarehouseTransferNote.exportExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.rejected, (state) => {
        state.status = EStatusWarehouseTransferNote.exportExcelRejected;
        state.isLoading = false;
      });
  }),
);
export const WarehouseTransferNoteFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateWarehouseTransferNote<WarehouseTransferNoteModel>),
    set: (values: StateWarehouseTransferNote<WarehouseTransferNoteModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isABC',
    }: {
      id: any;
      keyState?: keyof StateWarehouseTransferNote<WarehouseTransferNoteModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: WarehouseTransferNoteModel) => dispatch(action.post({ values })),
    put: (values: WarehouseTransferNoteModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    cancelMultiple: (ids: string[]) => dispatch(action.cancelMultiple({ ids })),
    postImportExcel: (path: string) => dispatch(action.postImportExcel({ path })),
    postExportExcel: (id: string, path: string) => dispatch(action.postExportExcel({ id, path })),
    transferWarehouse: (params: QueryParams) => dispatch(action.transferWarehouse(params)),
    exportListToExcel: (params: QueryParams) => dispatch(action.exportListToExcel({ params })),
  };
};
interface StateWarehouseTransferNote<T> extends State<T, EStatusWarehouseTransferNote> {
  orderCode?: boolean;
  selectedRowKeysInventoryReceipt?: string[];
  activeKeyInventoryReceipt?: string;
  isEdit?: boolean;
  isDetail?: boolean;
  selectedRowKeys?: string[];
  // importExcel?: VatTuTonKhoModel[];
  path?: string;
  pathExport?: string;
  isExportFileModal?: boolean;
}

export class WarehouseTransferNoteModel extends CommonEntity {
  constructor(
    public id: string,
    public transferNoteCode: string,
    public exportWarehouseCode: string,
    public importWarehouseCode: string,
    public transferredOnDate: string,
    public transferredByUserName: string,
    public note: string,
    public items: ItemsModel,
    public statusCode: string,
  ) {
    super();
  }
}

export type ItemsModel = {
  productCode?: string;
  productName?: string;
  unit?: string;
  lineNo?: number;
  quantity?: number;
  productId?: string;
  lineNote?: string;
  id?: string;
};

export type T_WarehouseTransferNoteFilterFields = {
  fullTextSearch?: string;
};

export type T_WarehouseTransferNoteFilter = {
  page?: number;
  size?: number;
  sort?: string;
  order?: string;
  filter: T_WarehouseTransferNoteFilterFields;
};

export enum EStatusWarehouseTransferNote {
  postImportExcelPending = 'postImportExcelPending',
  postImportExcelFulfilled = 'postImportExcelFulfilled',
  postImportExcelRejected = 'postImportExcelRejected',
  postExportExcelPending = 'postExportExcelPending',
  postExportExcelFulfilled = 'postExportExcelFulfilled',
  postExportExcelRejected = 'postExportExcelRejected',

  // Cancel multiple Transfer Warehouse Note Items
  cancelMultiplePending = 'cancelMultiplePending',
  cancelMultipleFulfilled = 'cancelMultipleFulfilled',
  cancelMultipleRejected = 'cancelMultipleRejected',

  //Transfer warehouse
  transferWarehousePending = 'transferWarehousePending',
  transferWarehouseFulfilled = 'transferWarehouseFulfilled',
  transferWarehouseRejected = 'transferWarehouseRejected',

  //Export Excel
  exportExcelPending = 'exportExcelPending',
  exportExcelFulfilled = 'exportExcelFulfilled',
  exportExcelRejected = 'exportExcelRejected',
}
