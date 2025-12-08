import { CaretDownOutlined, CloseOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { DebtReportFilter, DebtTransactionFacade, DebtTransactionReport } from '@store';
import { lang, routerLinks, scrollLeftWhenChanging, scrollTopWhenChanging } from '@utils';
import {
  Button,
  Checkbox,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  InputNumber,
  Pagination,
  Popover,
  Row,
  Spin,
  Table,
  Tag,
  theme,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import tiếng Việt cho dayjs
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CustomerDebtGlossary from './CustomerDebtGlossary';
import CustomerDebtMinusModal from './CustomerDebtMinusModal';
import CustomerDebtPositiveModal from './CustomerDebtPositiveModal';

const { useToken } = theme;
const { RangePicker } = DatePicker;

const CustomerDebtReport: React.FC = () => {
  const debtTransactionFacade = DebtTransactionFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customerDebtForm] = Form.useForm();
  const { token } = useToken();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const navigate = useNavigate();

  let fillQuery: QueryParams;
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');
  const minClosingDebt = dayjs().subtract(1, 'month').add(1, 'day').startOf('day').format('YYYY-MM-DD'); // Ngày mai của tháng trước
  const maxClosingDebt = dayjs().endOf('day').format('YYYY-MM-DD'); // Ngày hiện tại
  let currentFilter: DebtReportFilter;
  currentFilter = {
    dateRange: [minClosingDebt, maxClosingDebt],
    entityType: 'customer',
    positive: true,
  };

  useEffect(() => {
    debtTransactionFacade.getReport({
      filter: JSON.stringify(currentFilter),
    });

    setSearchParams(
      new URLSearchParams({
        page: page || '1',
        size: size || '20',
        filter: filter || JSON.stringify(currentFilter),
      }).toString(),
    );
  }, []);

  const debtReportData = debtTransactionFacade.debtList?.content?.map((item: DebtTransactionReport, index: number) => {
    return {
      ...item,
      lineNumber: index + 1,
    };
  });

  const onFinish = (values: DebtReportFilter) => {
    currentFilter = JSON.parse(filter || '{}');
    if (values.minClosingDebt) {
      currentFilter.minClosingDebt = values.minClosingDebt;
    } else {
      delete currentFilter.minClosingDebt;
    }

    if (values.maxClosingDebt) {
      currentFilter.maxClosingDebt = values.maxClosingDebt;
    } else {
      delete currentFilter.maxClosingDebt;
    }

    if (values.positive) {
      currentFilter.positive = values.positive;
    } else {
      delete currentFilter.positive;
    }

    fillQuery = {
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query: fillQuery });
  };

  // Change Data Table
  const onChangeDataTable = (props: { query?: QueryParams; setKeyState?: object }) => {
    // eslint-disable-next-line react/prop-types
    if (!props.query) {
      props.query = {
        page: Number(page),
        size: Number(size),
        filter: filter ?? '',
        sort: sort ?? '',
      };
    }
    // eslint-disable-next-line react/prop-types
    fillQuery = { ...debtTransactionFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    debtTransactionFacade.getReport(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>)?.toString() },
      { replace: true },
    );
    // eslint-disable-next-line react/prop-types
    debtTransactionFacade.set({ query: props.query, ...props.setKeyState });
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (!dates) {
      currentFilter = JSON.parse(
        filter ||
          JSON.stringify({
            dateRange: [minClosingDebt, maxClosingDebt],
            entityType: 'customer',
          }),
      );
      delete currentFilter.dateRange;
    } else {
      currentFilter = JSON.parse(filter || '{}');
      currentFilter.dateRange = [dayjs(dates[0]).format('YYYY-MM-DD'), dayjs(dates[1]).format('YYYY-MM-DD')];
    }
    //query
    fillQuery = {
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query: fillQuery });
  };

  const onChangeSearch = (value: string) => {
    if (filter) {
      currentFilter = JSON.parse(filter);
      currentFilter.fullTextSearch = value;
      const query: QueryParams = {
        page: page ? Number(page) : 1,
        size: size ? Number(size) : 20,
        filter: JSON.stringify(currentFilter),
      };
      onChangeDataTable({ query });
    } else {
      onChangeDataTable({
        query: {
          page: 1,
          size: 20,
          filter: JSON.stringify({ fullTextSearch: value }),
        },
      });
    }
  };

  let valuesClosingDebt: string = 'Khác 0';
  const minClosingDebtValue = customerDebtForm.getFieldValue('minClosingDebt');
  const maxClosingDebtValue = customerDebtForm.getFieldValue('maxClosingDebt');
  const positiveValue = customerDebtForm.getFieldValue('positive') ?? true;

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
      valuesClosingDebt = `${maxClosingDebtValue?.toLocaleString()} - không giới hạn`;
    }

    return valuesClosingDebt;
  };

  const handleCloseTag = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    currentFilter = JSON.parse(filter || '{}');
    delete currentFilter.minClosingDebt;
    delete currentFilter.maxClosingDebt;
    delete currentFilter.positive;
    fillQuery = {
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query: fillQuery });

    customerDebtForm.setFieldsValue({
      minClosingDebt: undefined,
      maxClosingDebt: undefined,
      positive: false,
    });
  };

  const columns: ColumnsType<DebtTransactionReport> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 65,
      align: 'center',
    },
    {
      title: 'Mã khách hàng',
      dataIndex: 'entityCode',
      key: 'entityCode',
      width: 224,
      render: (entityCode: string, record) => (
        <Link
          to={{
            pathname: `/${lang}${routerLinks('KhachHang')}/${record.entityId}/view-detail`,
            search: `?entityCode=${entityCode}`,
          }}
          target="_blank"
        >
          {entityCode}
        </Link>
      ),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'entityName',
      key: 'entityName',
      width: 224,
    },
    {
      title: 'Nợ đầu kỳ',
      dataIndex: 'openingDebt',
      key: 'openingDebt',
      width: 224,
      align: 'right',
      render: (openingDebt: number) => <span>{openingDebt?.toLocaleString()}</span>,
    },
    {
      title: 'Nợ tăng trong kỳ',
      dataIndex: 'debtIncrease',
      key: 'debtIncrease',
      width: 238,
      align: 'right',
      render: (debtIncrease: number, record) => {
        return (
          <>
            {debtIncrease > 0 ? (
              <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={() => {
                  debtTransactionFacade.set({
                    isDebtReportModalPositiveCustomerVisible: true,
                    customerId: record.entityId,
                  });
                }}
              >
                {debtIncrease?.toLocaleString()}
              </span>
            ) : (
              <span>{debtIncrease?.toLocaleString()}</span>
            )}
          </>
        );
      },
    },
    {
      title: 'Nợ giảm trong kỳ',
      dataIndex: 'debtDecrease',
      key: 'debtDecrease',
      width: 238,
      align: 'right',
      render: (debtDecrease: number, record) => {
        return (
          <>
            {debtDecrease > 0 ? (
              <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={() => {
                  debtTransactionFacade.set({
                    isDebtReportModalNegativeCustomerVisible: true,
                    customerId: record.entityId,
                  });
                }}
              >
                {debtDecrease?.toLocaleString()}
              </span>
            ) : (
              <span>{debtDecrease?.toLocaleString()}</span>
            )}
          </>
        );
      },
    },
    {
      title: 'Nợ còn trong kỳ',
      dataIndex: 'debtRemain',
      key: 'debtRemain',
      width: 238,
      align: 'right',
      render: (debtRemain: number) => <span>{debtRemain?.toLocaleString()}</span>,
    },
    {
      title: 'Nợ cuối kỳ',
      dataIndex: 'closingDebt',
      key: 'closingDebt',
      //sắp xếp theo thứ tự giảm dần
      sorter: (a: any, b: any) => a.closingDebt - b.closingDebt,
      width: 238,
      align: 'right',
      render: (closingDebt: number) => <span>{closingDebt?.toLocaleString()}</span>,
    },
  ];

  return (
    <>
      <Spin spinning={debtTransactionFacade.isLoading}>
        <div className="px-8 pb-10">
          <div className="py-3 flex justify-between">
            <div className={'flex items-center gap-3'}>
              <h3>Thời gian ghi nhận công nợ</h3>
              <RangePicker
                className="w-60"
                allowClear={false}
                defaultValue={[dayjs(minClosingDebt, 'YYYY-MM-DD'), dayjs(maxClosingDebt, 'YYYY-MM-DD')]}
                format="DD/MM/YYYY"
                onChange={handleDateRangeChange}
              />
            </div>
            <div>
              <Button
                className="font-medium"
                icon={<QuestionCircleOutlined />}
                type="text"
                onClick={() => debtTransactionFacade.set({ isDebtReportModalGlossaryCustomerVisible: true })}
              >
                Giải thích thuật ngữ
              </Button>
            </div>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: '#2B4263',
                  colorTextHeading: '#fff',
                  colorIcon: '#fff',
                  headerSortHoverBg: '#2B4263',
                  headerSortActiveBg: '#2B4263',
                },
              },
            }}
          >
            <Table
              size="middle"
              columns={columns}
              dataSource={debtReportData}
              title={() => (
                <>
                  <div className="flex gap-4">
                    <div className={'flex-1'}>
                      <SearchWidget
                        placeholder={'Tìm kiếm theo tên, mã khách hàng'}
                        form={(form) => (formRef.current = form)}
                        callback={onChangeSearch}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Popover
                        content={
                          <div className="w-[350px]">
                            <Form
                              form={customerDebtForm}
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
                                          value && customerDebtForm.getFieldValue('maxClosingDebt') < value
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
                                          customerDebtForm.setFieldsValue({ positive: false });
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
                                          value && customerDebtForm.getFieldValue('minClosingDebt') > value
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
                                          customerDebtForm.setFieldsValue({ positive: false });
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
                                          customerDebtForm.setFieldsValue({
                                            minClosingDebt: undefined,
                                            maxClosingDebt: undefined,
                                          });
                                        }
                                      }}
                                    >
                                      Nợ cuối kỳ khác 0
                                    </Checkbox>
                                  </Form.Item>
                                </Col>
                                <Col className="pt-3" span={24}>
                                  <Button className="w-full" type="primary" onClick={customerDebtForm.submit}>
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
                          Nợ cuối kỳ
                        </Button>
                      </Popover>
                      <Button
                        icon={<ReloadOutlined />}
                        loading={debtTransactionFacade.isLoading}
                        onClick={() =>
                          debtTransactionFacade.getReport({
                            page: page ? Number(page) : 1,
                            size: size ? Number(size) : 20,
                            filter: filter || JSON.stringify(currentFilter),
                          })
                        }
                      >
                        Tải lại
                      </Button>
                    </div>
                  </div>
                  <Tag
                    hidden={!minClosingDebtValue && !maxClosingDebtValue && !positiveValue}
                    className={`rounded-full mt-3 py-0.5`}
                    color="#E6F4FF"
                    onClose={handleCloseTag}
                    closeIcon={
                      <CloseOutlined className="p-0.5 rounded hover:bg-slate-200" style={{ color: '#1890ff' }} />
                    }
                  >
                    <span className="text-black text-[14px] pl-0.5">
                      Nợ cuối kỳ: {titleTag(minClosingDebtValue, maxClosingDebtValue, positiveValue)}
                    </span>
                  </Tag>
                </>
              )}
              bordered
              pagination={false}
              footer={() => (
                <Pagination
                  className={'flex justify-end'}
                  size="small"
                  align="start"
                  showSizeChanger
                  current={debtTransactionFacade?.debtList?.page}
                  pageSize={debtTransactionFacade?.debtList?.size}
                  total={debtTransactionFacade?.debtList?.totalElements}
                  pageSizeOptions={[20, 40, 60, 80]}
                  showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
                  onChange={(page, pageSize) => {
                    onChangeDataTable({
                      query: { page: page, size: pageSize, filter: filter || JSON.stringify(currentFilter) },
                    });
                    scrollLeftWhenChanging('.ant-table-body');
                    scrollTopWhenChanging('.ant-table-body');
                  }}
                />
              )}
            />
          </ConfigProvider>
          {debtTransactionFacade.isDebtReportModalGlossaryCustomerVisible && <CustomerDebtGlossary />}
          {debtTransactionFacade.isDebtReportModalPositiveCustomerVisible && debtTransactionFacade.customerId && (
            <CustomerDebtPositiveModal customerId={debtTransactionFacade.customerId} />
          )}
          {debtTransactionFacade.isDebtReportModalNegativeCustomerVisible && debtTransactionFacade.customerId && (
            <CustomerDebtMinusModal customerId={debtTransactionFacade.customerId} />
          )}
        </div>
      </Spin>
    </>
  );
};

export default CustomerDebtReport;
