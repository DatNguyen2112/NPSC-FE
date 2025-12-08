import { CauHinhNhanSuFacade, CauHinhNhanSuModel, ChucVuFacade, PhongBanFacade } from '@store';
import { Button, Drawer, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EStatusState } from '@models';

const DrawerCauHinhNhanSu: React.FC = () => {
  const cauHinhNhanSuFacade = CauHinhNhanSuFacade();
  const phongBanFacade = PhongBanFacade();
  const chucVuFacade = ChucVuFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  useEffect(() => {
    chucVuFacade.get({});
    phongBanFacade.get({});
  }, []);

  useEffect(() => {
    switch (cauHinhNhanSuFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        cauHinhNhanSuFacade.get({});
        break;
      case EStatusState.getByIdFulfilled:
        let data: CauHinhNhanSuModel = {
          ...cauHinhNhanSuFacade.data,
          idChucVu: cauHinhNhanSuFacade.data?.chucVu?.id,
          idPhongBan: cauHinhNhanSuFacade.data?.phongBan?.id,
        };
        for (const key in data) {
          form.setFieldValue(key, data[key as keyof CauHinhNhanSuModel]);
        }
        return () => {
          form.resetFields();
        };
    }
  }, [cauHinhNhanSuFacade.status]);

  const handleClose = () => {
    cauHinhNhanSuFacade.set({ isVisible: false });
  };

  const onFinish = (values: CauHinhNhanSuModel) => {
    cauHinhNhanSuFacade.put({ ...values, id: cauHinhNhanSuFacade.data?.id ?? '' });
  };

  return (
    <Drawer
      title={`Chỉnh sửa cấu hình nhân sự`}
      closable={false}
      forceRender
      open={cauHinhNhanSuFacade.isVisible}
      closeIcon={false}
      extra={<Button type={'text'} onClick={handleClose} icon={<CloseOutlined />} />}
      afterOpenChange={(visible) => {
        if (!visible) {
          setSearchParams(
            (prev) => {
              prev.delete('id');
              return prev;
            },
            { replace: true },
          );
        }
      }}
      footer={
        <Space className={'flex justify-end'}>
          <Button type={'default'} block onClick={handleClose}>
            Huỷ bỏ
          </Button>
          <Button type={'primary'} block onClick={form.submit}>
            Lưu lại
          </Button>
        </Space>
      }
    >
      <Spin spinning={cauHinhNhanSuFacade.isFormLoading}>
        <Form form={form} layout={'vertical'} onFinish={onFinish}>
          <Form.Item label="Mã nhân sự" name="ma" rules={[{ required: true, message: 'Vui lòng nhập mã nhân sự!' }]}>
            <Input disabled placeholder="Nhập mã nhân sự" />
          </Form.Item>

          <Form.Item
            label="Tên Nhân Sự"
            name="tenNhanSu"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân sự!' }]}
          >
            <Input disabled placeholder="Nhập tên nhân sự" />
          </Form.Item>

          <Form.Item label="Chức vụ" name="idChucVu" rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}>
            <Select
              disabled
              options={chucVuFacade.pagination?.content.map((item) => {
                return { label: item.tenChucVu, value: item.id };
              })}
              placeholder={'Chọn chức vụ'}
              showSearch
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Phòng ban"
            name="idPhongBan"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
          >
            <Select
              disabled
              options={phongBanFacade.pagination?.content.map((item) => {
                return { label: item.tenPhongBan, value: item.id };
              })}
              placeholder={'Chọn phòng ban'}
              showSearch
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Lương Cơ Bản"
            name="luongCoBan"
            rules={[{ required: true, message: 'Vui lòng nhập lương cơ bản!' }]}
          >
            <InputNumber
              placeholder="Nhập lương cơ bản"
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/\.\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item label="Ăn Ca" name="anCa" rules={[{ required: true, message: 'Vui lòng nhập ăn ca!' }]}>
            <InputNumber
              placeholder="Nhập ăn ca"
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/\.\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Điện Thoại"
            name="dienThoai"
            rules={[{ required: true, message: 'Vui lòng nhập điện thoại!' }]}
          >
            <InputNumber
              placeholder="Nhập điện thoại"
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/\.\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Trang Phục"
            name="trangPhuc"
            rules={[{ required: true, message: 'Vui lòng nhập trang phục!' }]}
          >
            <InputNumber
              placeholder="Nhập trang phục"
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/\.\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default DrawerCauHinhNhanSu;
