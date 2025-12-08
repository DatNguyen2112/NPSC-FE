import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State, CustomerModel } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'CustomerServiceComment';
const action = new Action<CustomerServiceCommentModel>(name);
export const customerServiceCommentSlice = createSlice(new Slice<CustomerServiceCommentModel>(action));
export const CustomerServiceCommentFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateCustomerServiceComment<CustomerServiceCommentModel>),
    set: (values: StateCustomerServiceComment<CustomerServiceCommentModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: any;
      keyState?: keyof StateCustomerServiceComment<CustomerServiceCommentModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: CustomerServiceCommentModel) => dispatch(action.post({ values })),
    put: (values: CustomerServiceCommentModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateCustomerServiceComment<T> extends State<T> {
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
export class CustomerServiceCommentModel extends CommonEntity {
  constructor(
    public id?: string,
    public customerServiceId?: string,
    public customerId?: string,
    public customerType?: string,
    public content?: string | null,
    public isSystemLog?: boolean,
    public constructionId?: string,
    public tagIds?: string[],
  ) {
    super();
  }
}
