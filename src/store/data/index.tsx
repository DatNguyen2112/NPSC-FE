import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { DataType } from './type';

const name = 'Data';
const action = new Action<Data>(name);
export const dataSlice = createSlice(new Slice<Data>(action));
export const DataFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as State<Data>),
    set: (values: State<Data>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof State<Data> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: Data) => dispatch(action.post({ values })),
    put: (values: Data) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
export class Data extends CommonEntity {
  constructor(
    public name?: string,
    public type?: string,
    public image?: string,
    public order?: number | null,
    public createdAt?: string,
    public updatedAt?: string,
    public item?: DataType,
    public translations?: {
      id: string;
      language?: string;
      name: string;
      description?: string;
      position?: string;
      content?: {
        blocks: Record<string, object>[];
      };
      dataId?: string;
      data?: Data;
      createdAt?: string;
      updatedAt?: string;
    }[],
  ) {
    super();
  }
}
