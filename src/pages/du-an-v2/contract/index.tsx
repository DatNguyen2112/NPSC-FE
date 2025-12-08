import { SubHeader } from '@layouts/admin';
import { formatDayjsDate, isLoadAllData, lang, routerLinks, uuidv4 } from '@utils';
import {
  App,
  Button,
  Card,
  Dropdown,
  FormInstance,
  Select,
  Space,
  Table,
  Tabs,
  TabsProps,
  Tag,
  theme,
  Tooltip,
} from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusOutlined,
  ReloadOutlined,
  CaretDownOutlined,
  CloseOutlined,
  MoreOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  CodeTypeFacade,
  ContractFacade,
  ContractModel,
  contractImplementationStatuses,
  ConstructionFacade,
  contractFilterFieldNameMap,
  TemplateStage,
  EContractStatus,
} from '@store';
import { ItemType } from 'antd/es/menu/interface';
import { ColumnsType } from 'antd/es/table';
import { DefaultOptionType } from 'antd/es/select';
import { isEqual } from 'underscore';
import { EStatusState } from '@models';
import FilterDrawer from './filter-drawer';
import dayjs from 'dayjs';
import { RightMapRoleFacade } from 'src/store/right-map-role';
import ExportFileModal from './ExportFileModal';
import ImportFileModal from './ImportFileModal';

const queryDefaultValue = {
  page: 1,
  size: 10,
  filter: '{}',
  sort: '',
};

export function formatCurrency(value: number | string): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const ContractPage: React.FC = () => {
  const { token } = theme.useToken();
  const rightMapFacade = RightMapRoleFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const forceReload = useRef(false);
  const filterTagsContainer = useRef<HTMLDivElement>(null);
  const queryParams = useMemo(() => {
    return {
      page: Number(searchParams.get('page') || queryDefaultValue.page),
      size: Number(searchParams.get('size') || queryDefaultValue.size),
      filter: JSON.parse(searchParams.get('filter') || queryDefaultValue.filter) as Record<string, any>,
      sort: searchParams.get('sort') || queryDefaultValue.sort,
    };
  }, [searchParams]);
  const oldQueryParams = useRef(queryParams);
  const { modal, message } = App.useApp();
  const contractFacade = ContractFacade();
  const codeTypeFacade = CodeTypeFacade();
  const constructionFacade = ConstructionFacade();
  const formRef = useRef<FormInstance | undefined>();
  const dataSource = useMemo(
    () =>
      contractFacade.pagination?.content?.map((item, index) => ({
        ...item,
        index: index + 1,
        key: item.id,
      })),
    [contractFacade.pagination?.content],
  );
  const consultServiceList = useMemo(() => {
    return (codeTypeFacade.consultServiceData?.content ?? []).map(
      (x) =>
        ({
          label: x.title,
          value: x.id,
          color: x.description || 'default',
        }) satisfies DefaultOptionType,
    );
  }, [codeTypeFacade.consultServiceData]);
  const voltageTypeList = useMemo(() => {
    return (codeTypeFacade.voltageTypeData?.content ?? []).map(
      (x) =>
        ({
          label: x.title,
          value: x.code,
          color: x.description || 'default',
        }) satisfies DefaultOptionType,
    );
  }, [codeTypeFacade.voltageTypeData]);
  const columns: ColumnsType<ContractModel> = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'index',
        key: 'index',
        width: 60,
        align: 'center',
      },
      {
        title: 'Thông tin chung hợp đồng',
        dataIndex: 'generalInfo',
        key: 'generalInfo',
        width: 440,
        render: (_, record) => {
          let needExtendContract = false;

          if (record.contractSigningDate && record.contractDurationDays != null) {
            needExtendContract = dayjs(record.contractSigningDate)
              .add(record.contractDurationDays, 'day')
              .isBefore(dayjs());
          }
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500/90 shrink-0">Mã hợp đồng:</span>
                <Link to={`/${lang}${routerLinks('Contract')}/${record?.id}`}>{record.code}</Link>
                <Tag color={record.consultingService.description ?? 'default'} className="rounded-full mx-0">
                  {record.consultingService.title}
                </Tag>
                <Tag
                  color={contractImplementationStatuses[record.implementationStatus]?.color ?? 'default'}
                  className="rounded-full mx-0"
                >
                  {contractImplementationStatuses[record.implementationStatus].label || record.implementationStatus}
                </Tag>
                <span>({record.appendices?.length ?? 0} phụ lục)</span>
                {needExtendContract && <span className="text-red-500">Cần gia hạn HĐ!</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500/90 shrink-0">Tên CT/DA:</span>
                <Tooltip title={record.construction.name} mouseEnterDelay={0.5}>
                  <Link to={`/${lang}${routerLinks('Construction')}/${record?.construction.id}/construction-monitor`}>
                    {record.construction.name}
                  </Link>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500/90 shrink-0">Quản lý dự án:</span>
                <span>
                  {record.construction.investor.name} - {record.construction.ownerTypeCode}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500/90 shrink-0">Cấp điện áp:</span>
                <Tag color={record.construction.voltage.description ?? 'default'} className="rounded-full mx-0">
                  {record.construction.voltage.title}
                </Tag>
              </div>
            </div>
          );
        },
      },
      {
        title: 'Các mốc quan trọng',
        dataIndex: 'importantMilestones',
        key: 'importantMilestones',
        width: 240,
        render: (_, record) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500/90 shrink-0">Giai đoạn:</span>
              <span>{record.templateStageName ?? '-'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500/90 shrink-0">Năm giao A:</span>
              <span>{record.assignmentAYear ?? '-'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500/90 shrink-0">Ngày phê duyệt:</span>
              <span>{record.approvalDate ? formatDayjsDate(record.approvalDate) : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500/90 shrink-0">Ngày xuất hóa đơn:</span>
              <span>{record.invoiceIssuanceDates[0] ? formatDayjsDate(record.invoiceIssuanceDates[0]) : '-'}</span>
            </div>
          </div>
        ),
      },
      {
        title: 'Các giá trị hợp đồng',
        dataIndex: 'contractValues',
        key: 'contractValues',
        align: 'right',
        width: 330,
        render: (_, record) => (
          <div className="grid grid-cols-[1fr_auto] gap-x-1.5 gap-y-1">
            <span className="text-gray-500/90 shrink-0 text-start">GT hợp đồng (trước VAT):</span>
            <span className="text-end">
              {record.valueBeforeVatAmount ? `${formatCurrency(record.valueBeforeVatAmount)} VND` : 0}
            </span>
            <span className="text-gray-500/90 shrink-0 text-start">Sản lượng dự kiến:</span>
            <span className="text-end">
              {record.expectedVolume ? `${formatCurrency(record.expectedVolume)} VND` : 0}
            </span>
            <span className="text-gray-500/90 shrink-0 text-start">GT nghiệm thu (trước VAT):</span>
            <span className="text-end">
              {record.acceptanceValueBeforeVatAmount
                ? `${formatCurrency(record.acceptanceValueBeforeVatAmount)} VND`
                : 0}
            </span>
            <span className="text-gray-500/90 shrink-0 text-start">Giá trị đã xuất hóa đơn:</span>
            <span className="text-end">{record.paidAmount ? `${formatCurrency(record.paidAmount)} VND` : 0}</span>
          </div>
        ),
      },
      {
        key: 'action',
        width: 80,
        align: 'center',
        fixed: 'right',
        render: (_, record) => {
          const itemsMenu: ItemType[] = [
            {
              key: 0,
              label: (
                <Link
                  to={`/${lang}${routerLinks('Contract')}/${record?.id}`}
                  className="px-3 py-2 block text-gray-900 hover:!text-blue-500"
                >
                  Xem chi tiết
                </Link>
              ),
              style: {
                padding: 0,
              },
            },
            {
              key: 1,
              label: (
                <Tooltip
                  title={
                    !rightMapFacade.rightData?.rightCodes?.includes('UPDATE')
                      ? 'Bạn không có quyền thực hiện thao tác này'
                      : null
                  }
                >
                  <div
                    className={`${!rightMapFacade.rightData?.rightCodes?.includes('UPDATE') ? 'cursor-not-allowed' : ''}`}
                  >
                    <Link
                      to={`/${lang}${routerLinks('Contract')}/${record?.id}/edit`}
                      className={`px-3 py-2 block ${!rightMapFacade.rightData?.rightCodes?.includes('UPDATE') ? 'pointer-events-none !text-gray-500' : 'text-gray-900 hover:!text-blue-500'}`}
                    >
                      Cập nhật
                    </Link>
                  </div>
                </Tooltip>
              ),
              style: {
                padding: 0,
              },
            },
            {
              key: 2,
              label: (
                <Tooltip
                  title={
                    !rightMapFacade.rightData?.rightCodes?.includes('DELETE')
                      ? 'Bạn không có quyền thực hiện thao tác này'
                      : null
                  }
                >
                  <div
                    className={`${!rightMapFacade.rightData?.rightCodes?.includes('DELETE') ? 'cursor-not-allowed' : ''}`}
                  >
                    <p
                      onClick={() => handleDelete(record?.id)}
                      className={`px-3 py-2 block ${!rightMapFacade.rightData?.rightCodes?.includes('DELETE') ? 'pointer-events-none !text-gray-500' : 'text-gray-900 hover:!text-blue-500'}`}
                    >
                      Xoá
                    </p>
                  </div>
                </Tooltip>
              ),
              style: {
                padding: 0,
              },
            },
          ];

          const isDropdownShow = !!itemsMenu.length;

          return (
            <Space size={0}>
              <Dropdown
                placement="bottomRight"
                trigger={isDropdownShow ? ['click'] : []}
                menu={{
                  items: isDropdownShow ? itemsMenu : [],
                }}
                disabled={!isDropdownShow}
              >
                {/* <CaretDownOutlined
                  style={{
                    visibility: isDropdownShow ? 'visible' : 'hidden',
                  }}
                  className="text-blue-500 cursor-pointer px-2"
                /> */}
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          );
        },
      },
    ],
    [contractFacade.pagination],
  );
  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'All',
        label: (
          <div className="flex gap-1 items-center">
            <span className="text-nowrap font-medium">Tất cả</span>
            <span className="bg-blue-500 text-white text-xs px-2 pb-0.5 leading-5 rounded-full">
              {contractFacade.countByStatusResult?.All ?? 0}
            </span>
          </div>
        ),
      },
      ...Object.values(contractImplementationStatuses).map((x) => ({
        key: x.value,
        label: (
          <div className="flex gap-1 items-center">
            <span className="text-nowrap font-medium">{x.label}</span>
            <span
              style={{ backgroundColor: token[x.color as keyof typeof token] as string }}
              className="text-white text-xs px-2 pb-0.5 leading-5 rounded-full"
            >
              {contractFacade.countByStatusResult?.[x.value] ?? 0}
            </span>
          </div>
        ),
      })),
    ],
    [contractFacade.countByStatusResult, token],
  );

  const loadData = (
    query: { page?: number; size?: number; filter?: Record<string, any>; sort?: string },
    force?: boolean,
  ) => {
    setSearchParams((x) => {
      ['page', 'size', 'sort'].forEach((field) => {
        const value = query[field as keyof typeof query] ?? queryParams[field as keyof typeof queryParams];
        x.delete(field);
        if (value != queryDefaultValue[field as keyof typeof queryDefaultValue]) {
          x.set(field, value.toString());
        }
      });
      const combinedFilter = {
        ...queryParams.filter,
        ...(query.filter ?? {}),
      };
      Object.entries(combinedFilter).forEach(([key, value]) => {
        if (value == null || (typeof value === 'string' && !value)) {
          delete combinedFilter[key];
        }
      });
      const filterJson = JSON.stringify(combinedFilter);
      x.delete('filter');
      if (filterJson != queryDefaultValue.filter) {
        x.set('filter', filterJson);
      }
      return x;
    });
    if (force) {
      forceReload.current = true;
    }
  };

  const filterTagsList = useMemo(() => {
    const data: [string, string, string][] = [];
    const availableFilterField = Object.keys(contractFilterFieldNameMap);

    Object.entries(queryParams.filter).forEach(([key, value]) => {
      if (!availableFilterField.includes(key)) {
        return;
      }

      let stringValue = '';

      switch (key) {
        case 'fullTextSearch':
        case 'code':
        case 'assignmentAYear':
          stringValue = value;
          break;
        case 'constructionId':
          if (!isLoadAllData(constructionFacade)) {
            constructionFacade.get({ size: -1 });
          }
          stringValue = constructionFacade.pagination?.content.find((x) => x.id === value)?.name || value;
          break;
        case 'consultingServiceId':
          stringValue = codeTypeFacade.consultServiceData?.content.find((x) => x.id === value)?.title || value;
          break;
        case 'voltageTypeCode':
          stringValue = codeTypeFacade.voltageTypeData?.content.find((x) => x.code === value)?.title || value;
          break;
        case 'templateStageId':
          stringValue =
            constructionFacade.pagination?.content
              .reduce((acc, cur) => [...acc, ...(cur.templateStages ?? [])], [] as TemplateStage[])
              .find((x) => x.id === value)?.name || value;
          break;
        case 'valueBeforeVatAmountRange':
          if (Array.isArray(value)) {
            const min = typeof value[0] === 'number' ? formatCurrency(value[0]) + ' VND' : '';
            const max = typeof value[1] === 'number' ? formatCurrency(value[1]) + ' VND' : '';
            stringValue = min && max ? `${min} - ${max}` : min || max;
          }
          break;
        case 'approvalDateRange':
        case 'invoiceIssuanceDateRange':
          if (Array.isArray(value)) {
            const start = value[0] ? formatDayjsDate(value[0]) : '';
            const end = value[1] ? formatDayjsDate(value[1]) : '';
            stringValue = `${start} - ${end}`;
          }
          break;
      }

      data.push([key, contractFilterFieldNameMap[key as keyof typeof contractFilterFieldNameMap], stringValue]);
    });

    return (
      <>
        {data.map((x) => (
          <Tag
            key={x[0]}
            className="rounded-full py-0.5"
            color="#E6F4FF"
            closable
            closeIcon={<CloseOutlined className="p-0.5 rounded hover:bg-slate-200" style={{ color: '#1890ff' }} />}
            onClose={() => loadData({ filter: { [x[0]]: undefined } })}
          >
            <span className="text-black pl-0.5 text-sm">
              {x[1]}
              {': '}
              {x[2]}
            </span>
          </Tag>
        ))}
      </>
    );
  }, [
    queryParams.filter,
    codeTypeFacade.organizationData,
    constructionFacade.pagination,
    codeTypeFacade.consultServiceData,
  ]);

  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Xác nhận xoá hợp đồng?',
      content: 'Bạn có chắc chắn muốn xoá hợp đồng này không?',
      okText: 'Xoá',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          message.loading({ content: 'Đang xoá hợp đồng...', duration: 60000, key: messageKey });
          contractFacade.delete(id).finally(() => {
            message.destroy(messageKey);
          });
        }
      },
    });
  };

  useEffect(() => {
    loadData({}, true);
    codeTypeFacade.getConsultService({ size: -1 });
    codeTypeFacade.getVoltageType({ size: -1 });
    rightMapFacade.getRightMapByCode('CONTRACT');

    if (!isLoadAllData(constructionFacade)) {
      constructionFacade.get({ size: -1 });
    }
  }, []);

  useEffect(() => {
    switch (contractFacade.status) {
      case EStatusState.deleteFulfilled:
      case EContractStatus.importExcelFulfilled:
        loadData({}, true);
        break;
    }
  }, [contractFacade.status]);

  useEffect(() => {
    if (isEqual(queryParams, oldQueryParams.current) && !forceReload.current) {
      return;
    }

    contractFacade.get({
      ...queryParams,
      filter: JSON.stringify(queryParams.filter),
    });

    const countQueryParams = {
      ...queryParams,
      filter: {
        ...queryParams.filter,
        status: undefined,
      },
    };
    const countOldQueryParams = {
      ...oldQueryParams.current,
      filter: {
        ...oldQueryParams.current.filter,
        status: undefined,
      },
    };

    oldQueryParams.current = queryParams;

    if (isEqual(countQueryParams, countOldQueryParams) && !forceReload.current) {
      return;
    }

    forceReload.current = false;
    contractFacade.countByStatus({
      ...countQueryParams,
      filter: JSON.stringify(countQueryParams.filter),
    });
  }, [queryParams, forceReload.current]);

  return (
    <>
      <SubHeader
        tool={
          <div className="pr-1 flex gap-1.5">
            <Tooltip
              title={
                !rightMapFacade.rightData?.rightCodes?.includes('EXPORTIMPORTFILE')
                  ? 'Bạn không có quyền thực hiện thao tác này'
                  : null
              }
            >
              <Button
                variant="outlined"
                color="primary"
                icon={<UploadOutlined />}
                disabled={!rightMapFacade.rightData?.rightCodes?.includes('EXPORTIMPORTFILE')}
                loading={contractFacade.isImportingFile}
                onClick={() => contractFacade.set({ isImportFileModalOpen: true })}
              >
                Nhập file
              </Button>
            </Tooltip>
            <Tooltip
              title={
                !rightMapFacade.rightData?.rightCodes?.includes('EXPORTIMPORTFILE')
                  ? 'Bạn không có quyền thực hiện thao tác này'
                  : null
              }
            >
              <Button
                variant="outlined"
                color="primary"
                icon={<DownloadOutlined />}
                disabled={!rightMapFacade.rightData?.rightCodes?.includes('EXPORTIMPORTFILE')}
                loading={contractFacade.isExportingFile}
                onClick={() => contractFacade.set({ isExportFileModalOpen: true })}
              >
                Xuất file
              </Button>
            </Tooltip>
            <Tooltip
              title={
                !rightMapFacade.rightData?.rightCodes?.includes('ADD')
                  ? 'Bạn không có quyền thực hiện thao tác này'
                  : null
              }
            >
              <Link to={`/${lang}${routerLinks('Contract')}/create`}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled={!rightMapFacade.rightData?.rightCodes?.includes('ADD')}
                >
                  Thêm mới
                </Button>
              </Link>
            </Tooltip>
          </div>
        }
      />
      <div className="p-4">
        <Card styles={{ body: { padding: 0 } }}>
          <Tabs
            items={tabItems}
            className="px-4"
            onChange={(activeKey) => {
              loadData({ filter: { implementationStatus: activeKey === 'All' ? undefined : activeKey }, page: 1 });
            }}
            activeKey={queryParams.filter?.implementationStatus ?? 'All'}
          />
          <div className="flex gap-4 p-4">
            <div className="flex-1">
              <SearchWidget
                form={(form) => (formRef.current = form)}
                callback={(value) => loadData({ filter: { fullTextSearch: value } })}
                placeholder="Tìm kiếm theo mã hợp đồng, tên công trình/dự án, giai đoạn, năm giao A"
                value={queryParams.filter?.fullTextSearch}
              />
            </div>
            <Select
              placeholder="Chọn loại dịch vụ tư vấn"
              className="w-52"
              showSearch
              optionFilterProp="label"
              allowClear
              options={consultServiceList}
              value={queryParams.filter?.consultingServiceId}
              onChange={(value) => {
                loadData({ filter: { consultingServiceId: value }, page: 1 });
              }}
              optionRender={(item) => (
                <Tag color={item.data.color} className="rounded-full mx-0 text-sm px-3.5 py-0.5">
                  {item.label}
                </Tag>
              )}
            />
            <Select
              placeholder="Chọn cấp điện áp"
              className="w-40"
              showSearch
              optionFilterProp="label"
              allowClear
              options={voltageTypeList}
              value={queryParams.filter?.voltageTypeCode}
              onChange={(value) => {
                loadData({ filter: { voltageTypeCode: value }, page: 1 });
              }}
              optionRender={(item) => (
                <Tag color={item.data.color} className="rounded-full mx-0 text-sm px-3.5 py-0.5">
                  {item.label}
                </Tag>
              )}
            />
            <Button
              icon={<ReloadOutlined />}
              loading={contractFacade.isLoading}
              onClick={loadData.bind(null, {}, true)}
            >
              Tải lại
            </Button>
            <FilterDrawer filter={queryParams.filter} loadFunc={(filter, force) => loadData({ filter }, force)} />
          </div>
          <div ref={filterTagsContainer} className="flex flex-wrap gap-y-2 justify-start px-4 pb-4 empty:pb-0">
            {filterTagsList}
          </div>
          <Table
            scroll={{ y: `calc(100vh - 376px - ${filterTagsContainer.current?.clientHeight ?? 0}px)` }}
            dataSource={dataSource}
            columns={columns as any}
            loading={contractFacade.isLoading}
            pagination={{
              defaultPageSize: queryDefaultValue.size,
              current: contractFacade?.pagination?.page || 1,
              total: contractFacade?.pagination?.totalElements || 0,
              onChange: (newPage, newSize) => loadData({ page: newPage, size: newSize }),
            }}
          />
        </Card>
      </div>
      <ExportFileModal queryParams={queryParams} />
      <ImportFileModal />
    </>
  );
};

export default ContractPage;
