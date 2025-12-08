import { QueryParams } from '@models';
import { EStatusInventoryNote, EStatusQuotation, InventoryNoteFacade, QuotationFacade } from '@store';
import { Form, Modal, Radio, Space } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ExportFileQuotationModal() {
  const quotationFacade = QuotationFacade();
  const [exportFileForm] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    switch (quotationFacade.status) {
      case EStatusQuotation.exportListToExcelFulfilled:
        exportFileForm.resetFields();
        quotationFacade.set({
          isExportFileModalQuotation: false,
        });
        break;
    }
  }, [quotationFacade.status]);

  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');

  const query: QueryParams = {
    page: page ? Number(page) : 1,
    size: size ? Number(size) : 20,
    filter: filter ? JSON.parse(filter) : {},
    sort: sort ? JSON.parse(sort) : '',
  };

  const handleCancel = () => {
    quotationFacade.set({
      isExportFileModalQuotation: false,
    });
  };

  const onFinish = (values: { limit: 'all' | 'currentPage' }) => {
    if (values.limit === 'all') {
      // export all
      quotationFacade.exportListToExcel({ size: -1 });
    }
    if (values.limit === 'currentPage') {
      // export current page
      quotationFacade.exportListToExcel(query);
    }
  };

  return (
    <Modal
      title={'Xuất file danh sách báo giá'}
      open={quotationFacade.isExportFileModalQuotation}
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
              <Radio value="all"> Tất cả báo giá </Radio>
              <Radio value="currentPage"> Các báo giá trên trang này </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
