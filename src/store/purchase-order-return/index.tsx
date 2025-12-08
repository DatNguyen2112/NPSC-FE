import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';

import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { CommonEntity, EStatusState, Pagination, QueryParams } from '@models';
import { customMessage } from 'src';
import { API, keyToken, linkApi, routerLinks } from '@utils';

const name = 'PurchaseOrderReturn';
const action = {
  ...new Action<PurchaseOrderReturnModel, EStatusPurchaseOrderReturn>(name),
  cancelledReturnOrder: createAsyncThunk(name + 'cancelledReturnOrder', async (params: QueryParams) => {
    const res = await API.put(`${routerLinks(name, 'api')}/cancelled-return-order/${params.id}`, params);
    if (res.message) await customMessage.success({ type: 'success', content: res.message });
    return res.data;
  }),
  supplierReturnInventory: createAsyncThunk(name + 'supplierReturnInventory', async (params: QueryParams) => {
    const res = await API.put(`${routerLinks(name, 'api')}/supplier-return-inventory/${params.id}`, params);
    if (res.message) await customMessage.success({ type: 'success', content: res.message });
    return res.data;
  }),
  refundPaymentOrder: createAsyncThunk(
    name + 'refundPaymentOrder',
    async ({ values, id }: { values: PurchaseOrderReturnModel; id: string }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/refund/${id}`, values);
      if (res) return customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
  // putStatus: createAsyncThunk(name + 'putStatus', async ({ values }: { values: QuanLyPhieuModel }) => {
  //   const { data, message } = await API.put(`${routerLinks(name, 'api')}/${values.id}/status`, values);
  //   if (message) await customMessage.success({ type: 'success', content: message });
  //   return data;
  // }),
  // importExcel: createAsyncThunk(
  //   name + 'importExcel',
  //   async ({ values }: { values: { path: string; typePhieu: string } }) => {
  //     const responses = await API.post(
  //       `${routerLinks(name, 'api')}/import-excel?path=${values.path}&typePhieu=${values.typePhieu}`,
  //     );

  //     if (responses.isSuccess) {
  //       if (responses.message) await customMessage.success({ type: 'success', content: responses.message });
  //     } else await customMessage.error({ type: 'error', content: responses.message });

  //     return responses.data;
  //   },
  // ),
  getSearchSample: createAsyncThunk('' + 'searchSample', async (params: QueryParams) => {
    return await API.get(`http://mk.geneat.pro/api/v1/search-sample`, params);
  }),
  createSearchSample: createAsyncThunk('' + 'createSearchSample', async ({ values }: { values: SearchSample2 }) => {
    const responses = await API.post(`http://mk.geneat.pro/api/v1/search-sample`, values);

    if (responses.isSuccess) {
      if (responses.message) await customMessage.success({ type: 'success', content: responses.message });
    } else await customMessage.error({ type: 'error', content: responses.message });

    return responses;
  }),
  updateSearchSample: createAsyncThunk(
    '' + 'updateSearchSample',
    async ({ values, id }: { values: { title: string; queryJsonString: string }; id: string }) => {
      const responses = await API.put(`http://mk.geneat.pro/api/v1/search-sample/${id}`, values);

      if (responses.isSuccess) {
        if (responses.message) await customMessage.success({ type: 'success', content: responses.message });
      } else await customMessage.error({ type: 'error', content: responses.message });

      return responses.data;
    },
  ),
  chargePaymentOrder: createAsyncThunk(
    name + 'chargePaymentOrder',
    async ({ values, id }: { values: PurchaseOrderReturnModel; id: string }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/payment/${id}`, values);
      if (res) return customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
  deleteSearchSample: createAsyncThunk('' + 'deleteSearchSample', async ({ id }: { id: string }) => {
    const responses = await API.delete(`http://mk.geneat.pro/api/v1/search-sample/${id}`);

    if (responses.isSuccess) {
      if (responses.message) await customMessage.success({ type: 'success', content: responses.message });
    } else await customMessage.error({ type: 'error', content: responses.message });

    return responses.data;
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

export const PurchaseOrderReturnSlice = createSlice(
  new Slice<PurchaseOrderReturnModel, EStatusPurchaseOrderReturn>(action, {}, (builder) => {
    builder
      // .addCase(action.putStatus.pending, (state, _action) => {
      //   state.isFormLoading = true;
      //   state.status = EStatusQuanLyPhieu.putStatusPending;
      //   state.isLoading = true;
      // })
      // .addCase(action.putStatus.fulfilled, (state, action) => {
      //   if (action.payload) {
      //     state.status = EStatusQuanLyPhieu.putStatusFulfilled;
      //   } else state.status = EStatusState.idle;
      //   state.isFormLoading = false;
      //   state.isLoading = false;
      // })
      // .addCase(action.putStatus.rejected, (state) => {
      //   state.status = EStatusQuanLyPhieu.putStatusRejected;
      //   state.isFormLoading = false;
      //   state.isLoading = false;
      // })
      // .addCase(action.importExcel.pending, (state) => {
      //   state.status = EStatusQuanLyPhieu.importExcelPending;
      //   state.isFormLoading = false;
      //   state.isLoading = true;
      // })
      // .addCase(action.importExcel.fulfilled, (state, action) => {
      //   if (action.payload) {
      //     state.status = EStatusQuanLyPhieu.importExcelFulfilled;
      //   } else state.status = EStatusState.idle;
      //   state.isFormLoading = false;
      //   state.isLoading = false;
      //   state.path = undefined;
      // })
      // .addCase(action.importExcel.rejected, (state, action) => {
      //   if (action.payload) {
      //     state.status = EStatusQuanLyPhieu.importExcelRejected;
      //   } else state.status = EStatusState.idle;
      //   state.isFormLoading = false;
      //   state.isLoading = false;
      //   state.path = undefined;
      // })
      .addCase(action.getSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.getSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.getSearchSample.fulfilled, (state, action) => {
        if (action.payload) {
          state.dataFilter = action.payload.data as Draft<Pagination<any>>;
        }
        state.status = EStatusPurchaseOrderReturn.getSearchSampleFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.getSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.createSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.createSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.createSearchSample.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrderReturn.createSearchSampleFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.createSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.createSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.updateSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.updateSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.updateSearchSample.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrderReturn.updateSearchSampleFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.updateSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.updateSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })

      .addCase(action.deleteSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.deleteSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.deleteSearchSample.fulfilled, (state) => {
        state.status = EStatusPurchaseOrderReturn.deleteSearchSampleFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.deleteSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.deleteSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.cancelledReturnOrder.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.cancelledReturnOrderPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.cancelledReturnOrder.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrderReturn.cancelledReturnOrderFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.cancelledReturnOrder.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.cancelledReturnOrderRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.supplierReturnInventory.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.supplierReturnInventoryPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.supplierReturnInventory.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrderReturn.supplierReturnInventoryFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.supplierReturnInventory.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.supplierReturnInventoryRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.refundPaymentOrder.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.refundPaymentOrderPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.refundPaymentOrder.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrderReturn.refundPaymentOrderFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.refundPaymentOrder.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.refundPaymentOrderRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.pending, (state) => {
        state.status = EStatusPurchaseOrderReturn.exportExcelPending;
        state.isLoading = true;
      })
      .addCase(action.exportListToExcel.fulfilled, (state) => {
        state.status = EStatusPurchaseOrderReturn.exportExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.rejected, (state) => {
        state.status = EStatusPurchaseOrderReturn.exportExcelRejected;
        state.isLoading = false;
      });
  }),
);
export const PurchaseOrderReturnFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StatePurchaseOrderReturn<PurchaseOrderReturnModel>),
    set: (values: StatePurchaseOrderReturn<PurchaseOrderReturnModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: any;
      keyState?: keyof StatePurchaseOrderReturn<PurchaseOrderReturnModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: PurchaseOrderReturnModel) => dispatch(action.post({ values })),
    put: (values: PurchaseOrderReturnModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    // putStatus: (values: QuanLyPhieuModel) => dispatch(action.putStatus({ values })),
    // importExcel: (values: { values: { path: string; typePhieu: string } }) => dispatch(action.importExcel(values)),
    getSearchSample: (params: QueryParams) => dispatch(action.getSearchSample(params)),
    createSearchSample: (values: SearchSample2) => dispatch(action.createSearchSample({ values })),
    updateSearchSample: ({ values, id }: { values: { title: string; queryJsonString: string }; id: string }) =>
      dispatch(action.updateSearchSample({ values, id })),
    deleteSearchSample: (id: string) => dispatch(action.deleteSearchSample({ id })),
    refundPaymentOrder: ({ values, id }: { values: PurchaseOrderReturnModel; id: string | any }) =>
      dispatch(action.refundPaymentOrder({ values, id })),
    cancelledReturnOrder: (params: QueryParams) => dispatch(action.cancelledReturnOrder(params)),
    supplierReturnInventory: (params: QueryParams) => dispatch(action.supplierReturnInventory(params)),
    exportListToExcel: (params: QueryParams) => dispatch(action.exportListToExcel({ params })),
  };
};

interface StatePurchaseOrderReturn<T> extends State<T, EStatusPurchaseOrderReturn> {
  isEdit?: boolean;
  tongTienHang?: number;
  isModalVisible?: boolean;
  idReject?: string;
  path?: string;
  generateStatus?: boolean;
  linkExport?: string;
  tabRef?: string;
  isFilter?: boolean;
  //   dataFilter?: Pagination<T_DataFilter>;
  //   tabItems?: T_TabItems[];
  discountSubTotal?: any;
  totalReceiptInventory?: any;
  subTotalMustPay?: any;
  isFillDiscount?: boolean;
  isFillOtherCost?: boolean;
  otherCostArr?: any;
  totalOtherCost?: number;
  products?: any;
  detailItemCustomer?: any;
  isHiddenSearch?: boolean;
  keyTabItems?: string | any;
  isQuickCreateProduct?: boolean;
  tags?: string;
  note?: string;
  orderCode?: string;
  paymentMethod?: string;
  reference?: string;
  wareCode?: string | null;
  unit?: string;
  isCopy?: boolean;
  itemCopy?: any;
  totalPriceStatus?: number | any;
  totalPricePaymentStatus?: number | any;
  indexHalfPayment?: number | any;
  totalHalfPayment?: number | any;
  totalPaymentContinue?: number | any;
  isPaymentAgain?: boolean;
  discountPercent?: number | any;
  discountLinePercent?: number | any; // chiết khấu từng dòng
  quotationId?: string | null;
  amountChange?: string; //giá trị thay đổi
  selectedItemByQuotation?: any;
  selectedItems?: any;
  halfPayment?: any;
  isDiscountTooltip?: boolean;
  saleOrderDiscountAccount?: number;
  subTotalAfterDiscount?: number;
  orderDiscountAmount?: number | any;
  orderDiscountPercent?: number;
  isHiddenChangeAmount?: boolean;
  alignValue?: string;
  alignOrder?: string;
  isShowModel?: boolean;
  returnedTotalQuantity?: number | any;
  returnedSubTotal?: number | any;
  returnedQuantity?: number;
  isExportFileModal?: boolean;
}

export class PurchaseOrderReturnModel extends CommonEntity {
  constructor(
    public id?: string,
    public orderCode?: string,
    public wareCode?: string,
    public reasonCode?: string,
    public entityId?: string,
    public projectId?: string,
    public entityCode?: string,
    public entityName?: string,
    public entityTypeCode?: string,
    public entityTypeName?: string,
    public originalDocumentId?: string,
    public originalDocumentCode?: string,
    public listPayment?: ListPaymentModel,
    public orderItems?: OrderItemModel,
    public refundSubTotal?: number,
    public note?: string,
    public reason?: any,
    public afterLineDiscountGoodsAmount?: number,
    public returnedQuantity?: number,
    public constructionId?: string | null,
    public contractId?: string | null,
    public paymentDueDate?: string,
    public statusCode?: string,
  ) {
    super();
  }
}

export class ListPaymentModel extends CommonEntity {
  constructor(
    public id?: string,
    public paymentMethod?: string,
    public linePaidAmount?: string,
    public reference?: string,
    public createDate?: string,
    public supplierId?: string,
    public customerId?: string,
    public customerName?: string,
    public supplierName?: string,
  ) {
    super();
  }
}

export class OrderItemModel extends CommonEntity {
  constructor(
    public lineNo?: number,
    public initialQuantity?: number,
    public returnedQuantity?: number,
    public returnedUnitPrice?: number,
    public productId?: string,
    public returnOrderId?: string,
    public productName?: string,
    public productCode?: string,
    public unit?: string,
  ) {
    super();
  }
}

export type SearchSample2 = {
  title: string;
  queryJsonString: string;
};

export enum EStatusPurchaseOrderReturn {
  putStatusPending = 'putStatusPending',
  putStatusFulfilled = 'putStatusFulfilled',
  putStatusRejected = 'putStatusRejected',
  importExcelPending = 'importExcelPending',
  importExcelFulfilled = 'importExcelFulfilled',
  importExcelRejected = 'importExcelRejected',
  getSearchSamplePending = 'getSearchSamplePending',
  getSearchSampleFulfilled = 'getSearchSampleFulfilled',
  getSearchSampleRejected = 'getSearchSampleRejected',
  getSalesOrderHistoryPending = 'getSalesOrderHistoryPending',
  getSalesOrderHistoryFulfilled = 'getSalesOrderHistoryFulfilled',
  getSalesOrderHistoryRejected = 'getSalesOrderHistoryRejected',
  createSearchSamplePending = 'createSearchSamplePending',
  createSearchSampleFulfilled = 'createSearchSampleFulfilled',
  createSearchSampleRejected = 'createSearchSampleRejected',
  updateSearchSamplePending = 'updateSearchSamplePending',
  updateSearchSampleFulfilled = 'updateSearchSampleFulfilled',
  updateSearchSampleRejected = 'updateSearchSampleRejected',
  deleteSearchSamplePending = 'deleteSearchSamplePending',
  deleteSearchSampleFulfilled = 'deleteSearchSampleFulfilled',
  deleteSearchSampleRejected = 'deleteSearchSampleRejected',
  cancelledReturnOrderFulfilled = 'cancelledReturnOrderFulfilled',
  cancelledReturnOrderPending = 'cancelledReturnOrderPending',
  cancelledReturnOrderRejected = 'cancelledReturnOrderRejected',
  supplierReturnInventoryPending = 'supplierReturnInventoryPending',
  supplierReturnInventoryFulfilled = 'supplierReturnInventoryFulfilled',
  supplierReturnInventoryRejected = 'supplierReturnInventoryRejected',
  refundPaymentOrderFulfilled = 'refundPaymentOrderFulfilled',
  refundPaymentOrderPending = 'refundPaymentOrderPending',
  refundPaymentOrderRejected = 'refundPaymentOrderRejected',

  // Xuất file
  exportExcelPending = 'exportExcelPending',
  exportExcelFulfilled = 'exportExcelFulfilled',
  exportExcelRejected = 'exportExcelRejected',
}
// export type T_TabItems = {
//   label: string;
//   key: string;
//   children: any;
// };

// export type T_DataFilter = {
//   id?: string;
//   title?: string;
//   query?: {
//     loaiPhieu?: string;
//     maPhieu?: string;
//     ngayTaoDon?: string;
//     maKho?: string;
//     idDuAn?: string;
//     nhaCungCap?: string;
//     maDonHang?: string;
//     tongTien?: string;
//     trangThai?: string;
//     fromDate?: string;
//     toDate?: string;
//     fullTextSearch?: string;
//   };
// };
