import { EStatusState } from '@models';
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
  AdvanceRequestFacade,
  UserFacade,
  CodeTypeManagement,
} from '@store';
import { lang, routerLinks } from '@utils';
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
  List,
  Row,
  Select,
  Space,
  Spin,
  Tooltip,
  TreeSelect,
  Typography,
} from 'antd';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import dayjs from 'dayjs';
import { DeleteOutlined, InfoCircleTwoTone, LeftOutlined, UserOutlined } from '@ant-design/icons';
import 'dayjs/locale/vi'; // Import tiếng Việt cho dayjs
import viVN from 'antd/es/date-picker/locale/vi_VN';
import { Upload } from '@core/upload';
import { Link, useSearchParams } from 'react-router-dom';
import { CashAndBankFacade, CashAndBankModel, CashAndBankTreeViewModel } from '../../../store/CashAndBank';
import PiggyIcon from '../../../../public/assets/icon/PiggyIcon';
import LineChartIcon from '../../../../public/assets/icon/LineChartIcon';
import MoneyCheckIcon from '../../../../public/assets/icon/MoneyCheckIcon'; // Import ngôn ngữ Việt Nam từ antd
import MoneyBillIcon from 'public/assets/icon/MoneyBillSolidIcon'

const { TextArea } = Input;

const PaymentVoucherPage = () => {
  const [paymentCreateForm] = Form.useForm();
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const customerFacade = CustomerFacade();
  const supplierFacade = NhaCungCapFacade();
  const codeTypeFacade = CodeTypeFacade();
  const projectFacade = ProjectFacade();
  const contractFacade = ContractFacade();
  const constructionFacade = ConstructionFacade();
  const advanceRequestFacade = AdvanceRequestFacade();
  const cashAndBankFacade = CashAndBankFacade();

  const userFacade = UserFacade();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const advanceRequestId = searchParams.get('advanceRequestId');
  const contractId = searchParams.get('contractId');

  const entityTypeCode = Form.useWatch('entityTypeCode', paymentCreateForm);
  const entityName = Form.useWatch('entityName', paymentCreateForm);
  const constructionId = Form.useWatch('constructionId', paymentCreateForm);

  useEffect(() => {
    cashBookTransactionFacade.set({
      valueEntityTypeCodePaymentVC: 'supplier',
      placeholderEntityIdPaymentVC: 'Chọn nhà cung cấp',
    });
    supplierFacade.get({ size: -1 });
    codeTypeFacade.getExpenditurePurposes({ size: -1 });
    codeTypeFacade.getPaymentMethods({ size: -1 });
    codeTypeFacade.getEntityGroup({ size: -1 });
    projectFacade.get({ size: -1 });
    userFacade.get({ size: -1 });
    contractFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NEW', 'IN_PROGRESS', 'COMPLETED'] }) });
    constructionFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NOW', 'INPROGRESS', 'COMPLETED'] }) });
    advanceRequestFacade.get({ size: -1, filter: JSON.stringify({ statusCode: 'APPROVED' }) });

    // Lấy ra danh sách tài khoản dạng cây
    cashAndBankFacade.getCashAndBankTreeList();

    if (location.state) {
      paymentCreateForm.setFieldsValue(location.state);
    }

    if (advanceRequestId) {
      advanceRequestFacade.getById({ id: advanceRequestId });
    }

    if (contractId) {
      contractFacade.getById({ id: contractId });
    }
  }, []);

  useEffect(() => {
    switch (cashBookTransactionFacade.status) {
      case EStatusState.postFulfilled:
        onCancel();
        cashBookTransactionFacade.get({ filter: JSON.stringify({ transactionTypeCode: 'CHI' }) ?? '{}' });
        break;
    }
  }, [cashBookTransactionFacade.status]);

  useEffect(() => {
    switch (advanceRequestFacade.status) {
      case EStatusState.getByIdFulfilled:
        paymentCreateForm.setFieldsValue({
          entityTypeCode: 'employee',
          entityId: advanceRequestFacade.data?.createdByUserId,
          amount: advanceRequestFacade.data?.totalAmount,
          constructionId: advanceRequestFacade?.data?.construction?.id,
          advanceRequestId: advanceRequestFacade.data?.id,
          description: advanceRequestFacade.data?.content,
        });
        break;
    }
  }, [advanceRequestFacade.status]);

  useEffect(() => {
    switch (contractFacade.status) {
      case EStatusState.getByIdFulfilled:
        paymentCreateForm.setFieldsValue({
          constructionId: contractFacade?.data?.construction?.id,
          contractId: contractFacade?.data?.id,
        });
        break;
    }
  }, [contractFacade.status]);

  useEffect(() => {
    if (cashBookTransactionFacade.dataCashbookTransaction) {
      cashBookTransactionFacade.set({
        valueEntityTypeCodePaymentVC: cashBookTransactionFacade.dataCashbookTransaction.payerGroup,
      });
      paymentCreateForm.setFieldValue('entityTypeCode', cashBookTransactionFacade.dataCashbookTransaction.payerGroup);
      paymentCreateForm.setFieldValue('entityId', cashBookTransactionFacade.dataCashbookTransaction.id);
    }
  }, [cashBookTransactionFacade.dataCashbookTransaction]);

  //Handle cancel button
  const onCancel = () => {
    navigate(`/${lang}${routerLinks('ChiPhi')}`);
  };

  //Handle submit button
  const onFinish = (values: CashbookTransactionModel) => {
    const paymentVoucherData: CashbookTransactionModel = {
      ...values,
      entityCode:
        (values.entityTypeCode === 'customer' &&
          customerFacade.pagination?.content.find((item) => item.id === values.entityId)?.code) ||
        (values.entityTypeCode === 'supplier' &&
          supplierFacade.pagination?.content.find((item) => item.id === values.entityId)?.code) ||
        (values.entityTypeCode === 'employee' &&
          userFacade.pagination?.content.find((item) => item.id === values.entityId)?.userName) ||
        entityTypeCode,
      entityName:
        (values.entityTypeCode === 'customer' &&
          customerFacade.pagination?.content.find((item) => item.id === values.entityId)?.name) ||
        (values.entityTypeCode === 'supplier' &&
          supplierFacade.pagination?.content.find((item) => item.id === values.entityId)?.name) ||
        (values.entityTypeCode === 'employee' &&
          userFacade.pagination?.content.find((item) => item.id === values.entityId)?.name) ||
        entityName,
      entityTypeName: codeTypeFacade.entityGroup?.content?.find((item: CodeTypeModel) => item?.code === entityTypeCode)
        ?.title,
      receiptDate: dayjs(values.receiptDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      transactionTypeCode: 'CHI',
      code: values.code !== null && values.code !== '' ? values.code : undefined,
      accountId: values.accountId,
    };

    if (values) {
      cashBookTransactionFacade.post(paymentVoucherData);
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
      <Spin
        spinning={
          cashBookTransactionFacade.isFormLoading || advanceRequestFacade.isFormLoading || contractFacade.isFormLoading
        }
      >
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            Quay lại trang danh sách phiếu chi
          </Button>
          <Space className={'pr-4'}>
            <Button
              type={'default'}
              className={'hover:!bg-blue-50 border-blue-400 text-blue-400 font-medium'}
              onClick={() => navigate(`/${lang}${routerLinks('ChiPhi')}`)}
            >
              Thoát
            </Button>
            <Button type={'primary'} className={'font-medium'} onClick={paymentCreateForm.submit}>
              Lưu
            </Button>
          </Space>
        </div>
        <div className="max-w-8xl mx-auto py-6 px-8">
          <Form
            form={paymentCreateForm}
            layout="vertical"
            initialValues={{
              entityTypeCode: 'supplier',
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
                          placeholder="Chọn nhóm người nhận"
                          showSearch
                          optionFilterProp={'label'}
                          options={codeTypeFacade.entityGroup?.content?.map((item: CodeTypeModel) => ({
                            label: item.title,
                            value: item.code,
                          }))}
                          onChange={(value) => {
                            paymentCreateForm.setFieldsValue({ entityId: undefined });
                            cashBookTransactionFacade.set({
                              valueEntityTypeCodePaymentVC: value,
                              placeholderEntityIdPaymentVC:
                                value === 'customer' ? 'Chọn khách hàng' : 'Chọn nhà cung cấp',
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
                    {/* Tên người nhận */}
                    <Col span={12}>
                      <Form.Item
                        label="Tên người nhận"
                        name={entityTypeCode === 'others' ? 'entityName' : 'entityId'}
                        rules={[
                          {
                            required: true,
                            message: <span className={'text-sm'}>Người nhận không được để trống</span>,
                          },
                        ]}
                      >
                        {entityTypeCode === 'others' ? (
                          <Input placeholder="Nhập tên người nộp" />
                        ) : (
                          <Select
                            placeholder={
                              (entityTypeCode === 'customer' && 'Chọn khách hàng') ||
                              (entityTypeCode === 'supplier' && 'Chọn nhà cung cấp') ||
                              (entityTypeCode === 'employee' && 'Chọn nhân viên') ||
                              'Chọn người nộp'
                            }
                            allowClear
                            showSearch
                            optionFilterProp={'children'}
                            options={
                              // Get list customer or supplier
                              (entityTypeCode === 'customer' &&
                                customerFacade.pagination?.content.map((item: CustomerModel) => {
                                  return {
                                    label: item.name,
                                    value: item.id,
                                    phoneNumber: item.phoneNumber,
                                    debtAmount: item.debtAmount,
                                  };
                                })) ||
                              (entityTypeCode === 'supplier' &&
                                supplierFacade.pagination?.content.map((item: NhaCungCapModel) => {
                                  return {
                                    label: item.name,
                                    value: item.id,
                                    phoneNumber: item.phoneNumber,
                                    debtAmount: item.totalDebtAmount,
                                  };
                                })) ||
                              (entityTypeCode === 'employee' &&
                                userFacade.pagination?.content.map((item) => {
                                  return {
                                    label: item.name,
                                    value: item.id,
                                    phoneNumber: item.phoneNumber,
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
                              </div>
                            )}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    {/* Loại phiếu chi */}
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
                          placeholder="Chọn loại phiếu chi"
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          options={codeTypeFacade?.expenditurePurposes?.content
                            ?.filter((item: CodeTypeModel) => item.code !== 'auto_payment') // Ẩn option có code 'auto_payment'
                            .map((item: CodeTypeModel) => ({
                              value: item.code,
                              label: item.title,
                            }))}
                        /> */}
                        <TreeSelect
                          placeholder="Chọn loại phiếu chi"
                          allowClear
                          showSearch
                          treeDefaultExpandAll
                          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                          treeData={codeTypeFacade?.expenditurePurposes?.content
                            ?.filter((item: CodeTypeManagement) => item.code !== 'auto_payment') // Ẩn option có code 'auto_receipt'
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
                              Mã phiếu chi không trùng lặp. Nếu để trống mã phiếu tự sinh với tiền tố{' '}
                              <strong>PVN</strong>
                            </div>
                          ),
                          icon: <InfoCircleTwoTone />,
                          color: 'white',
                        }}
                      >
                        <Input placeholder={'Nhập mã phiếu chi'} />
                      </Form.Item>
                    </Col>
                    {/* Mô tả */}
                    <Col span={24}>
                      <Form.Item label="Mô tả" name={'description'}>
                        <TextArea rows={3} placeholder={'Nhập mô tả'} />
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
                      <Form.Item label="Tài khoản" name={'accountId'}>
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
                    {/* Thay đổi công nợ đối tượng nhận */}
                    {entityTypeCode == 'customer' || entityTypeCode == 'supplier' ? (
                      <Col span={24}>
                        <Form.Item className={'mb-0'} name={'isDebt'} valuePropName="checked">
                          <Checkbox disabled={entityTypeCode == 'customer' && entityTypeCode == 'supplier'}>
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
                  </Row>
                </Card>
              </Col>

              <Col span={7}>
                <Card title="Thông tin bổ sung">
                  <Row gutter={0}>
                    {/* Ngày chi */}
                    <Col span={24}>
                      <Form.Item label="Ngày chi" name={'receiptDate'}>
                        <DatePicker
                          className={'w-full'}
                          placeholder="Chọn ngày chi"
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
                    {/* Công trình/Dự án */}
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
                            paymentCreateForm.setFieldsValue({ contractId: undefined });
                            contractFacade.get({
                              size: -1,
                              filter: JSON.stringify({
                                constructionId: value,
                                statusCodes: ['NEW', 'IN_PROGRESS', 'COMPLETED'],
                              }),
                            });
                            advanceRequestFacade.get({ filter: JSON.stringify({ constructionId: value }) });
                          }}
                        />
                      </Form.Item>
                    </Col>
                    {/* Hợp đồng/Phụ lục */}
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
                    {/* Yêu cầu tạm ứng */}
                    <Col span={24}>
                      <Form.Item label={'Yêu cầu tạm ứng'} name={'advanceRequestId'}>
                        <Select
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
                            paymentCreateForm.setFieldsValue({
                              entityTypeCode: 'employee',
                              entityId: option?.createdByUserId,
                              amount: option?.totalAmount,
                              description: option?.label,
                            });
                          }}
                        />
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

export default PaymentVoucherPage;
