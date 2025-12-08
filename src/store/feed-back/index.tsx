import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  Action,
  Slice,
  State,
  useAppDispatch,
  useTypedSelector,
} from '@store';
import { CommonEntity, QueryParams } from '@models';
import { API, routerLinks } from '@utils';

const name = 'Feedback';
const action = {
  ...new Action<FeedBackModel, EStatusFeedback>(name),
  createFeedback: createAsyncThunk(name + 'createFeedback', async ({ values }: { values: FeedbackCreateModel }) => {
    return await API.post(`${routerLinks(name, 'api')}`, values);
  }),
}
export const feedbackSlice = createSlice(
  new Slice<FeedBackModel, EStatusFeedback>(action, {}, (builder) => {
    builder
      .addCase(action.createFeedback.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusFeedback.createFeedbackPending;
      })
      .addCase(action.createFeedback.fulfilled, (state, action: any) => {
        state.isLoading = false;
        console.log('âsasa');
        state.status = EStatusFeedback.createFeedbackFulfilled;
      })
      .addCase(action.createFeedback.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusFeedback.createFeedbackRejected;
      });
  }),
);

export const FeedbackFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateFeedback<FeedBackModel>),
    set: (values: StateFeedback<FeedbackCreateModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    post: (values: FeedBackModel) => dispatch(action.post({ values })),
    createFeedback: (values: FeedbackCreateModel) => dispatch(action.createFeedback({values}))

  };
};

export class FeedBackModel extends CommonEntity {
  constructor(
    public id?: string,
    public name?: string,
    public content?: string,
    public phoneNumber?: string,
    public module?: string[],
  ) {
    super();
  }
}
interface StateFeedback<T> extends State<T, EStatusFeedback> {}
export enum EStatusFeedback {
  createFeedbackPending = 'createFeedbackPending',
  createFeedbackFulfilled = 'createFeedbackFulfilled',
  createFeedbackRejected = 'createFeedbackRejected',
}
export type FeedbackCreateModel = {
  name?: string,
  phoneNumber?: string,
  module?: string[],
  content?: string,
  rate?: number,
}
