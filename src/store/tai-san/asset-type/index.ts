import { CommonEntity, QueryParams } from '@models';
import { createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';

const name = 'AssetType';

const action = new Action<AssetType>(name);

export const assetTypeSlice = createSlice(new Slice<AssetType>(action));

export const AssetTypeFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateAssetType<AssetType>),
    set: (values: StateAssetType<AssetType>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateAssetType<AssetType> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: AssetType) => dispatch(action.post({ values })),
    put: (values: AssetType) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};

interface StateAssetType<T> extends State<T> {
  isDetail?: boolean;
  isEdit?: boolean;
}

export class AssetType extends CommonEntity {
  constructor(
    public code?: string,
    public name?: string,
    public description?: string,
    public assetGroupId?: string,
    public assetGroupName?: string,
  ) {
    super();
  }
}
