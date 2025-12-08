import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Table,
  Select,
  DatePicker,
  Input,
  Badge,
  Flex,
  TableColumnsType,
  Tag,
  Tooltip,
  Typography,
  Avatar,
  FormInstance,
  Spin,
} from 'antd';
import { ExclamationCircleFilled, FlagOutlined, SearchOutlined } from '@ant-design/icons';
import { QueryParams } from '@models';
import { useNavigate } from 'react-router';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TaskPersonalFacade,
  GlobalFacade,
  ConstructionFacade,
  TaskFacade,
  PriorityPersonalLevelMap,
  TaskPersonalModel,
  TaskStatusMap,
  PriorityLevelMap,
  TaskModel,
} from '@store';
import { formatDayjsDate, lang, routerLinks } from '@utils';
import dayjs from 'dayjs';
import { SearchWidget } from '@pages/shared-directory/search-widget';

// Interface cho selected item
interface SelectedItem {
  id: string;
  name: string;
  type: 'construction' | 'personal';
  priorityLevel?: string;
  status?: string;
  endDateTime?: string;
  construction?: {
    id: string;
    name: string;
  };
}

const WorkSelectionModal = ({
  open,
  setOpen,
  setTaskHasChoose,
}: {
  open: boolean;
  setOpen: Function;
  setTaskHasChoose: Function;
}) => {
  const [activeTab, setActiveTab] = useState('task_construction');

  // State riêng cho selected items của từng tab
  const [constructionSelectedItems, setConstructionSelectedItems] = useState<SelectedItem[]>([]);
  const [personalSelectedItems, setPersonalSelectedItems] = useState<SelectedItem[]>([]);

  const handleOk = () => {
    // Gộp cả 2 danh sách selected items khi xác nhận
    const allSelectedItems = [...constructionSelectedItems, ...personalSelectedItems];

    console.log('All selected items:', allSelectedItems);

    // Tạo mảng kết quả với đầy đủ thông tin
    const result = allSelectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      priorityLevel: item.priorityLevel,
      status: item.status,
      endDateTime: item.endDateTime,
      construction: item.construction,
    }));

    console.log('Formatted result:', result);

    setTaskHasChoose(result);

    // TODO: Xử lý dữ liệu selected items theo yêu cầu
    // Ví dụ: gửi lên server, lưu vào store, etc.

    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const formRef = useRef<FormInstance | undefined>(undefined);

  const taskPersonalFacade = TaskPersonalFacade();
  const globalFacade = GlobalFacade();
  const constructionFacade = ConstructionFacade();
  const taskFacade = TaskFacade();

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
    size: Number(searchParams.get('size') || -1),
  };

  const parsedFilter = JSON.parse(filter);

  // Row selection cho tab công việc dự án
  const rowSelection = {
    selectedRowKeys: constructionSelectedItems.map((item) => item.id),
    onChange: (selectedRowKeys: string[], selectedRows: TaskModel[]) => {
      const selectedItems: any = selectedRows.map((row) => ({
        id: row.id,
        name: row.name,
        type: 'Dự án',
        priorityLevel: row.priorityLevel,
        status: row.status,
        endDateTime: row.endDateTime,
        construction: row.construction,
      }));
      setConstructionSelectedItems(selectedItems);
    },
    checkStrictly: false,
    getCheckboxProps: (record: any) => ({
      title: record.name,
    }),
    columnWidth: 30,
  };

  // Row selection cho tab công việc cá nhân
  const rowPersonalSelection = {
    selectedRowKeys: personalSelectedItems.map((item) => item.id),
    onChange: (selectedRowKeys: string[], selectedRows: TaskPersonalModel[]) => {
      const selectedItems: any = selectedRows.map((row) => ({
        id: row.id,
        name: row.name,
        type: 'Cá nhân',
        priorityLevel: row.priorityLevel,
        status: row.status,
        endDateTime: row.endDateTime,
      }));
      setPersonalSelectedItems(selectedItems);
    },
    checkStrictly: false,
    getCheckboxProps: (record: any) => ({
      title: record.name,
    }),
    columnWidth: 30,
  };

  //   console.log('Construction selected items:', constructionSelectedItems);
  //   console.log('Personal selected items:', personalSelectedItems);

  // Reset selected items khi đóng modal
  useEffect(() => {
    if (!open) {
      setConstructionSelectedItems([]);
      setPersonalSelectedItems([]);
    }
  }, [open]);

  const columnsPersonal: TableColumnsType<TaskPersonalModel> = [
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
      title: 'Phân loại',
      width: 120,
      align: 'center',
      render: () => <Tag color="blue">Cá nhân</Tag>,
    },
  ];

  const columns: TableColumnsType<TaskModel> = [
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
      title: 'Phân loại',
      width: 120,
      align: 'center',
      render: () => <Tag color="green">Dự án</Tag>,
    },
  ];

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

  return (
    <>
      <Modal
        title="Chọn công việc"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Xác nhận ({constructionSelectedItems.length + personalSelectedItems.length})
          </Button>,
        ]}
      >
        <div className="flex gap-2 py-4">
          <Button
            onClick={() => {
              setActiveTab('task_construction');
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
            }}
            className={`px-4 py-2 rounded border-none ${
              activeTab === 'task_construction' ? 'bg-white text-[#1890FF] font-semibold' : 'text-gray-600'
            }`}
          >
            Công việc dự án ({constructionSelectedItems.length})
          </Button>
          <Button
            onClick={() => {
              setActiveTab('task_personal');
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
              activeTab === 'task_personal' ? 'bg-white text-[#1890FF] font-semibold' : 'text-gray-600'
            }`}
          >
            Công việc cá nhân ({personalSelectedItems.length})
          </Button>
        </div>

        {activeTab === 'task_construction' ? (
          <SearchWidget
            form={(form) => (formRef.current = form)}
            callback={onChangeSearch}
            placeholder={'Tìm kiếm theo mã, tên công việc'}
            defaultValue={parsedFilter?.fullTextSearch}
            tabActive="search"
          />
        ) : (
          <SearchWidget
            form={(form) => (formRef.current = form)}
            callback={onChangeSearchPersonal}
            placeholder={'Tìm kiếm theo mã, tên công việc'}
            defaultValue={parsedFilter?.fullTextSearch}
            tabActive="search"
          />
        )}

        <Spin spinning={activeTab === 'task_construction' ? taskFacade.isLoading : taskPersonalFacade.isLoading}>
          {activeTab === 'task_construction' ? (
            <Table
              rowSelection={rowSelection as any}
              rowKey={'id'}
              dataSource={taskFacade.pagination?.content.map((item, index) => ({
                ...item,
              }))}
              columns={columns as any}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          ) : (
            <Table
              rowSelection={rowPersonalSelection as any}
              rowKey={'id'}
              dataSource={taskPersonalFacade.pagination?.content.map((item, index) => ({
                ...item,
              }))}
              columns={columnsPersonal as any}
              pagination={false}
              size="small"
              scroll={{ y: 300 }}
            />
          )}
        </Spin>

        {/* Preview selected items (optional) */}
        {/* {(constructionSelectedItems.length > 0 || personalSelectedItems.length > 0) && (
          <div className="mt-4 p-3 border rounded">
            <Typography.Text strong>Đã chọn:</Typography.Text>
            <div className="mt-2 max-h-32 overflow-y-auto">
              {constructionSelectedItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <span>{item.name}</span>
                  <Tag color="green">Dự án</Tag>
                </div>
              ))}
              {personalSelectedItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <span>{item.name}</span>
                  <Tag color="blue">Cá nhân</Tag>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </Modal>
    </>
  );
};

export default WorkSelectionModal;
