import { CloseOutlined } from '@ant-design/icons';
import { EStatusState } from '@models';
import { LoaiXeFacade, RightMapRoleFacade } from '@store';
import { Button, Drawer, Form, Input, Space, Spin, Tooltip } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const LoaiXeForm = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const loaiXeFacade = LoaiXeFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const filter = searchParams.get('filter');

  useEffect(() => {
    rightMapRoleFacade.getRightMapByListCode('CODETYPE');
  }, []);

  useEffect(() => {
    switch (loaiXeFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
      case EStatusState.deleteFulfilled:
        handleClose();
        if (filter) {
          loaiXeFacade.get({ filter: filter });
        } else loaiXeFacade.get({});
        break;
    }
  }, [loaiXeFacade.status]);

  useEffect(() => {
    if (loaiXeFacade.isVisible && loaiXeFacade.data?.id) {
      loaiXeFacade.getById({ id: loaiXeFacade.data.id, keyState: '' });
    }
  }, [loaiXeFacade.isVisible]);

  const handleClose = () => {
    form.resetFields();
    loaiXeFacade.set({ isVisible: false, data: undefined });
    setSearchParams(
      (prev) => {
        if (prev.has('id')) prev.delete('id');
        return prev;
      },
      { replace: true },
    );
  };
  useEffect(() => {
    for (const key in loaiXeFacade.data) {
      form.setFieldValue(key, (loaiXeFacade.data as any)[key]);
    }
    return () => {
      form.resetFields();
    };
  }, [loaiXeFacade.data]);

  const onFinish = (values: any) => {
    if (loaiXeFacade.data?.id) {
      loaiXeFacade.put({ ...values, id: loaiXeFacade.data.id });
    } else loaiXeFacade.post(values);
  };

  return (
    <Drawer
      onClose={handleClose}
      maskClosable={false}
      destroyOnClose={true}
      closeIcon={false}
      forceRender={true}
      getContainer={false}
      placement="right"
      extra={<Button icon={<CloseOutlined />} type={'text'} onClick={handleClose} />}
      title={loaiXeFacade.isEdit ? 'Chỉnh sửa loại xe' : 'Thêm mới loại xe'}
      open={loaiXeFacade.isVisible}
      footer={
        <Space className={'flex justify-end'}>
          <Button type={'default'} block onClick={handleClose}>
            Huỷ bỏ
          </Button>

          {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('ADD') ||
          (loaiXeFacade.data?.id && !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('UPDATE')) ? (
            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
              <Button disabled={true} type={'primary'} className={'!py-0'} onClick={form.submit}>
                Lưu lại
              </Button>
            </Tooltip>
          ) : (
            <Button type={'primary'} className={'!py-0'} onClick={form.submit}>
              Lưu lại
            </Button>
          )}
        </Space>
      }
    >
      <Spin spinning={loaiXeFacade.isFormLoading}>
        <Form onFinish={onFinish} form={form} layout="vertical">
          <Form.Item label={'Tên loại xe'} name={'tenLoaiXe'} rules={[{ required: true }]}>
            <Input placeholder={'Nhập tên loại xe'} />
          </Form.Item>
          <Form.Item label={'Mô tả'} name={'moTa'}>
            <Input placeholder={'Nhập mô tả'} />
          </Form.Item>
          {/* <Form.Item label={'Số máy'} name={'soMay'}>
            <Input placeholder={'Nhập số máy của loại xe'} />
          </Form.Item>
          <Form.Item label={'Hãng sản xuất'} name={'hangSanXuat'} rules={[{ required: true }]}>
            <Input placeholder={'Nhập hãng sản xuất'} />
          </Form.Item>
          <Form.Item label={'Model'} name={'model'} rules={[{ required: true }]}>
            <Input placeholder={'Nhập model'} />
          </Form.Item>
          <Form.Item label={'Năm sản xuất'} name={'namSanXuat'}>
            <Input placeholder={'Nhập năm sản xuất'} />
          </Form.Item>
          <Form.Item label={'Tải trọng'} name={'taiTrong'} rules={[{ required: true }]}>
            <Input placeholder={'Nhập tải trọng'} />
          </Form.Item>
          <Form.Item label={'Trạng thái'} name={'active'} className={'flex'}>
            <Switch checkedChildren={<CheckCircleOutlined />} unCheckedChildren={<CloseOutlined />} />
          </Form.Item> */}
        </Form>
      </Spin>
    </Drawer>
  );
};
