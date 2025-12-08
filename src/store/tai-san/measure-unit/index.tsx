import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, EStatusState, Pagination, QueryParams, Responses } from '@models';

const name = 'MeasureUnit';
const action = new Action<MeasureUnit>(name);

export const measureUnitSlice = createSlice(new Slice<MeasureUnit>(action));
export const MeasureUnitFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateMeasureUnit<MeasureUnit>),
    set: (values: StateMeasureUnit<MeasureUnit>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateMeasureUnit<MeasureUnit> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: MeasureUnit) => dispatch(action.post({ values })),
    put: (values: MeasureUnit) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateMeasureUnit<T> extends State<T> {
  isEdit?: boolean;
  visible?: boolean;
  isFilter?: boolean;
  isDetail?: boolean;
  createModal?: boolean;
  modalMode?: 'update' | 'create';
  selectedRecord?: any;
  modalVisible?: boolean;
  expandedRowKeys?: string[];
}

export class MeasureUnit extends CommonEntity {
  constructor(
    public id?: string,
    public name?: string,
    public code?: string,
  ) {
    super();
  }
}
