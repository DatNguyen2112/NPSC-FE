import {
  CodeTypeFacade,
  CodeTypeModel,
  ProjectFacade,
  CustomerFacade,
  CashbookTransactionFacade,
  CashbookTransactionModel,
  EStatusThuChi,
  CustomerModel,
  NhaCungCapModel,
  NhaCungCapFacade,
  CodeTypeManagement, UserFacade, ConstructionFacade, ContractFacade, AdvanceRequestFacade,
} from '@store';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col, DatePicker, Empty, Flex,
  Form, Image,
  Input,
  InputNumber, List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tag, Timeline,
  Tooltip,
  TreeSelect, Typography,
} from 'antd';
import { DeleteOutlined, InfoCircleTwoTone, LeftOutlined, PrinterFilled, UserOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { convertNumberToWords, formatDayjsDate, formatVietnameseDate, lang, routerLinks } from '@utils';
import { useNavigate, useParams } from 'react-router';
import { EStatusState } from '@models';
import dayjs from 'dayjs';
import PrintContent from '@pages/PrintContent/PrintContent';
import { useReactToPrint } from 'react-to-print';
import { Link } from 'react-router-dom';
import TextArea from 'antd/es/input/TextArea';
import viVN from 'antd/es/date-picker/locale/vi_VN';
import { Upload } from '@core/upload';
import { CashAndBankFacade, CashAndBankModel, CashAndBankTreeViewModel } from '../../../store/CashAndBank';
import MoneyBillIcon from '../../../../public/assets/icon/MoneyBillSolidIcon';
import PiggyIcon from '../../../../public/assets/icon/PiggyIcon';
import LineChartIcon from '../../../../public/assets/icon/LineChartIcon';
import MoneyCheckIcon from '../../../../public/assets/icon/MoneyCheckIcon';

const PaymentVoucherEditPage = () => {
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const codeTypeFacade = CodeTypeFacade();
  const projectFacade = ProjectFacade();
  const customerFacade = CustomerFacade();
  const supplierFacade = NhaCungCapFacade();
  const userFacade = UserFacade();
  const constructionFacade = ConstructionFacade();
  const contractFacade = ContractFacade();
  const advanceRequestFacade = AdvanceRequestFacade();
  const cashAndBankFacade = CashAndBankFacade();
  const [paymentForm] = Form.useForm();

  const constructionId = Form.useWatch('constructionId', paymentForm);
  const entityTypeCode = Form.useWatch('entityTypeCode', paymentForm);
  const navigate = useNavigate();
  const { id } = useParams();
  const [modalApi, contextModalApi] = Modal.useModal();
  // Feature: In phiếu
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Payment_Voucher_${cashBookTransactionFacade.data?.code}`,
    pageStyle: `
      * {
        font-family: "Times New Roman", Times, serif;
      }
    `,
  });
  let data: CashbookTransactionModel;

  useEffect(() => {
    customerFacade.get({ size: -1 });
    supplierFacade.get({ size: -1 });
    userFacade.get({ size: -1 });
    codeTypeFacade.getExpenditurePurposes({ size: -1 });
    codeTypeFacade.getPaymentMethods({ size: -1 });
    codeTypeFacade.getEntityGroup({ size: -1 });
    projectFacade.get({ size: -1 });
    contractFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NEW', 'IN_PROGRESS', 'COMPLETED'] }) });
    constructionFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NOW', 'IN_PROGRESS', 'COMPLETED'] }) });
    cashAndBankFacade.getCashAndBankTreeList();
  }, []);

  useEffect(() => {
    if (id) {
      cashBookTransactionFacade.getById({ id: id });
    }
  }, []);

  useEffect(() => {
    switch (cashBookTransactionFacade.status) {
      case EStatusState.putFulfilled:
        navigate(`/${lang}${routerLinks('ChiPhi')}`);
        paymentForm.resetFields();
        break;
      case EStatusState.getByIdFulfilled:
        paymentForm.setFieldValue('entityTypeCode', cashBookTransactionFacade.data?.entityTypeCode);
        paymentForm.setFieldValue('accountId', cashBookTransactionFacade.data?.accountId);

        data = {
          ...cashBookTransactionFacade.data,
          receiptDate: cashBookTransactionFacade.data.receiptDate
            ? dayjs(cashBookTransactionFacade.data.receiptDate)
            : null,
          createdOnDate: cashBookTransactionFacade.data.createdOnDate
            ? dayjs(cashBookTransactionFacade.data.createdOnDate)
            : null,
          lastModifiedOnDate: cashBookTransactionFacade.data.lastModifiedOnDate
            ? dayjs(cashBookTransactionFacade.data.lastModifiedOnDate)
            : null,
        };
        for (const key in data) {
          paymentForm.setFieldValue(key, data[key as keyof CashbookTransactionModel]);
        }
        break;
      case EStatusThuChi.paymentInvoiceFulfilled:
        cashBookTransactionFacade.getById({ id: id });
        break;
    }
  }, [cashBookTransactionFacade.status]);

  const onCancel = () => {
    navigate(`/${lang}${routerLinks('ChiPhi')}`);
  };

  const handlePayment = () => {
    modalApi.confirm({
      width: 600,
      title: 'Bạn chắc chắn muốn thanh toán phiếu chi này?',
      content:
        'Sau khi ghi nhận thanh toán, phiếu chi này sẽ không thể chỉnh sửa một số thông tin quan trọng. Bạn có muốn tiếp tục?',
      onOk: () => {
        id && cashBookTransactionFacade.payInvoice(id);
      },
      onCancel: () => {
      },
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary' },
      cancelText: 'Thoát',
      cancelButtonProps: { type: 'default', danger: true },
      closable: true,
    });
  };

  const onFinish = (values: CashbookTransactionModel) => {
    const data = {
      ...values,
      code: values.code ?? cashBookTransactionFacade.data.code,
      entityId: values.entityId ?? cashBookTransactionFacade.data.entityId,
      entityCode: values.entityCode ?? cashBookTransactionFacade.data.entityCode,
      entityName: values.entityName ?? cashBookTransactionFacade.data.entityName,
      entityTypeCode: values.entityTypeCode ?? cashBookTransactionFacade.data.entityTypeCode,
      entityTypeName: values.entityTypeName ?? cashBookTransactionFacade.data.entityTypeName,
      purposeCode: values.purposeCode ?? cashBookTransactionFacade.data.purposeCode,
      amount: values.amount ?? cashBookTransactionFacade.data.amount,
      paymentMethodCode: values.paymentMethodCode ?? cashBookTransactionFacade.data.paymentMethodCode,
      receiptDate: values.receiptDate ?? cashBookTransactionFacade.data.receiptDate,
      description: values.description ?? cashBookTransactionFacade.data.description,
      transactionType: 'CHI',
      accountId: values.accountId ?? cashBookTransactionFacade.data.accountId,
    };
    if (id) {
      cashBookTransactionFacade.put({ ...data, id });
    }
  };

  const originalDocumentName = () => {
    switch (cashBookTransactionFacade.data?.originalDocumentType) {
      case 'purchase_order':
        return 'Đơn nhập hàng';
      case 'sales_return':
        return 'Đơn khách trả hàng';
      default:
        return '.'.repeat(70);
    }
  };

  const generateAccountTypeIcon = (accountTypeCode: string) => {
    switch (accountTypeCode) {
      case "saving":
        return <PiggyIcon />;
        break;
      case "investment":
        return <LineChartIcon />;
        break;
      case "other":
        return <MoneyCheckIcon />;
        break;
    }
  }

  return (
    <>
      <Spin spinning={cashBookTransactionFacade.isFormLoading}>
        {contextModalApi}
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            Quay lại danh sách phiếu chi
          </Button>
          <Space className={'pr-4'}>
            <Button
              hidden={
                ['COMPLETED', 'CANCELLED'].includes(cashBookTransactionFacade.data?.isActive ?? '') ||
                !cashBookTransactionFacade.data?.isActive
              }
              color="primary"
              variant="outlined"
              onClick={handlePayment}
            >
              Xác nhận thanh toán
            </Button>
            <Button type={'primary'} onClick={paymentForm.submit}>
              Lưu thay đổi
            </Button>
          </Space>
        </div>
        <div className="max-w-8xl mx-auto py-6 px-8">
          <div className="flex gap-3 flex-col mb-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium">{cashBookTransactionFacade.data?.code}</h1>
              <Tag
                className="px-3.5 py-0.5 rounded-full text-sm"
                color={
                  cashBookTransactionFacade.data?.isActive === 'COMPLETED'
                    ? 'green'
                    : cashBookTransactionFacade.data?.isActive === 'CANCELED'
                      ? 'red'
                      : 'default'
                }
              >
                {cashBookTransactionFacade.data?.isActive === 'COMPLETED'
                  ? 'Hoàn thành'
                  : cashBookTransactionFacade.data?.isActive === 'CANCELED'
                    ? 'Đã hủy'
                    : 'Nháp'}
              </Tag>
            </div>
            <div>
              <Button icon={<PrinterFilled />} onClick={() => reactToPrintFn()}>
                In phiếu
              </Button>
            </div>
          </div>
          <Form form={paymentForm} layout="vertical" onFinish={onFinish}>
            <Row gutter={[24, 24]}>
              <Col span={15}>
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Card title="Thông tin chung">
                      <Row gutter={16}>
                        {/* Nhóm người nhận */}
                        <Col span={12}>
                          <Form.Item
                            label="Nhóm người nhận"
                            name={'entityTypeCode'}
                            rules={[
                              {
                                required: true,
                                message: <span className={'text-sm'}>Nhóm người nhận không được để trống</span>,
                              },
                            ]}
                          >
                            <Select
                              disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                              placeholder="Chọn nhóm người nhận"
                              showSearch
                              optionFilterProp={'label'}
                              options={codeTypeFacade.entityGroup?.content?.map((item: CodeTypeModel) => ({
                                label: item.title,
                                value: item.code,
                              }))}
                              onChange={(value) => {
                                paymentForm.setFieldsValue({ entityId: undefined });
                                cashBookTransactionFacade.set({
                                  valueEntityTypeCode: value,
                                  placeholderEntityId: value === 'customer' ? 'Chọn khách hàng' : 'Chọn nhà cung cấp',
                                });
                                // Get list customer or supplier
                                if (value === 'customer') {
                                  customerFacade.get({ size: -1 });
                                }
                                if (value === 'supplier') {
                                  supplierFacade.get({ size: -1 });
                                }
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Tên người nhận"
                            name={
                              cashBookTransactionFacade.data?.entityTypeCode === 'others'
                                ? 'entityName'
                                : 'entityId'
                            }
                            rules={[
                              {
                                required: true,
                                message: <span className={'text-sm'}>Người nộp không được để trống</span>,
                              },
                            ]}
                          >
                            {cashBookTransactionFacade.data?.entityTypeCode === 'others' ? (
                              <Input
                                disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                                placeholder="Nhập tên người nộp"
                              />
                            ) : (
                              <Select
                                placeholder={cashBookTransactionFacade.placeholderEntityId || 'Chọn tên người nộp'}
                                allowClear
                                showSearch
                                disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                                optionFilterProp={'children'}
                                options={
                                  // Get list customer or supplier
                                  entityTypeCode === 'customer' && customerFacade.pagination?.content.map((item: CustomerModel) => {
                                      return {
                                        label: item.name,
                                        value: item.id,
                                        phoneNumber: item.phoneNumber,
                                        debtAmount: item.debtAmount,
                                      };
                                    })
                                  || entityTypeCode === 'supplier' && supplierFacade.pagination?.content.map((item: NhaCungCapModel) => {
                                      return {
                                        label: item.name,
                                        value: item.id,
                                        phoneNumber: item.phoneNumber,
                                        debtAmount: item.totalDebtAmount,
                                      };
                                    })
                                  || entityTypeCode === 'employee' && userFacade.pagination?.content.map((item: any) => {
                                    return {
                                      label: item.name,
                                      value: item.id,
                                      phoneNumber: item.phoneNumber,
                                      debtAmount: item.totalDebtAmount,
                                    };
                                  })
                                  || []
                                }
                                optionRender={(option) => (
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="bg-blue-400" size={32} icon={<UserOutlined />} />
                                      <div className="leading-5">
                                        <h3
                                          className="font-medium max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                          {option.data.label}
                                        </h3>
                                        <span className="max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                          {option.data.phoneNumber}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="space-x-1">
                                      <span className="text-gray-500">Công nợ:</span>
                                      <span className="">{option.data.debtAmount?.toLocaleString() ?? 0}</span>
                                    </div>
                                  </div>
                                )}
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Loại phiếu chi"
                            name={'purposeCode'}
                            rules={[
                              {
                                required: true,
                                message: <span className={'text-sm'}>Loại phiếu chi không được để trống</span>,
                              },
                            ]}
                          >
                            {/* <Select
                              disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                              placeholder="Chọn loại phiếu chi"
                              allowClear
                              showSearch
                              optionFilterProp="label"
                              options={codeTypeFacade?.expenditurePurposes?.content?.map((item: CodeTypeModel) => ({
                                value: item.code,
                                label: item.title,
                              }))}
                            /> */}
                            <TreeSelect
                              disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                              placeholder="Chọn loại phiếu chi"
                              allowClear
                              showSearch
                              treeDefaultExpandAll
                              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                              treeData={
                                codeTypeFacade?.expenditurePurposes?.content?.map((item: CodeTypeManagement) => ({
                                  title: item.title,
                                  value: item.code,
                                  key: item.code,
                                  children: item?.codeTypeItems?.map((child) => ({
                                    title: child.title,
                                    value: child.code,
                                    key: child.code,
                                  })),
                                })) ?? []
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Mã phiếu"
                            name={'code'}
                            tooltip={{
                              title: (
                                <div className="text-sm text-center text-black">
                                  Mã phiếu chi không trùng lặp. Nếu để trống mã phiếu tự sinh với tiền tố{' '}
                                  <strong>PVN</strong>
                                </div>
                              ),
                              icon: <InfoCircleTwoTone />,
                              color: 'white',
                            }}
                          >
                            <Input
                              disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                              placeholder={'Nhập mã phiếu chi'}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item label="Mô tả" name={'description'}>
                            <TextArea rows={3} placeholder={'Nhập mô tả'} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card title="Giá trị ghi nhận">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Giá trị"
                            name={'amount'}
                            rules={[
                              {
                                required: true,
                                message: <span className={'text-sm'}>Giá trị phải lớn hơn 0</span>,
                              },
                            ]}
                          >
                            <InputNumber
                              disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                              className="w-full text-right"
                              min={0}
                              controls={false}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Hình thức thanh toán" name={'paymentMethodCode'}>
                            <Select
                              disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                              placeholder="Chọn hình thức thanh toán"
                              allowClear
                              showSearch
                              optionFilterProp={'label'}
                              options={codeTypeFacade?.paymentMethods?.content?.map((item: CodeTypeModel) => ({
                                value: item.code,
                                label: item.title,
                              }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label="Tham chiếu" name={'reference'}>
                            <Input placeholder={'Nhập tham chiếu'} />
                          </Form.Item>
                        </Col>
                        {/* Tài khoản */}
                        <Col span={12}>
                          <Form.Item label="Tài khoản" name={'accountId'}>
                            <TreeSelect
                              disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                              placeholder="Chọn tài khoản"
                              allowClear
                              showSearch
                              treeDefaultExpandAll
                              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                              treeData={cashAndBankFacade?.cashAndBankTreeListData?.cashAndBankTree?.map((item: CashAndBankTreeViewModel) => ({
                                title: item?.title,
                                value: item.code,
                                key: item.code,
                                children: item?.children?.map((child: CashAndBankModel) => ({
                                  title: <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {(child.bankImageUrl || child.walletImageUrl) && <Image width={30} height={30} src={child.bankImageUrl || child.walletImageUrl} />}
                                      {child.accountTypeCode && (generateAccountTypeIcon(child.accountTypeCode))}
                                      {child.paymentTypeCode === 'cash' && (<MoneyBillIcon />)}
                                      <div className="leading-5">
                                        <h3>
                                          {child.accountOwner}
                                        </h3>
                                      </div>
                                    </div>
                                  </div>,
                                  value: child.id,
                                  key: child.id,
                                })),
                              }))}
                            />
                          </Form.Item>
                        </Col>
                        {entityTypeCode === 'customer' || entityTypeCode === 'supplier' ? (
                          <Col span={24}>
                            <Form.Item className={'mb-0'} name={'isDebt'} valuePropName="checked">
                              <Checkbox
                                disabled={
                                  entityTypeCode === 'customer' || entityTypeCode === 'supplier'
                                    ? cashBookTransactionFacade.data?.isActive === 'COMPLETED'
                                    : false
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <p>Thay đổi công nợ đối tượng nhận</p>
                                  <Tooltip
                                    title={
                                      <p className="text-sm text-black">
                                        Nếu không chọn, giá trị của phiếu chi không được tính vào công nợ của đối tượng
                                        nhận.
                                      </p>
                                    }
                                    overlayInnerStyle={{ width: '280px' }}
                                    color="white"
                                  >
                                    <InfoCircleTwoTone className="text-sm" />
                                  </Tooltip>
                                </div>
                              </Checkbox>
                            </Form.Item>
                          </Col>
                        ) : (
                          <div />
                        )}
                        <Col
                          span={24}
                          hidden={
                            !(
                              cashBookTransactionFacade.data?.purposeCode === 'auto_payment' &&
                              cashBookTransactionFacade.data?.originalDocumentId
                            )
                          }
                        >
                          <div className="flex gap-1">
                            <p>Phiếu được tạo tự động.</p>
                            <a
                              href={`/#/${lang}${routerLinks('PurchaseOrder')}/${cashBookTransactionFacade.data?.originalDocumentId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {' '}
                              Xem chứng từ gốc
                            </a>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Col>

              <Col span={9}>
                <Row gutter={[16,16]}>
                  <Col span={24}>
                    <Card title={'Lịch sử xử lý'}>
                      {cashBookTransactionFacade?.data?.activityLogs != undefined &&
                      cashBookTransactionFacade?.data?.activityLogs.length > 0 ? (
                        <div className="h-[200px] overflow-auto miniScroll">
                          <Timeline
                            className="mt-1"
                            items={cashBookTransactionFacade?.data?.activityLogs?.map((item: any) => ({
                              key: item?.id,
                              children: (
                                <Flex gap={1} vertical>
                                  <Typography.Text>
                                    <b className="font-semibold">{item?.createdByUserName}</b> {item?.action}
                                  </Typography.Text>
                                  <Typography.Text type="secondary">
                                    {formatDayjsDate(item.createdOnDate, undefined, true)}
                                  </Typography.Text>
                                </Flex>
                              ),
                            }))}
                          />
                        </div>
                      ) : (
                        <Empty description={'Chưa có lịch sử xử lý'} />
                      )}
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card title={'Thông tin bổ sung'}>
                      <div className={'h-80 overflow-auto miniScroll'}>
                        <Form.Item label="Ngày chi" name={'receiptDate'}>
                          <DatePicker
                            disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                            className={'w-full'}
                            placeholder="Chọn ngày chi"
                            showTime
                            format={'DD/MM/YYYY HH:mm:ss'}
                            locale={viVN}
                          />
                        </Form.Item>
                        <Form.Item label="Nhân viên tạo" name={'createdByUserName'}>
                          <Input disabled />
                        </Form.Item>
                        <Form.Item label="Ngày tạo" name={'createdOnDate'}>
                          <DatePicker
                            disabled
                            className={'w-full'}
                            placeholder="Chọn ngày thu"
                            showTime
                            format={'DD/MM/YYYY HH:mm:ss'}
                            locale={viVN}
                          />
                        </Form.Item>
                        <Form.Item label="Ngày cập nhật" name={'lastModifiedOnDate'}>
                          <DatePicker
                            disabled
                            className={'w-full'}
                            placeholder="Chọn ngày thu"
                            showTime
                            format={'DD/MM/YYYY HH:mm:ss'}
                            locale={viVN}
                          />
                        </Form.Item>
                        <Form.Item label={'Dự án'} name={'projectId'}>
                          <Select
                            disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                            placeholder={'Chọn dự án'}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={projectFacade.pagination?.content?.map((item) => ({
                              label: item.tenDuAn,
                              value: item.id,
                            }))}
                          />
                        </Form.Item>
                        <Form.Item label={'Công trình/Dự án'} name={'constructionId'}>
                          <Select
                            disabled={cashBookTransactionFacade.data?.isActive !== 'WAIT_TRANSFER'}
                            placeholder={'Chọn công trình/dự án'}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={constructionFacade.pagination?.content?.map((item) => ({
                              label: item.name,
                              value: item.id,
                            }))}
                            onChange={(value) => {
                              paymentForm.setFieldsValue({ contractId: undefined });
                              contractFacade.get({
                                size: -1,
                                filter: JSON.stringify({
                                  constructionId: value,
                                  statusCodes: ['NEW', 'IN_PROGRESS', 'COMPLETED'],
                                }),
                              });
                            }}
                          />
                        </Form.Item>
                        {/*<Form.Item label={'Hợp đồng/Phụ lục'} name={'contractId'}>*/}
                        {/*  <Select*/}
                        {/*    disabled={!constructionId}*/}
                        {/*    placeholder={'Chọn hợp đồng/phụ lục'}*/}
                        {/*    allowClear*/}
                        {/*    showSearch*/}
                        {/*    optionFilterProp="label"*/}
                        {/*    options={contractFacade.pagination?.content?.map((item) => ({*/}
                        {/*      label: `${item.code} - ${item.constructionCategory}`,*/}
                        {/*      value: item.id,*/}
                        {/*    }))}*/}
                        {/*  />*/}
                        {/*</Form.Item>*/}
                        <Form.Item label={'Yêu cầu tạm ứng'} name={'advanceRequestId'}>
                          <Select
                            disabled={!constructionId}
                            placeholder={'Chọn yêu cầu tạm ứng'}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={advanceRequestFacade.pagination?.content?.map((item) => ({
                              label: item.content,
                              value: item.id,
                              code: item.code,
                              totalAmount: item.totalAmount,
                              createdByUserId: item.createdByUserId,
                            }))}
                            optionRender={(item) => (
                              <List.Item>
                                <List.Item.Meta
                                  title={<Typography.Text strong>{item.label}</Typography.Text>}
                                  description={
                                    <Typography.Text
                                      style={{
                                        fontSize: 12,
                                      }}
                                      type="secondary"
                                      italic
                                    >
                                      {item.data.code}
                                    </Typography.Text>
                                  }
                                />
                              </List.Item>
                            )}
                            filterOption={(input, option: any) => {
                              const searchText = input.toLowerCase();
                              return (
                                option.label.toLowerCase().includes(searchText) ||
                                option.code?.toLowerCase().includes(searchText)
                              );
                            }}
                            onChange={(value, option: any) => {
                              paymentForm.setFieldsValue({
                                entityTypeCode: 'employee',
                                entityId: option?.createdByUserId,
                                amount: option?.totalAmount,
                                description: option?.label,
                              });
                            }}
                          />
                        </Form.Item>
                        <Form.Item name={'attachments'} label="File chứng từ gốc">
                          <Upload
                            renderContent={(file, handleDeleteFile) => (
                              <div className={'flex gap-2 items-center text-center'}>
                                <div className={'flex items-center'}>
                                  <Image
                                    src={
                                      (file?.fileName?.endsWith('docx') && '/assets/svgs/word.svg') ||
                                      (file?.fileType === 'IMAGE' && '/assets/svgs/photo-image.svg') ||
                                      (file?.fileName?.endsWith('.pdf') && '/assets/svgs/pdf.svg') ||
                                      ''
                                    }
                                    alt={'img'}
                                    width={20}
                                    height={20}
                                  />
                                </div>
                                <Link className={'text-base'} to={file?.fileUrl ? file?.fileUrl : ''}>
                                  {file?.fileName}
                                </Link>
                                <Button
                                  type={'text'}
                                  icon={<DeleteOutlined className={'text-red-500'} />}
                                  onClick={() => (handleDeleteFile && file ? handleDeleteFile(file) : {})}
                                />
                              </div>
                            )}
                            showBtnDelete={() => false}
                            accept={'/*'}
                            multiple={false}
                            action={'attach'}
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </div>

        <div className={'hidden'}>
          {/* Truyền dữ liệu vào PrintContent */}
          <PrintContent ref={contentRef}>
            <Row gutter={[50, 24]}>
              {/* Thông tin công ty */}
              <Col span={12} className="space-y-2">
                <h1 className="uppercase font-medium">Công ty TNHH Thương mại và Dịch vụ Mạnh Khanh</h1>
                <h1 className="font-medium">Lạc Nhuế, Thuỵ Hoà, Yên Phong, Bắc Ninh</h1>
              </Col>
              {/* Thông tin thông tư */}
              <Col span={12}>
                <div className="text-center space-y-2">
                  <p className="font-semibold">Mẫu số 02 - TT</p>
                  <p className="italic text-sm">
                    (Ban hành kèm theo Thông tư số 88/2021/TT-BTC ngày 11 tháng 10 năm 2021 của Bộ Tài chính)
                  </p>
                </div>
              </Col>

              <Col span={24}>
                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center">
                    <h2 className="font-semibold uppercase text-lg">Phiếu chi</h2>
                    {/* Ngày....tháng....năm.... */}
                    <p className="italic text-sm">
                      {formatVietnameseDate(
                        cashBookTransactionFacade.data?.receiptDate || cashBookTransactionFacade.data?.createdOnDate,
                        true,
                      )}
                    </p>
                  </div>
                  <div className="ml-20 space-y-2">
                    <div className="flex gap-0.5">
                      <h4>Quyển số:</h4>
                      <span>{'.'.repeat(16)}</span>
                    </div>
                    <div className="flex gap-0.5">
                      <h4>Số:</h4>
                      <span>{cashBookTransactionFacade.data?.code}</span>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Thông tin người nộp */}
              <Col span={24}>
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    <h4>Họ và tên người nhận tiền:</h4>
                    <span>{cashBookTransactionFacade.data?.entityName}</span>
                  </div>
                  <div className="flex gap-0.5">
                    <h4 className="min-w-max">Địa chỉ:</h4>
                    {cashBookTransactionFacade.data?.entityAdress ? (
                      <span>{cashBookTransactionFacade.data?.entityAdress}</span>
                    ) : (
                      <span className="line-clamp-1">{'.'.repeat(300)}</span>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    <h4 className="min-w-max">Lý do:</h4>
                    {cashBookTransactionFacade.data?.description ? (
                      <span>{cashBookTransactionFacade.data?.description}</span>
                    ) : (
                      <span className="line-clamp-1">{'.'.repeat(300)}</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 items-center">
                    <h4 className="min-w-max">Số tiền:</h4>
                    <span className="flex-1">
                      <span>
                        <span className="font-semibold">
                          {cashBookTransactionFacade.data?.amount.toLocaleString()} VND{' '}
                        </span>
                        <span>
                          (Viết bằng chữ):{' '}
                          <span className="font-semibold">
                            {convertNumberToWords(cashBookTransactionFacade.data?.amount)}
                          </span>
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      <h4 className="min-w-max">Kèm theo:</h4>
                      <span className="line-clamp-1 min-w-max">{originalDocumentName()}</span>
                    </div>
                    <div className="flex gap-0.5">
                      <h4 className="min-w-max">Chứng từ gốc:</h4>
                      {cashBookTransactionFacade.data?.originalDocumentCode ? (
                        <span>{cashBookTransactionFacade.data?.originalDocumentCode}</span>
                      ) : (
                        <span className="line-clamp-1">{'.'.repeat(70)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={24}>
                {/* Ngày....tháng....năm.... */}
                <p className="italic text-sm text-end">{formatVietnameseDate(dayjs().format('YYYY-MM-DD'), true)}</p>
              </Col>
              {/* Người đại diện kinh doanh */}
              <Col span={6}>
                <div className="text-center">
                  <div className="font-semibold">
                    <h4>Người đại diện</h4>
                    <h4>Hộ kinh doanh/</h4>
                    <h4>Cá nhân kinh doanh</h4>
                  </div>
                  <p className="italic text-sm">(Ký, họ tên, đóng dấu)</p>
                </div>
              </Col>
              {/* Người lập biểu */}
              <Col span={6}>
                <div className="text-center">
                  <div className="font-semibold">
                    <h4>Người lập biểu</h4>
                  </div>
                  <p className="italic text-sm">(Ký, họ tên)</p>
                </div>
              </Col>
              {/* Người nộp tiền */}
              <Col span={6}>
                <div className="text-center">
                  <div className="font-semibold">
                    <h4>Người nộp tiền</h4>
                  </div>
                  <p className="italic text-sm">(Ký, họ tên)</p>
                </div>
              </Col>
              {/* Người đại diện kinh doanh */}
              <Col span={6}>
                <div className="text-center">
                  <div className="font-semibold">
                    <h4>Thủ quỹ</h4>
                  </div>
                  <p className="italic text-sm">(Ký, họ tên)</p>
                </div>
              </Col>
              <Col className="mt-24" span={24}>
                <div className="flex items-center gap-1">
                  <p>Đã nhận đủ số tiền</p>
                  <span>(viết bằng chữ):</span>
                  <span>{convertNumberToWords(cashBookTransactionFacade.data?.amount)}</span>
                </div>
              </Col>
            </Row>
          </PrintContent>
        </div>
      </Spin>
    </>
  );
};

export default PaymentVoucherEditPage;
