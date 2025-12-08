import { EStatusState } from '@models';
import {
  AddressFacade,
  CodeTypeFacade,
  CodeTypeModel,
  NhomVatTuFacade,
  ProductFacade,
  ProductModel,
  QuotationFacade,
  QuotationItemModel,
} from '@store';
import { Button, Col, Flex, Form, FormInstance, Input, InputNumber, Modal, Row, Select, Switch } from 'antd';
import { CloseOutlined, InfoCircleTwoTone, PlusCircleTwoTone } from '@ant-design/icons';
import { useEffect } from 'react';

interface ProductFormProps {
  quotationForm: FormInstance;
  add: (value: QuotationItemModel) => void;
}
const ProductForm = (props: ProductFormProps) => {
  const { quotationForm, add } = props;
  const addressFacade = AddressFacade();
  const quotationFacade = QuotationFacade();
  const productFacade = ProductFacade();
  const productGroupFacade = NhomVatTuFacade();
  const codeTypeFacade = CodeTypeFacade();

  const [productForm] = Form.useForm();

  const isVATApplied = Form.useWatch('isVATApplied', productForm);

  useEffect(() => {
    addressFacade.getTinh();
    productGroupFacade.get({ size: -1 });
    codeTypeFacade.getInventories({ size: -1 });
    codeTypeFacade.getVATList({ size: -1 });
  }, []);

  useEffect(() => {
    switch (productFacade.status) {
      case EStatusState.postFulfilled:
        productFacade.get({
          size: -1,
          filter: JSON.stringify({
            type: quotationForm.getFieldValue('typeCode') === 'QuotationProduct' ? 'SAN_PHAM' : 'VAT_TU',
          }),
        });
        productForm.resetFields();
        quotationFacade.set({ isProductModal: false });
        break;
    }
  }, [productFacade.status]);

  const typeCodeQuotation = quotationForm.getFieldValue('typeCode');

  const handleProductSubmit = async (value: ProductModel) => {
    const valueProduct = {
      ...value,
      isOrder: true,
      listWareCodes: [],
    };
    const res: any = await productFacade.post(valueProduct);

    if (res) {
      add({
        productId: res?.payload?.data?.id,
        code: res?.payload?.data?.code,
        name: res?.payload?.data?.name,
        specifications: undefined,
        unit: res?.payload?.data?.unit,
        quantity: 1,
        unitPrice: res?.payload?.data?.sellingUnitPrice,
        unitPriceDiscountAmount: 0,
        afterLineDiscountGoodsAmount: 1 * res?.payload?.data?.sellingUnitPrice - 1 * 0,
        lineNote: undefined,
      });
    }

    quotationFacade.set({ isRender: true });
  };
  const handleCustomerClose = () => {
    quotationFacade.set({ isProductModal: false });
    productForm.resetFields();
  };

  return (
    <Modal
      title={'Thêm nhanh sản phẩm/vật tư'}
      width={700}
      open={quotationFacade.isProductModal}
      okText={'Thêm'}
      cancelText={'Thoát'}
      onOk={productForm.submit}
      onCancel={handleCustomerClose}
    >
      <Form form={productForm} layout="vertical" onFinish={handleProductSubmit}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={'Tên sản phẩm/vật tư'} name={'name'} rules={[{ required: true }]}>
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Mã sản phẩm/vật tư'} name={'code'} rules={[{ required: true }]}>
              <Input placeholder="Nhập mã sản phẩm/vật tư" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Đơn vị tính'} name={'unit'} rules={[{ required: true }]}>
              <Input placeholder="Nhập đơn vị tính" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Loại'} name={'type'} rules={[{ required: true }]}>
              <Select
                placeholder="Chọn loại"
                optionFilterProp="label"
                showSearch
                options={[
                  { label: 'Sản phẩm', value: 'SAN_PHAM', disabled: typeCodeQuotation === 'QuotationMaterial' },
                  { label: 'Vật tư', value: 'VAT_TU', disabled: typeCodeQuotation === 'QuotationProduct' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Giá bán lẻ'} name={'sellingUnitPrice'} rules={[{ required: true }]}>
              <InputNumber
                className="w-full text-right"
                controls={false}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => `${value}`.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Nhóm vật tư'} name={'productGroupId'} rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                allowClear
                options={productGroupFacade.pagination?.content?.map((item) => ({
                  label: item.tenNhom,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Áp dụng thuế" name={'isVATApplied'} valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          {isVATApplied && (
            <>
              <Col span={12}>
                <Form.Item label={'Thuế đầu vào'} name={'importVATPercent'}>
                  <Select
                    placeholder="Chọn thuế đầu vào"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={codeTypeFacade.vatList?.content?.map((item: CodeTypeModel) => ({
                      label: item.title,
                      value: item.code,
                    }))}
                    // convert value to number
                    onChange={(value) => {
                      productForm.setFieldsValue({ importVATPercent: Number(value?.match(/\d+/)?.[0]) });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'Thuế đầu ra'} name={'exportVATPercent'}>
                  <Select
                    placeholder="Chọn thuế đầu ra"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={codeTypeFacade.vatList?.content?.map((item: CodeTypeModel) => ({
                      label: item.title,
                      value: item.code,
                    }))}
                    // convert value to number
                    onChange={(value) => {
                      productForm.setFieldsValue({ exportVATPercent: Number(value?.match(/\d+/)?.[0]) });
                    }}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default ProductForm;
