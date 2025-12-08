import { createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State, CodeTypeManagement } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'ChartOfAccountCodeTypeManagement';
const action = new Action<ChartOfAccountCodeTypeManagement>(name);
export const chartOfAccountCodeTypeManagementSlice = createSlice(
  new Slice<ChartOfAccountCodeTypeManagement>(action, { keepUnusedDataFor: 9999 }),
);
export const ChartOfAccountCodeTypeManagementFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...(useTypedSelector((state) => state[action.name]) as State<ChartOfAccountCodeTypeManagement>),
    set: (values: State<ChartOfAccountCodeTypeManagement>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: string;
      keyState?: keyof State<ChartOfAccountCodeTypeManagement>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: ChartOfAccountCodeTypeManagement) => dispatch(action.post({ values })),
    put: (values: ChartOfAccountCodeTypeManagement) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
export class ChartOfAccountCodeTypeManagement extends CommonEntity {
  constructor(
    public name: string = '',
    public code: string = '',
    public type: string,
    public title: string = '',
    public iconClass?: string,
    public isPrimary: boolean = false,
    public createdAt?: string,
    public updatedAt?: string,
    public items?: CodeTypeManagement[],
  ) {
    super();
  }
}
