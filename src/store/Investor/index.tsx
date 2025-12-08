import { CommonEntity, QueryParams } from '@models';
import { createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { InvestorTypeViewModel } from '../InvestorType';

const name = 'Investor';
const action = {
  ...new Action<InvestorViewModel, EStatusInvestor>(name),
  // shareUser: createAsyncThunk(name + 'shareUser', async ({ id, data }: { id: string; data: InvestorViewModel }) => {
  //   const res = await API.post(`/obj-map/user/${id}`, data);
  //   if (res.message) await Message.success({ text: res.message });
  //   return res;
  // }),
};
export const InvestorSlice = createSlice(
  new Slice<InvestorViewModel, EStatusInvestor>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder;
    // .addCase(action.shareUser.pending, (state, action) => {
    //   state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
    //   state.queryParams = JSON.stringify(action.meta.arg);
    //   state.isLoading = true;
    //   state.status = EStatusInvestorType.shareUserPending;
    // })
    // .addCase(action.shareUser.fulfilled, (state, action) => {
    //   if (action.payload) {
    //     state.data = action.payload as Draft<InvestorViewModel>;
    //     state.status = EStatusInvestorType.shareUserFulfilled;
    //   } else state.status = EStatusInvestorType.idle;
    //   state.isLoading = false;
    // })
    // .addCase(action.shareUser.rejected, (state: StateInvestor<InvestorViewModel>) => {
    //   state.status = EStatusInvestorType.shareUserRejected;
    //   state.isLoading = false;
    // });
  }),
);

export const InvestorFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...(useTypedSelector((state) => state[action.name]) as StateInvestor<InvestorViewModel>),
    set: (values: StateInvestor<InvestorViewModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateInvestor<InvestorViewModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: InvestorViewModel) => dispatch(action.post({ values })),
    put: (values: InvestorViewModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateInvestor<T> extends State<T, EStatusInvestor> {
  isVisibleForm?: boolean;
  investorData?: InvestorViewModel | any;
}
export class InvestorViewModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public name?: string,
    public investorTypeId?: string,
    public investorType?: InvestorTypeViewModel,
  ) {
    super();
  }
}
export enum EStatusInvestor {
  idle = 'idle',
  shareUserPending = 'shareUserPending',
  shareUserFulfilled = 'shareUserFulfilled',
  shareUserRejected = 'shareUserRejected',
}
