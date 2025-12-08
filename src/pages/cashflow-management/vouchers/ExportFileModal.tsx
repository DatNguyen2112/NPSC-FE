import { QueryParams } from '@models';
import { EStatusThuChi, CashbookTransactionFacade } from '@store';
import { Form, Modal, Radio, Space } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import React from 'react';
import dayjs from 'dayjs';

export default function ExportFileVouchersModal() {
  const cashbookTransactionFacade = CashbookTransactionFacade();
  const [exportFileForm] = Form.useForm();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    switch (cashbookTransactionFacade.status) {
      case EStatusThuChi.exportExcelListVoucherFulfilled:
        exportFileForm.resetFields();
        cashbookTransactionFacade.set({
          isExportFileModalVoucher: false,
        });
        break;
    }
  }, [cashbookTransactionFacade.status]);

  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter') || '{}';
  const sort = searchParams.get('sort');

  const query: QueryParams = {
    page: page ? Number(page) : 1,
    size: size ? Number(size) : 20,
    filter: filter ? JSON.stringify(JSON.parse(filter)) : JSON.stringify({}),
    sort: sort ? JSON.parse(sort) : '',
  };

  const handleCancel = () => {
    cashbookTransactionFacade.set({
      isExportFileModalVoucher: false,
    });
  };

  const onFinish = (values: { limit: 'all' | 'currentPage'|'today' }) => {
    if (values.limit === 'all') {
      // export all
      cashbookTransactionFacade.exportExcelListCurrentPageVoucher({
        size: -1,
        filter: JSON.stringify({
          dateRange: JSON.parse(filter)?.dateRange,
          isActive: 'COMPLETED',
        }),
      });
    }
    if (values.limit === 'currentPage') {
      // export current page
      cashbookTransactionFacade.exportExcelListCurrentPageVoucher(query);
    }
    if (values.limit === 'today') {
      cashbookTransactionFacade.exportExcelListCurrentPageVoucher({
        size: -1,
        filter: JSON.stringify({
          dateRange: [dayjs().format('YYYY-MM-DD'),  dayjs().format('YYYY-MM-DD')],
          isActive: 'COMPLETED',
        }),
      });
    }

  };

  return (
    <Modal
      title={'Xuất file báo cáo sổ quỹ'}
      open={cashbookTransactionFacade.isExportFileModalVoucher}
      okText={'Xuất file'}
      cancelText={'Thoát'}
      onCancel={handleCancel}
      onOk={exportFileForm.submit}
    >
      <Form
        className="mt-3"
        form={exportFileForm}
        initialValues={{
          limit: 'all',
        }}
        layout="vertical"
        onFinish={onFinish}
      >
        {/* Giới hạn kết quả xuất */}
        <Form.Item label={<h3 className="font-semibold">Giới hạn kết quả xuất</h3>} name={'limit'}>
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="all"> Tất cả dữ liệu</Radio>
              <Radio value="currentPage"> Các dữ liệu trên trang này </Radio>
              <Radio value="today"> Thống kê thu/chi ngày hôm nay </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
