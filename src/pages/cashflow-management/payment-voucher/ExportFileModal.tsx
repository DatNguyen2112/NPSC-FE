import { QueryParams } from '@models';
import { EStatusThuChi, CashbookTransactionFacade } from '@store';
import { Form, Modal, Radio, Space } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ExportFilePaymentVouchersModal() {
  const cashbookTransactionFacade = CashbookTransactionFacade();
  const [exportFileForm] = Form.useForm();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    switch (cashbookTransactionFacade.status) {
      case EStatusThuChi.exportExcelListFulfilled:
      case EStatusThuChi.exportExcelListCurrentPageFulfilled:
        exportFileForm.resetFields();
        cashbookTransactionFacade.set({
          isExportFileModalPaymentVoucher: false,
        });
        break;
    }
  }, [cashbookTransactionFacade.status]);

  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');

  const query: QueryParams = {
    page: page ? Number(page) : 1,
    size: size ? Number(size) : 20,
    filter: filter ? JSON.stringify(JSON.parse(filter)) : JSON.stringify({}),
    sort: sort ? JSON.parse(sort) : '',
  };

  const handleCancel = () => {
    cashbookTransactionFacade.set({
      isExportFileModalPaymentVoucher: false,
    });
  };

  const onFinish = (values: { limit: 'all' | 'currentPage' }) => {
    if (values.limit === 'all') {
      // export all
      cashbookTransactionFacade.exportExcelList('CHI');
    }
    if (values.limit === 'currentPage') {
      // export current page
      cashbookTransactionFacade.exportExcelListCurrentPage('CHI', query);
    }
  };

  return (
    <Modal
      title={'Xuất file danh sách phiếu chi'}
      open={cashbookTransactionFacade.isExportFileModalPaymentVoucher}
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
              <Radio value="all"> Tất cả phiếu chi </Radio>
              <Radio value="currentPage"> Các phiếu chi trên trang này </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
