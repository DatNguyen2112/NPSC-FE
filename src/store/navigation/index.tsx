import { ActionReducerMapBuilder, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { EStatusState, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { API } from '@utils';
import { TreeNodeProps } from 'antd';

interface StateNavigation<T> extends State<T, EStatusNavigation> {
  tree?: TreeNodeProps[];
  menu?: TreeNodeProps[];
  treeFilter?: T[];
}

export class Navigation {
  constructor(
    public parentId: string,
    public urlRewrite: string,
    public iconClass: string,
    public subChild: Navigation[],
    public roleList: string[],
    public subUrl: string,
    public type: number,
    public id: string,
    public code: string,
    public name: string,
    public idPath: string,
    public queryParams: string,
    public path: string,
    public level: number,
    public order: number,
    public status: boolean,
  ) {}
}
export enum EStatusNavigation {
  navigationTreePending = 'navigationTreePending',
  navigationTreeFulfilled = 'navigationTreeFulfilled',
  navigationTreeRejected = 'navigationTreeRejected',
  userWebappPending = 'userWebappPending',
  userWebappFulfilled = 'userWebappFulfilled',
  userWebappRejected = 'userWebappRejected',
}

const name = 'Navigation';

function mapMenuObject(item: Navigation): TreeNodeProps {
  return {
    ...item,
    title: item?.name,
    icon: item?.iconClass,
    key: item?.id,
    isLeaf: !item?.subChild?.length,
    expanded: true,
    children: !item?.subChild ? null : item?.subChild?.map((i) => mapMenuObject(i)),
  } as TreeNodeProps;
}

const action = {
  ...new Action<Navigation, EStatusNavigation>(name),
  getTree: createAsyncThunk(name + 'getTree', async (params: { isAdmin: number; isGetRoles?: boolean }) => {
    const res = await API.get<Navigation[]>(`/bsd/navigations/tree`, params);
    return { res, isAdmin: params.isAdmin };
  }),
  getUserWebapp: createAsyncThunk(name + 'getUserWebapp', async (params: { isAdmin: number; isGetRoles?: boolean }) => {
    const res = await API.get<Navigation[]>(`/bsd/navigations/user/webapp`, params);
    return { res, isAdmin: params.isAdmin };
  }),
};

export const navigationSlice = createSlice(
  new Slice<Navigation, EStatusNavigation>(
    action,
    { keepUnusedDataFor: 9999 },
    (builder: ActionReducerMapBuilder<StateNavigation<Navigation>>) => {
      builder
        .addCase(action.getTree.pending, (state, action) => {
          state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
          state.queryParams = JSON.stringify(action.meta.arg);
          state.status = EStatusNavigation.navigationTreePending;
          state.isLoading = true;
        })
        .addCase(action.getTree.fulfilled, (state, action) => {
          const { res, isAdmin } = action.payload;
          if (res.data) {
            state.tree = res.data.filter((i) => i.type === isAdmin).map((i) => mapMenuObject(i));
          }
          state.isLoading = false;

          if (res.isSuccess) state.status = EStatusNavigation.navigationTreeFulfilled;
          else state.status = EStatusState.idle;
        })
        .addCase(action.getTree.rejected, (state) => {
          state.status = EStatusNavigation.navigationTreeRejected;
          state.isLoading = false;
        })
        .addCase(action.getUserWebapp.pending, (state, action) => {
          state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
          state.queryParams = JSON.stringify(action.meta.arg);
          state.status = EStatusNavigation.userWebappPending;
          state.isLoading = true;
        })
        .addCase(action.getUserWebapp.fulfilled, (state, action) => {
          const { res, isAdmin } = action.payload;
          if (res.data) {
            state.menu = res.data.filter((i) => i.type === isAdmin).map((i) => mapMenuObject(i));
          }
          state.isLoading = false;

          if (res.isSuccess) state.status = EStatusNavigation.userWebappFulfilled;
          else state.status = EStatusState.idle;
        })
        .addCase(action.getUserWebapp.rejected, (state) => {
          state.status = EStatusNavigation.userWebappRejected;
          state.isLoading = false;
        });
    },
  ),
);

export const NavigationFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateNavigation<Navigation>),
    set: (values: StateNavigation<Navigation>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateNavigation<Navigation> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: Navigation) => dispatch(action.post({ values })),
    put: (values: Navigation) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
    getTree: (params: { isAdmin: number; isGetRoles: boolean }) => dispatch(action.getTree(params)),
    getMenu: (params: { isAdmin: number; isGetRoles: boolean }) => dispatch(action.getUserWebapp(params)),
  };
};
