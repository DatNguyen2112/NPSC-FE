import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, Pagination, QueryParams } from '@models';
import {
  Action,
  AttachmentModel,
  ConstructionModel,
  Slice,
  State,
  TaskUsageHistoryModel,
  useAppDispatch,
  UserModal,
  useTypedSelector,
} from '@store';
import { API, routerLinks } from '@utils';
import { Typography } from 'antd';
import { customMessage } from 'src';

export const PriorityPersonalLevelMap: Record<string, { value: string; label: string; color: string }> = {
  High: {
    label: 'Cao',
    color: 'red',
    value: 'High',
  },
  Medium: {
    label: 'Trung bình',
    color: 'orange',
    value: 'Medium',
  },
  Low: {
    label: 'Thấp',
    color: 'green',
    value: 'Low',
  },
};
export const TaskPersonalStatusMap: Record<string, { value: string; label: string; color: string }> = {
  NotStarted: {
    label: 'Chưa bắt đầu',
    color: 'default',
    value: 'NotStarted',
  },
  InProgress: {
    label: 'Đang thực hiện',
    color: 'blue',
    value: 'InProgress',
  },
  Failed: {
    label: 'Không đạt',
    color: 'red',
    value: 'Failed',
  },
  Passed: {
    label: 'Đạt',
    color: 'green',
    value: 'Passed',
  },
};
const name = 'TaskPersonal';
const action = {
  ...new Action<TaskPersonalModel, EStatusTaskPersonal>(name),
  getTaskConstruction: createAsyncThunk(
    name + 'getTaskConstruction',
    async ({ params, constructionId }: { params: QueryParams; constructionId: string }) =>
      await API.get<Pagination<TaskPersonalModel>>(
        `${routerLinks(name, 'api')}/by-construction/${constructionId}`,
        params,
      ),
  ),
  getAnalyzeTaskEachStage: createAsyncThunk(
    name + 'getAnalyzeTaskEachStage',
    async ({ idTemplateStage, constructionId }: { idTemplateStage: string; constructionId: string }) =>
      await API.get<Pagination<TaskPersonalModel>>(
        `${routerLinks(name, 'api')}/analyze-each-stage/${idTemplateStage}/${constructionId}`,
      ),
  ),
  putStatus: createAsyncThunk(name + 'putStatus', async ({ values }: { values: TaskPersonalModel }) => {
    const res = await API.put<TaskPersonalModel>(
      `${routerLinks(name, 'api')}/${values?.id}/status/${values.status}`,
      values,
    );
    if (res.data?.status === 'Passed')
      customMessage.success({
        type: 'success',
        content: (
          <Typography.Text>
            Đã duyệt
            <Typography.Text className="text-green-500"> Đạt </Typography.Text> công việc thành công.
          </Typography.Text>
        ),
      });
    else if (res.data?.status === 'Failed')
      customMessage.success({
        type: 'success',
        content: (
          <Typography.Text>
            Đã duyệt
            <Typography.Text className="text-red-500"> Không đạt </Typography.Text> công việc thành công.
          </Typography.Text>
        ),
      });
    else if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  deleteMany: createAsyncThunk(name + 'deleteMany', async ({ ids }: { ids: string[] }) => {
    const res = await API.delete(`${routerLinks(name, 'api')}/many/?${ids.map((id) => `ids=${id}`).join('&')}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  putStatusMany: createAsyncThunk(
    name + 'putStatusMany',
    async ({ ids, status }: { ids: string[]; status: string }) => {
      const res = await API.put<TaskPersonalModel[]>(`${routerLinks(name, 'api')}/status-many `, {
        ids,
        status,
      });
      if (Number(res?.data?.length) > 0) {
        if (res.data?.[0]?.status === 'PendingApproval')
          customMessage.success({
            type: 'success',
            content: <Typography.Text>Đã gửi duyệt {res.data?.length} công việc thành công</Typography.Text>,
          });
        else if (res.data?.[0]?.status === 'Passed')
          customMessage.success({
            type: 'success',
            content: (
              <Typography.Text>
                Đã duyệt
                <Typography.Text className="text-green-500"> Đạt </Typography.Text> {res.data?.length} công việc thành
                công.
              </Typography.Text>
            ),
          });
        else if (res.data?.[0]?.status === 'Failed')
          customMessage.success({
            type: 'success',
            content: (
              <Typography.Text>
                Đã duyệt
                <Typography.Text className="text-red-500"> Không đạt </Typography.Text> {res.data?.length} công việc
                thành công.
              </Typography.Text>
            ),
          });
        else if (res.message) customMessage.success({ type: 'success', content: res.message });
      }

      return res;
    },
  ),
  getMaxPriorityOrder: createAsyncThunk(
    name + 'getMaxPriorityOrder',
    ({ constructionId, idTemplateStage }: { constructionId: string; idTemplateStage: string }) =>
      API.get<number>(`${routerLinks(name, 'api')}/max-priority-order/${constructionId}/${idTemplateStage}`),
  ),
  getStatusSummary: createAsyncThunk(
    name + '/getStatusSummary',
    async (params: QueryParams) =>
      await API.get<Record<string, number>>(`${routerLinks(name, 'api')}/status-summary`, params),
  ),
  getOverviewSummary: createAsyncThunk(
    name + '/getOverviewSummary',
    async (params: QueryParams) =>
      await API.get<Record<string, number>>(`${routerLinks(name, 'api')}/overview-summary`, params),
  ),
};
export const taskPersonalSlice = createSlice(
  new Slice<TaskPersonalModel, EStatusTaskPersonal>(action, {}, (builder) => {
    builder
      .addCase(action.putStatus.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskPersonal.putStatusPending;
      })
      .addCase(action.putStatus.fulfilled, (state: StateTaskPersonal<TaskPersonalModel>, action) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.putStatusFulfilled;
      })
      .addCase(action.putStatus.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.putStatusRejected;
      })
      .addCase(action.deleteMany.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskPersonal.deleteManyPending;
      })
      .addCase(action.deleteMany.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.deleteManyFulfilled;
      })
      .addCase(action.deleteMany.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.deleteManyRejected;
      })
      .addCase(action.putStatusMany.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskPersonal.putStatusManyPending;
      })
      .addCase(action.putStatusMany.fulfilled, (state: StateTaskPersonal<TaskPersonalModel>, action) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.putStatusManyFulfilled;
      })
      .addCase(action.putStatusMany.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.putStatusManyRejected;
      })
      .addCase(action.getTaskConstruction.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskPersonal.getTaskConstructionPending;
      })
      .addCase(action.getTaskConstruction.fulfilled, (state, action) => {
        const { ...res } = action.payload;
        state.isLoading = false;
        state.paginationTask = res.data;
        state.status = EStatusTaskPersonal.getTaskConstructionFulfilled;
      })
      .addCase(action.getTaskConstruction.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.getTaskConstructionRejected;
      })
      .addCase(action.getMaxPriorityOrder.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskPersonal.getMaxPriorityOrderPending;
      })
      .addCase(action.getMaxPriorityOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maxPriorityOrder = action.payload.data ?? 0;
        state.status = EStatusTaskPersonal.getMaxPriorityOrderFulfilled;
      })
      .addCase(action.getMaxPriorityOrder.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.getMaxPriorityOrderRejected;
      })
      .addCase(action.getStatusSummary.pending, (state) => {
        state.status = EStatusTaskPersonal.getStatusSummaryPending;
      })
      .addCase(action.getStatusSummary.fulfilled, (state, action) => {
        state.statusSummary = action.payload.data;
        state.status = EStatusTaskPersonal.getStatusSummaryFulfilled;
      })
      .addCase(action.getStatusSummary.rejected, (state) => {
        state.status = EStatusTaskPersonal.getStatusSummaryRejected;
      })
      .addCase(action.getAnalyzeTaskEachStage.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskPersonal.getAnalyzeTaskEachStagePending;
      })
      .addCase(action.getAnalyzeTaskEachStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyzeOverviewTask = action.payload.data;
        state.status = EStatusTaskPersonal.getAnalyzeTaskEachStageFulfilled;
      })
      .addCase(action.getAnalyzeTaskEachStage.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.getAnalyzeTaskEachStageRejected;
      })
      .addCase(action.getOverviewSummary.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskPersonal.getOverviewSummaryPending;
      })
      .addCase(action.getOverviewSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overviewSummary = action.payload.data;
        state.status = EStatusTaskPersonal.getOverviewSummaryFulfilled;
      })
      .addCase(action.getOverviewSummary.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskPersonal.getOverviewSummaryRejected;
      });
  }),
);
export const TaskPersonalFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateTaskPersonal<TaskPersonalModel>),
    set: (values: StateTaskPersonal<TaskPersonalModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateTaskPersonal<TaskPersonalModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: TaskPersonalModel) => dispatch(action.post({ values })),
    put: (values: TaskPersonalModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    putStatus: (values: TaskPersonalModel) => dispatch(action.putStatus({ values })),
    deleteMany: (ids: string[]) => dispatch(action.deleteMany({ ids })),
    putStatusMany: (ids: string[], status: string) => dispatch(action.putStatusMany({ ids, status })),
    getTaskConstruction: (params: QueryParams, constructionId: string) =>
      dispatch(action.getTaskConstruction({ params, constructionId })),
    getAnalyzeTaskEachStage: (idTemplateStage: string, constructionId: string) =>
      dispatch(action.getAnalyzeTaskEachStage({ idTemplateStage, constructionId })),
    getMaxPriorityOrder: (constructionId: string, idTemplateStage: string) =>
      dispatch(action.getMaxPriorityOrder({ constructionId, idTemplateStage })),
    getStatusSummary: (params: QueryParams) => dispatch(action.getStatusSummary(params)),
    getOverviewSummary: (params: QueryParams) => dispatch(action.getOverviewSummary(params)),
  };
};
interface StateTaskPersonal<T> extends State<T, EStatusTaskPersonal> {
  isFilter?: boolean;
  maxPriorityOrder?: number;
  selectedRowKeysTable?: string[];
  selectedRows?: T[];
  isEditTask?: boolean;
  activeStep?: number;
  isQuickUpdate?: boolean;
  isEditQuickUpdate?: boolean;
  // Danh sách công việc con
  listSubTasksExecutor?: [] | any;
  isChooseUserManySubTaskModal?: boolean;
  indexSubTask?: number;
  // Thêm người phê duyệt
  isChooseUserManyParticipantsModal?: boolean;
  isChooseUserManyPresentModal?: boolean;
  checkedListParticipants?: [] | any;
  checkedListPresent?: [] | any;
  isCheckAll?: boolean;
  arrChooseParticipants?: [] | any;
  arrChoosePresent?: [] | any;
  listParticipants?: [] | any;
  listParticipantsArr?: [] | any;
  listPresent?: [] | any;
  // Danh sách người phê duyêt
  listExecutor?: [] | any;
  // Danh sách nhân sự thực hiện
  listApprover?: [] | any;
  listApproverArr?: [] | any;
  isChooseUserManyApproverModal?: boolean;
  listItems?: [] | any;
  paginationTask?: Pagination<TaskPersonalModel>;
  autoSubmit?: boolean;
  statusSummary?: Record<string, number>;
  overviewSummary?: Record<string, number>;
  analyzeOverviewTask?: any;
  nameStage?: string;
  descriptionStage?: string;
  expiredDateStage?: string;
  isChooseFast?: boolean;

  selectedRowKeys?: string[];
}
export class TaskPersonalModel extends CommonEntity {
  constructor(
    public id: string,
    public status: string,
    public priorityOrder?: number,
    public priorityLevel?: string,
    public code?: string,
    public name?: string,
    public startDateTime?: string,
    public endDateTime?: string,
    public description?: string,
    public subTaskPersonals?: SubTaskPersonal[],
    public taskType?: string,
    public taskTypeModel?: any,
    public type?: string,
  ) {
    super();
  }
}

export enum EStatusTaskPersonal {
  getTaskConstructionPending = 'getTaskConstructionPending',
  getTaskConstructionFulfilled = 'pgetTaskConstructionFulfilled',
  getTaskConstructionRejected = 'getTaskConstructionRejected',

  putStatusPending = 'putStatusPending',
  putStatusFulfilled = 'putStatusFulfilled',
  putStatusRejected = 'putStatusRejected',

  deleteManyPending = 'deleteManyPending',
  deleteManyFulfilled = 'deleteManyFulfilled',
  deleteManyRejected = 'deleteManyRejected',

  putStatusManyPending = 'putStatusManyPending',
  putStatusManyFulfilled = 'putStatusManyFulfilled',
  putStatusManyRejected = 'putStatusManyRejected',

  getMaxPriorityOrderPending = 'getMaxPriorityOrderPending',
  getMaxPriorityOrderFulfilled = 'getMaxPriorityOrderFulfilled',
  getMaxPriorityOrderRejected = 'getMaxPriorityOrderRejected',

  getStatusSummaryPending = 'getStatusSummaryPending',
  getStatusSummaryFulfilled = 'getStatusSummaryFulfilled',
  getStatusSummaryRejected = 'getStatusSummaryRejected',

  getOverviewSummaryPending = 'getOverviewSummaryPending',
  getOverviewSummaryFulfilled = 'getOverviewSummaryFulfilled',
  getOverviewSummaryRejected = 'getOverviewSummaryRejected',

  getAnalyzeTaskEachStagePending = 'getAnalyzeTaskEachStagePending',
  getAnalyzeTaskEachStageFulfilled = 'getAnalyzeTaskEachStageFulfilled',
  getAnalyzeTaskEachStageRejected = 'getAnalyzeTaskEachStageRejected',
}

export class SubTaskPersonal extends CommonEntity {
  constructor(
    public id: string,
    public name: string,
    public isCompleted?: boolean,
    public dueDate?: string,
  ) {
    super();
  }
}
