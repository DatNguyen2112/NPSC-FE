import { LeftOutlined } from '@ant-design/icons';
import { EStatusState } from '@models';
import {
  CodeTypeFacade,
  CodeTypeModel,
  ProjectFacade,
  ParameterFacade,
  ProductFacade,
  QuotationFacade,
  QuotationModel,
} from '@store';
import { lang, routerLinks } from '@utils';
import { Button, Col, DatePicker, Flex, Form, Input, Radio, Row, Select, Space, Spin } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import QuotationItemTable from './QuotationItemTable';
import CustomerModal from './customer.modal';

const { Option } = Select;

const CreateUpdateForm: React.FC = () => {
  const quotationFacade = QuotationFacade();
  const projectFacade = ProjectFacade();
  const productFacade = ProductFacade();
  const parameterFacade = ParameterFacade();
  const codeTypeFacade = CodeTypeFacade();

  const navigate = useNavigate();
  const [quotationForm] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { id } = useParams();
  const regex = /create$/;

  useEffect(() => {
    projectFacade.get({ size: -1 });
    parameterFacade.get({});
    codeTypeFacade.getPaymentMethods({});
  }, []);

  useEffect(() => {
    if (id) {
      quotationFacade.getById({ id: id ?? '', keyState: '' });
    }
  }, [id]);

  useEffect(() => {
    switch (quotationFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        navigate(`/${lang}${routerLinks('Quotation')}`);
        break;
      case EStatusState.getByIdFulfilled:
        let data: QuotationModel = {
          ...quotationFacade.data,
          dueDate: quotationFacade.data.dueDate ? dayjs(quotationFacade.data.dueDate) : null,
        };
        for (const key in data) {
          quotationForm.setFieldValue(key, data[key as keyof QuotationModel]);
        }
        break;
    }
  }, [quotationFacade.status]);

  const vat = parameterFacade.pagination?.content.find((item) => item.name === 'VAT');
  const ghiChu = parameterFacade.pagination?.content.find((item) => item.name === 'GHICHU');
  // Lấy ngày hiện tại với định dạng "Ngày tháng năm"
  const currentDate = dayjs().format('DD [tháng] MM [năm] YYYY');

  // HANDLE CANCEL
  const onCancel = () => {
    navigate(`/${lang}${routerLinks('Quotation')}`);
  };

  // HANDLE SUBMIT
  const onFinish = (values: QuotationModel) => {
    const data = {
      customerId: values.customerId,
      customerCode: values.customerCode,
      customerName: values.customerName,
      customerAddress: values.customerAddress,
      customerPhoneNumber: values.customerPhoneNumber,
      customerTaxCode: values.customerTaxCode,
      projectId: values.projectId,
      projectCode: projectFacade.pagination?.content.find((item) => item.id === values.projectId)?.maDuAn,
      projectName: projectFacade.pagination?.content.find((item) => item.id === values.projectId)?.tenDuAn,
      orderCode: values.orderCode,
      typeCode: values.typeCode,
      dueDate: values.dueDate,
      note: id ? quotationFacade.data?.note : ghiChu?.value,
      vatPerCent: Number(vat?.value) ?? 0,
      unitPriceDiscountAmount: 0,
      shippingCostAmount: 0,
      otherCostAmount: 0,
      paymentMethodCode: values.paymentMethodCode,
      quotationItem: values?.quotationItem?.map((item) => {
        return {
          id: item.id,
          code: item.code,
          name: productFacade.pagination?.content.find((product) => product.code === item.code)?.name,
          specifications: item.specifications,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitPriceDiscountAmount: item.unitPriceDiscountAmount,
          lineAmount: item.lineAmount,
          lineNote: item.lineNote,
        };
      }),
    };
    if (regex.test(location.pathname) && !id) {
      quotationFacade.post(data);
    } else {
      quotationFacade.put({ ...data, id: id ?? '' });
    }
  };

  return (
    <>
      <Spin spinning={quotationFacade.isFormLoading}>
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            {regex.test(location.pathname) ? 'Thêm mới' : 'Chỉnh sửa'} báo giá
          </Button>
          <Space className={'pr-4'}>
            <Button
              type={'default'}
              className={'hover:!bg-blue-50 border-blue-400 text-blue-400 font-medium'}
              onClick={onCancel}
            >
              Thoát
            </Button>
            <Button type={'primary'} className={'font-medium'} onClick={quotationForm.submit}>
              Lưu
            </Button>
          </Space>
        </div>
        <div className="px-8 py-6">
          <Form
            labelCol={{ span: 3 }}
            labelAlign="left"
            form={quotationForm}
            className="intro-x px-5 pt-2"
            layout={'vertical'}
            initialValues={{ quotationItem: [{}], paymentMethodCode: 'cash' }}
            onFinish={onFinish}
          >
            <div className="w-full mx-auto p-2">
              <h1 className="text-2xl text-center font-bold uppercase">BẢNG BÁO GIÁ/QUOTATION</h1>
              <Flex align="center" justify="end" className="mt-5">
                <Button
                  type="primary"
                  danger={quotationFacade.isCustomerSelected}
                  onClick={() => {
                    if (quotationFacade.isCustomerSelected) {
                      quotationFacade.set({ isCustomerSelected: false });
                      quotationForm.setFieldsValue({
                        customerName: undefined,
                        customerAddress: undefined,
                        customerPhoneNumber: undefined,
                        customerTaxCode: undefined,
                        customerId: undefined,
                        customerCode: undefined,
                      });
                    } else quotationFacade.set({ isCustomer: true });
                  }}
                >
                  {quotationFacade.isCustomerSelected ? 'Hủy chọn' : 'Chọn'} khách hàng
                </Button>
              </Flex>
              <Row className="mt-4">
                <Col span={24} className={'px-2'}>
                  <Form.Item hidden layout="horizontal" name="customerId">
                    <Input disabled={quotationFacade.isCustomerSelected} />
                  </Form.Item>
                </Col>
                <Col span={24} className={'px-2'}>
                  <Form.Item hidden layout="horizontal" name="customerCode">
                    <Input disabled={quotationFacade.isCustomerSelected} />
                  </Form.Item>
                </Col>
                <Col span={24} className={'px-2'}>
                  <Form.Item layout="horizontal" name="customerName" label="Kính gửi" rules={[{ required: true }]}>
                    <Input disabled={quotationFacade.isCustomerSelected} placeholder={'Nhập kính gửi'} />
                  </Form.Item>
                </Col>
                <Col span={24} className={'px-2'}>
                  <Form.Item layout="horizontal" name="customerAddress" label="Địa chỉ" rules={[{ required: true }]}>
                    <Input disabled={quotationFacade.isCustomerSelected} placeholder={'Nhập địa chỉ'} />
                  </Form.Item>
                </Col>
                <Col span={12} className={'px-2'}>
                  <Form.Item
                    layout="horizontal"
                    name="customerPhoneNumber"
                    label="Số điện thoại"
                    labelCol={{ span: 6 }}
                    rules={[{ required: true, min: 10, max: 11 }]}
                  >
                    <Input
                      disabled={quotationFacade.isCustomerSelected}
                      maxLength={11}
                      type="number"
                      placeholder={'Nhập số điện thoại'}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} className={'px-2'}>
                  <Form.Item
                    layout="horizontal"
                    name="customerTaxCode"
                    label="Mã Số Thuế"
                    labelCol={{ span: 6 }}
                    rules={[{ required: true }]}
                  >
                    <Input disabled={quotationFacade.isCustomerSelected} placeholder={'Nhập mã số thuế'} />
                  </Form.Item>
                </Col>
                {/* <Col span={12} className={'px-2'}>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    layout="horizontal"
                    name="orderCode"
                    label="Mã đơn hàng"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder={'Nhập mã đơn hàng'} />
                  </Form.Item>
                </Col> */}
                <Col span={12} className={'px-2'}>
                  <Form.Item labelCol={{ span: 6 }} layout="horizontal" name="projectId" label="Dự án">
                    <Select
                      options={projectFacade.pagination?.content.map((item) => {
                        return { label: item.tenDuAn, value: item.id };
                      })}
                      placeholder={'Chọn dự án'}
                      showSearch
                      optionFilterProp={'label'}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} className={'px-2'}>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    layout="horizontal"
                    name="dueDate"
                    label="Ngày hiệu lực"
                    rules={[{ required: true }]}
                  >
                    <DatePicker className="w-full" placeholder={'Chọn ngày hiệu lực'} format={'DD/MM/YYYY'} />
                  </Form.Item>
                </Col>
                <Col span={12} className={'px-2'}>
                  <Form.Item
                    labelCol={{ span: 6 }}
                    layout="horizontal"
                    name="paymentMethodCode"
                    label="Hình thức thanh toán"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Chọn hình thức thanh toán"
                      options={codeTypeFacade?.paymentMethods?.content?.map((item: CodeTypeModel) => {
                        return { label: item.title, value: item.code };
                      })}
                    />
                  </Form.Item>
                </Col>
                <Col span={24} className={'px-2'}>
                  <Form.Item
                    initialValue={'QuotationMaterial'}
                    layout="horizontal"
                    name="typeCode"
                    label="Loại báo giá"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group
                      onChange={(e: RadioChangeEvent) => {
                        quotationFacade.set({ typeCode: e.target.value });
                      }}
                    >
                      <Radio value={'QuotationMaterial'} onClick={() => productFacade.set({ type: 'VAT_TU' })}>
                        Báo giá vật tư
                      </Radio>
                      <Radio value={'QuotationProduct'} onClick={() => productFacade.set({ type: 'SAN_PHAM' })}>
                        Báo giá sản phẩm
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={24} className={'px-2'}>
                  <span className="italic">
                    Lời đầu tiên, xin trân trọng cảm ơn quý khách hàng đã quan tâm đến sản phẩm của công ty chúng tôi.
                    Chúng tôi xin gửi đến quý khách hàng bảng báo giá như sau:
                  </span>
                </Col>
                <Col span={24} className={'px-2'}>
                  <Form.List name="quotationItem">
                    {(quotationItem, { add, remove }) => {
                      return (
                        <>
                          <QuotationItemTable
                            // @ts-ignore
                            data={quotationItem}
                            add={add}
                            remove={remove}
                            form={quotationForm}
                            vat={vat?.value ?? 0}
                          />
                        </>
                      );
                    }}
                  </Form.List>
                </Col>
                <Col span={24} className={'px-2'}>
                  <div>
                    <div className="font-bold italic">Ghi chú:</div>
                    <div
                      dangerouslySetInnerHTML={{ __html: id ? quotationFacade.data?.note : ghiChu?.value || '' }}
                    ></div>
                  </div>
                </Col>
                <Col span={12} className={'px-2'} />
                <Col span={12} className={'px-2 mb-44'}>
                  <div className="text-center mr-32 mt-7">
                    <p className="italic">Bắc Ninh, {currentDate}</p>
                    <p className="uppercase font-bold">Công ty Mạnh Khanh</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Form>
        </div>
      </Spin>
      <CustomerModal quotationForm={quotationForm} />
    </>
  );
};

export default CreateUpdateForm;
