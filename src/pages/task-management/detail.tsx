import {
  CodeTypeFacade,
  ConstructionFacade,
  DataType,
  EInvoiceItemModel,
  EStatusTaskManagement,
  ProjectFacade,
  TaskManagementFacade,
  TaskManagementModel,
  TaskManagementViewModel,
  TaskAssigneeViewModel,
  UserFacade,
  UserModal,
  TaskCommentViewModel, GlobalFacade,
} from '@store';
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  GetProp,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
  UploadFile,
  UploadProps,
  Image,
  Card,
  Timeline,
  Tag,
  Divider,
  Dropdown,
  Modal,
  Drawer,
  Empty,
  Avatar,
} from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PlusOutlined,
  UploadOutlined,
  MessageOutlined,
  SmallDashOutlined,
  SearchOutlined,
  PictureOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { getFileIcon, lang, routerLinks } from '@utils';
import { EStatusState, QueryParams, T_Attachment } from '@models';
import { Upload } from '@core/upload';
import dayjs from 'dayjs';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import ReactMarkdown from 'react-markdown';

export default function TaskEditPage() {
  const taskManagementFacade = TaskManagementFacade();
  const constructionFacade = ConstructionFacade();
  const userFacade = UserFacade();
  const codeTypeFacade = CodeTypeFacade();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [taskForm] = Form.useForm();
  const { id } = useParams();
  const globalFacade = GlobalFacade();
  const [assigneeForm] = Form.useForm();
  const [isEditAssignee, setIsEditAssignee] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  const {
    page,
    size,
    filter = '{}',
    sort = '',
  } = {
    ...Object.fromEntries(searchParams),
    page: Number(searchParams.get('page') || 1),
    size: Number(searchParams.get('size') || 20),
  };

  console.log(globalFacade.user);
  useEffect(() => {
    if (taskManagementFacade.isEdit) {
      setIsEditAssignee(true);
    } else {
      setIsEditAssignee(false);
    }
  }, [taskManagementFacade.isEdit]);

  useEffect(() => {
    if (id) {
      taskManagementFacade.getById({ id });
      taskManagementFacade.getPageHistory({
        page: 1,
        size: 10,
        sort: '+createdOnDate',
        filter: JSON.stringify({ taskManagementId: id }),
      });
      taskManagementFacade.getPageComment({
        page: 1,
        size: -1,
        sort: '-lastModifiedOnDate',
        filter: JSON.stringify({ taskManagementId: id }),
      });
      // Load danh sách người được phân công
      taskManagementFacade.getPageAssignee({
        page: 1,
        size: -1,
        filter: JSON.stringify({ taskManagementId: id }),
      });
    } else {
      taskManagementFacade.set({ taskHistories: undefined });
    }
    codeTypeFacade.getTaskTag({ size: -1 });
    codeTypeFacade.getTaskStatus({ size: -1 });
    globalFacade.profile()
    constructionFacade.get({ size: -1 });
    userFacade.get({ size: -1 });
    taskManagementFacade.get({
      page: 1,
      size: 10,
      filter: JSON.stringify({ parentId: id }),
    });
  }, [id]);

  // Cập nhật giá trị cho form khi có dữ liệu người được phân công
  useEffect(() => {
    if (taskManagementFacade.taskAssignees?.content) {
      const assigneeIds = taskManagementFacade.taskAssignees.content.map(
        (assignee: TaskAssigneeViewModel) => assignee.userId
      );
      assigneeForm.setFieldValue('assignees', assigneeIds);
    }
  }, [taskManagementFacade.taskAssignees]);

  useEffect(() => {
    switch (taskManagementFacade.status) {
      case EStatusState.postFulfilled:
        navigate(`/${lang}${routerLinks('TaskManagement')}`);
        break;
      case EStatusState.putFulfilled:
        navigate(`/${lang}${routerLinks('TaskManagement')}/${id}/detail`);
        break;
      case EStatusState.getByIdFulfilled:
        const formData = { ...taskManagementFacade.data };

        if (formData.startDate) {
          formData.startDate = dayjs(formData.startDate);
        }
        if (formData.dueDate) {
          formData.dueDate = dayjs(formData.dueDate);
        }
        for (const key in formData) {
          taskForm.setFieldValue(key, formData[key as keyof TaskManagementModel]);
        }

        // Set giá trị description cho SunEditor
        if (formData.description) {
          taskForm.setFieldValue('description', formData.description);
        }

        break;
      case EStatusState.getFulfilled:
        assigneeForm.setFieldValue('assignees', taskManagementFacade.taskAssignees?.content?.map((item: TaskAssigneeViewModel) => item.userId));
        break

    }
  }, [taskManagementFacade.status]);

  // // Thêm useEffect để lọc bình luận khi searchComment hoặc selectedUser thay đổi
  // useEffect(() => {
  //   if (id) {
  //     const filter: any = { taskManagementId: id };

  //     if (searchComment) {
  //       filter.content = searchComment;
  //     }

  //     if (selectedUser) {
  //       filter.createdByUserId = selectedUser;
  //     }

  //     taskManagementFacade.getPageComment({
  //       page: 1,
  //       size: -1,
  //       sort: '-lastModifiedOnDate',
  //       filter: JSON.stringify(filter),
  //     });
  //   }
  // }, [searchComment, selectedUser, id]);

  const handleCancelEdit = () => {
    taskManagementFacade.set({ isEdit: false });
    // Reset form values to original data
    const formData = { ...taskManagementFacade.data };
    // const formSubData =
    //   taskManagementFacade.data.subTasks?.map((item: TaskManagementViewModel) => ({
    //     ...item,
    //     startDate: item.startDate ? dayjs(item.startDate) : null,
    //     dueDate: item.dueDate ? dayjs(item.dueDate) : null,
    //   })) || [];
    // taskForm.setFieldValue('subTasks', formSubData);

    if (formData.startDate) {
      formData.startDate = dayjs(formData.startDate);
    }
    if (formData.dueDate) {
      formData.dueDate = dayjs(formData.dueDate);
    }
    for (const key in formData) {
      taskForm.setFieldValue(key, formData[key as keyof TaskManagementModel]);
    }

  };

  const onChangeDataTable = (query: QueryParams) => {
    const fillQuery: QueryParams = {
      page: query.page ?? Number(page),
      size: query.size ?? Number(size),
      filter: query.filter ?? filter ?? '',
      sort: query.sort ?? sort ?? '',
    };

    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }

    taskManagementFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
  };

  const onFinish = (value: TaskManagementModel) => {
    const startDate = taskForm.getFieldValue('startDate');
    const dueDate = taskForm.getFieldValue('dueDate');
    const type = taskForm.getFieldValue('type');
    const status = taskForm.getFieldValue('status');
    const description = taskForm.getFieldValue('description');

    if (id) {
      // Cập nhật công việc
      const formattedValue = {
        ...value,
        id: id,
        constructionId: taskForm.getFieldValue('constructionId'),
        type: type,
        status: status,
        description: description,
        startDate: startDate ? dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss') : undefined,
        dueDate: dueDate ? dayjs(dueDate).format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };
      taskManagementFacade.put(formattedValue).then(() => {
        // Tắt chế độ chỉnh sửa
        taskManagementFacade.set({ isEdit: false });

        // Load lại dữ liệu
        taskManagementFacade.getById({ id });
        taskManagementFacade.getPageHistory({
          page: 1,
          size: -1,
          sort: '+createdOnDate',
          filter: JSON.stringify({ taskManagementId: id }),
        });
        taskManagementFacade.getPageComment({
          page: 1,
          size: -1,
          sort: '-lastModifiedOnDate',
          filter: JSON.stringify({ taskManagementId: id }),
        });
        taskManagementFacade.getPageAssignee({
          page: 1,
          size: -1,
          filter: JSON.stringify({ taskManagementId: id }),
        });
      });
    } else {
      // Tạo công việc mới
      const formattedValue = {
        ...value,
        constructionId: taskForm.getFieldValue('constructionId'),
        type: type,
        status: status,
        description: description,
        startDate: startDate ? dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss') : undefined,
        dueDate: dueDate ? dayjs(dueDate).format('YYYY-MM-DDTHH:mm:ss') : undefined,
      };

      taskManagementFacade.post(formattedValue).then((response: any) => {
        const newTaskId = response.payload?.data?.id;
        // Load lại lịch sử xử lý sau khi tạo mới
        taskManagementFacade.getPageHistory({
          page: 1,
          size: -1,
          sort: '+createdOnDate',
          filter: JSON.stringify({ taskManagementId: newTaskId }),
        });
        navigate(`/${lang}${routerLinks('TaskManagement')}/${newTaskId}/detail`);
      });
    }
  };

  const isDisabled = Boolean(id && !taskManagementFacade.isEdit);

  const handlePostComment = () => {
    if (id) {
      taskManagementFacade.postComment({
        taskManagementId: id,
        content: taskForm.getFieldValue('comment')
      }).then(() => {
        // Reset editor và load lại danh sách bình luận
        taskForm.setFieldValue('comment', '');
        setCommentContent('');
        // Reset SunEditor bằng cách set lại nội dung rỗng
        const editor = document.querySelector('.sun-editor-editable');
        if (editor) {
          editor.innerHTML = '';
        }
        taskManagementFacade.getPageComment({
          page: 1,
          size: -1,
          sort: '-lastModifiedOnDate',
          filter: JSON.stringify({ taskManagementId: id }),
        });
      });
    }
  };

  return (
    <Spin spinning={taskManagementFacade.isFormLoading}>
      <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
        <Button
          type={'link'}
          icon={<LeftOutlined />}
          className={'text-gray-600 font-medium'}
          onClick={() => {
            navigate(`/${lang}${routerLinks('TaskManagement')}`);
          }}
        >
          Quay lại danh sách công việc
        </Button>
        <Space size={'small'} className={'pr-6'}>
          {id && !taskManagementFacade.isEdit ? (
            <Button type="primary" icon={<EditOutlined />} onClick={() => taskManagementFacade.set({ isEdit: true })}>
              Chỉnh sửa
            </Button>
          ) : id && taskManagementFacade.isEdit ? (
            <>
              <Button onClick={handleCancelEdit}>Hủy</Button>
              <Button type="primary" onClick={() => taskForm.submit()}>
                Lưu lại
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={() => taskForm.submit()}>
              Lưu lại
            </Button>
          )}
        </Space>
      </div>
      <div className="p-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Form
              form={taskForm}
              onFinish={onFinish}
              layout={'vertical'}
              disabled={isDisabled}
            >
              <Card>
                <Form.Item className="mb-4" name="title" rules={[{ required: true }]}>
                  <Typography.Title level={5}>
                    Tiêu đề <span style={{ color: '#ff4d4f' }}>*</span>
                  </Typography.Title>
                  <Input placeholder="Nhập tiêu đề" value={taskForm.getFieldValue('title')} className="h-10" disabled={isDisabled} />
                </Form.Item>

                <Form.Item className="mb-4" name={'description'}>
                  <Typography.Title level={5}>Mô tả</Typography.Title>
                  {isDisabled ? (
                    <div className="markdown-content">
                      <ReactMarkdown>{taskForm.getFieldValue('description') || ''}</ReactMarkdown>
                    </div>
                  ) : (
                    <SunEditor
                      setContents={taskForm.getFieldValue('description') || ''}
                      setOptions={{
                        buttonList: [
                          ['undo', 'redo'],
                          ['bold', 'underline', 'italic', 'strike'],
                          ['list', 'indent', 'outdent'],
                          ['link', 'image'],
                          ['preview']
                        ],
                        height: '150px',
                        width: '100%',
                        placeholder: 'Viết mô tả công việc ở đây...',
                        defaultStyle: 'font-family: monospace;',
                        resizingBar: false,
                        showPathLabel: false,
                        charCounter: true,
                        charCounterLabel: 'Ký tự:',
                        maxCharCount: 1000,
                        mode: 'classic'
                      }}
                      onChange={(content) => {
                        // Chuyển đổi HTML thành text thuần túy
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = content;
                        const plainText = tempDiv.textContent || tempDiv.innerText;
                        taskForm.setFieldValue('description', plainText);
                      }}
                    />
                  )}
                </Form.Item>

                <style>{`
                  .markdown-content {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                    line-height: 1.5;
                    color: #24292e;
                  }
                  .markdown-content pre {
                    background-color: #f6f8fa;
                    padding: 16px;
                    border-radius: 3px;
                    overflow: auto;
                  }
                  .markdown-content code {
                    font-family: monospace;
                    background-color: #f6f8fa;
                    padding: 2px 4px;
                    border-radius: 3px;
                  }
                  .markdown-content blockquote {
                    border-left: 4px solid #dfe2e5;
                    padding-left: 16px;
                    color: #6a737d;
                    margin: 0;
                  }
                  .markdown-content h1 {
                    font-size: 2em;
                    margin-bottom: 0.5em;
                  }
                  .markdown-content h2 {
                    font-size: 1.5em;
                    margin-bottom: 0.5em;
                  }
                  .markdown-content h3 {
                    font-size: 1.25em;
                    margin-bottom: 0.5em;
                  }
                  .markdown-content ul {
                    padding-left: 16px;
                    list-style-type: disc;
                  }
                  .markdown-content ol {
                    padding-left: 16px;
                    list-style-type: decimal;
                  }
                  .markdown-content li {
                    margin-bottom: 0.5em;
                  }
                  .markdown-content p {
                    margin-bottom: 1em;
                  }
                  .markdown-content a {
                    color: #0366d6;
                    text-decoration: none;
                  }
                  .markdown-content a:hover {
                    text-decoration: underline;
                  }
                  .markdown-content img {
                    max-width: 100%;
                  }
                `}</style>

                <Form.Item className="mb-4" name={'attachments'}>
                  <Typography.Title level={5}>File đính kèm</Typography.Title>
                  <Upload
                    action={`task`}
                    text="Thêm file đính kèm"
                    accept="*"
                    isShowImage={true}
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
                        {(!id || taskManagementFacade.isEdit) && (
                          <Popconfirm
                            title="Bạn có chắc muốn xóa file này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleDeleteFile?.(file!)}
                          >
                            <DeleteOutlined className="text-lg text-gray-400 hover:text-red-500" />
                          </Popconfirm>
                        )}
                      </Flex>
                    )}
                  />
                </Form.Item>

                {/* <div className="mt-4">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Button>👍 0</Button>
                      <Button>👍 0</Button>
                    </Col>
                  </Row>
                </div> */}

                <Divider />

                {/* <div className="mt-4">
                  <Typography.Title level={5}>Child items</Typography.Title>
                  <Empty description="No child items are currently assigned. Use child items to break down work into smaller parts." />
                </div>            */}

                {/* <Divider /> */}

                <div className="mt-2">
                  <Typography.Title level={5}>Lịch sử hoạt động</Typography.Title>
                  <div style={{ maxHeight: '250px', overflowY: 'auto'}}>
                    <Timeline
                      className='pt-2'
                      items={taskManagementFacade.taskHistories?.content?.map(
                        (history: { id: string; action: string; createdOnDate: string }) => ({
                          key: history.id,
                          children: (
                            <>
                              <div>{history.action}</div>
                              <div style={{ fontSize: '14px', color: '#8C8C8C', paddingTop: '4px' }}>
                                {dayjs(history.createdOnDate).format('HH:mm DD/MM/YYYY')}
                              </div>
                            </>
                          ),
                        }),
                      )}
                    />
                  </div>
                </div>

                <Divider />

                <Form.Item className="mb-4" name={'comment'} >
                  <Typography.Title level={5}>Bình luận</Typography.Title>
                  <div style={{ minHeight: '200px', height: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                    {Array.isArray(taskManagementFacade.taskComments?.content) && taskManagementFacade.taskComments?.content?.length > 0 ? (
                      taskManagementFacade.taskComments?.content?.map((comment: TaskCommentViewModel) => (
                        <div key={comment.id} className="mb-4 mt-2">
                          <div className="flex items-start gap-2">
                            <Avatar style={{ backgroundColor: '#1677ff' }}>
                              {comment.userName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <Typography.Text strong>{comment.userName}</Typography.Text>
                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                  {dayjs(comment.createdOnDate).format('HH:mm DD/MM/YYYY')}
                                </Typography.Text>
                                <Dropdown
                                  menu={{
                                    items: globalFacade.user?.userId === comment.createdByUserId
                                      ? [
                                        {
                                          key: 'edit',
                                          label: (
                                            <div className={'flex gap-2'}>
                                              <EditOutlined />
                                              Chỉnh sửa
                                            </div>
                                          ),
                                        },
                                        {
                                          key: 'delete',
                                          label: (
                                            <div className={'flex gap-2'}>
                                              <DeleteOutlined />
                                              Xoá
                                            </div>
                                          ),
                                        },
                                      ]
                                      : []
                                    ,
                                    onClick: (e: any) => {
                                      // handleClickActionInModalComment(e, item);
                                    },
                                  }}
                                >
                                  <div className={'h-2 mr-4'}>
                                    <SmallDashOutlined />
                                  </div>
                                </Dropdown>
                              </div>
                              <div className="mt-1" dangerouslySetInnerHTML={{ __html: comment.content || '' }} />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty
                        image={<MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                        description={
                          <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                            Chưa có bình luận nào
                          </Typography.Text>
                        }
                        style={{
                          margin: '28px 0',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    )}
                  </div>
                  <Divider />
                  <SunEditor
                    setOptions={{
                      buttonList: [
                        ['undo', 'redo'],
                        ['bold', 'underline', 'italic', 'strike'],
                        ['list'],
                        ['link']
                      ],
                      height: '150px',
                      width: '100%',
                      placeholder: 'Viết bình luận ở đây...',
                    }}
                    onChange={(content) => {
                      taskForm.setFieldValue('comment', content);
                      // Kiểm tra nội dung có trống không bằng cách tạo một div tạm thời
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = content;
                      const plainText = tempDiv.textContent || tempDiv.innerText;
                      setCommentContent(plainText.trim());
                    }}
                  />
                  <Button
                    className='mt-4'
                    type="primary"
                    onClick={handlePostComment}
                    disabled={!commentContent}
                  >
                    Gửi bình luận
                  </Button>
                </Form.Item>

              </Card>
            </Form>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: '64px' }}>
              <Card>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Text strong>Phân công</Typography.Text>
                    {!isEditAssignee ? (
                      <Button
                        type="link"
                        onClick={() => setIsEditAssignee(true)}
                      >
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Space>
                        <Typography.Text
                          style={{ color: '#ff4d4f', cursor: 'pointer' }}
                          onClick={() => {
                            setIsEditAssignee(false);
                            // Reset lại giá trị ban đầu
                            assigneeForm.setFieldValue('assignees', taskManagementFacade.taskAssignees?.content?.map((item: TaskAssigneeViewModel) => item.userId));
                          }}
                        >
                          Hủy
                        </Typography.Text>
                        <Typography.Text
                          style={{ color: '#1677ff', cursor: 'pointer' }}
                          onClick={() => {
                            const currentAssignees = assigneeForm.getFieldValue('assignees') || [];
                            const existingAssignees = taskManagementFacade.taskAssignees?.content || [];

                            // Tìm người mới được thêm vào
                            const newAssignees = currentAssignees.filter(
                              (userId: string) => !existingAssignees.some(
                                (assignee: TaskAssigneeViewModel) => assignee.userId === userId
                              )
                            );

                            // Tìm người bị xóa
                            const removedAssignees = existingAssignees.filter(
                              (assignee: TaskAssigneeViewModel) => !currentAssignees.includes(assignee.userId)
                            );

                            // Thêm người mới
                            newAssignees.forEach((userId: string) => {
                              taskManagementFacade.postAssignee({
                                taskManagementId: id,
                                userId: userId
                              }).then(() => {
                                // Load lại danh sách người tham gia sau khi thêm
                                taskManagementFacade.getPageAssignee({
                                  page: 1,
                                  size: -1,
                                  filter: JSON.stringify({ taskManagementId: id }),
                                })
                              });
                            });

                            // Xóa người bị gỡ
                            removedAssignees.forEach((assignee: TaskAssigneeViewModel) => {
                              if (assignee.id) {
                                taskManagementFacade.deleteAssignee(assignee.id).then(() => {
                                  // Load lại danh sách người tham gia sau khi xóa
                                  taskManagementFacade.getPageAssignee({
                                    page: 1,
                                    size: -1,
                                    filter: JSON.stringify({ taskManagementId: id }),
                                  }).then(() => {
                                    console.log('then');
                                    // Reset form với dữ liệu mới
                                    // assigneeForm.setFieldValue('assignees', taskManagementFacade.taskAssignees?.content?.map((item: TaskAssigneeViewModel) => item.userId));
                                  });
                                });
                              }
                            });

                            // Tắt chế độ chỉnh sửa sau khi hoàn thành tất cả các thao tác
                            setIsEditAssignee(false);
                          }}
                        >
                          Lưu
                        </Typography.Text>
                      </Space>
                    )}
                  </div>
                  <Form
                    form={assigneeForm}
                    layout="vertical"
                    fields={[
                      {
                        name: 'assignees', value: taskManagementFacade.taskAssignees?.content?.map((item: TaskAssigneeViewModel) => item.userId)
                      }
                    ]}
                  >
                    <Form.Item name="assignees">
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Chọn người phụ trách"
                        disabled={!isEditAssignee}
                        // value={assigneeForm.getFieldValue('assignees')}
                        // onChange={(value) => {
                        //   assigneeForm.setFieldValue('assignees', value);
                        // }}
                        options={userFacade.pagination?.content.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                      />
                    </Form.Item>
                  </Form>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Text strong>Dự án</Typography.Text>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn dự án"
                    disabled={!taskManagementFacade.isEdit}
                    value={taskForm.getFieldValue('constructionId')}
                    onChange={(value) => taskForm.setFieldValue('constructionId', value)}
                    options={constructionFacade.pagination?.content.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Text strong>Nhãn</Typography.Text>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select labels"
                    disabled={!taskManagementFacade.isEdit}
                    value={taskForm.getFieldValue('type')}
                    onChange={(value) => taskForm.setFieldValue('type', value)}
                    options={codeTypeFacade.taskTags?.content?.map((item) => ({
                      value: item.code,
                      label: item.title,
                    }))}
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Text strong>Trạng thái</Typography.Text>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn trạng thái"
                    disabled={!taskManagementFacade.isEdit}
                    value={taskForm.getFieldValue('status') || undefined}
                    onChange={(value) => {
                      taskForm.setFieldValue('status', value);
                      taskForm.validateFields(['status']);
                    }}
                    options={codeTypeFacade.taskStatus?.content?.map((item) => ({
                      value: item.code,
                      label: item.title,
                    }))}
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Text strong>
                      Thời gian thực hiện <span style={{ color: '#ff4d4f' }}>*</span>
                    </Typography.Text>
                  </div>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Typography.Text type="secondary">Bắt đầu:</Typography.Text>
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Start date"
                        disabled={!taskManagementFacade.isEdit}
                        value={taskForm.getFieldValue('startDate')}
                        onChange={(value) => taskForm.setFieldValue('startDate', value)}
                      />
                    </Col>
                    <Col span={12}>
                      <Typography.Text type="secondary">Kết thúc:</Typography.Text>
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Due date"
                        disabled={!taskManagementFacade.isEdit}
                        value={taskForm.getFieldValue('dueDate')}
                        onChange={(value) => taskForm.setFieldValue('dueDate', value)}
                      />
                    </Col>
                  </Row>
                </div>

                {/* <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Text strong>Parent</Typography.Text>
                    <Button type="link" onClick={() => taskManagementFacade.set({ isEdit: true })}>Edit</Button>
                  </div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select parent"
                    disabled={!taskManagementFacade.isEdit}
                    value={taskForm.getFieldValue('parentId')}
                    onChange={(value) => taskForm.setFieldValue('parentId', value)}
                  />
                </div> */}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Text strong>Người tham gia</Typography.Text>
                  </div>
                  <div className="flex gap-1">
                    {taskManagementFacade.taskAssignees?.content?.length > 0 ? (
                      <Avatar.Group>
                        {taskManagementFacade.taskAssignees?.content?.map((assignee: TaskAssigneeViewModel) => (
                          <Tooltip key={assignee.id} title={assignee.userName}>
                            <Avatar style={{ backgroundColor: '#1677ff' }}>
                              {assignee.userName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Avatar.Group>
                    ) : (
                      <Typography.Text type="secondary">Chưa có người tham gia</Typography.Text>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
