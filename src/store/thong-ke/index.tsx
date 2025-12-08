import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, Pagination, QueryParams } from '@models';
import { API, routerLinks } from '@utils';

const name = 'ThongKe';
const action = {
  ...new Action<ThongKeModel, EStatusThongKe>(name),
  getXuatNhapTon: createAsyncThunk(
    name + '/getXuatNhapTon',
    async (params: QueryParams) =>
      await API.get<Pagination<ThongKeModel>>(`${routerLinks(name, 'api')}/xuat-nhap-ton`, params),
  ),
};
export const thongKeSlice = createSlice(
  new Slice<ThongKeModel, EStatusThongKe>(action, {}, (builder) => {
    builder
      .addCase(action.getXuatNhapTon.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusThongKe.getXuatNhapTonPending;
      })
      .addCase(action.getXuatNhapTon.fulfilled, (state: StateThongKe<ThongKeModel>, action: any) => {
        state.isLoading = false;
        state.status = EStatusThongKe.getXuatNhapTonFulfilled;
        state.pagination = action.payload.data;
      })
      .addCase(action.getXuatNhapTon.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusThongKe.getXuatNhapTonRejected;
      });
  }),
);
export const ThongKeFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateThongKe<ThongKeModel>),
    set: (values: StateThongKe<ThongKeModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateThongKe<ThongKeModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: ThongKeModel) => dispatch(action.post({ values })),
    put: (values: ThongKeModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getXuatNhapTon: (params: QueryParams) => dispatch(action.getXuatNhapTon(params)),
  };
};
interface StateThongKe<T> extends State<T, EStatusThongKe> {
  isEdit?: boolean;
}
export class ThongKeModel extends CommonEntity {
  constructor(
    public idVatTu?: string,
    public maKho?: string,
    public tenThongKe?: string,
    public tenKho?: string,
    public maVatTu?: string,
    public tenVatTu?: string,
    public donViTinh?: string,
    public soLuongNhap?: string,
    public giaTriNhap?: string,
    public soLuongXuat?: string,
    public giaTriXuat?: string,
    public soLuongTon?: string,
    public giaTriTon?: string,
  ) {
    super();
  }
}

export enum EStatusThongKe {
  getXuatNhapTonPending = 'getXuatNhapTonPending',
  getXuatNhapTonFulfilled = 'getXuatNhapTonFulfilled',
  getXuatNhapTonRejected = 'getXuatNhapTonRejected',
}
