import { DataTableModel, EFormRuleType, EFormType, ETableAlign, ETableFilterType, FormModel } from '@models';
import { Avatar } from 'antd';
import dayjs from 'dayjs';
import { ToolTip } from '@core/tooltip';
import { PopConfirm } from '@core/pop-confirm';
import { Check, Disable, Edit, Trash } from '@svgs';
import React from 'react';
import { DataFacade, GlobalFacade } from '@store';
import { useTranslation } from 'react-i18next';
import slug from 'slug';

export default {
  table: (): DataTableModel[] => {
    const { formatDate } = GlobalFacade();
    const { t } = useTranslation();
    const dataFacade = DataFacade();

    return [
      {
        title: 'routes.admin.Data.Name',
        name: 'name',
        tableItem: {
          filter: { type: ETableFilterType.search },
          sorter: true,
          render: (text: any, item: any) => (
            <Avatar
              src={item.image}
              // text={
              //   text ||
              //   (item.translations.length &&
              //     item.translations?.filter((item: any) => item?.language === localStorage.getItem('i18nextLng'))[0]
              //       .name) ||
              //   ''
              // }
            />
          ),
        },
      },
      {
        title: 'routes.admin.Data.Order',
        name: 'order',
        tableItem: {
          filter: { type: ETableFilterType.search },
          sorter: true,
        },
      },
      {
        title: 'Created',
        name: 'createdAt',
        tableItem: {
          width: 120,
          filter: { type: ETableFilterType.date },
          sorter: true,
          render: (text: any) => dayjs(text).format(formatDate),
        },
      },
      {
        title: 'routes.admin.user.Action',
        tableItem: {
          width: 100,
          align: ETableAlign.center,
          render: (data: any) => (
            <div className={'flex gap-2'}>
              <ToolTip title={t(data.isDisabled ? 'components.datatable.Disabled' : 'components.datatable.Enabled')}>
                <PopConfirm
                  title={t(
                    !data.isDisabled
                      ? 'components.datatable.areYouSureWantDisable'
                      : 'components.datatable.areYouSureWantEnable',
                  )}
                  onConfirm={() => dataFacade.putDisable({ id: data.id, disable: !data.isDisabled })}
                >
                  <button
                    title={t(data.isDisabled ? 'components.datatable.Disabled' : 'components.datatable.Enabled') || ''}
                  >
                    {data.isDisabled ? (
                      <Disable className="icon-cud bg-yellow-700 hover:bg-yellow-500" />
                    ) : (
                      <Check className="icon-cud bg-green-600 hover:bg-green-400" />
                    )}
                  </button>
                </PopConfirm>
              </ToolTip>
              <ToolTip title={t('routes.admin.Layout.Edit')}>
                <button title={t('routes.admin.Layout.Edit') || ''} onClick={() => dataFacade.getById({ id: data.id })}>
                  <Edit className="icon-cud bg-teal-900 hover:bg-teal-700" />
                </button>
              </ToolTip>
              <ToolTip title={t('routes.admin.Layout.Delete')}>
                <PopConfirm
                  title={t('components.datatable.areYouSureWant')}
                  onConfirm={() => dataFacade.delete(data.id)}
                >
                  <button title={t('routes.admin.Layout.Delete') || ''}>
                    <Trash className="icon-cud bg-red-600 hover:bg-red-400" />
                  </button>
                </PopConfirm>
              </ToolTip>
            </div>
          ),
        },
      },
    ];
  },
  form: (): FormModel[] => {
    return [
      {
        title: 'Tiêu đề',
        name: 'title',
        formItem: {
          rules: [{ type: EFormRuleType.required }],
          onBlur: (e: any, form: any) => {
            if (e.target.value && !form.getFieldValue('code')) {
              form.setFieldValue('code', slug(e.target.value).toUpperCase());
            }
          },
        },
      },
      {
        title: 'Thứ tự',
        name: 'order',
        formItem: {},
      },
      {
        title: 'Mã',
        name: 'code',
        formItem: {
          rules: [{ type: EFormRuleType.required }, { type: EFormRuleType.max, value: 100 }],
        },
      },
      {
        title: 'Mô tả',
        name: 'description',
        formItem: {
          type: EFormType.textarea,
        },
      },
    ];
  },
};
