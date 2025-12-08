import { Dayjs } from 'dayjs';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, ConstructionModel, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'AdvanceRequest';
const action = {
  ...new Action<AdvanceRequestModel, EStatusAdvanceRequest>(name),
  putSend: createAsyncThunk(name + 'putSend', async (id: string) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${id}/send`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  putReject: createAsyncThunk(
    name + 'putReject',
    async ({ id, values }: { id: string; values: AdvanceRequestHistories }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/${id}/reject`, values);
      return res;
    },
  ),
  putApprove: createAsyncThunk(name + 'putApprove', async (id: string) => {
    const res = await API.put(`${routerLinks(name, 'api')}/${id}/approve`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
};
export const advanceRequestSlice = createSlice(
  new Slice<AdvanceRequestModel, EStatusAdvanceRequest>(action, {}, (builder) => {
    builder
      .addCase(action.putSend.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusAdvanceRequest.putSendPending;
      })
      .addCase(action.putSend.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusAdvanceRequest.putSendFulfilled;
      })
      .addCase(action.putSend.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusAdvanceRequest.putSendRejected;
      })
      .addCase(action.putReject.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusAdvanceRequest.putRejectPending;
      })
      .addCase(action.putReject.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusAdvanceRequest.putRejectFulfilled;
      })
      .addCase(action.putReject.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusAdvanceRequest.putRejectRejected;
      })
      .addCase(action.putApprove.pending, (state) => {
        state.isFormLoading = true;
        state.status = EStatusAdvanceRequest.putApprovePending;
      })
      .addCase(action.putApprove.fulfilled, (state) => {
        state.isFormLoading = false;
        state.status = EStatusAdvanceRequest.putApproveFulfilled;
      })
      .addCase(action.putApprove.rejected, (state) => {
        state.isFormLoading = false;
        state.status = EStatusAdvanceRequest.putApproveRejected;
      });
  }),
);
export const AdvanceRequestFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateAdvanceRequest<AdvanceRequestModel>),
    set: (values: StateAdvanceRequest<AdvanceRequestModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateAdvanceRequest<AdvanceRequestModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: AdvanceRequestModel) => dispatch(action.post({ values })),
    put: (values: AdvanceRequestModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    putSend: (id: string) => dispatch(action.putSend(id)),
    putReject: ({ id, values }: { id: string; values: AdvanceRequestHistories }) =>
      dispatch(action.putReject({ id, values })),
    putApprove: (id: string) => dispatch(action.putApprove(id)),
  };
};
interface StateAdvanceRequest<T> extends State<T, EStatusAdvanceRequest> {
  isFilterVisible?: boolean;
}
export class AdvanceRequestModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public content?: string,
    public constructionId?: string,
    public construction?: ConstructionModel,
    public priorityLevelCode?: 'HIGH' | 'MEDIUM' | 'LOW',
    public priorityLevelName?: 'Cao' | 'Trung bình' | 'Thấp',
    public priorityLevelColor?: 'red' | 'orange' | 'green',
    public dueDate?: Dayjs | string,
    public note?: string,
    public statusCode?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED',
    public statusName?: 'Nháp' | 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Hoàn thành',
    public statusColor?: 'default' | 'orange' | 'blue' | 'red' | 'green',
    public advanceRequestItems?: AdvanceRequestItems[],
    public totalLineAmount?: number,
    public vatPercent?: number,
    public totalAmount?: number,
    public isOverdue?: boolean,
    public advanceRequestHistories?: AdvanceRequestHistories[],
  ) {
    super();
  }
}

export enum EStatusAdvanceRequest {
  putSendPending = 'putSendPending',
  putSendFulfilled = 'putSendFulfilled',
  putSendRejected = 'putSendRejected',
  putRejectPending = 'putRejectPending',
  putRejectFulfilled = 'putRejectFulfilled',
  putRejectRejected = 'putRejectRejected',
  putApprovePending = 'putApprovePending',
  putApproveFulfilled = 'putApproveFulfilled',
  putApproveRejected = 'putApproveRejected',
}

export type AdvanceRequestItems = {
  id?: string;
  lineNumber?: number;
  advancePurpose?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  lineAmount?: number;
  note?: string;
};

export type AdvanceRequestHistories = {
  id?: string;
  action?: string;
  rejectionReason?: string;
  createdOnDate?: string;
  createdByUserName?: string;
};
