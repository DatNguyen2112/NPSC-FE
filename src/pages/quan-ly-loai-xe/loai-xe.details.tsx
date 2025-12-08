import { CloseOutlined } from '@ant-design/icons';
import { LoaiXeFacade } from '@store';
import { Button, Drawer, Form, Input, Space, Spin } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const QuanLyLoaiXeDetails = () => {
  const [form] = Form.useForm();
  const [_searchParams, setSearchParams] = useSearchParams();
  const loaiXeFacade = LoaiXeFacade();

  useEffect(() => {
    if (loaiXeFacade.isViewDetails && loaiXeFacade.data?.id) {
      loaiXeFacade.getById({ id: loaiXeFacade.data.id, keyState: '' });
    }
  }, [loaiXeFacade.isViewDetails]);

  const handleClose = () => {
    form.resetFields();
    loaiXeFacade.set({ isViewDetails: false, data: undefined });
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
      title={'Xem chi tiết loại xe'}
      open={loaiXeFacade.isViewDetails}
      footer={
        <Space className={'flex justify-end'}>
          <Button type={'default'} block onClick={handleClose}>
            Đóng lại
          </Button>
        </Space>
      }
    >
      <Spin spinning={loaiXeFacade.isFormLoading}>
        <Form form={form} layout="vertical">
          <Form.Item label={'Tên loại xe'} name={'tenLoaiXe'} rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item label={'Mô tả'} name={'moTa'}>
            <Input disabled />
          </Form.Item>
          {/* <Form.Item label={'Số máy'} name={'soMay'}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label={'Hãng sản xuất'} name={'hangSanXuat'}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label={'Model'} name={'model'}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label={'Năm sản xuất'} name={'namSanXuat'}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label={'Tải trọng'} name={'taiTrong'}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label={'Trạng thái'} name={'active'}>
            <Switch disabled checkedChildren={'Đang hoạt động'} unCheckedChildren={'Ngừng hoạt động'}/>
          </Form.Item> */}
        </Form>
      </Spin>
    </Drawer>
  );
};
