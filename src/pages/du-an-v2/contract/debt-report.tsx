import { CaretDownOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { EStatusState, QueryParams } from '@models';
import { InputSearch } from '@pages/shared-directory/input-search';
import { ContractFacade, ContractModel } from '@store';
import { lang, routerLinks, uuidv4 } from '@utils';
import {
  Button,
  Card,
  Checkbox,
  Col,
  ConfigProvider,
  Flex,
  Form,
  InputNumber,
  Popover,
  Row,
  Select,
  Space,
  Table,
  TableColumnsType,
  Tag,
  Typography,
} from 'antd';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatCurrency } from './form';

export default function Page() {
  const contractFacade = ContractFacade();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    page,
    size,
    filter = '{}',
    sort = '',
    id = '',
  } = {
    ...Object.fromEntries(searchParams),
    page: Number(searchParams.get('page') || 1),
    size: Number(searchParams.get('size') || 20),
  };
  const [debtSearchForm] = Form.useForm();
  const parsedFilter = JSON.parse(filter);
  const groupBy: string = parsedFilter?.groupBy || 'contract';

  const onChangeDataTable = (props: { query?: QueryParams; setKeyState?: object }) => {
    if (!props.query) {
      props.query = {
        page,
        size,
        filter,
        sort,
        id,
      };
    }
    const fillQuery: QueryParams = { ...contractFacade.query, ...props.query };
    fillQuery.filter = JSON.stringify({
      ...JSON.parse(fillQuery.filter || '{}'),
      positive: debtSearchForm.getFieldValue('positive') ?? true,
    });
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    contractFacade.getDebtReport(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    contractFacade.set({ query: props.query, ...props.setKeyState });
  };

  useEffect(() => {
    onChangeDataTable({});
  }, []);

  useEffect(() => {
    switch (contractFacade.status) {
      case EStatusState.deleteFulfilled:
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        onChangeDataTable({});
        break;
    }
  }, [contractFacade.status]);

  const columns: TableColumnsType<ContractModel> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      align: 'center',
      width: 60,
    },
    {
      title: groupBy === 'contract' ? 'Mã hợp đồng' : groupBy === 'project' ? 'Mã dự án' : 'Mã chủ đầu tư',
      dataIndex: 'code',
      width: 165,
      fixed: 'left',
      render: (value, record) =>
        groupBy === 'contract' ? (
          <Link className="font-medium" to={`/${lang}${routerLinks('Contract')}/${record?.id}`}>
            {value}
          </Link>
        ) : groupBy === 'project' ? (
          <Link
            className="font-medium"
            to={`/${lang}${routerLinks('Construction')}/${record?.id}/construction-monitor`}
          >
            {value}
          </Link>
        ) : (
          value
        ),
    },
    {
      title: groupBy === 'contract' || groupBy === 'project' ? 'Tên dự án' : 'Tên chủ đầu tư',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      render: (value, record) =>
        groupBy === 'contract' ? (
          <Link
            className="font-medium"
            to={`/${lang}${routerLinks('Construction')}/${record?.construction?.id}/construction-monitor`}
          >
            {value}
          </Link>
        ) : (
          value
        ),
    },
    {
      title: 'Loại chủ đầu tư',
      dataIndex: 'investorTypeName',
      width: 200,
      ellipsis: true,
      hidden: groupBy !== 'investor',
    },
    {
      title: 'GT nghiệm thu (trước VAT)',
      dataIndex: 'acceptanceValueBeforeVatAmount',
      align: 'right',
      width: 190,
      render: (value) => formatCurrency(value),
    },
    {
      title: 'GT đã xuất hóa đơn',
      dataIndex: 'paidAmount',
      align: 'right',
      width: 150,
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Giá trị còn lại',
      align: 'right',
      width: 150,
      render: (value, record) =>
        formatCurrency(Number(record.acceptanceValueBeforeVatAmount) - Number(record?.paidAmount)),
    },
  ];

  const onChangeSearch = (value: string) => {
    if (value) {
      parsedFilter.fullTextSearch = value;
    } else {
      delete parsedFilter.fullTextSearch;
    }
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...parsedFilter }),
      },
    });
  };
  const onFinish = (values: any) => {
    if (values.minClosingDebt) {
      parsedFilter.minClosingDebt = values.minClosingDebt;
    } else {
      delete parsedFilter.minClosingDebt;
    }

    if (values.maxClosingDebt) {
      parsedFilter.maxClosingDebt = values.maxClosingDebt;
    } else {
      delete parsedFilter.maxClosingDebt;
    }

    if (values.positive) {
      parsedFilter.positive = values.positive;
    } else {
      delete parsedFilter.positive;
    }
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...parsedFilter }),
      },
    });
  };
  let valuesClosingDebt: string = 'Khác 0';
  const minClosingDebtValue = debtSearchForm.getFieldValue('minClosingDebt');
  const maxClosingDebtValue = debtSearchForm.getFieldValue('maxClosingDebt');
  const positiveValue = debtSearchForm.getFieldValue('positive') ?? true;

  const titleTag = (minClosingDebtValue: number, maxClosingDebtValue: number, positiveValue: boolean) => {
    if (positiveValue) {
      valuesClosingDebt = 'Khác 0';
    }

    if (minClosingDebtValue && maxClosingDebtValue) {
      valuesClosingDebt = `${minClosingDebtValue?.toLocaleString()} - ${maxClosingDebtValue?.toLocaleString()}`;
    }

    if (minClosingDebtValue && !maxClosingDebtValue) {
      valuesClosingDebt = `${minClosingDebtValue?.toLocaleString()} - không giới hạn`;
    }

    if (!minClosingDebtValue && maxClosingDebtValue) {
      valuesClosingDebt = `0 - ${maxClosingDebtValue?.toLocaleString()}`;
    }

    return valuesClosingDebt;
  };
  const handleCloseTag = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    debtSearchForm.setFieldsValue({
      minClosingDebt: undefined,
      maxClosingDebt: undefined,
      positive: false,
    });
    delete parsedFilter.minClosingDebt;
    delete parsedFilter.maxClosingDebt;
    delete parsedFilter.positive;
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...parsedFilter }),
      },
    });
  };
  return (
    <>
      <div className="m-4 intro-x">
        <Flex align="center" gap="small" className="mb-3" justify="space-between">
          <Space>
            <Typography.Text>Báo cáo công nợ theo</Typography.Text>
            <Select
              className="w-32"
              defaultValue={parsedFilter?.groupBy || 'contract'}
              options={[
                { value: 'contract', label: 'Hợp đồng' },
                { value: 'project', label: 'Dự án' },
                { value: 'investor', label: 'Chủ đầu tư' },
              ]}
              onChange={(value) => {
                parsedFilter.groupBy = value;
                onChangeDataTable({
                  query: {
                    page: 1,
                    size,
                    filter: JSON.stringify({ ...parsedFilter }),
                  },
                });
              }}
            ></Select>
          </Space>
          <Typography.Text italic={true} className="font-light">
            Đơn vị: VND
          </Typography.Text>
        </Flex>
        <Card size="small" variant="borderless">
          <div className="mb-2.5">
            <Flex gap={16}>
              <InputSearch
                defaultValue={parsedFilter?.fullTextSearch}
                callback={onChangeSearch}
                placeholder={`Tìm kiếm theo ${groupBy === 'contract' ? 'mã hợp đồng, tên dự án' : groupBy === 'project' ? 'mã, tên dự án' : 'mã, tên chủ đầu tư, loại chủ đầu tư'}`}
              />
              <Space size={16}>
                <Popover
                  content={
                    <div className="w-[350px]">
                      <Form
                        form={debtSearchForm}
                        initialValues={{
                          positive: true,
                        }}
                        onFinish={onFinish}
                      >
                        <Row gutter={[0, 0]}>
                          <Col span={11}>
                            <Form.Item
                              className="mb-0"
                              name={'minClosingDebt'}
                              rules={[
                                {
                                  validator: (_, value) =>
                                    value && debtSearchForm.getFieldValue('maxClosingDebt') < value
                                      ? Promise.reject('Giá trị không đúng định dạng')
                                      : Promise.resolve(),
                                },
                              ]}
                            >
                              <InputNumber
                                className="w-full text-right"
                                placeholder="Nhập giá trị"
                                controls={false}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                                onChange={(minClosingDebt) => {
                                  if (minClosingDebt) {
                                    debtSearchForm.setFieldsValue({ positive: false });
                                  }
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <span className="flex justify-center items-center text-gray-400">-</span>
                          </Col>
                          <Col span={11}>
                            <Form.Item
                              className="mb-0"
                              name={'maxClosingDebt'}
                              rules={[
                                {
                                  validator: (_, value) =>
                                    value && debtSearchForm.getFieldValue('minClosingDebt') > value
                                      ? Promise.reject('Giá trị không đúng định dạng')
                                      : Promise.resolve(),
                                },
                              ]}
                            >
                              <InputNumber
                                className="w-full text-right"
                                placeholder="Nhập giá trị"
                                controls={false}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                                onChange={(maxClosingDebt) => {
                                  if (maxClosingDebt) {
                                    debtSearchForm.setFieldsValue({ positive: false });
                                  }
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={24}>
                            <Form.Item className="mb-0 pt-3" name={'positive'} valuePropName="checked">
                              <Checkbox
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    debtSearchForm.setFieldsValue({
                                      minClosingDebt: undefined,
                                      maxClosingDebt: undefined,
                                    });
                                  }
                                }}
                              >
                                Giá trị còn lại khác 0
                              </Checkbox>
                            </Form.Item>
                          </Col>
                          <Col className="pt-3" span={24}>
                            <Button className="w-full" type="primary" onClick={debtSearchForm.submit}>
                              Lọc
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  }
                  trigger={'click'}
                >
                  <Button icon={<CaretDownOutlined />} iconPosition="end">
                    Giá trị còn lại
                  </Button>
                </Popover>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() =>
                    onChangeDataTable({
                      query: {
                        page: 1,
                        size,
                        filter: JSON.stringify({ ...parsedFilter }),
                      },
                    })
                  }
                >
                  Tải lại
                </Button>
              </Space>
            </Flex>
            <Tag
              hidden={!minClosingDebtValue && !maxClosingDebtValue && !positiveValue}
              className={`rounded-full mt-2.5 py-0.5`}
              color="#E6F4FF"
              onClose={handleCloseTag}
              closeIcon={<CloseOutlined className="p-0.5 rounded hover:bg-slate-200" style={{ color: '#1890ff' }} />}
            >
              <span className="text-black text-[14px] pl-0.5">
                Giá trị còn lại: {titleTag(minClosingDebtValue, maxClosingDebtValue, positiveValue)}
              </span>
            </Tag>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: '#283081',
                  colorTextHeading: '#fff',
                  colorIcon: '#fff',
                  headerSortHoverBg: '#283081',
                  headerSortActiveBg: '#283081',
                },
              },
            }}
          >
            <Table<ContractModel>
              loading={contractFacade.isLoading}
              size="small"
              dataSource={contractFacade.paginationDebtReport?.content.map((item, index) => ({
                ...item,
                id: item?.id || uuidv4(),
                stt: (Number(page ?? 0) - 1) * Number(size) + index + 1,
              }))}
              columns={columns}
              rowKey="id"
              scroll={{ x: 'max-content', y: 'calc(100vh - 330px)' }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: [10, 20, 50, 100],
                total: contractFacade.paginationDebtReport?.totalElements,
                current: page,
                pageSize: size,
                showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
                onChange: (page, size) => {
                  onChangeDataTable({
                    query: {
                      page,
                      size,
                      filter: JSON.stringify({ ...parsedFilter }),
                    },
                  });
                },
              }}
            />
          </ConfigProvider>
        </Card>
      </div>
    </>
  );
}
