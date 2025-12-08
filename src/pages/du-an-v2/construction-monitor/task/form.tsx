import {
  CloseOutlined,
  DeleteOutlined,
  LeftOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Upload } from '@core/upload';
import { EStatusState, T_Attachment } from '@models';
import { ConstructionFacade, EStatusTask, PriorityLevelMap, TaskFacade, UserFacade } from '@store';
import { getFileIcon } from '@utils';
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Image,
  Input,
  Popconfirm,
  Radio,
  Row,
  Space,
  Spin,
  Tooltip,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import TaskApproverModal from './approver-modal';
import TaskExecutorModal from './executor-modal';
import ListExecutorModal from './list-excutor-model';

const Page = () => {
  const taskFacade = TaskFacade();
  const constructionFacade = ConstructionFacade();
  const userFacade = UserFacade();
  const { constructionId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [taskForm] = Form.useForm();

  useEffect(() => {
    constructionFacade.getById({ id: constructionId });
    userFacade.get({ size: -1 });
    taskFacade.getMaxPriorityOrder(constructionId, searchParams.get('idTemplateStage') || '');
    return () => {
      taskFacade.set({
        listExecutor: [],
        listApprover: [],
        listSubTasksExecutor: [],
      });
    };
  }, []);

  useEffect(() => {
    switch (taskFacade.status) {
      case EStatusState.postFulfilled:
        onCancel();
        break;
      case EStatusTask.getMaxPriorityOrderFulfilled:
        taskForm.setFieldsValue({
          priorityOrder: Number(taskFacade.maxPriorityOrder) + 1,
        });
        break;
    }
  }, [taskFacade.status]);

  const onFinish = (data: any) => {
    data.startDateTime = data.startDateTime ? dayjs(data.startDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.endDateTime = data.endDateTime ? dayjs(data.endDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.constructionId = constructionId;
    data.executorIds = taskFacade?.listExecutor?.map((item: any) => item?.employeeId);
    data.approverIds = taskFacade?.listApprover?.map((item: any) => item?.employeeId);
    data.idTemplateStage = searchParams.get('idTemplateStage');
    data.subTasks = data.subTasks?.map((item: any, index: number) => ({
      ...item,
      dueDate: item?.dueDate ? dayjs(item?.dueDate).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined,
      executorIds: taskFacade?.listSubTasksExecutor?.[index]?.map((item: any) => item?.employeeId),
    }));
    taskFacade.post(data);
  };

  const onCancel = () => {
    // if (location.key === 'default') {
    //   navigate(`/${lang}${routerLinks('Construction')}/${constructionId}/construction-monitor`, {
    //     state: {
    //       isTaskTab: 'task',
    //       indexTemplateStage: searchParams.get('indexTemplateStage'),
    //     },
    //   });
    // } else {
    navigate(-1);
    // }
  };
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
        <Space className="pr-4">
          <Button onClick={taskForm.submit} icon={<SaveOutlined />} type={'primary'}>
            Lưu lại
          </Button>
        </Space>
      </div>
      <div className="my-4 mx-6">
        <Form
          layout="vertical"
          className="px-2"
          form={taskForm}
          onFinish={onFinish}
          initialValues={{
            priorityLevel: 'Medium',
            subTasks: [],
          }}
        >
          <Row gutter={20} className="mb-4">
            <Col span={24} lg={15}>
              <Card title="Thông tin công việc">
                <Row gutter={16}>
                  <Col span={24} className="flex gap-4">
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
                  <Col xs={24} md={7}>
                    <Form.Item label="Ngày bắt đầu" name="startDateTime">
                      <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={7}>
                    <Form.Item label="Hạn chót" name="endDateTime">
                      <DatePicker format="DD/MM/YYYY" placeholder="Chọn hạn chót" className="w-full" />
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
                          className={'text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]'}
                          onClick={() =>
                            taskFacade.set({
                              isChooseUserManyApproverModal: true,
                            })
                          }
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
                          className={'text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]'}
                          onClick={() =>
                            taskFacade.set({
                              isChooseUserManyPresentModal: true,
                            })
                          }
                        />
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="attachments">
                      <Upload
                        action={`attach`}
                        text="Tải lên file đính kèm"
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
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24} lg={9}>
              <Card
                title="Công việc con"
                className="h-full"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="my-1.5"
                    ghost
                    onClick={() =>
                      taskForm.setFieldsValue({
                        subTasks: [...taskForm.getFieldValue('subTasks'), {}],
                      })
                    }
                  >
                    Thêm công việc con
                  </Button>
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
                            <Checkbox />
                          </Form.Item>
                          <Flex vertical justify="end" gap="small" className="w-full">
                            <Form.Item
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
                                    className={'text-[24px] ml-2 cursor-pointer hover:text-[#1890FF]'}
                                    onClick={() =>
                                      taskFacade.set({
                                        isChooseUserManySubTaskModal: true,
                                        indexSubTask: idx,
                                      })
                                    }
                                  />
                                </div>
                              </Form.Item>
                              <Form.Item name={[field.name, 'dueDate']} className="w-44 mb-0">
                                <DatePicker className="w-full" placeholder="Chọn ngày hết hạn" format="DD/MM/YYYY" />
                              </Form.Item>
                            </Flex>
                            <Form.Item name={[field.name, 'attachments']} className="mb-0 text-right">
                              <Upload
                                action={`attach`}
                                text="Tải lên file đính kèm"
                                accept="*"
                                style="ml-auto w-44"
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
                              />
                            </Form.Item>
                          </Flex>
                          <Tooltip title={'Xóa'}>
                            <Button
                              type="link"
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => {
                                remove(field.name);
                                taskFacade.set({
                                  listSubTasksExecutor: taskFacade.listSubTasksExecutor?.filter(
                                    (_: any, index: any) => index !== idx,
                                  ),
                                });
                              }}
                            />
                          </Tooltip>
                        </Flex>
                      ))}
                    </Space>
                  )}
                </Form.List>
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
        />
      )}
      {taskFacade.isChooseUserManySubTaskModal && (
        <ListExecutorModal
          title={'Chọn nhân sự thực hiện'}
          data={taskFacade?.listSubTasksExecutor?.[taskFacade.indexSubTask || 0]}
          indexSubTask={taskFacade.indexSubTask || 0}
          listUser={userFacade?.pagination?.content.filter((user) =>
            taskFacade?.listExecutor?.some((approver: any) => approver.employeeId === user.id),
          )}
        />
      )}
    </Spin>
  );
};

export default Page;
