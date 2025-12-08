import {
  formatAmount,
  formatDayjsDate,
  lang,
  routerLinks,
  scrollLeftWhenChanging,
  scrollTopWhenChanging,
  uuidv4,
} from '@utils';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Dropdown,
  Flex,
  Form,
  FormInstance,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Pagination,
  Typography,
  Badge,
  Tabs,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CaretDownOutlined,
  CloseOutlined,
  ExportOutlined,
  FilterFilled,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Table } from 'antd/lib';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { EStatusState, QueryParams } from '@models';
import type { MenuProps, TabsProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import {
  TaskAssigneeModel,
  TaskAssigneeViewModel,
  TaskManagementFacade,
  TaskManagementModel,
  TaskManagementViewModel,
} from '../../store/task-management';
import { CodeTypeFacade, CodeTypeModel, ConstructionFacade } from '@store';
import { SubHeader } from '@layouts/admin';

interface DataType extends TaskManagementModel {
  lineNumber: number;
  key: string;
}

export default function TaskList() {
  const taskManagementFacade = TaskManagementFacade();
  const codeTypeFacade = CodeTypeFacade();
  const constructionFacade = ConstructionFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalApi, contextModalApi] = Modal.useModal();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const navigate = useNavigate();
  const [formFilter] = Form.useForm();
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref1 = useRef(null);

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

  useEffect(() => {
    constructionFacade.get({ size: -1 });
    codeTypeFacade.getTaskTag({ size: -1 });
    codeTypeFacade.getTaskStatus({ size: -1 });
    taskManagementFacade.getTaskSummary({ size: -1 });
  }, []);

  useEffect(() => {
    onChangeDataTable({
      page: Number(page),
      size: Number(size),
      filter,
      sort,
    });

    if (filter) {
      const parsedFilter = JSON.parse(filter);
      if (parsedFilter.createdOnDateRange) {
        parsedFilter.createdOnDateRange = [
          dayjs(parsedFilter.createdOnDateRange[0]),
          dayjs(parsedFilter.createdOnDateRange[1]),
        ];
      }
      formFilter.setFieldsValue(parsedFilter);
    }
  }, []);

  useEffect(() => {
    switch (taskManagementFacade.status) {
      case EStatusState.deleteFulfilled:
        onChangeDataTable({
          page: Number(page),
          size: Number(size),
          filter,
          sort,
        });
        break;
    }
  }, [taskManagementFacade.status]);

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

  const onChangeSearch = (value: string) => {
    const currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    if (value) {
      currentFilter.FullTextSearch = value;
    } else {
      delete currentFilter.FullTextSearch;
    }
    onChangeDataTable({
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    });
  };

  const onChangeConstruction = (value: string) => {
    const currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    if (value) {
      currentFilter.constructionId = value;
    } else {
      delete currentFilter.constructionId;
    }
    onChangeDataTable({
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    });
  };

  useEffect(() => {
    if (codeTypeFacade.taskStatus) {
      taskManagementFacade.set({
        newTabItems: [
          {
            key: 'all',
            label: 'Tất cả',
            closable: false,
            count: taskManagementFacade.totalTasks?.totalTask,
            color: '#1677FF',
          },
          ...(codeTypeFacade.taskStatus?.content?.map((item: CodeTypeModel) => ({
            key: item?.title,
            label: item?.title,
            closable: false,
            count: generateCount(item?.title),
            color: item?.description,
          })) || []),
        ],
      });
    }
  }, [codeTypeFacade.taskStatus, taskManagementFacade.totalTasks]);

  const dataSource: DataType[] =
    taskManagementFacade.pagination?.content.map(
      (item: TaskManagementViewModel, index: number): DataType => ({
        lineNumber: (Number(searchParams.get('page') ?? 0) - 1) * Number(searchParams.get('size') ?? 0) + index + 1,
        key: uuidv4(),
        id: item.id,
        title: item.title,
        type: item.type,
        description: item.description,
        createdByUserName: item.createdByUserName,
        createdByUserId: item.createdByUserId,
        lastModifiedOnDate: item.lastModifiedOnDate,
        lastModifiedByUserName: item.lastModifiedByUserName,
        status: item.status,
        constructionId: item.constructionId,
        dueDate: item.dueDate,
        startDate: item.startDate,
        assignees: item.assignees,
      }),
    ) ?? [];

  const generateCount = (title: string | any) => {
    switch (title) {
      case 'Đang thực hiện':
        return taskManagementFacade.totalTasks?.totalInprogressTask;
      case 'Đã hoàn thành':
        return taskManagementFacade.totalTasks?.totalFinishedTask;
      case 'Bản nháp':
        return taskManagementFacade.totalTasks?.totalDraftTask;
      case 'Đã tạm dừng':
        return taskManagementFacade.totalTasks?.totalPausedTask;
    }
  };

  const onChangeTabs = (key: string) => {
    taskManagementFacade.set({
      activeKey: key,
    });

    const currentFilter = JSON.parse(searchParams.get('filter') || '{}');

    switch (key) {
      case 'all':
        delete currentFilter.status;
        taskManagementFacade.set({ activeKey: 'all', searchValue: undefined });
        break;
      case 'Đang thực hiện':
        currentFilter.status = 'INPROGRESS';
        break;
      case 'Đã hoàn thành':
        currentFilter.status = 'FINISHED';
        break;
      case 'Bản nháp':
        currentFilter.status = 'DRAFT';
        break;
      case 'Đã tạm dừng':
        currentFilter.status = 'PAUSED';
        break;
    }

    onChangeDataTable({
      page: 1,
      size: Number(size),
      filter: JSON.stringify(currentFilter),
    });

    const query: QueryParams = {
      page: page ? Number(page) : 1,
      size: size ? Number(size) : 20,
      filter: JSON.stringify({
        ...currentFilter,
        code: undefined,
        name: undefined,
      }),
    };
    onChangeDataTable(query);
  };

  // const getStatusTag = (status: string) => {
  //   const statusItem = codeTypeFacade.taskStatus?.content.find((item: CodeTypeModel) => item.code === status);
  //   return <Tag  color={statusItem?.description}>{statusItem?.title}</Tag>;
  // };

  const getTypeTag = (type: string) => {
    const typeItem = codeTypeFacade.taskTags?.content.find((item: CodeTypeModel) => item.code === type);
    return (
      <Tag color={typeItem?.description} style={{ marginTop: '4px', padding: '2px 2px' }}>
        {typeItem?.title}
      </Tag>
    );
  };

  const tool = (
    <Space size={'middle'} className={'mx-4'}>
      <Button
        ref={ref2}
        type={'primary'}
        icon={<PlusOutlined />}
        onClick={() => {
          taskManagementFacade.set({
            data: undefined,
            isEdit: true
          });
          navigate(`/${lang}${routerLinks('TaskManagement')}/create`);
        }}
      >
        Thêm mới công việc
      </Button>
    </Space>
  );

  const items: TabsProps['items'] = taskManagementFacade.newTabItems?.map((item: any) => ({
    key: item?.key,
    label: (
      <div className="flex gap-2">
        <p>{item?.label}</p>
        <Badge className="site-badge-count-109" showZero count={item?.count ?? 0} color={item?.color} />
      </div>
    ),
    children: (
      <>
        <div className={'py-4 px-3 flex gap-5 justify-between'}>
          <div className={'flex-1'} ref={ref3}>
            <SearchWidget
              placeholder={'Tìm kiếm theo tên công việc'}
              form={(form) => (formRef.current = form)}
              callback={onChangeSearch}
            />
          </div>
          <Space className={''}>
            <Select
              placeholder="Lọc theo dự án"
              style={{ width: 200 }}
              allowClear
              onChange={onChangeConstruction}
              options={constructionFacade.pagination?.content.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
            <Button
              ref={ref1}
              icon={<ReloadOutlined />}
              loading={taskManagementFacade.isLoading}
              onClick={() =>
                onChangeDataTable({
                  page: Number(page),
                  size: Number(size),
                  filter,
                  sort,
                })
              }
            >
              Tải lại
            </Button>
          </Space>
        </div>
        <Spin spinning={taskManagementFacade.isLoading}>
          <Table
            size="small"
            bordered={false}
            scroll={{ x: 1000, y: 400 }}
            className="mx-3"
            style={{ borderLeft: 'none', borderRight: 'none', minHeight: '400px' }}
            columns={[
              {
                title: 'STT',
                dataIndex: 'lineNumber',
                width: 80,
                fixed: 'left',
                align: 'center',
                render: (text) => (
                  <Typography.Text style={{ fontSize: '14px', textAlign: 'center', display: 'block' }}>
                    {text}
                  </Typography.Text>
                ),
              },
              {
                title: 'Tiêu đề',
                dataIndex: 'title',
                width: 200,
                fixed: 'left',
                render: (text, record) => (
                  <Typography.Text
                    style={{
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#1677FF',
                      transition: 'text-decoration 0.3s',
                    }}
                    className="hover:underline"
                    onClick={() => {
                      taskManagementFacade.set({ isEdit: false });
                      navigate(`/${lang}${routerLinks('TaskManagement')}/${record.id as string}/detail`);
                    }}
                  >
                    {text}
                  </Typography.Text>
                ),
              },
              {
                title: 'Dự án',
                dataIndex: 'constructionId',
                width: 150,
                render: (text, record) => (
                  <Typography.Text style={{ fontSize: '14px' }}>
                    {constructionFacade.pagination?.content?.find((item: any) => item.id === text)?.name}
                  </Typography.Text>
                ),
              },
              {
                title: 'Thời gian bắt đầu',
                dataIndex: 'startDate',
                width: 150,
                align: 'center',
                render: (text) => (
                  <Typography.Text style={{ fontSize: '14px', textAlign: 'center', display: 'block' }}>
                    {formatDayjsDate(text)}
                  </Typography.Text>
                ),
              },
              {
                title: 'Thời gian kết thúc',
                dataIndex: 'dueDate',
                width: 150,
                align: 'center',
                render: (text) => (
                  <Typography.Text style={{ fontSize: '14px', textAlign: 'center', display: 'block' }}>
                    {formatDayjsDate(text)}
                  </Typography.Text>
                ),
              },
              {
                title: 'Tag',
                dataIndex: 'type',
                width: 150,
                render: (text) => text && getTypeTag(text),
              },
              // {
              //   title: 'Người tạo',
              //   dataIndex: 'createdByUserName',
              //   width: 150,
              //   render: (text) => (
              //     <Typography.Text style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{text}</Typography.Text>
              //   ),
              // },
              // {
              //   title: 'Đã cập nhật vào',
              //   dataIndex: 'lastModifiedOnDate',
              //   width: 150,
              //   align: 'center',
              //   render: (text) => (
              //     <Typography.Text style={{ fontSize: '14px', textAlign: 'center', display: 'block' }}>
              //       {formatDayjsDate(text)}
              //     </Typography.Text>
              //   ),
              // },
              {
                title: 'Thao tác',
                key: 'action',
                width: 150,
                fixed: 'right',
                align: 'center',
                render: (_, record) => (
                  <Space style={{ justifyContent: 'center', width: '100%' }}>
                    <Typography.Text
                      style={{
                        fontSize: '14px',
                        cursor: 'pointer',
                        color: '#1677FF',
                        transition: 'text-decoration 0.3s',
                      }}
                      className="hover:underline"
                      onClick={() => {
                        taskManagementFacade.set({ isEdit: false });
                        navigate(`/${lang}${routerLinks('TaskManagement')}/${record.id as string}/detail`);
                      }}
                    >
                      Xem chi tiết
                    </Typography.Text>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'update',
                            label: <Typography.Text style={{ color: '#1677FF' }}>Cập nhật</Typography.Text>,
                            onClick: () => {
                              taskManagementFacade.set({ isEdit: true });
                              navigate(`/${lang}${routerLinks('TaskManagement')}/${record.id as string}/detail`);
                            },
                          },
                          {
                            key: 'delete',
                            label: <Typography.Text style={{ color: '#ff4d4f' }}>Xóa</Typography.Text>,
                            onClick: () => {
                              Modal.confirm({
                                title: 'Xác nhận xóa',
                                content: 'Bạn có chắc chắn muốn xóa công việc này?',
                                okText: 'Xóa',
                                okButtonProps: { danger: true },
                                cancelText: 'Hủy',
                                onOk: () => {
                                  taskManagementFacade.delete(record.id as string);
                                },
                              });
                            },
                          },
                        ],
                      }}
                      trigger={['click']}
                    >
                      <Button type="text" icon={<CaretDownOutlined style={{ color: '#1677FF' }} />} />
                    </Dropdown>
                  </Space>
                ),
              },
            ]}
            dataSource={dataSource}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              total: taskManagementFacade?.pagination?.totalElements,
              pageSize: taskManagementFacade?.pagination?.size,
              current: Number(page),
              onChange: (page, pageSize) => {
                onChangeDataTable({
                  page,
                  size: pageSize,
                  filter,
                  sort,
                });
                scrollLeftWhenChanging('.ant-table-body');
                scrollTopWhenChanging('.ant-table-body');
              },
            }}
          />
        </Spin>
      </>
    ),
    closable: item?.closable,
  }));

  return (
    <>
      <Spin spinning={taskManagementFacade.isLoading}>
        {contextModalApi}
        <SubHeader tool={tool} />
        <div className={'m-3 bg-white'}>
          <Tabs
            className={'px-4'}
            defaultActiveKey={'Đang thực hiện'}
            activeKey={taskManagementFacade.activeKey}
            onChange={onChangeTabs}
            items={items}
          />
        </div>
      </Spin>
    </>
  );
}
