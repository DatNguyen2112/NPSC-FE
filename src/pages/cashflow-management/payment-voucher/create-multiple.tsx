import { lang, routerLinks, uuidv4 } from '@utils';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Avatar,
  Button,
  Card, Checkbox,
  Col,
  DatePicker,
  Form, Image,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Table, Tooltip,

} from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  CodeTypeFacade,
  CodeTypeModel,
  ProjectFacade,
  CustomerFacade,
  CustomerModel,
  NhaCungCapFacade,
  NhaCungCapModel,
  CashbookTransactionFacade,
  ContractFacade,
  ConstructionFacade, CashbookTransactionCreateModel, EStatusThuChi, AdvanceRequestFacade, UserFacade,
} from '@store';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import { Upload } from '@core/upload';
import { Link } from 'react-router-dom'; // Import tiếng Việt cho dayjs
const { TextArea } = Input;

const PaymentCreateMultiplePage = () => {
  const [paymentForm] = Form.useForm();
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const customerFacade = CustomerFacade();
  const supplierFacade = NhaCungCapFacade();
  const codeTypeFacade = CodeTypeFacade();
  const projectFacade = ProjectFacade();
  const contractFacade = ContractFacade();
  const constructionFacade = ConstructionFacade();
  const userFacade = UserFacade();
  const navigate = useNavigate();
  const location = useLocation();
  const advanceRequestFacade = AdvanceRequestFacade();
  const constructionId = Form.useWatch('constructionId', paymentForm);

  useEffect(() => {
    cashBookTransactionFacade.set({ valueEntityTypeCode: 'customer', placeholderEntityId: 'Chọn khách hàng' });
    supplierFacade.get({ size: -1 });
    codeTypeFacade.getExpenditurePurposes({ size: -1 });
    codeTypeFacade.getPaymentMethods({ size: -1 });
    codeTypeFacade.getEntityGroup({ size: -1 });
    projectFacade.get({ size: -1 });
    advanceRequestFacade.get({ size: -1 });
    userFacade.get({ size: -1 });
    contractFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NEW', 'IN_PROGRESS', 'COMPLETED'] }) });
    if (location.state) {
      paymentForm.setFieldsValue(location.state);
    }
    constructionFacade.get({ size: -1, filter: JSON.stringify({ statusCodes: ['NOW', 'INPROGRESS', 'COMPLETED'] }) });
    paymentForm.setFieldsValue({
      listCashbookTransaction: [
        {
          key: '1',
          entityTypeCode: 'supplier',
          isDebt: true,
        },
      ],
    });
  }, []);

  useEffect(() => {
    switch (cashBookTransactionFacade.status) {
      case EStatusThuChi.createMultipleFulfilled:
        onCancel();
        cashBookTransactionFacade.get({ filter: JSON.stringify({ transactionTypeCode: 'CHI' }) ?? '{}' });
        break;
    }
  }, [cashBookTransactionFacade.status]);

  useEffect(() => {
    if (cashBookTransactionFacade.dataCashbookTransaction) {
      cashBookTransactionFacade.set({
        valueEntityTypeCode: cashBookTransactionFacade.dataCashbookTransaction.payerGroup,
      });
      paymentForm.setFieldValue('entityTypeCode', cashBookTransactionFacade.dataCashbookTransaction.payerGroup);
      paymentForm.setFieldValue('entityId', cashBookTransactionFacade.dataCashbookTransaction.id);
    }
  }, [cashBookTransactionFacade.dataCashbookTransaction]);

  //Handle cancel button
  const onCancel = () => {
    navigate(`/${lang}${routerLinks('ChiPhi')}`);
  };
  const entityTypeCode = paymentForm.getFieldValue('listCashbookTransaction');

  const onFinish = (values: CashbookTransactionCreateModel) => {
    let listCashbookTransaction = values.listCashbookTransaction;
    listCashbookTransaction = listCashbookTransaction.map((items: any, index: number) => (
      {
        ...items,
        code: items.code !== null && items.code !== "" ? items.code : undefined,
        entityId: items.entityId,
        transactionTypeCode: 'CHI',
        receiptDate: dayjs(items.receiptDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        entityName:
          items.entityTypeCode === 'customer' && customerFacade.pagination?.content.find((item) => item.id === items.entityId)?.name
          || items.entityTypeCode === 'supplier' && supplierFacade.pagination?.content.find((item) => item.id === items.entityId)?.name
          || items.entityTypeCode === 'employee' && userFacade.pagination?.content.find((item) => item.id === items.entityId)?.name
          || items.entityName,
        entityTypeName: codeTypeFacade.entityGroup?.content?.find((item: CodeTypeModel) => item?.code === items.entityTypeCode)?.title,
        entityCode: items.entityTypeCode === 'customer' && customerFacade.pagination?.content.find((item) => item.id === items.entityId)?.code
          || items.entityTypeCode === 'supplier' && supplierFacade.pagination?.content.find((item) => item.id === items.entityId)?.code
          || entityTypeCode[index].entityTypeCode
      }
    ));

    const paymentVoucherData: CashbookTransactionCreateModel = {
      listCashbookTransaction: listCashbookTransaction,
      constructionId: values.constructionId,
      contractId: values.contractId,
    };
    if (values) {
      cashBookTransactionFacade.createMultiple(paymentVoucherData);
    }
  };

  const handleAdd = () => {
    const listCashbookTransaction = paymentForm.getFieldValue('listCashbookTransaction');
    listCashbookTransaction.push({
      key: uuidv4(),
      entityTypeCode: 'supplier',
      // isDebt: true,
    });
    paymentForm.setFieldsValue({
      listCashbookTransaction: listCashbookTransaction,
    });
  };


  return (
    <>
      <Spin spinning={cashBookTransactionFacade.isFormLoading}>
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            Quay lại danh sách phiếu chi
          </Button>
          <Space className={'pr-4'}>
            <Button type={'default'} danger onClick={() => navigate(`/${lang}${routerLinks('PhieuThu')}`)}>
              Thoát
            </Button>
            <Button type={'primary'} className={'font-medium'} onClick={paymentForm.submit}>
              Lưu
            </Button>
          </Space>
        </div>
        <div className="max-w-8xl mx-auto py-6 px-8">
          <Form
            form={paymentForm}
            layout="vertical"
            initialValues={{
              entityTypeCode: 'supplier',
              paymentMethodCode: 'cash',
            }}
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col span={24}>
                {/* Thông tin chung */}
                <Card title="Thông tin dự án">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label={'Tên công trình/dự án'} name={'constructionId'}>
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
                            paymentForm.setFieldsValue({ contractId: undefined });
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
                    {/*<Col span={12}>*/}
                    {/*  <Form.Item label={'Tên hợp đồng/phụ lục'} name={'contractId'}>*/}
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

                  </Row>
                </Card>
                {/* Thông tin ghi nhận */}
                <Card title="Thông tin phiếu chi" className="mt-4">
                  <Form.List name="listCashbookTransaction">
                    {(salesOrderItem, { add, remove }) => {
                      return (
                        <>
                          <Table
                            className={'custom-table'}
                            size="small"
                            dataSource={salesOrderItem}
                            pagination={false}
                            scroll={{ x: 400 }}
                          >
                            <Table.Column
                              className="!p-0.5"
                              title={'#'}
                              align={'center'}
                              width={40}
                              render={(_, __, index) => (
                                <>
                                  <p>{index + 1}</p> <p className="h-3" />
                                </>
                              )}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={<div className={'flex items-center gap-1'}>
                                <p>Mã phiếu</p>
                                <Tooltip
                                  placement="top"
                                  trigger={'hover'}
                                  title={`Mã phiếu thu không trùng lặp. Nếu để trống mã phiếu tự sinh với tiền tố PVN`}>
                                  <InfoCircleOutlined className={'text-blue-500'} />
                                </Tooltip>
                              </div>}
                              align="center"
                              width={180}
                              dataIndex={'code'}
                              render={(attachmentUrl: string, record, index: number) => {
                                return (
                                  <Form.Item name={[index, 'code']}>
                                    <Input placeholder={'Nhập mã phiếu'} />
                                  </Form.Item>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={<div className={'flex gap-1'}>
                                <p className={'text-red-500'}>*</p>
                                <p>Nhóm người nhận</p>
                              </div>}
                              dataIndex={'entityTypeCode'}
                              width={200}
                              render={(_, _record: any, index: number) => {
                                return (
                                  <>
                                    <Form.Item rules={[{ required: true }]} name={[index, 'entityTypeCode']}>
                                      <Select
                                        placeholder="Chọn nhóm người nhận"
                                        showSearch
                                        optionFilterProp={'label'}
                                        options={codeTypeFacade.entityGroup?.content?.map((item: CodeTypeModel) => ({
                                          label: item.title,
                                          value: item.code,
                                        }))}
                                        onChange={(value) => {
                                          paymentForm.setFieldsValue({ entityId: undefined });
                                          if (entityTypeCode[index]) {
                                            entityTypeCode[index].entityTypeCode = value;
                                          }
                                          paymentForm.setFieldsValue({
                                            listCashbookTransaction: entityTypeCode,
                                          });

                                          cashBookTransactionFacade.set({
                                            valueEntityTypeCode: value,
                                          });
                                          // Get list customer or supplier
                                          if (value === 'customer') {
                                            customerFacade.get({ size: -1 });
                                            cashBookTransactionFacade.set({ placeholderEntityId: 'Chọn khách hàng' });
                                          }
                                          if (value === 'supplier') {
                                            supplierFacade.get({ size: -1 });
                                            cashBookTransactionFacade.set({ placeholderEntityId: 'Chọn nhà cung cấp' });
                                          }
                                        }}
                                      />
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.6"
                              title={<div className={'flex gap-1'}>
                                <p className={'text-red-500'}>*</p>
                                <p>Tên người nhận</p>
                              </div>}
                              dataIndex={'entityTypeName'}
                              width={256}
                              render={(_, _record: any, index: number) => {
                                console.log( entityTypeCode[index]?.entityTypeCode);
                                return (
                                  <>
                                    <Form.Item
                                      rules={[{ required: true }]}
                                      name={entityTypeCode[index]?.entityTypeCode === 'others' ? [index, 'entityName'] : [index, 'entityId']}
                                    >
                                      {entityTypeCode[index]?.entityTypeCode === 'others' ? (
                                        <Input placeholder="Nhập tên người nộp" />

                                      ) : (
                                        <Select
                                        placeholder={
                                        entityTypeCode[index]?.entityTypeCode === 'customer' && 'Chọn khách hàng'
                                        || entityTypeCode[index]?.entityTypeCode === 'supplier' && 'Chọn nhà cung cấp'
                                        || entityTypeCode[index]?.entityTypeCode === 'employee' && 'Chọn nhân viên'
                                        || 'Chọn người nộp'
                                      }
                                      allowClear
                                      showSearch
                                      optionFilterProp={'children'}
                                      options={
                                        // Get list customer or supplier
                                        entityTypeCode[index]?.entityTypeCode === 'customer' && customerFacade.pagination?.content.map((item: CustomerModel) => {
                                            return {
                                              label: item.name,
                                              value: item.id,
                                              phoneNumber: item.phoneNumber,
                                              debtAmount: item.debtAmount,
                                            };
                                          })
                                        || entityTypeCode[index]?.entityTypeCode === 'supplier' && supplierFacade.pagination?.content.map((item: NhaCungCapModel) => {
                                            return {
                                              label: item.name,
                                              value: item.id,
                                              phoneNumber: item.phoneNumber,
                                              debtAmount: item.totalDebtAmount,
                                            };
                                          })
                                        || entityTypeCode[index]?.entityTypeCode === 'employee' && userFacade.pagination?.content.map((item) => {
                                          return {
                                            label: item.name,
                                            value: item.id,
                                            phoneNumber: item.phoneNumber,
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
                                              <span
                                                className="max-w-40 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                      {option.data.phoneNumber}
                                    </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    />
                                      )}
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.6"
                              title={<div className={'flex gap-1'}>
                                <p className={'text-red-500'}>*</p>
                                <p>Loại phiếu chi</p>
                              </div>}
                              dataIndex={'purposeCode'}
                              width={256}
                              render={(_, _record: any, index: number) => {
                                return (
                                  <>
                                    <Form.Item
                                      name={[index, 'purposeCode']}
                                      rules={[
                                        {
                                          required: true,
                                          message: <span
                                            className={'text-sm]'}>Loại phiếu chí không được để trống</span>,
                                        },
                                      ]}
                                    >
                                      <Select
                                        placeholder="Chọn loại phiếu chi"
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={codeTypeFacade?.expenditurePurposes?.content?.map((item: CodeTypeModel) => ({
                                          value: item.code,
                                          label: item.title,
                                        }))}
                                      />
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              title={<div className={'flex gap-1'}>
                                <p>Giá trị(VND)</p>
                                <p className={'text-red-500'}>*</p>
                              </div>}
                              dataIndex={'amount'}
                              width={160}
                              render={(_, _record: any, index: number) => {
                                return (
                                  <>
                                    <Form.Item
                                      name={[index, 'amount']}
                                      rules={[
                                        {
                                          required: true,
                                          message: <span className={'text-sm'}>Giá trị phải lớn hơn 0</span>,
                                        },
                                      ]}
                                    >
                                      <InputNumber
                                        className="w-full text-right"
                                        min={0}
                                        placeholder={'Nhập giá trị'}
                                        controls={false}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                      />
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              title={'Yêu cầu tạm ứng'}
                              dataIndex={'advanceRequestId'}
                              width={160}
                              render={(_, _record: any, index: number) => {

                                return (
                                  <>
                                    <Form.Item name={[index, 'advanceRequestId']}>
                                      <Select
                                        placeholder={'Chọn yêu cầu tạm ứng '}
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={advanceRequestFacade.pagination?.content?.map((item) => ({
                                          label: `${item.code} - ${item.content}`,
                                          value: item.id,
                                        }))}
                                      />
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Ngày chi'}
                              dataIndex={'receiptDate'}
                              width={160}
                              render={(_, _record: any, index: number) => {
                                return (
                                  <>
                                    <Form.Item
                                      name={[index, 'receiptDate']}
                                    >
                                      <DatePicker format={'DD-MM-YYYY'} />
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Hình thức thanh toán'}
                              dataIndex={'paymentMethodCode'}
                              width={160}
                              render={(_, _record: any, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'paymentMethodCode']}>
                                      <Select
                                        defaultValue={'cash'}
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
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              title={'Mô tả'}
                              dataIndex={'note'}
                              width={160}
                              render={(_, _record: any, index: number) =>
                                <Form.Item name={[index, 'description']}>
                                  <TextArea
                                    className={'!h-8'}
                                    placeholder={'Nhập mô tả'}
                                  />
                                </Form.Item>}
                            />
                            <Table.Column
                              title={'Tham chiếu'}
                              dataIndex={'reference'}
                              width={150}
                              render={(_, _record: any, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'reference']}>
                                      <Input placeholder={'Nhập tham chiếu'} />
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              title={'File chứng từ'}
                              dataIndex={'reference'}
                              width={150}
                              render={(_, _record: any, index: number) => {
                                return (
                                  <>
                                    <Form.Item name={[index, 'attachments']}>
                                      <Upload
                                        renderContent={(file, handleDeleteFile) =>
                                          <div className={'flex gap-2 items-center text-center'}>
                                            <div className={'flex items-center'}>
                                              <Image
                                                src={
                                                  file?.fileName?.endsWith("docx") && '/assets/svgs/word.svg'
                                                  || file?.fileType === 'IMAGE' && '/assets/svgs/photo-image.svg'
                                                  || file?.fileName?.endsWith(".pdf") && '/assets/svgs/pdf.svg'
                                                  || ''
                                                }
                                                alt={'img'}
                                                width={20}
                                                height={20}
                                              />
                                            </div>
                                            <Link className={'text-base w-28 line-clamp-1'} to={file?.fileUrl ? file?.fileUrl : ''}>{file?.fileName}</Link>
                                            <Button
                                              type={'text'}
                                              icon={<DeleteOutlined className={'text-red-500'} />}
                                              onClick={() => handleDeleteFile && file ? handleDeleteFile(file) : {}}
                                            />
                                          </div>
                                      }
                                        showBtnDelete={() => false}
                                        accept={'/*'}
                                        multiple={false}
                                        action={'attach'} />
                                    </Form.Item>
                                  </>
                                );
                              }}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={
                                <div className={'flex gap-1 justify-center'}>
                                  <p>Công nợ</p>
                                  <Tooltip
                                    trigger={'hover'}
                                    title={
                                      <p className="text-sm">
                                        Nếu không chọn, giá trị của phiếu chi không được tính vào công nợ của đối tượng
                                        nhận.
                                      </p>
                                    }
                                  >
                                    <InfoCircleOutlined className={'text-blue-500'} />
                                  </Tooltip>
                                </div>}
                              dataIndex={'isDebt'}
                              width={100}
                              align={'center'}
                              render={(_value, _record, index) => (
                                entityTypeCode[index]?.entityTypeCode === 'supplier' || entityTypeCode[index]?.entityTypeCode === 'customer' ?
                                  (<Form.Item name={[index, 'isDebt']} valuePropName={'checked'} initialValue={true}>
                                      <Checkbox />
                                    </Form.Item>
                                  )
                                  :  (
                                  <Form.Item name={[index, 'isDebt']} valuePropName={'checked'} initialValue={false}>
                                    <Checkbox defaultChecked={false} disabled={true} checked={true} />
                                  </Form.Item>
                                  )
                              )}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Thao tác'}
                              width={100}
                              align={'center'}
                              fixed={'right'}
                              render={(_value, record) =>
                                <Button
                                  onClick={() => remove(record.name)}
                                  type={'text'}
                                  danger
                                  icon={<CloseOutlined />}
                                />
                              }
                            />
                          </Table>
                        </>
                      );
                    }}
                  </Form.List>
                  <div className={'py-2'}>
                    <Button onClick={handleAdd} icon={<PlusOutlined />} type={'primary'}>Thêm dòng</Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      </Spin>
    </>
  );
};

export default PaymentCreateMultiplePage;
