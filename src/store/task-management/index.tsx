import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State, AttachmentModel, CodeTypeModel } from '@store';
import { CommonEntity, EStatusState, Pagination, QueryParams, Responses } from '@models';
import { API, routerLinks } from '@utils';
import post from '@column/post';

const name = 'TaskManagement';
const action = {
  ...new Action<TaskManagementModel, EStatusTaskManagement>(name),
  getTaskSummary: createAsyncThunk(
    name + '/getTaskSummary',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/summary`, params),
  ),
  postMultiple: createAsyncThunk(
    name + '/multiple',
    async ({ values }: { values: TaskManagementModel[] }) => {
      const res = await API.post(`${routerLinks(name, 'api')}/multiple`, values);
      return res;
    },
  ),

  postAssignee: createAsyncThunk(
    name + '/postAssignee',
    async ({ values }: { values: TaskAssigneeModel }) => {
      const res = await API.post(`${routerLinks(name, 'api')}/assignee`, values);
      return res;
    },
  ),
  getPageAssignee: createAsyncThunk(
    name + '/getPageAssignee',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/assignee`, params),
  ),
  getAssignee: createAsyncThunk(
    name + '/getAssignee',
    async ({ id, values }: { id: string; values: TaskAssigneeModel }) => {
      const res = await API.get(`${routerLinks(name, 'api')}/assignee/${id}`, values);
      return res;
    },
  ),
  deleteAssignee: createAsyncThunk(
    name + '/deleteAssignee',
    async ({ id }: { id: string }) => {
      const res = await API.delete(`${routerLinks(name, 'api')}/assignee/${id}`);
      return res;
    }
  ),

  postComment: createAsyncThunk(
    name + '/postComment',
    async ({ values }: { values: TaskCommentModel }) => {
      const res = await API.post(`${routerLinks(name, 'api')}/comment`, values);
      return res;
    },
  ),
  getPageComment: createAsyncThunk(
    name + '/getPageComment',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/comment`, params),
  ),
  getComment: createAsyncThunk(
    name + '/getComment',
    async ({ id, values }: { id: string; values: TaskCommentModel }) => {
      const res = await API.get(`${routerLinks(name, 'api')}/comment/${id}`, values);
      return res;
    },
  ),
  putComment: createAsyncThunk(
    name + '/putComment',
    async ({ values }: { values: TaskCommentModel }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/comment/${values.id}`, values);
      return res;
    },
  ),
  deleteComment: createAsyncThunk(
    name + '/deleteComment',
    async ({ id }: { id: string }) => {
      const res = await API.delete(`${routerLinks(name, 'api')}/comment/${id}`);
      return res;
    },
  ),

  postHistory: createAsyncThunk(
    name + '/postHistory',
    async ({ values }: { values: TaskHistoryModel }) => {
      const res = await API.post(`${routerLinks(name, 'api')}/history`, values);
      return res;
    },
  ),
  getPageHistory: createAsyncThunk(
    name + '/getPageHistory',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/history`, params),
  ),
  getHistory: createAsyncThunk(
    name + '/getHistory',
    async ({ id, values }: { id: string; values: TaskHistoryModel }) => {
      const res = await API.get(`${routerLinks(name, 'api')}/history/${id}`, values);
      return res;
    },
  ),

  postMileStone: createAsyncThunk(
    name + '/postMileStone',
    async ({ values }: { values: TaskMileStoneModel }) => {
      const res = await API.post(`${routerLinks(name, 'api')}/milestone`, values);
      return res;
    },
  ),
  getPageMileStone: createAsyncThunk(
    name + '/getPageMileStone',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/milestone`, params),
  ),
  getMileStone: createAsyncThunk(
    name + '/getMileStone',
    async ({ id, values }: { id: string; values: TaskMileStoneModel }) => {
      const res = await API.get(`${routerLinks(name, 'api')}/milestone/${id}`, values);
      return res;
    },
  ),
  putMileStone: createAsyncThunk(
    name + '/putMileStone',
    async ({ values }: { values: TaskMileStoneModel }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/milestone/${values.id}`, values);
      return res;
    },
  ),
  deleteMileStone: createAsyncThunk(
    name + '/deleteMileStone',
    async ({ id }: { id: string }) => {
      const res = await API.delete(`${routerLinks(name, 'api')}/milestone/${id}`);
      return res;
    },
  ),
};

export const taskManagementSlice = createSlice(
  new Slice<TaskManagementModel, EStatusTaskManagement>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      //Task Management
      .addCase(action.getTaskSummary.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getTaskSummaryPending;
      })
      .addCase(action.getTaskSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getTaskSummaryFulfilled;
        state.totalTasks = action.payload.data;
      })
      .addCase(action.getTaskSummary.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getTaskSummaryRejected;
      })
      .addCase(action.postMultiple.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.postMultiplePending;
      })
      .addCase(action.postMultiple.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.postMultipleFulfilled;
        state.postMultiple = action.payload.data;
      })
      .addCase(action.postMultiple.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.postMultipleRejected;
      })
      // Assignee
      .addCase(action.getAssignee.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getAssigneePending;
      })
      .addCase(action.getAssignee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getAssigneeFulfilled;
        state.taskAssignees = action.payload.data;
      })
      .addCase(action.getAssignee.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getAssigneeRejected;
      })

      .addCase(action.getPageAssignee.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getAssigneePending;
      })
      .addCase(action.getPageAssignee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getAssigneeFulfilled;
        state.taskAssignees = action.payload.data;
      })
      .addCase(action.getPageAssignee.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getAssigneeRejected;
      })

      .addCase(action.postAssignee.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.postAssigneePending;
      })
      .addCase(action.postAssignee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.postAssigneeFulfilled;
        state.taskAssignees = action.payload.data;
      })
      .addCase(action.postAssignee.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.postAssigneeRejected;
      })

      .addCase(action.deleteAssignee.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.deleteAssigneePending;
      })
      .addCase(action.deleteAssignee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.deleteAssigneeFulfilled;
        state.taskAssignees = action.payload.data;
      })
      .addCase(action.deleteAssignee.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.deleteAssigneeRejected;
      })
      // Comment
      .addCase(action.postComment.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.postPageCommentPending;
      })
      .addCase(action.postComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.postPageCommentFulfilled;
        state.taskComments = action.payload.data;
      })
      .addCase(action.postComment.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.postPageCommentRejected;
      })

      .addCase(action.getPageComment.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getPageCommentPending;
      })
      .addCase(action.getPageComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getPageCommentFulfilled;
        state.taskComments = action.payload.data;
      })
      .addCase(action.getPageComment.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getPageCommentRejected;
      })

      .addCase(action.getComment.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getCommentPending;
      })
      .addCase(action.getComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getCommentFulfilled;
        state.taskComments = action.payload.data;
      })
      .addCase(action.getComment.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getCommentRejected;
      })

      .addCase(action.deleteComment.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.deleteCommentPending;
      })
      .addCase(action.deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.deleteCommentFulfilled;
        state.taskComments = action.payload.data;
      })
      .addCase(action.deleteComment.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.deleteCommentRejected;
      })
      // History
      .addCase(action.getPageHistory.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getPageHistoryPending;
      })
      .addCase(action.getPageHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getPageHistoryFulfilled;
        state.taskHistories = action.payload.data;
      })
      .addCase(action.getPageHistory.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getPageHistoryRejected;
      })

      .addCase(action.getHistory.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getHistoryPending;
      })
      .addCase(action.getHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getHistoryFulfilled;
        state.taskHistories = action.payload.data;
      })
      .addCase(action.getHistory.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getHistoryRejected;
      })
      // MileStone
      .addCase(action.getPageMileStone.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getPageMileStonePending;
      })
      .addCase(action.getPageMileStone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getPageMileStoneFulfilled;
        state.milestones = action.payload.data;
      })
      .addCase(action.getPageMileStone.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getPageMileStoneRejected;
      })

      .addCase(action.getMileStone.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.getMileStonePending;
      })
      .addCase(action.getMileStone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getMileStoneFulfilled;
        state.milestones = action.payload.data;
      })
      .addCase(action.getMileStone.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.getMileStoneRejected;
      })

      .addCase(action.deleteMileStone.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskManagement.deleteMileStonePending;
      })
      .addCase(action.deleteMileStone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.deleteMileStoneFulfilled;
        state.milestones = action.payload.data;
      })
      .addCase(action.deleteMileStone.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskManagement.deleteMileStoneRejected;
      });
  }),
);
export const TaskManagementFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateTaskManagement<TaskManagementViewModel>),
    set: (values: StateTaskManagement<TaskManagementModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
                id,
                keyState = 'isVisible',
              }: {
      id: any;
      keyState?: keyof StateTaskManagement<TaskManagementViewModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: TaskManagementModel) => dispatch(action.post({ values })),
    put: (values: TaskManagementModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getTaskSummary: (params: QueryParams) => dispatch(action.getTaskSummary(params)),
    postMultiple: (values: TaskManagementModel[]) => dispatch(action.postMultiple({ values })),

    postAssignee: (values: TaskAssigneeModel) => dispatch(action.postAssignee({ values })),
    getPageAssignee: (params: QueryParams) => dispatch(action.getPageAssignee(params)),
    getAssignee: (id: string) => dispatch(action.getAssignee({ id, values: {} as TaskAssigneeModel })),
    deleteAssignee: (id: string) => dispatch(action.deleteAssignee({ id })),

    postComment: (values: TaskCommentModel) => dispatch(action.postComment({ values })),
    getPageComment: (params: QueryParams) => dispatch(action.getPageComment(params)),
    getComment: (id: string) => dispatch(action.getComment({ id, values: {} as TaskCommentModel })),
    deleteComment: (id: string) => dispatch(action.deleteComment({ id })),

    getPageHistory: (params: QueryParams) => dispatch(action.getPageHistory(params)),
    getHistory: (id: string) => dispatch(action.getHistory({ id, values: {} as TaskHistoryModel })),

    getPageMilestone: (params: QueryParams) => dispatch(action.getPageMileStone(params)),
    getMileStone: (id: string) => dispatch(action.getMileStone({ id, values: {} as TaskMileStoneModel })),
    deleteMileStone: (id: string) => dispatch(action.deleteMileStone({ id })),
  };
};
interface StateTaskManagement<T> extends State<T> {
  isEdit?: boolean;
  visible?: boolean;
  isFilter?: boolean;
  isDetail?: boolean;
  assetMaintenanceStatus?: any;
  isFilterUsed?: boolean;
  filterName?: any;
  popoverVisible?: boolean;
  assetMaintenanceSavedFilters?: SavedFilter[];
  isVisibleForm?: boolean;
  isOpenShowMoreComment?: boolean;
  // Active key
  activeKey?: string;
  newTabItems?: any;
  totalTasks?: any;
  subTasks?: any;
  taskAssignees?: any;
  taskHistories?: any;
  taskComments?: any;
}

interface SavedFilter {
  id: string;
  name: string;
  filter: string;
}
export class TaskManagementModel extends CommonEntity {
  constructor(
    public parentId?: string,
    public title?: string,
    public type?: string,
    public description?: string,
    public constructionId?: string,
    public status?: string,
    public dueDate?: string,
    public startDate?: string,
    public userIds?: string[],
    public attachments?: AttachmentModel[],
    public assignees?: TaskAssigneeModel[],
    public comments?: TaskCommentModel[],
    public histories?: TaskHistoryModel[],
    public milestones?: TaskMileStoneModel[],
  ) {
    super();
  }
}

export class TaskManagementViewModel extends CommonEntity {
  constructor(
    public parentId?: string,
    public title?: string,
    public type?: string,
    public description?: string,
    public constructionId?: string,
    public status?: string,
    public dueDate?: string,
    public startDate?: string,
    public attachments?: AttachmentModel[],
    public subTasks?: TaskManagementViewModel[],
    public assignees?: TaskAssigneeViewModel[],
    public comments?: TaskCommentViewModel[],
    public histories?: TaskHistoryViewModel[],
    public milestones?: TaskMileStoneViewModel[],
  ) {
    super();
  }
}

export class TaskAssigneeModel extends CommonEntity {
  constructor(
    public taskManagementId?: string,
    public userId?: string,
  ) {
    super();
  }
}

export class TaskAssigneeViewModel extends CommonEntity {
  constructor(
    public id?: string,
    public taskManagementId?: string,
    public userId?: string,
    public userName?: string,
  ) {
    super();
  }
}

export class TaskCommentModel extends CommonEntity {
  constructor(
    public taskManagementId?: string,
    public content?: string,
  ) {
    super();
  }
}

export class TaskCommentViewModel extends CommonEntity {
  constructor(
    public id?: string,
    public taskManagementId?: string,
    public content?: string,
    public userName?: string,
  ) {
    super();
  }
}

export class TaskHistoryViewModel extends CommonEntity {
  constructor(
    public id?: string,
    public taskManagementId?: string,
    public taskManagementComentReplyId?: string,
    public action?: string,
  ) {
    super();
  }
}

export class TaskHistoryModel extends CommonEntity {
  constructor(
    public taskManagementId?: string,
    public taskManagementComentReplyId?: string,
    public action?: string,
  ) {
    super();
  }
}

export class TaskMileStoneViewModel extends CommonEntity {
  constructor(
    public id?: string,
    public taskManagementId?: string,
    public title?: string,
    public description?: string,
    public dueDate?: string,
    public startDate?: string,
  ) {
    super();
  }
}

export class TaskMileStoneModel extends CommonEntity {
  constructor(
    public taskManagementId?: string,
    public title?: string,
    public description?: string,
    public dueDate?: string,
    public startDate?: string,
  ) {
    super();
  }
}

export enum EStatusTaskManagement {
  idle = 'idle',
  getTaskSummaryPending = 'getTaskSummaryPending',
  getTaskSummaryFulfilled = 'getTaskSummaryFulfilled',
  getTaskSummaryRejected = 'getTaskSummaryRejected',
  postMultiplePending = 'postMultiplePending',
  postMultipleFulfilled = 'postMultipleFulfilled',
  postMultipleRejected = 'postMultipleRejected',
  // Assignee
  postAssigneePending = 'postAssigneePending',
  postAssigneeFulfilled = 'postAssigneeFulfilled',
  postAssigneeRejected = 'postAssigneeRejected',
  getPageAssigneePending = 'getPageAssigneePending',
  getPageAssigneeFulfilled = 'getPageAssigneeFulfilled',
  getPageAssigneeRejected = 'getPageAssigneeRejected',
  getAssigneePending = 'getAssigneePending',
  getAssigneeFulfilled = 'getAssigneeFulfilled',
  getAssigneeRejected = 'getAssigneeRejected',
  putAssigneePending = 'putAssigneePending',
  putAssigneeFulfilled = 'putAssigneeFulfilled',
  putAssigneeRejected = 'putAssigneeRejected',
  deleteAssigneePending = 'deleteAssigneePending',
  deleteAssigneeFulfilled = 'deleteAssigneeFulfilled',
  deleteAssigneeRejected = 'deleteAssigneeRejected',
  //Comment
  postPageCommentPending = 'postPageCommentPending',
  postPageCommentFulfilled = 'postPageCommentFulfilled',
  postPageCommentRejected = 'postPageCommentRejected',
  getPageCommentPending = 'getPageCommentPending',
  getPageCommentFulfilled = 'getPageCommentFulfilled',
  getPageCommentRejected = 'getPageCommentRejected',
  getCommentPending = 'getCommentPending',
  getCommentFulfilled = 'getCommentFulfilled',
  getCommentRejected = 'getCommentRejected',
  putCommentPending = 'putCommentPending',
  putCommentFulfilled = 'putCommentFulfilled',
  putCommentRejected = 'putCommentRejected',
  deleteCommentPending = 'deleteCommentPending',
  deleteCommentFulfilled = 'deleteCommentFulfilled',
  deleteCommentRejected = 'deleteCommentRejected',
  //History
  postPageHistoryPending = 'postPageHistoryPending',
  postPageHistoryFulfilled = 'postPageHistoryFulfilled',
  postPageHistoryRejected = 'postPageHistoryRejected',
  getPageHistoryPending = 'getPageHistoryPending',
  getPageHistoryFulfilled = 'getPageHistoryFulfilled',
  getPageHistoryRejected = 'getPageHistoryRejected',
  getHistoryPending = 'getHistoryPending',
  getHistoryFulfilled = 'getHistoryFulfilled',
  getHistoryRejected = 'getHistoryRejected',
  putHistoryPending = 'putHistoryPending',
  putHistoryFulfilled = 'putHistoryFulfilled',
  putHistoryRejected = 'putHistoryRejected',
  deleteHistoryPending = 'deleteHistoryPending',
  deleteHistoryFulfilled = 'deleteHistoryFulfilled',
  deleteHistoryRejected = 'deleteHistoryRejected',
  // MileStone
  postPageMileStonePending = 'postPageMileStonePending',
  postPageMileStoneFulfilled = 'postPageMileStoneFulfilled',
  postPageMileStoneRejected = 'postPageMileStoneRejected',
  getPageMileStonePending = 'getPageMileStonePending',
  getPageMileStoneFulfilled = 'getPageMileStoneFulfilled',
  getPageMileStoneRejected = 'getPageMileStoneRejected',
  getMileStonePending = 'getMileStonePending',
  getMileStoneFulfilled = 'getMileStoneFulfilled',
  getMileStoneRejected = 'getMileStoneRejected',
  putMileStonePending = 'putMileStonePending',
  putMileStoneFulfilled = 'putMileStoneFulfilled',
  putMileStoneRejected = 'putMileStoneRejected',
  deleteMileStonePending = 'deleteMileStonePending',
  deleteMileStoneFulfilled = 'deleteMileStoneFulfilled',
  deleteMileStoneRejected = 'deleteMileStoneRejected',
}
