import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { PostType } from './type';

const name = 'Post';
const action = new Action<Post>(name);
export const postSlice = createSlice(new Slice<Post>(action));
export const PostFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as State<Post>),
    set: (values: State<Post>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof State<Post> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: Post) => dispatch(action.post({ values })),
    put: (values: Post) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
export class Post extends CommonEntity {
  constructor(
    public id?: string,
    public categoryId?: string,
    public title?: string,
    public publishStatus?: string,
    public thumbnailUrl?: string,
    public coverUrl?: string,
    public editorFormat?: string,
    public isPinned?: boolean,
    public category?: PostType,
    public createdOnDate?: string,
    public partnerId?: string,
    public relatedPostListId?: string[],
    public translations?: {
      title?: string;
      unaccentTitle?: string;
      slug?: string;
      summary?: string;
      language?: string;
      seoDescription?: string;
      seoKeywords?: string;
    }[],
    public attachments?: Attachment[],
  ) {
    super();
  }
}

interface Attachment {
  id?: string;
  docType?: string;
  docTypeName?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
  createdOnDate?: string;
  entityId?: string;
  entityType?: string;
  description?: string;
}
