import { lang, routerLinks } from '@utils';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Tooltip,
  TreeSelect,
} from 'antd';
import { DeleteOutlined, InfoCircleTwoTone, LeftOutlined, UserOutlined } from '@ant-design/icons';
import {
  CodeTypeFacade,
  CodeTypeModel,
  ProjectFacade,
  CustomerFacade,
  CustomerModel,
  NhaCungCapFacade,
  NhaCungCapModel,
  CashbookTransactionFacade,
  CashbookTransactionModel,
  ContractFacade,
  ConstructionFacade,
  UserFacade,
  CodeTypeManagement,
} from '@store';
import { EStatusState } from '@models';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import tiếng Việt cho dayjs
import viVN from 'antd/es/date-picker/locale/vi_VN';
import { Upload } from '@core/upload'; // Import ngôn ngữ Việt Nam từ antd
import { Link, useSearchParams } from 'react-router-dom';
import { CashAndBankFacade, CashAndBankModel, CashAndBankTreeViewModel } from '../../../store/CashAndBank';
import MoneyBillIcon from '../../../../public/assets/icon/MoneyBillSolidIcon';
import PiggyIcon from '../../../../public/assets/icon/PiggyIcon';
import LineChartIcon from '../../../../public/assets/icon/LineChartIcon';
import MoneyCheckIcon from '../../../../public/assets/icon/MoneyCheckIcon';

const { TextArea } = Input;

const ReceiptCreatePage = () => {
  const [receiptCreateForm] = Form.useForm();
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const customerFacade = CustomerFacade();
  const supplierFacade = NhaCungCapFacade();
  const userFacade = UserFacade();
  const codeTypeFacade = CodeTypeFacade();
  const projectFacade = ProjectFacade();
  const contractFacade = ContractFacade();
  const constructionFacade = ConstructionFacade();
  const cashAndBankFacade = CashAndBankFacade();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const contractId = searchParams.get('contractId');

  const entityTypeCode = Form.useWatch('entityTypeCode', receiptCreateForm);
  const entityName = Form.useWatch('entityName', receiptCreateForm);
  const constructionId = Form.useWatch('constructionId', receiptCreateForm);

  useEffect(() => {
    cashBookTransactionFacade.set({ valueEntityTypeCode: 'customer', placeholderEntityId: 'Chọn khách hàng' });
    customerFacade.get({ size: -1 });
    codeTypeFacade.getPurposeReceipts({ size: -1 });
    userFacade.get({ size: -1 });
    codeTypeFacade.getPaymentMethods({ size: -1 });
    codeTypeFacade.getEntityGroup({ size: -1 });
    projectFacade.get({ size: -1 });
    contractFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NEW', 'IN_PROGRESS', 'COMPLETED'] }) });
    constructionFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NOW', 'IN_PROGRESS', 'COMPLETED'] }) });

    // Lấy ra danh sách tài khoản dạng cây
    cashAndBankFacade.getCashAndBankTreeList();

    if (location.state) {
      receiptCreateForm.setFieldsValue(location.state);
    }

    if (location.state) {
      receiptCreateForm.setFieldsValue(location.state);
    }

    if (contractId) {
      contractFacade.getById({ id: contractId });
    }
  }, []);

  useEffect(() => {
    switch (cashBookTransactionFacade.status) {
      case EStatusState.postFulfilled:
        onCancel();
        cashBookTransactionFacade.get({ filter: JSON.stringify({ transactionTypeCode: 'THU' }) ?? '{}' });
        break;
    }
  }, [cashBookTransactionFacade.status]);

  useEffect(() => {
    switch (contractFacade.status) {
      case EStatusState.getByIdFulfilled:
        if (contractId) {
          receiptCreateForm.setFieldsValue({
            constructionId: contractFacade?.data?.construction?.id,
            contractId: contractFacade?.data?.id,
          });
        }
        break;
    }
  }, [contractFacade.status]);

  useEffect(() => {
    if (cashBookTransactionFacade.dataCashbookTransaction) {
      cashBookTransactionFacade.set({
        valueEntityTypeCode: cashBookTransactionFacade.dataCashbookTransaction.payerGroup,
      });
      receiptCreateForm.setFieldValue('entityTypeCode', cashBookTransactionFacade.dataCashbookTransaction.payerGroup);
      receiptCreateForm.setFieldValue('entityId', cashBookTransactionFacade.dataCashbookTransaction.id);
    }
  }, [cashBookTransactionFacade.dataCashbookTransaction]);

  //Handle cancel button
  const onCancel = () => {
    navigate(`/${lang}${routerLinks('PhieuThu')}`);
  };

  //Handle submit button
  const onFinish = (values: CashbookTransactionModel) => {
    const receiptVoucherData: CashbookTransactionModel = {
      ...values,
      entityCode:
        (values.entityTypeCode === 'customer' &&
          customerFacade.pagination?.content.find((item) => item.id === values.entityId)?.code) ||
        (values.entityTypeCode === 'customer' &&
          supplierFacade.pagination?.content.find((item) => item.id === values.entityId)?.code) ||
        (values.entityTypeCode === 'employee' &&
          userFacade.pagination?.content.find((item) => item.id === values.entityId)?.userName) ||
        entityTypeCode,
      entityName:
        (values.entityTypeCode === 'customer' &&
          customerFacade.pagination?.content.find((item) => item.id === values.entityId)?.name) ||
        (values.entityTypeCode === 'customer' &&
          supplierFacade.pagination?.content.find((item) => item.id === values.entityId)?.name) ||
        (values.entityTypeCode === 'employee' &&
          userFacade.pagination?.content.find((item) => item.id === values.entityId)?.name) ||
        entityName,
      entityTypeName: codeTypeFacade.entityGroup?.content?.find((item: CodeTypeModel) => item.code === entityTypeCode)
        ?.title,
      receiptDate: dayjs(values.receiptDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      transactionTypeCode: 'THU',
      code: values.code !== null && values.code !== '' ? values.code : undefined,
      accountId: values.accountId,
    };

    if (values) {
      cashBookTransactionFacade.post(receiptVoucherData);
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
      <Spin spinning={cashBookTransactionFacade.isFormLoading || contractFacade.isFormLoading}>
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            Quay lại danh sách phiếu thu
          </Button>
          <Space className={'pr-4'}>
            <Button type={'default'} danger onClick={() => navigate(`/${lang}${routerLinks('PhieuThu')}`)}>
              Thoát
            </Button>
            <Button type={'primary'} className={'font-medium'} onClick={receiptCreateForm.submit}>
              Lưu
            </Button>
          </Space>
        </div>
        <div className="max-w-8xl mx-auto py-6 px-8">
          <Form
            form={receiptCreateForm}
            layout="vertical"
            initialValues={{
              entityTypeCode: 'customer',
              paymentMethodCode: 'cash',
              isDebt: true,
            }}
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col span={17}>
                {/* Thông tin chung */}
                <Card title="Thông tin chung">
                  <Row gutter={16}>
                    {/* Nhóm người nộp */}
                    <Col span={12}>
                      <Form.Item
                        label="Nhóm người nộp"
                        name={'entityTypeCode'}
                        rules={[
                          {
                            required: true,
                            message: <span className={'text-sm'}>Nhóm người nộp không được để trống</span>,
                          },
                        ]}
                      >
                        <Select
                          placeholder="Chọn nhóm người nộp"
                          showSearch
                          optionFilterProp={'label'}
                          options={codeTypeFacade.entityGroup?.content?.map((item: CodeTypeModel) => ({
                            label: item.title,
                            value: item.code,
                          }))}
                          onChange={(value) => {
                            receiptCreateForm.setFieldsValue({ entityId: undefined });
                            cashBookTransactionFacade.set({
                              valueEntityTypeCode: value,
                              placeholderEntityId:
                                (value === 'customer' && 'Chọn khách hàng') ||
                                (value === 'supplier' && 'Chọn nhà cung cấp') ||
                                (value === 'employee' && 'Chọn nhân viên') ||
                                '',
                            });
                            // Get list customer or supplier
                            switch (value) {
                              case 'customer':
                                customerFacade.get({ size: -1 });
                                break;
                              case 'supplier':
                                supplierFacade.get({ size: -1 });
                                break;
                              case 'employee':
                                userFacade.get({ size: -1 });
                                break;
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    {/* Tên người nộp */}
                    <Col span={12}>
                      <Form.Item
                        label="Tên người nộp"
                        name={entityTypeCode === 'others' ? 'entityName' : 'entityId'}
                        rules={[
                          {
                            required: true,
                            message: <span className={'text-sm'}>Người nộp không được để trống</span>,
                          },
                        ]}
                      >
                        {entityTypeCode === 'others' ? (
                          <Input placeholder="Nhập tên người nộp" />
                        ) : (
                          <Select
                            placeholder={cashBookTransactionFacade.placeholderEntityId || 'Chọn tên người nộp'}
                            allowClear
                            showSearch
                            optionFilterProp={'children'}
                            options={
                              // Get list customer or supplier
                              (cashBookTransactionFacade.valueEntityTypeCode === 'customer' &&
                                customerFacade.pagination?.content.map((item: CustomerModel) => {
                                  return {
                                    label: item.name,
                                    value: item.id,
                                    phoneNumber: item.phoneNumber,
                                    debtAmount: item.debtAmount,
                                  };
                                })) ||
                              (cashBookTransactionFacade.valueEntityTypeCode === 'supplier' &&
                                supplierFacade.pagination?.content.map((item: NhaCungCapModel) => {
                                  return {
                                    label: item.name,
                                    value: item.id,
                                    phoneNumber: item.phoneNumber,
                                    debtAmount: item.totalDebtAmount,
                                  };
                                })) ||
                              (cashBookTransactionFacade.valueEntityTypeCode === 'employee' &&
                                userFacade.pagination?.content.map((item: any) => {
                                  return {
                                    label: item.name,
                                    value: item.id,
                                    phoneNumber: item.phoneNumber,
                                    debtAmount: item.totalDebtAmount ? item.totalDebtAmount : 0,
                                  };
                                })) ||
                              []
                            }
                            optionRender={(option) => (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="bg-blue-400" size={32} icon={<UserOutlined />} />
                                  <div className="leading-5">
                                    <h3 className="font-medium max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                      {option.data.label}
                                    </h3>
                                    <span className="max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                      {option.data.phoneNumber}
                                    </span>
                                  </div>
                                </div>
                                {cashBookTransactionFacade.valueEntityTypeCode === 'employee' ? (
                                  <div></div>
                                ) : (
                                  <div className="space-x-1">
                                    <span className="text-gray-500">Công nợ:</span>
                                    <span className="">
                                      {option.data ? option.data?.debtAmount?.toLocaleString() : 0}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    {/* Loại phiếu thu */}
                    <Col span={12}>
                      <Form.Item
                        label="Loại phiếu thu"
                        name={'purposeCode'}
                        rules={[
                          {
                            required: true,
                            message: <span className={'text-sm'}>Loại phiếu thu không được để trống</span>,
                          },
                        ]}
                      >
                        {/* <Select
                          placeholder="Chọn loại phiếu thu"
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          options={codeTypeFacade?.purposeReceipts?.content
                            ?.filter((item: CodeTypeModel) => item.code !== 'auto_receipt') // Ẩn option có code 'auto_receipt'
                            .map((item: CodeTypeModel) => ({
                              value: item.code,
                              label: item.title,
                            }))}
                        /> */}
                        <TreeSelect
                          placeholder="Chọn loại phiếu thu"
                          allowClear
                          showSearch
                          treeDefaultExpandAll
                          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                          treeData={codeTypeFacade?.purposeReceipts?.content
                            ?.filter((item: CodeTypeManagement) => item.code !== 'auto_receipt') // Ẩn option có code 'auto_receipt'
                            .map((item: CodeTypeManagement) => ({
                              title: item.title,
                              value: item.code,
                              key: item.code,
                              children: item?.codeTypeItems?.map((child) => ({
                                title: child.title,
                                value: child.code,
                                key: child.code,
                              })),
                            }))}
                        />
                      </Form.Item>
                    </Col>
                    {/* Mã phiếu */}
                    <Col span={12}>
                      <Form.Item
                        label="Mã phiếu"
                        name={'code'}
                        tooltip={{
                          title: (
                            <div className="text-sm text-center text-black">
                              Mã phiếu thu không trùng lặp. Nếu để trống mã phiếu tự sinh với tiền tố{' '}
                              <strong>RVN</strong>
                            </div>
                          ),
                          icon: <InfoCircleTwoTone />,
                          color: 'white',
                        }}
                      >
                        <Input placeholder={'Nhập mã phiếu thu'} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Thông tin ghi nhận */}
                <Card title="Giá trị ghi nhận" className="mt-4">
                  <Row gutter={16}>
                    {/* Giá trị */}
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
                          className="w-full text-right"
                          placeholder="Nhập giá trị"
                          min={0}
                          controls={false}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>
                    {/* Hình thức thanh toán */}
                    <Col span={12}>
                      <Form.Item label="Hình thức thanh toán" name={'paymentMethodCode'}>
                        <Select
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
                    {/* Tham chiếu */}
                    <Col span={12}>
                      <Form.Item label="Tham chiếu" name={'reference'}>
                        <Input placeholder={'Nhập tham chiếu'} />
                      </Form.Item>
                    </Col>
                    {/* Tài khoản */}
                    <Col span={12}>
                      <Form.Item label="Tài khoản" name={'account'}>
                        <TreeSelect
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
                    {/* Thay đổi công nợ đối tượng nộp */}
                    {entityTypeCode === 'supplier' || entityTypeCode === 'customer' ? (
                      <Col span={24}>
                        <Form.Item className={'mb-0'} name={'isDebt'} valuePropName="checked">
                          <Checkbox>
                            <div className="flex items-center gap-2">
                              <p>Thay đổi công nợ đối tượng nộp</p>
                              <Tooltip
                                title={
                                  <p className="text-sm text-black">
                                    Nếu không chọn, giá trị của phiếu thu không được tính vào công nợ của đối tượng nộp.
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
                  </Row>
                </Card>
              </Col>

              <Col span={7}>
                <Card title="Thông tin bổ sung">
                  <Row gutter={0}>
                    {/* Ngày thu */}
                    <Col span={24}>
                      <Form.Item label="Ngày thu" name={'receiptDate'}>
                        <DatePicker
                          className={'w-full'}
                          placeholder="Chọn ngày thu"
                          showTime
                          format={'DD/MM/YYYY HH:mm:ss'}
                          locale={viVN}
                        />
                      </Form.Item>
                    </Col>
                    {/* Dự án */}
                    <Col span={24}>
                      <Form.Item label={'Dự án'} name={'projectId'}>
                        <Select
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
                    </Col>
                    <Col span={24}>
                      <Form.Item label={'Công trình/Dự án'} name={'constructionId'}>
                        <Select
                          placeholder={'Chọn công trình/dự án'}
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          options={constructionFacade.pagination?.content?.map((item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                          onChange={(value) => {
                            receiptCreateForm.setFieldsValue({ contractId: undefined });
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
                    </Col>
                    {/*<Col span={24}>*/}
                    {/*  <Form.Item label={'Hợp đồng/Phụ lục'} name={'contractId'}>*/}
                    {/*    <Select*/}
                    {/*      disabled={!constructionId}*/}
                    {/*      placeholder={'Chọn hợp đồng/phụ lục'}*/}
                    {/*      allowClear*/}
                    {/*      showSearch*/}
                    {/*      optionFilterProp="label"*/}
                    {/*      options={contractFacade.pagination?.content?.map((item) => ({*/}
                    {/*        label: `${item.code} - ${item.constructionCategory}`,*/}
                    {/*        value: item.id,*/}
                    {/*      }))}*/}
                    {/*    />*/}
                    {/*  </Form.Item>*/}
                    {/*</Col>*/}
                    {/* Mô tả */}
                    <Col span={24}>
                      <Form.Item label="Mô tả" name={'description'}>
                        <TextArea rows={3} placeholder={'Nhập mô tả'} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
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
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </Spin>
    </>
  );
};

export default ReceiptCreatePage;
