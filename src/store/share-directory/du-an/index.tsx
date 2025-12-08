import { createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';

const name = 'DuAn';
const action = new Action<ProjectModel>(name);
export const duAnSlice = createSlice(new Slice<ProjectModel>(action));
export const ProjectFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateProject<ProjectModel>),
    set: (values: StateProject<ProjectModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateProject<ProjectModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: ProjectModel) => dispatch(action.post({ values })),
    put: (values: ProjectModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateProject<T> extends State<T> {
  isEdit?: boolean;
  isDetail?: boolean;
  isShow?: boolean;
}
export class ProjectModel extends CommonEntity {
  constructor(
    public id?: string,
    public maDuAn?: string,
    public tenDuAn?: string,
    public tongHopThu?: number,
    public tongHopChi?: number,
    public baoGia?: IQuotation[],
    public phieuNhapKho?: IInventoryNote[],
    public phieuXuatKho?: IInventoryNote[],
    public thu?: ICashbookTransaction[],
    public chi?: ICashbookTransaction[],
  ) {
    super();
  }
}

export interface IInventoryNote {
  id?: string;
  code?: string;
  entityId?: string;
  entityName?: string;
  transactionDate?: string;
  inventoryCode?: string;
  inventoryName?: string;
  statusCode?: string;
  statusName?: string;
  createdOnDate?: string;
  entityTypeName?: string;
  transactionTypeCode?: string;
  transactionTypeName?: string;
}

export interface ICashbookTransaction {
  id?: string;
  code?: string;
  entityName?: string;
  entityTypeName?: string;
  amount?: number;
  receiptDate?: string;
  createdOnDate?: string;
  transactionTypeCode?: string;
  purposeName?: string;
}

export interface IQuotation {
  id?: string;
  code?: string;
  customerName?: string;
  customerPhoneNumber?: string;
  totalAmount?: number;
  createdOnDate?: string;
}
