import { CommonEntity, QueryParams } from '@models';
import { createSlice } from '@reduxjs/toolkit';
import { Action, Slice, State, useAppDispatch, UserModal, useTypedSelector } from '@store';

const name = 'AssetAllocation';

const action = new Action<AssetAllocation>(name);

export const assetAllocationSlice = createSlice(new Slice<AssetAllocation>(action));

export const AssetAllocationFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateAssetAllocation<AssetAllocation>),
    set: (values: StateAssetAllocation<AssetAllocation>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateAssetAllocation<AssetAllocation> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: AssetAllocation) => dispatch(action.post({ values })),
    put: (values: AssetAllocation) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};

interface StateAssetAllocation<T> extends State<T> {
  isDetail?: boolean;
  isEdit?: boolean;
}

export class AssetAllocation extends CommonEntity {
  constructor(
    public assetId?: string,
    public userId?: string,
    public description?: string,
    public executionDate?: string,
    public fromLocationId?: string,
    public fromLocationName?: string,
    public operation?: string,
    public status?: string,
    public toUser?: UserModal,
    public toLocationId?: string,
    public assetName?: string,
  ) {
    super();
  }
}
