import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'Roles';
const action = new Action<RolesModel>(name);
export const rolesSlice = createSlice(new Slice<RolesModel>(action));
export const RolesFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateRoles<RolesModel>),
    set: (values: StateRoles<RolesModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: any; keyState?: keyof StateRoles<RolesModel> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: RolesModel) => dispatch(action.post({ values })),
    put: (values: RolesModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateRoles<T> extends State<T> {
  isEdit?: boolean;
}
export class RolesModel extends CommonEntity {
  constructor(
    public id: string,
    public code?: string,
    public name?: string,
    public description?: string,
    public isSystem?: boolean,
    public level?: number,
  ) {
    super();
  }
}
