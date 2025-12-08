import { PayloadAction, createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';
import {useAppDispatch, useTypedSelector, Action, Slice, State, InvestorViewModel} from '@store';
import {CommonEntity, Pagination, QueryParams} from '@models';
import { API } from '@utils';
import { Message } from '@core/message';

const name = 'InvestorType';
const action = {
  ...new Action<InvestorTypeViewModel, EStatusInvestorType>(name),
  // shareUser: createAsyncThunk(name + 'shareUser', async ({ id, data }: { id: string; data: InvestorTypeViewModel }) => {
  //   const res = await API.post(`/obj-map/user/${id}`, data);
  //   if (res.message) await Message.success({ text: res.message });
  //   return res;
  // }),
};
export const InvestorTypeSlice = createSlice(
  new Slice<InvestorTypeViewModel, EStatusInvestorType>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      // .addCase(action.shareUser.pending, (state, action) => {
      //   state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
      //   state.queryParams = JSON.stringify(action.meta.arg);
      //   state.isLoading = true;
      //   state.status = EStatusInvestorType.shareUserPending;
      // })
      // .addCase(action.shareUser.fulfilled, (state, action) => {
      //   if (action.payload) {
      //     state.data = action.payload as Draft<InvestorTypeViewModel>;
      //     state.status = EStatusInvestorType.shareUserFulfilled;
      //   } else state.status = EStatusInvestorType.idle;
      //   state.isLoading = false;
      // })
      // .addCase(action.shareUser.rejected, (state: StateInvestorType<InvestorTypeViewModel>) => {
      //   state.status = EStatusInvestorType.shareUserRejected;
      //   state.isLoading = false;
      // });
  }),
);

export const InvestorTypeFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...(useTypedSelector((state) => state[action.name]) as StateInvestorType<InvestorTypeViewModel>),
    set: (values: StateInvestorType<InvestorTypeViewModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateInvestorType<InvestorTypeViewModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: InvestorTypeViewModel) => dispatch(action.post({ values })),
    put: (values: InvestorTypeViewModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateInvestorType<T> extends State<T, EStatusInvestorType> {
  isVisibleForm?: boolean;
}
export class InvestorTypeViewModel extends CommonEntity {
  constructor(
    public id: string,
    public code?: string,
    public name?: string,
    public investor?: InvestorViewModel,
  ) {
    super()
  }
}
export enum EStatusInvestorType {
  idle = 'idle',
  shareUserPending = 'shareUserPending',
  shareUserFulfilled = 'shareUserFulfilled',
  shareUserRejected = 'shareUserRejected',
}
