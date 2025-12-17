import {
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
  FlagOutlined,
  FundProjectionScreenOutlined,
  MoreOutlined,
  PartitionOutlined,
  PlusOutlined,
  SaveOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  CodeTypeFacade,
  CodeTypeManagementFacade,
  CodeTypeModel,
  ConstructionFacade,
  EStatusTask,
  EStatusTaskPersonal,
  GlobalFacade,
  PriorityLevelMap,
  PriorityPersonalLevelMap,
  RightMapRoleFacade,
  TaskFacade,
  TaskFilterFieldNameMap,
  TaskModel,
  TaskPersonalFacade,
  TaskPersonalModel,
  TaskStatusMap,
} from '@store';
import { formatDayjsDate, getRandomHexColor, lang, routerLinks } from '@utils';
import {
  App,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Dropdown,
  Empty,
  Flex,
  Form,
  FormInstance,
  Input,
  MenuProps,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
  TabsProps,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { ItemType } from 'antd/es/menu/interface';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import WorkCalender from './WorkCalender/work-calender';
import { QuickUpdate } from './quick-update';

const { Text } = Typography;

export default function WorkReport() {
  const taskFacade = TaskFacade();
  const [form] = Form.useForm();
  const taskPersonalFacade = TaskPersonalFacade();
  const globalFacade = GlobalFacade();
  const constructionFacade = ConstructionFacade();
  const rightMapFacade = RightMapRoleFacade();
  const codeTypeFacade = CodeTypeFacade();
  const codeTypeManagementFacade = CodeTypeManagementFacade();
  const { modal } = App.useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [approvalTaskForm] = Form.useForm();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const [rejectTaskForm] = Form.useForm();
  const {
    page,
    size,
    filter = '{}',
    sort = '',
    id = '',
    activeTabPersonal = 'task_construction',
  } = {
    ...Object.fromEntries(searchParams),
    page: Number(searchParams.get('page') || 1),
    size: Number(searchParams.get('size') || 20),
  };
  const parsedFilter = JSON.parse(filter);

  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...parsedFilter, year: parsedFilter?.year ? parsedFilter?.year : dayjs().year() }),
      },
    });

    if (parsedFilter?.activeTabPersonal === 'task_personal') {
      onChangeDataTablePersonal({
        query: {
          page: 1,
          size,
          filter: JSON.stringify({ ...parsedFilter }),
        },
      });
    }

    constructionFacade.get({
      size: -1,
      filter: JSON.stringify({ taskUserId: globalFacade.user?.userId }),
    });

    rightMapFacade.getRightMapByCode('CONSTRUCTION');
    codeTypeFacade.get({ size: -1 });
    if (parsedFilter != null) {
      constructionFacade.set({
        activeTabPersonal: parsedFilter?.activeTabPersonal ?? 'task_construction',
      });
    }
    return () => {
      taskFacade.set({
        selectedRowKeysTable: [],
        selectedRows: [],
      });
    };
  }, []);

  useEffect(() => {
    switch (taskFacade.status) {
      case EStatusState.deleteFulfilled:
      case EStatusState.putFulfilled:
      case EStatusTask.deleteManyFulfilled:
      case EStatusTask.putStatusManyFulfilled:
      case EStatusTask.putStatusFulfilled:
        onChangeDataTable({});
        taskFacade.set({ selectedRowKeysTable: [], selectedRows: [], isEditQuickUpdate: false });
        rejectTaskForm.resetFields();
        break;
    }
  }, [taskFacade.status]);

  useEffect(() => {
    switch (taskPersonalFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.deleteFulfilled:
      case EStatusState.putFulfilled:
      case EStatusTaskPersonal.deleteManyFulfilled:
      case EStatusTaskPersonal.putStatusManyFulfilled:
      case EStatusTaskPersonal.putStatusFulfilled:
        form.resetFields();
        onChangeDataTablePersonal({});
        taskPersonalFacade.set({
          selectedRowKeysTable: [],
          selectedRows: [],
          isEditQuickUpdate: false,
          isChooseFast: false,
        });
        break;
    }
  }, [taskPersonalFacade.status]);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.postFulfilled:
        codeTypeFacade.get({ size: -1 });
        setIsAdding(false);
        break;
    }
  }, [codeTypeManagementFacade.status]);

  const warningRequest = useMemo(() => {
    const today = dayjs().startOf('day');
    return (
      taskFacade.pagination?.content
        ?.filter((x) => x.status !== TaskStatusMap.Passed.value && x.status !== TaskStatusMap.Failed.value)
        .reduce(
          (acc, curr) => {
            acc[curr.id] = dayjs(curr.endDateTime).startOf('day').diff(today, 'day');
            return acc;
          },
          {} as Record<string, number>,
        ) ?? {}
    );
  }, [taskFacade.pagination?.content]);

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
    const fillQuery: QueryParams = { ...taskFacade.query, ...props.query };
    fillQuery.filter = JSON.stringify({
      ...JSON.parse(fillQuery.filter || '{}'),
      userId: globalFacade.user?.userId,
    });
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    taskFacade.set({ query: props.query, ...props.setKeyState });
    taskFacade.get(fillQuery!);
    taskFacade.getStatusSummary({
      size: -1,
      filter: JSON.stringify({ userId: globalFacade.user?.userId, year: JSON.parse(fillQuery?.filter)?.year }),
    });
    taskFacade.getOverviewSummary({
      size: -1,
      filter: JSON.stringify({ userId: globalFacade.user?.userId, year: JSON.parse(fillQuery?.filter)?.year }),
    });
  };

  // Công việc cá nhân
  const onChangeDataTablePersonal = (props: { query?: QueryParams; setKeyState?: object }) => {
    if (!props.query) {
      props.query = {
        page,
        size,
        filter,
        sort,
        id,
        activeTabPersonal,
      };
    }
    const fillQuery: QueryParams = { ...taskFacade.query, ...props.query };
    fillQuery.filter = JSON.stringify({
      ...JSON.parse(fillQuery.filter || '{}'),
      userId: globalFacade.user?.userId,
    });
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    taskPersonalFacade.set({ query: props.query, ...props.setKeyState });
    taskPersonalFacade.get(fillQuery!);
    taskPersonalFacade.getStatusSummary({
      size: -1,
      filter: JSON.stringify({ userId: globalFacade.user?.userId }),
    });
  };

  const warningRequestPersonal = useMemo(() => {
    const today = dayjs().startOf('day');
    return (
      taskPersonalFacade.pagination?.content
        ?.filter((x) => x.status !== TaskStatusMap.Passed.value && x.status !== TaskStatusMap.Failed.value)
        .reduce(
          (acc, curr) => {
            acc[curr.id] = dayjs(curr.endDateTime).startOf('day').diff(today, 'day');
            return acc;
          },
          {} as Record<string, number>,
        ) ?? {}
    );
  }, [taskPersonalFacade.pagination?.content]);

  const renderAction = (record: TaskPersonalModel) => {
    switch (record?.status) {
      case 'NotStarted':
        return [
          {
            key: 'Detail',
            label: <Link to={`/${lang}${routerLinks('TaskPersonal')}/${record?.id}/edit`}>Xem chi tiết</Link>,
          },
          {
            key: 'START',
            label: 'Bắt đầu thực hiện',
            onClick: () => taskPersonalFacade.putStatus({ id: record.id, status: 'InProgress' }),
          },
          {
            key: 'DELETE',
            label: 'Xóa',
            onClick: () => taskPersonalFacade.delete(record.id),
          },
        ];
      case 'InProgress':
        return [
          {
            key: 'Detail',
            label: <Link to={`/${lang}${routerLinks('TaskPersonal')}/${record?.id}/edit`}>Xem chi tiết</Link>,
          },
          {
            key: 'START',
            label: 'Đánh dấu đạt',
            onClick: () => taskPersonalFacade.putStatus({ id: record.id, status: 'Passed' }),
          },
          {
            key: 'DELETE',
            label: 'Xóa',
            onClick: () => taskPersonalFacade.delete(record.id),
          },
        ];
      case 'Failed':
        return [
          {
            key: 'Detail',
            label: <Link to={`/${lang}${routerLinks('TaskPersonal')}/${record?.id}/edit`}>Xem chi tiết</Link>,
          },
          {
            key: 'START',
            label: 'Đánh dấu đạt',
            onClick: () => taskPersonalFacade.putStatus({ id: record.id, status: 'Passed' }),
          },
          {
            key: 'DELETE',
            label: 'Xóa',
            onClick: () => taskPersonalFacade.delete(record.id),
          },
        ];
      case 'Passed':
        return [
          {
            key: 'Detail',
            label: <Link to={`/${lang}${routerLinks('TaskPersonal')}/${record?.id}/edit`}>Xem chi tiết</Link>,
          },
          {
            key: 'DELETE',
            label: 'Xóa',
            onClick: () => taskPersonalFacade.delete(record.id),
          },
        ];
    }
  };

  const columnsPersonal: TableColumnsType<TaskPersonalModel> = [
    {
      title: 'Mã công việc',
      dataIndex: 'code',
      width: 130,
      fixed: 'left',
      render: (value, record) => (
        <Flex gap={5} align="center">
          <Tooltip title={'Xem chi tiết'}>
            <Link to={`/${lang}${routerLinks('TaskPersonal')}/${record?.id}/edit`}>{value}</Link>
          </Tooltip>
          {warningRequestPersonal[record.id] != null && warningRequestPersonal[record.id] <= 3 && (
            <Tooltip
              title={
                warningRequestPersonal[record.id] > 0
                  ? 'Công việc cá nhân sắp đến hạn thực hiện'
                  : warningRequestPersonal[record.id] === 0
                    ? 'Công việc cá nhân đã đến hạn thực hiện'
                    : `Công việc cá nhân đã quá hạn thực hiện ${warningRequestPersonal[record.id] * -1} ngày`
              }
            >
              <ExclamationCircleFilled
                className={warningRequestPersonal[record.id] > 0 ? 'text-yellow-500' : 'text-red-500'}
              />
            </Tooltip>
          )}
        </Flex>
      ),
    },
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      minWidth: 280,
      width: 280,
      render: (value, record) => (
        <Flex vertical gap={4}>
          <Tooltip title={record?.name}>
            <Typography.Text> {record?.name}</Typography.Text>
          </Tooltip>
          <Badge
            color={PriorityPersonalLevelMap[record?.priorityLevel as string]?.color}
            text={PriorityPersonalLevelMap[record?.priorityLevel as string]?.label}
          />
        </Flex>
      ),
    },
    {
      title: 'Phân loại',
      dataIndex: 'taskType',
      width: 120,
      align: 'center',
      render: (value: string, record) => (
        <Tag className="px-2.5 py-0.5 rounded-full text-sm" color={record?.taskTypeModel?.description}>
          {record?.taskTypeModel?.title}
        </Tag>
      ),
    },
    {
      title: 'Hạn chót',
      dataIndex: 'endDateTime',
      width: 110,
      align: 'center',
      render: (value, record) => (
        <Flex vertical={true} gap={4}>
          <span>{formatDayjsDate(value)}</span>
          <span>
            <FlagOutlined className="text-[#1890ff] mr-1.5" />
            {`${record?.subTaskPersonals?.filter((task) => task.isCompleted)?.length}/${record?.subTaskPersonals?.length}`}
          </span>
        </Flex>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value: string) => (
        <Tag className="px-2.5 py-0.5 rounded-full text-sm" color={TaskStatusMap[value]?.color}>
          {TaskStatusMap[value]?.label}
        </Tag>
      ),
    },
    {
      dataIndex: 'action',
      key: 'Action',
      align: 'center',
      width: 60,
      fixed: 'right',
      render: (value, record) => {
        const itemsMenu: any = renderAction(record);
        // const itemsMenu: ItemType[] = [
        //   {
        //     key: 1,
        //     label: (
        //       <a
        //         onClick={() => {
        //           navigate(`/${lang}${routerLinks('Construction')}/${record?.id}/construction-monitor`, {
        //             state: {
        //               isTaskTab: true,
        //             },
        //           });
        //         }}
        //       >
        //         Xem công việc
        //       </a>
        //     ),
        //   },
        //   {
        //     key: 2,
        //     label: (
        //       <a
        //         onClick={() => navigate(`/${lang}${routerLinks('Construction')}/${record?.id}/construction-monitor`)}
        //         className="text-gray-900 hover:!text-blue-500"
        //       >
        //         Xem monitor
        //       </a>
        //     ),
        //   },
        //   {
        //     key: 3,
        //     label: (
        //       <a
        //         onClick={() => {
        //           navigate(`/${lang}${routerLinks('Construction')}/${record?.id}/edit`);
        //           constructionFacade.set({
        //             listParticipantsArr: [],
        //             listPresentArr: [],
        //             listPresent: [],
        //             listParticipants: [],
        //             checkedListParticipants: [],
        //             checkedListPresent: [],
        //           });
        //         }}
        //         className="text-gray-900 hover:!text-blue-500"
        //       >
        //         Chỉnh sửa
        //       </a>
        //     ),
        //   },
        //   {
        //     key: 4,
        //     label: (
        //       <a onClick={() => handleDelete(record?.id)} className="text-gray-900 hover:!text-blue-500">
        //         Xóa
        //       </a>
        //     ),
        //   },
        // ];
        return (
          <Space>
            <Dropdown
              placement="bottomRight"
              trigger={['click']}
              menu={{
                items: itemsMenu,
              }}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const onChangeSearchPersonal = (value: string) => {
    if (value) {
      parsedFilter.fullTextSearch = value;
    } else {
      delete parsedFilter.fullTextSearch;
    }
    onChangeDataTablePersonal({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...parsedFilter }),
      },
    });
  };

  const getDisplayedPersonalFilterValue = (field: string, value: any) => {
    switch (field) {
      case 'dueDateRange':
        if (Array.isArray(value) && value.length === 2) {
          return `${dayjs(value[0]).format('DD/MM/YYYY')} - ${dayjs(value[1]).format('DD/MM/YYYY')}`;
        }
        return String(value);
      case 'status':
        return TaskStatusMap[value]?.label ?? '';
      case 'priorityLevel':
        return PriorityPersonalLevelMap[value]?.label ?? '';
      default:
        return String(value);
    }
  };

  const handleRemovePersonalFilterField = (field: string) => {
    delete parsedFilter[field];
    if (field === 'fullTextSearch') formRef.current?.setFieldsValue({ search: '' });
    onChangeDataTablePersonal({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({
          ...parsedFilter,
        }),
      },
    });
  };

  const tabItemsPersonal: TabsProps['items'] = [
    {
      key: 'Total',
      label: (
        <Flex gap={6} align="center">
          <span className="text-nowrap font-medium">Tất cả</span>
          <Badge count={taskPersonalFacade.statusSummary?.total || 0} showZero color="blue" />
        </Flex>
      ),
    },
    ...Object.values(TaskStatusMap).map((x) => ({
      key: x.value,
      label: (
        <Flex gap={6} align="center">
          <span className="text-nowrap font-medium">{x.label}</span>
          <Badge
            count={taskPersonalFacade.statusSummary?.[x.value.toLowerCase()[0] + x.value.slice(1)] || 0}
            showZero
            color={x.value === 'NotStarted' ? 'gray' : x.color}
          />
        </Flex>
      ),
    })),
  ];

  const handleAddCategory = () => {
    codeTypeManagementFacade.post({
      title: newCategory,
      code: newCategory,
      type: 'TASK_TYPE',
      description: getRandomHexColor(),
    });
  };

  // --------------------------------------------------------------------------------------------------------------

  const columns: TableColumnsType<TaskModel> = [
    {
      title: 'Mã công việc',
      dataIndex: 'code',
      width: 130,
      fixed: 'left',
      render: (value, record) => (
        <Flex gap={5} align="center">
          <Tooltip title={'Xem chi tiết'}>
            <Link
              to={`/${lang}${routerLinks('Task')}/${record.construction?.id}/edit-view/${record.id}?indexTemplateStage=${taskFacade.activeStep || 0}`}
            >
              {value}
            </Link>
          </Tooltip>
          {warningRequest[record.id] != null && warningRequest[record.id] <= 3 && (
            <Tooltip
              title={
                warningRequest[record.id] > 0
                  ? 'Công việc sắp đến hạn thực hiện'
                  : warningRequest[record.id] === 0
                    ? 'Công việc đã đến hạn thực hiện'
                    : `Công việc đã quá hạn thực hiện ${warningRequest[record.id] * -1} ngày`
              }
            >
              <ExclamationCircleFilled className={warningRequest[record.id] > 0 ? 'text-yellow-500' : 'text-red-500'} />
            </Tooltip>
          )}
        </Flex>
      ),
    },
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      minWidth: 280,
      width: 280,
      render: (value, record) => (
        <Flex vertical gap={4}>
          <Tooltip title={record?.name}>
            <Typography.Text> {record?.name}</Typography.Text>
          </Tooltip>
          <Badge
            color={PriorityLevelMap[record?.priorityLevel as string]?.color}
            text={PriorityLevelMap[record?.priorityLevel as string]?.label}
          />
        </Flex>
      ),
    },
    {
      title: 'Nhân sự thực hiện',
      dataIndex: 'executors',
      key: 'executors',
      width: 140,
      render: (value, record) => {
        return (
          <Avatar.Group
            className={'cursor-pointer'}
            max={{
              count: 3,
              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
            }}
          >
            {record?.executors?.map((item) => (
              <Tooltip title={item?.idm_User?.name} placement="top" key={item?.id}>
                <Avatar src={item?.idm_User?.avatarUrl} />
              </Tooltip>
            ))}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Hạn chót',
      dataIndex: 'endDateTime',
      width: 110,
      align: 'center',
      render: (value, record) => (
        <Flex vertical={true} gap={4}>
          <span>{formatDayjsDate(value)}</span>
          <span>
            <FlagOutlined className="text-[#1890ff] mr-1.5" />
            {`${record?.subTasks?.filter((task) => task.isCompleted)?.length}/${record?.subTasks?.length}`}
          </span>
        </Flex>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value: string) => (
        <Tag className="px-2.5 py-0.5 rounded-full text-sm" color={TaskStatusMap[value]?.color}>
          {TaskStatusMap[value]?.label}
        </Tag>
      ),
    },
    {
      title: 'Công trình/dự án',
      width: 180,
      ellipsis: true,
      render: (value, record) => (
        <Link to={`/${lang}${routerLinks('Construction')}/${record?.construction?.id}/construction-monitor`}>
          {record?.construction?.name}
        </Link>
      ),
    },
    {
      key: 'action',
      align: 'center',
      width: 40,
      render: (_, record) => {
        // Định nghĩa type mới kế thừa từ MenuProps['items'][number] và thêm trường abc
        type CustomMenuItem = Exclude<MenuProps['items'], undefined>[number] & { isDelete?: any };
        let allActions: CustomMenuItem[] = [
          {
            key: 'Detail',
            label: (
              <Link
                to={`/${lang}${routerLinks('Task')}/${record.construction?.id}/edit-view/${record.id}?indexTemplateStage=${taskFacade.activeStep || 0}`}
              >
                Xem chi tiết
              </Link>
            ),
          },
          {
            key: 'START',
            label: 'Bắt đầu thực hiện',
            onClick: () => taskFacade.putStatus({ id: record.id, status: 'InProgress' }),
            isDelete: record?.status !== 'NotStarted',
          },
          {
            key: 'SUBMIT_FOR_APPROVAL',
            label: (
              <Tooltip
                title={
                  !rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVALTASK')
                    ? 'Bạn không có quyền thực hiện thao tác này'
                    : null
                }
              >
                Gửi duyệt
              </Tooltip>
            ),
            disabled: !rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVALTASK'),
            onClick: () => {
              modal.confirm({
                title: 'Gửi duyệt',
                content: (
                  <Typography.Text>
                    Người phê duyệt sẽ nhận được thông báo và có thể phê duyệt Đạt hoặc Không đạt. Bạn sẽ không thể
                    chỉnh sửa công việc cho đến khi có phản hồi từ người duyệt.
                  </Typography.Text>
                ),
                okText: 'Xác nhận',
                onOk() {
                  taskFacade.putStatus({ id: record.id, status: 'PendingApproval' });
                },
              });
            },
            isDelete: !['InProgress', 'Failed'].includes(record.status),
          },
          {
            key: 'APPROVE_PASS',
            label: (
              <Tooltip
                title={
                  !rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')
                    ? 'Bạn không có quyền thực hiện thao tác này'
                    : null
                }
              >
                Duyệt Đạt
              </Tooltip>
            ),
            disabled: !rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK'),
            onClick: () =>
              modal.confirm({
                title: 'Bạn có chắc chắn muốn duyệt Đạt công việc này?',
                content: (
                  <Typography.Text>
                    Khi công việc ở trạng thái Đạt, nhân viên sẽ không được chỉnh sửa và thao tác này không thể khôi
                    phục.
                  </Typography.Text>
                ),
                okText: 'Xác nhận',
                onOk() {
                  taskFacade.putStatus({ id: record.id, status: 'Passed' });
                },
              }),
            isDelete: record.status !== 'PendingApproval',
          },
          {
            key: 'APPROVE_FAIL',
            label: (
              <Tooltip
                title={
                  !rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')
                    ? 'Bạn không có quyền thực hiện thao tác này'
                    : null
                }
              >
                Duyệt Không đạt
              </Tooltip>
            ),
            disabled: !rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK'),
            onClick: () =>
              modal.confirm({
                title: 'Duyệt công việc Không đạt',
                content: (
                  <Form
                    form={rejectTaskForm}
                    layout="vertical"
                    onFinish={() => {
                      const description = rejectTaskForm.getFieldValue('description');
                      taskFacade.putStatus({ id: record.id, status: 'Failed', description });
                    }}
                  >
                    <Form.Item
                      name="description"
                      label="Lý do"
                      rules={[{ required: true, message: 'Vui lòng nhập lý do duyệt Không đạt công việc' }]}
                    >
                      <Input.TextArea placeholder="Nhập lý do duyệt Không đạt công việc" />
                    </Form.Item>
                  </Form>
                ),
                okText: 'Xác nhận',
                onOk: () => {
                  return rejectTaskForm
                    .validateFields()
                    .then(() => rejectTaskForm.submit())
                    .catch(() => Promise.reject());
                },
              }),
            isDelete: record.status !== 'PendingApproval',
          },
          {
            key: 'QUICK_UPDATE',
            label: (
              <Tooltip
                title={
                  !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                    ? 'Bạn không có quyền thực hiện thao tác này'
                    : null
                }
              >
                Cập nhật nhanh
              </Tooltip>
            ),
            disabled: !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK'),
            onClick: () => {
              taskFacade.set({ isQuickUpdate: true, data: record });
            },
            isDelete: !['NotStarted', 'InProgress', 'Failed'].includes(record.status),
          },
          {
            key: 'DELETE',
            label: 'Xóa',
            onClick: () => {
              modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa công việc này?',
                content: 'Thao tác này sẽ xóa công việc bạn đã chọn. Thao tác này không thể khôi phục.',
                okText: 'Xác nhận',
                okType: 'danger',
                okButtonProps: {
                  type: 'primary',
                },
                onOk: () => taskFacade.delete(record.id),
              });
            },
            isDelete: !['NotStarted', 'Failed'].includes(record.status),
          },
        ];
        allActions = allActions.filter((action: any) => !action.isDelete);
        return (
          <Dropdown menu={{ items: allActions }} trigger={['click']} placement="bottomRight" arrow>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
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
  const getDisplayedFilterValue = (field: string, value: any) => {
    switch (field) {
      case 'dueDateRange':
        if (Array.isArray(value) && value.length === 2) {
          return `${dayjs(value[0]).format('DD/MM/YYYY')} - ${dayjs(value[1]).format('DD/MM/YYYY')}`;
        }
        return String(value);
      case 'status':
        return TaskStatusMap[value]?.label ?? '';
      case 'priorityLevel':
        return PriorityLevelMap[value]?.label ?? '';
      case 'constructionId':
        return constructionFacade.pagination?.content.find((item) => item.id === value)?.name;
      default:
        return String(value);
    }
  };

  const handleRemoveFilterField = (field: string) => {
    delete parsedFilter[field];
    if (field === 'fullTextSearch') formRef.current?.setFieldsValue({ search: '' });
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({
          ...parsedFilter,
        }),
      },
    });
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'Total',
      label: (
        <Flex gap={6} align="center">
          <span className="text-nowrap font-medium">Tất cả</span>
          <Badge count={taskFacade.statusSummary?.total || 0} showZero color="blue" />
        </Flex>
      ),
    },
    ...Object.values(TaskStatusMap).map((x) => ({
      key: x.value,
      label: (
        <Flex gap={6} align="center">
          <span className="text-nowrap font-medium">{x.label}</span>
          <Badge
            count={taskFacade.statusSummary?.[x.value.toLowerCase()[0] + x.value.slice(1)] || 0}
            showZero
            color={x.value === 'NotStarted' ? 'gray' : x.color}
          />
        </Flex>
      ),
    })),
  ];

  const onFinish = (data: TaskPersonalModel) => {
    data.startDateTime = data.startDateTime ? dayjs(data.startDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.endDateTime = data.endDateTime ? dayjs(data.endDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.name = data.name ? data.name : undefined;
    data.taskType = data.taskType ? data.taskType : undefined;
    data.priorityLevel = data.priorityLevel;
    taskPersonalFacade.post(data);
  };

  return (
    <Spin spinning={taskFacade.isLoading}>
      <div className="flex gap-2 p-4">
        <Button
          onClick={() => {
            constructionFacade.set({ activeTabPersonal: 'task_construction' });
            onChangeDataTable({
              query: {
                page: 1,
                size,
                filter: JSON.stringify({
                  ...parsedFilter,
                  year: parsedFilter?.year ? parsedFilter?.year : dayjs().year(),
                  activeTabPersonal: 'task_construction',
                }),
              },
            });
            // onChangeDataTable({
            //   query: {
            //     page: 1,
            //     filter: JSON.stringify({
            //       idTemplateStage:
            //         constructionFacade.data?.templateStages?.[constructionFacade?.activeStep as number]?.id,
            //       activeTabPersonal: 'task_construction',
            //       task_constructionTabIndex: constructionFacade?.activeStep ?? 0,
            //     }),
            //   },
            // });
          }}
          className={`px-4 py-2 rounded border-none ${
            constructionFacade?.activeTabPersonal === 'task_construction'
              ? 'bg-white text-[#1890FF] font-semibold'
              : 'text-gray-600'
          }`}
        >
          Công việc dự án
        </Button>
        <Button
          onClick={() => {
            constructionFacade.set({ activeTabPersonal: 'task_personal' });
            onChangeDataTablePersonal({
              query: {
                page: 1,
                size,
                filter: JSON.stringify({
                  ...parsedFilter,
                  activeTabPersonal: 'task_personal',
                }),
              },
            });
          }}
          className={`px-4 py-2 rounded border-none ${
            constructionFacade?.activeTabPersonal === 'task_personal'
              ? 'bg-white text-[#1890FF] font-semibold'
              : 'text-gray-600'
          }`}
        >
          Công việc cá nhân
        </Button>
        <Button
          onClick={() => {
            constructionFacade.set({ activeTabPersonal: 'task_schedule' });
          }}
          className={`px-4 py-2 rounded border-none ${
            constructionFacade?.activeTabPersonal === 'task_schedule'
              ? 'bg-white text-[#1890FF] font-semibold'
              : 'text-gray-600'
          }`}
        >
          Thời gian biểu
        </Button>
      </div>

      {taskFacade.isQuickUpdate && <QuickUpdate />}

      {constructionFacade?.activeTabPersonal === 'task_construction' && (
        <div className="p-4">
          <Flex align="center" gap="small" className="mb-3">
            <Typography.Text>Năm công việc</Typography.Text>
            <DatePicker
              onChange={(value) =>
                onChangeDataTable({
                  query: {
                    page: 1,
                    filter: JSON.stringify({
                      ...parsedFilter,
                      year: value ? value.year() : undefined,
                    }),
                  },
                })
              }
              picker="year"
              defaultValue={parsedFilter?.year ? dayjs().year(parsedFilter?.year) : dayjs()}
              allowClear={false}
            />
          </Flex>
          <Row gutter={[12, 12]} className="my-2.5">
            <Col span={8}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <Flex gap={'small'} align="center">
                    <FundProjectionScreenOutlined className="text-2xl text-[#1890FF]" />
                    <p>Tổng quan công việc</p>
                  </Flex>
                }
              >
                <Flex justify="space-between">
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Tổng công việc
                    </Typography.Text>
                    <Typography.Text className="text-[#1890FF] font-medium text-3xl">
                      {taskFacade.overviewSummary?.totalTasks}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Hoàn thành
                    </Typography.Text>
                    <Flex gap={4} align="center">
                      <Typography.Text className="text-[#52C41A] font-medium text-3xl">
                        {taskFacade.overviewSummary?.completedTasks}
                      </Typography.Text>
                      <Typography.Text className="text-[#52C41A] font-medium text-sm">
                        ({taskFacade.overviewSummary?.completedTasksPercent}
                        %)
                      </Typography.Text>
                    </Flex>
                  </Flex>
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Trễ hạn
                    </Typography.Text>
                    <Flex gap={4} align="center">
                      <Typography.Text className="text-[#FF4D4F] font-medium text-3xl">
                        {taskFacade.overviewSummary?.overdueTasks}
                      </Typography.Text>
                      <Typography.Text className="text-[#FF4D4F] font-medium text-sm">
                        ({taskFacade.overviewSummary?.overdueTasksPercent}
                        %)
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <Flex gap={'small'} align="center">
                    <ScheduleOutlined className="text-2xl text-[#FAAD14]" />
                    <p>Công việc cần xử lý</p>
                  </Flex>
                }
              >
                <Flex justify="space-between">
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Không đạt
                    </Typography.Text>
                    <Flex gap={4} align="center">
                      <Typography.Text className="text-[#FF4D4F] font-medium text-3xl">
                        {taskFacade.overviewSummary?.failedTasks}
                      </Typography.Text>
                      <Typography.Text className="text-[#FF4D4F] font-medium text-sm">
                        ({taskFacade.overviewSummary?.failedTasksPercent}
                        %)
                      </Typography.Text>
                    </Flex>
                  </Flex>
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Đang thực hiện
                    </Typography.Text>
                    <Flex gap={4} align="center">
                      <Typography.Text className="text-[#1890FF] font-medium text-3xl">
                        {taskFacade.overviewSummary?.inProgressTasks}
                      </Typography.Text>
                      <Typography.Text className="text-[#1890FF] font-medium text-sm">
                        ({taskFacade.overviewSummary?.inProgressTasksPercent}
                        %)
                      </Typography.Text>
                    </Flex>
                  </Flex>
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Chưa bắt đầu
                    </Typography.Text>
                    <Flex gap={4} align="center">
                      <Typography.Text className="font-medium text-3xl">
                        {taskFacade.overviewSummary?.notStartedTasks}
                      </Typography.Text>
                      <Typography.Text className="font-medium text-sm">
                        ({taskFacade.overviewSummary?.notStartedTasksPercent}
                        %)
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            </Col>
            <Col span={8}>
              <Card
                className="rounded-[10px] h-full"
                title={
                  <Flex gap={'small'} align="center">
                    <PartitionOutlined className="text-2xl text-[#52C41A]" />
                    <p>Tổng quan dự án</p>
                  </Flex>
                }
              >
                <Flex justify="space-between">
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Tổng dự án t/gia
                    </Typography.Text>
                    <Typography.Text className="text-[#1890FF] font-medium text-3xl">
                      {taskFacade.overviewSummary?.totalProjects}
                    </Typography.Text>
                  </Flex>
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Đang thiết kế
                    </Typography.Text>
                    <Flex gap={4} align="center">
                      <Typography.Text className="text-[#FAAD14] font-medium text-3xl">
                        {taskFacade.overviewSummary?.projectsDesigning}
                      </Typography.Text>
                      <Typography.Text className="text-[#FAAD14] font-medium text-sm">
                        ({taskFacade.overviewSummary?.projectsDesigningPercent}
                        %)
                      </Typography.Text>
                    </Flex>
                  </Flex>
                  <Flex vertical={true} align="center">
                    <Typography.Text type="secondary" className="text-base">
                      Giám sát tác giả
                    </Typography.Text>
                    <Flex gap={4} align="center">
                      <Typography.Text className="text-[#5856D6] font-medium text-3xl">
                        {taskFacade.overviewSummary?.projectsAuthorSupervisor}
                      </Typography.Text>
                      <Typography.Text className="text-[#5856D6] font-medium text-sm">
                        ({taskFacade.overviewSummary?.projectsAuthorSupervisorPercent}
                        %)
                      </Typography.Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            </Col>
          </Row>
          {Number(taskFacade.selectedRowKeysTable?.length) > 0 && (
            <Flex align="center" gap={16} className="mb-2">
              <Typography.Text>
                Đã chọn {taskFacade.selectedRowKeysTable?.length} công việc trên trang này
              </Typography.Text>
              <Button
                disabled={
                  !(
                    taskFacade?.selectedRows
                      ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                      ?.map((item) => item.id) || []
                  )?.length
                }
                onClick={() => {
                  modal.confirm({
                    title: `Bạn có chắc chắn muốn xóa ${
                      (
                        taskFacade?.selectedRows
                          ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                          ?.map((item) => item.id) || []
                      )?.length
                    } công việc này?`,
                    content: 'Thao tác này sẽ xóa công việc và không thể khôi phục.',
                    okText: 'Xác nhận',
                    okType: 'danger',
                    okButtonProps: {
                      type: 'primary',
                    },
                    onOk: () => {
                      const idsToDelete =
                        taskFacade?.selectedRows
                          ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                          ?.map((item) => item.id) || [];
                      taskFacade.deleteMany(idsToDelete);
                    },
                  });
                }}
                type="text"
                className={classNames({
                  'text-red-500':
                    Number(
                      (
                        taskFacade?.selectedRows
                          ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                          ?.map((item) => item.id) || []
                      )?.length,
                    ) > 0,
                })}
              >
                Xóa công việc{' '}
                {`(${
                  (
                    taskFacade?.selectedRows
                      ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                      ?.map((item) => item.id) || []
                  )?.length
                })`}
              </Button>
              <Button
                disabled={
                  !taskFacade?.selectedRows?.filter((item) => ['InProgress', 'Failed'].includes(item.status))?.length ||
                  !rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVALTASK')
                }
                onClick={() => {
                  modal.confirm({
                    title: `Bạn có chắc chắn muốn gửi duyệt ${taskFacade?.selectedRows?.filter((item) => ['InProgress', 'Failed'].includes(item.status))?.length} công việc này?`,
                    content: (
                      <Typography.Text>
                        Khi công việc ở trạng thái Chờ duyệt, bạn sẽ không được chỉnh sửa và cần đợi quản lý phê duyệt.
                        Thao tác này không thể khôi phục.
                      </Typography.Text>
                    ),
                    okText: 'Xác nhận',
                    onOk() {
                      taskFacade.putStatusMany(
                        taskFacade?.selectedRows
                          ?.filter((item) => ['InProgress', 'Failed'].includes(item.status))
                          ?.map((item) => item.id) || [],
                        'PendingApproval',
                      );
                    },
                  });
                }}
                type="text"
                className="text-blue-500"
              >
                Gửi duyệt{' '}
                {`(${taskFacade?.selectedRows?.filter((item) => ['InProgress', 'Failed'].includes(item.status))?.length})`}
              </Button>
              <Button
                disabled={
                  !taskFacade?.selectedRows?.filter((item) => ['PendingApproval'].includes(item.status))?.length ||
                  !rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')
                }
                type="text"
                className="text-[#FAAD14]"
                onClick={() => {
                  modal.confirm({
                    title: 'Lựa chọn trạng thái',
                    content: (
                      <Form
                        form={approvalTaskForm}
                        layout="vertical"
                        onFinish={() => {
                          // const description = rejectTaskForm.getFieldValue('description');
                          // taskFacade.putStatus({ id, status: 'Failed', description });
                        }}
                        initialValues={{ status: 'Passed' }}
                      >
                        <Form.Item name={'status'}>
                          <Radio.Group
                            onChange={(e) => {
                              taskFacade.set({ reRender: !taskFacade.reRender });
                            }}
                          >
                            <Space direction="vertical">
                              <Radio value="Passed">Đạt </Radio>
                              <Radio value="Failed"> Không đạt</Radio>
                            </Space>
                          </Radio.Group>
                        </Form.Item>
                      </Form>
                    ),
                    okText: 'Tiếp theo',
                    onOk: () => {
                      if (approvalTaskForm.getFieldValue('status') === 'Passed')
                        modal.confirm({
                          title: `Bạn có chắc chắn muốn duyệt Đạt ${taskFacade?.selectedRows?.filter((item) => ['PendingApproval'].includes(item.status))?.length} công việc này?`,
                          content: (
                            <Typography.Text>
                              Khi công việc ở trạng thái Đạt, nhân viên sẽ không được chỉnh sửa và thao tác này không
                              thể khôi phục.
                            </Typography.Text>
                          ),
                          okText: 'Xác nhận',
                          onOk() {
                            taskFacade.putStatusMany(
                              taskFacade?.selectedRows
                                ?.filter((item) => ['PendingApproval'].includes(item.status))
                                ?.map((item) => item.id) || [],
                              'Passed',
                            );
                          },
                        });
                      if (approvalTaskForm.getFieldValue('status') === 'Failed')
                        modal.confirm({
                          title: `Duyệt ${taskFacade?.selectedRows?.filter((item) => ['PendingApproval'].includes(item.status))?.length} công việc Không đạt`,
                          content: (
                            <Form
                              form={rejectTaskForm}
                              layout="vertical"
                              onFinish={() => {
                                const description = rejectTaskForm.getFieldValue('description');
                                taskFacade.putStatusMany(
                                  taskFacade?.selectedRows
                                    ?.filter((item) => ['PendingApproval'].includes(item.status))
                                    ?.map((item) => item.id) || [],
                                  'Failed',
                                  description,
                                );
                              }}
                            >
                              <Form.Item
                                name="description"
                                label="Lý do"
                                rules={[{ required: true, message: 'Vui lòng nhập lý do duyệt Không đạt công việc' }]}
                              >
                                <Input.TextArea placeholder="Nhập lý do duyệt Không đạt công việc" />
                              </Form.Item>
                            </Form>
                          ),
                          okText: 'Xác nhận',
                          onOk: () => {
                            return rejectTaskForm
                              .validateFields()
                              .then(() => rejectTaskForm.submit())
                              .catch(() => Promise.reject());
                          },
                        });
                    },
                  });
                }}
              >
                Duyệt ({taskFacade?.selectedRows?.filter((item) => ['PendingApproval'].includes(item.status))?.length})
              </Button>
            </Flex>
          )}
          <Card
            classNames={{
              body: '!py-0',
            }}
            size="small"
            variant="borderless"
          >
            <Tabs
              items={tabItems}
              className="px-2 mb-2"
              onChange={(activeKey) =>
                onChangeDataTable({
                  query: {
                    page: 1,
                    size,
                    filter: JSON.stringify({ ...parsedFilter, status: activeKey === 'Total' ? undefined : activeKey }),
                  },
                })
              }
              activeKey={parsedFilter?.status || 'Total'}
            />
            <Flex className="!mb-4" gap={16}>
              <div className="w-full">
                <SearchWidget
                  form={(form) => (formRef.current = form)}
                  callback={onChangeSearch}
                  placeholder={'Tìm kiếm theo mã, tên công việc'}
                  defaultValue={parsedFilter?.fullTextSearch}
                  tabActive="search"
                />
              </div>
              <Space size={16}>
                <Select
                  className="w-60"
                  placeholder="Chọn dự án"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={constructionFacade.pagination?.content.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  optionRender={(oriOption) => <div className="line-clamp-3 whitespace-normal">{oriOption.label}</div>}
                  onChange={(constructionId) => {
                    onChangeDataTable({
                      query: {
                        page: 1,
                        size,
                        filter: JSON.stringify({ ...JSON.parse(filter), constructionId }),
                      },
                    });
                  }}
                  value={parsedFilter?.constructionId}
                />
                <Select
                  className="w-36"
                  placeholder="Chọn độ ưu tiên"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={Object.values(PriorityLevelMap).map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  onChange={(priorityLevel) => {
                    onChangeDataTable({
                      query: {
                        page: 1,
                        size,
                        filter: JSON.stringify({ ...JSON.parse(filter), priorityLevel }),
                      },
                    });
                  }}
                  value={parsedFilter?.priorityLevel}
                />
                <DatePicker.RangePicker
                  className="w-60"
                  allowClear
                  format="DD/MM/YYYY"
                  placeholder={['Hạn từ ngày', 'Đến ngày']}
                  onChange={(value: null | (Dayjs | null)[]) => {
                    if (value)
                      parsedFilter.dueDateRange = [
                        dayjs(value[0]).add(1).format('YYYY-MM-DD'),
                        dayjs(value[1]).add(1).format('YYYY-MM-DD'),
                      ];
                    else delete parsedFilter.dueDateRange;
                    onChangeDataTable({
                      query: {
                        page: 1,
                        size,
                        filter: JSON.stringify(parsedFilter),
                      },
                    });
                  }}
                  value={
                    parsedFilter?.dueDateRange
                      ? [dayjs(parsedFilter?.dueDateRange[0]), dayjs(parsedFilter?.dueDateRange[1])]
                      : undefined
                  }
                />
              </Space>
            </Flex>
            <div className="flex flex-wrap gap-y-2 justify-start px-4 pb-4 empty:pb-0">
              {Object.entries(parsedFilter)
                .filter(([key]) => Object.keys(TaskFilterFieldNameMap).includes(key))
                .map(([key, value]) => {
                  return (
                    <Tag
                      key={key}
                      className="rounded-full  py-0.5 text-sm"
                      color="#E6F4FF"
                      closable
                      onClose={() => handleRemoveFilterField(key)}
                      closeIcon={<CloseOutlined className="p-0.5 rounded !text-blue-400" />}
                    >
                      <span className="text-black">
                        {TaskFilterFieldNameMap[key]}: {getDisplayedFilterValue(key, value)}
                      </span>
                    </Tag>
                  );
                })}
            </div>
            <Table
              size="small"
              rowSelection={{
                columnWidth: '30px',
                selectedRowKeys: taskFacade.selectedRowKeysTable,
                onChange: (newSelectedRowKeys, selectedRows) =>
                  taskFacade.set({ selectedRowKeysTable: newSelectedRowKeys as string[], selectedRows }),
              }}
              dataSource={taskFacade.pagination?.content.map((item, index) => ({
                ...item,
              }))}
              locale={{ emptyText: <Empty description="Chưa có công việc"></Empty> }}
              columns={columns}
              rowKey="id"
              scroll={{ y: 'calc(100vh - 330px)' }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: [10, 20, 50, 100],
                total: taskFacade.pagination?.totalElements,
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
          </Card>
        </div>
      )}

      {constructionFacade?.activeTabPersonal === 'task_personal' && (
        <Spin spinning={taskPersonalFacade.isLoading}>
          <Modal
            width={800}
            title="Thêm nhanh công việc"
            open={taskPersonalFacade.isChooseFast}
            onCancel={() => {
              form.resetFields();
              taskPersonalFacade.set({ isChooseFast: false });
            }}
            footer={
              <div className="flex justify-end">
                <Button icon={<SaveOutlined />} type="primary" onClick={form.submit}>
                  Lưu lại
                </Button>
              </div>
            }
          >
            <Form
              layout="vertical"
              className="px-2"
              form={form}
              onFinish={onFinish}
              initialValues={{
                priorityLevel: 'Medium',
              }}
            >
              <Row gutter={16}>
                <Col span={24} className="flex gap-4">
                  <Form.Item label="Tên công việc" name="name" rules={[{ required: true }]} className="w-full">
                    <Input placeholder="Nhập tên công việc" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Ngày bắt đầu" name="startDateTime">
                    <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Hạn chót" name="endDateTime">
                    <DatePicker format="DD/MM/YYYY" placeholder="Chọn hạn chót" className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={14}>
                  <Form.Item name="taskType" label="Phân loại">
                    <Select
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={codeTypeFacade.pagination?.content
                        ?.filter((x: CodeTypeModel) => x.type == 'TASK_TYPE')
                        ?.map((item) => ({
                          label: item.title,
                          value: item.code,
                        }))}
                      placeholder="Chọn phân loại"
                      className="w-80"
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <div className="border-t border-gray-200 mt-1 pt-2 px-2">
                            {isAdding ? (
                              <div className="text-[14px]">
                                <Text type="danger" className="text-xs">
                                  * Tên phân loại
                                </Text>
                                <div className="flex items-center gap-2 mt-1 mb-2">
                                  <Input
                                    size="small"
                                    placeholder="Nhập tên phân loại"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onPressEnter={handleAddCategory}
                                  />
                                  <CheckOutlined
                                    className="text-green-500 cursor-pointer text-lg"
                                    onClick={handleAddCategory}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div
                                className="text-blue-500 cursor-pointer flex items-center gap-1 py-1"
                                onClick={() => setIsAdding(true)}
                              >
                                <PlusOutlined />
                                <span>Thêm phân loại</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item label="Độ ưu tiên" name="priorityLevel">
                    <Radio.Group
                      options={Object.values(PriorityLevelMap).map((item) => ({
                        label: item.label,
                        value: item.value,
                        style: {
                          color: item.color,
                          fontWeight: 500,
                        },
                      }))}
                    ></Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Mô tả" name="description">
                    <TextArea placeholder="Nhập mô tả" rows={3} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>

          <div className="pl-4 pr-4">
            {Number(taskPersonalFacade.selectedRowKeysTable?.length) > 0 && (
              <Flex align="center" gap={16} className="mb-2">
                <Typography.Text>
                  Đã chọn {taskPersonalFacade.selectedRowKeysTable?.length} công việc trên trang này
                </Typography.Text>
                <Button
                  // disabled={
                  //   !(
                  //     taskPersonalFacade?.selectedRows
                  //       ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                  //       ?.map((item) => item.id) || []
                  //   )?.length
                  // }
                  onClick={() => {
                    modal.confirm({
                      title: `Bạn có chắc chắn muốn xóa ${
                        (
                          taskPersonalFacade?.selectedRows
                            // ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                            ?.map((item) => item.id) || []
                        )?.length
                      } công việc này?`,
                      content: 'Thao tác này sẽ xóa công việc và không thể khôi phục.',
                      okText: 'Xác nhận',
                      okType: 'danger',
                      okButtonProps: {
                        type: 'primary',
                      },
                      onOk: () => {
                        const idsToDelete =
                          taskPersonalFacade?.selectedRows
                            // ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                            ?.map((item) => item.id) || [];
                        taskPersonalFacade.deleteMany(idsToDelete);
                      },
                    });
                  }}
                  type="text"
                  className={classNames({
                    'text-red-500':
                      Number(
                        (
                          taskPersonalFacade?.selectedRows
                            // ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                            ?.map((item) => item.id) || []
                        )?.length,
                      ) > 0,
                  })}
                >
                  Xóa công việc{' '}
                  {`(${
                    (
                      taskPersonalFacade?.selectedRows
                        // ?.filter((item) => item.status === 'NotStarted' || item.status === 'Failed')
                        ?.map((item) => item.id) || []
                    )?.length
                  })`}
                </Button>
                <Button
                  disabled={
                    !(
                      taskPersonalFacade?.selectedRows
                        ?.filter((item) => item.status === 'InProgress' || item.status === 'Failed')
                        ?.map((item) => item.id) || []
                    )?.length
                  }
                  onClick={() => {
                    modal.confirm({
                      title: `Bạn có chắc chắn muốn đánh dấu đạt 
                      ${taskPersonalFacade?.selectedRows?.filter((item) => item.status === 'InProgress' || item.status === 'Failed')?.length} công việc này?`,
                      content: (
                        <Typography.Text>
                          Đánh dấu công việc đã hoàn thành, thao tác này không thể khôi phục.
                        </Typography.Text>
                      ),
                      okText: 'Xác nhận',
                      onOk() {
                        const idsToDelete =
                          taskPersonalFacade?.selectedRows
                            ?.filter((item) => item.status === 'InProgress' || item.status === 'Failed')
                            ?.map((item) => item.id) || [];
                        taskPersonalFacade.putStatusMany(idsToDelete, 'Passed');
                      },
                    });
                  }}
                  type="text"
                  className={classNames({
                    'text-red-500':
                      Number(
                        (
                          taskPersonalFacade?.selectedRows
                            ?.filter((item) => item.status === 'InProgress' || item.status === 'Failed')
                            ?.map((item) => item.id) || []
                        )?.length,
                      ) > 0,
                  })}
                >
                  Đạt{' '}
                  {`(${
                    (
                      taskPersonalFacade?.selectedRows
                        ?.filter((item) => item.status === 'InProgress' || item.status === 'Failed')
                        ?.map((item) => item.id) || []
                    )?.length
                  })`}
                </Button>
              </Flex>
            )}
            <Card
              classNames={{
                body: '!py-0',
              }}
              size="small"
              variant="borderless"
            >
              <Tabs
                items={tabItemsPersonal}
                className="px-2 mb-2"
                onChange={(activeKey) =>
                  onChangeDataTablePersonal({
                    query: {
                      page: 1,
                      size,
                      filter: JSON.stringify({
                        ...parsedFilter,
                        status: activeKey === 'Total' ? undefined : activeKey,
                      }),
                    },
                  })
                }
                activeKey={parsedFilter?.status || 'Total'}
              />
              <Flex className="!mb-4" gap={16}>
                <div className="w-full">
                  <SearchWidget
                    form={(form) => (formRef.current = form)}
                    callback={onChangeSearchPersonal}
                    placeholder={'Tìm kiếm theo mã, tên công việc'}
                    defaultValue={parsedFilter?.fullTextSearch}
                    tabActive="search"
                  />
                </div>
                <Space size={16}>
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={codeTypeFacade.pagination?.content
                      ?.filter((x: CodeTypeModel) => x.type == 'TASK_TYPE')
                      ?.map((item) => ({
                        label: item.title,
                        value: item.code,
                      }))}
                    placeholder="Chọn phân loại"
                    className="w-36"
                    onChange={(taskType) => {
                      onChangeDataTablePersonal({
                        query: {
                          page: 1,
                          size,
                          filter: JSON.stringify({ ...JSON.parse(filter), taskType }),
                        },
                      });
                    }}
                    value={parsedFilter?.taskType}
                  />
                  <Select
                    className="w-36"
                    placeholder="Chọn độ ưu tiên"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={Object.values(PriorityLevelMap).map((item) => ({
                      label: item.label,
                      value: item.value,
                    }))}
                    onChange={(priorityLevel) => {
                      onChangeDataTablePersonal({
                        query: {
                          page: 1,
                          size,
                          filter: JSON.stringify({ ...JSON.parse(filter), priorityLevel }),
                        },
                      });
                    }}
                    value={parsedFilter?.priorityLevel}
                  />
                  <DatePicker.RangePicker
                    className="w-60"
                    allowClear
                    format="DD/MM/YYYY"
                    placeholder={['Hạn từ ngày', 'Đến ngày']}
                    onChange={(value: null | (Dayjs | null)[]) => {
                      if (value)
                        parsedFilter.dueDateRange = [
                          dayjs(value[0]).add(1).format('YYYY-MM-DD'),
                          dayjs(value[1]).add(1).format('YYYY-MM-DD'),
                        ];
                      else delete parsedFilter.dueDateRange;
                      onChangeDataTablePersonal({
                        query: {
                          page: 1,
                          size,
                          filter: JSON.stringify(parsedFilter),
                        },
                      });
                    }}
                    value={
                      parsedFilter?.dueDateRange
                        ? [dayjs(parsedFilter?.dueDateRange[0]), dayjs(parsedFilter?.dueDateRange[1])]
                        : undefined
                    }
                  />
                  <Button
                    onClick={() => {
                      taskPersonalFacade.set({
                        isChooseFast: true,
                      });
                    }}
                    color="primary"
                    variant="outlined"
                    icon={<PlusOutlined />}
                  >
                    Thêm nhanh
                  </Button>
                  <Button
                    onClick={() => navigate(`/${lang}${routerLinks('TaskPersonal')}/create`)}
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    Thêm mới
                  </Button>
                </Space>
              </Flex>
              <div className="flex flex-wrap gap-y-2 justify-start px-4 pb-4 empty:pb-0">
                {Object.entries(parsedFilter)
                  .filter(([key]) => Object.keys(TaskFilterFieldNameMap).includes(key))
                  .map(([key, value]) => {
                    return (
                      <Tag
                        key={key}
                        className="rounded-full  py-0.5 text-sm"
                        color="#E6F4FF"
                        closable
                        onClose={() => handleRemovePersonalFilterField(key)}
                        closeIcon={<CloseOutlined className="p-0.5 rounded !text-blue-400" />}
                      >
                        <span className="text-black">
                          {TaskFilterFieldNameMap[key]}: {getDisplayedPersonalFilterValue(key, value)}
                        </span>
                      </Tag>
                    );
                  })}
              </div>
              <Table
                size="small"
                rowSelection={{
                  columnWidth: '30px',
                  selectedRowKeys: taskPersonalFacade.selectedRowKeysTable,
                  onChange: (newSelectedRowKeys, selectedRows) =>
                    taskPersonalFacade.set({ selectedRowKeysTable: newSelectedRowKeys as string[], selectedRows }),
                }}
                dataSource={taskPersonalFacade.pagination?.content.map((item, index) => ({
                  ...item,
                }))}
                locale={{ emptyText: <Empty description="Chưa có công việc"></Empty> }}
                columns={columnsPersonal}
                rowKey="id"
                scroll={{ y: 'calc(100vh - 330px)' }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: [10, 20, 50, 100],
                  total: taskPersonalFacade.pagination?.totalElements,
                  current: page,
                  pageSize: size,
                  showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
                  onChange: (page, size) => {
                    onChangeDataTablePersonal({
                      query: {
                        page,
                        size,
                        filter: JSON.stringify({ ...parsedFilter }),
                      },
                    });
                  },
                }}
              />
            </Card>
          </div>
        </Spin>
      )}

      {constructionFacade.activeTabPersonal === 'task_schedule' && <WorkCalender />}
    </Spin>
  );
}
