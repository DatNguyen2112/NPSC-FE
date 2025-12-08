import { QueryParams } from '@models';
import { ConstructionFacade, EStatusConstruction } from '@store';
import { Form, Modal, Radio, Space } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ExportFileModal() {
  const constructionFacade = ConstructionFacade();
  const [exportFileForm] = Form.useForm();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    switch (constructionFacade.status) {
      case EStatusConstruction.exportExcelFulfilled:
        exportFileForm.resetFields();
        constructionFacade.set({
          isExportFileModal: false,
        });
        break;
    }
  }, [constructionFacade.status]);

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
    constructionFacade.set({
      isExportFileModal: false,
    });
  };

  const onFinish = (values: { limit: 'all' | 'currentPage' }) => {
    if (values.limit === 'all') {
      // export all
      constructionFacade.exportListToExcel({ ...query, size: -1 });
    }
    if (values.limit === 'currentPage') {
      // export current page
      constructionFacade.exportListToExcel(query);
    }
  };

  return (
    <Modal
      title={'Xuất file danh sách công trình'}
      open={constructionFacade.isExportFileModal}
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
              <Radio value="all"> Tất cả công trình </Radio>
              <Radio value="currentPage"> Các công trình trên trang này </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
