import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit';

import { CommonEntity, Pagination, QueryParams } from '@models';
import { Action, ConstructionModel, QuanLyNguoiDung, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { Dayjs } from 'dayjs';
import { API, routerLinks } from '@utils';
import { customMessage } from '../../index';

const name = 'IssueManagement';
const action = {
  ...new Action<IssueModel, IssueStatus>(name),
  cancelIssue: createAsyncThunk(
    name + 'cancelIssue',
    async ({id, reasonCancel} : {id: string, reasonCancel: string}) => {
      const res = await API.put(`${routerLinks(name, 'api')}/deactivate-issue?id=${id}&reasonCancel=${reasonCancel}`);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
  resolveIssue: createAsyncThunk(
    name + 'resolveIssue',
    async ({id, resolveModel} : {id: string, resolveModel: {contentResolve: string, attachmentsResolve: any }}) => {
      const res = await API.put(`${routerLinks(name, 'api')}/resolve-issue?id=${id}`,resolveModel);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
  getActivityLogIssue: createAsyncThunk(
    name + 'getActivityLogIssue',
    async ({id}: {id : string}) => {
      return await API.get(`${routerLinks(name, 'api')}/activity-log?id=${id}`);
    },
  ),
  getIssueByStatus: createAsyncThunk(
    name + 'getIssueByStatus  ',
    async () => {
      return await API.get(`${routerLinks(name, 'api')}/countIssueByStatus`);
    },
  ),
  reopenIssue: createAsyncThunk(
    name + 'reopenIssue',
    async ({id, reasonOpen} : {id: string, reasonOpen: string}) => {
      const res = await API.put(`${routerLinks(name, 'api')}/reopen-issue?id=${id}&reasonOpen=${reasonOpen}`);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
};
export const issueManagementSlice = createSlice(
  new Slice<IssueModel, IssueStatus>(
    action,
    {
      selectedRows: [],
    },
    (builder) => {
      builder
        .addCase(action.cancelIssue.pending, (state) => {
          state.isLoading = true;
          state.status = IssueStatus.cancelIssuePending;
        })
        .addCase(action.cancelIssue.fulfilled, (state: StateIssue<IssueModel>, action: any) => {
          state.isLoading = false;
          state.status = IssueStatus.cancelIssueFulfilled;
          state.thongKe = action.payload.data;
        })
        .addCase(action.cancelIssue.rejected, (state) => {
          state.isLoading = false;
          state.status = IssueStatus.cancelIssueRejected;
        })
        .addCase(action.resolveIssue.pending, (state) => {
          state.isLoading = true;
          state.status = IssueStatus.resolveIssuePending;
        })
        .addCase(action.resolveIssue.fulfilled, (state: StateIssue<IssueModel>, action: any) => {
          state.isLoading = false;
          state.status = IssueStatus.resolveIssueFulfilled;
          state.thongKe = action.payload.data;
        })
        .addCase(action.resolveIssue.rejected, (state) => {
          state.isLoading = false;
          state.status = IssueStatus.resolveIssueRejected;
        })
        .addCase(action.reopenIssue.pending, (state) => {
          state.isLoading = true;
          state.status = IssueStatus.reopenIssuePending;
        })
        .addCase(action.reopenIssue.fulfilled, (state: StateIssue<IssueModel>, action: any) => {
          state.isLoading = false;
          state.status = IssueStatus.reopenIssueFulfilled;
        })
        .addCase(action.reopenIssue.rejected, (state) => {
          state.isLoading = false;
          state.status = IssueStatus.reopenIssueRejected;
        })
        .addCase(action.getActivityLogIssue.pending, (state) => {
          state.isLoading = true;
          state.status = IssueStatus.getActivityLogPending;
        })
        .addCase(action.getActivityLogIssue.fulfilled, (state: StateIssue<IssueModel>, action: any) => {
          state.isLoading = false;
          state.status = IssueStatus.getActivityLogFulfilled;
          state.activityLogs = action.payload.data as Draft<Pagination<IssueActivityLog>>;
        })
        .addCase(action.getActivityLogIssue.rejected, (state) => {
          state.isLoading = false;
          state.status = IssueStatus.getActivityLogRejected;
        })
        .addCase(action.getIssueByStatus.pending, (state) => {
          state.isLoading = true;
          state.status = IssueStatus.getIssueByStatusPending;
        })
        .addCase(action.getIssueByStatus.fulfilled, (state: StateIssue<IssueModel>, action: any) => {
          state.isLoading = false;
          state.status = IssueStatus.getIssueByStatusFulfilled;
          state.countByStatus = action.payload.data;
        })
        .addCase(action.getIssueByStatus.rejected, (state) => {
          state.isLoading = false;
          state.status = IssueStatus.getIssueByStatusRejected;
        })
      ;
    },
  ),
);
export const IssueManagementFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateIssue<IssueModel>),
    set: (values: StateIssue<IssueModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateIssue<IssueModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: IssueFormModel) => dispatch(action.post({ values })),
    put: (values: IssueModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    cancelIssue:({id ,reasonCancel} : {id: string, reasonCancel: string}) => dispatch(action.cancelIssue({ id, reasonCancel })),
    reopenIssue:({id ,reasonOpen} : {id: string, reasonOpen: string}) => dispatch(action.reopenIssue({ id, reasonOpen })),
    resolveIssue:({id, resolveModel} : {id: string, resolveModel: {contentResolve: string, attachmentsResolve: any }}) => dispatch(action.resolveIssue({ id, resolveModel })),
    getActivityLogIssue:({id} : {id: string}) => dispatch(action.getActivityLogIssue({ id })),
    getIssueByStatus:() => dispatch(action.getIssueByStatus()),
  };
};
interface StateIssue<T> extends State<T, IssueStatus> {
  selectedRows?: T[];
  isFilter?: boolean;
  dateRange?: [start: Dayjs | null | undefined, end: Dayjs | null | undefined];
  expiryDate?: [start: Dayjs | null | undefined, end: Dayjs | null | undefined];
  activeKey?: string;
  isShowCancelModel?: boolean;
  isShowReopenModel?: boolean;
  isShowResolveModel?: boolean;
  isViewCancelModel?: boolean;
  isViewReopenModel?: boolean;
  isViewResolveModel?: boolean;
  activityLogs?: any
  countByStatus?: any

}
export class IssueModel extends CommonEntity {
  constructor(
    public id?: string,
    public code?: string,
    public expiryDate?: string,
    public priorityLevel?: string,
    public content?: string,
    public description?: string,
    public status?: string,
    public constructionId?: string,
    public reasonCancel?: string,
    public contentResolve?: string,
    public reasonReopen?: string,
    public construction?: ConstructionModel,
    public user?: QuanLyNguoiDung,
    public totalAmount?: number,
    public totalReceiptAmount?: number,
    public remainingAmount?: number,
    public totalPaymentAmount?: number,
    public profitLossAmount?: number,
    public startDate?: string,
    public endDate?: string,
    public projectName?: string,
    public activityLogs?:string,
    public customer?: string,
    public vatAmount?: number,
    public lineNumber?: number,
    public statusCode?: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    public note?: string,
  ) {
    super();
  }
}

export enum IssueStatus {
  cancelIssuePending = 'cancelIssuePending',
  cancelIssueFulfilled = 'cancelIssueFulfilled',
  cancelIssueRejected = 'cancelIssueRejected',
  resolveIssuePending = 'resolveIssuePending',
  resolveIssueFulfilled = 'resolveIssueFulfilled',
  resolveIssueRejected = 'resolveIssueRejected',
  reopenIssuePending = 'reopenIssuePending',
  reopenIssueFulfilled = 'reopenIssueFulfilled',
  reopenIssueRejected = 'reopenIssueRejected',
  getActivityLogPending = 'getActivityLogPending',
  getActivityLogFulfilled = 'getActivityLogFulfilled',
  getActivityLogRejected = 'getActivityLogRejected',
  getIssueByStatusPending = 'getIssueByStatusPending',
  getIssueByStatusFulfilled = 'getIssueByStatusFulfilled',
  getIssueByStatusRejected = 'getIssueByStatusRejected',
}
export type IssueActivityLog = {
  id?: string;
  userName?: string;
  avatarUrl?: string;
  description?: string;
  codeLinkDescription?: string;
  orderId?: string;
  constructionId?: string;
  createdByUserName?: string;
  createdOnDate?: string;
  lastModifiedOnDate?: string;
}
export type IssueQueryModel = {
  code?: string
  createById?: string
  dateRange?: any[]
  expiryDate?: any[]
  userId?: string
  status?: string
  FullTextSearch?: string
  priorityLevel?: string
  activeTab?: string
  constructionId?: string
  createdByUserId?: string
}
export type IssueFormModel = {
  id?: string
  positionCode?: string
  expiryDate?: string
  userId?: string
  status?: string
  description?: string
  priorityLevel?: string
  content?: string
  constructionId?: string
  attachments?: any
}
