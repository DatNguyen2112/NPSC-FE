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

export const PriorityLevelMap: Record<string, { value: string; label: string; color: string }> = {
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
export const TaskStatusMap: Record<string, { value: string; label: string; color: string }> = {
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
export const TaskUsageHistoriesDisplay: Record<string, string> = {
  CreatedTask: 'đã tạo công việc',
  UpdatedTaskInfo: 'đã chỉnh sửa thông tin công việc',
  UpdateSubTask: 'đã chỉnh sửa thông tin công việc con',
  StartTask: 'đã bắt đầu thực hiện công việc',
  DeletedSubtask: 'đã xóa công việc con',
  MarkedSubtaskCompleted: 'đã đánh dấu hoàn thành công việc con',
  UnmarkedSubtaskCompleted: 'đã bỏ đánh dấu hoàn thành công việc con',
  ChangedSubtaskAssignee: 'đã thay đổi nhân sự thực hiện công việc con',
  ChangedApprover: 'đã thay đổi người phê duyệt',
  ChangedAssignee: 'đã thay đổi nhân sự thực hiện công việc',
  SubmittedForApproval: 'đã gửi duyệt công việc',
  MarkedAsFailed: 'đã đánh dấu công việc',
  MarkedAsPassed: 'đã đánh dấu công việc',
  UploadedAttachment: 'đã tải lên file đính kèm',
  UploadedSubtaskAttachment: 'đã tải lên file đính kèm công việc con',
};
export const TaskFilterFieldNameMap: Record<string, string> = {
  fullTextSearch: 'Từ khoá',
  status: 'Trạng thái',
  priorityLevel: 'Độ ưu tiên',
  dueDateRange: 'Hạn chót',
  constructionId: 'Dự án',
  userIdList: 'Người tham gia',
};
const name = 'Task';
const action = {
  ...new Action<TaskModel, EStatusTask>(name),
  getTaskConstruction: createAsyncThunk(
    name + 'getTaskConstruction',
    async ({ params, constructionId }: { params: QueryParams; constructionId: string }) =>
      await API.get<Pagination<TaskModel>>(`${routerLinks(name, 'api')}/by-construction/${constructionId}`, params),
  ),
  getAnalyzeTaskEachStage: createAsyncThunk(
    name + 'getAnalyzeTaskEachStage',
    async ({ idTemplateStage, constructionId }: { idTemplateStage: string; constructionId: string }) =>
      await API.get<Pagination<TaskModel>>(
        `${routerLinks(name, 'api')}/analyze-each-stage/${idTemplateStage}/${constructionId}`,
      ),
  ),
  putStatus: createAsyncThunk(name + 'putStatus', async ({ values }: { values: TaskModel }) => {
    const res = await API.put<TaskModel>(`${routerLinks(name, 'api')}/${values?.id}/status/${values.status}`, values);
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
    async ({ ids, status, description }: { ids: string[]; status: string; description: string }) => {
      const res = await API.put<TaskModel[]>(`${routerLinks(name, 'api')}/status-many `, { ids, status, description });
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
export const taskSlice = createSlice(
  new Slice<TaskModel, EStatusTask>(action, {}, (builder) => {
    builder
      .addCase(action.putStatus.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTask.putStatusPending;
      })
      .addCase(action.putStatus.fulfilled, (state: StateTask<TaskModel>, action) => {
        state.isLoading = false;
        state.status = EStatusTask.putStatusFulfilled;
      })
      .addCase(action.putStatus.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.putStatusRejected;
      })
      .addCase(action.deleteMany.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTask.deleteManyPending;
      })
      .addCase(action.deleteMany.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.deleteManyFulfilled;
      })
      .addCase(action.deleteMany.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.deleteManyRejected;
      })
      .addCase(action.putStatusMany.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTask.putStatusManyPending;
      })
      .addCase(action.putStatusMany.fulfilled, (state: StateTask<TaskModel>, action) => {
        state.isLoading = false;
        state.status = EStatusTask.putStatusManyFulfilled;
      })
      .addCase(action.putStatusMany.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.putStatusManyRejected;
      })
      .addCase(action.getTaskConstruction.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTask.getTaskConstructionPending;
      })
      .addCase(action.getTaskConstruction.fulfilled, (state, action) => {
        const { ...res } = action.payload;
        state.isLoading = false;
        state.paginationTask = res.data;
        state.status = EStatusTask.getTaskConstructionFulfilled;
      })
      .addCase(action.getTaskConstruction.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.getTaskConstructionRejected;
      })
      .addCase(action.getMaxPriorityOrder.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTask.getMaxPriorityOrderPending;
      })
      .addCase(action.getMaxPriorityOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.maxPriorityOrder = action.payload.data ?? 0;
        state.status = EStatusTask.getMaxPriorityOrderFulfilled;
      })
      .addCase(action.getMaxPriorityOrder.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.getMaxPriorityOrderRejected;
      })
      .addCase(action.getStatusSummary.pending, (state) => {
        state.status = EStatusTask.getStatusSummaryPending;
      })
      .addCase(action.getStatusSummary.fulfilled, (state, action) => {
        state.statusSummary = action.payload.data;
        state.status = EStatusTask.getStatusSummaryFulfilled;
      })
      .addCase(action.getStatusSummary.rejected, (state) => {
        state.status = EStatusTask.getStatusSummaryRejected;
      })
      .addCase(action.getAnalyzeTaskEachStage.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTask.getAnalyzeTaskEachStagePending;
      })
      .addCase(action.getAnalyzeTaskEachStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyzeOverviewTask = action.payload.data;
        state.status = EStatusTask.getAnalyzeTaskEachStageFulfilled;
      })
      .addCase(action.getAnalyzeTaskEachStage.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.getAnalyzeTaskEachStageRejected;
      })
      .addCase(action.getOverviewSummary.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTask.getOverviewSummaryPending;
      })
      .addCase(action.getOverviewSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overviewSummary = action.payload.data;
        state.status = EStatusTask.getOverviewSummaryFulfilled;
      })
      .addCase(action.getOverviewSummary.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTask.getOverviewSummaryRejected;
      });
  }),
);
export const TaskFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateTask<TaskModel>),
    set: (values: StateTask<TaskModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateTask<TaskModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: TaskModel) => dispatch(action.post({ values })),
    put: (values: TaskModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    putStatus: (values: TaskModel) => dispatch(action.putStatus({ values })),
    deleteMany: (ids: string[]) => dispatch(action.deleteMany({ ids })),
    putStatusMany: (ids: string[], status: string, description: string = '') =>
      dispatch(action.putStatusMany({ ids, status, description })),
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
interface StateTask<T> extends State<T, EStatusTask> {
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
  paginationTask?: Pagination<TaskModel>;
  autoSubmit?: boolean;
  statusSummary?: Record<string, number>;
  overviewSummary?: Record<string, number>;
  analyzeOverviewTask?: any;
  nameStage?: string;
  descriptionStage?: string;
  expiredDateStage?: string;

  selectedRowKeys?: string[];
}
export class TaskModel extends CommonEntity {
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
    public subTasks?: SubTask[],
    public approvers?: TaskUserModel[],
    public executors?: TaskUserModel[],
    public construction?: ConstructionModel,
    public attachments?: AttachmentModel[],
    public taskUsageHistories?: TaskUsageHistoryModel[],
    public constructionId?: string,
    public type?: string,
  ) {
    super();
  }
}

export enum EStatusTask {
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

export class SubTask extends CommonEntity {
  constructor(
    public id: string,
    public name: string,
    public isCompleted?: boolean,
    public dueDate?: string,
    public attachments?: AttachmentModel[],
  ) {
    super();
  }
}
export class TaskUserModel {
  constructor(
    public id: string,
    public idm_User: UserModal,
  ) {}
}
