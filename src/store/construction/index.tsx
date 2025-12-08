import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { Message } from '@core/message';
import { CommonEntity, EStatusState, QueryParams, Responses } from '@models';
import { Action, InvestorViewModel, Slice, State, TemplateStage, useAppDispatch, useTypedSelector } from '@store';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from '../../index';

const name = 'Construction';

const action = {
  ...new Action<ConstructionModel, EStatusConstruction>(name),
  confirmTaskCompletion: createAsyncThunk(name + 'confirmTaskCompletion', async ({ id }: { id: string }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/confirm-task-completion/${id}`);
    if (res.message) await Message.success({ text: res.message });
    return res;
  }),

  restoreTask: createAsyncThunk(name + 'restoreTask', async ({ id }: { id: string }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/restore-task/${id}`);
    if (res.message) await Message.success({ text: res.message });
    return res;
  }),

  checkOverloadEmployee: createAsyncThunk(
    name + 'checkOverloadEmployee',
    async ({ values }: { values: CheckOverloadEmployeeModel }) => {
      const res = await API.post(`${routerLinks(name, 'api')}/overload-warning`, values);
      return res;
    },
  ),

  changeActivity: createAsyncThunk(name + 'changeActivity', async ({ values }: { values: ConstructionModel }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/change-activity/${values?.id}`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),

  getByConstructionId: createAsyncThunk(name + 'getByConstructionId', async (id: string) => {
    const res = await API.get(`${routerLinks(name, 'api')}/get-by-construction-id/${id}`);
    return res.data;
  }),

  getExecutionTeamsInConstruction: createAsyncThunk(
    name + '/getExecutionTeamsInConstruction',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/execution-teams`, params),
  ),

  getDashboard: createAsyncThunk(name + '/getDashboard', async (id: string) => {
    const res = await API.get(`${routerLinks(name, 'api')}/dashboard/${id}`);
    return res.data;
  }),

  // Thống kê dashboard
  getAnalyzeAllConstruction: createAsyncThunk(
    name + '/getAnalyzeAllConstruction',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/construction-analyze-all`, params),
  ),

  // Thống kê doanh thu
  getAnalyzeAllContract: createAsyncThunk(
    name + '/getAnalyzeAllContract',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/contract-analyze-all`, params),
  ),

  importExcel: createAsyncThunk(name + '/importExcel', async (params: { file: File; overwrite: boolean }) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('overwrite', params.overwrite.toString());

    const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/excel/import`, {
      method: 'POST',
      body: formData,
      headers: {
        authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
        'Accept-Language': localStorage.getItem('i18nextLng') || '',
      },
    });

    const data: Responses<any> = await res.json();
    return data;
  }),

  exportListToExcel: createAsyncThunk(name + 'exportListToExcel', async ({ params }: { params: QueryParams }) => {
    try {
      // Tạo query string cho các tham số
      const queryString = new URLSearchParams({
        page: params.page?.toString() || '1',
        size: params.size?.toString() || '20',
        filter: JSON.stringify(params.filter || {}),
        sort: params.sort?.toString() || '',
      }).toString();

      const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/excel/export?${queryString}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
          'Accept-Language': localStorage.getItem('i18nextLng') || '',
        },
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const blob = await res.blob();

      // Sử dụng biểu thức chính quy để lấy tên file từ Content-Disposition
      const contentDisposition = res.headers.get('Content-Disposition');
      const fileName = decodeURIComponent(
        contentDisposition?.split("filename*=UTF-8''")[1] ?? new Date().toISOString().slice(0, 10),
      );
      // Tải file về máy
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = fileName;
      downloadLink.click();
      window.URL.revokeObjectURL(downloadLink.href);
      customMessage.success({ content: 'Xuất file thành công' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất file';
      customMessage.error({ content: errorMessage });
    }
  }),

  putDoneStage: createAsyncThunk(
    name + 'putDoneStage',
    async ({ constructionId, templateStageId }: { constructionId: string; templateStageId: string }) => {
      const res = await API.put(
        `${routerLinks(name, 'api')}/template-stage/${constructionId}/${templateStageId}/isDone`,
      );
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),

  putTemplateStages: createAsyncThunk(
    name + 'putTemplateStages',
    async ({ id, templateStages }: { id: string; templateStages: TemplateStage[] }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/template-stages/${id}`, templateStages);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),

  getTemplateStages: createAsyncThunk(
    name + 'getTemplateStages',
    async (id: string) => await API.get(`${routerLinks(name, 'api')}/template-stages/${id}/is-done-status`),
  ),

  getByIdForTask: createAsyncThunk(name + '/ getByIdForTask', async ({ id }: { id: string }) => {
    const res = await API.get(`${routerLinks(name, 'api')}/${id}`);
    return { res };
  }),
};

export const ConstructionSlice = createSlice(
  new Slice<ConstructionModel, EStatusConstruction>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      // Thống kê dashboard
      .addCase(action.getAnalyzeAllConstruction.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.getAnalyzeAllConstructionPending;
      })
      .addCase(action.getAnalyzeAllConstruction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getAnalyzeAllConstructionFulfilled;
        state.analyzeAllConstructionData = action.payload.data;
      })
      .addCase(action.getAnalyzeAllConstruction.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getAnalyzeAllConstructionRejected;
      })

      // Thống kê doanh thu
      .addCase(action.getAnalyzeAllContract.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.getAnalyzeAllContractPending;
      })
      .addCase(action.getAnalyzeAllContract.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getAnalyzeAllContractFulfilled;
        state.analyzeAllContractData = action.payload.data;
      })
      .addCase(action.getAnalyzeAllContract.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getAnalyzeAllContractRejected;
      })

      // Tổ thực hiện trong công trình/dự án
      .addCase(action.getExecutionTeamsInConstruction.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.getExecutionTeamsInConstructionPending;
      })
      .addCase(action.getExecutionTeamsInConstruction.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getExecutionTeamsInConstructionFulfilled;
        state.executionTeamsData = action.payload.data;
      })
      .addCase(action.getExecutionTeamsInConstruction.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getExecutionTeamsInConstructionRejected;
      })

      .addCase(action.getByConstructionId.pending, (state) => {
        state.status = EStatusConstruction.getByConstructionIdPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.getByConstructionId.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.productHasConstructionList = action.payload;
        }
        state.status = EStatusConstruction.getByConstructionIdFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getByConstructionId.rejected, (state) => {
        state.status = EStatusConstruction.getByConstructionIdRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })

      .addCase(action.getDashboard.pending, (state) => {
        state.status = EStatusConstruction.getDashboardPending;
        state.isFormLoading = true;
        state.isLoading = true;
      })
      .addCase(action.getDashboard.fulfilled, (state, action: any) => {
        if (action.payload) {
          state.dashboardData = action.payload;
        }
        state.status = EStatusConstruction.getDashboardFulfilled;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.getDashboard.rejected, (state) => {
        state.status = EStatusConstruction.getDashboardRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.confirmTaskCompletion.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.confirmTaskCompletionPending;
      })
      .addCase(action.confirmTaskCompletion.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusConstruction.confirmTaskCompletionFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.confirmTaskCompletion.rejected, (state) => {
        state.status = EStatusConstruction.confirmTaskCompletionRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.checkOverloadEmployee.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.checkOverloadEmployeePending;
      })
      .addCase(action.checkOverloadEmployee.fulfilled, (state, action) => {
        if (action.payload) {
          state.overloadData = action.payload.data;
          state.status = EStatusConstruction.checkOverloadEmployeeFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.checkOverloadEmployee.rejected, (state) => {
        state.status = EStatusConstruction.checkOverloadEmployeeRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.changeActivity.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.changeActivityPending;
      })
      .addCase(action.changeActivity.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusConstruction.changeActivityFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.changeActivity.rejected, (state) => {
        state.status = EStatusConstruction.changeActivityRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })

      // Import Excel
      .addCase(action.importExcel.pending, (state) => {
        state.isImportingFile = true;
        state.status = EStatusConstruction.importExcelPending;
      })
      .addCase(action.importExcel.fulfilled, (state, action) => {
        if (action.payload.isSuccess) {
          state.isImportFileModalOpen = false;
          customMessage.success({ content: 'Nhập file thành công' });
        } else {
          customMessage.error({ content: action.payload.message });
        }
        state.isImportingFile = false;
        state.status = EStatusConstruction.importExcelFulfilled;
      })
      .addCase(action.importExcel.rejected, (state) => {
        state.isImportingFile = false;
        state.status = EStatusConstruction.importExcelRejected;
      })

      .addCase(action.exportListToExcel.pending, (state) => {
        state.status = EStatusConstruction.exportExcelPending;
        state.isLoading = true;
      })
      .addCase(action.exportListToExcel.fulfilled, (state) => {
        state.status = EStatusConstruction.exportExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.rejected, (state) => {
        state.status = EStatusConstruction.exportExcelRejected;
        state.isLoading = false;
      })

      .addCase(action.putDoneStage.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.putDoneStagePending;
      })
      .addCase(action.putDoneStage.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.putDoneStageFulfilled;
      })
      .addCase(action.putDoneStage.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.putDoneStageRejected;
      })

      .addCase(action.putTemplateStages.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.putTemplateStagesPending;
      })
      .addCase(action.putTemplateStages.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.putTemplateStagesFulfilled;
      })
      .addCase(action.putTemplateStages.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.putTemplateStagesRejected;
      })

      .addCase(action.getTemplateStages.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusConstruction.getTemplateStagesPending;
      })
      .addCase(action.getTemplateStages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templateStages = action.payload.data || [];
        state.status = EStatusConstruction.getTemplateStagesFulfilled;
      })
      .addCase(action.getTemplateStages.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getTemplateStagesRejected;
      })

      .addCase(action.getByIdForTask.pending, (state, action) => {
        state.isLoading = true;
        state.status = EStatusConstruction.getByIdForTaskPending;
      })
      .addCase(action.getByIdForTask.fulfilled, (state, action) => {
        const { res } = action.payload;
        if (res.data && JSON.stringify(state.data) !== JSON.stringify(res.data)) state.data = res.data;
        state.isLoading = false;
        state.status = EStatusConstruction.getByIdForTaskFulfilled;
      })
      .addCase(action.getByIdForTask.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusConstruction.getByIdForTaskRejected;
      });
  }),
);

export const ConstructionFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateLSCS<ConstructionModel>),
    set: (values: StateLSCS<ConstructionModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateLSCS<ConstructionModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: ConstructionModel) => dispatch(action.post({ values })),
    put: (values: ConstructionModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    confirmTaskCompletion: ({ id }: { id: string | any }) => dispatch(action.confirmTaskCompletion({ id })),
    restoreTask: ({ id }: { id: string | any }) => dispatch(action.restoreTask({ id })),
    getByConstructionId: ({ id }: { id: string | any }) => dispatch(action.getByConstructionId(id)),
    changeActivity: ({ values }: { values: ConstructionModel }) => dispatch(action.changeActivity({ values })),
    getExecutionTeamsInConstruction: (params: QueryParams) => dispatch(action.getExecutionTeamsInConstruction(params)),
    getDashboard: ({ id }: { id: string | any }) => dispatch(action.getDashboard(id)),

    // Thống kê dự án
    getAnalyzeAllConstruction: (params: QueryParams) => dispatch(action.getAnalyzeAllConstruction(params)),
    // Thống kê doanh thu
    getAnalyzeContractAll: (params: QueryParams) => dispatch(action.getAnalyzeAllContract(params)),

    /// Another Process
    importExcel: (file: File, overwrite: boolean) => dispatch(action.importExcel({ file, overwrite })),
    exportListToExcel: (params: QueryParams) => dispatch(action.exportListToExcel({ params })),
    putDoneStage: (constructionId: string, templateStageId: string) =>
      dispatch(action.putDoneStage({ constructionId, templateStageId })),
    putTemplateStages: (id: string, templateStages: TemplateStage[]) =>
      dispatch(action.putTemplateStages({ id, templateStages })),

    getTemplateStages: (id: string) => dispatch(action.getTemplateStages(id)),
    getByIdForTask: ({ id }: { id: string }) => dispatch(action.getByIdForTask({ id })),

    checkOverloadEmployee: (values: CheckOverloadEmployeeModel) => dispatch(action.checkOverloadEmployee({ values })),
  };
};
interface StateLSCS<T> extends State<T, EStatusConstruction> {
  isEdit?: boolean;
  isShow?: boolean;
  isOpenQuickAddressPicker?: boolean;
  newPackageData?: ConstructionModel;
  activeKey?: string | any;
  isCreateContract?: boolean;
  isUpdateConstruction?: boolean;
  productHasConstructionList?: any;
  dashboardData?: DashboardModel;
  executionTeamsData?: ExecutionTeamsViewModel[] | any;
  isExportFileModal?: boolean;
  isFilterVisible?: boolean;
  isImportFileModalOpen?: boolean;
  isImportingFile?: boolean;
  overloadData?: any;
  isShowOverloadDetailModel?: boolean;
  dataAfterChange?: any;
  payloadOnSubmit?: any;

  // Active tab each card
  activeTab?: string;
  activeContractTab?: string;
  activeSuggestTab?: string;
  activeIssueTab?: string;
  activeWeekReportTab?: string;
  activeVehicleRequest?: string;

  // Active tab in dashboard
  activeTabDashboard?: string;

  // Active tab in task personal
  activeTabPersonal?: string;

  // Active step
  activeStep?: number;

  // Thêm nhanh nhân sự
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
  listPresentArr?: [] | any;
  listItems?: [] | any;

  // Week report
  isOpenWeekReport?: boolean;
  weekReportId?: string;

  // Search params process
  investorId?: string;
  createdOnDate?: string;

  // Dashboard dự án
  analyzeAllConstructionData?: any;
  analyzePriorityPercentInConstructionData?: any;
  analyzeInvestorPercentInConstructionData?: any;
  analyzeConstructionQuantityByInvestorData?: any;
  analyzeConstructionHasBigQualityData?: any;
  analyzeConstructionHasLowQualityData?: any;
  analyzeSummaryTopAmount?: any;
  analyzeTopConstructionHasIssue?: any;

  // Dashboard doanh thu
  analyzeAllContractData?: any;
  analyzeContractAmountByInvestorData?: any;
  analyzeContractApprovePercentData?: any;
  analyzeRevenueContractApprovePercentData?: any;
  analyzeAmountAndExpectedAmountData?: any;

  isUpdateTemplateStagesModal?: boolean;
  isEditTemplateStages?: boolean;

  // Danh sách TemplateStage
  templateStages?: TemplateStage[];
  minIndex?: number;
}

interface DashboardModel {
  contractData?: any;
  advanceData?: any;
  materialData?: any;
  quantityOfMaterialData?: any;
}

export class ConstructionModel extends CommonEntity {
  constructor(
    public id: string | any,
    public code: string | any,
    public name: string | any,
    public investorId: string | any,
    public voltageTypeCode: string,
    public ownerTypeCode: string,
    public investorCode: string,
    public voltage: any,
    public owner: any,
    public investor: InvestorViewModel[] | any,
    public executionTeams: ExecutionTeamsViewModel[] | any,
    public deliveryDate: string,
    public priorityCode: string,
    public priorityName: string,
    public completionByInvestor: string,
    public completionByCompany: string,
    public constructionTemplateId: string,
    public statusCode: string,
    public statusName: string,
    public executionStatusCode: string,
    public executionStatusName: string,
    public documentStatusCode: string,
    public documentStatusName: string,
    public isHasIssue: boolean,
    public note: string,
    public templateStages?: TemplateStage[],
  ) {
    super();
  }
}

export class ExecutionTeamsViewModel extends CommonEntity {
  constructor(
    public id?: string,
    public employeeId?: string,
    public constructionId?: string,
    public maPhongBan?: string,
    public toThucHien?: any,
    public employeeAvatarUrl?: string,
    public employeeName?: string,
    public userType?: string,
  ) {
    super();
  }
}

export class ConstructionActivityLogsViewModel extends CommonEntity {
  constructor(
    public id?: string,
    public userName?: string,
    public avatarUrl?: string,
    public description?: string,
    public codeLinkDescription?: string,
    public orderId?: string,
    public actionType?: string,
    public stepOrder?: number,
  ) {
    super();
  }
}

export class AnalyzeConstructionHasIssue extends CommonEntity {
  constructor(
    public constructionId?: string,
    public totalIssuePending?: number,
    public totalIssueExpired?: string,
  ) {
    super();
  }
}

export class CheckOverloadEmployeeModel extends CommonEntity {
  constructor(
    public projectId?: string,
    public payloadEmployee?: ConstructionModel,
  ) {
    super();
  }
}

export enum EStatusConstruction {
  confirmTaskCompletionPending = 'confirmTaskCompletionPending',
  confirmTaskCompletionFulfilled = 'confirmTaskCompletionFulfilled',
  confirmTaskCompletionRejected = 'confirmTaskCompletionRejected',

  restoreTaskPending = 'restoreTaskPending',
  restoreTaskFulfilled = 'restoreTaskFulfilled',
  restoreTaskRejected = 'restoreTaskRejected',

  changeActivityPending = 'changeActivityPending',
  changeActivityFulfilled = 'changeActivityFulfilled',
  changeActivityRejected = 'changeActivityRejected',

  getByConstructionIdPending = 'getByConstructionIdPending',
  getByConstructionIdFulfilled = 'getByConstructionIdFulfilled',
  getByConstructionIdRejected = 'getByConstructionIdRejected',

  getExecutionTeamsInConstructionFulfilled = 'getExecutionTeamsInConstructionFulfilled',
  getExecutionTeamsInConstructionPending = 'getExecutionTeamsInConstructionPending',
  getExecutionTeamsInConstructionRejected = 'getExecutionTeamsInConstructionRejected',

  getDashboardPending = 'getDashboardPending',
  getDashboardFulfilled = 'getDashboardFulfilled',
  getDashboardRejected = 'getDashboardRejected',

  // Thống kê tất cả theo tiêu chí
  getAnalyzeAllConstructionPending = 'getAnalyzeAllConstructionPending',
  getAnalyzeAllConstructionFulfilled = 'getAnalyzeAllConstructionFulfilled',
  getAnalyzeAllConstructionRejected = 'getAnalyzeAllConstructionRejected',

  // Tỉ lê dự án theo mức độ ưu tiên
  getAnalyzePriorityPercentInConstructionPending = 'getAnalyzePriorityPercentInConstructionPending',
  getAnalyzePriorityPercentInConstructionFulfilled = 'getAnalyzePriorityPercentInConstructionFulfilled',
  getAnalyzePriorityPercentInConstructionRejected = 'getAnalyzePriorityPercentInConstructionRejected',

  // Tỉ lệ dự án theo loại chủ đầu tư
  getAnalyzeInvestorPercentInConstructionPending = 'getAnalyzeInvestorPercentInConstructionPending',
  getAnalyzeInvestorPercentInConstructionFulfilled = 'getAnalyzeInvestorPercentInConstructionFulfilled',
  getAnalyzeInvestorPercentInConstructionRejected = 'getAnalyzeInvestorPercentInConstructionRejected',

  // Thống kê số lượng dự án theo chủ đầu tư
  getAnalyzeConstructionQuantityByInvestorPending = 'getAnalyzeConstructionQuantityByInvestorPending',
  getAnalyzeConstructionQuantityByInvestorFulfilled = 'getAnalyzeConstructionQuantityByInvestorFulfilled',
  getAnalyzeConstructionQuantityByInvestorRejected = 'getAnalyzeConstructionQuantityByInvestorRejected',

  // Thống kê yêu cầu tạm ứng cần xử lý
  getAnalyzeConstructionHasBigQuantityPending = 'getAnalyzeConstructionHasBigQuantityPending',
  getAnalyzeConstructionHasBigQuantityFulfilled = 'getAnalyzeConstructionHasBigQuantityFulfilled',
  getAnalyzeConstructionHasBigQuantityRejected = 'getAnalyzeConstructionHasBigQuantityRejected',

  // Tổng hợp thu chi theo dự án
  getAnalyzeConstructionHasLowQualityPending = 'getAnalyzeConstructionHasLowQualityPending',
  getAnalyzeConstructionHasLowQualityFulfilled = 'getAnalyzeConstructionHasLowQualityFulfilled',
  getAnalyzeConstructionHasLowQualityRejected = 'getAnalyzeConstructionHasLowQualityRejected',

  // Số lượng vật tư thực tế và kế hoạch
  getAnalyzeSummaryTopAmountPending = 'getAnalyzeSummaryTopAmountPending',
  getAnalyzeSummaryTopAmountFulfilled = 'getAnalyzeSummaryTopAmountFulfilled',
  getAnalyzeSummaryTopAmountRejected = 'getAnalyzeSummaryTopAmountRejected',

  // Top giá trị
  getAnalyzeTopConstructionHasIssuePending = 'getAnalyzeTopConstructionHasIssuePending',
  getAnalyzeTopConstructionHasIssueFulfilled = 'getAnalyzeTopConstructionHasIssueFulfilled',
  getAnalyzeTopConstructionHasIssueRejected = 'getAnalyzeTopConstructionHasIssueRejected',

  // Thống kê hợp đồng theo nhiều tiêu chí
  getAnalyzeAllContractPending = 'getAnalyzeAllContractPending',
  getAnalyzeAllContractFulfilled = 'getAnalyzeAllContractFulfilled',
  getAnalyzeAllContractRejected = 'getAnalyzeAllContractRejected',

  // Số lượng và giá trị hợp đồng (trước VAT) theo chủ đầu tư
  getAnalyzeContractAmountByInvestorPending = 'getAnalyzeContractAmountByInvestorPending',
  getAnalyzeContractAmountByInvestorFulfilled = 'getAnalyzeContractAmountByInvestorFulfilled',
  getAnalyzeContractAmountByInvestorRejected = 'getAnalyzeContractAmountByInvestorRejected',

  // Tỉ lệ số lượng hợp đồng đã phê duyệt
  getAnalyzeContractApprovePercentPending = 'getAnalyzeContractApprovePercentPending',
  getAnalyzeContractApprovePercentFulfilled = 'getAnalyzeContractApprovePercentFulfilled',
  getAnalyzeContractApprovePercentRejected = 'getAnalyzeContractApprovePercentRejected',

  // Tỉ lệ giá trị hợp đồng trước VAT đã phê duyệt
  getAnalyzeRevenueContractApprovePercentPending = 'getAnalyzeRevenueContractApprovePercentPending',
  getAnalyzeRevenueContractApprovePercentFulfilled = 'getAnalyzeRevenueContractApprovePercentFulfilled',
  getAnalyzeRevenueContractApprovePercentRejected = 'getAnalyzeRevenueContractApprovePercentRejected',

  // Tổng sản lượng và giá trị nghiệm thu trước VAT theo chủ đầu tư
  getAnalyzeAmountAndExpectedAmountByInvestorPending = 'getAnalyzeAmountAndExpectedAmountByInvestorPending',
  getAnalyzeAmountAndExpectedAmountByInvestorFulfilled = 'getAnalyzeAmountAndExpectedAmountByInvestorFulfilled',
  getAnalyzeAmountAndExpectedAmountByInvestorRejected = 'getAnalyzeAmountAndExpectedAmountByInvestorRejected',

  /// Import excel
  importExcelPending = 'importExcelPending',
  importExcelFulfilled = 'importExcelFulfilled',
  importExcelRejected = 'importExcelRejected',

  /// Export
  exportExcelPending = 'exportExcelPending',
  exportExcelFulfilled = 'exportExcelFulfilled',
  exportExcelRejected = 'exportExcelRejected',

  putDoneStagePending = 'putDoneStagePending',
  putDoneStageFulfilled = 'putDoneStageFulfilled',
  putDoneStageRejected = 'putDoneStageRejected',

  putTemplateStagesPending = 'putTemplateStagesPending',
  putTemplateStagesFulfilled = 'putTemplateStagesFulfilled',
  putTemplateStagesRejected = 'putTemplateStagesRejected',

  // Lấy Template Stages có và chỉnh isDone = true với các trạng thái: đang thực hiện, chờ duyệt, không đạt
  getTemplateStagesPending = 'getTemplateStagesPending',
  getTemplateStagesFulfilled = 'getTemplateStagesFulfilled',
  getTemplateStagesRejected = 'getTemplateStagesRejected',

  getByIdForTaskPending = 'getByIdForTaskPending',
  getByIdForTaskFulfilled = 'getByIdForTaskFulfilled',
  getByIdForTaskRejected = 'getByIdForTaskRejected',

  checkOverloadEmployeePending = 'checkOverloadEmployeePending',
  checkOverloadEmployeeFulfilled = 'checkOverloadEmployeeFulfilled',
  checkOverloadEmployeeRejected = 'checkOverloadEmployeeRejected',
}
