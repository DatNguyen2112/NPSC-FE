import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State, PhuongTienModel, UserModal } from '@store';
import { CommonEntity, Pagination, QueryParams, Responses } from '@models';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';
import printJS from 'print-js';
import dayjs from 'dayjs';

export interface VehicleRequestExportConfig {
  companyName: string;
  departmentName: string;
  vehicleCoordinator: string;
  vehicleCoordinatorId?: string;
  teamLeader: string;
  teamLeaderId?: string;
}

export const vehicleRequestStatus = {
  Draft: {
    value: 'Draft',
    label: 'Nháp',
    color: 'default',
  },
  PendingApproval: {
    value: 'PendingApproval',
    label: 'Chờ duyệt',
    color: 'gold',
  },
  Approved: {
    value: 'Approved',
    label: 'Đã duyệt',
    color: 'green',
  },
  Rejected: {
    value: 'Rejected',
    label: 'Từ chối',
    color: 'red',
  },
  WaitingForSharing: {
    value: 'WaitingForSharing',
    label: 'Chờ ghép xe',
    color: 'orange',
  },
  Shared: {
    value: 'Shared',
    label: 'Đã ghép xe',
    color: 'cyan',
  },
};
export const vehicleRequestPriority = {
  Low: {
    value: 'Low',
    label: 'Thấp',
    color: '#52c41a',
  },
  Medium: {
    value: 'Medium',
    label: 'Trung bình',
    color: '#faad14',
  },
  High: {
    value: 'High',
    label: 'Cao',
    color: '#ff4d4f',
  },
};
export const vehicleRequestAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  SUBMIT: 'SUBMIT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  SUBMIT_SHARING: 'SUBMIT_SHARING',
  APPROVE_SHARING: 'APPROVE_SHARING',
};
export const filterFieldNameMap = {
  fullTextSearch: 'Từ khoá',
  requestCode: 'Mã yêu cầu',
  createdByUserId: 'Người tạo',
  priority: 'Độ ưu tiên',
  createdDateRange: 'Ngày tạo',
  usageDateRange: 'Thời gian sử dụng',
  departmentId: 'Đơn vị sử dụng xe',
  userId: 'Người sử dụng xe',
  projectId: 'Dự án',
  status: 'Trạng thái',
  requestedVehicleTypeId: 'Loại xe',
  requestedVehicleId: 'Xe',
};

const name = 'VehicleRequest';
const action = {
  ...new Action<VehicleRequestViewModel, EstatusVehicleRequest>(name),
  submitForApproval: createAsyncThunk(name + 'submitForApproval', async (id: string, { rejectWithValue }) => {
    const response = await fetch(`${linkApi}${routerLinks(name, 'api')}/${id}/submit-for-approval`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
      },
    });

    const data: Responses<VehicleRequestViewModel[]> = await response.json();

    if (data.isSuccess) {
      return data;
    } else {
      return rejectWithValue(data);
    }
  }),
  processApproval: createAsyncThunk(
    name + 'processApproval',
    async ({ id, ...data }: { id: string; isApproved: boolean; rejectNotes: string }, { rejectWithValue }) => {
      const response = await fetch(`${linkApi}${routerLinks(name, 'api')}/${id}/process-approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
        },
        body: JSON.stringify(data),
      });

      const resData: Responses<VehicleRequestViewModel[]> = await response.json();

      if (resData.isSuccess) {
        return resData;
      } else {
        return rejectWithValue(resData);
      }
    },
  ),
  getRequestForChart: createAsyncThunk(name + 'getRequestForChart', async () => {
    const today = dayjs().startOf('day');
    const filter = {
      usageDateRange: [
        today.subtract(7, 'day').format('YYYY-MM-DDTHH:mm:ss[Z]'),
        today.add(7, 'day').format('YYYY-MM-DDTHH:mm:ss[Z]'),
      ],
      includeVehicle: true,
      status: `${vehicleRequestStatus.Approved.value},${vehicleRequestStatus.Shared.value}`,
    };

    const res = await API.get<Pagination<VehicleRequestViewModel>>(`${routerLinks(name, 'api')}`, {
      filter: JSON.stringify(filter),
    });

    if (!res.isSuccess) {
      throw new Error(res.message);
    }

    const data = res.data;

    return {
      date: today.format('YYYY-MM-DDTHH:mm:ss[Z]'),
      data,
    };
  }),
  printPdf: createAsyncThunk(name + 'printPdf', async (id: string) => {
    try {
      const url = `${linkApi}${routerLinks(name, 'api')}/${id}/pdf`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
        },
      });

      if (!response.ok) {
        const jsonData: Responses<any> = await response.json();
        throw new Error(jsonData.message || 'Có lỗi xảy ra khi xuất file');
      }

      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'Phieu xin xe.pdf'; // Tên mặc định

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?['"]?([^";'\n]*)['"]?/i);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        }
      }

      printJS({
        printable: pdfUrl,
        type: 'pdf',
        documentTitle: fileName,
      });
      window.URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xuất file';
      customMessage.error({ content: errorMessage });
    }
  }),
  getExportConfig: createAsyncThunk(name + 'getExportConfig', () =>
    API.get<VehicleRequestExportConfig>(`${routerLinks(name, 'api')}/export-config`),
  ),
  updateExportConfig: createAsyncThunk(name + 'updateExportConfig', (data: VehicleRequestExportConfig) =>
    API.put(`${routerLinks(name, 'api')}/export-config`, data),
  ),
  submitVehicleSharing: createAsyncThunk(
    name + 'submitVehicleSharing',
    (data: { id: string; approvedRequestIds: string[] }) =>
      API.put(`${routerLinks(name, 'api')}/${data.id}/submit-vehicle-sharing`, data.approvedRequestIds),
  ),
  approveVehicleSharing: createAsyncThunk(
    name + 'approveVehicleSharing',
    (data: { id: string; approvedRequestIds: string[] }) =>
      API.put(`${routerLinks(name, 'api')}/${data.id}/approve-vehicle-sharing`, data.approvedRequestIds),
  ),
};

export interface ActivityHistory {
  id: string;
  entityId: string;
  entityType: string;
  action: keyof typeof vehicleRequestAction;
  description: string;
  createdByUserId: string;
  lastModifiedByUserId: string;
  lastModifiedOnDate: string;
  createdOnDate: string;
  createdByUserName: string;
  createdByUserFullName: string;
  lastModifiedByUserName: string;
  lastModifiedByFullName: string;
}

export const vehicleRequestSlice = createSlice(
  new Slice<VehicleRequestViewModel, EstatusVehicleRequest>(action, {}, (builder) => {
    builder
      .addCase(action.submitForApproval.pending, (state) => {
        state.isLoading = true;
        state.status = EstatusVehicleRequest.submitForApprovalPending;
      })
      .addCase(action.submitForApproval.fulfilled, (state, action) => {
        state.status = EstatusVehicleRequest.submitForApprovalFulfilled;
        state.isLoading = false;
        customMessage.success({ type: 'success', content: action.payload.message });
      })
      .addCase(action.submitForApproval.rejected, (state: StateVehicleRequest<VehicleRequestViewModel>, action) => {
        const payload = action.payload as Responses<VehicleRequestViewModel[]> | undefined;
        state.status = EstatusVehicleRequest.submitForApprovalRejected;
        state.isLoading = false;
        customMessage.error({ type: 'error', content: payload?.message || 'Có lỗi xảy ra!' });

        if ((payload?.data?.length ?? 0) > 0) {
          state.shareableRequests = payload?.data;
          state.sharingModalForRequestId = action.meta.arg;
          state.sharingModalNextAction = 'submit';
        }
      })
      .addCase(action.processApproval.pending, (state) => {
        state.isLoading = true;
        state.status = EstatusVehicleRequest.processApprovalPending;
      })
      .addCase(action.processApproval.fulfilled, (state: StateVehicleRequest<VehicleRequestViewModel>, action) => {
        state.status = EstatusVehicleRequest.processApprovalFulfilled;
        state.needReloadChart = true;
        state.isLoading = false;
        customMessage.success({ type: 'success', content: action.payload.message });
      })
      .addCase(action.processApproval.rejected, (state: StateVehicleRequest<VehicleRequestViewModel>, action) => {
        const payload = action.payload as Responses<VehicleRequestViewModel[]> | undefined;
        state.status = EstatusVehicleRequest.processApprovalRejected;
        state.isLoading = false;
        customMessage.error({ type: 'error', content: payload?.message || 'Có lỗi xảy ra!' });

        if ((payload?.data?.length ?? 0) > 0) {
          state.shareableRequests = payload?.data;
          state.sharingModalForRequestId = action.meta.arg.id;
          state.sharingModalNextAction = 'approve';
        }
      })
      .addCase(action.printPdf.pending, (state) => {
        state.isPdfLoading = true;
        state.status = EstatusVehicleRequest.printPdfPending;
      })
      .addCase(action.printPdf.fulfilled, (state) => {
        state.isPdfLoading = false;
        state.status = EstatusVehicleRequest.printPdfFulfilled;
      })
      .addCase(action.printPdf.rejected, (state) => {
        state.isPdfLoading = false;
        state.status = EstatusVehicleRequest.printPdfRejected;
      })
      .addCase(action.getRequestForChart.pending, (state) => {
        state.isLoading = true;
        state.status = EstatusVehicleRequest.getRequestForChartPending;
      })
      .addCase(action.getRequestForChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EstatusVehicleRequest.getRequestForChartFulfilled;
        state.chartData = action.payload;
        state.needReloadChart = false;
      })
      .addCase(action.getRequestForChart.rejected, (state) => {
        state.isLoading = false;
        state.status = EstatusVehicleRequest.getRequestForChartRejected;
      })
      .addCase(action.getExportConfig.pending, (state) => {
        state.isExportConfigLoading = true;
        state.status = EstatusVehicleRequest.getExportConfigPending;
      })
      .addCase(action.getExportConfig.fulfilled, (state, action) => {
        state.isExportConfigLoading = false;
        state.status = EstatusVehicleRequest.getExportConfigFulfilled;
        state.exportConfig = action.payload.data;
      })
      .addCase(action.getExportConfig.rejected, (state) => {
        state.isExportConfigLoading = false;
        state.status = EstatusVehicleRequest.getExportConfigRejected;
      })
      .addCase(action.updateExportConfig.pending, (state) => {
        state.isExportConfigLoading = true;
        state.status = EstatusVehicleRequest.updateExportConfigPending;
      })
      .addCase(action.updateExportConfig.fulfilled, (state, action) => {
        state.isExportConfigLoading = false;
        state.status = EstatusVehicleRequest.updateExportConfigFulfilled;
        state.exportConfig = action.payload;
      })
      .addCase(action.updateExportConfig.rejected, (state) => {
        state.isExportConfigLoading = false;
        state.status = EstatusVehicleRequest.updateExportConfigRejected;
      })
      .addCase(action.submitVehicleSharing.pending, (state) => {
        state.isLoading = true;
        state.status = EstatusVehicleRequest.submitVehicleSharingPending;
      })
      .addCase(action.submitVehicleSharing.fulfilled, (state: StateVehicleRequest<VehicleRequestViewModel>, action) => {
        state.isLoading = false;
        state.status = EstatusVehicleRequest.submitVehicleSharingFulfilled;
        state.sharingModalForRequestId = undefined;
        customMessage.success({ content: action.payload.message });
      })
      .addCase(action.submitVehicleSharing.rejected, (state) => {
        state.isLoading = false;
        state.status = EstatusVehicleRequest.submitVehicleSharingRejected;
      })
      .addCase(action.approveVehicleSharing.pending, (state) => {
        state.isLoading = true;
        state.status = EstatusVehicleRequest.approveVehicleSharingPending;
      })
      .addCase(
        action.approveVehicleSharing.fulfilled,
        (state: StateVehicleRequest<VehicleRequestViewModel>, action) => {
          state.isLoading = false;
          state.status = EstatusVehicleRequest.approveVehicleSharingFulfilled;
          state.sharingModalForRequestId = undefined;
          customMessage.success({ content: action.payload.message });
        },
      )
      .addCase(action.approveVehicleSharing.rejected, (state) => {
        state.isLoading = false;
        state.status = EstatusVehicleRequest.approveVehicleSharingRejected;
      });
  }),
);

export const VehicleRequestFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateVehicleRequest<VehicleRequestViewModel>),
    set: (values: StateVehicleRequest<VehicleRequestViewModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: any;
      keyState?: keyof StateVehicleRequest<VehicleRequestViewModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: VehicleRequestViewModel) => dispatch(action.post({ values })),
    put: (values: VehicleRequestViewModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    submitForApproval: (id: string) => dispatch(action.submitForApproval(id)),
    processApproval: (data: { id: string; isApproved: boolean; rejectNotes: string }) =>
      dispatch(action.processApproval(data)),
    printPdf: (id: string) => dispatch(action.printPdf(id)),
    getRequestForChart: () => dispatch(action.getRequestForChart()),
    getExportConfig: () => dispatch(action.getExportConfig()),
    updateExportConfig: (data: VehicleRequestExportConfig) => dispatch(action.updateExportConfig(data)),
    submitVehicleSharing: (id: string, approvedRequestIds: string[]) =>
      dispatch(action.submitVehicleSharing({ id, approvedRequestIds })),
    approveVehicleSharing: (id: string, approvedRequestIds: string[] = []) =>
      dispatch(action.approveVehicleSharing({ id, approvedRequestIds })),
  };
};

interface StateVehicleRequest<T> extends State<T, EstatusVehicleRequest> {
  isFilterDrawerOpen?: boolean;
  isPdfLoading?: boolean;
  chartData?: {
    date: string;
    data: Pagination<VehicleRequestViewModel>;
  };
  needReloadChart?: boolean;
  exportConfig?: VehicleRequestExportConfig;
  isExportConfigLoading?: boolean;
  shareableRequests?: VehicleRequestViewModel[];
  sharingModalForRequestId?: string;
  sharingModalNextAction?: 'submit' | 'approve';
}

export class VehicleRequestViewModel extends CommonEntity {
  constructor(
    public id: string,
    public requestCode: string,
    public userId: string,
    public user: UserModal,
    public departmentId: string,
    public departmentName: string,
    public purpose: string,
    public priority: keyof typeof vehicleRequestPriority,
    public numPassengers: number,
    public startDateTime: string,
    public endDateTime: string,
    public departureLocation: string,
    public destinationLocation: string,
    public status: keyof typeof vehicleRequestStatus,
    public contactPhone?: string,
    public projectId?: string,
    public projectName?: string,
    public requestedVehicleId?: string,
    public requestedVehicle?: PhuongTienModel,
    public notes?: string,
    public rejectNotes?: string,
    public createdOnDate?: string,
    public createdByUserName?: string,
    public createdByUserId?: string,
    public lastModifiedOnDate?: string,
    public lastModifiedByUserName?: string,
    public lastModifiedByUserId?: string,
    public activityHistories?: ActivityHistory[],
    public sharingGroupId?: string,
    public sharingGroupRequests?: VehicleRequestViewModel[],
  ) {
    super();
  }
}

export enum EstatusVehicleRequest {
  submitForApprovalPending = 'submitForApprovalPending',
  submitForApprovalFulfilled = 'submitForApprovalFulfilled',
  submitForApprovalRejected = 'submitForApprovalRejected',
  processApprovalPending = 'processApprovalPending',
  processApprovalFulfilled = 'processApprovalFulfilled',
  processApprovalRejected = 'processApprovalRejected',
  printPdfPending = 'printPdfPending',
  printPdfFulfilled = 'printPdfFulfilled',
  printPdfRejected = 'printPdfRejected',
  getRequestForChartPending = 'getRequestForChartPending',
  getRequestForChartFulfilled = 'getRequestForChartFulfilled',
  getRequestForChartRejected = 'getRequestForChartRejected',
  getExportConfigPending = 'getExportConfigPending',
  getExportConfigFulfilled = 'getExportConfigFulfilled',
  getExportConfigRejected = 'getExportConfigRejected',
  updateExportConfigPending = 'updateExportConfigPending',
  updateExportConfigFulfilled = 'updateExportConfigFulfilled',
  updateExportConfigRejected = 'updateExportConfigRejected',
  submitVehicleSharingPending = 'submitVehicleSharingPending',
  submitVehicleSharingFulfilled = 'submitVehicleSharingFulfilled',
  submitVehicleSharingRejected = 'submitVehicleSharingRejected',
  approveVehicleSharingPending = 'approveVehicleSharingPending',
  approveVehicleSharingFulfilled = 'approveVehicleSharingFulfilled',
  approveVehicleSharingRejected = 'approveVehicleSharingRejected',
}
