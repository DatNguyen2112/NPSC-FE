import { CommonEntity, Pagination, QueryParams, Responses } from '@models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  Action,
  ActivityHistory,
  CodeTypeModel,
  ConstructionModel,
  Slice,
  State,
  useAppDispatch,
  useTypedSelector,
} from '@store';
import { API, keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';

export const contractFilterFieldNameMap = {
  fullTextSearch: 'Từ khoá',
  code: 'Mã hợp đồng',
  constructionId: 'Công trình/Dự án',
  templateStageId: 'Giai đoạn',
  consultingServiceId: 'Dịch vụ tư vấn',
  assignmentAYear: 'Năm giao A',
  valueBeforeVatAmountRange: 'Giá trị hợp đồng (trước VAT)',
  approvalDateRange: 'Ngày phê duyệt',
  invoiceIssuanceDateRange: 'Ngày xuất hóa đơn',
  voltageTypeCode: 'Cấp điện áp',
};

export const contractImplementationStatuses = {
  NotImplemented: {
    value: 'NotImplemented',
    label: 'Chưa triển khai',
    color: 'gold',
  },
  InProgress: {
    value: 'InProgress',
    label: 'Đang thực hiện',
    color: 'blue',
  },
  PendingApproval: {
    value: 'PendingApproval',
    label: 'Đang trình duyệt',
    color: 'geekblue',
  },
  Approved: {
    value: 'Approved',
    label: 'Đã phê duyệt',
    color: 'cyan',
  },
  OnHoldOrSuspended: {
    value: 'OnHoldOrSuspended',
    label: 'Vướng mắc/Tạm dừng',
    color: 'red',
  },
};

export const contractAcceptanceDocumentStatuses = {
  TransferredToOwner: {
    value: 'TransferredToOwner',
    label: 'Đã chuyển HS cho CĐT',
    color: 'green',
  },
  NotPrepared: {
    value: 'NotPrepared',
    label: 'Chưa lập hồ sơ',
    color: 'default',
  },
};

export const contractInvoiceStatuses = {
  Issued: {
    value: 'Issued',
    label: 'Đã xuất hoá đơn',
    color: 'green',
  },
  NotIssued: {
    value: 'NotIssued',
    label: 'Chưa xuất hoá đơn',
    color: 'default',
  },
};

export const contractSupplementaryContractRequires = {
  Required: {
    value: 'Required',
    label: 'Cần ký PLHĐ',
    color: 'red',
  },
  NotRequired: {
    value: 'NotRequired',
    label: 'Không cần ký PLHĐ',
    color: 'default',
  },
};
const name = 'Contract';
const action = {
  ...new Action<ContractModel, EContractStatus>(name),
  countByStatus: createAsyncThunk(
    name + '/count-by-status',
    async (params: QueryParams) =>
      await API.get<Record<string, number>>(`${routerLinks(name, 'api')}/count-by-status`, params),
  ),
  getDebtReport: createAsyncThunk(
    name + '/getDebtReport',
    async (params: QueryParams) => await API.get(`${routerLinks(name, 'api')}/debt-report`, params),
  ),
  exportExcel: createAsyncThunk(name + '/exportExcel', async (queryParams: QueryParams) => {
    try {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });

      const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/export-excel?${params}`, {
        method: 'GET',
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
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = 'Danh sách hợp đồng.xlsx';
      downloadLink.click();
      window.URL.revokeObjectURL(downloadLink.href);
      customMessage.success({ content: 'Xuất file thành công' });
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Có lỗi xảy ra khi xuất file';
      customMessage.error({ content: errorMessage });
    }
  }),
  importExcel: createAsyncThunk(name + '/importExcel', async (params: { file: File; overwrite: boolean }) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('overwrite', params.overwrite.toString());

    const res = await fetch(`${linkApi}${routerLinks(name, 'api')}/import-excel`, {
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
};
export const contractSlice = createSlice(
  new Slice<ContractModel, EContractStatus>(action, {}, (builder) => {
    builder
      .addCase(action.countByStatus.pending, (state) => {
        state.status = EContractStatus.countByStatusPending;
      })
      .addCase(action.countByStatus.fulfilled, (state: StateContract<ContractModel>, action) => {
        state.countByStatusResult = action.payload.data;
        state.status = EContractStatus.countByStatusFulfilled;
      })
      .addCase(action.countByStatus.rejected, (state) => {
        state.status = EContractStatus.countByStatusRejected;
      })
      .addCase(action.getDebtReport.pending, (state) => {
        state.isLoading = true;
        state.status = EContractStatus.getDebtReportPending;
      })
      .addCase(action.getDebtReport.fulfilled, (state, action: any) => {
        const { ...res } = action.payload;
        if (res.data) state.paginationDebtReport = res.data;
        state.isLoading = false;
        state.status = EContractStatus.getDebtReportFulfilled;
      })
      .addCase(action.getDebtReport.rejected, (state) => {
        state.isLoading = false;
        state.status = EContractStatus.getDebtReportRejected;
      })
      .addCase(action.exportExcel.pending, (state) => {
        state.isExportingFile = true;
        state.status = EContractStatus.exportExcelPending;
      })
      .addCase(action.exportExcel.fulfilled, (state) => {
        state.isExportingFile = false;
        state.status = EContractStatus.exportExcelFulfilled;
      })
      .addCase(action.exportExcel.rejected, (state) => {
        state.isExportingFile = false;
        state.status = EContractStatus.exportExcelRejected;
      })
      .addCase(action.importExcel.pending, (state) => {
        state.isImportingFile = true;
        state.status = EContractStatus.importExcelPending;
      })
      .addCase(action.importExcel.fulfilled, (state, action) => {
        if (action.payload.isSuccess) {
          state.isImportFileModalOpen = false;
          customMessage.success({ content: 'Nhập file thành công' });
        } else {
          customMessage.error({ content: action.payload.message });
        }
        state.isImportingFile = false;
        state.status = EContractStatus.importExcelFulfilled;
      })
      .addCase(action.importExcel.rejected, (state) => {
        state.isImportingFile = false;
        state.status = EContractStatus.importExcelRejected;
      });
  }),
);
export const ContractFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateContract<ContractModel>),
    set: (values: StateContract<ContractModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateContract<ContractModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: ContractModel) => dispatch(action.post({ values })),
    put: (values: ContractModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    countByStatus: (params: QueryParams) => dispatch(action.countByStatus(params)),
    getDebtReport: (params: QueryParams) => dispatch(action.getDebtReport(params)),
    exportExcel: (params: QueryParams) => dispatch(action.exportExcel(params)),
    importExcel: (file: File, overwrite: boolean) => dispatch(action.importExcel({ file, overwrite })),
  };
};

export const contractAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

interface StateContract<T> extends State<T, EContractStatus> {
  isFilterDrawerOpen?: boolean;
  countByStatusResult?: Record<string, number>;
  paginationDebtReport?: Pagination<T>;
  isExportingFile?: boolean;
  isImportingFile?: boolean;
  isExportFileModalOpen?: boolean;
  isImportFileModalOpen?: boolean;
}

export class AppendixAttachment {
  constructor(
    public id: string,
    public fileName: string,
    public fileType: string,
    public filePath: string,
    public fileUrl: string,
  ) {}
}

export class ContractAppendix {
  constructor(
    public content: string,
    public attachment?: AppendixAttachment,
    public attachmentId?: string,
  ) {}
}

export class ContractModel extends CommonEntity {
  constructor(
    public id: string,
    public code: string,
    public constructionId: string,
    public construction: ConstructionModel,
    public templateStageId: string,
    public templateStageName: string,
    public assignmentAYear: number,
    public consultingServiceId: string,
    public consultingService: CodeTypeModel,
    public implementationStatus: keyof typeof contractImplementationStatuses,
    public createdByUserId: string,
    public createdByUserName: string,
    public createdOnDate: string,
    public invoiceIssuanceDates: string[],
    public appendices: ContractAppendix[],
    public contractNumber?: string,
    public valueBeforeVatAmount?: number,
    public expectedVolume?: number,
    public settlementValueAmount?: number,
    public acceptanceValueBeforeVatAmount?: number,
    public paidAmount?: number,
    public taxRatePercentage?: number,
    public expectedApprovalMonth?: string,
    public approvalDate?: string,
    public expectedAcceptanceMonth?: string,
    public acceptanceYear?: number,
    public contractSigningDate?: string,
    public contractDurationDays?: number,
    public issues?: string,
    public notes?: string,
    public acceptanceDocumentStatus?: keyof typeof contractAcceptanceDocumentStatuses,
    public designApprovalDate?: string,
    public invoiceStatus?: keyof typeof contractInvoiceStatuses,
    public handoverRecordDate?: string,
    public siteSurveyRecordDate?: string,
    public surveyAcceptanceRecordDate?: string,
    public supplementaryContractRequired?: keyof typeof contractSupplementaryContractRequires,
    public acceptancePlan?: string,
    public activityHistories?: ActivityHistory[],
  ) {
    super();
  }
}

export enum EContractStatus {
  countByStatusPending = 'countByStatusPending',
  countByStatusFulfilled = 'countByStatusFulfilled',
  countByStatusRejected = 'countByStatusRejected',
  getDebtReportFulfilled = 'getDebtReportFulfilled',
  getDebtReportPending = 'getDebtReportPending',
  getDebtReportRejected = 'getDebtReportRejected',
  exportExcelPending = 'exportExcelPending',
  exportExcelFulfilled = 'exportExcelFulfilled',
  exportExcelRejected = 'exportExcelRejected',
  importExcelPending = 'importExcelPending',
  importExcelFulfilled = 'importExcelFulfilled',
  importExcelRejected = 'importExcelRejected',
}
