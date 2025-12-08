import { Button,DatePicker, Drawer ,Form, Input, InputNumber,  Select, Space, Spin } from 'antd';
import React, { useEffect } from 'react';
import { EStatusState } from '@models';
import { ProjectFacade, CustomerFacade,CashbookTransactionFacade, CashbookTransactionModel } from '@store';
import { CloseOutlined} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import FormItem from 'antd/es/form/FormItem';
import dayjs from 'dayjs';

export const PhieuThuDrawer = () => {
  const [form] = Form.useForm();
  let data: CashbookTransactionModel
  const thuChiFacade = CashbookTransactionFacade();
  const khachHangFacade = CustomerFacade();
  const duAnFacade = ProjectFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const { TextArea } = Input;
  useEffect(() => {
    khachHangFacade.get({})
  }, []);

  useEffect(() => {
    switch (thuChiFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        thuChiFacade.get(JSON.parse(thuChiFacade.queryParams ?? ''));
        break;
      case EStatusState.getByIdFulfilled:
        data = {
          ...thuChiFacade.data,
          idKhachHang: thuChiFacade.khachHang ?? thuChiFacade.data?.khachHang?.id,
          idDuAn: thuChiFacade.data?.duAn?.id,
          // ngayThuChi: dayjs(thuChiFacade.data?.ngayThuChi).format('DD/MM/YYYY') ?? '',
        };

        for (const key in data) {
          if (key === 'ngayThuChi' && data.receiptDate) {
            form.setFieldValue('ngayThuChi', dayjs(data.receiptDate));
          } else form.setFieldValue(key, data[key as keyof CashbookTransactionModel]);
        }
    }
  }, [thuChiFacade.status]);

  useEffect(() => {
    if (thuChiFacade.isVisible && searchParams.has('id')) {
      thuChiFacade.getById({ id: searchParams.get('id') ?? '', keyState: '' });
    }
  }, [thuChiFacade.isVisible]);

  const onFinish = (values: any) => {
    values.loaiChiPhi = 'THU';
    values.ngayThuChi = values.ngayThuChi ? dayjs(values.ngayThuChi).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    if (thuChiFacade.isEdit) {
      return thuChiFacade.put({ ...values, id: searchParams.get('id') ?? '' });
    } else return thuChiFacade.post({ ...values });
  };

  const handleCloseDrawer = () => {
    thuChiFacade.set({ isVisible: false });
  };

  const onFill = (value: string) => {
    form.setFieldsValue({ chiChoMucDich: value });
  };
  return (
    <Drawer
      width={550}
      title={`${thuChiFacade.isEdit ? 'Chỉnh sửa' : 'Thêm mới'} phiếu thu`}
      open={thuChiFacade.isVisible}
      onClose={handleCloseDrawer}
      maskClosable={false}
      closeIcon={false}
      afterOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
          setSearchParams(
            (prev) => {
              prev.delete('id');
              return prev;
            },
            { replace: true },
          );
        }
      }}
      extra={<Button icon={<CloseOutlined />} type={'text'} onClick={handleCloseDrawer} />}
      footer={
        <Space className={'flex justify-end'}>
          <Button type={'default'} block onClick={handleCloseDrawer}>
            Huỷ bỏ
          </Button>
          <Button type={'primary'} block onClick={form.submit}>
            Lưu lại
          </Button>
        </Space>
      }
    >
      <Spin spinning={thuChiFacade.isFormLoading}>
        <Form form={form} layout={'vertical'} onFinish={onFinish}>
          <Form.Item className="mb-1" name="chiChoMucDich" label="Mục đích" rules={[{ required: true }]}>
            <Input disabled placeholder={'Nhập mục đích'} />
          </Form.Item>
          <FormItem>
            <Space direction="horizontal">
              <Button size="small" type="primary" onClick={() => onFill('Thu theo sản phẩm')}>
                Thu theo sản phẩm
              </Button>
              <Button size="small" type="primary" onClick={() => onFill('Thu theo vật tư')}>
                Thu theo vật tư
              </Button>
              <Button size="small" type="primary" onClick={() => onFill('Thu khác')}>
                Thu khác
              </Button>
            </Space>
          </FormItem>
          <Form.Item name="maChi" label="Mã thu" rules={[{ required: true }]}>
            <Input placeholder={'Nhập mã thu'} />
          </Form.Item>
          <Form.Item name="ngayThuChi" label="Ngày thu" rules={[{ required: true }]}>
            <DatePicker allowClear className="w-full" placeholder="Chọn ngày thu" format={'DD-MM-YYYY'} />
          </Form.Item>
          <Form.Item name="idKhachHang" label="Khách hàng" initialValue={thuChiFacade.khachHang ?? ''}>
            <Select
              allowClear
              options={khachHangFacade.pagination?.content.map((item) => {
                return { label: item.name, value: item.id };
              })}
              placeholder={'Chọn khách hàng'}
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
              showSearch
            />
          </Form.Item>

          <Form.Item name="idDuAn" label="Dự án">
            <Select
              options={duAnFacade.pagination?.content.map((item) => {
                return { label: item.tenDuAn, value: item.id };
              })}
              placeholder={'Chọn dự án'}
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
              allowClear
              showSearch
            />
          </Form.Item>

          <Form.Item name="soTien" label="Số tiền" rules={[{ required: true }]}>
            <InputNumber
              className="w-full text-right"
              controls={false}
              placeholder={'Nhập số tiền'}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value?.replace(/\./g, '') as unknown as number}
            />
          </Form.Item>
          <Form.Item name="ghiChu" label="Ghi chú">
            <TextArea placeholder={'Nhập ghi chú'} />
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
};
