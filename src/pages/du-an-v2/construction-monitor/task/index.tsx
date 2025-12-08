import {
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
  FlagOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  ConstructionFacade,
  EStatusConstruction,
  EStatusTask,
  PriorityLevelMap,
  RightMapRoleFacade,
  TaskFacade,
  TaskFilterFieldNameMap,
  TaskModel,
  TaskStatusMap,
  TemplateStage,
  UserFacade,
} from '@store';
import { formatDayjsDate, lang, routerLinks } from '@utils';
import {
  App,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Flex,
  Form,
  FormInstance,
  Input,
  MenuProps,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Steps,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import FilterDrawer from './filter-drawer';
import './index.less';
import { QuickUpdate } from './quick-update';

const renderColor = (statusCode: string) => {
  switch (statusCode) {
    case 'COMPLETED':
      return 'success';
    case 'CANCELED':
      return 'error';
    case 'WAIT_PROCESSING':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'AUTHOR_SUPERVISOR':
      return 'geekblue';
    case 'IS_DESIGNING':
      return 'volcano';
    case 'NOT_APPROVE':
      return 'warning';
    case 'IN_PROGRESS':
      return 'processing';
  }
};
function DraggableScrollWrapper({ children }: any) {
  const scrollRef: any = useRef(null);
  let isDown: any = false;
  let startX: any;
  let scrollLeft: any;

  useEffect(() => {
    const slider = scrollRef.current;

    const mouseDownHandler = (e: any) => {
      isDown = true;
      slider.classList.add('active'); // tùy chọn CSS khi kéo
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const mouseLeaveHandler = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const mouseUpHandler = () => {
      isDown = false;
      slider.classList.remove('active');
    };

    const mouseMoveHandler = (e: any) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // *2 để tăng tốc độ kéo
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', mouseDownHandler);
    slider.addEventListener('mouseleave', mouseLeaveHandler);
    slider.addEventListener('mouseup', mouseUpHandler);
    slider.addEventListener('mousemove', mouseMoveHandler);

    return () => {
      slider.removeEventListener('mousedown', mouseDownHandler);
      slider.removeEventListener('mouseleave', mouseLeaveHandler);
      slider.removeEventListener('mouseup', mouseUpHandler);
      slider.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, []);

  return (
    <div ref={scrollRef} style={{ overflowX: 'auto', cursor: 'grab' }} className="w-full mb-1 miniScroll pb-2.5">
      {children}
    </div>
  );
}

export default function Task() {
  const taskFacade = TaskFacade();
  const constructionFacade = ConstructionFacade();
  const rightMapFacade = RightMapRoleFacade();
  const { modal } = App.useApp();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: constructionId } = useParams();
  const [approvalTaskForm] = Form.useForm();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const [rejectTaskForm] = Form.useForm();
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
  const parsedFilter = JSON.parse(filter);
  const userFacade = UserFacade();

  useEffect(() => {
    const getMinStepOrderIndex = (arr: any[]) => {
      return arr?.reduce((minIdx, curr, idx, array) => {
        if (!curr.isDone && (minIdx === -1 || curr.stepOrder < array[minIdx].stepOrder)) {
          return idx;
        }
        return minIdx;
      }, -1);
    };

    const indexTemplate = getMinStepOrderIndex(constructionFacade?.data?.templateStages);

    userFacade.get({ size: -1 });
    taskFacade.set({
      activeStep: indexTemplate
        ? indexTemplate
        : Number(
            parsedFilter?.activeStep ||
              location.state?.indexTemplateStage ||
              location?.state?.templateStateIndex - 1 ||
              0,
          ),
    });
    constructionFacade.getByIdForTask({ id: constructionId! });
    rightMapFacade.getRightMapByCode('CONSTRUCTION');
    onChangeDataTable({
      query: {
        filter: JSON.stringify({
          ...JSON.parse(filter),
          activeStep: indexTemplate
            ? indexTemplate
            : Number(
                parsedFilter?.activeStep ||
                  location.state?.indexTemplateStage ||
                  location?.state?.templateStateIndex - 1 ||
                  0,
              ),
        }),
      },
    });
    return () => {
      taskFacade.set({
        activeStep: 0,
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
        constructionFacade.getTemplateStages(constructionId!);
        onChangeDataTable({});
        taskFacade.getAnalyzeTaskEachStage(
          constructionFacade?.data?.templateStages?.[taskFacade?.activeStep as number]?.id,
          constructionId as string,
        );
        break;
      case EStatusTask.getAnalyzeTaskEachStageRejected:
        taskFacade.set({
          analyzeOverviewTask: undefined,
        });
        break;
    }
  }, [taskFacade.status]);

  useEffect(() => {
    switch (constructionFacade.status) {
      case EStatusConstruction.putTemplateStagesFulfilled:
      case EStatusConstruction.putDoneStageFulfilled:
        constructionFacade.getByIdForTask({ id: constructionId! });
        constructionFacade.set({ activeStep: 0 });
        constructionFacade.getTemplateStages(constructionId!);
        onChangeDataTable({});
        taskFacade.getAnalyzeTaskEachStage(
          constructionFacade?.data?.templateStages?.[taskFacade?.activeStep as number]?.id,
          constructionId as string,
        );
        taskFacade.set({ selectedRowKeysTable: [], selectedRows: [] });
        break;
      case EStatusConstruction.getByIdForTaskFulfilled:
        onChangeDataTable({
          query: {
            page: 1,
            size,
            filter: JSON.stringify({
              ...JSON.parse(filter),
              idTemplateStage: constructionFacade.data?.templateStages?.[Number(taskFacade.activeStep || 0)]?.id,
            }),
          },
        });
        break;
    }
  }, [constructionFacade.status]);

  useEffect(() => {
    if (constructionFacade?.data) {
      taskFacade.getAnalyzeTaskEachStage(
        constructionFacade?.data?.templateStages?.[taskFacade?.activeStep as number]?.id,
        constructionId as string,
      );

      taskFacade.set({
        nameStage: constructionFacade?.data?.templateStages?.[taskFacade?.activeStep as number]?.name,
        descriptionStage: constructionFacade?.data?.templateStages?.[taskFacade?.activeStep as number]?.description,
        expiredDateStage: constructionFacade?.data?.templateStages?.[taskFacade?.activeStep as number]?.expiredDate,
      });
    }
  }, [constructionFacade?.data, taskFacade?.activeStep]);

  const warningRequest = useMemo(() => {
    const today = dayjs().startOf('day');
    return (
      taskFacade.paginationTask?.content
        ?.filter((x) => x.status !== TaskStatusMap.Passed.value && x.status !== TaskStatusMap.Failed.value)
        .reduce(
          (acc, curr) => {
            acc[curr.id] = dayjs(curr.endDateTime).startOf('day').diff(today, 'day');
            return acc;
          },
          {} as Record<string, number>,
        ) ?? {}
    );
  }, [taskFacade.paginationTask?.content]);
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
      activeTab: 'task',
    });
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    taskFacade.getTaskConstruction(fillQuery, constructionId!);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    taskFacade.set({ query: props.query, ...props.setKeyState });
  };
  const columns: TableColumnsType<TaskModel> = [
    {
      title: 'Thứ tự',
      dataIndex: 'priorityOrder',
      align: 'center',
      width: 60,
    },
    {
      title: 'Mã công việc',
      dataIndex: 'code',
      width: 130,
      fixed: 'left',
      render: (value, record) => (
        <Flex gap={5} align="center">
          <Tooltip title={'Xem chi tiết'}>
            <Link
              className="hover:underline"
              to={`/${lang}${routerLinks('Task')}/${constructionId}/edit-view/${record.id}?indexTemplateStage=${taskFacade.activeStep || 0}`}
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
      width: 130,
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
      render: (value) => formatDayjsDate(value),
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
      title: 'Tiến độ',
      dataIndex: 'progress',
      width: 70,
      align: 'center',
      render: (value, record) => (
        <span>
          <FlagOutlined className="text-[#1890ff] mr-1.5" />
          {`${record?.subTasks?.filter((task) => task.isCompleted)?.length}/${record?.subTasks?.length}`}
        </span>
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
                to={`/${lang}${routerLinks('Task')}/${constructionId}/edit-view/${record.id}?indexTemplateStage=${taskFacade.activeStep || 0}`}
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
      case 'userIdList':
        if (Array.isArray(value)) {
          return value
            .map((id) => userFacade.pagination?.content.find((item) => item.id === id)?.name)
            .filter(Boolean)
            .join(', ');
        }
        return userFacade.pagination?.content.find((item) => item.id === value)?.name;
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
  const countDaysFromCreated = (expiredDate: string): string => {
    const expired = new Date(expiredDate);
    const today = new Date();

    // So sánh theo ngày, bỏ phần giờ phút giây
    expired.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expired.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // dùng round để tránh sai lệch vài mili-giây

    if (diffDays > 0) {
      return `Còn ${diffDays} ngày`;
    } else if (diffDays === 0) {
      return 'Đã đến hạn';
    } else {
      return 'Đã quá hạn';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);

    // Đặt lại giờ, phút, giây về 00:00:00
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Sắp đến hạn (còn 3 ngày)
    if (diffInDays === 3 || diffInDays === 1 || diffInDays === 2) {
      return {
        message: 'Giai đoạn này của dự án sắp đến hạn',
        type: 'danger',
      };
    }

    // Đến hạn (hôm nay)
    if (diffInDays === 0) {
      return {
        message: 'Giai đoạn này của dự án đã đến hạn',
        type: 'warning',
      };
    }

    // Quá hạn (đã trễ X ngày)
    if (diffInDays < 0) {
      return {
        message: `Giai đoạn này của dự án đã quá hạn ${Math.abs(diffInDays)} ngày`,
        type: 'danger',
      };
    }

    return null;
  };

  const relativeTime = (dateString: string) => {
    const result = getRelativeTime(dateString);
    if (!result) return null;

    return (
      <Tooltip title={<p>{result.message}</p>}>
        <ExclamationCircleFilled className={`text-${result.type === 'warning' ? 'yellow' : 'red'}-500`} />
      </Tooltip>
    );
  };

  return (
    <>
      <div className={classNames('flex justify-between mt-4')}>
        <Flex justify="space-between" className="w-full" gap={'small'}>
          <div className="flex gap-3 items-center">
            <Typography.Title
              className="line-clamp-2 overflow-hidden text-ellipsis whitespace-normal max-w-[700px]"
              level={2}
              style={{ margin: 4 }}
            >
              {constructionFacade.data?.name}
            </Typography.Title>

            <Tag className="rounded-full mx-0" color={renderColor(constructionFacade?.data?.statusCode)}>
              {constructionFacade?.data?.statusName}
            </Tag>
          </div>
          <Button
            disabled={
              taskFacade.activeStep == undefined || Number(constructionFacade.data?.templateStages?.length) === 0
            }
            icon={
              constructionFacade.data?.templateStages?.[taskFacade.activeStep || 0]?.isDone ? (
                <RedoOutlined />
              ) : (
                <CheckOutlined />
              )
            }
            type={constructionFacade.data?.templateStages?.[taskFacade.activeStep || 0]?.isDone ? 'default' : 'primary'}
            className="my-1.5"
            onClick={() => {
              constructionFacade.putDoneStage(
                constructionId!,
                constructionFacade.data?.templateStages?.[taskFacade.activeStep || 0]?.id || '',
              );
            }}
          >
            {constructionFacade.data?.templateStages?.[taskFacade.activeStep || 0]?.isDone
              ? 'Đánh dấu chưa hoàn thành'
              : 'Đánh dấu hoàn thành'}
          </Button>
        </Flex>
      </div>
      <DraggableScrollWrapper>
        <Steps
          type="navigation"
          onChange={(index) => {
            taskFacade.set({
              activeStep: index,
              nameStage: constructionFacade.data?.templateStages?.[index]?.name,
              nameDescription: constructionFacade.data?.templateStages?.[index]?.description,
            });
            onChangeDataTable({
              query: {
                page: 1,
                size,
                filter: JSON.stringify({
                  ...JSON.parse(filter),
                  idTemplateStage: constructionFacade.data?.templateStages?.[index]?.id,
                  activeStep: index,
                }),
              },
            });

            taskFacade.getAnalyzeTaskEachStage(
              constructionFacade.data?.templateStages?.[index]?.id,
              constructionId as string,
            );
          }}
          current={taskFacade?.activeStep || 0}
          items={constructionFacade.data?.templateStages?.map((item: TemplateStage, index: number) => ({
            title: item.name,
            status: item?.isDone ? 'finish' : taskFacade?.activeStep == index ? 'process' : 'wait',
            className: `${index === 0 ? 'ml-3' : 'ml-5'} pr-5`,
          }))}
          style={{ width: 'max-content' }}
        />
      </DraggableScrollWrapper>
      {taskFacade?.analyzeOverviewTask != undefined && (
        <div className="p-4">
          <Card className="shadow-md rounded-2xl">
            {/* Header */}
            <div className="flex flex-wrap items-stretch gap-4 mb-2">
              {/* --- Cột thông tin giai đoạn --- */}
              <div className="flex-1 min-w-[300px]">
                <h3 className="text-base font-semibold">
                  Giai đoạn {Number(taskFacade?.activeStep) + 1}: {taskFacade?.nameStage}{' '}
                  {relativeTime(taskFacade?.expiredDateStage as string)}
                </h3>
                <p className="text-gray-500 text-sm">{taskFacade?.descriptionStage}</p>
                <Progress percent={taskFacade.analyzeOverviewTask?.percentProcess} size="small" showInfo={true} />
              </div>

              {/* --- Các Card nhỏ --- */}
              <div className="flex flex-wrap justify-end gap-4">
                <Card bordered className="rounded-2xl text-center bg-blue-50 flex-1 min-w-[200px] max-w-[250px]">
                  <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
                    <ClockCircleOutlined /> Thời hạn
                  </p>
                  <p className="text-blue-600 font-semibold text-lg">
                    {dayjs(taskFacade?.expiredDateStage)?.format('DD/MM/YYYY')}
                  </p>
                  <p className="text-gray-500 text-xs">
                    ({countDaysFromCreated(taskFacade?.expiredDateStage as string)})
                  </p>
                </Card>

                <Card bordered className="rounded-2xl text-center bg-blue-50 flex-1 min-w-[200px] max-w-[250px]">
                  <p className="text-gray-500 text-sm">Tổng công việc</p>
                  <p className="text-blue-600 font-semibold text-lg">{taskFacade?.analyzeOverviewTask?.totalTask}</p>
                </Card>

                <Card bordered className="rounded-2xl text-center bg-green-50 flex-1 min-w-[200px] max-w-[250px]">
                  <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
                    <CheckCircleOutlined /> Hoàn thành
                  </p>
                  <p className="text-green-600 font-semibold text-lg">
                    {taskFacade?.analyzeOverviewTask?.totalDoneTask} (
                    {!isNaN(
                      Math.round(
                        (Number(taskFacade?.analyzeOverviewTask?.totalDoneTask) /
                          Number(taskFacade?.analyzeOverviewTask?.totalTask)) *
                          100,
                      ),
                    )
                      ? Math.round(
                          (Number(taskFacade?.analyzeOverviewTask?.totalDoneTask) /
                            Number(taskFacade?.analyzeOverviewTask?.totalTask)) *
                            100,
                        )
                      : 0}
                    %)
                  </p>
                </Card>

                <Card bordered className="rounded-2xl text-center bg-red-50 flex-1 min-w-[200px] max-w-[250px]">
                  <p className="text-gray-500 text-sm flex justify-center items-center gap-1">
                    <CloseCircleOutlined /> Trễ hạn
                  </p>
                  <p className="text-red-600 font-semibold text-lg">
                    {taskFacade?.analyzeOverviewTask?.totalLateTask} (
                    {!isNaN(
                      Math.round(
                        (Number(taskFacade?.analyzeOverviewTask?.totalLateTask) /
                          Number(taskFacade?.analyzeOverviewTask?.totalTask)) *
                          100,
                      ),
                    )
                      ? Math.round(
                          (Number(taskFacade?.analyzeOverviewTask?.totalLateTask) /
                            Number(taskFacade?.analyzeOverviewTask?.totalTask)) *
                            100,
                        )
                      : 0}
                    %)
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      )}
      {Number(taskFacade.selectedRowKeysTable?.length) > 0 && (
        <Flex align="center" gap={16} className="mb-2">
          <Typography.Text>Đã chọn {taskFacade.selectedRowKeysTable?.length} công việc trên trang này</Typography.Text>
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
                    Khi công việc ở trạng thái Chờ duyệt, bạn sẽ không được chỉnh sửa và cần đợi quản lý phê duyệt. Thao
                    tác này không thể khôi phục.
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
                          Khi công việc ở trạng thái Đạt, nhân viên sẽ không được chỉnh sửa và thao tác này không thể
                          khôi phục.
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

      <Card size="small" variant="borderless">
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
              className="!w-52"
              mode="multiple"
              maxTagCount={1}
              placeholder="Chọn người tham gia"
              allowClear
              showSearch
              optionFilterProp="label"
              options={userFacade.pagination?.content?.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              onChange={(userIdList) => {
                onChangeDataTable({
                  query: {
                    page: 1,
                    size,
                    filter: JSON.stringify({ ...JSON.parse(filter), userIdList }),
                  },
                });
              }}
              value={parsedFilter?.userIdList}
            />
            <Select
              className="w-36"
              placeholder="Chọn trạng thái"
              allowClear
              showSearch
              optionFilterProp="label"
              options={Object.values(TaskStatusMap).map((item) => ({
                label: item.label,
                value: item.value,
              }))}
              onChange={(status) => {
                onChangeDataTable({
                  query: {
                    page: 1,
                    size,
                    filter: JSON.stringify({ ...JSON.parse(filter), status }),
                  },
                });
              }}
              value={parsedFilter?.status}
            />
            <FilterDrawer parsedFilter={parsedFilter} onChangeDataTable={onChangeDataTable} />
            {/* <Button
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
            </Button> */}
            <Tooltip
              title={
                !rightMapFacade.rightData?.rightCodes?.includes('ADDTASK')
                  ? 'Bạn không có quyền thực hiện thao tác này'
                  : null
              }
            >
              <Button
                type="primary"
                disabled={
                  Number(constructionFacade.data?.templateStages?.length) === 0 ||
                  !rightMapFacade.rightData?.rightCodes?.includes('ADDTASK')
                }
                icon={<PlusOutlined />}
                href={`#/${lang}${routerLinks('Task')}/${constructionId}/create?idTemplateStage=${constructionFacade.data?.templateStages?.[taskFacade.activeStep || 0]?.id || ''}&indexTemplateStage=${taskFacade.activeStep || 0}`}
              >
                Thêm mới
              </Button>
            </Tooltip>
          </Space>
        </Flex>
        <div className="flex flex-wrap gap-y-2 justify-start px-4 pb-4 empty:pb-0">
          {Object.entries(parsedFilter)
            .filter(([key]) => Object.keys(TaskFilterFieldNameMap).includes(key))
            .map(([key, value]) => {
              if (key === 'userIdList' && ((value as any) || [])?.length === 0) return null;
              return (
                <Tag
                  key={key}
                  className="rounded-full py-1 px-3 text-sm"
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
          loading={taskFacade.isLoading}
          size="small"
          rowSelection={{
            columnWidth: '30px',
            selectedRowKeys: taskFacade.selectedRowKeysTable,
            onChange: (newSelectedRowKeys, selectedRows) =>
              taskFacade.set({ selectedRowKeysTable: newSelectedRowKeys as string[], selectedRows }),
          }}
          dataSource={taskFacade.paginationTask?.content.map((item, index) => ({
            ...item,
          }))}
          locale={{ emptyText: <Empty description="Chưa có công việc"></Empty> }}
          columns={columns}
          rowKey="id"
          scroll={{ x: 'max-content', y: 'calc(100vh - 330px)' }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [10, 20, 50, 100],
            total: taskFacade.paginationTask?.totalElements,
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
      {taskFacade.isQuickUpdate && <QuickUpdate />}
    </>
  );
}
