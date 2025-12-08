import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  LeftOutlined,
  LoginOutlined,
  MailOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Upload } from '@core/upload';
import { EStatusState, T_Attachment } from '@models';
import {
  ConstructionFacade,
  EStatusTask,
  PriorityLevelMap,
  RightMapRoleFacade,
  SubTask,
  TaskFacade,
  TaskStatusMap,
  TaskUsageHistoriesDisplay,
  TaskUsageHistoryModel,
  UserFacade,
} from '@store';
import { formatDayjsDate, getFileIcon, lang, routerLinks } from '@utils';
import {
  App,
  AutoComplete,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Flex,
  Form,
  Image,
  Input,
  Popconfirm,
  Radio,
  Row,
  Space,
  Spin,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import TaskApproverModal from './approver-modal';
import TaskExecutorModal from './executor-modal';
import './index.less';
import ListExecutorModal from './list-excutor-model';
import TaskEditorCustom from './RichMentions';
const Page = () => {
  const refCardTask = useRef<any>(null);
  const refCardHistory = useRef<any>(null);
  const taskFacade = TaskFacade();
  const constructionFacade = ConstructionFacade();
  const userFacade = UserFacade();
  const rightMapFacade = RightMapRoleFacade();
  const { constructionId, id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [taskForm] = Form.useForm();
  const [rejectTaskForm] = Form.useForm();
  const { modal } = App.useApp();
  const [formDialogMessage] = Form.useForm();

  useEffect(() => {
    constructionFacade.getById({ id: constructionId });
    taskFacade.getById({ id });
    userFacade.get({ size: -1 });
    rightMapFacade.getRightMapByCode('CONSTRUCTION');
    return () => {
      taskFacade.set({
        listExecutor: [],
        listApprover: [],
        isEditTask: false,
        listSubTasksExecutor: [],
      });
    };
  }, [id]);

  useEffect(() => {
    if (taskFacade.autoSubmit) {
      taskForm.submit();
      taskFacade.set({ autoSubmit: false });
    }
  }, [taskFacade.autoSubmit]);

  useEffect(() => {
    switch (taskFacade.status) {
      case EStatusState.getByIdFulfilled:
        taskForm.setFieldsValue({
          ...taskFacade.data,
          startDateTime: taskFacade.data?.startDateTime ? dayjs(taskFacade.data?.startDateTime) : undefined,
          endDateTime: taskFacade.data?.endDateTime ? dayjs(taskFacade.data?.endDateTime) : undefined,
          subTasks: taskFacade.data?.subTasks?.map((item: any) => ({
            ...item,
            dueDate: item?.dueDate ? dayjs(item?.dueDate) : undefined,
          })),
        });
        taskFacade.set({
          listExecutor: taskFacade.data?.executors?.map((item: any) => ({
            employeeId: item?.idm_User?.id,
            employeeName: item?.idm_User?.name,
            employeeAvatarUrl: item?.idm_User?.avatarUrl,
          })),
          listApprover: taskFacade.data?.approvers?.map((item: any) => ({
            employeeId: item?.idm_User?.id,
            employeeName: item?.idm_User?.name,
            employeeAvatarUrl: item?.idm_User?.avatarUrl,
          })),
          listSubTasksExecutor: taskFacade.data?.subTasks?.map((item: any) =>
            item?.subTaskExecutors?.map((executor: any) => ({
              employeeId: executor?.idm_User?.id,
              employeeName: executor?.idm_User?.name,
              employeeAvatarUrl: executor?.idm_User?.avatarUrl,
            })),
          ),
          data: {
            ...taskFacade.data,
            executionTeams: [...(constructionFacade.data?.executionTeams || [])],
          },
        });
        break;
      case EStatusState.putFulfilled:
      case EStatusTask.putStatusFulfilled:
        taskFacade.getById({ id });
        break;
      case EStatusState.deleteFulfilled:
        onCancel();
        break;
    }
  }, [taskFacade.status]);
  const onFinish = (data: any) => {
    data.startDateTime = data.startDateTime ? dayjs(data.startDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.endDateTime = data.endDateTime ? dayjs(data.endDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.constructionId = constructionId;
    data.executorIds = taskFacade?.listExecutor?.map((item: any) => item?.employeeId);
    data.approverIds = taskFacade?.listApprover?.map((item: any) => item?.employeeId);
    data.subTasks = data.subTasks
      ?.filter((item: any) => item?.name)
      ?.map((item: any, index: number) => ({
        ...item,
        dueDate: item?.dueDate ? dayjs(item?.dueDate).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined,
        executorIds: taskFacade?.listSubTasksExecutor?.[index]?.map((item: any) => item?.employeeId),
      }));
    data.id = id;
    taskFacade.put(data);
  };

  const onCancel = () => {
    if (location.key === 'default')
      navigate(`/${lang}${routerLinks('Construction')}/${constructionId}/construction-monitor`, {
        state: {
          isTaskTab: 'task',
          indexTemplateStage: searchParams.get('indexTemplateStage'),
        },
      });
    else navigate(-1);
  };
  setTimeout(() => {
    if (refCardTask.current && refCardHistory.current) {
      const height: any = refCardTask.current.offsetHeight;
      refCardHistory.current.style.maxHeight = `${height}px`;
    }
  }, 100);
  return (
    <Spin spinning={taskFacade.isLoading || taskFacade.isFormLoading}>
      <div className="bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header pl-4">
        <Button
          variant="link"
          size="middle"
          onClick={onCancel}
          className="text-neutral-500 p-0 h-fit border-none shadow-none"
          icon={<LeftOutlined />}
        >
          Quay lại
        </Button>
        <Flex gap={'middle'} className="pr-4">
          <Button
            hidden={taskFacade.data?.status !== 'NotStarted'}
            onClick={() => taskFacade.putStatus({ id, status: 'InProgress' })}
            icon={<LoginOutlined />}
            type={'primary'}
          >
            Bắt đầu thực hiện
          </Button>
          <Tooltip
            title={
              !rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVALTASK')
                ? 'Bạn không có quyền thực hiện thao tác này'
                : null
            }
          >
            <Button
              hidden={!['InProgress', 'Failed'].includes(taskFacade.data?.status)}
              disabled={!rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVALTASK')}
              onClick={() => {
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
                    taskFacade.putStatus({ id, status: 'PendingApproval' });
                  },
                });
              }}
              icon={<SendOutlined />}
              type="primary"
              ghost
            >
              Gửi duyệt
            </Button>
          </Tooltip>
          <Tooltip
            title={
              !rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')
                ? 'Bạn không có quyền thực hiện thao tác này'
                : null
            }
          >
            <Button
              hidden={taskFacade.data?.status !== 'PendingApproval'}
              disabled={!rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')}
              onClick={() => {
                modal.confirm({
                  title: 'Duyệt công việc Không đạt',
                  content: (
                    <Form
                      form={rejectTaskForm}
                      layout="vertical"
                      onFinish={() => {
                        const description = rejectTaskForm.getFieldValue('description');
                        taskFacade.putStatus({ id, status: 'Failed', description });
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
              }}
              icon={<CloseOutlined />}
              type={'primary'}
              danger
            >
              Đánh dấu Không đạt
            </Button>
          </Tooltip>
          <Tooltip
            title={
              !rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')
                ? 'Bạn không có quyền thực hiện thao tác này'
                : null
            }
          >
            <Button
              hidden={taskFacade.data?.status !== 'PendingApproval'}
              disabled={!rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')}
              onClick={() => {
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
                    taskFacade.putStatus({ id, status: 'Passed' });
                  },
                });
              }}
              icon={<CheckOutlined />}
              type={'primary'}
            >
              Đánh dấu Đạt
            </Button>
          </Tooltip>
          <Button
            hidden={!['NotStarted', 'Failed'].includes(taskFacade.data?.status)}
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: 'Bạn có chắc chắn muốn xóa công việc này?',
                content: 'Thao tác này sẽ xóa công việc bạn đã chọn. Thao tác này không thể khôi phục.',
                okText: 'Xác nhận',
                okType: 'danger',
                okButtonProps: {
                  type: 'primary',
                },
                onOk: () => taskFacade.delete(id),
              });
            }}
          >
            Xóa công việc
          </Button>
          {/* <Button
            hidden={taskFacade.data?.status !== 'NotStarted'}
            onClick={() => taskFacade.putStatus({ id, status: 'InProgress' })}
            icon={<LoginOutlined />}
            type={'primary'}
          >
            Bắt đầu thực hiện
          </Button> */}
        </Flex>
      </div>
      <div className="my-4 mx-6">
        <Form
          layout="vertical"
          className="px-2"
          form={taskForm}
          onFinish={onFinish}
          onValuesChange={(changedValues) => {
            if (
              changedValues?.attachments ||
              changedValues?.subTasks?.some((item: SubTask) => 'attachments' in item || 'isCompleted' in item)
            )
              taskForm.submit();
          }}
        >
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={24} lg={16}>
              <Card
                ref={refCardTask}
                title={
                  <Space size={10}>
                    Thông tin công việc
                    <Tag
                      className="px-2.5 py-0.5 rounded-full text-sm"
                      color={TaskStatusMap[taskFacade.data?.status]?.color}
                    >
                      {TaskStatusMap[taskFacade.data?.status]?.label}
                    </Tag>
                  </Space>
                }
                extra={
                  taskFacade?.isEditTask ? (
                    <Space size={'middle'}>
                      <Button onClick={() => taskFacade.set({ isEditTask: false })} icon={<CloseOutlined />}>
                        Hủy bỏ
                      </Button>
                      <Button
                        onClick={() =>
                          taskForm.validateFields().then(() => {
                            taskForm.submit();
                            taskFacade.set({ isEditTask: false });
                          })
                        }
                        icon={<SaveOutlined />}
                        type={'primary'}
                      >
                        Lưu lại
                      </Button>
                    </Space>
                  ) : (
                    <Tooltip
                      title={
                        !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                          ? 'Bạn không có quyền thực hiện thao tác này'
                          : null
                      }
                    >
                      <Button
                        hidden={['PendingApproval', 'Passed'].includes(taskFacade.data?.status)}
                        type="primary"
                        icon={<EditOutlined />}
                        className="my-1.5"
                        ghost
                        onClick={() => taskFacade.set({ isEditTask: true })}
                        disabled={!rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')}
                      >
                        Chỉnh sửa
                      </Button>
                    </Tooltip>
                  )
                }
              >
                <Row gutter={16}>
                  <Col className="mb-3" hidden={taskFacade.isEditTask}>
                    <Descriptions
                      column={12}
                      layout="vertical"
                      colon={false}
                      classNames={{
                        label: '!min-w-40',
                        content: '!min-w-40',
                      }}
                      items={[
                        {
                          label: 'Mã công việc',
                          children: taskFacade.data?.code,
                          className: '!pb-3',
                          span: {
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 3,
                            xl: 2,
                            xxl: 2,
                          },
                        },
                        {
                          label: 'Thứ tự thực hiện',
                          children: taskFacade.data?.priorityOrder,
                          className: '!pb-3',
                          span: {
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 3,
                            xl: 2,
                            xxl: 2,
                          },
                        },
                        {
                          label: 'Tên công việc',
                          children: taskFacade.data?.name,
                          className: '!pb-3',
                          span: {
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 6,
                            xl: 8,
                            xxl: 8,
                          },
                        },
                        {
                          label: 'Ngày bắt đầu',
                          children: formatDayjsDate(taskFacade.data?.startDateTime),
                          className: '!pb-3',
                          span: {
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 3,
                            xl: 2,
                            xxl: 2,
                          },
                        },
                        {
                          label: 'Hạn chót',
                          children: formatDayjsDate(taskFacade.data?.endDateTime),
                          className: '!pb-3',
                          span: {
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 3,
                            xl: 2,
                            xxl: 2,
                          },
                        },
                        {
                          label: 'Độ ưu tiên',
                          children: (
                            <Form.Item name="priorityLevel" className="mb-0">
                              <Radio.Group
                                disabled={!taskFacade.isEditTask}
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
                          ),
                          className: '!pb-3',
                          span: {
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 6,
                            xl: 8,
                            xxl: 8,
                          },
                        },
                        {
                          label: 'Mô tả',
                          children: taskFacade.data?.description,
                          className: '!pb-3',
                          span: {
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12,
                            xl: 12,
                            xxl: 12,
                          },
                        },
                      ]}
                    />
                  </Col>
                  <Col
                    xs={24}
                    className={classNames('flex gap-4', {
                      hidden: !taskFacade.isEditTask,
                    })}
                  >
                    <Form.Item label="Mã công việc" name="code">
                      <Input disabled={true} className="w-28" />
                    </Form.Item>
                    <Form.Item
                      label="Thứ tự"
                      name="priorityOrder"
                      rules={[
                        { required: true, message: 'Vui lòng nhập thứ tự' },
                        {
                          type: 'number',
                          min: 1,
                          max: 100,
                          message: 'Chỉ được nhập giá trị từ 1 đến 100',
                          transform: (value) => Number(value),
                        },
                      ]}
                    >
                      <AutoComplete
                        options={[...Array(100)].map((_, index) => ({
                          label: index + 1,
                          value: index + 1,
                        }))}
                        className="!w-[66px]"
                      />
                    </Form.Item>
                    <Form.Item label="Tên công việc" name="name" rules={[{ required: true }]} className="w-full">
                      <Input placeholder="Nhập tên công việc" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={7} hidden={!taskFacade.isEditTask}>
                    <Form.Item label="Ngày bắt đầu" name="startDateTime">
                      <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={7} hidden={!taskFacade.isEditTask}>
                    <Form.Item label="Hạn chót" name="endDateTime">
                      <DatePicker format="DD/MM/YYYY" placeholder="Chọn hạn chót" className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={10} hidden={!taskFacade.isEditTask}>
                    <Form.Item label="Độ ưu tiên" name="priorityLevel">
                      <Radio.Group
                        disabled={!taskFacade.isEditTask}
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
                  <Col span={24} hidden={!taskFacade.isEditTask}>
                    <Form.Item label="Mô tả" name="description">
                      <Input.TextArea placeholder="Nhập mô tả" rows={3} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={'Người phê duyệt'}
                      name={'approverIds'}
                      // rules={[
                      //   {
                      //     required: true,
                      //     validator: (_, value) => {
                      //       if (taskFacade?.listExecutor && taskFacade?.listExecutor?.length > 0) {
                      //         return Promise.resolve();
                      //       }
                      //       return Promise.reject(new Error('Người theo dõi không được để trống!'));
                      //     },
                      //   },
                      // ]}
                    >
                      <div className={'flex'}>
                        {taskFacade?.listApprover?.length > 0 && (
                          <Avatar.Group
                            className={'cursor-pointer'}
                            max={{
                              count: 3,
                              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                            }}
                          >
                            {taskFacade?.listApprover?.map((item: any) => (
                              <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                                <Avatar src={item?.employeeAvatarUrl} />
                              </Tooltip>
                            ))}
                          </Avatar.Group>
                        )}
                        <PlusCircleOutlined
                          className={classNames('text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]', {
                            'opacity-50 !cursor-not-allowed':
                              ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                              !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK'),
                          })}
                          onClick={() => {
                            if (
                              ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                              !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                            )
                              return;
                            taskFacade.set({
                              isChooseUserManyApproverModal: true,
                            });
                          }}
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={'Nhân sự thực hiện'}
                      name={'executorIds'}
                      // rules={[
                      //   {
                      //     required: true,
                      //     validator: (_, value) => {
                      //       if (
                      //         taskFacade?.listParticipantsArr?.length &&
                      //         taskFacade?.listParticipantsArr?.length > 0
                      //       ) {
                      //         return Promise.resolve();
                      //       }
                      //       return Promise.reject(new Error('Nhân sự tham gia không được để trống!'));
                      //     },
                      //   },
                      // ]}
                    >
                      <div className={'flex'}>
                        {taskFacade?.listExecutor?.length > 0 && (
                          <Avatar.Group
                            className={'cursor-pointer'}
                            max={{
                              count: 3,
                              style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                            }}
                          >
                            {taskFacade?.listExecutor?.map((item: any) => (
                              <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                                <Avatar src={item?.employeeAvatarUrl} />
                              </Tooltip>
                            ))}
                          </Avatar.Group>
                        )}

                        <PlusCircleOutlined
                          className={classNames('text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]', {
                            'opacity-50 !cursor-not-allowed':
                              ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                              !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK'),
                          })}
                          onClick={() => {
                            if (
                              ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                              !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                            )
                              return;
                            taskFacade.set({
                              isChooseUserManyPresentModal: true,
                            });
                          }}
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="attachments">
                      <Upload
                        action={`attach`}
                        accept="*"
                        isShowImage={false}
                        renderContent={(file?: T_Attachment, handleDeleteFile?: (file: T_Attachment) => void) => (
                          <Flex
                            key={file?.id}
                            wrap="wrap"
                            align="center"
                            justify="space-between"
                            gap="small"
                            className="border p-3 shadow-sm hover:shadow-md transition-all w-full mt-3"
                          >
                            <Flex align="center" gap="small" className="flex-1 min-w-0">
                              <Image preview={false} src={getFileIcon(file?.fileType)} width={24} />
                              <div className="truncate flex-1 min-w-0">
                                <a
                                  href={file?.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block truncate text-blue-600"
                                >
                                  {file?.fileName}
                                </a>
                              </div>
                            </Flex>
                            <Popconfirm
                              title="Bạn có chắc muốn xóa file này?"
                              okText="Xóa"
                              cancelText="Hủy"
                              onConfirm={() => handleDeleteFile?.(file!)}
                            >
                              <DeleteOutlined className="text-lg text-gray-400 hover:text-red-500" />
                            </Popconfirm>
                          </Flex>
                        )}
                      >
                        <Button
                          disabled={
                            ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                            !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                          }
                          icon={<UploadOutlined />}
                          className="!px-2 !py-0.5 !font-normal"
                        >
                          Tải lên file đính kèm
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24} lg={8}>
              <Card title="Lịch sử hoạt động" className="h-full overflow-y-auto" ref={refCardHistory}>
                <Timeline
                  items={taskFacade?.data?.taskUsageHistories?.map((item: TaskUsageHistoryModel) => ({
                    color:
                      item?.activityType === 'MarkedAsPassed'
                        ? 'green'
                        : item?.activityType === 'MarkedAsFailed'
                          ? 'red'
                          : 'blue',
                    children: (
                      <Flex vertical gap={2}>
                        <div>
                          <Typography.Text strong>{item?.createdByUserName}</Typography.Text>{' '}
                          <Typography.Text>{TaskUsageHistoriesDisplay[item?.activityType]}</Typography.Text>
                          {item?.nameSubtask && <Typography.Text strong>{` ${item?.nameSubtask}`}</Typography.Text>}
                          {item?.activityType === 'MarkedAsPassed' && (
                            <Typography.Text className="text-green-500"> Đạt</Typography.Text>
                          )}
                          {item?.activityType === 'MarkedAsFailed' && (
                            <Typography.Text className="text-red-500"> Không đạt</Typography.Text>
                          )}
                        </div>
                        {item?.activityType === 'MarkedAsFailed' && (
                          <Typography.Link
                            className="text-xs text-blue-500"
                            onClick={() =>
                              modal.info({
                                title: 'Lý do không đạt',
                                content: item?.description ? (
                                  <Typography.Text>{item?.description}</Typography.Text>
                                ) : (
                                  <Typography.Text type="secondary">
                                    Không có lý do cụ thể được cung cấp.
                                  </Typography.Text>
                                ),
                                okText: 'Đóng',
                              })
                            }
                          >
                            Xem lý do Không đạt
                          </Typography.Link>
                        )}
                        <Typography.Text className="text-xs text-gray-500">
                          {formatDayjsDate(item?.createdOnDate, 'DD/MM/YYYY HH:mm')}
                        </Typography.Text>
                      </Flex>
                    ),
                  }))}
                />
              </Card>
            </Col>
            <Col span={24} lg={16}>
              <Card
                title="Công việc con"
                className="h-full"
                extra={
                  <Space size={'middle'}>
                    <Button
                      disabled={
                        ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                        !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                      }
                      type="primary"
                      icon={<PlusOutlined />}
                      className="my-1.5"
                      ghost
                      onClick={() => {
                        taskForm.setFieldsValue({
                          subTasks: [...(taskForm.getFieldValue('subTasks') || []), {}],
                        });
                        taskFacade.set({
                          data: {
                            ...taskFacade.data,
                            subTasks: [...(taskFacade.data?.subTasks || []), { isEditSubTask: true }], // Thêm công việc con mới
                          },
                        });
                      }}
                    >
                      Thêm mới công việc con
                    </Button>
                  </Space>
                }
              >
                <Form.List name="subTasks">
                  {(fields, { add, remove }) => (
                    <Space direction="vertical" className="w-full" size={12}>
                      {fields.map((field, idx) => (
                        <Flex
                          gap={'small'}
                          key={field.key}
                          className="p-3 rounded-md shadow-[0px_1px_4px_0px_#0C0C0D1A]"
                        >
                          <Form.Item name={[field.name, 'isCompleted']} valuePropName="checked">
                            <Checkbox
                              disabled={
                                ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                              }
                            />
                          </Form.Item>
                          <Flex vertical justify="end" gap="small" className="w-full">
                            <Typography.Text
                              className="h-9 mb-0 content-center"
                              hidden={taskFacade.data?.subTasks?.[idx]?.isEditSubTask}
                            >
                              {taskFacade.data?.subTasks?.[idx]?.name}
                            </Typography.Text>
                            <Form.Item
                              hidden={!taskFacade.data?.subTasks?.[idx]?.isEditSubTask}
                              name={[field.name, 'name']}
                              className="flex-1 mb-0"
                              rules={[{ required: true, message: 'Nhập tên công việc con' }]}
                            >
                              <Input placeholder="Nhập tên công việc con" className="w-full" />
                            </Form.Item>

                            <Flex align="center" gap="small" className="ml-auto">
                              <Form.Item className="mb-0" name={'executorIds'}>
                                <div className={'flex'}>
                                  {taskFacade?.listSubTasksExecutor?.[idx]?.length > 0 && (
                                    <Avatar.Group
                                      className={'cursor-pointer'}
                                      max={{
                                        count: 3,
                                        style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                                      }}
                                    >
                                      {taskFacade?.listSubTasksExecutor?.[idx]?.map((item: any) => (
                                        <Tooltip title={item?.employeeName} placement="top" key={item?.employeeId}>
                                          <Avatar src={item?.employeeAvatarUrl} />
                                        </Tooltip>
                                      ))}
                                    </Avatar.Group>
                                  )}

                                  <PlusCircleOutlined
                                    className={classNames('text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]', {
                                      'opacity-50 !cursor-not-allowed':
                                        ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                        !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK'),
                                    })}
                                    onClick={() => {
                                      if (
                                        ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                        !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                                      )
                                        return;
                                      taskFacade.set({
                                        isChooseUserManySubTaskModal: true,
                                        indexSubTask: idx,
                                      });
                                    }}
                                  />
                                </div>
                              </Form.Item>
                              <Flex gap={6} hidden={taskFacade.data?.subTasks?.[idx]?.isEditSubTask} className="ml-2">
                                <FieldTimeOutlined className="text-lg" />
                                <Typography.Text>
                                  {formatDayjsDate(taskFacade.data?.subTasks?.[idx]?.dueDate)}
                                </Typography.Text>
                              </Flex>

                              <Form.Item
                                name={[field.name, 'dueDate']}
                                className="w-44 mb-0"
                                hidden={!taskFacade.data?.subTasks?.[idx]?.isEditSubTask}
                              >
                                <DatePicker
                                  disabled={!taskFacade.data?.subTasks?.[idx]?.isEditSubTask}
                                  className="w-full"
                                  placeholder="Chọn ngày hết hạn"
                                  format="DD/MM/YYYY"
                                />
                              </Form.Item>
                            </Flex>
                            <Form.Item name={[field.name, 'attachments']} className="mb-0 ml-auto text-end">
                              <Upload
                                action={`attach`}
                                accept="*"
                                isShowImage={false}
                                renderContent={(
                                  file?: T_Attachment,
                                  handleDeleteFile?: (file: T_Attachment) => void,
                                ) => (
                                  <Flex
                                    key={file?.id}
                                    wrap="wrap"
                                    align="center"
                                    justify="space-between"
                                    gap="small"
                                    className="border p-3 shadow-sm hover:shadow-md transition-all w-full mt-3"
                                  >
                                    <Flex align="center" gap="small" className="flex-1 min-w-0">
                                      <Image preview={false} src={getFileIcon(file?.fileType)} width={24} />
                                      <div className="truncate flex-1 min-w-0">
                                        <a
                                          href={file?.fileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="block truncate text-blue-600"
                                        >
                                          {file?.fileName}
                                        </a>
                                      </div>
                                    </Flex>
                                    <Popconfirm
                                      title="Bạn có chắc muốn xóa file này?"
                                      okText="Xóa"
                                      cancelText="Hủy"
                                      onConfirm={() => handleDeleteFile?.(file!)}
                                    >
                                      <DeleteOutlined className="text-lg text-gray-400 hover:text-red-500" />
                                    </Popconfirm>
                                  </Flex>
                                )}
                              >
                                <Button
                                  disabled={
                                    ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                    !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                                  }
                                  icon={<UploadOutlined />}
                                  className="!px-2 !py-0.5 !font-normal w-44"
                                >
                                  Tải lên file đính kèm
                                </Button>
                              </Upload>
                            </Form.Item>
                          </Flex>
                          {taskFacade.data?.subTasks?.[idx]?.isEditSubTask ? (
                            <Tooltip title="Lưu lại">
                              <Button
                                disabled={
                                  ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                  !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                                }
                                type="link"
                                icon={<CheckOutlined />}
                                className="text-base"
                                onClick={() => taskForm.submit()}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Chỉnh sửa">
                              <Button
                                disabled={
                                  ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                  !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                                }
                                type="link"
                                icon={<EditOutlined />}
                                className="text-base"
                                onClick={() => {
                                  const newSubTasks = [...(taskFacade.data?.subTasks || [])];
                                  newSubTasks[idx] = { ...newSubTasks[idx], isEditSubTask: true };
                                  taskFacade.set({
                                    data: {
                                      ...taskFacade.data,
                                      subTasks: newSubTasks,
                                    },
                                  });
                                }}
                              />
                            </Tooltip>
                          )}

                          {taskFacade.data?.subTasks?.[idx]?.isEditSubTask ? (
                            <Tooltip title="Hủy bỏ">
                              <Button
                                disabled={
                                  ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                  !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                                }
                                type="link"
                                danger
                                icon={<CloseOutlined />}
                                className="text-base"
                                onClick={() => {
                                  const newSubTasks = [...(taskFacade.data?.subTasks || [])];
                                  newSubTasks[idx] = { ...newSubTasks[idx], isEditSubTask: false };
                                  taskFacade.set({
                                    data: {
                                      ...taskFacade.data,
                                      subTasks: newSubTasks,
                                    },
                                  });
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Popconfirm
                              title="Bạn có chắc muốn xóa công việc con này?"
                              okText="Xóa"
                              cancelText="Hủy"
                              onConfirm={async () => {
                                await remove(field.name);
                                taskFacade.set({
                                  listSubTasksExecutor: taskFacade.listSubTasksExecutor?.filter(
                                    (_: any, index: any) => index !== idx,
                                  ),
                                });
                                taskForm.submit();
                              }}
                            >
                              <Button
                                disabled={
                                  ['PendingApproval', 'Passed'].includes(taskFacade.data?.status) ||
                                  !rightMapFacade.rightData?.rightCodes?.includes('UPDATETASK')
                                }
                                type="link"
                                danger
                                className="text-base"
                                icon={<DeleteOutlined />}
                              />
                            </Popconfirm>
                          )}
                        </Flex>
                      ))}
                    </Space>
                  )}
                </Form.List>
              </Card>
            </Col>
            <Col span={24} lg={8}>
              <Card
                bodyStyle={{ padding: '16px' }}
                className={'h-[870px]'}
                title={
                  <div className="flex gap-4">
                    <MailOutlined className={'text-[24px]'} />
                    <p className={'text-[14px]'}>Trao đổi</p>
                  </div>
                }
              >
                <Form form={formDialogMessage}>
                  <div className={'relative'}>
                    <Form.Item name={'content'}>
                      <TaskEditorCustom taskId={id} />
                    </Form.Item>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
      {taskFacade.isChooseUserManyPresentModal && (
        <TaskExecutorModal
          title={'Chọn nhân sự thực hiện'}
          data={taskFacade?.listExecutor}
          listUser={(userFacade?.pagination?.content || []).filter((user: any) =>
            (constructionFacade?.data?.executionTeams || [])
              .filter((x: any) => x.userType === 'participants')
              .map((x: any) => x.employeeId)
              .includes(user.id),
          )}
          autoSubmit={true}
        />
      )}
      {taskFacade.isChooseUserManyApproverModal && (
        <TaskApproverModal
          title={'Chọn người phê duyệt'}
          data={taskFacade?.listApprover}
          listUser={(userFacade?.pagination?.content || []).filter((user: any) =>
            (constructionFacade?.data?.executionTeams || [])
              .filter((x: any) => x.userType === 'follower')
              .map((x: any) => x.employeeId)
              .includes(user.id),
          )}
          autoSubmit={true}
        />
      )}
      {taskFacade.isChooseUserManySubTaskModal && (
        <ListExecutorModal
          title={'Chọn nhân sự thực hiện'}
          data={taskFacade?.listSubTasksExecutor?.[taskFacade.indexSubTask || 0]}
          indexSubTask={taskFacade.indexSubTask || 0}
          listUser={userFacade?.pagination?.content.filter((user) =>
            taskFacade?.listExecutor?.some((executor: any) => executor.employeeId === user.id),
          )}
          autoSubmit={true}
        />
      )}
    </Spin>
  );
};

export default Page;
