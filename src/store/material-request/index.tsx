import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State, CustomerModel, ConstructionModel } from '@store';
import { CommonEntity, EStatusState, QueryParams } from '@models';
import { API, routerLinks } from '@utils';
import { Message } from '@core/message';
import { customMessage } from '../../index';

const name = 'MaterialRequest';

const action = {
  ...new Action<MaterialRequestModel, EStatusMaterialRequest>(name),
  // Gửi duyệt
  requestApproveMaterialRequest: createAsyncThunk(
    name + 'requestApproveMaterialRequest',
    async ({ id }: { id: string }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/request-approve-material-request/${id}`);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),

  // Duyệt
  approveMaterialRequest: createAsyncThunk(name + 'approveMaterialRequest', async ({ id }: { id: string }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/approve-material-request/${id}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),

  // Từ chối duyệt
  rejectApproveMaterialRequest: createAsyncThunk(
    name + 'rejectApproveMaterialRequest',
    async ({ id, values }: { id: string; values: any }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/reject-approve-material-request/${id}`, values);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
};

export const MaterialRequestSlice = createSlice(
  new Slice<MaterialRequestModel, EStatusMaterialRequest>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      // Gửi duyệt
      .addCase(action.requestApproveMaterialRequest.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusMaterialRequest.requestApproveMaterialRequestPending;
      })
      .addCase(action.requestApproveMaterialRequest.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusMaterialRequest.requestApproveMaterialRequestFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.requestApproveMaterialRequest.rejected, (state) => {
        state.status = EStatusMaterialRequest.requestApproveMaterialRequestRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      // Duyệt
      .addCase(action.approveMaterialRequest.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusMaterialRequest.approveMaterialRequestPending;
      })
      .addCase(action.approveMaterialRequest.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusMaterialRequest.approveMaterialRequestFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.approveMaterialRequest.rejected, (state) => {
        state.status = EStatusMaterialRequest.approveMaterialRequestRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      // Từ chối duyệt
      .addCase(action.rejectApproveMaterialRequest.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusMaterialRequest.rejectApproveMaterialRequestPending;
      })
      .addCase(action.rejectApproveMaterialRequest.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusMaterialRequest.rejectApproveMaterialRequestFulfilled;
        } else state.status = EStatusState.idle;
        state.isFormLoading = false;
        state.isLoading = false;
      })
      .addCase(action.rejectApproveMaterialRequest.rejected, (state) => {
        state.status = EStatusMaterialRequest.rejectApproveMaterialRequestRejected;
        state.isFormLoading = false;
        state.isLoading = false;
      });
  }),
);

export const MaterialRequestFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateMaterialRequest<MaterialRequestModel>),
    set: (values: StateMaterialRequest<MaterialRequestModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: any;
      keyState?: keyof StateMaterialRequest<MaterialRequestModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: MaterialRequestModel) => dispatch(action.post({ values })),
    put: (values: MaterialRequestModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    requestApproveMaterialRequest: ({ id }: { id: string | any }) =>
      dispatch(action.requestApproveMaterialRequest({ id })),
    rejectApproveMaterialRequest: ({ id, values }: { id: string | any; values: any }) =>
      dispatch(action.rejectApproveMaterialRequest({ id, values })),
    approveMaterialRequest: ({ id }: { id: string | any }) => dispatch(action.approveMaterialRequest({ id })),
  };
};
interface StateMaterialRequest<T> extends State<T, EStatusMaterialRequest> {
  isEdit?: boolean;
  newPackageData?: MaterialRequestModel;
  activeKey?: string | any;
  isOpenRejectReason?: boolean;
  materialRequestId?: string;

  // Thêm nhanh sản phẩm
  isProductManyModal?: boolean;
  checkedList?: [] | any;
  isCheckAll?: boolean;
  arrChoose?: [] | any;
}

export class MaterialRequestModel extends CommonEntity {
  constructor(
    public id: string | any,
    public code: string,
    public content: string | any,
    public dateProcess: string | any,
    public construction: ConstructionModel,
    public constructionName: string,
    public priority?: string | any,
    public materialRequestItems?: MaterialRequestViewModel | any,
    public statusCode?: string | any,
    public constructionId?: string,
    public note?: string,
  ) {
    super();
  }
}

export class AdvanceRequestViewModel extends CommonEntity {
  constructor(
    public id: string | any,
    public code: string,
    public content: string | any,
    public dueDate: string | any,
    public construction: ConstructionModel,
    public constructionName: string,
    public priorityLevelCode?: string | any,
    public materialRequestItems?: MaterialRequestViewModel,
    public statusCode?: string | any,
    public constructionId?: string,
    public note?: string,
  ) {
    super();
  }
}

export class MaterialRequestViewModel extends CommonEntity {
  constructor(
    public lineNo?: number,
    public name?: string,
    public code?: string,
    public unit?: string,
    public unitPrice?: number | any,
    public importVATPercent?: number | any,
    public plannedQuantity?: number | any,
    public productId?: string,
    public balanceQuantity?: number | any,
    public requestQuantity?: number | any,
    public lineNote?: string | any,
    public attachmentUrl?: string | any,
  ) {
    super();
  }
}
//
// export class SuggestInventoryViewModel extends CommonEntity {
//   constructor(
//     public id: string,
//     public code?: string,
//     public content?: string,
//     public priority?: string,
//     public dateProcess?: string,
//     public statusCode?: string,
//     public constructionId?: string,
//     public constructionItem?: SuggestInventoryModel,
//   ) {
//     super();
//   }
// }
//
// export type PredicateInventoryModel = {
//   name: string;
//   code: string;
//   unit: string;
//   planQuantity: number;
//   productId: string;
//   lineNote: string,
// }
//
// export type SuggestInventoryModel = {
//   name: string;
//   code: string;
//   unit: string;
//   actualQuantity: number;
//   productId: string;
//   lineNote: string,
// }
//
// export type TeamInventoryModel = {
//   name: string;
//   captain: string;
//   participants: string[] | any;
//   lineNote: string,
// }

export enum EStatusMaterialRequest {
  requestApproveMaterialRequestPending = 'requestApproveMaterialRequestPending',
  requestApproveMaterialRequestFulfilled = 'requestApproveMaterialRequestFulfilled',
  requestApproveMaterialRequestRejected = 'requestApproveMaterialRequestRejected',

  approveMaterialRequestPending = 'approveMaterialRequestPending',
  approveMaterialRequestFulfilled = 'approveMaterialRequestFulfilled',
  approveMaterialRequestRejected = 'approveMaterialRequestRejected',

  rejectApproveMaterialRequestPending = 'rejectApproveMaterialRequestPending',
  rejectApproveMaterialRequestFulfilled = 'rejectApproveMaterialRequestFulfilled',
  rejectApproveMaterialRequestRejected = 'rejectApproveMaterialRequestRejected',
}
