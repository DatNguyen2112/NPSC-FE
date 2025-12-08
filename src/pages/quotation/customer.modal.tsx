import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { CustomerFacade, CustomerModel, QuotationFacade } from '@store';
import { scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  FormInstance,
  Input,
  Modal,
  Pagination,
  Row,
  Space,
  Spin,
  Table,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface DataType extends CustomerModel {
  key: string;
}
const CustomerModal = ({ quotationForm }: any) => {
  const quotationFacade = QuotationFacade();
  const customerFacade = CustomerFacade();

  const formRef = useRef<FormInstance | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const [customerForm] = Form.useForm();

  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');

  useEffect(() => {
    customerFacade.get({});
  }, []);

  useEffect(() => {
    switch (customerFacade.status) {
      case EStatusState.postFulfilled:
        customerFacade.get({});
        break;
    }
  }, [customerFacade.status]);

  const handleCloseModal = () => {
    quotationFacade.set({ isCustomer: false });
  };

  const datasource: DataType[] =
    customerFacade.pagination?.content.map((items, index) => ({
      stt:
        (Number(customerFacade.pagination?.page ?? 0) - 1) * Number(customerFacade.pagination?.size ?? 0) + index + 1,
      index: index + 1,
      id: items.id ?? '',
      key: uuidv4(),
      code: items?.code ? items?.code : '-',
      name: items?.name ? items?.name : '-',
      address: items?.address ? items?.address : '-',
      taxCode: items.taxCode ? items.taxCode : '-',
      phoneNumber: items?.phoneNumber ? items?.phoneNumber : '-',
      birthdate: items.birthdate ? dayjs(items.birthdate).format('DD-MM-YYYY') : '-',
    })) ?? [];

  const column: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
      width: 60,
    },
    {
      title: 'Mã khách hàng',
      dataIndex: 'code',
      key: 'code',
      width: 220,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode',
      width: 250,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthdate',
      key: 'birthdate',
      width: 250,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 200,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  const table = useMemo(
    () => (
      <Table
        size="small"
        scroll={{ y: 'calc(100vh - 300px)' }}
        dataSource={datasource}
        columns={column}
        pagination={false}
        rowClassName={'cursor-pointer'}
        onRow={(record) => {
          return {
            onClick: () => {
              quotationForm.setFieldsValue({
                customerName: record?.name,
                customerAddress: record?.address,
                customerPhoneNumber: record?.phoneNumber,
                customerTaxCode: record?.taxCode,
                customerId: record?.id,
                customerCode: record?.code,
              });
              quotationFacade.set({ isCustomer: false, isCustomerSelected: true });
            },
          };
        }}
      />
    ),
    [customerFacade.isLoading],
  );

  const onChangeDataTable = (query: QueryParams) => {
    const fillQuery: QueryParams = {
      page: query.page ?? Number(page),
      size: query.size ?? Number(size),
      filter: query.filter ?? filter ?? '',
      sort: query.sort ?? sort ?? '',
    };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    customerFacade.get(fillQuery);
  };

  const onChangeSearch = (value: string) => {
    onChangeDataTable({
      page: 1,
      size: 20,
      filter: JSON.stringify({ FullTextSearch: value }),
    });
  };

  const onClose = () => {
    customerFacade.set({ isVisible: false });
    customerForm.resetFields();
  };

  const onFinishCustomer = (values: CustomerModel) => {
    if (values) {
      customerFacade.post(values);
    }
  };

  return (
    <Modal
      className="modal-fullScreen"
      title={`Tài khoản khách hàng`}
      centered
      width="100vw"
      open={quotationFacade.isCustomer}
      cancelButtonProps={{ disabled: true }}
      closable
      onCancel={handleCloseModal}
      footer={
        <div className={`bg-white w-full bottom-0 right-0 z-50 fixed border py-5 pr-5`}>
          <Space className={'flex justify-end'}>
            <Button onClick={handleCloseModal}>Hủy bỏ</Button>
          </Space>
        </div>
      }
    >
      <Spin spinning={customerFacade.isLoading}>
        <div className={'flex items-center justify-between mb-3'}>
          <SearchWidget
            className="w-72"
            placeholder="Tìm kiếm khách hàng"
            form={(form) => (formRef.current = form)}
            callback={onChangeSearch}
          />
          <Button
            type="primary"
            onClick={() => customerFacade.set({ isVisible: true, data: undefined, isEdit: false })}
          >
            Thêm khách hàng
          </Button>
        </div>
        {table}
        <Pagination
          className={'flex justify-end pt-3'}
          showSizeChanger
          current={customerFacade?.query?.page}
          pageSize={customerFacade?.pagination?.size}
          total={customerFacade?.pagination?.totalElements}
          pageSizeOptions={[20, 40, 60, 80]}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          onChange={(page, pageSize) => {
            onChangeDataTable({ page: page, size: pageSize });
            scrollLeftWhenChanging('.ant-table-body');
            scrollTopWhenChanging('.ant-table-body');
          }}
        />
      </Spin>
      <Drawer
        title="Thêm mới khách hàng"
        maskClosable={false}
        closeIcon={false}
        extra={<Button type={'text'} icon={<CloseOutlined />} onClick={onClose} />}
        footer={
          <Space className={'flex justify-end'}>
            <Button danger onClick={onClose}>
              Hủy
            </Button>
            <Button type={'primary'} onClick={customerForm.submit}>
              Lưu
            </Button>
          </Space>
        }
        open={customerFacade.isVisible}
        onClose={onClose}
      >
        <Form form={customerForm} layout="vertical" onFinish={onFinishCustomer}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="code" label="Mã khách hàng" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="name" label="Tên khách hàng" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="taxCode" label="Mã số thuế" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, max: 11 }]}>
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="birthdate" label="Ngày sinh">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </Modal>
  );
};

export default CustomerModal;
