import { EditOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { EStatusState } from '@models';
import { ConstructionFacade, PriorityLevelMap, TaskFacade, UserFacade } from '@store';
import { lang, routerLinks } from '@utils';
import { Avatar, Button, Col, ConfigProvider, DatePicker, Form, Modal, Radio, Row, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaskExecutorModal from './executor-modal';

export const QuickUpdate = () => {
  const taskFacade = TaskFacade();
  const userFacade = UserFacade();
  const constructionFacade = ConstructionFacade();
  const [taskForm] = Form.useForm();
  useEffect(() => {
    taskFacade.getById({ id: taskFacade.data?.id });

    return () => {
      taskFacade.set({
        listExecutor: [],
        listApprover: [],
        isEditSubTask: false,
        isEditQuickUpdate: false,
      });
    };
  }, []);

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
    }
  }, [taskFacade.status]);

  const handleClose = () => {
    taskFacade.set({
      isQuickUpdate: false,
    });
  };

  const onFinish = (data: any) => {
    data.startDateTime = data.startDateTime ? dayjs(data.startDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.endDateTime = data.endDateTime ? dayjs(data.endDateTime).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined;
    data.constructionId = constructionFacade?.data?.id;
    data.executorIds = taskFacade?.listExecutor?.map((item: any) => item?.employeeId);
    data.approverIds = taskFacade?.listApprover?.map((item: any) => item?.employeeId);
    // data.subTasks = data.subTasks?.map((item: any, index: number) => ({
    //   ...item,
    //   dueDate: item?.dueDate ? dayjs(item?.dueDate).format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined,
    //   executorIds: taskFacade?.listSubTasksExecutor?.[index]?.map((item: any) => item?.employeeId),
    // }));
    data.id = taskFacade.data?.id;
    taskFacade.put({
      ...taskFacade.data,
      ...data,
    });
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            wireframe: true,
          },
        },
      }}
    >
      <Modal
        title={'Cập nhật nhanh'}
        open={taskFacade.isQuickUpdate}
        // okText={'Báo hỏng'}
        // cancelText={'Hủy bỏ'}
        // onOk={taskForm.submit}
        onCancel={() => handleClose()}
        footer={null}
        confirmLoading={taskFacade.isFormLoading}
      >
        <Spin spinning={taskFacade.isFormLoading}>
          <Form layout="vertical" className="px-2" form={taskForm} onFinish={onFinish}>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={'Nhân sự thực hiện'}
                  name={'executorIds'}
                  className="mb-2 pb-2 border-b border-gray-200"
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
              <Col className="ml-auto">
                {taskFacade?.isEditQuickUpdate ? (
                  <Button onClick={taskForm.submit} icon={<SaveOutlined />} type={'primary'}>
                    Lưu lại
                  </Button>
                ) : (
                  <Button
                    hidden={taskFacade.data?.status === 'PendingApproval'}
                    type="primary"
                    icon={<EditOutlined />}
                    className="my-1.5"
                    ghost
                    onClick={() => taskFacade.set({ isEditQuickUpdate: true })}
                  >
                    Cập nhật thông tin
                  </Button>
                )}
              </Col>
              <Col span={24}>
                <Form.Item label="Thay đổi mức độ" name="priorityLevel" className="mb-4">
                  <Radio.Group
                    disabled={!taskFacade.isEditQuickUpdate}
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
              <Row className={'w-full'} gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item label="Ngày bắt đầu" name="startDateTime">
                    <DatePicker
                      disabled={!taskFacade.isEditQuickUpdate}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày bắt đầu"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Hạn chót" name="endDateTime">
                    <DatePicker
                      disabled={!taskFacade.isEditQuickUpdate}
                      format="DD/MM/YYYY"
                      placeholder="Chọn hạn chót"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Col className="ml-auto">
                <Link
                  to={`/${lang}${routerLinks('Task')}/${constructionFacade?.data?.id}/edit-view/${taskFacade?.data?.id}`}
                >
                  Chỉnh sửa chi tiết
                </Link>
              </Col>
            </Row>

            {/* <Card
                  // extra={
                  //   taskFacade?.isEditQuickUpdate ? (
                  //     <Button onClick={taskForm.submit} icon={<SaveOutlined />} type={'primary'}>
                  //       Lưu lại
                  //     </Button>
                  //   ) : (
                  //     <Button
                  //       hidden={taskFacade.data?.status === 'PendingApproval'}
                  //       type="primary"
                  //       icon={<EditOutlined />}
                  //       className="my-1.5"
                  //       ghost
                  //       onClick={() => taskFacade.set({ isEditQuickUpdate: true })}
                  //     >
                  //       Chỉnh sửa
                  //     </Button>
                  //   )
                  // }
                  >
                  </Card> */}
          </Form>
        </Spin>
      </Modal>
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
    </ConfigProvider>
  );
};
