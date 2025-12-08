import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, ProductModel, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';
import React from 'react';

const name = 'Quotation';
const action = {
  ...new Action<QuotationModel, EStatusQuotation>(name),
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
export const quotationSlice = createSlice(
  new Slice<QuotationModel, EStatusQuotation>(action, {}, (builder) => {
    builder
      .addCase(action.exportListToExcel.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusQuotation.exportListToExcelPending;
      })
      .addCase(action.exportListToExcel.fulfilled, (state: StateQuotation<QuotationModel>, action: any) => {
        state.status = EStatusQuotation.exportListToExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusQuotation.exportListToExcelRejected;
      });
  }),
);
export const QuotationFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateQuotation<QuotationModel>),
    set: (values: StateQuotation<QuotationModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateQuotation<QuotationModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: QuotationModel) => dispatch(action.post({ values })),
    put: (values: QuotationModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    exportListToExcel: (params: QueryParams) => dispatch(action.exportListToExcel({ params })),
  };
};
interface StateQuotation<T> extends State<T, EStatusQuotation> {
  isCustomer?: boolean;
  subTotalAmount?: number;
  typeCode?: string;
  isSpecifications?: boolean;
  isCustomerSelected?: boolean;
  totalAmount?: number;
  vatAmount?: number;
  detailItemCustomer?: any;
  detailItemProduct?: any;
  isVatTooltip?: boolean;
  isDiscountTooltip?: boolean;
  quotationQuantity?: number;
  isCustomerModal?: boolean;
  isHiddenCustomerForm?: boolean;
  isProductModal?: boolean;
  isProductManyModal?: boolean;
  isHiddenProductInputSearch?: boolean;
  isHiddenDiscountPercent?: boolean;
  isRender?: boolean;
  isExportFileModalQuotation?: boolean;
  selectedRowKeys?: React.Key[];
  selectedRows?: QuotationItemModel[];
}
export class QuotationModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public customerId?: string,
    public customerCode?: string,
    public customerName?: string,
    public customerTaxCode?: string,
    public customerAddress?: string,
    public customerPhoneNumber?: string,
    public deliveryAddress?: string,
    public projectId?: string,
    public projectCode?: string,
    public projectName?: string,
    public orderCode?: string,
    public typeCode?: string,
    public dueDate?: string,
    public note?: string,
    public vatPercent?: number,
    public subTotalAmount?: number,
    public totalVatAmount?: number,
    public totalAmount?: number,
    public discountType?: string,
    public discountAmount?: number,
    public discountReason?: string,
    public shippingCostAmount?: number,
    public otherCostAmount?: number,
    public paymentMethodCode?: string,
    public paymentMethodName?: string,
    public status?: string,
    public quotationItem?: QuotationItemModel[],
  ) {
    super();
  }
}

export class QuotationItemModel {
  constructor(
    public id?: string,
    public productId?: string,
    public code?: string,
    public name?: string,
    public specifications?: string,
    public unit?: string,
    public quantity?: number,
    public unitPrice?: number,
    public unitPriceDiscountAmount?: number,
    public unitPriceDiscountPercent?: number,
    public unitPriceDiscountType?: string,
    public lineAmount?: number,
    public lineNumber?: number,
    public lineNote?: string,
    public lineVATPercent?: number,
    public lineVATableAmount?: number,
    public lineVATAmount?: number,
    public lineVATCode?: string,
    public isProductVATApplied?: boolean,
    public goodsAmount?: number,
    public afterLineDiscountGoodsAmount?: number,
    public orderDiscountAmount?: number,
  ) {}
}

export enum EStatusQuotation {
  exportListToExcelPending = 'exportListToExcelPending',
  exportListToExcelFulfilled = 'exportListToExcelFulfilled',
  exportListToExcelRejected = 'exportListToExcelRejected',
}
