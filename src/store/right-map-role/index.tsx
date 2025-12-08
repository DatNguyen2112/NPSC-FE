import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, EStatusState } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'RightMapRole';
const action = {
  ...new Action<RightMapRole, EStatusRightMapRole>(name),
  getConfig: createAsyncThunk(name + 'getConfig', async ({ groupCode }: { groupCode: string }) => {
    return await API.get<Record<string, string[]>>(`${routerLinks(name, 'api')}/config/${groupCode}`);
  }),
  putConfig: createAsyncThunk(
    name + 'putConfig',
    async ({ groupCode, rights }: { groupCode: string; rights: { roleId: string; rightIds: string[] }[] }) => {
      const res = await API.put(`${routerLinks(name, 'api')}/config/${groupCode}`, rights);
      if (res.message) customMessage.success({ type: 'success', content: res.message });
      return res;
    },
  ),
  getRightMapByCode: createAsyncThunk(name + 'getRightMapByCode', async ({ groupCode }: { groupCode: string }) => {
    return await API.get(`${routerLinks(name, 'api')}/code/${groupCode}`);
  }),
  getRightMapByListCode: createAsyncThunk(
    name + 'getRightMapByListCode',
    async ({ groupCode }: { groupCode: string }) => {
      return await API.get(`${routerLinks(name, 'api')}/codes/${groupCode}`);
    },
  ),
};

export const rightMapRoleSlice = createSlice(
  new Slice<RightMapRole, EStatusRightMapRole>(action, {}, (builder) => {
    builder
      .addCase(action.getConfig.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusRightMapRole.getConfigPending;
      })
      .addCase(action.getConfig.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusRightMapRole.getConfigFulfilled;
          state.configList = action.payload.data;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getConfig.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusRightMapRole.getConfigRejected;
      })
      .addCase(action.putConfig.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusRightMapRole.putConfigPending;
      })
      .addCase(action.putConfig.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusRightMapRole.putConfigFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.putConfig.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusRightMapRole.putConfigRejected;
      })
      .addCase(action.getRightMapByCode.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusRightMapRole.getRightMapByCodePending;
      })
      .addCase(action.getRightMapByCode.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusRightMapRole.getRightMapByCodeFulfilled;
          state.rightData = action.payload.data;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getRightMapByCode.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusRightMapRole.getRightMapByCodeRejected;
      })
      .addCase(action.getRightMapByListCode.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusRightMapRole.getRightMapByListCodePending;
      })
      .addCase(action.getRightMapByListCode.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusRightMapRole.getRightMapByCodeFulfilled;
          state.rightDatas = action.payload.data;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getRightMapByListCode.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusRightMapRole.getRightMapByListCodeRejected;
      });
  }),
);

export const RightMapRoleFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateRightMapRole<RightMapRole>),
    set: (values: StateRightMapRole<RightMapRole>) => dispatch(action.set(values)),
    get: (params: any) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateRightMapRole<RightMapRole> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: RightMapRole) => dispatch(action.post({ values })),
    put: (values: RightMapRole) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    getConfig: (groupCode: string) => dispatch(action.getConfig({ groupCode })),
    putConfig: (groupCode: string, rights: { roleId: string; rightIds: string[] }[]) =>
      dispatch(action.putConfig({ groupCode, rights })),
    getRightMapByCode: (groupCode: string) => dispatch(action.getRightMapByCode({ groupCode })),
    getRightMapByListCode: (groupCode: string) => dispatch(action.getRightMapByListCode({ groupCode })),
  };
};

interface StateRightMapRole<T> extends State<T, EStatusRightMapRole> {
  configList?: Record<string, string[]>;
  rightData?: RightMapRole;
  rightDatas?: RightMapRole[];
  rightDataByPermission?: RightDataByPermission[] | any;
}

export class RightMapRole extends CommonEntity {
  constructor(
    public groupCode?: string,
    public rightCodes?: string[],
  ) {
    super();
  }
}

export class RightDataByPermission extends CommonEntity {
  constructor(
    public rightCode?: string,
    public level?: number,
  ) {
    super();
  }
}

export enum EStatusRightMapRole {
  getConfigPending = 'getConfigPending',
  getConfigFulfilled = 'getConfigFulfilled',
  getConfigRejected = 'getConfigRejected',
  putConfigPending = 'putConfigPending',
  putConfigFulfilled = 'putConfigFulfilled',
  putConfigRejected = 'putConfigRejected',
  getRightMapByCodePending = 'getRightMapByCodePending',
  getRightMapByCodeFulfilled = 'getRightMapByCodeFulfilled',
  getRightMapByCodeRejected = 'getRightMapByCodeRejected',
  getRightMapByListCodePending = 'getRightMapByListCodePending',
  getRightMapByListCodeFulfilled = 'getRightMapByListCodeFulfilled',
  getRightMapByListCodeRejected = 'getRightMapByListCodeRejected',
}
