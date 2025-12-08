import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';
import { API, routerLinks } from '@utils';

const name = 'Tenant';
const action = {
  ...new Action<TenantModule, EStatusTenant>(name),
  getByDomain: createAsyncThunk(name + 'getByDomain', async (domain: string) => {
    const res = await API.get(`${routerLinks(name, 'api')}/get-by-domain?domain=${domain}`);
    return res;
  }),
};
export const tenantSlice = createSlice(
  new Slice<TenantModule, EStatusTenant>(action, {}, (builder) => {
    builder
      .addCase(action.getByDomain.pending, (state) => {
        state.isLoading = true;
        state.status = EStatusTenant.getByDomainPending;
      })
      .addCase(action.getByDomain.fulfilled, (state, action) => {
        state.isLoading = false;
        state.status = EStatusTenant.getByDomainFulfilled;
        state.data = action.payload.data;
      })
      .addCase(action.getByDomain.rejected, (state) => {
        state.isLoading = false;
        state.status = EStatusTenant.getByDomainRejected;
      });
  }),
);

export const TenantFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateTenant<TenantModule>),
    set: (values: StateTenant<TenantModule>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({ id, keyState = 'isVisible' }: { id: string; keyState?: keyof StateTenant<TenantModule> }) =>
      dispatch(action.getById({ id, keyState })),
    post: (values: TenantModule) => dispatch(action.post({ values })),
    put: (values: TenantModule) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
    getByDomain: (domain: string) => dispatch(action.getByDomain(domain)),
  };
};

interface StateTenant<T> extends State<T, EStatusTenant> {}

export class TenantModule extends CommonEntity {
  constructor(
    public id?: string,
    public name?: string,
    public subDomain?: string,
    public email?: string,
    public phoneNumber?: string,
    public companyName?: string,
    public plan?: string,
    public maxUsers?: number,
    public mst?: string,
    public password?: string,
    public attachments?: any,
    public webUrl?: string,
  ) {
    super();
  }
}

export enum EStatusTenant {
  getByDomainPending = 'getByDomainPending',
  getByDomainFulfilled = 'getByDomainFulfilled',
  getByDomainRejected = 'getByDomainRejected',
}
