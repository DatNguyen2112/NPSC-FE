import { CloseOutlined, LeftOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { EStatusState } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  CodeTypeFacade,
  CodeTypeModel,
  ProjectFacade,
  CustomerFacade,
  ProductFacade,
  ProductModel,
  QuotationFacade,
  QuotationItemModel,
  QuotationModel,
} from '@store';
import { EmptyIcon } from '@svgs';
import { lang, routerLinks, uuidv4 } from '@utils';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  TableColumnsType,
  Tooltip,
  Typography,
} from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { customMessage } from 'src';
import CustomerForm from './customer.modal';
import ProductForm from './product.modal';

interface DataType extends QuotationItemModel {
  key?: React.Key;
}

const QuotationForm: React.FC = () => {
  const customerFacade = CustomerFacade();
  const quotationFacade = QuotationFacade();
  const projectFacade = ProjectFacade();
  const codeTypeFacade = CodeTypeFacade();
  const productFacade = ProductFacade();

  const navigate = useNavigate();
  const location = useLocation();
  const [quotationForm] = Form.useForm();
  const [productManyForm] = Form.useForm();
  const { id } = useParams();
  const formRef = useRef<FormInstance | undefined>(undefined);

  const quotationItem: QuotationItemModel[] = quotationForm.getFieldValue('quotationItem') || [];

  useEffect(() => {
    customerFacade.get({ size: -1 });
    projectFacade.get({ size: -1 });
    codeTypeFacade.getPaymentMethods({ size: -1 });
    productFacade.get({ size: -1, filter: JSON.stringify({ isOrder: true }) });

    quotationFacade.set({ detailItemCustomer: [] });
  }, []);

  useEffect(() => {
    if (id) {
      quotationFacade.getById({ id: id, keyState: '' });
    }
  }, [id]);

  useEffect(() => {
    switch (customerFacade.status) {
      case EStatusState.postFulfilled:
        quotationFacade.set({
          detailItemCustomer: [customerFacade?.data],
        });
        quotationForm.setFieldsValue({
          customerId: customerFacade.data?.id,
        });
        break;
    }
  }, [customerFacade.status]);

  useEffect(() => {
    // Tính tiền
    calculateTotalAmount(quotationItem);

    // Tính tổng số lượng sản phẩm
    const totalQuantity = quotationItem.reduce(
      (total: number, item: QuotationItemModel) => total + (item.quantity || 0),
      0,
    );
    quotationFacade.set({ quotationQuantity: totalQuantity });
  }, [quotationItem]);

  useEffect(() => {
    switch (quotationFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        navigate(`/${lang}${routerLinks('Quotation')}`);
        quotationFacade.set({
          detailItemCustomer: [],
          isHiddenProductInputSearch: false,
        });
        break;
      case EStatusState.getByIdFulfilled:
        quotationFacade.set({
          detailItemCustomer: [
            {
              id: quotationFacade.data.customerId,
              name: quotationFacade.data.customerName,
              phoneNumber: quotationFacade.data.customerPhoneNumber,
              address: quotationFacade.data.customerAddress,
              taxCode: quotationFacade.data.customerTaxCode,
            },
          ],
          isHiddenProductInputSearch: true,
        });
        for (const key in quotationFacade.data) {
          if (key === 'dueDate') {
            quotationForm.setFieldValue(key, quotationFacade.data.dueDate ? dayjs(quotationFacade.data[key]) : '');
          } else quotationForm.setFieldValue(key, quotationFacade.data[key as keyof QuotationModel]);
        }
        break;
    }
  }, [quotationFacade.status]);

  useEffect(() => {
    switch (productFacade.status) {
      case EStatusState.postFulfilled:
        productFacade.get({ size: -1, filter: JSON.stringify({ isOrder: true }) });
    }
  }, [productFacade.status]);

  const regex = /create$/;

  // HANDLE CANCEL
  const onCancel = () => {
    quotationFacade.set({
      detailItemCustomer: [],
    });
    navigate(`/${lang}${routerLinks('Quotation')}`);
  };

  const onFinish = (values: QuotationModel) => {
    if (!values.customerId) {
      customMessage.error({ type: 'error', content: 'Vui lòng chọn khách hàng' }).then();
      return;
    }

    values.discountType = 'value';

    if (regex.test(location.pathname) && !id) {
      quotationFacade.post(values);
    } else {
      quotationFacade.put({ ...values, id: id ?? '' });
    }
  };

  const handleRemoveCustomer = () => {
    quotationFacade.set({
      detailItemCustomer: [],
      isHiddenProductInputSearch: false,
    });
  };

  const handleProductManyClose = () => {
    quotationFacade.set({ isProductManyModal: false });
  };

  const handleProductManySubmit = (values: any) => {
    const currentItems = quotationForm.getFieldValue('quotationItem') || [];
    const updatedItems = [...currentItems];

    values.quotationItem.forEach((item: QuotationItemModel) => {
      if ((item.quantity ?? 0) > 0) {
        const existingProductIndex = updatedItems.findIndex((product: ProductModel) => product.name === item.name);

        if (existingProductIndex !== -1) {
          updatedItems[existingProductIndex].quantity += item.quantity;
          updatedItems[existingProductIndex].afterLineDiscountGoodsAmount =
            updatedItems[existingProductIndex].quantity * updatedItems[existingProductIndex].unitPrice -
            updatedItems[existingProductIndex].quantity * updatedItems[existingProductIndex].unitPriceDiscountAmount;
        } else {
          updatedItems.push(item);
        }
      }
    });

    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
    });

    handleProductManyClose();
  };

  // Hàm tính tổng tất cả tiền và set giá trị vào các field
  const calculateTotalAmount = (quotationItem: QuotationItemModel[]) => {
    // Lấy ra các value của các fields
    const quantityQuotationItem = quotationItem.reduce(
      (total: number, item: QuotationItemModel) => total + (item.quantity || 0),
      0,
    );
    const subTotalAmountQuotationItem = quotationItem.reduce(
      (total: number, item: QuotationItemModel) => total + (item.afterLineDiscountGoodsAmount || 0),
      0,
    );
    const discountAmount = quotationForm.getFieldValue('discountAmount') || 0;
    const totalVatAmountQuotationItem = quotationItem.reduce(
      (total: number, item: QuotationItemModel) => total + (item.lineVATAmount || 0),
      0,
    );
    const shippingCostAmount = quotationForm.getFieldValue('shippingCostAmount') || 0;
    const otherCostAmount = quotationForm.getFieldValue('otherCostAmount') || 0;

    // Tính tổng tiền
    const totalAmount =
      subTotalAmountQuotationItem + totalVatAmountQuotationItem - discountAmount + shippingCostAmount + otherCostAmount;

    // Set giá trị vào các fields
    quotationForm.setFieldsValue({
      subTotalAmount: subTotalAmountQuotationItem,
      totalAmount: totalAmount.toFixed(0),
    });
  };

  // Hàm xử lý khi thay đổi số lượng sản phẩm
  const handleQuantityItemChange = (quantity: number, index: number) => {
    const currentItems = quotationForm.getFieldValue('quotationItem') || [];
    const discountAmount = quotationForm.getFieldValue('discountAmount') || 0;
    const updatedItems = [...currentItems];

    updatedItems[index].quantity = quantity;
    updatedItems[index].afterLineDiscountGoodsAmount =
      Number(updatedItems[index].unitPrice) * updatedItems[index].quantity -
      Number(updatedItems[index].quantity) * updatedItems[index].unitPriceDiscountAmount;

    const afterLineDiscountGoodsAmount = updatedItems[index].afterLineDiscountGoodsAmount || 0;
    const subTotalAmount = currentItems.reduce(
      (total: number, item: QuotationItemModel) => total + (item.afterLineDiscountGoodsAmount || 0),
      0,
    );
    const lineVATPercent = updatedItems[index].lineVATPercent || 0;
    const discountRatio = discountAmount / (subTotalAmount || 1); // Tỉ lệ chiết khấu dựa trên tổng

    // Tính lineVATAmount theo công thức
    updatedItems.forEach((item: QuotationItemModel) => {
      const lineAmountAfterDiscount =
        (item.afterLineDiscountGoodsAmount || 0) -
        ((item.afterLineDiscountGoodsAmount || 0) * (discountAmount || 0)) / (subTotalAmount || 1);

      item.lineVATAmount = (lineAmountAfterDiscount * (item.lineVATPercent || 0)) / 100;
    });
    // updatedItems[index].lineVATAmount =
    //   (lineVATPercent * (afterLineDiscountGoodsAmount - discountRatio * afterLineDiscountGoodsAmount)) / 100;

    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
      subTotalAmount,
    });

    // Tính tổng tiền
    calculateTotalAmount(updatedItems);
  };

  // Hàm xử lý khi thay đổi đơn giá sản phẩm
  const handleUnitPriceItemChange = (unitPrice: number, index: number) => {
    const currentItems = quotationForm.getFieldValue('quotationItem') || [];
    const discountAmount = quotationForm.getFieldValue('discountAmount') || 0;
    // const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 1;
    const updatedItems = [...currentItems];

    updatedItems[index].unitPrice = unitPrice;
    updatedItems[index].afterLineDiscountGoodsAmount =
      Number(unitPrice) * updatedItems[index].quantity -
      Number(updatedItems[index].quantity) * updatedItems[index].unitPriceDiscountAmount;

    const afterLineDiscountGoodsAmount = updatedItems[index].afterLineDiscountGoodsAmount || 0;
    const subTotalAmount = currentItems.reduce(
      (total: number, item: QuotationItemModel) => total + (item.afterLineDiscountGoodsAmount || 0),
      0,
    );
    const lineVATPercent = updatedItems[index].lineVATPercent || 0;
    const discountRatio = discountAmount / (subTotalAmount || 1); // Tỉ lệ chiết khấu dựa trên tổng

    // Tính lineVATAmount theo công thức
    updatedItems.forEach((item: QuotationItemModel) => {
      const lineAmountAfterDiscount =
        (item.afterLineDiscountGoodsAmount || 0) -
        ((item.afterLineDiscountGoodsAmount || 0) * (discountAmount || 0)) / (subTotalAmount || 1);

      item.lineVATAmount = (lineAmountAfterDiscount * (item.lineVATPercent || 0)) / 100;
    });
    // updatedItems[index].lineVATAmount =
    //   (lineVATPercent * (afterLineDiscountGoodsAmount - discountRatio * afterLineDiscountGoodsAmount)) / 100;

    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
      subTotalAmount,
    });

    // Tính tổng tiền
    calculateTotalAmount(updatedItems);
  };

  // Hàm xử lý khi thay đổi giá trị chiết khấu
  const handleDiscountAmountItemChange = (unitPriceDiscountAmount: number, index: number) => {
    // debugger;
    const currentItems = quotationForm.getFieldValue('quotationItem') || [];
    const discountAmount = quotationForm.getFieldValue('discountAmount') || 0;
    // const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 1;
    const updatedItems = [...currentItems];

    updatedItems[index].unitPriceDiscountAmount = unitPriceDiscountAmount;
    updatedItems[index].afterLineDiscountGoodsAmount =
      updatedItems[index].unitPrice * updatedItems[index].quantity -
      unitPriceDiscountAmount * updatedItems[index].quantity;
    const afterLineDiscountGoodsAmount = updatedItems[index].afterLineDiscountGoodsAmount || 0;
    const subTotalAmount = currentItems.reduce(
      (total: number, item: QuotationItemModel) => total + (item.afterLineDiscountGoodsAmount || 0),
      0,
    );
    const lineVATPercent = updatedItems[index].lineVATPercent || 0;
    const discountRatio = discountAmount / (subTotalAmount || 1); // Tỉ lệ chiết khấu dựa trên tổng

    // Tính lineVATAmount theo công thức
    updatedItems.forEach((item: QuotationItemModel) => {
      const lineAmountAfterDiscount =
        (item.afterLineDiscountGoodsAmount || 0) -
        ((item.afterLineDiscountGoodsAmount || 0) * (discountAmount || 0)) / (subTotalAmount || 1);

      item.lineVATAmount = (lineAmountAfterDiscount * (item.lineVATPercent || 0)) / 100;
    });
    // updatedItems[index].lineVATAmount =
    //   (lineVATPercent * (afterLineDiscountGoodsAmount - discountRatio * afterLineDiscountGoodsAmount)) / 100;

    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
      subTotalAmount,
    });
    // Tính tổng tiền
    calculateTotalAmount(updatedItems);
  };

  // Hàm xử lý khi xóa sản phẩm khỏi danh sách
  const handleRemoveItem = (remove: (index: number | number[]) => void, index: number) => {
    remove(index);

    // Tính lineVATAmount cho từng sản phẩm = lineVATPercent * (afterLineDiscountGoodsAmount - discountAmount/subTotalAmount * afterLineDiscountGoodsAmount) / 100
    const quotationItem = quotationForm.getFieldValue('quotationItem') || [];
    // const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 0;
    // Tính lại subTotalAmount từ danh sách sản phẩm
    const subTotalAmount = quotationItem.reduce(
      (total: number, item: QuotationItemModel) => total + (item.afterLineDiscountGoodsAmount || 0),
      0,
    );
    const discountAmount = quotationForm.getFieldValue('discountAmount') || 0;
    const updatedItems = [...quotationItem];

    updatedItems.forEach((item: QuotationItemModel) => {
      const lineAmountAfterDiscount =
        (item.afterLineDiscountGoodsAmount || 0) -
        ((item.afterLineDiscountGoodsAmount || 0) * (discountAmount || 0)) / (subTotalAmount || 1);

      item.lineVATAmount = (lineAmountAfterDiscount * (item.lineVATPercent || 0)) / 100;
    });

    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
      subTotalAmount,
    });

    // Tính tổng tiền
    calculateTotalAmount(quotationItem);
  };

  // Hàm xử lý khi thay đổi chiết khấu đơn
  const handleDiscountAmountChange = (discountAmount: number) => {
    // Tính lineVATAmount cho từng sản phẩm = lineVATPercent * (afterLineDiscountGoodsAmount - discountAmount/subTotalAmount * afterLineDiscountGoodsAmount) / 100
    const quotationItem = quotationForm.getFieldValue('quotationItem') || [];
    const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 0;
    const updatedItems = [...quotationItem];

    updatedItems.forEach((item: QuotationItemModel) => {
      const lineAmountAfterDiscount =
        (item.afterLineDiscountGoodsAmount || 0) -
        ((item.afterLineDiscountGoodsAmount || 0) * (discountAmount || 0)) / (subTotalAmount || 1);

      item.lineVATAmount = (lineAmountAfterDiscount * (item.lineVATPercent || 0)) / 100;
    });

    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
      discountAmount,
    });

    // Tính tổng tiền
    calculateTotalAmount(quotationItem);
  };

  // Hàm xử lý khi thay đổi phí vận chuyển
  const handleShippingCostAmountChange = (shippingCostAmount: number) => {
    quotationForm.setFieldsValue({
      shippingCostAmount,
    });

    // Tính tổng tiền
    calculateTotalAmount(quotationItem);
  };

  // Hàm xử lý khi thay đổi phí khác
  const handleOtherCostAmountChange = (otherCostAmount: number) => {
    quotationForm.setFieldsValue({
      otherCostAmount,
    });

    // Tính tổng tiền
    calculateTotalAmount(quotationItem);
  };

  // Hàm xử lý khi chọn từ danh sách sản phẩm ô input search và tính toán giá trị calculateTotalAmount
  const handleSelectProduct = (item: ProductModel) => {
    // Lấy danh sách các sản phẩm hiện có trong Form
    const currentItems = quotationForm.getFieldValue('quotationItem') || [];

    // Tìm xem sản phẩm này đã có trong danh sách hay chưa
    const existingProductIndex = currentItems.findIndex(
      (quotationItem: QuotationItemModel) => quotationItem.name === item?.name,
    );

    const updatedItems = [...currentItems];

    if (existingProductIndex !== -1) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng và cập nhật lại các giá trị
      updatedItems[existingProductIndex] = {
        ...updatedItems[existingProductIndex],
        quantity: updatedItems[existingProductIndex].quantity + 1,
        afterLineDiscountGoodsAmount:
          (updatedItems[existingProductIndex].quantity + 1) * updatedItems[existingProductIndex].unitPrice -
          (updatedItems[existingProductIndex].quantity + 1) *
            updatedItems[existingProductIndex].unitPriceDiscountAmount,
        lineVATPercent: item.exportVATPercent,
        lineVATAmount: null,
        // ((updatedItems[existingProductIndex].afterLineDiscountGoodsAmount -
        //   (updatedItems[existingProductIndex].afterLineDiscountGoodsAmount * discountAmount) / subTotalAmount) *
        //   item.exportVATPercent) /
        // 100,
        // ((updatedItems[existingProductIndex].quantity + 1) *
        //   updatedItems[existingProductIndex].unitPrice *
        //   item.exportVATPercent) /
        // 100,
      };
    } else {
      // Nếu sản phẩm chưa có, thêm mới sản phẩm với các giá trị khởi tạo
      updatedItems.push({
        // ...item,
        productId: item.id,
        name: item.name,
        unit: item.unit,
        quantity: 1,
        unitPrice: item.sellingUnitPrice,
        unitPriceDiscountType: 'value',
        unitPriceDiscountAmount: 0,
        afterLineDiscountGoodsAmount: item.sellingUnitPrice,
        lineVATPercent: item.exportVATPercent,
        lineVATAmount: null,
      });
    }

    // Cập nhật lại danh sách sản phẩm
    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
    });

    // Tính toán tổng số lượng sản phẩm
    const totalQuantity = updatedItems.reduce(
      (total: number, item: QuotationItemModel) => total + (item.quantity || 0),
      0,
    );
    quotationFacade.set({ quotationQuantity: totalQuantity });

    // Tính tổng tiền và các giá trị khác
    calculateTotalAmount(updatedItems);

    const discountAmount = quotationForm.getFieldValue('discountAmount') || 0;
    const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 0;

    updatedItems.forEach((item: QuotationItemModel) => {
      item.lineVATAmount =
        (((item.afterLineDiscountGoodsAmount || 0) -
          ((item.afterLineDiscountGoodsAmount || 0) * discountAmount) / subTotalAmount) *
          (item.lineVATPercent || 0)) /
        100;
    });

    quotationForm.setFieldsValue({
      quotationItem: updatedItems,
    });

    // Tính tổng tiền
    calculateTotalAmount(updatedItems);
  };

  const productsData: any = productFacade.pagination?.content.map((item) => {
    return {
      key: uuidv4(),
      productId: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
      quantity: 1,
      unitPrice: item.sellingUnitPrice,
      unitPriceDiscountType: 'value',
      unitPriceDiscountAmount: 0,
      afterLineDiscountGoodsAmount: item.sellingUnitPrice,
      lineVATPercent: item.exportVATPercent,
      lineVATAmount: null,
      attachmentUrl: item.attachmentUrl,
      initialStockQuantity: item.initialStockQuantity,
      sellableQuantity: item.sellableQuantity,
    };
  });

  const productColumns: TableColumnsType<DataType> = [
    {
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProductModel) => (
        <div className="flex items-center gap-2">
          <Tooltip
            color="white"
            placement="top"
            title={
              <Image
                width={140}
                height={140}
                src={record?.attachmentUrl?.fileUrl}
                alt={record?.attachmentUrl?.description}
                fallback="/public/assets/images/no-image.png"
              />
            }
          >
            <Image
              width={52}
              height={52}
              src={record.attachmentUrl?.fileUrl}
              fallback={'/public/assets/images/no-image.png'}
              preview={false}
            />
          </Tooltip>
          <div>
            <p className="line-clamp-2 w-60">{text}</p>
            <p className="text-gray-400">{record.code}</p>
          </div>
        </div>
      ),
    },
    {
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (text: number, record: ProductModel) => (
        <div>
          <Typography.Title className="!mb-0" level={5}>
            {text.toLocaleString()}
          </Typography.Title>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="flex gap-1">
              <p className="text-gray-400">Tồn:</p>
              <p className="text-blue-500">{record?.initialStockQuantity?.toLocaleString()}</p>
            </div>
            <p className="text-gray-400">|</p>
            <div className="flex gap-1">
              <p className="text-gray-400">Có thể bán:</p>
              <p className="text-blue-500">{record?.sellableQuantity?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // rowSelection object indicates the need for row selection
  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys: quotationFacade.selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      quotationFacade.set({
        selectedRowKeys,
        selectedRows,
      });
    },
  };

  return (
    <>
      <Spin spinning={quotationFacade.isFormLoading}>
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            Quay lại danh sách báo giá
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
              {id ? 'Lưu' : 'Tạo báo giá'}
            </Button>
          </Space>
        </div>
        <Form
          form={quotationForm}
          initialValues={{
            status: 'DRAFT',
            paymentMethodCode: 'cash',
            // unitPriceDiscountType mặc định là value các dòng sản phẩm
          }}
          onFinish={onFinish}
        >
          <div className="max-w-8xl mx-auto py-6 px-8">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={24} md={24} lg={13} xl={15} xxl={16}>
                <Card
                  className="h-full"
                  title={
                    <div>
                      <h2>Thông tin khách hàng</h2>
                      {quotationFacade.detailItemCustomer?.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            className="!text-blue-600 !font-semibold max-w-64 truncate"
                            href={`/#/${lang}${routerLinks('KhachHang')}/${quotationFacade.detailItemCustomer[0]?.id}/view-detail`}
                            target={'_blank'}
                          >
                            {quotationFacade.detailItemCustomer[0]?.name}
                          </a>{' '}
                          - <p className="max-w-36 truncate">{quotationFacade.detailItemCustomer[0]?.phoneNumber}</p>{' '}
                          <CloseOutlined className="ml-2" onClick={handleRemoveCustomer} />
                        </div>
                      ) : null}
                    </div>
                  }
                >
                  <div className="h-full">
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: '1',
                            label: (
                              <div
                                className="flex gap-2"
                                onClick={() =>
                                  quotationFacade.set({ isCustomerModal: true, isHiddenCustomerForm: true })
                                }
                              >
                                <PlusCircleOutlined className="text-green-600" />
                                Thêm mới khách hàng
                              </div>
                            ),
                          },
                          {
                            key: '2',
                            label: 'Danh sách khách hàng',
                            type: 'group',
                            children: customerFacade.pagination?.content.map((item, index) => {
                              return {
                                key: `2-${index + 1}`,
                                label: (
                                  <a
                                    rel="noreferrer"
                                    onClick={() => {
                                      quotationFacade.set({
                                        detailItemCustomer: [{ ...item }],
                                      });

                                      quotationForm.setFieldsValue({
                                        customerId: item?.id,
                                        customerCode: item?.code,
                                        customerName: item?.name,
                                        customerPhoneNumber: item?.phoneNumber,
                                        customerAddress: `${item?.address}, ${item?.wardName}, ${item?.districtName}, ${item?.provinceName}`,
                                        customerTaxCode: item?.taxCode,
                                      });

                                      // xóa value của search
                                      formRef.current?.setFieldsValue({
                                        search: '',
                                      });

                                      // xóa filter
                                      customerFacade.get({ size: -1 });

                                      //set hidden InputSearch
                                      quotationFacade.set({ isHiddenProductInputSearch: true });
                                    }}
                                  >
                                    {item?.name}
                                  </a>
                                ),
                              };
                            }),
                          },
                        ],
                      }}
                      overlayClassName="custom-dropdown-customer"
                      trigger={['click']}
                    >
                      <SearchWidget
                        placeholder="Tìm theo tên, SĐT, mã khách hàng..."
                        hidden={quotationFacade.isHiddenProductInputSearch}
                        form={(form) => (formRef.current = form)}
                        callback={(value) => {
                          customerFacade.get({
                            size: -1,
                            filter: JSON.stringify({
                              FullTextSearch: value,
                            }),
                          });
                        }}
                      />
                    </Dropdown>
                    {(quotationFacade?.detailItemCustomer ?? []).length > 0 ? (
                      <div className="mt-2">
                        <Form.Item
                          hidden
                          className={'m-0'}
                          layout="horizontal"
                          labelCol={{ span: 4 }}
                          labelAlign="left"
                          name={'customerId'}
                          label={<p className="font-semibold">ID</p>}
                        >
                          <Input className="p-0 border-0 w-72" readOnly variant="borderless" />
                        </Form.Item>
                        <div className="flex gap-1">
                          <p className="font-semibold w-24">Địa chỉ</p>
                          <span>
                            :{' '}
                            {quotationFacade.detailItemCustomer?.[0]?.address
                              ? `${quotationFacade.detailItemCustomer?.[0]?.address}`
                              : ''}
                            {quotationFacade.detailItemCustomer?.[0]?.wardName
                              ? `, ${quotationFacade.detailItemCustomer?.[0]?.wardName}`
                              : ''}
                            {quotationFacade.detailItemCustomer?.[0]?.districtName
                              ? `, ${quotationFacade.detailItemCustomer?.[0]?.districtName}`
                              : ''}
                            {quotationFacade.detailItemCustomer?.[0]?.provinceName
                              ? `, ${quotationFacade.detailItemCustomer?.[0]?.provinceName}`
                              : 'Chưa có địa chỉ'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <p className="font-semibold w-24">Mã số thuế</p>
                          <span>: {quotationFacade.detailItemCustomer?.[0]?.taxCode || 'Chưa có mã số thuế'}</span>
                        </div>
                        <div className="flex gap-1">
                          <p className="font-semibold w-24">Công nợ</p>
                          <span>
                            :{' '}
                            <span className="text-red-500">
                              {quotationFacade.detailItemCustomer?.[0]?.debtAmount?.toLocaleString() ||
                                quotationFacade.data?.customer?.debtAmount?.toLocaleString()}
                            </span>
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <p className="font-semibold w-24">Tổng chi tiêu</p>
                          <span>
                            :{' '}
                            <span className="text-blue-500">
                              {quotationFacade.detailItemCustomer?.[0]?.expenseAmount?.toLocaleString() ||
                                quotationFacade.data?.customer?.expenseAmount?.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex justify-center items-center flex-col my-8">
                        <EmptyIcon className="size-20" />
                        <p className="text-gray-400">Chưa có thông tin khách hàng</p>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={24} lg={11} xl={9} xxl={8}>
                <Card title={'Thông tin bổ sung'}>
                  <div className="h-60 overflow-y-auto miniScroll">
                    <div className="mr-2">
                      <Form.Item
                        name="dueDate"
                        label="Ngày hết hạn"
                        labelCol={{ span: 11 }}
                        labelAlign="left"
                        rules={[{ required: true }]}
                      >
                        <DatePicker className="w-full" placeholder="Chọn ngày hết hạn" format="DD/MM/YYYY" />
                      </Form.Item>
                      <Form.Item name="projectId" label="Dự án" labelCol={{ span: 11 }} labelAlign="left">
                        <Select
                          className="w-full"
                          placeholder="Chọn dự án"
                          optionFilterProp="label"
                          showSearch
                          allowClear
                          options={projectFacade.pagination?.content.map((item) => ({
                            value: item.id,
                            label: item.tenDuAn,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="typeCode" label="Loại báo giá" labelCol={{ span: 11 }} labelAlign="left">
                        <Select
                          className="w-full"
                          placeholder="Chọn loại báo giá"
                          optionFilterProp="label"
                          showSearch
                          allowClear
                          options={[
                            { value: 'QuotationMaterial', label: 'Báo giá vật tư' },
                            { value: 'QuotationProduct', label: 'Báo giá sản phẩm' },
                          ]}
                          onClear={() => {
                            productFacade.get({ size: -1, filter: JSON.stringify({ isOrder: true }) });
                          }}
                          onChange={(value) => {
                            switch (value) {
                              case 'QuotationMaterial':
                                productFacade.get({
                                  size: -1,
                                  filter: JSON.stringify({ type: 'VAT_TU', isOrder: true }),
                                });
                                break;
                              case 'QuotationProduct':
                                productFacade.get({
                                  size: -1,
                                  filter: JSON.stringify({ type: 'SAN_PHAM', isOrder: true }),
                                });
                                break;
                            }
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name="paymentMethodCode"
                        label="Hình thức thanh toán"
                        labelCol={{ span: 11 }}
                        labelAlign="left"
                        rules={[{ required: true }]}
                      >
                        <Select
                          className="w-full"
                          placeholder="Chọn hình thức thanh toán"
                          optionFilterProp="label"
                          showSearch
                          allowClear
                          options={codeTypeFacade?.paymentMethods?.content?.map((item: CodeTypeModel) => {
                            return { label: item.title, value: item.code };
                          })}
                        />
                      </Form.Item>
                      <Form.Item
                        name="status"
                        label="Trạng thái"
                        labelCol={{ span: 11 }}
                        labelAlign="left"
                        rules={[{ required: true }]}
                      >
                        <Select
                          className="w-full"
                          placeholder="Chọn trang thái"
                          optionFilterProp="label"
                          showSearch
                          allowClear
                          options={[
                            { value: 'DRAFT', label: 'Nháp' },
                            { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
                            { value: 'INTERNAL_APPROVAL', label: 'Duyệt nội bộ' },
                            { value: 'CUSTOMER_APPROVED', label: 'Khách hàng duyệt' },
                            { value: 'CANCELLED', label: 'Hủy' },
                          ]}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={24}>
                <Card title={'Thông tin sản phẩm'}>
                  <Form.List name="quotationItem">
                    {(quotationItem, { add, remove }) => {
                      return (
                        <>
                          <Table
                            // style={{ tableLayout: 'fixed' }} // CSS cho bảng
                            size="small"
                            title={() => (
                              <>
                                <div className="flex gap-2">
                                  <Dropdown
                                    menu={{
                                      items: [
                                        {
                                          key: '1',
                                          label: (
                                            <div
                                              className="flex gap-2"
                                              onClick={() => quotationFacade.set({ isProductModal: true })}
                                            >
                                              <PlusCircleOutlined className="text-green-600" />
                                              Thêm mới sản phẩm/vật tư
                                            </div>
                                          ),
                                        },
                                        {
                                          key: '2',
                                          label: 'Danh sách sản phẩm/vật tư',
                                          type: 'group',
                                          children: productFacade.pagination?.content.map((item, index) => {
                                            return {
                                              key: `2-${index + 1}`,
                                              label: (
                                                <Tooltip
                                                  color="white"
                                                  placement="leftBottom"
                                                  title={
                                                    <Image
                                                      width={140}
                                                      height={140}
                                                      src={item?.attachmentUrl?.fileUrl}
                                                      alt={item?.attachmentUrl?.description}
                                                      fallback="/public/assets/images/no-image.png"
                                                    />
                                                  }
                                                >
                                                  <a
                                                    className="!flex-1 w-full"
                                                    rel="noreferrer"
                                                    onClick={() => {
                                                      quotationFacade.set({ isRender: !quotationFacade.isRender });
                                                      handleSelectProduct(item);
                                                    }}
                                                  >
                                                    <div className="flex items-start justify-between">
                                                      {/* image, name & code */}
                                                      <div className="flex items-start gap-4">
                                                        <Image
                                                          width={40}
                                                          height={52}
                                                          src={item?.attachmentUrl?.fileUrl}
                                                          alt={item?.attachmentUrl?.description}
                                                          fallback="/public/assets/images/no-image.png"
                                                        />
                                                        <div>
                                                          <p className="truncate text-[14px] w-[600px]">{item?.name}</p>
                                                          <p className="text-gray-400 text-[12px]">{item?.code}</p>
                                                        </div>
                                                      </div>
                                                      {/* Giá, tồn, có thể bán */}
                                                      <div>
                                                        <Typography.Title className="text-right !mb-0" level={5}>
                                                          {item?.sellingUnitPrice?.toLocaleString()}
                                                        </Typography.Title>
                                                        <div className="flex items-center gap-1.5">
                                                          <div className="flex gap-1">
                                                            <p className="text-gray-400">Tồn:</p>
                                                            <p className="text-blue-500">
                                                              {item?.initialStockQuantity?.toLocaleString()}
                                                            </p>
                                                          </div>
                                                          <p className="text-gray-400">|</p>
                                                          <div className="flex gap-1">
                                                            <p className="text-gray-400">Có thể bán:</p>
                                                            <p className="text-blue-500">
                                                              {item?.sellableQuantity?.toLocaleString()}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </a>
                                                </Tooltip>
                                              ),
                                            };
                                          }),
                                        },
                                      ],
                                    }}
                                    overlayClassName="custom-dropdown-product"
                                    trigger={['click']}
                                  >
                                    <div className="flex-1">
                                      <SearchWidget
                                        placeholder="Tìm theo tên, sản phẩm,..."
                                        form={(form) => (formRef.current = form)}
                                        callback={(value) => {
                                          productFacade.get({
                                            size: -1,
                                            filter: JSON.stringify({
                                              FullTextSearch: value,
                                              type:
                                                quotationForm.getFieldValue('typeCode') === 'QuotationMaterial'
                                                  ? 'VAT_TU'
                                                  : 'SAN_PHAM',
                                              isOrder: true,
                                            }),
                                          });
                                        }}
                                      />
                                    </div>
                                  </Dropdown>
                                  <Button onClick={() => quotationFacade.set({ isProductManyModal: true })}>
                                    Chọn nhanh
                                  </Button>
                                </div>
                              </>
                            )}
                            // scroll={{ y: 'calc(100vh - 600px)' }}
                            dataSource={quotationItem}
                            pagination={false}
                          >
                            <Table.Column
                              className="!p-0.5"
                              title={'#'}
                              dataIndex={'stt'}
                              align={'center'}
                              width={28}
                              render={(_, __, index) => (
                                <>
                                  <p>{index + 1}</p> <p className="h-3" />
                                </>
                              )}
                            />
                            <Table.Column
                              hidden
                              className="!p-0.5"
                              title={'Id sản phẩm/vật tư'}
                              dataIndex={'productId'}
                              render={(_productId: string, _record: QuotationItemModel, index: number) => {
                                return (
                                  <Form.Item name={[index, 'productId']}>
                                    <Input className="w-full" />
                                  </Form.Item>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Tên sản phẩm/vật tư'}
                              dataIndex={'name'}
                              width={270}
                              render={(_name: string, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'name']}>
                                      <Input className="w-full" readOnly variant="borderless" />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Quy cách'}
                              dataIndex={'specifications'}
                              // width={206}
                              render={(_specifications: string, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'specifications']}>
                                      <Input.TextArea className="w-full" autoSize />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              title={'ĐVT'}
                              dataIndex={'unit'}
                              align={'center'}
                              width={94}
                              render={(_unit: string, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'unit']}>
                                      <Input className="w-full" />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Số lượng'}
                              dataIndex={'quantity'}
                              align={'center'}
                              width={103}
                              render={(_quantity: number, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'quantity']}>
                                      <InputNumber
                                        className="w-full"
                                        autoFocus
                                        controls={false}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        // parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                                        onChange={(quantity) => {
                                          const validQuantity = typeof quantity === 'number' ? quantity : 0;
                                          // Hàm tính tất cả tiền và set giá trị vào các field
                                          quotationFacade.set({ isRender: !quotationFacade.isRender });
                                          handleQuantityItemChange(validQuantity, index);
                                        }}
                                      />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Đơn giá'}
                              dataIndex={'unitPrice'}
                              align={'right'}
                              // width={131}
                              render={(_unitPrice: number, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'unitPrice']}>
                                      <InputNumber
                                        className="w-full"
                                        controls={false}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                                        onChange={(unitPrice) => {
                                          const validUnitPrice = typeof unitPrice === 'number' ? unitPrice : 0;
                                          quotationFacade.set({ isRender: !quotationFacade.isRender });
                                          handleUnitPriceItemChange(validUnitPrice, index);
                                        }}
                                      />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Chiết khấu'}
                              dataIndex={'unitPriceDiscountAmount'}
                              align={'right'}
                              // width={132}
                              render={(
                                _unitPriceDiscountAmount: number,
                                _record: QuotationItemModel,
                                index: number,
                              ) => {
                                return (
                                  <>
                                    <Form.Item
                                      name={[index, 'unitPriceDiscountAmount']}
                                      rules={[
                                        {
                                          validator: (_, value) => {
                                            const currentItems = quotationForm.getFieldValue('quotationItem') || [];
                                            const unitPrice = currentItems[index]?.unitPrice || 0;

                                            if (value < 0) {
                                              customMessage.error({
                                                type: 'error',
                                                content: 'Chiết khấu không được âm',
                                              });
                                              return Promise.reject(new Error());
                                            }

                                            if (value >= unitPrice) {
                                              customMessage.error({
                                                type: 'error',
                                                content: 'Chiết khấu lớn hơn giá trị sản phẩm',
                                              });

                                              return Promise.reject(new Error());
                                            }

                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <InputNumber
                                        className="w-full"
                                        controls={false}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                                        onChange={(unitPriceDiscountAmount) => {
                                          const validUnitPriceDiscountAmount =
                                            typeof unitPriceDiscountAmount === 'number' ? unitPriceDiscountAmount : 0;

                                          handleDiscountAmountItemChange(validUnitPriceDiscountAmount, index);
                                          quotationFacade.set({
                                            isHiddenDiscountPercent: true,
                                            isRender: !quotationFacade.isRender,
                                          });
                                        }}
                                      />
                                    </Form.Item>
                                    <p
                                      className={`text-red-500 text-xs h-3 ${
                                        quotationFacade.isHiddenDiscountPercent ? 'visible' : 'invisible'
                                      }`}
                                    >
                                      {/* tính chiết khấu % */}
                                      {quotationForm.getFieldValue([
                                        'quotationItem',
                                        index,
                                        'unitPriceDiscountAmount',
                                      ]) &&
                                        quotationForm.getFieldValue(['quotationItem', index, 'unitPrice']) &&
                                        (
                                          (quotationForm.getFieldValue([
                                            'quotationItem',
                                            index,
                                            'unitPriceDiscountAmount',
                                          ]) /
                                            quotationForm.getFieldValue(['quotationItem', index, 'unitPrice'])) *
                                          100
                                        ).toFixed(2)}
                                      %
                                    </p>
                                  </>
                                );
                              }}
                            />
                            {/* unitPriceDiscountType */}
                            <Table.Column
                              hidden
                              className="!p-0.5"
                              title={'unitPriceDiscountType'}
                              dataIndex={'unitPriceDiscountType'}
                              align={'right'}
                              // width={132}
                              render={(_unitPriceDiscountType: string, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'unitPriceDiscountType']}>
                                      <Select className="w-full" />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Thành tiền'}
                              dataIndex={'afterLineDiscountGoodsAmount'}
                              align={'right'}
                              // width={140}
                              render={(_lineAmount: number, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'afterLineDiscountGoodsAmount']}>
                                      <InputNumber
                                        className="w-full"
                                        readOnly
                                        variant="borderless"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                                      />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Ghi chú'}
                              dataIndex={'lineNote'}
                              align="center"
                              // width={138}
                              render={(_lineNote: string, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'lineNote']}>
                                      <Input.TextArea className="w-full" rows={2} />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            {/* Column lineVATAmount */}
                            <Table.Column
                              hidden
                              title={'lineVATAmount'}
                              dataIndex={'lineVATAmount'}
                              align="center"
                              // width={138}
                              render={(_lineVATAmount: number, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'lineVATAmount']}>
                                      <InputNumber className="w-full" />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            {/* Column lineVATPercent */}
                            <Table.Column
                              hidden
                              title={'lineVATPercent'}
                              dataIndex={'lineVATPercent'}
                              align="center"
                              // width={138}
                              render={(_lineVATPercent: number, _record: QuotationItemModel, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'lineVATPercent']}>
                                      <InputNumber className="w-full" />
                                    </Form.Item>
                                    <p className="h-3" />
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={null}
                              width={38}
                              align={'center'}
                              render={(_, record: QuotationItemModel, index: number) => {
                                return (
                                  <Tooltip title={'Xóa'}>
                                    <CloseOutlined
                                      onClick={() => {
                                        // remove(record.name ? parseInt(record.name) : 0);
                                        quotationFacade.set({ isRender: !quotationFacade.isRender });

                                        handleRemoveItem(remove, index);
                                      }}
                                    />
                                  </Tooltip>
                                );
                              }}
                            />
                          </Table>
                          {quotationFacade.isProductModal && <ProductForm quotationForm={quotationForm} add={add} />}
                          <Modal
                            title={'Chọn sản phẩm để báo giá'}
                            width={700}
                            open={quotationFacade.isProductManyModal}
                            okText={'Chọn xong'}
                            cancelText={'Thoát'}
                            onOk={productManyForm.submit}
                            onCancel={handleProductManyClose}
                          >
                            <Form
                              form={productManyForm}
                              // initialValues={{ quantity: 0 }}
                              onFinish={() => {
                                const selectedRows = quotationFacade.selectedRows;
                                const currentItems = quotationForm.getFieldValue('quotationItem') || [];

                                (selectedRows || []).forEach((item: DataType) => {
                                  const isExist = currentItems.some(
                                    (currentItem: QuotationItemModel) => currentItem.productId === item.productId,
                                  );

                                  if (!isExist) {
                                    currentItems.push({
                                      productId: item.productId,
                                      name: item.name,
                                      unit: item.unit,
                                      quantity: 1,
                                      unitPrice: item.unitPrice,
                                      unitPriceDiscountType: 'value',
                                      unitPriceDiscountAmount: 0,
                                      afterLineDiscountGoodsAmount: item.unitPrice,
                                      lineVATPercent: item.lineVATPercent,
                                      lineVATAmount: null,
                                    });
                                  }
                                });

                                quotationForm.setFieldsValue({
                                  quotationItem: currentItems,
                                });

                                // Tính tổng tiền và các giá trị khác
                                calculateTotalAmount(currentItems);

                                const discountAmount = quotationForm.getFieldValue('discountAmount') || 0;
                                const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 0;

                                currentItems.forEach((item: QuotationItemModel) => {
                                  item.lineVATAmount =
                                    (((item.afterLineDiscountGoodsAmount || 0) -
                                      ((item.afterLineDiscountGoodsAmount || 0) * discountAmount) / subTotalAmount) *
                                      (item.lineVATPercent || 0)) /
                                    100;
                                });

                                quotationForm.setFieldsValue({
                                  quotationItem: currentItems,
                                });

                                quotationFacade.set({ isProductManyModal: false });
                              }}
                            >
                              <Row gutter={[24, 15]}>
                                <Col className="mt-2.5" span={24}>
                                  <SearchWidget
                                    placeholder="Tìm kiếm sản phẩm/vật tư"
                                    form={(form) => (formRef.current = form)}
                                    callback={(value) =>
                                      productFacade.get({
                                        size: -1,
                                        filter: JSON.stringify({
                                          FullTextSearch: value,
                                          type:
                                            quotationForm.getFieldValue('typeCode') === 'QuotationMaterial'
                                              ? 'VAT_TU'
                                              : 'SAN_PHAM',
                                        }),
                                      })
                                    }
                                  />
                                </Col>
                                <Col span={24}>
                                  <Table<DataType>
                                    size="small"
                                    rowKey={'productId'}
                                    rowSelection={rowSelection}
                                    columns={productColumns}
                                    dataSource={productsData}
                                    scroll={{ y: 55 * 7 }}
                                  />
                                </Col>
                              </Row>
                            </Form>
                          </Modal>
                        </>
                      );
                    }}
                  </Form.List>
                  <Row gutter={24} className="mt-2">
                    <Col span={14}>
                      <Form.Item layout="vertical" name={'note'} label={'Ghi chú'}>
                        <Input.TextArea className="w-80" placeholder="VD: Không bao gồm chi phí nhân công" rows={3} />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <div className="">
                        <div className={'flex items-end justify-between'}>
                          <p>Tổng tiền ({quotationFacade.quotationQuantity?.toLocaleString() || 0} sản phẩm)</p>
                          <Form.Item className={'mb-0'} name={'subTotalAmount'}>
                            <InputNumber
                              className={'w-32 text-right'}
                              controls={false}
                              readOnly
                              variant="borderless"
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                            />
                          </Form.Item>
                        </div>

                        <div className={'space-y-0.5'}>
                          {/* Hiển thị VAT percent và amount theo sản phẩm khi có thuế % > 0 */}
                          {quotationItem?.map((item: QuotationItemModel, index: number) => {
                            if (item?.lineVATPercent || 0 > 0) {
                              return (
                                <div key={item.id} className="flex items-end justify-between h-9">
                                  <p>VAT ({item.lineVATPercent?.toLocaleString()}%)</p>
                                  <span className="pr-3">
                                    {item.lineVATAmount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              );
                            }
                          })}
                        </div>
                        <div className={'flex items-end justify-between'}>
                          <p>Chiết khấu</p>
                          <Tooltip
                            className=""
                            title={() => (
                              <>
                                <Form.Item
                                  className={'mb-1 mr-2'}
                                  name={'discountAmount'}
                                  layout="horizontal"
                                  label="Chiết khấu"
                                  labelAlign="left"
                                  labelCol={{ span: 11 }}
                                  rules={[
                                    {
                                      validator: (_, value) => {
                                        const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 0;

                                        if (value > subTotalAmount) {
                                          customMessage.error({
                                            type: 'error',
                                            content: 'Chiết khấu không được lớn hơn giá trị tổng tiền',
                                          });

                                          return Promise.reject(new Error());
                                        }

                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    className={'w-full !border-t-0 !border-x-0 !border-b-1 !border-gray-300 text-right'}
                                    controls={false}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                                    onChange={(discountAmount) => {
                                      const validDiscountAmount =
                                        typeof discountAmount === 'number' ? discountAmount : 0;
                                      quotationFacade.set({
                                        isRender: !quotationFacade.isRender,
                                      });
                                      handleDiscountAmountChange(validDiscountAmount);
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  className={'mb-1 mr-2'}
                                  layout="horizontal"
                                  name={'discountReason'}
                                  label="Lý do chiết khấu"
                                  labelAlign="left"
                                  labelCol={{ span: 11 }}
                                >
                                  <Input.TextArea className={'w-full'} rows={2} />
                                </Form.Item>
                              </>
                            )}
                            open={quotationFacade.isDiscountTooltip}
                            placement="bottomRight"
                            color="white"
                            trigger={['click']}
                            overlayInnerStyle={{ width: '300px', whiteSpace: 'normal' }}
                            onOpenChange={(open) => quotationFacade.set({ isDiscountTooltip: open })}
                          >
                            <Form.Item
                              className={'mb-0'}
                              name={'discountAmount'}
                              rules={[
                                {
                                  validator: (_, value) => {
                                    const subTotalAmount = quotationForm.getFieldValue('subTotalAmount') || 0;

                                    if (value > subTotalAmount) {
                                      return Promise.reject(new Error());
                                    }

                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <InputNumber
                                className={'w-32 !border-t-0 !border-x-0 !border-b-1 text-right'}
                                controls={false}
                                readOnly
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                                onClick={() => {
                                  quotationFacade.set({ isDiscountTooltip: true });
                                }}
                              />
                            </Form.Item>
                          </Tooltip>
                        </div>
                        <p className="text-red-500">
                          {quotationForm.getFieldValue('discountReason') ?? 'Không có lý do chiết khấu'}
                        </p>

                        <div className={'flex items-end justify-between'}>
                          <p>Chi phí vận chuyển</p>
                          <Form.Item className={'mb-0'} name={'shippingCostAmount'}>
                            <InputNumber
                              className={'w-32 !border-t-0 !border-x-0 !border-b-1 !border-gray-300 text-right'}
                              controls={false}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                              onChange={(shippingCostAmount) => {
                                const validShippingCostAmount =
                                  typeof shippingCostAmount === 'number' ? shippingCostAmount : 0;
                                handleShippingCostAmountChange(validShippingCostAmount);
                              }}
                            />
                          </Form.Item>
                        </div>
                        <div className={'flex items-end justify-between'}>
                          <p>Chi phí khác</p>
                          <Form.Item className={'mb-0'} name={'otherCostAmount'}>
                            <InputNumber
                              className={'w-32 !border-t-0 !border-x-0 !border-b-1 !border-gray-300 text-right'}
                              controls={false}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                              onChange={(otherCostAmount) => {
                                const validOtherCostAmount = typeof otherCostAmount === 'number' ? otherCostAmount : 0;
                                handleOtherCostAmountChange(validOtherCostAmount);
                              }}
                            />
                          </Form.Item>
                        </div>
                        <div className={'flex items-end justify-between'}>
                          <p className="font-medium">Tổng phải trả</p>
                          <Form.Item className={'mb-0'} name={'totalAmount'}>
                            <InputNumber
                              className={'w-32 text-right'}
                              controls={false}
                              readOnly
                              variant="borderless"
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') ?? 0}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        </Form>
      </Spin>
      {quotationFacade.isCustomerModal && <CustomerForm quotationForm={quotationForm} />}
    </>
  );
};

export default QuotationForm;
