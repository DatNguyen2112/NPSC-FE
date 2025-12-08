import {
  CaretDownOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
  FilterOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { ConstructionFacade, ConstructionModel, UserModal } from '@store';
import {
  lang,
  rightMapCodeConstruction,
  routerLinks,
  scrollLeftWhenChanging,
  scrollTopWhenChanging,
  uuidv4,
} from '@utils';
import { DatePicker, Drawer, Dropdown, FormInstance, MenuProps, Spin, TableColumnsType, Tabs } from 'antd';
import {
  Badge,
  Button,
  Flex,
  Form,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  TabsProps,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { IssueManagementFacade, IssueModel, IssueQueryModel } from 'src/store/issue-management';
import { RightMapRoleFacade } from '@store';

interface DataType extends IssueModel {
  key?: React.Key;
  lineNumber: number;
}

let filterObject: IssueQueryModel;
let fillQuery: QueryParams;
let foundUser: UserModal[];
let foundCreatedUser: UserModal[];
let foundConstruction: ConstructionModel[];

const IssueManagement = () => {
  const issueManagementFacade = IssueManagementFacade();
  const [modalApi, contextModalApi] = Modal.useModal();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const navigate = useNavigate();
  const [formFilter] = Form.useForm();
  const rightMapRoleFacade = RightMapRoleFacade()
  const constructionFacade = ConstructionFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  let filterObj = JSON.parse(searchParams.get('filter') || '{}');
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
  if (filter) {
    filterObject = JSON.parse(filter);
  }
  const parsedFilter = JSON.parse(filter);

  useEffect(() => {
    switch (filterObject?.status) {
      case 'COMPLETED':
        filterObject.activeTab = 'COMPLETED';
        break;
      case 'WAIT_PROCESSING':
        filterObject.activeTab = 'WAIT_PROCESSING';
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
        filter: JSON.stringify({
          ...filterObject,
          constructionId: location.state ? location.state?.constructionId : filterObject?.constructionId,
        }),
      },
    });
  }, [filterObject?.status]);

  useEffect(() => {
    rightMapRoleFacade.getRightMapByListCode(rightMapCodeConstruction)
    constructionFacade.get({ size: -1 });
    issueManagementFacade.getIssueByStatus();
    if (filterObject.dateRange) {
      issueManagementFacade.set({
        dateRange: [dayjs(filterObject?.dateRange[0]), dayjs(filterObject?.dateRange[1])],
      });
    }
    if (filterObject.expiryDate) {
      issueManagementFacade.set({
        expiryDate: [dayjs(filterObject?.expiryDate[0]), dayjs(filterObject?.expiryDate[1])],
      });
    }
    if (!parsedFilter) return;

    // Format ngày nếu có
    const formattedFilter = {
      ...parsedFilter,
      dateRange: [
        filterObject.dateRange ? dayjs(parsedFilter.dateRange[0]) : undefined,
        filterObject.dateRange ? dayjs(parsedFilter.dateRange[1]) : undefined,
      ],
      expiryDate: [
        filterObject.expiryDate ? dayjs(parsedFilter.expiryDate[0]) : undefined,
        filterObject.expiryDate ? dayjs(parsedFilter.expiryDate[1]) : undefined,
      ],
      endDate: parsedFilter.endDate ? dayjs(parsedFilter.endDate) : undefined,
    };

    // Set giá trị cho form
    formFilter.setFieldsValue(formattedFilter);
  }, []);

  useEffect(() => {
    switch (issueManagementFacade.status) {
      case EStatusState.deleteFulfilled:
        onChangeDataTable({
          query: { page, size, sort, filter },
        });
        break;
    }
  }, [issueManagementFacade.status]);

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
    const fillQuery: QueryParams = { ...issueManagementFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    issueManagementFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    issueManagementFacade.set({ query: props.query, ...props.setKeyState });
  };
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

  const onChange = (key: string) => {
    issueManagementFacade.set({
      dateRange: undefined,
      activeKey: key,
    });
    if (key === 'all') {
      delete filterObject?.status;
      issueManagementFacade.set({ activeKey: 'all', searchValue: undefined });
      filterObject.FullTextSearch = '';
    }
    filterObject.activeTab = key;
    if (key !== 'all') {
      filterObject.status = key;
    }

    delete filterObject?.dateRange;
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
  const handleUpdate = (id: string) => {
    navigate(`/${lang}${routerLinks('IssueManagement')}/${id}/edit`);
  };
  const handleDelete = (id: string) => {
    modalApi.confirm({
      width: 600,
      title: `Bạn chắc chắn muốn xóa vướng mắc này?`,
      content: 'Thao tác này sẽ xóa vướng mắc bạn đã chọn. Thao tác này không thể khôi phục.',
      onOk: () => {
        id && issueManagementFacade.delete(id);
      },
      onCancel: () => {},
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true },
      cancelText: 'Thoát',
      // cancelButtonProps: { type: 'default', danger: true },
      closable: true,
    });
  };
  const onFilter = (values: any) => {
    if (values.dateRange && !values.dateRange[0] && !values.dateRange[1]) {
      values.dateRange = undefined;
    }
    if (values.expiryDate && !values.expiryDate[0] && !values.expiryDate[1]) {
      values.expiryDate = undefined;
    }
    filterObj = {
      ...filterObj,
      createdByUserId: values.createdByUserId,
      userId: values.userId ? values.userId : undefined,
      dateRange: values.dateRange ? values.dateRange : undefined,
      expiryDate: values.expiryDate ? values.expiryDate : undefined,
      priorityLevel: values.priorityLevel,
    };

    const query: QueryParams = {
      page: 1,
      size: 20,
      filter: JSON.stringify(filterObj),
    };
    onChangeDataTable({ query });
    formFilter.resetFields();

    issueManagementFacade.set({ isFilter: false });
  };
  const getRelativeTime = (dateString?: string, statusCode?: string): React.ReactNode | undefined => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // reset giờ về 00:00:00

    let date: Date;
    if (dateString) {
      const inputDate = new Date(dateString);
      date = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate()); // reset giờ về 00:00:00
    } else {
      date = today;
    }
    // Tính số ngày chênh lệch (today - date)
    const diffInMs = today.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    // Nếu status đã COMPLETED thì không hiển thị icon gì
    if (statusCode === 'COMPLETED' || statusCode === 'CANCELED') {
      return undefined;
    }

    if (diffInDays === 0) {
      return (
        <Tooltip placement="top" title="Vướng mắc đã đến hạn xử lý">
          <ExclamationCircleFilled className="text-red-500" />
        </Tooltip>
      );
    }
    if ([-1, -2, -3].includes(diffInDays)) {
      return (
        <Tooltip placement="top" title="Vướng mắc sắp đến hạn xử lý">
          <ExclamationCircleFilled className="text-orange-300" />
        </Tooltip>
      );
    }

    if (diffInDays > 0) {
      return (
        <Tooltip placement="top" title={`Vướng mắc đã quá hạn xử lý ${Math.abs(diffInDays)} ngày`}>
          <ExclamationCircleFilled className="text-red-500" />
        </Tooltip>
      );
    }
    return undefined;
  };
  const dropdownItems: MenuProps['items'] = [
    {
      key: 'view',
      label: 'Xem chi tiết'
    },
    {
      key: 'update',
      label:
        rightMapRoleFacade?.rightDatas
        && rightMapRoleFacade?.rightDatas?.length > 0
        && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('UPDATEISSUE')
        ? 'Cập nhật'
        : <Tooltip title={'Bạn không có quyền truy cập chức năng này'}>Cập nhật</Tooltip>,
      disabled: rightMapRoleFacade?.rightDatas
        && rightMapRoleFacade?.rightDatas?.length > 0
        && !rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('UPDATEISSUE')
    },
    {
      key: 'delete',
      label: rightMapRoleFacade?.rightDatas
      && rightMapRoleFacade?.rightDatas?.length > 0
      && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('DELETEISSUE')
        ? 'Xoá'
        : <Tooltip title={'Bạn không có quyền truy cập chức năng này'}><p className={'w-full'}>Xoá</p></Tooltip>,
      disabled: rightMapRoleFacade?.rightDatas
        && rightMapRoleFacade?.rightDatas?.length > 0
        && !rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('DELETEISSUE')
    },
  ];
  const dataSource: DataType[] =
    issueManagementFacade.pagination?.content.map(
      (item, index): DataType => ({
        lineNumber: (Number(searchParams.get('page') ?? 0) - 1) * Number(searchParams.get('size') ?? 0) + index + 1,
        key: uuidv4(),
        id: item.id,
        code: item.code,
        startDate: item.startDate,
        endDate: item.endDate,
        expiryDate: item.expiryDate,
        user: item.user,
        totalAmount: item.totalAmount,
        remainingAmount: item.remainingAmount,
        status: item.status,
        content: item.content,
        createdByUserName: item.createdByUserName,
        createdOnDate: item.createdOnDate,
        construction: item.construction,
        priorityLevel: item.priorityLevel,
      }),
    ) ?? [];
  const columns: TableColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 60,
      align: 'center',
    },
    {
      title: 'Mã vướng mắc',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (value, record) => {
        return (
          <Flex gap={5} align="center">
            <Link className="hover:underline" to={`/${lang}${routerLinks('IssueManagement')}/${record?.id}/detail`}>
              {value}
            </Link>
            {getRelativeTime(record?.expiryDate, record?.status)}
          </Flex>
        );
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByUserName',
      key: 'createdByUserName',
      ellipsis: true,
      fixed: 'left',
      width: 160,
      render: (value, record) => (
        <div className={'grid gap-0.5'}>
          {/*<Typography.Text className={'font-semibold'}>{record?.construction?.name}</Typography.Text>*/}
          <p>{value}</p>
          <p className={'text-gray-500'}>{dayjs(record.createdOnDate).format('DD/MM/YYYY')}</p>
        </div>
      ),
    },
    {
      title: 'Nội dung chính',
      dataIndex: 'content',
      key: 'startDate',
      width: 270,
      render: (value, record) => (
        <div>
          <p className={'line-clamp-1'}>{value}</p>
          <p className={'text-gray-500'}>{record.construction?.name}</p>
          <Flex gap={6}>
            <Badge
              status={
                (record.priorityLevel == 'HIGH' && 'error') ||
                (record.priorityLevel === 'MEDIUM' && 'warning') ||
                (record.priorityLevel === 'LOW' && 'success') ||
                'default'
              }
              text={
                (record.priorityLevel === 'HIGH' && 'Cao') ||
                (record.priorityLevel === 'MEDIUM' && 'Trung bình') ||
                (record.priorityLevel === 'LOW' && 'Thấp')
              }
            />
            <Tag
              className={'rounded-[10px]'}
              color={
                (record.status === 'COMPLETED' && 'green') ||
                (record.status === 'WAIT_PROCESSING' && 'orange') ||
                (record.status === 'CANCELED' && 'red') ||
                'default'
              }
            >
              {(record.status === 'COMPLETED' && 'Đã xử lý') ||
                (record.status === 'WAIT_PROCESSING' && 'Chờ xử lý') ||
                (record.status === 'CANCELED' && 'Đã huỷ')}
            </Tag>
          </Flex>
        </div>
      ),
    },
    {
      title: 'Ngày chịu trách nhiệm',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 180,
      render: (_, record) => (
        <div>
          <p className={'text-gray-700 font-semibold'}>{record.user?.name}</p>
          <p className={'text-gray-500 italic'}>{record.user?.phongBan?.title}</p>
          <p className={'text-gray-500 italic'}>{record.user?.chucVu?.tenChucVu}</p>
        </div>
      ),
    },
    {
      title: 'Hạn xử lý',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 100,
      render: (value) => <Typography.Text>{dayjs(value).format('DD/MM/YYYY')}</Typography.Text>,
    },
    {
      // title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 60,
      render: (record) => (
        <Dropdown
          placement="bottomRight"
          trigger={['click']}
          menu={{
            items: dropdownItems,
            onClick: (item) => {
              switch (item.key) {
                case 'update':
                  handleUpdate(record.id);
                  break;
                case 'delete':
                  handleDelete(record.id);
                  break;
                case 'view':
                 navigate(`/${lang}${routerLinks('IssueManagement')}/${record?.id}/detail`)
                  break;
              }
            },
          }}
        >
            <Button icon={<MoreOutlined />} type={'text'}/>
        </Dropdown>
      ),
    },
  ];
  if (filterObject.userId) {
    //@ts-ignore
    foundUser = userFacade.pagination?.content.filter((method) => filterObject.userId?.includes(method?.id));
  }
  if (filterObject.createdByUserId) {
    //@ts-ignore
    foundCreatedUser = userFacade.pagination?.content.filter((method) =>
      filterObject.createdByUserId?.includes(method?.id as string),
    );
  }
  if (filterObject.constructionId) {
    //@ts-ignore
    foundConstruction = constructionFacade.pagination?.content.filter((method) =>
      filterObject.constructionId?.includes(method?.id),
    );
  }

  const removeFilter = (key: string) => {
    switch (key) {
      case 'fullTextSearch':
        delete filterObject?.FullTextSearch;
        formRef.current?.resetFields();
        break;
      case 'dateRange':
        delete filterObject?.dateRange;
        issueManagementFacade.set({ dateRange: undefined });
        formFilter.setFieldValue('dateRange', undefined)
        break;
      case 'createdByUserId':
        delete filterObject?.createdByUserId;
        break;
      case 'userId':
        delete filterObject?.userId;
        break;
      case 'expiryDate':
        delete filterObject?.expiryDate;
        issueManagementFacade.set({ expiryDate: undefined });
        formFilter.setFieldValue('expiryDate', undefined)
        break;
      case 'status':
        delete filterObject?.status;
        break;
      case 'priorityLevel':
        delete filterObject?.priorityLevel;
        formFilter.setFieldValue('priorityLevel', undefined)
        break;
      case 'constructionId':
        delete filterObject?.constructionId;
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

  const filterTag = (
    <div className={'m-2 mx-3.5 flex gap-2 items-center flex-wrap'}>
      {filterObject?.FullTextSearch && true && (
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
          Kết quả tìm kiếm : {filterObject?.FullTextSearch}
        </Tag>
      )}

      {
        filterObject?.dateRange  && (
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
          Ngày tạo : {''} {'Từ'} {''}
          {filterObject?.dateRange ? dayjs(filterObject?.dateRange[0]).format('DD-MM-YYYY') : null}
          {''} {'đến '} {filterObject?.dateRange ? dayjs(filterObject?.dateRange[1]).format('DD-MM-YYYY') : null}
        </Tag>
      )}
      {filterObject?.userId && true && (
        <Tag
          className="py-1 px-3 rounded-full !h-8"
          color={'purple'}
          closable
          onClose={() => {
            if (filterObject?.userId != undefined) {
              removeFilter('userId');
            }
          }}
        >
          Người chịu trách nhiệm : {foundUser?.map((item) => item.name)}
        </Tag>
      )}
      {filterObject?.constructionId && true && (
        <Tag
          className="py-1 px-3 rounded-full !h-8"
          color={'cyan'}
          closable
          onClose={() => {
            if (filterObject?.constructionId != undefined) {
              removeFilter('constructionId');
            }
          }}
        >
          Dự án : {foundConstruction?.map((item) => item.name)}
        </Tag>
      )}
      {filterObject?.createdByUserId && true && (
        <Tag
          className="py-1 px-3 rounded-full !h-8"
          color={'purple'}
          closable
          onClose={() => {
            if (filterObject?.createdByUserId != undefined) {
              removeFilter('createdByUserId');
            }
          }}
        >
          Người tạo : {foundCreatedUser?.map((item) => item.name)}
        </Tag>
      )}
      {filterObject?.status && true && (
        <Tag
          closable
          className="flex py-1 px-3 rounded-full !h-8"
          onClose={() => {
            if (filterObject?.status != null) {
              removeFilter('status');
            }
          }}
          color={
            (filterObject?.status === 'CANCELED' && 'red') ||
            (filterObject?.status === 'COMPLETED' && 'green') ||
            (filterObject?.status === 'WAIT_PROCESSING' && 'orange') ||
            'default'
          }
        >
          <p>
            Trạng thái :
            {(filterObject?.status === 'CANCELED' && ' Đã huỷ') ||
              (filterObject?.status === 'COMPLETED' && ' Đã xử lý') ||
              (filterObject?.status === 'WAIT_PROCESSING' && ' Chờ xử lý')}
          </p>
        </Tag>
      )}
      {filterObject?.priorityLevel && true && (
        <Tag
          className="py-1 px-3 rounded-full !h-8"
          color={'red'}
          closable
          onClose={() => {
            if (filterObject?.priorityLevel != undefined) {
              removeFilter('priorityLevel');
            }
          }}
        >
          Mức độ ưu tiên :{' '}
          {(filterObject.priorityLevel === 'HIGH' && 'Cao') ||
            (filterObject.priorityLevel === 'MEDIUM' && 'Trung bình') ||
            (filterObject.priorityLevel === 'LOW' && 'Thấp')}
        </Tag>
      )}
      {filterObject?.expiryDate && true && (
        <Tag
          className="py-1 px-3 rounded-full !h-8"
          color={'geekblue'}
          closable
          onClose={() => {
            if (filterObject?.expiryDate != undefined) {
              removeFilter('expiryDate');
            }
          }}
        >
          Hạn xử lý : {''} {'Từ'} {''}
          {filterObject?.expiryDate ? dayjs(filterObject?.expiryDate[0]).format('DD-MM-YYYY') : null}
          {''} {'đến '} {filterObject?.expiryDate ? dayjs(filterObject?.expiryDate[1]).format('DD-MM-YYYY') : null}
        </Tag>
      )}
    </div>
  );

  const items: TabsProps['items'] = [
    {
      key: 'all',
      label: (
        <Badge
          showZero
          className="px-3 font-semibold"
          color={'blue'}
          count={issueManagementFacade?.countByStatus?.totalIssue}
        >
          Tất cả
        </Badge>
      ),
      children: (
        <div className={'max-h-full'}>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1">
              <SearchWidget
                tabActive={issueManagementFacade.activeKey}
                form={(form) => (formRef.current = form)}
                callback={onChangeSearch}
                placeholder={'Tìm kiếm theo mã vướng mắc, nội dung chính, tên dự án, người tạo,...'}
              />
            </div>
            <div className={'flex gap-2.5'}>
              <Select
                value={filterObject?.constructionId}
                placeholder={'Chọn dự án'}
                showSearch
                optionFilterProp={'label'}
                allowClear
                options={constructionFacade.pagination?.content?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                className={'!w-96'}
                onChange={(value) => {
                  if (value) {
                    filterObject.constructionId = value;
                  } else {
                    delete filterObject.constructionId;
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
                loading={issueManagementFacade.isLoading}
                onClick={() =>
                  onChangeDataTable({
                    query: {
                      page: 1,
                      size: 20,
                      filter: JSON.stringify(filterObject),
                    },
                  })
                }
              >
                Tải lại
              </Button>
              <Button
                color="primary"
                variant="outlined"
                icon={<FilterOutlined />}
                onClick={() => issueManagementFacade.set({ isFilter: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          {filterTag}
          <div className={'flex flex-col'}>
            <Table
              scroll={{ y: `calc(100vh - 376px)` }}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey={'id'}
            />
            <Pagination
              className={'flex justify-end my-1'}
              size="small"
              align="start"
              showSizeChanger
              current={issueManagementFacade?.query?.page}
              pageSize={issueManagementFacade?.pagination?.size}
              total={issueManagementFacade?.pagination?.totalElements}
              pageSizeOptions={[20, 40, 60, 80]}
              showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
              onChange={(page, pageSize) => {
                filterObject = JSON.parse(searchParams.get('filter') || '{}');
                fillQuery = {
                  page,
                  size: pageSize,
                  filter: JSON.stringify(filterObject),
                };
                onChangeDataTable({ query: fillQuery });
                scrollLeftWhenChanging('.ant-table-body');
                scrollTopWhenChanging('.ant-table-body');
              }}
            />
          </div>

        </div>
      ),
    },
    {
      key: 'COMPLETED',
      label: (
        <Badge
          className={'px-3 font-semibold'}
          color={'green'}
          showZero
          count={issueManagementFacade?.countByStatus?.resolveIssue}
        >
          Đã xử lý
        </Badge>
      ),
      children: (
        <>
          <div className="flex items-center gap-3 pt-3">
            <div className="flex-1">
              <SearchWidget
                form={(form) => (formRef.current = form)}
                callback={onChangeSearch}
                placeholder={'Tìm kiếm theo mã vướng mắc, nội dung chính, tên dự án, người tạo,...'}
              />
            </div>
            <div className={'flex gap-2.5'}>
              <Select
                placeholder={'Chọn dự án'}
                showSearch
                value={filterObject.constructionId}
                optionFilterProp={'label'}
                options={constructionFacade.pagination?.content?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                allowClear
                className={'!w-96'}
              />
              <Button
                icon={<ReloadOutlined />}
                loading={issueManagementFacade.isLoading}
                onClick={() =>
                  onChangeDataTable({
                    query: {
                      page: 1,
                      size: 20,
                      filter: JSON.stringify(filterObject),
                    },
                  })
                }
              >
                Tải lại
              </Button>
              <Button
                color={'primary'}
                variant={'outlined'}
                icon={<FilterOutlined />}
                onClick={() => issueManagementFacade.set({ isFilter: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          {filterTag}
          <div className={'flex flex-col'}>
            <Table
              scroll={{ y: 'calc(100vh - 370px)', x: 'hidden'}}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey={'id'}
            />
            <Pagination
              className={'flex justify-end my-1'}
              size="small"
              align="start"
              showSizeChanger
              current={issueManagementFacade?.query?.page}
              pageSize={issueManagementFacade?.pagination?.size}
              total={issueManagementFacade?.pagination?.totalElements}
              pageSizeOptions={[20, 40, 60, 80]}
              showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
              onChange={(page, pageSize) => {
                filterObject = JSON.parse(searchParams.get('filter') || '{}');
                fillQuery = {
                  page,
                  size: pageSize,
                  filter: JSON.stringify(filterObject),
                };
                onChangeDataTable({ query: fillQuery });
                scrollLeftWhenChanging('.ant-table-body');
                scrollTopWhenChanging('.ant-table-body');
              }}
            />
          </div>
        </>
      ),
    },
    {
      key: 'WAIT_PROCESSING',
      label: (
        <Badge
          className={'px-3 font-semibold'}
          color={'orange'}
          showZero
          count={issueManagementFacade?.countByStatus?.waitResolveIssue}
        >
          Chờ xử lý
        </Badge>
      ),
      children: (
        <div className={'h-full'}>
          <div className="flex items-center gap-3 pt-3">
            <div className="flex-1">
              <SearchWidget
                form={(form) => (formRef.current = form)}
                callback={onChangeSearch}
                placeholder={'Tìm kiếm theo mã vướng mắc, nội dung chính, tên dự án, người tạo,...'}
              />
            </div>
            <div className={'flex gap-2.5'}>
              <Select
                allowClear
                value={filterObject.constructionId}
                placeholder={'Chọn dự án'}
                showSearch
                optionFilterProp={'label'}
                options={constructionFacade.pagination?.content?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                className={'!w-96'}
              />
              <Button
                icon={<ReloadOutlined />}
                loading={issueManagementFacade.isLoading}
                onClick={() =>
                  onChangeDataTable({
                    query: {
                      page: 1,
                      size: 20,
                      filter: JSON.stringify(filterObject),
                    },
                  })
                }
              >
                Tải lại
              </Button>
              <Button
                icon={<FilterOutlined />}
                color={'primary'}
                variant={'outlined'}
                onClick={() => issueManagementFacade.set({ isFilter: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          {filterTag}
          <div className={'flex flex-col'}>
            <Table
              scroll={{ y: 'calc(100vh - 370px)', x: 'hidden'}}
              className={' miniScroll'}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey={'id'}
            />
            <Pagination
              className={'flex justify-end my-1'}
              size="small"
              align="start"
              showSizeChanger
              current={issueManagementFacade?.query?.page}
              pageSize={issueManagementFacade?.pagination?.size}
              total={issueManagementFacade?.pagination?.totalElements}
              pageSizeOptions={[20, 40, 60, 80]}
              showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
              onChange={(page, pageSize) => {
                filterObject = JSON.parse(searchParams.get('filter') || '{}');
                fillQuery = {
                  page,
                  size: pageSize,
                  filter: JSON.stringify(filterObject),
                };
                onChangeDataTable({ query: fillQuery });
                scrollLeftWhenChanging('.ant-table-body');
                scrollTopWhenChanging('.ant-table-body');
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'CANCELED',
      label: (
        <Badge className={'px-3 font-semibold'} count={issueManagementFacade?.countByStatus?.cancelIssue} showZero>
          Đã huỷ
        </Badge>
      ),
      children: (
        <>
          <div className="flex items-center gap-3 pt-3">
            <div className="flex-1">
              <SearchWidget
                form={(form) => (formRef.current = form)}
                callback={onChangeSearch}
                placeholder={'Tìm kiếm theo mã vướng mắc, nội dung chính, tên dự án, người tạo,...'}
              />
            </div>
            <div className={'flex gap-2.5'}>
              <Select
                placeholder={'Chọn dự án'}
                showSearch
                allowClear
                value={filterObject.constructionId}
                optionFilterProp={'label'}
                options={constructionFacade.pagination?.content?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
              <Button
                icon={<ReloadOutlined />}
                loading={issueManagementFacade.isLoading}
                onClick={() =>
                  onChangeDataTable({
                    query: {
                      page: 1,
                      size: 20,
                      filter: JSON.stringify(filterObject),
                    },
                  })
                }
              >
                Tải lại
              </Button>
              <Button
                icon={<FilterOutlined />}
                color={'primary'}
                variant={'outlined'}
                onClick={() => issueManagementFacade.set({ isFilter: true })}
              >
                Bộ lọc khác
              </Button>
            </div>
          </div>
          {filterTag}
          <div className={'flex flex-col'}>
            <Table
              scroll={{ y: 'calc(100vh - 370px)', x: 'hidden'}}
              className={'!h-full !overflow-hidden'}
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey={'id'}
            />
            <Pagination
              className={'flex justify-end'}
              size="small"
              align="start"
              showSizeChanger
              current={issueManagementFacade?.query?.page}
              pageSize={issueManagementFacade?.pagination?.size}
              total={issueManagementFacade?.pagination?.totalElements}
              pageSizeOptions={[20, 40, 60, 80]}
              showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
              onChange={(page, pageSize) => {
                filterObject = JSON.parse(searchParams.get('filter') || '{}');
                fillQuery = {
                  page,
                  size: pageSize,
                  filter: JSON.stringify(filterObject),
                };
                onChangeDataTable({ query: fillQuery });
                scrollLeftWhenChanging('.ant-table-body');
                scrollTopWhenChanging('.ant-table-body');
              }}
            />
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      <SubHeader
        tool={
          rightMapRoleFacade?.rightDatas
          && rightMapRoleFacade?.rightDatas?.length > 0
          && rightMapRoleFacade?.rightDatas[0]?.rightCodes?.includes('ADDISSUE')
            ?
            <Button type="primary" icon={<PlusOutlined />} href={`/#/${lang}${routerLinks('IssueManagement')}/create`}>
              Thêm mới
            </Button>
            :
            <Tooltip
              placement={'top'}
              trigger={'hover'}
              title={'Bạn không có quyền thực hiện chức năng này'}
            >
              <Button type="primary" icon={<PlusOutlined />} disabled={true}>
                Thêm mới
              </Button>

            </Tooltip>

        }
      />
      <div className={'!max-h-full px-4 pt-4'}>
        <Spin spinning={issueManagementFacade.isLoading} >
          {contextModalApi}
          <div className={'px-3 bg-white max-h-full overflow-hidden'}>
            <Tabs rootClassName={'w-full max-h-full  my-1 !overflow-hidden'} activeKey={filterObject?.activeTab} items={items} onChange={onChange} />
          </div>
          <Drawer
            title={'Bộ lọc'}
            maskClosable={false}
            forceRender
            open={issueManagementFacade.isFilter}
            onClose={() => issueManagementFacade.set({ isFilter: false })}
            closeIcon={false}
            extra={
              <Button
                type={'text'}
                icon={<CloseOutlined />}
                onClick={() => issueManagementFacade.set({ isFilter: false })}
              />
            }
            footer={
              <Space className={'flex justify-end'}>
                <Button danger onClick={() => formFilter.resetFields()}>
                  Xóa bộ lọc
                </Button>
                <Button type={'primary'} onClick={formFilter.submit}>
                  Lọc
                </Button>
              </Space>
            }
          >
            <Form
              form={formFilter}
              layout={'vertical'}
              onFinish={onFilter}
              fields={[
                {
                name: 'priorityLevel',
                value: filterObj.priorityLevel ? filterObj.priorityLevel : undefined
                },
              ]}>
              <Form.Item name={'priorityLevel'} label={'Mức độ ưu tiên'}>
                <Select
                  placeholder={'Chọn mức độ ưu tiên'}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={[
                    {
                      label: 'Cao',
                      value: 'HIGH',
                    },
                    {
                      label: 'Trung bình',
                      value: 'MEDIUM',
                    },
                    {
                      label: 'Thấp',
                      value: 'LOW',
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item name={'dateRange'} label={'Ngày tạo'}>
                <DatePicker.RangePicker
                  className="w-full"
                  format="DD-MM-YYYY"
                  placement="bottomRight"
                  allowClear
                />
              </Form.Item>
              <Form.Item name={'expiryDate'} label={'Hạn xử lý'}>
                <DatePicker.RangePicker
                  className="w-full"
                  format="DD-MM-YYYY"
                  placement="bottomRight"
                />
              </Form.Item>
            </Form>
          </Drawer>
        </Spin>
      </div>
    </div>

  );
};

export default IssueManagement;
