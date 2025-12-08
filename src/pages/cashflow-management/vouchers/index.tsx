import { ExportOutlined, FilterFilled, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { EStatusState, QueryParams } from '@models';
import GlossaryTable from '@pages/glossary-table';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  CashBookTransactionFormFilter,
  CodeTypeFacade,
  ProjectFacade,
  ProjectModel,
  CashbookTransactionFacade,
  CashbookTransactionModel,
  CodeTypeModel, EStatusThuChi,
} from '@store';
import { lang, routerLinks, scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import { Form, InputNumber, Popover, Space, TabsProps, Tag, Tooltip } from 'antd';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Modal,
  Pagination,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tabs,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FormInstance } from 'antd/lib';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ExportFileVouchersModal from './ExportFileModal';
import VouchersFilterModal from './filter.drawer';
import { customMessage } from '../../../index';

const { RangePicker } = DatePicker;
let fillQuery: QueryParams;

interface DataType extends CashbookTransactionModel {
  key: string;
}

let filterObject: CashBookTransactionFormFilter;
let foundMethod: CodeTypeModel[];
let foundPurpose: CodeTypeModel[];
let foundReceipt: CodeTypeModel[];
let foundProject: ProjectModel[];
let foundEntityTypeCodes: CodeTypeModel[];

const Page: React.FC = () => {
  const codeTypeFacade = CodeTypeFacade();
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const projectFacade = ProjectFacade();
  const [initialTransactionForm] = Form.useForm();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef<FormInstance | undefined>(undefined);

  const today = dayjs();
  const startOfMonth = today.startOf('month').format('YYYY-MM-DD');
  const endOfMonth = today.endOf('month').format('YYYY-MM-DD');
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');
  const [modal, contextHolder] = Modal.useModal();

  let currentFilter: CashBookTransactionFormFilter;

  if (filter) {
    filterObject = JSON.parse(filter);
  } else {
    filterObject = {};
  }

  useEffect(() => {
    codeTypeFacade.getPaymentMethods({ size: -1 });
    codeTypeFacade.getExpenditurePurposes({ size: -1 });
    codeTypeFacade.getPurposeReceipts({ size: -1 });
    projectFacade.get({ size: -1 });
    currentFilter = {
      ...filterObject,
      projectId: filterObject.projectId ? filterObject.projectId : undefined,
      dateRange: filterObject.dateRange ? filterObject.dateRange : [startOfMonth, endOfMonth],
      isActive: 'COMPLETED',
    };
    if (filterObject.dateRange && filterObject.dateRange.length > 0) {
      cashBookTransactionFacade.set({
        dateRange: [dayjs(filterObject?.dateRange[0]), dayjs(filterObject?.dateRange[1])],
      });
    } else {
      cashBookTransactionFacade.set({
        dateRange: [dayjs(startOfMonth, 'YYYY-MM-DD'), dayjs(endOfMonth, 'YYYY-MM-DD')],
      });
    }
    cashBookTransactionFacade.getTransactionSummary({
      filter: JSON.stringify({ dateRange: filterObject.dateRange ? filterObject.dateRange : [startOfMonth, endOfMonth]}),
    });
    onChangeDataTable({
      query: {
        page: 1,
        size: 20,
        filter: JSON.stringify(currentFilter),
      },
    });
    codeTypeFacade.getEntityGroup({ size: -1 });
  }, []);

  useEffect(() => {
    switch (cashBookTransactionFacade.status) {
      case EStatusThuChi.getTransactionSummaryFulfilled:
      case EStatusState.getFulfilled:
        initialTransactionForm.setFieldsValue({
          amount: cashBookTransactionFacade.thongKe?.initialInformation?.initialAmount,
          receiptDate: cashBookTransactionFacade.thongKe?.initialInformation?.receiptDate !== null
            ? dayjs(cashBookTransactionFacade.thongKe?.initialInformation?.receiptDate)
            : dayjs(new Date),
        });
        break;
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        cashBookTransactionFacade.getTransactionSummary({
          filter: JSON.stringify({ dateRange: filterObject.dateRange ? filterObject.dateRange : [startOfMonth, endOfMonth] }),
        });
        cashBookTransactionFacade.get({
          filter: JSON.stringify({ dateRange: filterObject.dateRange ? filterObject.dateRange : [startOfMonth, endOfMonth] }),
        })
        break;
    }
  }, [cashBookTransactionFacade.status]);

  const handleFilterDate = (dates: any) => {
    const dateRange = [dayjs(dates[0]).add(1).format('YYYY-MM-DD'), dayjs(dates[1]).add(1).format('YYYY-MM-DD')];
    cashBookTransactionFacade.set({dateRange: dates})
    if (cashBookTransactionFacade.filterCondition === 'receiptDate') {
      cashBookTransactionFacade.getTransactionSummary({
        filter: JSON.stringify({ receiptDateRange: dateRange }),
      });
      onChangeDataTable({
        query: {
          page: 1,
          size: 20,
          filter: JSON.stringify({
            receiptDateRange: dateRange,
          }),
        },
      });
    } else {
      cashBookTransactionFacade.getTransactionSummary({
        filter: JSON.stringify({ dateRange: dateRange }),
      });
      onChangeDataTable({
        query: {
          page: 1,
          size: 20,
          filter: JSON.stringify({
            dateRange: dateRange,
          }),
        },
      });
    }
  };

  const dataSource: DataType[] =
    cashBookTransactionFacade?.pagination?.content
      .map((item, index) => ({
        stt:
          (Number(cashBookTransactionFacade.pagination?.page ?? 0) - 1) *
            Number(cashBookTransactionFacade.pagination?.size ?? 0) +
          index +
          1,
        key: uuidv4(),
        index: index + 1,
        id: item.id,
        code: item.code ?? '',
        purpose: item.purposeName ?? '',
        isActive: item.isActive,
        amount: item.amount ?? 0,
        entityTypeName: item.entityTypeName ?? '',
        entityName: item.entityName ?? '',
        transactionTypeCode: item.transactionTypeCode ?? '',
        originalDocumentCode: item.originalDocumentCode ?? '',
        originalDocumentType: item.originalDocumentType ?? '',
        originalDocumentId: item.originalDocumentId ?? '',
        createdOnDate: item.createdOnDate ?? '',
        receiptDate: item.receiptDate,
      })) ?? [];

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
    fillQuery = { ...cashBookTransactionFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    cashBookTransactionFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>)?.toString() },
      { replace: true },
    );
    // eslint-disable-next-line react/prop-types
    cashBookTransactionFacade.set({ query: props.query, ...props.setKeyState });
  };
  const handleSelect = (value: string[] | any, field: string) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    switch (field) {
      case 'listPaymentMethodCode':
        currentFilter.listPaymentMethodCode = value;
        break;
      case 'entityTypeCode':
        currentFilter.entityTypeCodes = value;
        break;
      case 'projectId':
        currentFilter.projectId = value;
        break;
    }

    const query: QueryParams = {
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    };

    onChangeDataTable({ query });
    cashBookTransactionFacade.getTransactionSummary(query);
  };

  const onChangeSearch = (value: string) => {
    if (filter) {
      currentFilter = JSON.parse(filter);
      currentFilter.FullTextSearch = value;
      const query: QueryParams = {
        page: 1,
        size: 20,
        filter: JSON.stringify(currentFilter),
      };
      onChangeDataTable({ query });
      cashBookTransactionFacade.getTransactionSummary(query);
    } else {
      onChangeDataTable({
        query: {
          page: 1,
          size: 20,
          filter: JSON.stringify({ FullTextSearch: value }),
        },
      });
      cashBookTransactionFacade.getTransactionSummary({ filter: JSON.stringify({ FullTextSearch: value }) });
    }
  };

  // handle Open Export File Modal
  const handleOpenExportFileModal = () => {
    cashBookTransactionFacade.set({ isExportFileModalVoucher: true });
  };

  const handleAddInitialCashbookTransaction = (values: CashbookTransactionModel) => {
    if (new Date(values?.receiptDate) > new Date()) {
      return customMessage.error({ type: 'error', content: 'Ngày khởi tạo không được lớn hơn ngày hiện tại' });
    }

    const data = {
      ...values,
      receiptDate: values?.receiptDate !== null ? dayjs(values?.receiptDate).format('YYYY-MM-DDTHH:mm:ss[Z]') : dayjs(new Date),
      amount: values?.amount,
      transactionTypeCode: 'INITIAL_TRANSACTION',
      isActive: 'COMPLETED',
    }

    if (cashBookTransactionFacade?.thongKe?.initialInformation?.initialAmount !== 0) {
      cashBookTransactionFacade.put({...data, id: cashBookTransactionFacade?.thongKe?.initialInformation?.initialId});
    } else {
      cashBookTransactionFacade.post(data);
    }
  };

  if (filterObject.listPaymentMethodCode) {
    //@ts-ignore
    foundMethod = codeTypeFacade?.paymentMethods?.content.filter((method) => filterObject.listPaymentMethodCode?.includes(method?.code));
  }
  if (filterObject.listPurposeCode) {
    //@ts-ignore
    foundPurpose = codeTypeFacade?.purposeReceipts?.content.filter((method) => filterObject.listPurposeCode?.includes(method?.code));
  }
  if (filterObject.projectId) {
    //@ts-ignore
    foundProject = projectFacade.pagination?.content.filter((method) => filterObject.projectId?.includes(method?.id));
  }
  if (filterObject.listReceiptCode) {
    //@ts-ignore
    foundReceipt = codeTypeFacade.expenditurePurposes?.content.filter((method) => filterObject.listReceiptCode?.includes(method?.code));
  }
  if (filterObject.entityTypeCodes) {
    //@ts-ignore
    foundEntityTypeCodes = codeTypeFacade.entityGroup?.content.filter((method) => filterObject.entityTypeCodes?.includes(method?.code));
  }

  const contentPopover = (
    <Form form={initialTransactionForm} onFinish={handleAddInitialCashbookTransaction} layout={'vertical'}>
      <div className={'not-mt'}>
        <Form.Item name={'amount'}>
          <InputNumber
            className={'w-full'}
            controls={false}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => `${value}`.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item name={'receiptDate'} label={'Ngày tạo/Ngày ghi nhận'}>
          <DatePicker format={'DD/MM/YYYY'} className={'w-full'} onChange={(value: string | any) => {
            if (new Date(value) > new Date()) {
              return customMessage.error({ type: 'error', content: 'Ngày khởi tạo không được lớn hơn ngày hiện tại' });
            }
          }}/>
        </Form.Item>
      </div>

      <p className={'text-gray-400 italic'}>Chức năng này chỉ nhập 1 lần khi chưa có dữ liệu.</p>
      <p className={'text-gray-400 italic'}>Hạn chế thay đổi số dư đầu tiên hệ thống.</p>

      <Space className={'mt-2 flex justify-end'}>
        <Button danger>Thoát</Button>
        <Button type={'primary'} onClick={initialTransactionForm.submit}>
          Lưu lại
        </Button>
      </Space>
    </Form>
  );

  const handleOpen = () => {
    modal.info({
      title: 'Bảng giải thích thuật ngữ',
      content: (
        <div>
          <GlossaryTable />
        </div>
      ),
      width: 700,
      height: 624,
      okText: 'Đóng',
    });
  };
  const removeFilter = (key: string) => {
    switch (key) {
      case 'listPaymentMethodCode':
        delete filterObject.listPaymentMethodCode;
        break;
      case 'fullTextSearch':
        delete filterObject.FullTextSearch;
        formRef.current?.resetFields();
        break;
      case 'dateRange':
        delete filterObject.dateRange;
        cashBookTransactionFacade.set({ dateRange: undefined });
        break;
      case 'status':
        delete filterObject.isActive;
        break;
      case 'listPurposeCode':
        delete filterObject.listPurposeCode;
        break;
      case 'projectId':
        delete filterObject.projectId;
        break;
      case 'entityTypeCodes':
        delete filterObject.entityTypeCodes;
        break;
      case 'listReceiptCode':
        delete filterObject.listReceiptCode;
        break;
      case 'transactionTypeCode':
        delete filterObject.transactionTypeCode;
        break;
    }
    setSearchParams((prev) => {
      if (filterObject) {
        prev.set('filter', JSON.stringify(filterObject));
      }
      return prev;
    });
    onChangeDataTable({
      query: {
        page: 1,
        size: 20,
        filter: JSON.stringify(filterObject),
      },
    });
  };

  const columns: ColumnsType<CashbookTransactionModel> = [
    {
      title: '#',
      dataIndex: 'stt',
      key: 'stt',
      width: 65,
      align: 'center',
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 194,
      align: 'center',
      render: (value, record) => {
        let href;
        switch (record.transactionTypeCode) {
          case 'THU':
            href = `/${lang}${routerLinks('PhieuThu')}/${record.id}/edit`;
            break;
          case 'CHI':
            href = `/${lang}${routerLinks('ChiPhi')}/${record.id}/edit`;
            break;
          default:
            href = '';
            break;
        }
        return (
          <Tooltip title={`Xem chi tiết phiếu ${record.transactionTypeCode === 'THU' ? 'thu' : 'chi'}`}>
            <Link className="hover:underline" to={href}>
              {value}
            </Link>
          </Tooltip>
        );
      },
    },
    {
      title: 'Loại phiếu',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 259,
      render(value, record: CashbookTransactionModel) {
        return (
          <span>
            {record?.transactionTypeCode !== 'INITIAL_TRANSACTION' ? value : "Số dư đầu kỳ"}
          </span>
        );
      },
    },
    {
      title: 'Tiền thu',
      dataIndex: 'amount',
      key: 'amount',
      width: 194,
      align: 'right',
      render(value: number, record: CashbookTransactionModel) {
        return (
          <span>
            {record.transactionTypeCode === 'THU' || (record.transactionTypeCode === 'INITIAL_TRANSACTION' && value > 0) && value != null
              ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              : '-'}
          </span>
        );
      },
    },
    {
      title: 'Tiền chi',
      dataIndex: 'amount',
      key: 'amount',
      width: 194,
      align: 'right',
      render(value: number, record: CashbookTransactionModel) {
        return (
          <span>
            {record.transactionTypeCode === 'CHI' || (record.transactionTypeCode === 'INITIAL_TRANSACTION' && value < 0) ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'}
          </span>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      key: 'createdOnDate',
      width: 155,
      align: 'center',
      render: (value: string) => {
        return <span>{dayjs(value).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Ngày ghi nhận',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      width: 155,
      align: 'center',
      render: (value: string) => {
        return <span>{dayjs(value).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Mã chứng từ gốc',
      dataIndex: 'originalDocumentCode',
      key: 'originalDocumentCode',
      width: 207,
      render: (value: string, record: CashbookTransactionModel) => {
        let href;

        switch (record.originalDocumentType) {
          case 'sales_return':
            href = `/${lang}${routerLinks('SalesOrderReturn')}/${record.originalDocumentId}`;
            break;
          case 'purchase_return':
            href = `/${lang}${routerLinks('PurchaseOrderReturn')}/${record.originalDocumentId}`;
            break;
          case 'sales_order':
            href = `/${lang}${routerLinks('SaleOrder')}/${record.originalDocumentId}`;
            break;
          case 'purchase_order':
            href = `/${lang}${routerLinks('PurchaseOrder')}/${record.originalDocumentId}`;
            break;
          case 'ADVANCE_REQUEST':
            href = `/${lang}${routerLinks('AdvanceRequest')}/${record.originalDocumentId}/detail`;
            break;
          default:
            href = '';
            break;
        }
        return (
          <Tooltip title={'Xem chi tiết'}>
            <Link className="hover:underline" to={href} target="_blank">
              {value}
            </Link>
          </Tooltip>
        );
      },
    },
  ];

  const TableItemTab = (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#2B4263',
            colorTextHeading: '#fff',
          },
        },
      }}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        title={() => (
          <>
            <div className="flex gap-4">
              <div className={'flex-1'}>
                <SearchWidget
                  placeholder={'Tìm kiếm theo Mã phiếu, Mã chứng từ gốc'}
                  form={(form) => (formRef.current = form)}
                  callback={onChangeSearch}
                />
              </div>
              <div className="flex gap-3">
                <Select
                  className="min-w-40 max-w-full"
                  allowClear
                  placeholder={'Chọn dự án'}
                  options={projectFacade?.pagination?.content?.map((item: ProjectModel) => ({
                    value: item.id,
                    label: item.tenDuAn,
                  }))}
                  value={filterObject.projectId}
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => {
                    handleSelect(value, 'projectId');
                  }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  loading={cashBookTransactionFacade.isLoading}
                  onClick={() => onChangeDataTable({})}
                >
                  Tải lại
                </Button>
                <Button
                  icon={<FilterFilled />}
                  iconPosition="end"
                  variant={'outlined'}
                  color={'primary'}
                  onClick={() => cashBookTransactionFacade.set({ isFilterVoucher: true })}
                >
                  Bộ lọc khác
                </Button>
              </div>
            </div>
            <div className={'mx-3.5 flex gap-2 items-center mt-4 flex-wrap'}>
              {filterObject.FullTextSearch && true && (
                <Tag
                  closable
                  onClose={() => {
                    if (filterObject?.FullTextSearch != undefined) {
                      removeFilter('fullTextSearch');
                    }
                  }}
                  className="py-1 px-3 rounded-full !h-8"
                  color={'blue'}
                >
                  Kết quả tìm kiếm : {filterObject.FullTextSearch}
                </Tag>
              )}
              {filterObject.entityTypeCodes && filterObject.entityTypeCodes.length > 0 && (
                <Tag
                  closable
                  onClose={() => {
                    if (filterObject?.entityTypeCodes != undefined) {
                      removeFilter('entityTypeCodes');
                    }
                  }}
                  className="py-1 px-3 rounded-full !h-8"
                  color={'cyan'}
                >
                  Nhóm người nộp/nhận : {foundEntityTypeCodes?.map((item) => item.title).join(', ')}
                </Tag>
              )}
              {filterObject.transactionTypeCode && true && (
                <Tag
                  closable
                  onClose={() => {
                    if (filterObject?.transactionTypeCode != undefined) {
                      removeFilter('transactionTypeCode');
                    }
                  }}
                  className="py-1 px-3 rounded-full !h-8"
                  color={'lime'}
                >
                  Loại phiếu: {filterObject.transactionTypeCode === 'THU' ? 'Phiếu thu' : 'Phiếu chi'}
                </Tag>
              )}
              {filterObject.listReceiptCode && filterObject.listReceiptCode.length > 0 && (
                <Tag
                  closable
                  onClose={() => {
                    if (filterObject?.listReceiptCode != undefined) {
                      removeFilter('listReceiptCode');
                    }
                  }}
                  className="py-1 px-3 rounded-full !h-8"
                  color={'blue'}
                >
                  Loại phiếu chi : {foundReceipt?.map((item) => item.title).join(', ')}
                </Tag>
              )}
              {filterObject.listPaymentMethodCode && filterObject.listPaymentMethodCode.length > 0 && (
                <Tag
                  className="py-1 px-3 rounded-full !h-8"
                  color={'magenta'}
                  closable
                  onClose={() => {
                    if (filterObject?.listPaymentMethodCode != undefined) {
                      removeFilter('listPaymentMethodCode');
                    }
                  }}
                >
                  Hình thức thanh toán : {foundMethod?.map((item) => item.title).join(', ')}
                </Tag>
              )}
              {filterObject.listPurposeCode && filterObject.listPurposeCode.length > 0 && (
                <Tag
                  className="py-1 px-3 rounded-full !h-8"
                  color={'geekblue'}
                  closable
                  onClose={() => {
                    if (filterObject?.listPurposeCode != undefined) {
                      removeFilter('listPurposeCode');
                    }
                  }}
                >
                  Loại phiếu thu : {foundPurpose?.map((item) => item.title).join(', ')}
                </Tag>
              )}
              {filterObject.projectId && true && (
                <Tag
                  className="py-1 px-3 rounded-full !h-8"
                  color={'purple'}
                  closable
                  onClose={() => {
                    if (filterObject?.projectId != undefined) {
                      removeFilter('projectId');
                    }
                  }}
                >
                  Tên dự án : {foundProject?.map((item) => item.tenDuAn)}
                </Tag>
              )}
              {filterObject.dateRange && true && (
                <Tag
                  className="py-1 px-3 rounded-full !h-8"
                  color={'red'}
                  closable
                  onClose={() => {
                    if (filterObject?.dateRange != undefined) {
                      removeFilter('dateRange');
                    }
                  }}
                >
                  Từ ngày: {filterObject.dateRange ? dayjs(filterObject.dateRange[0]).format('DD-MM-YYYY') : null}
                </Tag>
              )}
              {filterObject.dateRange && true && (
                <Tag
                  className="py-1 px-3 rounded-full !h-8"
                  color={'red'}
                  closable
                  onClose={() => {
                    if (filterObject?.dateRange != undefined) {
                      removeFilter('dateRange');
                    }
                  }}
                >
                  Đến ngày: {filterObject.dateRange ? dayjs(filterObject.dateRange[1]).format('DD-MM-YYYY') : null}
                </Tag>
              )}
            </div>
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
            current={cashBookTransactionFacade?.query?.page}
            pageSize={cashBookTransactionFacade?.pagination?.size}
            total={cashBookTransactionFacade?.pagination?.totalElements}
            pageSizeOptions={[20, 40, 60, 80]}
            showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
            onChange={(page, pageSize) => {
              onChangeDataTable({ query: { page: page, size: pageSize } });
              scrollLeftWhenChanging('.ant-table-body');
              scrollTopWhenChanging('.ant-table-body');
            }}
          />
        )}
      />
    </ConfigProvider>
  );

  const items: TabsProps['items'] = [
    {
      key: 'ALL',
      label: <h3 className="font-medium ml-4">Tất cả</h3>,
      children: TableItemTab,
    },
    {
      key: 'CHI',
      label: <h3 className="font-medium ml-4">Phiếu chi</h3>,
      children: TableItemTab,
    },
    {
      key: 'THU',
      label: <h3 className="font-medium ml-4">Phiếu thu</h3>,
      children: TableItemTab,
    },
  ];

  const handleChangeTabs = () => (key: string) => {
    const filterObj = JSON.parse(filter ?? '{}');
    switch (key) {
      case 'ALL':
        delete filterObj.transactionTypeCode;
        break;
      case 'THU':
        filterObj.transactionTypeCode = 'THU';
        break;
      case 'CHI':
        filterObj.transactionTypeCode = 'CHI';
        break;
      default:
        break;
    }
    setSearchParams(
      new URLSearchParams({
        page: page ?? '1',
        size: size ?? '20',
        filter: JSON.stringify(filterObj),
      }).toString(),
    );
    filterObject.activeTab = key;
    cashBookTransactionFacade.get({ filter: JSON.stringify(filterObj) });
    cashBookTransactionFacade.getTransactionSummary({ filter: JSON.stringify(filterObj) });
  };

  return (
    <>
      {contextHolder}
      <div className="px-8 pb-10">
        <div className="pt-3 flex justify-between">
          <div className={'flex gap-3'}>
            <Select
              className={'w-40'}
              defaultValue={'createdOnDate'}
              options={[
                { value: 'createdOnDate', label: 'Ngày tạo' },
                {
                  value: 'receiptDate',
                  label: 'Ngày ghi nhận',
                },
              ]}
              onChange={(value) => cashBookTransactionFacade.set({ filterCondition: value, dateRange: undefined })}
            />
            <RangePicker
              size="small"
              value={cashBookTransactionFacade.dateRange}
              format="DD/MM/YYYY"
              allowClear={false}
              presets={[
                {
                  label: <Tag color="processing">Tháng này</Tag>,
                  value: [dayjs(today).startOf('month'), dayjs(today).endOf('month')],
                },
                {
                  label: <Tag color="processing">Tháng trước</Tag>,
                  value: [
                    dayjs(today).subtract(1, 'month').startOf('month'),
                    dayjs(today).subtract(1, 'month').endOf('month'),
                  ],
                },
                {
                  label: <Tag color="processing">Tuần này</Tag>,
                  value: [dayjs(today).startOf('week'), dayjs(today).endOf('week')],
                },
                {
                  label: <Tag color="processing">Tuần trước</Tag>,
                  value: [
                    dayjs(today).subtract(1, 'week').startOf('week'),
                    dayjs(today).subtract(1, 'week').endOf('week'),
                  ],
                },
                {
                  label: <Tag color="processing">Hôm nay</Tag>,
                  value: [dayjs(today), dayjs(today)],
                },
              ]}
              onChange={(value: null | (Dayjs | null)[]) => {
                if (value) {
                  handleFilterDate(value);
                }
              }}
            />
            <Popover content={contentPopover} title="Vào số dư đầu kỳ">
              <Button type={'primary'}>Vào số dư đầu kỳ</Button>
            </Popover>
          </div>
          <div>
            <Button color="default" variant="link" icon={<ExportOutlined />} onClick={handleOpenExportFileModal}>
              Xuất file
            </Button>
            <Button color="default" variant="link" icon={<QuestionCircleOutlined />} onClick={handleOpen}>
              Giải thích thuật ngữ
            </Button>
          </div>
        </div>
        <div className="pt-3">
          <Card size="small">
            <Row gutter={16} align="middle">
              <Col span={3} className="ml-10">
                <Statistic
                  title={<h3 className="font-medium text-black text-center">Số dư đầu kì</h3>}
                  value={cashBookTransactionFacade.thongKe?.openingBalance ?? 0}
                  valueStyle={{ fontSize: '14px', fontWeight: 500, textAlign: 'center' }}
                />
              </Col>
              <Col span={2}>
                <div className="text-[#a3a8af] font-medium text-3xl text-center">+</div>
              </Col>
              <Col span={3}>
                <Statistic
                  title={<h3 className="font-medium text-black text-center">Tổng thu</h3>}
                  value={cashBookTransactionFacade.thongKe?.totalRevenueAmount ?? 0}
                  valueStyle={{ color: '#0db473', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}
                />
              </Col>
              <Col span={2}>
                <div className="text-[#a3a8af] font-medium text-3xl text-center">-</div>
              </Col>
              <Col span={3}>
                <Statistic
                  title={<h3 className="font-medium text-black text-center">Tổng chi</h3>}
                  value={cashBookTransactionFacade.thongKe?.totalExpenseAmount ?? 0}
                  valueStyle={{ color: '#ee4747', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}
                />
              </Col>
              <Col span={2}>
                <div className="text-[#a3a8af] font-medium text-3xl text-center">=</div>
              </Col>
              <Col span={3}>
                <Statistic
                  title={<h3 className="font-medium text-black text-center">Tồn cuối kì</h3>}
                  value={cashBookTransactionFacade.thongKe?.closingBalance ?? 0}
                  valueStyle={{ color: '#08f', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}
                />
              </Col>
            </Row>
          </Card>
        </div>
        <Spin spinning={cashBookTransactionFacade.isLoading}>
          <div className="mt-3 bg-white">
            <Tabs
              activeKey={filterObject.transactionTypeCode ? filterObject.transactionTypeCode : 'ALL'}
              items={items}
              onChange={handleChangeTabs()}
            />
          </div>
        </Spin>
      </div>
      <VouchersFilterModal />
      {cashBookTransactionFacade.isExportFileModalVoucher && <ExportFileVouchersModal />}
    </>
  );
};

export default Page;
