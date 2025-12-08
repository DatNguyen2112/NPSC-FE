import { createSlice } from '@reduxjs/toolkit';

import { CommonEntity, QueryParams } from '@models';
import { Action, Slice, State, useAppDispatch, useTypedSelector } from '@store';

const name = 'ProjectTemplate';
const action = {
  ...new Action<ProjectTemplateModel, EStatusProjectTemplate>(name),
};
export const projectTemplateSlice = createSlice(
  new Slice<ProjectTemplateModel, EStatusProjectTemplate>(action, {}, (builder) => {
    builder;
  }),
);
export const ProjectTemplateFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateProjectTemplate<ProjectTemplateModel>),
    set: (values: StateProjectTemplate<ProjectTemplateModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getById: ({
      id,
      keyState = 'isVisible',
    }: {
      id: string;
      keyState?: keyof StateProjectTemplate<ProjectTemplateModel>;
    }) => dispatch(action.getById({ id, keyState })),
    post: (values: ProjectTemplateModel) => dispatch(action.post({ values })),
    put: (values: ProjectTemplateModel) => dispatch(action.put({ values })),
    delete: (id: string) => dispatch(action.delete({ id })),
  };
};
interface StateProjectTemplate<T> extends State<T, EStatusProjectTemplate> {
  isFilterVisible?: boolean;
  isCreate?: boolean;
  isEdit?: boolean;
}
export class ProjectTemplateModel extends CommonEntity {
  constructor(
    public code: string,
    public name: string,
    public description: string,
    public templateStages: TemplateStage[],
  ) {
    super();
  }
}

export enum EStatusProjectTemplate {}

export class TemplateStage extends CommonEntity {
  constructor(
    public stepOrder: number,
    public name: string,
    public description: string,
    public expiredDate: string,
    public isDone?: boolean,
  ) {
    super();
  }
}
