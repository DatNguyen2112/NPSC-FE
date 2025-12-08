import { Button, Drawer, Form as FormAnt, Spin } from 'antd';
import { forwardRef, Ref, useEffect, useImperativeHandle } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import { FormModalRefObject, FormModel } from '@models';
import { convertFormValue } from '@utils';
import { useTranslation } from 'react-i18next';
import { Form } from '../form';
import { useSearchParams } from 'react-router-dom';

export const DrawerForm = forwardRef(
  (
    {
      isGetData = true,
      keyGetData = 'getById',
      size,
      title,
      columns,
      textSubmit = 'components.form.modal.save',
      textCancel = 'components.datatable.cancel',
      facade,
      keyState = 'isVisible',
      keyIsLoading = 'isFormLoading',
      keyData = 'data',
      onSubmit,
      value,
      afterOpenChange,
    }: Type,
    ref: Ref<FormModalRefObject>,
  ) => {
    useImperativeHandle(ref, () => ({ form }));
    const { t } = useTranslation();
    const [form] = FormAnt.useForm();
    const [searchParam, setSearchParams] = useSearchParams();

    const handleClose = () => {
      if (searchParam.has('id')) {
        searchParam.delete('id', facade.data?.id ?? '');
        setSearchParams(
          (prev) => {
            if (prev.has('id')) {
              prev.delete('id');
            }
            return prev;
          },
          { replace: true },
        );
      }

      if (!value?.current) facade.set({ [keyData]: undefined, [keyState]: false });
      else {
        value.current = {};
        facade.set({ [keyState]: false });
      }
    };
    useEffect(() => {
      if (isGetData && facade[keyState] && facade.data) facade[keyGetData](facade[keyData]);
    }, [facade[keyState]]);
    return (
      <Drawer
        size={size}
        title={title}
        open={facade[keyState]}
        onClose={() => handleClose()}
        maskClosable={false}
        closeIcon={false}
        afterOpenChange={afterOpenChange}
        extra={<Button icon={<CloseOutlined />} type={'text'} onClick={handleClose} />}
        footer={
          <div className="flex justify-end gap-3">
            <Button type={'default'} onClick={() => handleClose()}>
              {t(textCancel)}
            </Button>
            <Button
              type={'primary'}
              className={'!py-0'}
              onClick={async () => onSubmit(convertFormValue(columns, await form.validateFields()))}
              disabled={facade[keyIsLoading]}
            >
              {t(textSubmit)}
            </Button>
          </div>
        }
      >
        <Spin spinning={facade[keyIsLoading]}>
          <Form
            className="intro-x"
            values={value?.current ?? { ...facade[keyData] }}
            formAnt={form}
            columns={columns}
            spinning={facade[keyIsLoading]}
          />
        </Spin>
      </Drawer>
    );
  },
);
DrawerForm.displayName = 'DrawerForm';
type Type = {
  isGetData?: boolean;
  keyGetData?: string;
  facade: any;
  size?: undefined | 'large';
  keyState?: string;
  keyIsLoading?: string;
  keyData?: string;
  title: string;
  columns: FormModel[];
  textSubmit?: string;
  textCancel?: string;
  value?: any;
  afterOpenChange?: (open: boolean) => void;
  onSubmit: (value: any) => void;
};
