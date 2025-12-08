import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'PhongBan';
const action = new Action<PhongBanModel>(name);
export const phongBanSlice = createSlice(new Slice<PhongBanModel>(action));
export const PhongBanFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StatePhongBan<PhongBanModel>),
    set: (values: StatePhongBan<PhongBanModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StatePhongBan<PhongBanModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: PhongBanModel) => dispatch(action.post({ values })),
    put: (values: PhongBanModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StatePhongBan<T> extends State<T> {
  isEdit?: boolean;
}
export class PhongBanModel extends CommonEntity {
  constructor(
    public id: string,
    public maPhongBan?: string,
    public tenPhongBan?: string,
    public ghiChu?: string,
  ) {
    super();
  }
}
