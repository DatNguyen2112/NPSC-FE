import { createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';

const name = 'TaskUsageHistory';
const action = {
  ...new Action<TaskUsageHistoryModel, EStatusTaskUsageHistory>(name),
};
export const taskUsageHistorySlice = createSlice(
  new Slice<TaskUsageHistoryModel, EStatusTaskUsageHistory>(action, {}, (builder) => {
    builder;
  }),
);
export const TaskUsageHistoryFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateTaskUsageHistory<TaskUsageHistoryModel>),
    set: (values: StateTaskUsageHistory<TaskUsageHistoryModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: string;
      keyState?: keyof StateTaskUsageHistory<TaskUsageHistoryModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: TaskUsageHistoryModel) => dispatch(action.post({ values })),
    put: (values: TaskUsageHistoryModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateTaskUsageHistory<T> extends State<T, EStatusTaskUsageHistory> {}
export class TaskUsageHistoryModel extends CommonEntity {
  constructor(
    public activityType: string,
    public nameSubtask?: string,
    public description?: string,
  ) {
    super();
  }
}

export enum EStatusTaskUsageHistory {}
