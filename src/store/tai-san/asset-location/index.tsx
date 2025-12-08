import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, EStatusState, Pagination, QueryParams, Responses } from '@models';
import { TransferKey } from 'antd/es/transfer/interface';
import { API, routerLinks } from '@utils';
import { customMessage } from 'src';

const name = 'AssetLocation';
const action = new Action<AssetLocation>(name);

export const assetLocationSlice = createSlice(new Slice<AssetLocation>(action));
export const AssetLocationFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateAssetLocation<AssetLocation>),
    set: (values: StateAssetLocation<AssetLocation>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateAssetLocation<AssetLocation> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: AssetLocation) => dispatch(action.post({ values })),
    put: (values: AssetLocation) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateAssetLocation<T> extends State<T> {
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

export class AssetLocation extends CommonEntity {
  constructor(
    public id?: string,
    public name?: string,
    public code?: string,
    public parentId?: string,
    public parentName?: string,
    public description?: string,
    public children?: AssetLocation[],
  ) {
    super();
  }
}
