import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';

import { CommonEntity, EStatusState, Pagination, QueryParams } from '@models';
import { Action, NhaCungCapModel, ProjectModel, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'PurchaseOrder';
const action = {
  ...new Action<PurchaseOrderModel, EStatusPurchaseOrder>(name),
  rejectOrder: createAsyncThunk(name + 'rejectOrder', async (params: QueryParams) => {
    const res = await API.put(`${routerLinks(name, 'api')}/reject-order/${params.id}`, params);
    if (res.message) await customMessage.success({ type: 'success', content: res.message });
    return res.data;
  }),
  putStatus: createAsyncThunk(name + 'putStatus', async ({ values }: { values: PurchaseOrderModel }) => {
    const { data, message } = await API.put(`${routerLinks(name, 'api')}/${values.id}/status`, values);
    if (message) await customMessage.success({ type: 'success', content: message });
    return data;
  }),
  importExcel: createAsyncThunk(
    name + 'importExcel',
    async ({ values }: { values: { path: string; typePhieu: string } }) => {
      const responses = await API.post(
        `${routerLinks(name, 'api')}/import-excel?path=${values.path}&typePhieu=${values.typePhieu}`,
      );

      if (responses.isSuccess) {
        if (responses.message) await customMessage.success({ type: 'success', content: responses.message });
      } else await customMessage.error({ type: 'error', content: responses.message });

      return responses.data;
    },
  ),
  getSearchSample: createAsyncThunk('' + 'searchSample', async (params: QueryParams) => {
    return await API.get(`http://mk.geneat.pro/api/v1/search-sample`, params);
  }),
  createSearchSample: createAsyncThunk('' + 'createSearchSample', async ({ values }: { values: SearchSample }) => {
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
  recieptOrder: createAsyncThunk(name + 'recieptOrder', async (params: QueryParams) => {
    const res = await API.put(`${routerLinks(name, 'api')}/reciept/${params?.id}`, params);
    if (res) return customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  chargePaymentOrder: createAsyncThunk(
    name + 'chargePaymentOrder',
    async ({ values, id }: { values: PurchaseOrderModel; id: string }) => {
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
  exportExcel: createAsyncThunk(name + 'exportExcel', async (id: string) => {
    const res = await fetch(`${linkApi}/quanlyphieu/export-excel/${id}`, {
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
  getPurchaseOrderHistory: createAsyncThunk('' + 'getPurchaseOrderHistory', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/purchase-order-history`, params);
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

export const purchaseOrderSlice = createSlice(
  new Slice<PurchaseOrderModel, EStatusPurchaseOrder>(action, {}, (builder) => {
    builder
      .addCase(action.putStatus.pending, (state, _action) => {
        state.isFormLoading = true;
        state.status = EStatusPurchaseOrder.putStatusPending;
        state.isLoading = true;
      })
      .addCase(action.putStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.putStatusFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.putStatus.rejected, (state) => {
        state.status = EStatusPurchaseOrder.putStatusRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.importExcel.pending, (state) => {
        state.status = EStatusPurchaseOrder.importExcelPending;
        state.isFormLoading = false;
        state.isLoading = true;
      })
      .addCase(action.importExcel.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.importExcelFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
        state.path = undefined;
      })
      .addCase(action.importExcel.rejected, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.importExcelRejected;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
        state.path = undefined;
      })
      .addCase(action.getPurchaseOrderHistory.pending, (state) => {
        state.status = EStatusPurchaseOrder.getPurchaseOrderHistoryPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.getPurchaseOrderHistory.fulfilled, (state, action) => {
        if (action.payload) {
          state.dataFilter = action.payload.data as Draft<Pagination<T_DataFilter>>;
        }
        state.status = EStatusPurchaseOrder.getPurchaseOrderHistoryFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getPurchaseOrderHistory.rejected, (state) => {
        state.status = EStatusPurchaseOrder.getPurchaseOrderHistoryRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrder.getSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.getSearchSample.fulfilled, (state, action) => {
        if (action.payload) {
          state.dataFilter = action.payload.data as Draft<Pagination<T_DataFilter>>;
        }
        state.status = EStatusPurchaseOrder.getSearchSampleFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrder.getSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.createSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrder.createSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.createSearchSample.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.createSearchSampleFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.createSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrder.createSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.updateSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrder.updateSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.updateSearchSample.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.updateSearchSampleFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.updateSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrder.updateSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })

      .addCase(action.deleteSearchSample.pending, (state) => {
        state.status = EStatusPurchaseOrder.deleteSearchSamplePending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.deleteSearchSample.fulfilled, (state) => {
        state.status = EStatusPurchaseOrder.deleteSearchSampleFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.deleteSearchSample.rejected, (state) => {
        state.status = EStatusPurchaseOrder.deleteSearchSampleRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.recieptOrder.pending, (state) => {
        state.status = EStatusPurchaseOrder.recieptOrderPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.recieptOrder.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.recieptOrderFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.recieptOrder.rejected, (state) => {
        state.status = EStatusPurchaseOrder.recieptOrderRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.chargePaymentOrder.pending, (state) => {
        state.status = EStatusPurchaseOrder.chargePaymentOrderPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.chargePaymentOrder.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.chargePaymentOrderFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.chargePaymentOrder.rejected, (state) => {
        state.status = EStatusPurchaseOrder.chargePaymentOrderRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.rejectOrder.pending, (state) => {
        state.status = EStatusPurchaseOrder.rejectOrderPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.rejectOrder.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusPurchaseOrder.rejectOrderFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.rejectOrder.rejected, (state) => {
        state.status = EStatusPurchaseOrder.rejectOrderRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.pending, (state) => {
        state.status = EStatusPurchaseOrder.exportExcelPending;
        state.isLoading = true;
      })
      .addCase(action.exportListToExcel.fulfilled, (state) => {
        state.status = EStatusPurchaseOrder.exportExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.rejected, (state) => {
        state.status = EStatusPurchaseOrder.exportExcelRejected;
        state.isLoading = false;
      });
  }),
);
export const PurchaseOrderFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateQuanLyPhieu<PurchaseOrderModel>),
    set: (values: StateQuanLyPhieu<PurchaseOrderModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateQuanLyPhieu<PurchaseOrderModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: PurchaseOrderModel) => dispatch(action.post({ values })),
    put: (values: PurchaseOrderModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    putStatus: (values: PurchaseOrderModel) => dispatch(action.putStatus({ values })),
    importExcel: (values: { values: { path: string; typePhieu: string } }) => dispatch(action.importExcel(values)),
    exportExcel: (id: string) => dispatch(action.exportExcel(id)),
    getSearchSample: (params: QueryParams) => dispatch(action.getSearchSample(params)),
    getPurchaseOrderHistory: (params: QueryParams) => dispatch(action.getPurchaseOrderHistory(params)),
    createSearchSample: (values: SearchSample) => dispatch(action.createSearchSample({ values })),
    updateSearchSample: ({ values, id }: { values: { title: string; queryJsonString: string }; id: string }) =>
      dispatch(action.updateSearchSample({ values, id })),
    recieptOrder: (params: QueryParams) => dispatch(action.recieptOrder(params)),
    rejectOrder: (params: QueryParams) => dispatch(action.rejectOrder(params)),
    charngePaymentOrder: ({ values, id }: { values: PurchaseOrderModel; id: string | any }) =>
      dispatch(action.chargePaymentOrder({ values, id })),
    deleteSearchSample: (id: string) => dispatch(action.deleteSearchSample({ id })),
    exportListToExcel: (params: QueryParams) => dispatch(action.exportListToExcel({ params })),
  };
};

interface StateQuanLyPhieu<T> extends State<T, EStatusPurchaseOrder> {
  isEdit?: boolean;
  tongTienHang?: number;
  isModalVisible?: boolean;
  idReject?: string;
  path?: string;
  generateStatus?: boolean;
  linkExport?: string;
  tabRef?: string;
  isFilter?: boolean;
  dataFilter?: Pagination<T_DataFilter>;
  tabItems?: T_TabItems[];
  discountSubTotal?: number | any;
  isFillDiscount?: boolean;
  isFillOtherCost?: boolean;
  isFillVatValue?: boolean;

  // Form value
  vat?: number | any;
  wareCode?: string | null;
  orderCode?: string | any;
  projectId?: string | any;
  contractId?: string | any;
  constructionId?: string | any;
  reason?: string;
  otherCostArr?: any;
  totalOtherCost?: number | any;
  products?: any;
  materialRequestId?: string | any;

  // Khác
  itemCopy?: any;
  isCopy?: boolean;
  supplierInfo?: any;
  subTotalMustPay?: any;
  totalVat?: number | any;
  indexHalfPayment?: number | any;
  totalHalfPayment?: number | any;
  totalPaymentContinue?: number | any;
  isPaymentAgain?: boolean;
  discountPercent?: number | any;
  isQuickCreateProduct?: boolean;
  note?: string;
  current?: number;
  subTotalOtherCost?: number;
  halfPayment?: any;
  otherCost?: any;
  selectedItems?: any;
  isHiddenDiscountPercent?: boolean;
  isDiscountTooltip?: boolean;
  saleOrderDiscountAccount?: number;
  subTotalAfterDiscount?: number;
  orderDiscountAmount?: number | any;
  orderDiscountPercent?: number;
  isHiddenChangeAmount?: boolean;
  isHiddenSearch?: boolean;
  alignValue?: string;
  alignOrder?: string;
  subTotal?: number;
  totalQuantity?: number;
  isPercent?: boolean;
  isValue?: boolean;
  isPercentItem?: boolean;
  isValueItem?: boolean;
  isHiddenProductInfo?: boolean;
  isExportFileModal?: boolean;
  listWareCodes?: any;

  // Thêm nhanh sản phẩm
  isProductManyModal?: boolean;
  checkedList?: [] | any;
  isCheckAll?: boolean;
  arrChoose?: [] | any;
}

export class PurchaseOrderModel extends CommonEntity {
  constructor(
    public id?: string,
    public orderCode?: string | null,
    public statusCode?: string | any,
    public wareCode?: any,
    public typeCode?: string,
    public reason?: string | any,
    public address?: string,
    public subTotal?: number,
    public typeName?: string,
    public items?: any,
    public projectId?: string | any,
    public projects?: ProjectModel,
    public supplierId?: string,
    public allowedActions?: string[],
    public discountPercent?: number,
    public lyDoTuChoi?: string,
    public status?: string,
    public vat?: number,
    public totalTaxAccount?: number | any,
    public totalDiscountsAccounts?: number | any,
    public totalAmount?: number,
    public listOtherCost?: any,
    public listPayment?: any,
    public totalPaidAmount?: number,
    public totalRemainingAmount?: number,
    public totalOtherCost?: number,
    public importStatusCode?: string,
    public note?: string,
    public afterLineDiscountGoodsAmount?: number | any,
    public lineAmount?: number | any,
    public quantity?: number | any,
    public VATAmount?: number | any,
    public discountAmount?: string,
    public discountType?: string,
    public isReturned?: boolean,
    public constructionId?: string,
    public contractId?: string,
    public materialRequestId?: string | any,
    public supplierName?: string,
    public total?: number,
    public supplier?: NhaCungCapModel | any,
    public paymentDueDate?: string | any,
  ) {
    super();
  }
}

export class PurchaseOrderItemsModel extends CommonEntity {
  constructor(
    public id?: string,
    public lineNo?: number,
    public productCode?: string,
    public productName?: string,
    public amount?: string,
    public unitPrice?: string,
    public unit?: string,
    public quantity?: number,
    public totalAmount?: number,
    public subTotal?: number,
    public discountCode?: string,
    public discountType?: string,
    public discountAmount?: number,
    public discountPercent?: number,
    public afterLineDiscountGoodsAmount?: number | any,
    public productId?: string,
    public unitPriceDiscountAmount?: number,
    public vatPercent?: number,
    public vatAmount?: number,
    public paymentDueDate?: string,
  ) {
    super();
  }
}

export type SearchSample = {
  title: string;
  queryJsonString: string;
};

export enum EStatusPurchaseOrder {
  putStatusPending = 'putStatusPending',
  putStatusFulfilled = 'putStatusFulfilled',
  putStatusRejected = 'putStatusRejected',
  importExcelPending = 'importExcelPending',
  importExcelFulfilled = 'importExcelFulfilled',
  importExcelRejected = 'importExcelRejected',
  getSearchSamplePending = 'getSearchSamplePending',
  getSearchSampleFulfilled = 'getSearchSampleFulfilled',
  getSearchSampleRejected = 'getSearchSampleRejected',
  getPurchaseOrderHistoryPending = 'getPurchaseOrderHistoryPending',
  getPurchaseOrderHistoryFulfilled = 'getPurchaseOrderHistoryFulfilled',
  getPurchaseOrderHistoryRejected = 'getPurchaseOrderHistoryRejected',
  createSearchSamplePending = 'createSearchSamplePending',
  createSearchSampleFulfilled = 'createSearchSampleFulfilled',
  createSearchSampleRejected = 'createSearchSampleRejected',
  updateSearchSamplePending = 'updateSearchSamplePending',
  updateSearchSampleFulfilled = 'updateSearchSampleFulfilled',
  updateSearchSampleRejected = 'updateSearchSampleRejected',
  deleteSearchSamplePending = 'deleteSearchSamplePending',
  deleteSearchSampleFulfilled = 'deleteSearchSampleFulfilled',
  deleteSearchSampleRejected = 'deleteSearchSampleRejected',
  recieptOrderFulfilled = 'recieptOrderFulfilled',
  recieptOrderPending = 'recieptOrderPending',
  recieptOrderRejected = 'recieptOrderRejected',
  chargePaymentOrderFulfilled = 'chargePaymentOrderFulfilled',
  chargePaymentOrderPending = 'chargePaymentOrderPending',
  chargePaymentOrderRejected = 'chargePaymentOrderRejected',
  rejectOrderFulfilled = 'rejectOrderFulfilled',
  rejectOrderPending = 'rejectOrderPending',
  rejectOrderRejected = 'rejectOrderRejected',
  // Export excel
  exportExcelPending = 'exportExcelPending',
  exportExcelFulfilled = 'exportExcelFulfilled',
  exportExcelRejected = 'exportExcelRejected',
}
export type T_TabItems = {
  label: string;
  key: string;
  children: any;
};

export type T_DataFilter = {
  id?: string;
  title?: string;
  query?: {
    loaiPhieu?: string;
    maPhieu?: string;
    ngayTaoDon?: string;
    maKho?: string;
    idDuAn?: string;
    nhaCungCap?: string;
    maDonHang?: string;
    tongTien?: string;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
    fullTextSearch?: string;
  };
};

export type PurchaseOrderItems = {
  id?: string;
  code?: string;
  name?: string;
  amount?: string;
  unitPrice?: string;
  lineAmount?: number;
  goodsAmount?: number;
  unit?: string;
  quantity?: number;
  totalAmount?: number;
  subTotal?: number;
  unitPriceDiscountType?: string;
  unitPriceDiscountAmount?: number;
  unitPriceDiscountPercent?: number;
  afterLineDiscountGoodsAmount?: number | any;
  VATableAmount?: number;
  VATAmount?: number;
  VATPercent?: number;
  productId?: string;
  isDiscountToolTip?: boolean;
};
