import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, EStatusState } from '@models';
import { API, routerLinks } from '@utils';
import dayjs from 'dayjs';

const name = 'Rights';
const action = {
  ...new Action<RightModel, EStatusRight>(name),
  getAll: createAsyncThunk(name + 'getAll', async () => {
    return await API.get<RightModel[]>(`${routerLinks(name, 'api')}/all`);
  }),
};

export const rightModelSlice = createSlice(
  new Slice<RightModel, EStatusRight>(action, {}, (builder) => {
    builder
      .addCase(action.getAll.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusRight.getAllPending;
      })
      .addCase(action.getAll.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = EStatusRight.getAllFulfilled;
          state.rightList = action.payload.data?.sort((a, b) => dayjs(a.createdOnDate).diff(dayjs(b.createdOnDate)));
        } else state.status = EStatusState.idle;
        state.isLoading = false;
      })
      .addCase(action.getAll.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusRight.getAllRejected;
      });
  }),
);

export const RightFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateRights<RightModel>),
    getAll: () => dispatch(action.getAll()),
  };
};

interface StateRights<T> extends State<T, EStatusRight> {
  rightList?: RightModel[];
}

export class RightModel extends CommonEntity {
  constructor(
    public id?: string,
    public name?: string,
    public code?: string,
    public description?: string,
    public groupCode?: string,
    public groupName?: string,
    public createdOnDate?: string,
    public lastModifiedOnDate?: string,
  ) {
    super();
  }
}
export enum EStatusRight {
  getAllPending = 'getAllPending',
  getAllFulfilled = 'getAllFulfilled',
  getAllRejected = 'getAllRejected',
}
