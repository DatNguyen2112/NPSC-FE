import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'NhomVatTu';
const action = new Action<NhomVatTuModel>(name);
export const nhomVatTuSlice = createSlice(new Slice<NhomVatTuModel>(action));
export const NhomVatTuFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateNhomVatTu<NhomVatTuModel>),
    set: (values: StateNhomVatTu<NhomVatTuModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateNhomVatTu<NhomVatTuModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: NhomVatTuModel) => dispatch(action.post({ values })),
    put: (values: NhomVatTuModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateNhomVatTu<T> extends State<T> {
  isEdit?: boolean;
}
export class NhomVatTuModel extends CommonEntity {
  constructor(
    public id: string,
    public maNhom?: string,
    public tenNhom?: string,
    public ghiChu?: string,
  ) {
    super();
  }
}
