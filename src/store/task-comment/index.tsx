import { createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, CustomerModel, Slice, State, useAppDispatch, useTypedSelector } from '@store';

const name = 'CommentTask';
const action = new Action<CommentTaskModel>(name);
export const taskCommentSlice = createSlice(new Slice<CommentTaskModel>(action));
export const TaskCommentFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateTaskComment<CommentTaskModel>),
    set: (values: StateTaskComment<CommentTaskModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateTaskComment<CommentTaskModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: CommentTaskModel) => dispatch(action.post({ values })),
    put: (values: CommentTaskModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateTaskComment<T> extends State<T> {
  isEdit?: boolean;
  newPackageData?: CustomerModel;

  // comment feature
  // comment feature
  mentionList?: string[] | any;
  mentionListWhenOnChange?: string[] | any;
  commentId?: string | any;
  contentItem?: string | any;
  keyboardName?: string | any;
  multipleTagger?: string[] | any;
}
export class CommentTaskModel extends CommonEntity {
  constructor(
    public id?: string,
    public taskCommentId?: string,
    public customerId?: string,
    public customerType?: string,
    public content?: string | null,
    public isSystemLog?: boolean,
    public taskId?: string,
    public tagIds?: string[],
  ) {
    super();
  }
}
