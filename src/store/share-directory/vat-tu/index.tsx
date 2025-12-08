import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'VatTu';
const action = new Action<ProductModel>(name);
export const productSlice = createSlice(new Slice<ProductModel>(action));
export const ProductFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateProduct<ProductModel>),
    set: (values: StateProduct<ProductModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateProduct<ProductModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: ProductModel) => dispatch(action.post({ values })),
    put: (values: ProductModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateProduct<T> extends State<T> {
  isEdit?: boolean;
  type?: string;
  isDetail?: boolean;
  indexAddVatTu?: number;
  isFilter?: boolean;
  selectedRowKeys?: string[];
  isShowDescription?: boolean;
  filePath?: AttachmentModel[];
  listWareCodes?: ListWareCodes[] | any;
}
export class ProductModel extends CommonEntity {
  constructor(
    public id?: string,
    public type?: string,
    public code?: string,
    public name?: string,
    public unit?: string,
    public productGroupId?: string,
    public description?: string,
    public isActive?: boolean,
    public isOrder?: boolean,
    public purchaseUnitPrice?: number,
    public sellingUnitPrice?: number,
    public avatarUrl?: string,
    public attachmentUrl?: any,
    public note?: string,
    public nhomVatTu?: any,
    public totalAmount?: number | null,
    public quantity?: number | null,
    public attachments?: any,
    public initialStockQuantity?: number | any,
    public isVATApplied?: boolean,
    public exportVATPercent?: number | any,
    public importVATPercent?: number | any,
    public sellableQuantity?: number | any,
    public listWareCodes?: any,
    public barcode?: string,
    public actualQuantity?: number | any,
    public planQuantity?: number | any,
    public balanceQuantity?: number | any,
  ) {
    super();
  }
}
export type ProductCreateUpdateModel = {
  type?: string;
  code?: string;
  name?: string;
  unit?: string;
  description?: string;
  purchaseUnitPrice?: number;
  sellingUnitPrice?: number;
  isActive?: boolean;
  attachments?: any[];
  note?: string;
  isOrder: boolean;
  productGroupId?: string;
  initialStockQuantity?: number;
  isVATApplied?: boolean;
  exportVATPercent?: number;
  importVATPercent?: number;
  sellableQuantity?: number;
  listWareCodes?: ListWareCodes[];
  barcode?: string;
};

export type ListWareCodes = {
  id?: string;
  productCode?: string;
  productName?: string;
  receiptInventoryQuantity?: number | any;
  initialStockQuantity?: number | any;
  sellableQuantity?: number | any;
  wareCode?: string;
  unitPrice?: number | any;
};

export type AttachmentModel = {
  id?: string;
  docType?: string;
  fileUrl: string;
  entityType: string;
  description: string;
};
