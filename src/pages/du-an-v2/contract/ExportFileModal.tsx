import { QueryParams } from '@models';
import { ConstructionFacade, ContractFacade, EContractStatus, EStatusConstruction } from '@store';
import { Form, Modal, Radio, Space } from 'antd';
import { FC, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface ExportFileModalProps {
  queryParams: {
    page: number;
    size: number;
    filter: Record<string, any>;
    sort: string;
  };
}

const ExportFileModal: FC<ExportFileModalProps> = ({ queryParams }) => {
  const contractFacade = ContractFacade();
  const [form] = Form.useForm();

  const handleCancel = () => {
    contractFacade.set({
      isExportFileModalOpen: false,
    });
  };

  const onFinish = (values: any) => {
    contractFacade
      .exportExcel({
        ...queryParams,
        size: values.limit === 'all' ? -1 : queryParams.size,
        filter: JSON.stringify(queryParams.filter),
      })
      .finally(() => {
        contractFacade.set({
          isExportFileModalOpen: false,
        });
      });
  };

  return (
    <Modal
      title="Xuất file danh sách hợp đồng"
      open={contractFacade.isExportFileModalOpen}
      okText="Xuất file"
      cancelText="Thoát"
      onCancel={handleCancel}
      onOk={form.submit}
      confirmLoading={contractFacade.isExportingFile}
      okButtonProps={{
        disabled: contractFacade.isExportingFile,
      }}
      afterOpenChange={(open) => {
        if (!open) {
          form.resetFields();
        }
      }}
    >
      <Form
        className="mt-3"
        form={form}
        initialValues={{
          limit: 'all',
        }}
        layout="vertical"
        onFinish={onFinish}
      >
        <h3 className="font-semibold mb-2">Giới hạn kết quả xuất</h3>
        <Form.Item name="limit">
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="all">Tất cả hợp đồng</Radio>
              <Radio value="currentPage">Các hợp đồng trên trang này</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExportFileModal;
