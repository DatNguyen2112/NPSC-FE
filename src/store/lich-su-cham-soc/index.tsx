import { createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {
  useAppDispatch,
  useTypedSelector,
  Action,
  Slice,
  State,
  CustomerModel
} from '@store';
import { CommonEntity, EStatusState, QueryParams } from '@models';
import { API, routerLinks } from '@utils';
import { Message } from '@core/message';
import { customMessage } from '../../index';

const name = 'LSCS';
// const action = new Action<LSCSModel>(name);

const action = {
  ...new Action<LSCSModel, EStatusLCSC>(name),
  confirmTaskCompletion: createAsyncThunk(name + 'confirmTaskCompletion', async ({id}: { id: string}) => {
    const res = await API.put(`${routerLinks(name, 'api')}/confirm-task-completion/${id}`);
    if (res.message) await Message.success({ text: res.message });
    return res;
  }),

  restoreTask: createAsyncThunk(name + 'restoreTask', async ({id}: { id: string}) => {
    const res = await API.put(`${routerLinks(name, 'api')}/restore-task/${id}`);
    if (res.message) await Message.success({ text: res.message });
    return res;
  }),

  changeActivity: createAsyncThunk(
    name + 'changeActivity',
    async ({values}: { values: LSCSModel }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/change-activity/${values?.id}`, values);
      if (res.message) customMessage.success({type: 'success', content: res.message});
      return res;
    },
  ),
};

// export const lSCSSlice = createSlice(new Slice<LSCSModel>(action));

export const lSCSSlice = createSlice(
  new Slice<LSCSModel, EStatusLCSC>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.confirmTaskCompletion.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusLCSC.confirmTaskCompletionPending;
      })
      .addCase(action.confirmTaskCompletion.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusLCSC.confirmTaskCompletionFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.confirmTaskCompletion.rejected, (state) => {
        state.status = EStatusLCSC.confirmTaskCompletionRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.restoreTask.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusLCSC.restoreTaskPending;
      })
      .addCase(action.restoreTask.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusLCSC.restoreTaskFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.restoreTask.rejected, (state) => {
        state.status = EStatusLCSC.restoreTaskRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.changeActivity.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusLCSC.changeActivityPending;
      })
      .addCase(action.changeActivity.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusLCSC.changeActivityFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.changeActivity.rejected, (state) => {
        state.status = EStatusLCSC.changeActivityRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      });
  }),
);

export const LSCSFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateLSCS<LSCSModel>),
    set: (values: StateLSCS<LSCSModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateLSCS<LSCSModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: LSCSModel) => dispatch(action.post({ values })),
    put: (values: LSCSModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    confirmTaskCompletion: ({id}: {id: string | any}) => dispatch(action.confirmTaskCompletion({id})),
    restoreTask: ({id}: {id: string | any}) => dispatch(action.restoreTask({id})),
    changeActivity: ({values} : {values: LSCSModel}) => dispatch(action.changeActivity({values})),
  };
};
interface StateLSCS<T> extends State<T, EStatusLCSC> {
  isEdit?: boolean;
  newPackageData?: CustomerModel;
}
export class LSCSModel extends CommonEntity {
  constructor(
    public id: string | any,
    public code: string | any,
    public lastCareOnDate: string | any,
    public customerId?: string,
    public ghiChu?: string,
    public danhGia?: number,
    public type?: string,
    public customerServiceContent?: string,
    public participants?: string[] | any,
    public statusCode?: string,
    public priority?: string,
    public projectId?: string | any,
    public dateRange?: string[] | any,
  ) {
    super();
  }
}

export enum EStatusLCSC {
  confirmTaskCompletionPending = 'confirmTaskCompletionPending',
  confirmTaskCompletionFulfilled = 'confirmTaskCompletionFulfilled',
  confirmTaskCompletionRejected = 'confirmTaskCompletionRejected',

  restoreTaskPending = 'restoreTaskPending',
  restoreTaskFulfilled = 'restoreTaskFulfilled',
  restoreTaskRejected = 'restoreTaskRejected',

  changeActivityPending = 'changeActivityPending',
  changeActivityFulfilled = 'changeActivityFulfilled',
  changeActivityRejected = 'changeActivityRejected',
}
