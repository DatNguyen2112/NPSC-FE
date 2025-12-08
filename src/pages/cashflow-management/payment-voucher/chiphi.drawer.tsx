import {  Button, DatePicker, Drawer, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import React, {useEffect } from 'react';
import { EStatusState } from '@models';
import { ProjectFacade, NhaCungCapFacade, CashbookTransactionFacade, CashbookTransactionModel } from '@store';
import { CloseOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import FormItem from 'antd/es/form/FormItem';
import dayjs from 'dayjs';

let data: CashbookTransactionModel
export const ChiPhiDrawer = () => {
  const [form] = Form.useForm();
  const cashbookTransactionFacade = CashbookTransactionFacade();
  const nhaCungCapFacade = NhaCungCapFacade();
  const duAnFacade = ProjectFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const { TextArea } = Input;

  useEffect(() => {
    duAnFacade.get({})
    nhaCungCapFacade.get({})
  }, []);

  useEffect(() => {
    switch (cashbookTransactionFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        cashbookTransactionFacade.get(JSON.parse(cashbookTransactionFacade.queryParams ?? ''));
        break;
      case EStatusState.getByIdFulfilled:
         data = {
          ...cashbookTransactionFacade.data,
          idMaNhaCungCap: cashbookTransactionFacade.data?.nhaCungCap?.id,
          idDuAn: cashbookTransactionFacade.data?.duAn?.id,
          // ngayThuChi: dayjs(thuChiFacade.data?.ngayThuChi).format('DD/MM/YYYY') ?? '',
        };

        for (const key in data) {
          if (key === 'ngayThuChi' && data.receiptDate) {
            form.setFieldValue('ngayThuChi', dayjs(data.receiptDate));
          } else form.setFieldValue(key, data[key as keyof CashbookTransactionModel]);
        }
    }
  }, [cashbookTransactionFacade.status]);

  useEffect(() => {
    if (cashbookTransactionFacade.isPhieuChi && searchParams.has('id')) {
      cashbookTransactionFacade.getById({ id: searchParams.get('id') ?? '', keyState: '' });
    }
  }, [cashbookTransactionFacade.isPhieuChi]);

  const onFinish = (values: any) => {
    values.loaiChiPhi = 'CHI';
    values.ngayThuChi = values.ngayThuChi ? dayjs(values.ngayThuChi).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    if (cashbookTransactionFacade.isEdit) {
      return cashbookTransactionFacade.put({ ...values, id: searchParams.get('id') ?? '' });
    } else return cashbookTransactionFacade.post({ ...values });
  };

  const handleCloseDrawer = () => {
    cashbookTransactionFacade.set({ isPhieuChi: false });
  };

  const onFill = (value: string) => {
    form.setFieldsValue({ chiChoMucDich: value });
  };
  return (
    <Drawer
      width={550}
      title={`${cashbookTransactionFacade.isEdit ? 'Chỉnh sửa' : 'Thêm mới'} chi phí`}
      open={cashbookTransactionFacade.isPhieuChi}
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
      <Spin spinning={cashbookTransactionFacade.isFormLoading}>
        <Form form={form} layout={'vertical'} onFinish={onFinish}>
          <Form.Item className="mb-1" name="chiChoMucDich" label="Mục đích" rules={[{ required: true }]}>
            <Input disabled placeholder={'Nhập mục đích'} />
          </Form.Item>
          <FormItem>
            <Space direction="horizontal">
              <Button size="small" type="primary" onClick={() => onFill('Chi phí nội bộ')}>
                Chi phí nội bộ
              </Button>
              <Button size="small" type="primary" onClick={() => onFill('Chi phí vật tư')}>
                Chi phí vật tư
              </Button>
              <Button size="small" type="primary" onClick={() => onFill('Chi phí khác')}>
                Chi phí khác
              </Button>
            </Space>
          </FormItem>
          <Form.Item name="maChi" label="Mã chi" rules={[{ required: true }]}>
            <Input placeholder={'Nhập mã'} />
          </Form.Item>
          <Form.Item name="ngayThuChi" label="Ngày chi" rules={[{ required: true }]}>
            <DatePicker allowClear className="w-full" placeholder="Chọn ngày chi" format={'DD-MM-YYYY'} />
          </Form.Item>
          <Form.Item name="idMaNhaCungCap" label="Nhà cung cấp" initialValue={cashbookTransactionFacade.nhaCungCap ?? ''}>
            <Select
              options={nhaCungCapFacade.pagination?.content.map((item) => {
                return { label: item.name, value: item.id };
              })}
              placeholder={'Chọn nhà cung cấp'}
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
              allowClear
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
              // formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              // parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
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
