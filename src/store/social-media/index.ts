import { CommonEntity, T_Attachment } from '@models';
import { UserModal } from '../user';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

export const reactions = {
  Like: {
    value: 'Like' as const,
    label: 'Thích',
    animationImage: '/assets/images/reactions/like.gif',
    staticImage: '/assets/images/reactions/like.png',
    color: 'text-blue-500',
  },
  Haha: {
    value: 'Haha' as const,
    label: 'Haha',
    animationImage: '/assets/images/reactions/haha.gif',
    staticImage: '/assets/images/reactions/haha.png',
    color: 'text-amber-500',
  },
  Love: {
    value: 'Love' as const,
    label: 'Yêu thích',
    animationImage: '/assets/images/reactions/love.gif',
    staticImage: '/assets/images/reactions/love.png',
    color: 'text-pink-500',
  },
  Wow: {
    value: 'Wow' as const,
    label: 'Wow',
    animationImage: '/assets/images/reactions/wow.gif',
    staticImage: '/assets/images/reactions/wow.png',
    color: 'text-orange-400',
  },
  Sad: {
    value: 'Sad' as const,
    label: 'Buồn',
    animationImage: '/assets/images/reactions/sad.gif',
    staticImage: '/assets/images/reactions/sad.png',
    color: 'text-yellow-500',
  },
  Angry: {
    value: 'Angry' as const,
    label: 'Giận dữ',
    animationImage: '/assets/images/reactions/angry.gif',
    staticImage: '/assets/images/reactions/angry.png',
    color: 'text-red-500',
  },
};

export interface SocialMediaPostListModel {
  posts: SocialMediaPostModel[];
  totalPosts: number;
  hasMore: boolean;
}

export interface SocialMediaReactionModel {
  userId: string;
  userName: string;
  reaction: keyof typeof reactions;
  reactedDate: string;
}

export interface SocialMediaCommentModel extends CommonEntity {
  id: string;
  content: string;
  postId: string;
  parentCommentId?: string;
  attachments: T_Attachment[];
  reactions: SocialMediaReactionModel[];
  childComments: SocialMediaCommentModel[];
  createdByUser: UserModal;
}

export class SocialMediaPostModel extends CommonEntity {
  constructor(
    public id: string,
    public content: string,
    public attachments: T_Attachment[],
    public reactions: SocialMediaReactionModel[],
    public comments: SocialMediaCommentModel[],
    public createdByUser: UserModal,
  ) {
    super();
  }
}

export interface ReactionUpdateModel {
  targetId: string;
  isPost: boolean;
  reaction?: keyof typeof reactions;
  isAdd: boolean;
}

interface QueryParams {
  skip?: number;
  size?: number;
  sort?: string;
}

interface IncludeRoute {
  route: string[];
}

const name = 'ConstructionSocialMedia';
const action = {
  ...new Action<SocialMediaPostModel, EStatusSocialMedia>(name),
  getPosts: createAsyncThunk(name + 'getPosts', async ({ params }: { params: QueryParams }) =>
    API.get<SocialMediaPostListModel>(`${routerLinks(name, 'api')}/posts`, params),
  ),
  createPost: createAsyncThunk(name + 'createPost', async ({ data }: { data: Partial<SocialMediaPostModel> }) =>
    API.post<SocialMediaPostModel>(`${routerLinks(name, 'api')}/posts`, data),
  ),
  updatePost: createAsyncThunk(name + 'updatePost', async ({ data }: { data: Partial<SocialMediaPostModel> }) =>
    API.put<SocialMediaPostModel>(`${routerLinks(name, 'api')}/posts/${data.id}`, data),
  ),
  deletePost: createAsyncThunk(name + 'deletePost', async ({ id }: { id: string }) =>
    API.delete<SocialMediaPostModel>(`${routerLinks(name, 'api')}/posts/${id}`),
  ),
  updateReaction: createAsyncThunk(
    name + 'updateReaction',
    async ({ data }: { data: ReactionUpdateModel & IncludeRoute }) =>
      API.post<SocialMediaReactionModel[]>(`${routerLinks(name, 'api')}/reactions`, data),
  ),
  createComment: createAsyncThunk(
    name + 'createComment',
    async ({ data }: { data: Partial<SocialMediaCommentModel> & IncludeRoute }) =>
      API.post<SocialMediaCommentModel>(`${routerLinks(name, 'api')}/comments`, data),
  ),
  updateComment: createAsyncThunk(
    name + 'updateComment',
    async ({ data }: { data: Partial<SocialMediaCommentModel> & IncludeRoute }) =>
      API.put<SocialMediaCommentModel>(`${routerLinks(name, 'api')}/comments/${data.id}`, data),
  ),
  deleteComment: createAsyncThunk(name + 'deleteComment', async ({ id }: { id: string } & IncludeRoute) =>
    API.delete<SocialMediaCommentModel>(`${routerLinks(name, 'api')}/comments/${id}`),
  ),
};

interface StateSocialMedia<T> extends State<T, EStatusSocialMedia> {
  posts?: SocialMediaPostModel[];
  totalPosts?: number;
  hasMore?: boolean;
}

function getTargetViaRoute(items: (SocialMediaPostModel | SocialMediaCommentModel)[] | undefined, route: string[]) {
  if (!items) return undefined;
  let list = [...items];
  for (let i = 0; i < route.length; i++) {
    const id = route[i];
    const item = list.find((item) => item.id === id);
    if (item) {
      if (i === route.length - 1) {
        return item;
      }
      if ('childComments' in item) {
        list = item.childComments;
      } else {
        list = item.comments;
      }
    } else {
      return undefined;
    }
  }
}

export const SocialMediaSlice = createSlice(
  new Slice<SocialMediaPostModel, EStatusSocialMedia>(
    action,
    { keepUnusedDataFor: 9999, posts: [], totalPosts: 0, hasMore: false },
    (builder) => {
      builder
        .addCase(action.getPosts.pending, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.getPostsPending;
        })
        .addCase(action.getPosts.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          state.posts = state.posts ?? [];
          action.payload.data?.posts?.forEach((post) => {
            const index = state.posts?.findIndex((x) => x.id === post.id) ?? -1;
            if (index >= 0) {
              state.posts?.splice(index, 1, post);
            } else {
              state.posts?.push(post);
            }
          });
          state.totalPosts = action.payload.data?.totalPosts ?? 0;
          state.hasMore = action.payload.data?.hasMore ?? false;
          state.isLoading = false;
          state.status = EStatusSocialMedia.getPostsFulfilled;
        })
        .addCase(action.getPosts.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.getPostsRejected;
        })
        .addCase(action.createPost.pending, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.createPostPending;
        })
        .addCase(action.createPost.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          state.isLoading = false;

          if (action.payload.isSuccess && action.payload.data) {
            state.posts?.unshift(action.payload.data);
            state.status = EStatusSocialMedia.createPostFulfilled;
            customMessage.success(action.payload.message ?? 'Đăng bài viết thành công');
          } else {
            state.status = EStatusSocialMedia.createPostRejected;
            customMessage.error(action.payload.message ?? 'Đăng bài viết thất bại');
          }
        })
        .addCase(action.createPost.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.createPostRejected;
          customMessage.error('Đăng bài viết thất bại');
        })
        .addCase(action.updatePost.pending, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.updatePostPending;
        })
        .addCase(action.updatePost.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          state.isLoading = false;

          if (action.payload.isSuccess && action.payload.data) {
            const post = state.posts?.find((post) => post.id === action.payload.data?.id);
            if (post) {
              post.content = action.payload.data.content;
              post.attachments = action.payload.data.attachments;
            }
            state.status = EStatusSocialMedia.updatePostFulfilled;
            customMessage.success(action.payload.message ?? 'Cập nhật bài viết thành công');
          } else {
            state.status = EStatusSocialMedia.updatePostRejected;
            customMessage.error(action.payload.message ?? 'Cập nhật bài viết thất bại');
          }
        })
        .addCase(action.updatePost.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.updatePostRejected;
          customMessage.error('Cập nhật bài viết thất bại');
        })
        .addCase(action.deletePost.pending, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.deletePostPending;
        })
        .addCase(action.deletePost.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          state.isLoading = false;

          if (action.payload.isSuccess) {
            const index = state.posts?.findIndex((post) => post.id === action.meta.arg.id) ?? -1;
            if (index >= 0) {
              state.posts?.splice(index, 1);
            }
            state.status = EStatusSocialMedia.deletePostFulfilled;
            customMessage.success(action.payload.message ?? 'Xoá bài viết thành công');
          } else {
            state.status = EStatusSocialMedia.deletePostRejected;
            customMessage.error(action.payload.message ?? 'Xoá bài viết thất bại');
          }
        })
        .addCase(action.deletePost.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.deletePostRejected;
          customMessage.error('Xoá bài viết thất bại');
        })
        .addCase(action.updateReaction.pending, (state: StateSocialMedia<SocialMediaPostModel>) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.updateReactionPending;
        })
        .addCase(action.updateReaction.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          if (action.payload.isSuccess && action.payload.data) {
            const target = getTargetViaRoute(state.posts, action.meta.arg.data.route);
            if (target) {
              target.reactions = action.payload.data;
            }
          }
          state.isLoading = false;
          state.status = EStatusSocialMedia.updateReactionFulfilled;
        })
        .addCase(action.updateReaction.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.updateReactionRejected;
        })
        .addCase(action.createComment.pending, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.createCommentPending;
        })
        .addCase(action.createComment.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          state.isLoading = false;

          if (action.payload.isSuccess && action.payload.data) {
            const parent = getTargetViaRoute(state.posts, action.meta.arg.data.route);
            if (parent) {
              if ('childComments' in parent) {
                parent.childComments.push(action.payload.data);
              } else {
                parent.comments.unshift(action.payload.data);
              }
            }
            state.status = EStatusSocialMedia.createCommentFulfilled;
            customMessage.success(action.payload.message ?? 'Gửi bình luận thành công');
          } else {
            state.status = EStatusSocialMedia.createCommentRejected;
            customMessage.error(action.payload.message ?? 'Gửi bình luận thất bại');
          }
        })
        .addCase(action.createComment.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.createCommentRejected;
        })
        .addCase(action.updateComment.pending, (state, action) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.updateCommentPending;
        })
        .addCase(action.updateComment.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          state.isLoading = false;
          if (action.payload.isSuccess && action.payload.data) {
            const target = getTargetViaRoute(state.posts, action.meta.arg.data.route);
            if (target) {
              target.content = action.payload.data.content;
              target.attachments = action.payload.data.attachments;
            }
            state.status = EStatusSocialMedia.updateCommentFulfilled;
            customMessage.success(action.payload.message ?? 'Cập nhật bình luận thành công');
          } else {
            state.status = EStatusSocialMedia.updateCommentRejected;
            customMessage.error(action.payload.message ?? 'Cập nhật bình luận thất bại');
          }
        })
        .addCase(action.updateComment.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.updateCommentRejected;
        })
        .addCase(action.deleteComment.pending, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.deleteCommentPending;
        })
        .addCase(action.deleteComment.fulfilled, (state: StateSocialMedia<SocialMediaPostModel>, action) => {
          state.isLoading = false;

          if (action.payload.isSuccess) {
            const parentRoute = action.meta.arg.route.slice(0, -1);
            const parent = getTargetViaRoute(state.posts, parentRoute);

            if (parent) {
              if ('childComments' in parent) {
                const index = parent.childComments.findIndex((comment) => comment.id === action.meta.arg.id) ?? -1;
                if (index >= 0) {
                  parent.childComments.splice(index, 1);
                }
              } else {
                const index = parent.comments.findIndex((comment) => comment.id === action.meta.arg.id) ?? -1;
                if (index >= 0) {
                  parent.comments.splice(index, 1);
                }
              }
            }
            state.status = EStatusSocialMedia.deleteCommentFulfilled;
            customMessage.success(action.payload.message ?? 'Xoá bình luận thành công');
          } else {
            state.status = EStatusSocialMedia.deleteCommentRejected;
            customMessage.error(action.payload.message ?? 'Xoá bình luận thất bại');
          }
        })
        .addCase(action.deleteComment.rejected, (state) => {
          state.isLoading = false;
          state.status = EStatusSocialMedia.deleteCommentRejected;
          customMessage.error('Xoá bình luận thất bại');
        });
    },
  ),
);

export const SocialMediaFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateSocialMedia<SocialMediaPostModel>),
    getPosts: (params: QueryParams) => dispatch(action.getPosts({ params })),
    createPost: (data: Partial<SocialMediaPostModel>) => dispatch(action.createPost({ data })),
    updatePost: (data: Partial<SocialMediaPostModel>) => dispatch(action.updatePost({ data })),
    deletePost: (id: string) => dispatch(action.deletePost({ id })),
    updateReaction: (data: ReactionUpdateModel & IncludeRoute) => dispatch(action.updateReaction({ data })),
    createComment: (data: Partial<SocialMediaCommentModel> & IncludeRoute) => dispatch(action.createComment({ data })),
    updateComment: (data: Partial<SocialMediaCommentModel> & IncludeRoute) => dispatch(action.updateComment({ data })),
    deleteComment: (id: string, route: string[]) => dispatch(action.deleteComment({ id, route })),
  };
};

export enum EStatusSocialMedia {
  getPostsPending = 'getPostsPending',
  getPostsFulfilled = 'getPostsFulfilled',
  getPostsRejected = 'getPostsRejected',
  createPostPending = 'createPostPending',
  createPostFulfilled = 'createPostFulfilled',
  createPostRejected = 'createPostRejected',
  updatePostPending = 'updatePostPending',
  updatePostFulfilled = 'updatePostFulfilled',
  updatePostRejected = 'updatePostRejected',
  deletePostPending = 'deletePostPending',
  deletePostFulfilled = 'deletePostFulfilled',
  deletePostRejected = 'deletePostRejected',
  updateReactionPending = 'updateReactionPending',
  updateReactionFulfilled = 'updateReactionFulfilled',
  updateReactionRejected = 'updateReactionRejected',
  createCommentPending = 'createCommentPending',
  createCommentFulfilled = 'createCommentFulfilled',
  createCommentRejected = 'createCommentRejected',
  updateCommentPending = 'updateCommentPending',
  updateCommentFulfilled = 'updateCommentFulfilled',
  updateCommentRejected = 'updateCommentRejected',
  deleteCommentPending = 'deleteCommentPending',
  deleteCommentFulfilled = 'deleteCommentFulfilled',
  deleteCommentRejected = 'deleteCommentRejected',
}
