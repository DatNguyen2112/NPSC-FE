import { PlusCircleTwoTone } from '@ant-design/icons';
import { EStatusState } from '@models';
import { AddressFacade, CustomerFacade, CustomerModel, QuotationFacade } from '@store';
import { Button, Col, DatePicker, Form, FormInstance, Input, Modal, Row, Select, Switch } from 'antd';
import { useEffect } from 'react';

interface CustomerFormProps {
  quotationForm: FormInstance;
}
const CustomerForm = (props: CustomerFormProps) => {
  const { quotationForm } = props;
  const addressFacade = AddressFacade();
  const quotationFacade = QuotationFacade();
  const customerFacade = CustomerFacade();

  const [customerForm] = Form.useForm();

  useEffect(() => {
    addressFacade.getTinh();
  }, []);

  useEffect(() => {
    switch (customerFacade.status) {
      case EStatusState.postFulfilled:
        customerForm.resetFields();
        quotationFacade.set({
          isCustomerModal: false,
          isHiddenProductInputSearch: true,
        });
        break;
    }
  }, [customerFacade.status]);

  const handleCustomerSubmit = (value: CustomerModel) => {
    customerFacade.post(value);
  };
  const handleCustomerClose = () => {
    quotationFacade.set({ isCustomerModal: false });
    customerForm.resetFields();
  };

  return (
    <Modal
      title={'Thêm mới khách hàng'}
      width={700}
      open={quotationFacade.isCustomerModal}
      okText={'Thêm'}
      cancelText={'Thoát'}
      onOk={customerForm.submit}
      onCancel={handleCustomerClose}
    >
      <Form
        form={customerForm}
        initialValues={{ sex: 'other', isActive: true }}
        layout="vertical"
        onFinish={handleCustomerSubmit}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={'Tên khách hàng'} name={'name'} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Số điện thoại'} name={'phoneNumber'} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Mã khách hàng'} name={'code'} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Fax'} name={'fax'}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={'Địa chỉ cụ thể'} name={'address'}>
              <Input placeholder="Nhập số nhà, tên đường , tên khu vực" />
            </Form.Item>
          </Col>
          <Col span={8} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Tỉnh/Thành phố'} name={'provinceCode'}>
              <Select
                showSearch
                optionFilterProp={'label'}
                placeholder={'Chọn tỉnh/thành phố'}
                onChange={(value) => {
                  customerForm.setFieldsValue({ districtCode: undefined, wardCode: undefined });
                  addressFacade.getHuyen({ filter: JSON.stringify({ parentId: value }) });
                }}
                options={addressFacade.listTinh?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Quận/Huyện'} name={'districtCode'}>
              <Select
                showSearch
                optionFilterProp={'label'}
                placeholder={'Chọn quận/huyện'}
                onChange={(value) => {
                  customerForm.setFieldsValue({ wardCode: undefined });
                  addressFacade.getXa({ filter: JSON.stringify({ parentId: value }) });
                }}
                options={addressFacade.listHuyen?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={8} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Phường/Xã'} name={'wardCode'}>
              <Select
                showSearch
                optionFilterProp={'label'}
                placeholder={'Chọn phường/xã'}
                options={addressFacade.listXa?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
              />
            </Form.Item>
          </Col>
          <Col className="px-0" span={24} hidden={!quotationFacade.isHiddenCustomerForm}>
            <Button
              icon={<PlusCircleTwoTone />}
              type={'link'}
              onClick={() => quotationFacade.set({ isHiddenCustomerForm: false })}
            >
              Thông tin thêm
            </Button>
          </Col>
          <Col span={12} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Ngày sinh'} name={'birthdate'}>
              <DatePicker placeholder={'--/--/----'} className={'w-full'} format={'DD/MM/YYYY'} />
            </Form.Item>
          </Col>
          <Col span={12} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Giới tính'} name={'sex'}>
              <Select
                options={[
                  {
                    label: 'Nam',
                    value: 'male',
                  },
                  {
                    label: 'Nữ',
                    value: 'female',
                  },
                  {
                    label: 'Khác',
                    value: 'other',
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Email'} name={'email'}>
              <Input placeholder={'abc@gmail.com'} />
            </Form.Item>
          </Col>
          <Col span={12} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Mã số thuế'} name={'taxCode'}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12} hidden={quotationFacade.isHiddenCustomerForm}>
            <Form.Item label={'Website'} name={'website'}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12} hidden>
            <Form.Item label={'Trạng thái khách hàng'} name={'isActive'}>
              <Switch checked />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CustomerForm;
