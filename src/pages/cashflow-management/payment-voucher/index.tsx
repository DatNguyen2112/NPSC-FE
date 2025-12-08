import {
  CaretDownOutlined,
  CloseOutlined,
  ExportOutlined,
  FilterFilled,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  CashBookTransactionFormFilter,
  CodeTypeFacade,
  ProjectFacade,
  EStatusThuChi,
  CashbookTransactionFacade,
  CashbookTransactionModel,
  CodeTypeModel,
  ProjectModel,
} from '@store';
import { lang, routerLinks, scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import { DatePicker, MenuProps, TabsProps, Tooltip } from 'antd';
import { Button, Dropdown, FormInstance, Modal, Pagination, Space, Spin, Table, Tabs, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Link, useSearchParams } from 'react-router-dom';
import ExportFilePaymentVouchersModal from './ExportFileModal';
import FilterPaymentVoucher from './filter.drawer';

interface DataType extends CashbookTransactionModel {
  key?: string;
}

let fillQuery: QueryParams;
let currentFilter: CashBookTransactionFormFilter = {};
dayjs.extend(isoWeek);
let filterObject: CashBookTransactionFormFilter;
let foundMethod: CodeTypeModel[];
let foundPurpose: CodeTypeModel[];
let foundProject: ProjectModel[];

const Page: React.FC = () => {
  const cashBookTransactionFacade = CashbookTransactionFacade();

  const formRef = useRef<FormInstance | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [modalApi, contextModalApi] = Modal.useModal();
  // const selectRef = useRef<any>(null);

  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');
  const hasSelected = cashBookTransactionFacade.selectedRowKeysPaymentVoucher?.length ?? 0 > 0;
  const codeTypeFacade = CodeTypeFacade();
  const duAnFacade = ProjectFacade();

  if (filter) {
    filterObject = JSON.parse(filter);
  } else {
    filterObject = { transactionTypeCode: 'CHI'};
  }

  useEffect(() => {
    switch (filterObject.isActive) {
      case 'COMPLETED':
        filterObject.activeTab = 'COMPLETED';
        break;
      case 'WAIT_TRANSFER':
        filterObject.activeTab = 'WAIT_TRANSFER';
        break;
      case 'CANCELED':
        filterObject.activeTab = 'CANCELED';
        break;
      default:
        filterObject.activeTab = 'all';

    }
    onChangeDataTable({
      query: {
        page: page ? Number(page) : 1,
        size: size ? Number(size) : 20,
        filter: JSON.stringify(filterObject),
      },
    });
  }, [filterObject.isActive]);

  useEffect(() => {
    cashBookTransactionFacade.set({ activeKey: 'all', selectedRowKeysPaymentVoucher: [], dateRange: undefined });
    codeTypeFacade.getEntityGroup({ size: -1 });
    duAnFacade.get({ size: -1 });
    filterObject.transactionTypeCode = 'CHI';
    if (filterObject.dateRange) {
      cashBookTransactionFacade.set({
        dateRange: [dayjs(filterObject?.dateRange[0]), dayjs(filterObject?.dateRange[1])],
      });
    }
    onChangeDataTable({
      query: {
        page: 1,
        size: 20,
        filter: JSON.stringify(filterObject),
      },
    });
    setSearchParams(
      new URLSearchParams({
        page: '1',
        size: '20',
        filter: JSON.stringify(filterObject),
      }),
    );
  }, []);

  useEffect(() => {
    switch (cashBookTransactionFacade.status) {
      case EStatusThuChi.cancelVoucherCashbookTransactionsFulfilled:
        cashBookTransactionFacade.get({ filter: JSON.stringify({ transactionTypeCode: 'CHI' }) ?? '{}' });
        break;
    }
  }, [cashBookTransactionFacade.status]);

  const dataSource: DataType[] =
    cashBookTransactionFacade?.pagination?.content?.map((item, index) => ({
      key: uuidv4(),
      index: index + 1,
      id: item.id,
      code: item.code ?? '',
      purposeName: item.purposeName ?? '',
      isActive: item.isActive,
      amount: item.amount ?? 0,
      entityId: item.entityId ?? '',
      entityTypeCode: item.entityTypeCode ?? '',
      entityTypeName: item.entityTypeName ?? '',
      originalDocumentCode: item.originalDocumentCode,
      originalDocumentType: item.originalDocumentType,
      originalDocumentId: item.originalDocumentId,
      entityName: item.entityName ?? '',
      createdOnDate: item.createdOnDate,
    })) ?? [];

  const onChange = (key: string) => {
    cashBookTransactionFacade.set({
      dateRange: undefined,
      activeKey: key,
      selectedRowKeysReceiptVoucher: [],
    });
    if (key === 'all') {
      delete filterObject.isActive;
      cashBookTransactionFacade.set({ activeKey: 'all', searchValue: undefined });
      filterObject.FullTextSearch = '';
    }
    filterObject.activeTab = key;
    if (key !== 'all') {
      filterObject.isActive = key;
    }

    delete filterObject.dateRange;
    delete filterObject.listPurposeCode;
    delete filterObject.listPaymentMethodCode;
    delete filterObject.projectId;
    filterObject.FullTextSearch = '';
    formRef.current?.resetFields();

    onChangeDataTable({
      query: {
        page: page ? Number(page) : 1,
        size: size ? Number(size) : 20,
        filter: JSON.stringify(filterObject),
      },
    });
  };

  const onChangeSearch = (value: string) => {
    if (filter) {
      currentFilter = JSON.parse(filter);
      currentFilter.FullTextSearch = value;
      currentFilter.transactionTypeCode = 'CHI';
      const query: QueryParams = {
        page: 1,
        size: 20,
        filter: JSON.stringify(currentFilter),
      };
      onChangeDataTable({ query });
    } else {
      onChangeDataTable({
        query: {
          page: 1,
          size: 20,
          filter: JSON.stringify({ FullTextSearch: value }),
        },
      });
    }
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

  const rowSelection = {
    onChange: (selectedRowKeys: string[]) => {
      cashBookTransactionFacade.set({ selectedRowKeysPaymentVoucher: selectedRowKeys });
    },
    getCheckboxProps: (record: any) => ({
      title: record.name,
    }),
    columnWidth: 60,
  };

  const handleCancelVoucherCashbookTransaction = () => {
    modalApi.confirm({
      width: 600,
      title: `Bạn chắc chắn muốn huỷ phiếu chi này?`,
      content: 'Thao tác này sẽ huỷ các phiếu chi bạn đã chọn. Thao tác này không thể khôi phục.',
      onOk: () => {
        if (cashBookTransactionFacade.selectedRowKeysPaymentVoucher?.length) {
          cashBookTransactionFacade.cancelVoucherCashbookTransactions(
            cashBookTransactionFacade.selectedRowKeysPaymentVoucher,
          );
        }
      },
      onCancel: () => {},
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true, className: 'font-medium' },
      cancelText: 'Thoát',
      cancelButtonProps: { type: 'default', danger: true, className: 'font-medium' },
      closable: true,
    });
  };

  const handleCancelVoucherCashbookTransactionOne = (id?: string) => {
    modalApi.confirm({
      width: 600,
      title: `Bạn chắc chắn muốn huỷ phiếu thu này?`,
      content: 'Thao tác này sẽ huỷ phiếu thu bạn đã chọn. Thao tác này không thể khôi phục.',
      onOk: () => {
        if (id) {
          cashBookTransactionFacade.cancelVoucherCashbookTransactions([id]);
        }
      },
      onCancel: () => {},
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true, className: 'font-medium' },
      cancelText: 'Thoát',
      cancelButtonProps: { type: 'default', danger: true, className: 'font-medium' },
      closable: true,
    });
  };

  const menuItems: MenuProps['items'] = [
    {
      label: 'Tạo phiếu chi',
      key: 'normal',
    },
    {
      label: 'Tạo phiếu chi hàng loạt',
      key: 'multiple',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'normal':
        navigate(`/${lang}${routerLinks('ChiPhi')}/create`);
        break;
      case 'multiple':
        navigate(`/${lang}${routerLinks('ChiPhi')}/create-multiple`);
        break;
    }
  };

  const menuProps = {
    items :menuItems,
    onClick: handleMenuClick,
  };

  const handleCreate = () => {
    cashBookTransactionFacade.set({ dataCashbookTransaction: {} });
    navigate(`/${lang}${routerLinks('ChiPhi')}/create`);
  };

  const handleOpenExportFileModal = () => {
    cashBookTransactionFacade.set({ isExportFileModalPaymentVoucher: true });
  };

  const column: ColumnsType<DataType> = [
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      key: 'createdOnDate',
      ellipsis: true,
      render: (createdOnDate: string) => <p>{dayjs(createdOnDate).format('DD/MM/YYYY HH:mm')}</p>,
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
      render: (code: string, record: CashbookTransactionModel) => (
        <Tooltip title={'Xem chi tiết phiếu chi'}>
          <Link className="hover:underline" to={`/${lang}${routerLinks('ChiPhi')}/${record.id}/edit`}>
            {code}
          </Link>
        </Tooltip>
      ),
    },
    {
      title: 'Loại phiếu',
      dataIndex: 'purposeName',
      key: 'purpose',
      ellipsis: true,
      render: (purposeName: string) => <p className="truncate">{purposeName}</p>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      width: 150,
      render: (isActive: 'COMPLETED' | 'CANCELED' | 'WAIT_TRANSFER') => (
        <Tag
          className="px-3.5 py-0.5 rounded-full text-sm"
          color={isActive === 'COMPLETED' ? 'green' : isActive === 'CANCELED' ? 'error' : 'default'}
        >
          {isActive === 'COMPLETED' ? 'Hoàn thành' : isActive === 'CANCELED' ? 'Đã hủy' : 'Nháp'}
        </Tag>
      ),
    },
    {
      title: 'Số tiền chi',
      dataIndex: 'amount',
      key: 'amount',
      ellipsis: true,
      align: 'right',
      render: (value: number) => (value ? value.toLocaleString() : '0'),
    },
    {
      title: 'Nhóm người nhận',
      dataIndex: 'entityTypeName',
      key: 'entityTypeName',
      ellipsis: true,
      render: (purposeName: string) => <p className="truncate">{purposeName}</p>,
    },
    {
      title: 'Chứng từ gốc',
      dataIndex: 'originalDocumentCode',
      key: 'originalDocumentCode',
      ellipsis: true,
      render: (originalDocumentCode: string, record: CashbookTransactionModel) => {
        let href: string;

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
          originalDocumentCode && (
            <Tooltip title={'Xem chi tiết'}>
              <Link className="hover:underline" to={href} target="_blank">
                {originalDocumentCode}
              </Link>
            </Tooltip>
          )
        );
      },
    },
    {
      title: 'Tên người nhận',
      dataIndex: 'entityName',
      key: 'entityName',
      ellipsis: true,
      render: (entityName: string, record: CashbookTransactionModel) => {
        let href = '';
        switch (record.entityTypeCode) {
          case 'customer':
            href = `/${lang}${routerLinks('KhachHang')}/${record.entityId}/view-detail`;
            break;
          case 'supplier':
            href = `/${lang}${routerLinks('NhaCungCap')}/${record.entityId}/view-detail`;
            break;
        }
        return (
          <Link className="hover:underline" to={href} target="_blank">
            {entityName}
          </Link>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'operation',
      align: 'center',
      render: (_, record: CashbookTransactionModel) => {
        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: '1',
                  disabled: record.isActive === 'CANCELED',
                  label: (
                    <a
                      onClick={() => handleCancelVoucherCashbookTransactionOne(record.id)}
                      className="text-gray-900 hover:!text-blue-500"
                    >
                      Hủy phiếu chi
                    </a>
                  ),
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Tooltip title={'Xem chi tiết phiếu chi'}>
                  <Link className="hover:underline" to={`/${lang}${routerLinks('ChiPhi')}/${record.id}/edit`}>
                    Xem chi tiết
                  </Link>
                </Tooltip>
                <CaretDownOutlined />
              </Space>
            </a>
          </Dropdown>
        );
      },
    },
  ];
  if (filterObject.listPaymentMethodCode) {
    //@ts-ignore
    foundMethod = codeTypeFacade?.paymentMethods?.content.filter((method) => filterObject.listPaymentMethodCode?.includes(method?.code));
  }
  if (filterObject.listPurposeCode) {
    //@ts-ignore
    foundPurpose = codeTypeFacade?.expenditurePurposes?.content.filter((method) => filterObject.listPurposeCode?.includes(method?.code));
  }
  if (filterObject.projectId) {
    //@ts-ignore
    foundProject = duAnFacade.pagination?.content.filter((method) => filterObject.projectId?.includes(method?.id));
  }

  const items: TabsProps['items'] = [
    {
      key: 'all',
      label: <h1 className="pl-3">Tất cả phiếu chi</h1>,
      children: (
        <>
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
            </div>
            <div className={'flex gap-2.5'}>
              <DatePicker.RangePicker
                allowClear
                format="DD-MM-YYYY"
                value={cashBookTransactionFacade?.dateRange}
                onChange={(value: null | (Dayjs | null)[]) => {
                  if (value) {
                    filterObject.dateRange = [
                      dayjs(value[0]).add(1).format('YYYY-MM-DD'),
                      dayjs(value[1]).add(1).format('YYYY-MM-DD'),
                    ];
                  } else {
                    delete filterObject.dateRange;
                  }
                  if (value) {
                    cashBookTransactionFacade.set({ dateRange: [dayjs(value[0]), dayjs(value[1])] });
                  }
                  onChangeDataTable({
                    query: {
                      page: 1,
                      size: 20,
                      filter: JSON.stringify(filterObject),
                    },
                  });
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
                color="primary"
                variant="outlined"
                icon={<FilterFilled />}
                iconPosition="end"
                onClick={() => cashBookTransactionFacade.set({ isFilterPaymentVoucher: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          <div className={'mb-2 mx-3.5 flex gap-2 items-center flex-wrap'}>
            {filterObject.FullTextSearch && true && (
              <Tag
                closable
                onClose={() => {
                  if (filterObject?.FullTextSearch != undefined) {
                    removeFilter('fullTextSearch');
                  }
                }}
                className="py-1 px-3 rounded-full"
                color={'blue'}
              >
                Kết quả tìm kiếm : {filterObject.FullTextSearch}
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
                Loại phiếu : {foundPurpose?.map((item) => item.title).join(', ')}
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
            {filterObject.isActive && true && (
              <div className="p-3">
                <Tag
                  closable
                  className="flex py-1 px-3 rounded-full !h-8"
                  onClose={() => {
                    if (filterObject?.isActive != null) {
                      removeFilter('status');
                    }
                  }}
                  color={
                    (filterObject?.isActive === 'CANCELED' && 'red') ||
                    (filterObject?.isActive === 'COMPLETED' && 'green') ||
                    (filterObject?.isActive === 'WAIT_TRANSFER' && 'default') ||
                    'default'
                  }
                >
                  <p>
                    Trạng thái :
                    {(filterObject?.isActive === 'CANCELED' && ' Đã huỷ') ||
                      (filterObject?.isActive === 'COMPLETED' && ' Đã hoàn thành') ||
                      (filterObject?.isActive === 'WAIT_TRANSFER' && ' Nháp')}
                  </p>
                </Tag>
              </div>
            )}
          </div>
          <div id={`${hasSelected ? '' : 'hiddenTitleTable'}`}>
            <Table
              title={() => (
                <>
                  <Space size={'small'}>
                    <p>
                      Đã chọn {cashBookTransactionFacade.selectedRowKeysPaymentVoucher?.length} phiếu chi trên trang này
                    </p>
                    <Button className="font-medium" type="link" danger onClick={handleCancelVoucherCashbookTransaction}>
                      Hủy phiếu chi
                    </Button>
                  </Space>
                </>
              )}
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
                    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
                    fillQuery = {
                      page,
                      size: pageSize,
                      filter: JSON.stringify(currentFilter),
                    };
                    onChangeDataTable({ query: fillQuery });
                    scrollLeftWhenChanging('.ant-table-body');
                    scrollTopWhenChanging('.ant-table-body');
                  }}
                />
              )}
              // scroll={{ y: 'calc(100vh - 265px)' }}
              dataSource={dataSource}
              columns={column}
              pagination={false}
              rowSelection={rowSelection as any}
              rowKey={'id'}
            />
          </div>
        </>
      ),
    },
    {
      key: 'COMPLETED',
      label: <h1>Phiếu chi hoàn thành</h1>,
      children: (
        <>
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
            </div>
            <div className={'flex gap-2.5'}>
              <DatePicker.RangePicker
                allowClear
                format="DD-MM-YYYY"
                value={cashBookTransactionFacade?.dateRange}
                onChange={(value: null | (Dayjs | null)[]) => {
                  if (value) {
                    filterObject.dateRange = [
                      dayjs(value[0]).add(1).format('YYYY-MM-DD'),
                      dayjs(value[1]).add(1).format('YYYY-MM-DD'),
                    ];
                    cashBookTransactionFacade.set({ dateRange: [dayjs(value[0]), dayjs(value[1])] });
                    onChangeDataTable({
                      query: {
                        page: 1,
                        size: 20,
                        filter: JSON.stringify(filterObject),
                      },
                    });
                  }
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
                color="primary"
                variant="outlined"
                icon={<FilterFilled />}
                iconPosition="end"
                onClick={() => cashBookTransactionFacade.set({ isFilterPaymentVoucher: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          <div className={'mb-2 mx-3.5 flex gap-2 items-center flex-wrap'}>
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
                Loại phiếu : {foundPurpose?.map((item) => item.title).join(', ')}
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
            {filterObject.isActive && true && (
              <div className="p-3">
                <Tag
                  closable
                  className="flex py-1 px-3 rounded-full !h-8"
                  onClose={() => {
                    if (filterObject?.isActive != null) {
                      removeFilter('status');
                    }
                  }}
                  color={
                    (filterObject?.isActive === 'CANCELED' && 'red') ||
                    (filterObject?.isActive === 'COMPLETED' && 'green') ||
                    (filterObject?.isActive === 'WAIT_TRANSFER' && 'default') ||
                    'default'
                  }
                >
                  <p>
                    Trạng thái :
                    {(filterObject?.isActive === 'CANCELED' && ' Đã huỷ') ||
                      (filterObject?.isActive === 'COMPLETED' && ' Đã hoàn thành') ||
                      (filterObject?.isActive === 'WAIT_TRANSFER' && ' Nháp')}
                  </p>
                </Tag>
              </div>
            )}
          </div>
          <div id={`${hasSelected ? '' : 'hiddenTitleTable'}`}>
            <Table
              // scroll={{ y: 'calc(100vh - 265px)' }}
              title={() => (
                <>
                  <Space size={'small'}>
                    <p>
                      Đã chọn {cashBookTransactionFacade.selectedRowKeysPaymentVoucher?.length} phiếu chi trên trang này
                    </p>
                    <Button className="font-medium" type="link" danger onClick={handleCancelVoucherCashbookTransaction}>
                      Hủy phiếu chi
                    </Button>
                  </Space>
                </>
              )}
              dataSource={dataSource}
              columns={column}
              pagination={false}
              rowSelection={rowSelection as any}
              rowKey={'id'}
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
                    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
                    fillQuery = {
                      page,
                      size: pageSize,
                      filter: JSON.stringify(currentFilter),
                    };
                    onChangeDataTable({ query: fillQuery });
                    scrollLeftWhenChanging('.ant-table-body');
                    scrollTopWhenChanging('.ant-table-body');
                  }}
                />
              )}
            />
          </div>
        </>
      ),
    },
    {
      key: 'WAIT_TRANSFER',
      label: <h1>Phiếu chi nháp</h1>,
      children: (
        <>
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
            </div>
            <div className={'flex gap-2.5'}>
              <DatePicker.RangePicker
                allowClear
                format="DD-MM-YYYY"
                value={cashBookTransactionFacade?.dateRange}
                onChange={(value: null | (Dayjs | null)[]) => {
                  if (value) {
                    filterObject.dateRange = [
                      dayjs(value[0]).add(1).format('YYYY-MM-DD'),
                      dayjs(value[1]).add(1).format('YYYY-MM-DD'),
                    ];
                  } else {
                    delete filterObject.dateRange;
                  }
                  if (value) {
                    cashBookTransactionFacade.set({ dateRange: [dayjs(value[0]), dayjs(value[1])] });
                  }
                  onChangeDataTable({
                    query: {
                      page: 1,
                      size: 20,
                      filter: JSON.stringify(filterObject),
                    },
                  });
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
                color="primary"
                variant="outlined"
                icon={<FilterFilled />}
                iconPosition="end"
                onClick={() => cashBookTransactionFacade.set({ isFilterPaymentVoucher: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          <div className={'mb-2 mx-3.5 flex gap-2 items-center flex-wrap'}>
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
                Loại phiếu : {foundPurpose?.map((item) => item.title).join(', ')}
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
            {filterObject.isActive && true && (
              <div className="p-3">
                <Tag
                  closable
                  className="flex py-1 px-3 rounded-full !h-8"
                  onClose={() => {
                    if (filterObject?.isActive != null) {
                      removeFilter('status');
                    }
                  }}
                  color={
                    (filterObject?.isActive === 'CANCELED' && 'red') ||
                    (filterObject?.isActive === 'COMPLETED' && 'green') ||
                    (filterObject?.isActive === 'WAIT_TRANSFER' && 'default') ||
                    'default'
                  }
                >
                  <p>
                    Trạng thái :
                    {(filterObject?.isActive === 'CANCELED' && ' Đã huỷ') ||
                      (filterObject?.isActive === 'COMPLETED' && ' Đã hoàn thành') ||
                      (filterObject?.isActive === 'WAIT_TRANSFER' && ' Nháp')}
                  </p>
                </Tag>
              </div>
            )}
          </div>
          <div id={`${hasSelected ? '' : 'hiddenTitleTable'}`}>
            <Table
              // scroll={{ y: 'calc(100vh - 265px)' }}
              title={() => (
                <>
                  <Space size={'small'}>
                    <p>
                      Đã chọn {cashBookTransactionFacade.selectedRowKeysPaymentVoucher?.length} phiếu chi trên trang này
                    </p>
                    <Button className="font-medium" type="link" danger onClick={handleCancelVoucherCashbookTransaction}>
                      Hủy phiếu chi
                    </Button>
                  </Space>
                </>
              )}
              dataSource={dataSource}
              columns={column}
              pagination={false}
              rowSelection={rowSelection as any}
              rowKey={'id'}
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
                    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
                    fillQuery = {
                      page,
                      size: pageSize,
                      filter: JSON.stringify(currentFilter),
                    };
                    onChangeDataTable({ query: fillQuery });
                    scrollLeftWhenChanging('.ant-table-body');
                    scrollTopWhenChanging('.ant-table-body');
                  }}
                />
              )}
            />
          </div>
        </>
      ),
    },
    {
      key: 'CANCELED',
      label: <h1>Phiếu chi đã hủy</h1>,
      children: (
        <>
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
            </div>
            <div className={'flex gap-2.5'}>
              <DatePicker.RangePicker
                allowClear
                format="DD-MM-YYYY"
                value={cashBookTransactionFacade?.dateRange}
                onChange={(value: null | (Dayjs | null)[]) => {
                  if (value) {
                    filterObject.dateRange = [
                      dayjs(value[0]).add(1).format('YYYY-MM-DD'),
                      dayjs(value[1]).add(1).format('YYYY-MM-DD'),
                    ];
                  } else {
                    delete filterObject.dateRange;
                  }
                  if (value) {
                    cashBookTransactionFacade.set({ dateRange: [dayjs(value[0]), dayjs(value[1])] });
                  }
                  onChangeDataTable({
                    query: {
                      page: 1,
                      size: 20,
                      filter: JSON.stringify(filterObject),
                    },
                  });
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
                color="primary"
                variant="outlined"
                icon={<FilterFilled />}
                iconPosition="end"
                onClick={() => cashBookTransactionFacade.set({ isFilterPaymentVoucher: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          <div className={'mb-2 mx-3.5 flex gap-2 items-center flex-wrap'}>
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
                Loại phiếu : {foundPurpose?.map((item) => item.title).join(', ')}
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
            {filterObject.isActive && true && (
              <div className="p-3">
                <Tag
                  closable
                  className="flex py-1 px-3 rounded-full !h-8"
                  onClose={() => {
                    if (filterObject?.isActive != null) {
                      removeFilter('status');
                    }
                  }}
                  color={
                    (filterObject?.isActive === 'CANCELED' && 'red') ||
                    (filterObject?.isActive === 'COMPLETED' && 'green') ||
                    (filterObject?.isActive === 'WAIT_TRANSFER' && 'default') ||
                    'default'
                  }
                >
                  <p>
                    Trạng thái :
                    {(filterObject?.isActive === 'CANCELED' && ' Đã huỷ') ||
                      (filterObject?.isActive === 'COMPLETED' && ' Đã hoàn thành') ||
                      (filterObject?.isActive === 'WAIT_TRANSFER' && ' Nháp')}
                  </p>
                </Tag>
              </div>
            )}
          </div>

          <div id={`${hasSelected ? '' : 'hiddenTitleTable'}`}>
            <Table
              // scroll={{ y: 'calc(100vh - 265px)' }}
              title={() => (
                <>
                  <Space size={'small'}>
                    <p>
                      Đã chọn {cashBookTransactionFacade.selectedRowKeysPaymentVoucher?.length} phiếu chi trên trang này
                    </p>
                    <Button className="font-medium" type="link" danger onClick={handleCancelVoucherCashbookTransaction}>
                      Hủy phiếu chi
                    </Button>
                  </Space>
                </>
              )}
              dataSource={dataSource}
              columns={column}
              pagination={false}
              rowSelection={rowSelection as any}
              rowKey={'id'}
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
                    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
                    fillQuery = {
                      page,
                      size: pageSize,
                      filter: JSON.stringify(currentFilter),
                    };
                    onChangeDataTable({ query: fillQuery });
                    scrollLeftWhenChanging('.ant-table-body');
                    scrollTopWhenChanging('.ant-table-body');
                  }}
                />
              )}
            />
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      {contextModalApi}
      <Spin spinning={cashBookTransactionFacade.isLoading}>
        <div className="mx-8">
          {/* Create Receipt Voucher */}
          <div className="flex items-center justify-between h-14">
            <div>
              <Button className="font-medium" type="text" icon={<ExportOutlined />} onClick={handleOpenExportFileModal}>
                Xuất file
              </Button>
            </div>
            <Dropdown menu={menuProps}>
              <Button type={'primary'} icon={<PlusOutlined />}>
                <Space>
                  Tạo phiếu chi
                  <CaretDownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
          <div className="bg-white">
            <Tabs activeKey={filterObject.activeTab} items={items} onChange={onChange} />
          </div>
        </div>
        <ExportFilePaymentVouchersModal />
      </Spin>
      <FilterPaymentVoucher />
    </>
  );
};

export default Page;
