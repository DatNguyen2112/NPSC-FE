import { CommonEntity, QueryParams } from '@models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { keyToken, linkApi, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'WeekReport';
const action = {
  ...new Action<WeekReportViewModel, EStatusWeekReport>(name),
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
  // shareUser: createAsyncThunk(name + 'shareUser', async ({ id, data }: { id: string; data: WeekReportViewModel }) => {
  //   const res = await API.post(`/obj-map/user/${id}`, data);
  //   if (res.message) await Message.success({ text: res.message });
  //   return res;
  // }),
};
export const WeekReportSlice = createSlice(
  new Slice<WeekReportViewModel, EStatusWeekReport>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.exportListToExcel.pending, (state) => {
        state.status = EStatusWeekReport.exportExcelPending;
        state.isLoading = true;
      })
      .addCase(action.exportListToExcel.fulfilled, (state) => {
        state.status = EStatusWeekReport.exportExcelFulfilled;
        state.isLoading = false;
      })
      .addCase(action.exportListToExcel.rejected, (state) => {
        state.status = EStatusWeekReport.exportExcelRejected;
        state.isLoading = false;
      });
  }),
);

export const WeekReportFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...(useTypedSelector((state) => state[action.name]) as StateWeekReport<WeekReportViewModel>),
    set: (values: StateWeekReport<WeekReportViewModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateWeekReport<WeekReportViewModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: WeekReportViewModel) => dispatch(action.post({ values })),
    put: (values: WeekReportViewModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    exportListToExcel: (params: QueryParams) => dispatch(action.exportListToExcel({ params })),
  };
};
interface StateWeekReport<T> extends State<T, EStatusWeekReport> {
  isVisibleForm?: boolean;
}
export class WeekReportViewModel extends CommonEntity {
  constructor(
    public id: string,
    public code: string,
    public title?: string,
    public lastWeekPlan?: string,
    public processResult?: string,
    public nextWeekPlan?: string,
    public constructionId?: string,
    public statusCode?: string,
    public statusName?: string,
    public startDate?: string,
    public endDate?: string,
    public fileAttachments?: any[],
  ) {
    super();
  }
}
export enum EStatusWeekReport {
  idle = 'idle',

  /// Export
  exportExcelPending = 'exportExcelPending',
  exportExcelFulfilled = 'exportExcelFulfilled',
  exportExcelRejected = 'exportExcelRejected',
}
