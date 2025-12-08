import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  LeftOutlined,
  LoginOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Upload } from '@core/upload';
import { EStatusState, T_Attachment } from '@models';
import {
  CodeTypeFacade,
  CodeTypeManagementFacade,
  CodeTypeModel,
  ConstructionFacade,
  EStatusTask,
  EStatusTaskPersonal,
  PriorityLevelMap,
  SubTaskPersonal,
  TaskFacade,
  TaskPersonalFacade,
  TaskPersonalModel,
  TaskStatusMap,
  UserFacade,
} from '@store';
import { getFileIcon, getRandomHexColor } from '@utils';
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
  Select,
  Typography,
  Tag,
  App,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const { Text } = Typography;

const Page = () => {
  const taskPersonalFacade = TaskPersonalFacade();
  const userFacade = UserFacade();
  const navigate = useNavigate();
  const [taskForm] = Form.useForm();
  const codeTypeFacade = CodeTypeFacade();
  const codeTypeManagementFacade = CodeTypeManagementFacade();
  const { modal } = App.useApp();
  const { id } = useParams();

  useEffect(() => {
    userFacade.get({ size: -1 });
    codeTypeFacade.get({ size: -1 });
  }, []);

  useEffect(() => {
    if (id) {
      taskPersonalFacade.getById({ id: id });
    }
  }, [id]);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.postFulfilled:
        codeTypeFacade.get({ size: -1 });
        setIsAdding(false);
        break;
    }
  }, [codeTypeManagementFacade.status]);

  useEffect(() => {
    switch (taskPersonalFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        onCancel();
        break;
      case EStatusTaskPersonal.putStatusFulfilled:
        taskPersonalFacade.getById({ id: id as string });
        break;
      case EStatusState.deleteFulfilled:
        onCancel();
        break;
      case EStatusState.getByIdFulfilled:
        taskForm.setFieldsValue({
          name: taskPersonalFacade.data?.name,
          startDateTime: dayjs(taskPersonalFacade.data?.startDateTime),
          endDateTime: dayjs(taskPersonalFacade.data?.endDateTime),
          taskType: taskPersonalFacade.data?.taskType,
          priorityLevel: taskPersonalFacade.data?.priorityLevel,
          note: taskPersonalFacade.data?.note,
          subTaskPersonals: taskPersonalFacade.data?.subTaskPersonals?.map((item: any) => ({
            ...item,
            dueDate: item?.dueDate ? dayjs(item?.dueDate) : undefined,
          })),
        });
    }
  }, [taskPersonalFacade.status]);

  const onFinish = (data: TaskPersonalModel) => {
    data.startDateTime = data.startDateTime ? dayjs(data.startDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.endDateTime = data.endDateTime ? dayjs(data.endDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.name = data.name ? data.name : undefined;
    data.taskType = data.taskType ? data.taskType : undefined;
    data.subTaskPersonals = data.subTaskPersonals?.map((item: any) => ({
      ...item,
      dueDate: item?.dueDate ? dayjs(item?.dueDate).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined,
    }));

    if (id) {
      taskPersonalFacade.put({ ...data, id: id });
    } else {
      taskPersonalFacade.post(data);
    }
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

  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    codeTypeManagementFacade.post({
      title: newCategory,
      code: newCategory,
      type: 'TASK_TYPE',
      description: getRandomHexColor(),
    });
  };

  return (
    <Spin spinning={taskPersonalFacade.isLoading || taskPersonalFacade.isFormLoading}>
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
          <Button
            onClick={() => {
              taskPersonalFacade.delete(id as string);
            }}
            icon={<DeleteOutlined />}
            color="danger"
            variant="solid"
          >
            Xóa công việc
          </Button>
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
              <Card
                title={
                  <Space size={10}>
                    Thông tin công việc
                    <Tag
                      className="px-2.5 py-0.5 rounded-full text-sm"
                      color={TaskStatusMap[taskPersonalFacade.data?.status]?.color}
                    >
                      {TaskStatusMap[taskPersonalFacade.data?.status]?.label}
                    </Tag>
                  </Space>
                }
                extra={
                  <Flex gap={'middle'} className="pr-4">
                    <Button
                      hidden={taskPersonalFacade.data?.status !== 'NotStarted'}
                      onClick={() => taskPersonalFacade.putStatus({ id: id as string, status: 'InProgress' })}
                      icon={<LoginOutlined />}
                      color="primary"
                      variant="outlined"
                    >
                      Bắt đầu thực hiện
                    </Button>
                    <Button
                      hidden={taskPersonalFacade.data?.status !== 'InProgress'}
                      // disabled={!rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')}
                      onClick={() => {
                        modal.confirm({
                          title: 'Bạn có chắc chắn muốn duyệt Đạt công việc này?',
                          content: (
                            <Typography.Text>
                              Khi công việc ở trạng thái Đạt, nhân viên sẽ không được chỉnh sửa và thao tác này không
                              thể khôi phục.
                            </Typography.Text>
                          ),
                          okText: 'Xác nhận',
                          onOk() {
                            taskPersonalFacade.putStatus({ id: id as string, status: 'Passed' });
                          },
                        });
                      }}
                      icon={<CloseOutlined />}
                      color="danger"
                      variant="outlined"
                    >
                      Không đạt
                    </Button>
                    <Button
                      hidden={taskPersonalFacade.data?.status !== 'InProgress'}
                      // disabled={!rightMapFacade.rightData?.rightCodes?.includes('APPROVETASK')}
                      onClick={() => {
                        modal.confirm({
                          title: 'Bạn có chắc chắn muốn duyệt Đạt công việc này?',
                          content: (
                            <Typography.Text>
                              Khi công việc ở trạng thái Đạt, nhân viên sẽ không được chỉnh sửa và thao tác này không
                              thể khôi phục.
                            </Typography.Text>
                          ),
                          okText: 'Xác nhận',
                          onOk() {
                            taskPersonalFacade.putStatus({ id: id as string, status: 'Passed' });
                          },
                        });
                      }}
                      icon={<CheckOutlined />}
                      color="primary"
                      variant="outlined"
                    >
                      Đạt
                    </Button>
                  </Flex>
                }
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
                        subTaskPersonals: [...(taskForm.getFieldValue('subTaskPersonals') ?? []), {}],
                      })
                    }
                  >
                    Thêm công việc con
                  </Button>
                }
              >
                <Form.List name="subTaskPersonals">
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
                              <Form.Item name={[field.name, 'dueDate']} className="w-44 mb-0">
                                <DatePicker className="w-full" placeholder="Chọn ngày hết hạn" format="DD/MM/YYYY" />
                              </Form.Item>
                            </Flex>
                          </Flex>
                          <Tooltip title={'Xóa'}>
                            <Button
                              type="link"
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => {
                                remove(field.name);
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
    </Spin>
  );
};

export default Page;
