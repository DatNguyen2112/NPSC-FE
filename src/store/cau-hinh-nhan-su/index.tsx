import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State, ChucVuModel, PhongBanModel } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'CauHinhNhanSu';
const action = new Action<CauHinhNhanSuModel>(name);
export const cauHinhNhanSuSlice = createSlice(new Slice<CauHinhNhanSuModel>(action));
export const CauHinhNhanSuFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateCauHinhNhanSu<CauHinhNhanSuModel>),
    set: (values: StateCauHinhNhanSu<CauHinhNhanSuModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateCauHinhNhanSu<CauHinhNhanSuModel> }) =>
      dispatch(action.getById({ id, keyState })),
    put: (values: CauHinhNhanSuModel) => dispatch(action.put({ values })),
  };
};
interface StateCauHinhNhanSu<T> extends State<T> {
  isDetail?: boolean;
  isCauHinhNhanSu?: boolean;
}
export class CauHinhNhanSuModel extends CommonEntity {
  constructor(
    public id?: string,
    public ma?: string,
    public tenNhanSu?: string,
    public chucVu?: any,
    public phongBan?: any,
    public luongCoBan?: number | string,
    public anCa?: number | string,
    public dienThoai?: number | string,
    public trangPhuc?: number | string,
    public soNguoiPhuThuoc?: number | string,
    public idChucVu?: string,
    public idPhongBan?: string,
  ) {
    super();
  }
}
