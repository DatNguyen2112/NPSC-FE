import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import {
  Action,
  ConstructionModel,
  ContractModel,
  ProductModel,
  Slice,
  State,
  useAppDispatch,
  useTypedSelector,
} from '@store';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'InventoryNote';
const action = {
  ...new Action<InventoryNoteModel, EStatusInventoryNote>(name),
  // deleteMultiple: createAsyncThunk(name + 'deleteMultiple', async ({ ids }: { ids: string[] }) => {
  //   const res = await API.delete(`${routerLinks(name, 'api')}?${ids.map((id) => `ids=${id}`).join('&')}`);
  //   if (res.message) customMessage.success({ type: 'success', content: res.message });
  //   return res;
  // }),
  cancelMultiple: createAsyncThunk(name + 'cancelMultiple', async ({ ids }: { ids: string[] }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/cancel-multiple?${ids.map((id) => `ids=${id}`).join('&')}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  inventoryTransaction: createAsyncThunk(name + 'inventoryTransaction', async ({ ids }: { ids: string[] }) => {
    const res = await API.put(
      `${routerLinks(name, 'api')}/inventory-transaction?${ids.map((id) => `ids=${id}`).join('&')}`,
    );
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  exportExcelList: createAsyncThunk(name + 'exportExcelList', async (type: TypeExportExcelInventoryNote) => {
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
        throw new Error(res.statusText);
      }

      const blob = await res.blob();

      // Sử dụng biểu thức chính quy để lấy tên file từ Content-Disposition
      const contentDisposition = res.headers.get('Content-Disposition');
      let fileName = 'Exported_File.xlsx'; // Tên mặc định

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?['"]?([^;'\n]*)['"]?/i);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

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
    async ({ type, params }: { type: TypeExportExcelInventoryNote; params: QueryParams }) => {
      try {
        // Tạo query string cho các tham số
        const queryString = new URLSearchParams({
          page: params.page?.toString() || '1',
          size: params.size?.toString() || '20',
          filter: JSON.stringify(params.filter || {}),
          sort: params.sort?.toString() || '',
        }).toString();

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
          throw new Error(res.statusText);
        }

        const blob = await res.blob();

        // Sử dụng biểu thức chính quy để lấy tên file từ Content-Disposition
        const contentDisposition = res.headers.get('Content-Disposition');
        let fileName = 'Exported_File.xlsx'; // Tên mặc định

        if (contentDisposition) {
          const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?['"]?([^;'\n]*)['"]?/i);
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1]);
          }
        }

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
};
export const inventoryNoteSlice = createSlice(
  new Slice<InventoryNoteModel, EStatusInventoryNote>(action, {}, (builder) => {
    builder
      // Delete Multiple Inventory Note Items
      // .addCase(action.deleteMultiple.pending, (state) => {
      //   state.isLoading = true;
      //   state.status = EStatusInventoryNote.deleteMultiplePending;
      // })
      // .addCase(action.deleteMultiple.fulfilled, (state) => {
      //   state.isLoading = false;
      //   state.status = EStatusInventoryNote.deleteMultipleFulfilled;
      //   state.selectedRowKeys = [];
      // })
      // .addCase(action.deleteMultiple.rejected, (state) => {
      //   state.isLoading = false;
      //   state.status = EStatusInventoryNote.deleteMultipleRejected;
      // })
      // Cancel multiple Inventory Note Items
      .addCase(action.cancelMultiple.pending, (state) => {
        state.isLoading = true;
        state.isFormLoading = true;
        state.status = EStatusInventoryNote.cancelMultiplePending;
      })
      .addCase(action.cancelMultiple.fulfilled, (state) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.status = EStatusInventoryNote.cancelMultipleFulfilled;
        state.selectedRowKeys = [];
      })
      .addCase(action.cancelMultiple.rejected, (state) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.status = EStatusInventoryNote.cancelMultipleRejected;
      })
      // Import/Export Inventory Note Items
      .addCase(action.inventoryTransaction.pending, (state) => {
        state.isLoading = true;
        state.isFormLoading = true;
        state.status = EStatusInventoryNote.inventoryTransactionPending;
      })
      .addCase(action.inventoryTransaction.fulfilled, (state) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.status = EStatusInventoryNote.inventoryTransactionFulfilled;
        state.selectedRowKeys = [];
      })
      .addCase(action.inventoryTransaction.rejected, (state) => {
        state.isLoading = false;
        state.isFormLoading = false;
        state.status = EStatusInventoryNote.inventoryTransactionRejected;
      })
      // Export Excel List
      .addCase(action.exportExcelList.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusInventoryNote.exportExcelListPending;
      })
      .addCase(action.exportExcelList.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusInventoryNote.exportExcelListFulfilled;
      })
      .addCase(action.exportExcelList.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusInventoryNote.exportExcelListRejected;
      })
      // Export Excel List Current Page
      .addCase(action.exportExcelListCurrentPage.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusInventoryNote.exportExcelListCurrentPagePending;
      })
      .addCase(action.exportExcelListCurrentPage.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusInventoryNote.exportExcelListCurrentPageFulfilled;
      })
      .addCase(action.exportExcelListCurrentPage.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusInventoryNote.exportExcelListCurrentPageRejected;
      });
  }),
);
export const InventoryNoteFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateInventoryNote<InventoryNoteModel>),
    set: (values: StateInventoryNote<InventoryNoteModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateInventoryNote<InventoryNoteModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: InventoryNoteModel) => dispatch(action.post({ values })),
    put: (values: InventoryNoteModel) => dispatch(action.put({ values })),
    // deleteMultiple: (ids: string[]) => dispatch(action.deleteMultiple({ ids })),
    cancelMultiple: (ids: string[]) => dispatch(action.cancelMultiple({ ids })),
    inventoryTransaction: (ids: string[]) => dispatch(action.inventoryTransaction({ ids })),
    exportExcelList: (type: TypeExportExcelInventoryNote) => dispatch(action.exportExcelList(type)),
    exportExcelListCurrentPage: (type: TypeExportExcelInventoryNote, params: QueryParams) =>
      dispatch(action.exportExcelListCurrentPage({ type, params })),
  };
};
interface StateInventoryNote<T> extends State<T, EStatusInventoryNote> {
  // Inventory Import
  activeKeyInventoryReceipt?: string;
  searchValueInventoryReceipt?: string;
  isFilterInventoryReceipt?: boolean;
  selectedRowKeysInventoryReceipt?: string[];
  valueEntityTypeCodeInventoryReceipt?: string;
  placeholderEntityIdInventoryReceipt?: string;
  isProductManyModalInventoryReceipt?: boolean;
  isProductModalInventoryReceipt?: boolean;
  detailItemProductInventoryReceipt?: ProductModel[];
  isExportFileModalInventoryImport?: boolean;
  // Inventory Export
  activeKeyInventoryIssue?: string;
  searchValueInventoryIssue?: string;
  isFilterInventoryExport?: boolean;
  selectedRowKeysInventoryIssue?: string[];
  valueEntityTypeCodeInventoryIssue?: string;
  placeholderEntityIdInventoryIssue?: string;
  isProductManyModalInventoryIssue?: boolean;
  isProductModalInventoryIssue?: boolean;
  detailItemProductInventoryIssue?: ProductModel[];
  isExportFileModalInventoryExport?: boolean;
}
export class InventoryNoteModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public entityId?: string,
    public entityCode?: string,
    public entityName?: string,
    public entityTypeCode?: string,
    public entityTypeName?: string,
    public originalDocumentId?: string,
    public originalDocumentType?: string,
    public originalDocumentCode?: string,
    public transactionTypeCode?: string,
    public transactionTypeName?: string,
    public transactionDate?: string,
    public inventoryCode?: string,
    public inventoryName?: string,
    public projectId?: string,
    public projectName?: string,
    public note?: string,
    public typeCode?: string,
    public statusCode?: string,
    public statusName?: string,
    public totalQuantity?: number,
    public inventoryNoteItems?: InventoryNoteItems[],
    public contractId?: string,
    public contract?: ContractModel,
    public constructionId?: string,
    public construction?: ConstructionModel,
    public materialRequestId?: string | null,
  ) {
    super();
  }
}

export enum EStatusInventoryNote {
  // Delete Multiple Inventory Note Items
  // deleteMultiplePending = 'deleteMultiplePending',
  // deleteMultipleFulfilled = 'deleteMultipleFulfilled',
  // deleteMultipleRejected = 'deleteMultipleRejected',
  // Cancel multiple Inventory Note Items
  cancelMultiplePending = 'cancelMultiplePending',
  cancelMultipleFulfilled = 'cancelMultipleFulfilled',
  cancelMultipleRejected = 'cancelMultipleRejected',
  // Import/Export Inventory Note Items
  inventoryTransactionPending = 'inventoryTransactionPending',
  inventoryTransactionFulfilled = 'inventoryTransactionFulfilled',
  inventoryTransactionRejected = 'inventoryTransactionRejected',
  // Export Excel List
  exportExcelListPending = 'exportExcelListPending',
  exportExcelListFulfilled = 'exportExcelListFulfilled',
  exportExcelListRejected = 'exportExcelListRejected',
  // Export Excel List Current Page
  exportExcelListCurrentPagePending = 'exportExcelListCurrentPagePending',
  exportExcelListCurrentPageFulfilled = 'exportExcelListCurrentPageFulfilled',
  exportExcelListCurrentPageRejected = 'exportExcelListCurrentPageRejected',
}

export type InventoryNoteFilter = {
  statusCode?: string;
  typeCode?: string;
  dateRange?: string[];
  entityTypeCodes?: string[];
  fullTextSearch?: string;
};

export type InventoryNoteItems = {
  id?: string;
  lineNumber?: number;
  productId?: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  quantity?: number | null;
  note?: string;
};

export type TypeExportExcelInventoryNote = 'inventory_import' | 'inventory_export';
