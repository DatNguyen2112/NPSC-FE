import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

import {
  useAppDispatch,
  useTypedSelector,
  Action,
  Slice,
  State,
  ChucVuModel,
  PhongBanModel,
  CodeTypeModel
} from '@store';
import { CommonEntity, QueryParams } from '@models';
import { TransferKey } from 'antd/es/transfer/interface';
import { API } from '@utils';
import { customMessage } from 'src';

const name = 'User';
const action = {
  ...new Action<QuanLyNguoiDung, EStatusNguoiDung>(name),
  lock: createAsyncThunk(name + 'lock', async (id: string) => {
    const { data, message } = await API.put(`/idm/users/${id}/lock`);
    if (message) await customMessage.success({ content: message });
    return data;
  }),
  unlock: createAsyncThunk(name + 'unlock', async (id: string) => {
    const { data, message } = await API.put(`/idm/users/${id}/unlock`);
    if (message) await customMessage.success({ content: message });
    return data;
  }),
  changePassword: createAsyncThunk(
    name + 'changePassword',
    async ({ id, password }: { id: string; password: string }) => {
      const { data, message } = await API.put(`/idm/users/${id}/password`, password);
      if (message) await customMessage.success({ content: message });
      return data;
    },
  ),
};
export const quanLyNguoiDungSlice = createSlice(
  // new Slice<QuanLyNguoiDung>(action)
  new Slice<QuanLyNguoiDung, EStatusNguoiDung>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.lock.pending, (state, action) => {
        state.isLoading = true;
        state.status = EStatusNguoiDung.lockPending;
      })
      .addCase(action.lock.fulfilled, (state, action) => {
        state.status = EStatusNguoiDung.lockFulfilled;
        state.isLoading = false;
      })
      .addCase(action.lock.rejected, (state) => {
        state.status = EStatusNguoiDung.lockRejected;
        state.isLoading = false;
      })
      .addCase(action.unlock.pending, (state, action) => {
        state.isLoading = true;
        state.status = EStatusNguoiDung.unlockPending;
      })
      .addCase(action.unlock.fulfilled, (state, action) => {
        state.status = EStatusNguoiDung.unlockFulfilled;
        state.isLoading = false;
      })
      .addCase(action.unlock.rejected, (state) => {
        state.status = EStatusNguoiDung.unlockRejected;
        state.isLoading = false;
      })

      .addCase(
        action.changePassword.pending,
        (
          state: StateQuanLyNguoiDung<QuanLyNguoiDung>,
          action: PayloadAction<
            undefined,
            string,
            { arg: QuanLyNguoiDung; requestId: string; requestStatus: 'pending' }
          >,
        ) => {
          state.data = action.meta.arg;
          state.isLoading = true;
          state.status = EStatusNguoiDung.changePasswordPending;
        },
      )
      .addCase(action.changePassword.fulfilled, (state: StateQuanLyNguoiDung<QuanLyNguoiDung>) => {
        state.data = undefined;
        state.isVisibleChangePass = false;
        state.status = EStatusNguoiDung.changePasswordFulfilled;
        state.isLoading = false;
      })
      .addCase(action.changePassword.rejected, (state: StateQuanLyNguoiDung<QuanLyNguoiDung>) => {
        state.status = EStatusNguoiDung.changePasswordRejected;
        state.isLoading = false;
      });
  }),
);
export const QuanLyNguoiDungFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateQuanLyNguoiDung<QuanLyNguoiDung>),
    set: (values: StateQuanLyNguoiDung<QuanLyNguoiDung>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateQuanLyNguoiDung<QuanLyNguoiDung> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: QuanLyNguoiDung) => dispatch(action.post({ values })),
    put: (values: QuanLyNguoiDung) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    lock: (id: string) => dispatch(action.lock(id)),
    unlock: (id: string) => dispatch(action.unlock(id)),
    changePassword: (id: string, password: any) => dispatch(action.changePassword({ id, password })),
  };
};
interface StateQuanLyNguoiDung<T> extends State<T, EStatusNguoiDung> {
  isVisibleChangePass?: boolean;
  isEdit?: boolean;
  targetKeys?: TransferKey[];
  isDetail?: boolean;
  isPassword?: boolean;
  isFilterVisible?: boolean;
  listItems?: any;
}
export class QuanLyNguoiDung extends CommonEntity {
  constructor(
    public listRole?: any,
    public id?: string,
    public ma?: string,
    public userName?: string,
    public name?: string,
    public chucVu?: ChucVuModel,
    public phongBan?: CodeTypeModel,
    public toThucHien?: any,
    public phoneNumber?: string,
    public countryCode?: string,
    public gender?: string,
    public email?: string,
    public avatarUrl?: string,
    public bankAccountNo?: string,
    public bankName?: string,
    public bankUsername?: string,
    public birthdate?: string,
    public plainTextPwd?: string,
    public lastActivityDate?: string,
    public isLockedOut?: any,
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
    public role?: any,
    public roleCode?: string,
  ) {
    super();
  }
}

export enum EStatusNguoiDung {
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
}
