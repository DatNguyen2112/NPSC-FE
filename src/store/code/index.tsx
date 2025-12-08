import { CommonEntity, QueryParams } from '@models';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, TypesCodeTypeManagement, useAppDispatch, User, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'CodeTypeManagement';
// const action = new Action<CodeTypeManagement>(name);
const action = {
  ...new Action<CodeTypeManagement, EStatusCodeTypeManagement>(name),
  postKho: createAsyncThunk(name + '/postKho', async ({ values }: { values: any }) => {
    const res = await API.post(`${routerLinks(name, 'api')}`, values);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
};
export const codeTypeManagementSlice = createSlice(
  new Slice<CodeTypeManagement, EStatusCodeTypeManagement>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.postKho.pending, (state, action) => {
        state.isLoading = true;
        state.status = EStatusCodeTypeManagement.postKhoPending;
      })
      .addCase(action.postKho.fulfilled, (state, action) => {
        // state.status = EStatusCodeTypeManagement.postKhoFulfilled;
        // state.isLoading = false;
        const { ...res } = action.payload;
        if (res.data && JSON.stringify(state.data) !== JSON.stringify(res.data)) {
          state.data = res.data;
        }
        state.isVisible = false;
        state.isFormLoading = false;

        if (res.isSuccess) state.status = EStatusCodeTypeManagement.postKhoFulfilled;
        else state.status = EStatusCodeTypeManagement.idle;
      })
      .addCase(action.postKho.rejected, (state) => {
        state.status = EStatusCodeTypeManagement.postKhoRejected;
        state.isLoading = false;
      });
  }),
);
export const CodeTypeManagementFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateCodeType<CodeTypeManagement>),
    set: (values: StateCodeType<CodeTypeManagement>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateCodeType<CodeTypeManagement> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: CodeTypeManagement) => dispatch(action.post({ values })),
    put: (values: CodeTypeManagement) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    postKho: (values: CodeTypeManagement) => dispatch(action.postKho({ values })),
  };
};
interface StateCodeType<T> extends State<T, EStatusCodeTypeManagement> {
  isEdit?: boolean;
  isVisibleForm?: boolean;
  isVisibleFormCOA?: boolean;
  isCreateCodeType?: boolean;
  id?: string;
}
export class CodeTypeManagement extends CommonEntity {
  constructor(
    public code?: string,
    public type?: string,
    public title?: string,
    public order?: number,
    public description?: string,
    public iconClass?: string,
    public codeTypeItems?: [
      {
        id?: string;
        lineNumber?: number;
        code?: string;
        title?: string;
        iconClass?: string;
        codeTypeId?: string;
        createdOnDate?: string;
      },
    ],
    public createdAt?: string,
    public updatedAt?: string,
    public item?: TypesCodeTypeManagement,
    public users?: User[],
  ) {
    super();
  }
}

export enum EStatusCodeTypeManagement {
  idle = 'idle',
  postKhoPending = 'postKhoPending',
  postKhoFulfilled = 'postKhoFulfilled',
  postKhoRejected = 'postKhoRejected',
}
