import { EFormRuleType, EFormType, FormModel } from '@models';

export default {
  form: (): FormModel[] => {
    return [
      {
        name: 'type',
        title: 'routes.admin.post.type',
        formItem: {
          type: EFormType.hidden,
          disabled: () => true,
        },
      },
      {
        title: 'Tiêu đề',
        name: 'title',
        formItem: {
          rules: [{ type: EFormRuleType.required }],
        },
      },
      {
        title: 'Slug',
        name: 'slug',
        formItem: {
          type: EFormType.text,
        },
      },
      {
        title: 'Giới thiệu',
        name: 'coverUrl',
        formItem: {
          type: EFormType.textarea,
        },
      },
    ];
  },
};
