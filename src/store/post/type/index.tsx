import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';

import { CommonEntity, EStatusState, QueryParams, Responses } from '@models';
import { API, routerLinks } from '@utils';

const name = 'PostType';
const action = {
  ...new Action<PostType, EStatusPostType>(name),
  getTree: createAsyncThunk(name + '/getTree', async () => await API.get<PostType>(`${routerLinks(name, 'api')}/tree`)),
};
export const postTypeSlice = createSlice(
  new Slice<PostType, EStatusPostType>(action, { keepUnusedDataFor: 9999 }, (builder) => {
    builder
      .addCase(action.getTree.pending, (state, action) => {
        state.time = new Date().getTime() + (state.keepUnusedDataFor || 60) * 1000;
        state.queryParams = JSON.stringify(action.meta.arg);
        state.isLoading = true;
        state.status = EStatusPostType.getTreePending;
      })
      .addCase(action.getTree.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.tree = action.payload.data;
          state.status = EStatusPostType.getTreeFulfilled;
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getTree.rejected, (state: StatePostType<PostType>) => {
        state.status = EStatusPostType.getTreeRejected;
        state.isLoading = false;
      });
  }),
);
export const PostTypeFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StatePostType<PostType>),
    set: (values: StatePostType<PostType>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getTree: () => dispatch(action.getTree()),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StatePostType<PostType> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: PostType) => dispatch(action.post({ values })),
    put: (values: PostType) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StatePostType<T> extends State<T, EStatusPostType> {
  tree?: T[];
}
export class PostType extends CommonEntity {
  constructor(
    public id?: string,
    public coverUrl?: string,
    public title?: string,
    public slug?: string,
    public type?: string,
    public postPerPage?: number,
    public postsFormatType?: string,
    public level?: number,
    public backGroundColor?: string,
    public titleForeColor?: string,
    public isShowTitle?: boolean,
    public customCSSClass?: string,
    public customCSS?: string,
    public createdOnDate?: string,
    public postList?: any,
    public subCategories?: any,
  ) {
    super();
  }
}
export enum EStatusPostType {
  idle = 'idle',
  getTreePending = 'getTreePending',
  getTreeFulfilled = 'getTreeFulfilled',
  getTreeRejected = 'getTreeRejected',
}

// export class PostType extends CommonEntity {
//   constructor(
//     public content?: {
//       id?: string;
//       coverUrl?: string;
//       title?: string;
//       slug?: string;
//       type?: string;
//       postPerPage?: number;
//       postsFormatType?: string;
//       level?: number;
//       backGroundColor?: string;
//       titleForeColor?: string;
//       isShowTitle?: boolean;
//       customCSSClass?: string;
//       customCSS?: string;
//       createdOnDate?: string;
//       postList?: any;
//       subCategories?: any;
//     }[],
//     public numberOfElements?: number,
//     public page?: number,
//     public size?: number,
//     public totalElements?: number,
//     public totalPages?: number,
//   ) {
//     super();
//   }
// }
