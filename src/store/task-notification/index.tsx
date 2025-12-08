import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, setupStore, Slice, State, TaskModel, useAppDispatch, UserModal, useTypedSelector } from '@store';
import { API, notificationChannel, routerLinks } from '@utils';
import { initializeApp } from 'firebase/app';
import { deleteToken, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { customMessage, customNotification } from 'src';

const firebaseConfig = {
  apiKey: 'AIzaSyDdGb8pIwTgrIFtr8AwxYpiBz1KhDD_ztk',
  authDomain: 'xntv-npsc.firebaseapp.com',
  projectId: 'xntv-npsc',
  storageBucket: 'xntv-npsc.firebasestorage.app',
  messagingSenderId: '1075150774605',
  appId: '1:1075150774605:web:22445969339d6c3e3e5704',
  measurementId: 'G-491Y8BY1EJ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const channel = new BroadcastChannel(notificationChannel);
const receivePushNotification = createAction<TaskNotificationModel>('receivePushNotification');

export function setupMessaging(store: ReturnType<typeof setupStore>) {
  channel.addEventListener('message', (event) => {
    store.dispatch(receivePushNotification(event.data));
  });
  onMessage(messaging, (msg) => {
    const data: any = msg?.data;
    store.dispatch(receivePushNotification(data));
    customNotification.info({
      message: 'Thông báo mới',
      description: <div dangerouslySetInnerHTML={{ __html: data?.content }} />,
    });
  });
}

const name = 'TaskNotification';
const action = {
  ...new Action<TaskNotificationModel, EStatusTaskNotification>(name),
  revokeFCM: createAsyncThunk(name + 'revokeFCM', async () => {
    await deleteToken(messaging);
  }),
  requestNotification: createAsyncThunk(name + 'requestNotification', async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const token = await getToken(messaging, {
      vapidKey: 'BFkXKPLWmMN1cOBBLSPYIwBI4Zj1BuFdSyCCioRNK_Gqg-eSSlfUtJS40Fq9z8xicxNKs55X6U5H68VPUQZhfYc',
    });

    return await API.post(`${routerLinks(name, 'api')}/submit-notification`, { token });
  }),
  putMarkAsRead: createAsyncThunk(name + 'putMarkAsRead', async ({ notificationId }: { notificationId: string }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/mark-as-read/${notificationId}`);
    // if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  putMarkAllReadUser: createAsyncThunk(name + 'putMarkAllReadUser', async ({ userId }: { userId: string }) => {
    const res = await API.put(`${routerLinks(name, 'api')}/mark-all-read-user/${userId}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  deleteAllByUser: createAsyncThunk(name + '/deleteAllByUser', async ({ userId }: { userId: string }) => {
    const res = await API.delete(`${routerLinks(name, 'api')}/delete-all-by-user/${userId}`);
    if (res.message) customMessage.success({ type: 'success', content: res.message });
    return res;
  }),
  countUnread: createAsyncThunk(name + 'countUnread', () =>
    API.get<number>(`${routerLinks(name, 'api')}/count-unread`),
  ),
};
export const taskNotificationSlice = createSlice(
  new Slice<TaskNotificationModel, EStatusTaskNotification>(action, {}, (builder) => {
    builder
      .addCase(action.putMarkAsRead.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskNotification.putMarkAsReadPending;
      })
      .addCase(action.putMarkAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskNotification.putMarkAsReadFulfilled;
      })
      .addCase(action.putMarkAsRead.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskNotification.putMarkAsReadRejected;
      })

      .addCase(action.putMarkAllReadUser.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskNotification.putMarkAllReadUserPending;
      })
      .addCase(action.putMarkAllReadUser.fulfilled, (state) => {
        state.isLoading = false;
        state.list = state.list?.map((item: TaskNotificationModel) => ({ ...item, isRead: true })) || [];
        state.status = EStatusTaskNotification.putMarkAllReadUserFulfilled;
      })
      .addCase(action.putMarkAllReadUser.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskNotification.putMarkAllReadUserRejected;
      })

      .addCase(action.deleteAllByUser.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskNotification.deleteAllByUserPending;
      })
      .addCase(action.deleteAllByUser.fulfilled, (state) => {
        state.isLoading = false;
        state.list = [];
        state.status = EStatusTaskNotification.deleteAllByUserFulfilled;
      })
      .addCase(action.deleteAllByUser.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskNotification.deleteAllByUserRejected;
      })

      .addCase(action.countUnread.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTaskNotification.countUnreadPending;
      })
      .addCase(action.countUnread.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unreadCount = action.payload.data ?? 0;
        state.status = EStatusTaskNotification.countUnreadFulfilled;
      })
      .addCase(action.countUnread.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTaskNotification.countUnreadRejected;
      });
  }),
);
export const TaskNotificationFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateTaskNotification<TaskNotificationModel>),
    set: (values: StateTaskNotification<TaskNotificationModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: string;
      keyState?: keyof StateTaskNotification<TaskNotificationModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: TaskNotificationModel) => dispatch(action.post({ values })),
    put: (values: TaskNotificationModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    putMarkAsRead: (notificationId: string) => dispatch(action.putMarkAsRead({ notificationId })),
    putMarkAllReadUser: (userId: string) => dispatch(action.putMarkAllReadUser({ userId })),
    deleteAllByUser: (userId: string) => dispatch(action.deleteAllByUser({ userId })),
    countUnread: () => dispatch(action.countUnread()),
    revokeFCM: () => dispatch(action.revokeFCM()),
    requestNotification: () => dispatch(action.requestNotification()),
  };
};
interface StateTaskNotification<T> extends State<T, EStatusTaskNotification> {
  list?: TaskNotificationModel[];
  unreadCount?: number;
  isViewPrev?: boolean;
  isPrevAvailable?: boolean;
}
export class TaskNotificationModel extends CommonEntity {
  constructor(
    public id: string,
    public notificationStatus: string,
    public approvalType?: string,
    public avatarUrl?: string,
    public isRead?: boolean,
    public idm_User?: UserModal,
    public task?: TaskModel,
    public content?: string,
    public additionalData?: string[],
  ) {
    super();
  }
}

export enum EStatusTaskNotification {
  putMarkAsReadPending = 'putMarkAsReadPending',
  putMarkAsReadFulfilled = 'putMarkAsReadFulfilled',
  putMarkAsReadRejected = 'putMarkAsReadRejected',

  putMarkAllReadUserPending = 'putMarkAllReadUserPending',
  putMarkAllReadUserFulfilled = 'putMarkAllReadUserFulfilled',
  putMarkAllReadUserRejected = 'putMarkAllReadUserRejected',

  deleteAllByUserPending = 'deleteAllByUserPending',
  deleteAllByUserFulfilled = 'deleteAllByUserFulfilled',
  deleteAllByUserRejected = 'deleteAllByUserRejected',

  countUnreadPending = 'countUnreadPending',
  countUnreadFulfilled = 'countUnreadFulfilled',
  countUnreadRejected = 'countUnreadRejected',
}
