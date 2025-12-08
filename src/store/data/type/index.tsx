import { createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { Data } from '../';

const name = 'DataType';
const action = new Action<DataType>(name);
export const dataTypeSlice = createSlice(new Slice<DataType>(action, { keepUnusedDataFor: 9999 }));
export const DataTypeFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as State<DataType>),
    set: (values: State<DataType>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof State<DataType> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: DataType) => dispatch(action.post({ values })),
    put: (values: DataType) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};

export class DataType extends CommonEntity {
  constructor(
    public name: string,
    public code: string,
    public isPrimary?: boolean,
    public createdAt?: string,
    public updatedAt?: string,
    public items?: Data[],
  ) {
    super();
  }
}
