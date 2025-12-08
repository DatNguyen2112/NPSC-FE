import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

import { Message } from '@core/message';
import { CommonEntity, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API } from '@utils';
import { TransferKey } from 'antd/es/transfer/interface';
import { customMessage } from 'src';

const name = 'User';
export const action = {
  ...new Action<UserModal, EStatusUser>(name),
  lock: createAsyncThunk(name + 'lock', async (id: string) => {
    const { data, message } = await API.put(`/idm/users/${id}/lock`);
    if (message) await Message.success({ text: message });
    return data;
  }),
  unlock: createAsyncThunk(name + 'unlock', async (id: string) => {
    const { data, message } = await API.put(`/idm/users/${id}/unlock`);
    if (message) await Message.success({ text: message });
    return data;
  }),
  changePassword: createAsyncThunk(
    name + 'changePassword',
    async ({ id, oldPassword, password }: { id: string; oldPassword: string; password: string }) => {
      const { data, message } = await API.put(`/idm/users/${id}/changepassword`, {}, { oldPassword, password });
      if (message) await Message.success({ text: message });
      return data;
    },
  ),
  putAvatar: createAsyncThunk(name + 'putAvatar', async ({ id, avatarUrl }: { id: string; avatarUrl: string }) => {
    const { data, message } = await API.put(`/idm/users/${id}/avatar`, {}, { avatarUrl });
    if (message) await customMessage.success({ type: 'success', content: message });
    return data;
  }),
};
export const userSlice = createSlice(
  new Slice<UserModal, EStatusUser>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.lock.pending, (state, action) => {
        state.data = action.meta.arg as Draft<UserModal>;
        state.isLoading = true;
        state.status = EStatusUser.lockPending;
      })
      .addCase(action.lock.fulfilled, (state, action) => {
        if (action.payload) {
          if (JSON.stringify(state.data) !== JSON.stringify(action.payload)) state.data = action.payload;
          state.isVisible = false;
          state.status = EStatusUser.lockFulfilled;
        } else state.status = EStatusUser.idle;
        state.isLoading = false;
      })
      .addCase(action.lock.rejected, (state) => {
        state.status = EStatusUser.lockRejected;
        state.isLoading = false;
      })
      .addCase(action.unlock.pending, (state, action) => {
        state.data = action.meta.arg as Draft<UserModal>;
        state.isLoading = true;
        state.status = EStatusUser.unlockPending;
      })
      .addCase(action.unlock.fulfilled, (state, action) => {
        if (action.payload) {
          if (JSON.stringify(state.data) !== JSON.stringify(action.payload)) state.data = action.payload;
          state.isVisible = false;
          state.status = EStatusUser.unlockFulfilled;
        } else state.status = EStatusUser.idle;
        state.isLoading = false;
      })
      .addCase(action.unlock.rejected, (state) => {
        state.status = EStatusUser.unlockRejected;
        state.isLoading = false;
      })

      .addCase(
        action.changePassword.pending,
        (
          state: StateUser<UserModal>,
          action: PayloadAction<undefined, string, { arg: UserModal; requestId: string; requestStatus: 'pending' }>,
        ) => {
          state.data = action.meta.arg;
          state.isLoading = true;
          state.status = EStatusUser.changePasswordPending;
        },
      )
      .addCase(action.changePassword.fulfilled, (state: StateUser<UserModal>) => {
        state.data = undefined;
        state.isVisibleChangePass = false;
        state.status = EStatusUser.changePasswordFulfilled;
        state.isLoading = false;
      })
      .addCase(action.changePassword.rejected, (state: StateUser<UserModal>) => {
        state.status = EStatusUser.changePasswordRejected;
        state.isLoading = false;
      })
      .addCase(action.putAvatar.pending, (state, action) => {
        state.data = action.meta.arg as Draft<UserModal>;
        state.isLoading = true;
        state.status = EStatusUser.putAvatarPending;
      })
      .addCase(action.putAvatar.fulfilled, (state, action) => {
        if (action.payload) {
          if (JSON.stringify(state.data) !== JSON.stringify(action.payload)) state.data = action.payload;
          state.isVisible = false;
          state.status = EStatusUser.putAvatarFulfilled;
        } else state.status = EStatusUser.idle;
        state.isLoading = false;
      })
      .addCase(action.putAvatar.rejected, (state) => {
        state.status = EStatusUser.putAvatarRejected;
        state.isLoading = false;
      });
  }),
);

export const UserFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateUser<UserModal>),
    set: (values: StateUser<UserModal>) => dispatch(action.set(values)),
    get: (params: any) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateUser<UserModal> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: UserModal) => dispatch(action.post({ values })),
    put: (values: UserModal) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    lock: (id: string) => dispatch(action.lock(id)),
    unlock: (id: string) => dispatch(action.unlock(id)),
    changePassword: (id: string, oldPassword: string, password: string) =>
      dispatch(action.changePassword({ id, oldPassword, password })),
    putAvatar: (id: string, avatarUrl: string) => dispatch(action.putAvatar({ id, avatarUrl })),
  };
};
interface StateUser<T> extends State<T, EStatusUser> {
  isVisibleChangePass?: boolean;
  isEdit?: boolean;
  targetKeys?: TransferKey[];
  isDetail?: boolean;
}
export class UserModal extends CommonEntity {
  constructor(
    public listRole?: {
      id?: string;
      code?: string;
      name?: string;
      isSystem?: boolean;
      level?: number;
    }[],
    public id?: string,
    public userName?: string,
    public name?: string,
    public phoneNumber?: string,
    public countryCode?: string,
    public gender?: string,
    public email?: string,
    public avatarUrl?: string,
    public bankAccountNo?: string,
    public bankName?: string,
    public bankUsername?: string,
    public birthdate?: string,
    public lastActivityDate?: string,
    public isLockedOut?: boolean,
    public isActive?: boolean,
    public activeDate?: string,
    public level?: number,
    public facebookUserId?: string,
    public googleUserId?: string,
    public emailVerifyToken?: string,
    public roleListCode?: string[],
    public profileType?: string,
    public createdOnDate?: string,
    public isEmailVerified?: boolean,
    public role?: string,
    public roleCode?: string,
    public phongBan?: any,
    public toThucHien?: any,
    public chucVu?: any,
    public maPhongBan?: string,
  ) {
    super();
  }
}
export enum EStatusUser {
  idle = 'idle',
  lockPending = 'lockPending',
  lockFulfilled = 'lockFulfilled',
  lockRejected = 'lockRejected',
  unlockPending = 'unlockPending',
  unlockFulfilled = 'unlockFulfilled',
  unlockRejected = 'unlockRejected',
  changePasswordPending = 'changePasswordPending',
  changePasswordFulfilled = 'changePasswordFulfilled',
  changePasswordRejected = 'changePasswordRejected',
  putAvatarPending = 'putAvatarPending',
  putAvatarFulfilled = 'putAvatarFulfilled',
  putAvatarRejected = 'putAvatarRejected',
}
