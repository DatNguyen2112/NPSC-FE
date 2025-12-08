import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';
import { customMessage } from '../../index';

const name = 'LoaiXe';
const action = {
  ...new Action<LoaiXeModel, EStatusLoaiXe>(name),
  deleteMany: createAsyncThunk(name + 'deleteMany', async ({ ids }: { ids: string[] }) => {
    const res = await API.delete(`${routerLinks(name, 'api')}?${ids.map((id) => `ids=${id}`).join('&')}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
};

export const loaiXeSlice = createSlice(
  new Slice<LoaiXeModel, EStatusLoaiXe>(action, {}, (builder) => {
    builder
      .addCase(action.deleteMany.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusLoaiXe.deleteManyPending;
      })
      .addCase(action.deleteMany.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusLoaiXe.deleteManyFulfilled;
      })
      .addCase(action.deleteMany.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusLoaiXe.deleteManyRejected;
      });
  }),
);
export const LoaiXeFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateLoaiXe<LoaiXeModel>),
    set: (values: StateLoaiXe<LoaiXeModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateLoaiXe<LoaiXeModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: LoaiXeModel) => dispatch(action.post({ values })),
    put: (values: LoaiXeModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    deleteMany: (ids: string[]) => dispatch(action.deleteMany({ ids })),
  };
};
interface StateLoaiXe<T> extends State<T, EStatusLoaiXe> {
  isEdit?: boolean;
  isViewDetails?: boolean;
  selectedRowKeys?: string[];
}
export class LoaiXeModel extends CommonEntity {
  constructor(
    public tenLoaiXe?: string,
    public moTa?: string,
  ) {
    super();
  }
}
export enum EStatusLoaiXe {
  deleteManyPending = 'deleteManyPending',
  deleteManyFulfilled = 'deleteManyFulfilled',
  deleteManyRejected = 'deleteManyRejected',
}
