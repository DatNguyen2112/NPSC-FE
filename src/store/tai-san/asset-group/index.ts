import { CommonEntity, QueryParams } from '@models';
import { createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';

const name = 'AssetGroup';

const action = new Action<AssetGroup>(name);

export const assetGroupSlice = createSlice(new Slice<AssetGroup>(action));

export const AssetGroupFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateAssetGroup<AssetGroup>),
    set: (values: StateAssetGroup<AssetGroup>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateAssetGroup<AssetGroup> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: AssetGroup) => dispatch(action.post({ values })),
    put: (values: AssetGroup) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};

interface StateAssetGroup<T> extends State<T> {
  isDetail?: boolean;
  isEdit?: boolean;
}

export class AssetGroup extends CommonEntity {
  constructor(
    public code?: string,
    public name?: string,
    public description?: string,
  ) {
    super();
  }
}
