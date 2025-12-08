import { createSlice } from '@reduxjs/toolkit';

import { useAppDispatch, useTypedSelector, Action, Slice, State } from '@store';
import { CommonEntity, QueryParams } from '@models';

const name = 'SocialInsurance';
const action = new Action<SocialInsuranceModel>(name);
export const socialInsuranceFacadeSlice = createSlice(new Slice<SocialInsuranceModel>(action));
export const SocialInsuranceFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateSocialInsurance<SocialInsuranceModel>),
    set: (values: StateSocialInsurance<SocialInsuranceModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: any;
      keyState?: keyof StateSocialInsurance<SocialInsuranceModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: SocialInsuranceModel) => dispatch(action.post({ values })),
    put: (values: SocialInsuranceModel) => dispatch(action.put({ values })),
    putDisable: (values: { id: string; disable: boolean }) => dispatch(action.putDisable(values)),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateSocialInsurance<T> extends State<T> {
  isHidden?: boolean;
  totalNLD?: number;
  totalNSDL?: number;
}
export class SocialInsuranceModel extends CommonEntity {
  constructor(
    public id: string,
    public fromDate?: string,
    public toDate?: string,
    public bhxhNguoiLaoDong?: number,
    public bhytNguoiLaoDong?: number,
    public bhtnNguoiLaoDong?: number,
    public bhxhNguoiSuDungLaoDong?: number,
    public bhytNguoiSuDungLaoDong?: number,
    public bhtnNguoiSuDungLaoDong?: number,
    public tongNguoiLaoDong?: number,
    public tongNguoiSuDungLaoDong?: number,
    public tongTatCa?: number,
  ) {
    super();
  }
}
