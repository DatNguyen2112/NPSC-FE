import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'ChucVu';
const action = new Action<ChucVuModel>(name);
export const chucVuSlice = createSlice(new Slice<ChucVuModel>(action));
export const ChucVuFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateChucVu<ChucVuModel>),
    set: (values: StateChucVu<ChucVuModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateChucVu<ChucVuModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: ChucVuModel) => dispatch(action.post({ values })),
    put: (values: ChucVuModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateChucVu<T> extends State<T> {
  isEdit?: boolean;
}
export class ChucVuModel extends CommonEntity {
  constructor(
    public id: string,
    public maChucVu?: string,
    public tenChucVu?: string,
    public ghiChu?: string,
  ) {
    super();
  }
}
