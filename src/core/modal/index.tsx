import { Modal as AntModal, Button, Divider, Space, Spin } from 'antd';
import classNames from 'classnames';
import { forwardRef, PropsWithChildren, Ref, useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

export const Modal = forwardRef(
  (
    {
      facade,
      keyState = 'isVisible',
      keyId = 'id',
      title,
      widthModal = 9999,
      onOk,
      textSubmit,
      textCancel,
      className = '',
      footerCustom,
      children,
      name,
    }: Type,
    ref: Ref<{ handleCancel: () => void }>,
  ) => {
    useImperativeHandle(ref, () => ({ handleCancel }));
    const [searchParams, setSearchParams] = useSearchParams();
    const { data, isLoading, ...state } = facade;
    const { t } = useTranslation();
    const handleCancel = () => facade.set({ [keyState]: false });
    const handleOk = async () => {
      if (onOk) onOk();
      else handleCancel();
    };

    useEffect(() => {
      if (name) {
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            searchParams.get('modal') || '',
          )
        )
          facade.getById({ id: searchParams.get('modal') });
        else if (searchParams.get('modal')) facade.set({ [keyState]: true, isLoading: false });
      }
    }, []);

    useEffect(() => {
      if (name) {
        if (facade[keyState] && !searchParams.has('modal')) {
          setSearchParams((params) => {
            params.set('modal', facade[keyId] || name);
            return params;
          });
        } else if (searchParams.has('modal')) {
          setSearchParams((params) => {
            params.delete('modal');
            return params;
          });
        }
      }
    }, [facade[keyState]]);

    return (
      <AntModal
        maskClosable={false}
        destroyOnClose={true}
        centered={true}
        width={widthModal}
        className={classNames({ 'modal-fullScreen': widthModal === '100vw' })}
        title={title && <h3 className="font-bold text-base">{title(data)}</h3>}
        open={state[keyState]}
        onOk={handleOk}
        onCancel={handleCancel}
        wrapClassName={className}
        footer={
          !!onOk &&
          ((footerCustom && footerCustom(handleOk, handleCancel)) || (
            <div
              className={`bg-white w-full bottom-0 right-0 z-50 ${widthModal === '100vw' ? 'fixed border py-5 pr-5' : 'sticky'}`}
            >
              {/* {widthModal === '100vw' && <Divider />} */}
              <Space className={'flex justify-end'}>
                <Button onClick={handleCancel}>{t(textCancel || '') || t('components.datatable.cancel')}</Button>
                <Button onClick={handleOk} type={'primary'}>
                  {t(textSubmit || '') || t('components.form.modal.save')}
                </Button>
              </Space>
            </div>
          ))
        }
      >
        <Spin spinning={isLoading}>{children}</Spin>
      </AntModal>
    );
  },
);
Modal.displayName = 'HookModal';
type Type = PropsWithChildren<{
  facade: any;
  keyState?: string;
  keyId?: string;
  title?: (data: any) => string;
  widthModal?: number | string;
  onOk?: () => any;
  onCancel?: () => void;
  textSubmit?: string;
  textCancel?: string;
  className?: string;
  footerCustom?: (handleOk: () => Promise<void>, handleCancel: () => void) => JSX.Element[] | JSX.Element;
  name?: string;
}>;
