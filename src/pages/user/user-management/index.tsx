import {
  CaretDownOutlined,
  CloseOutlined,
  FilterFilled,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import DrawerCauHinhNhanSu from '@pages/cau-hinh-nhan-su/create';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  CauHinhNhanSuFacade,
  ChucVuFacade,
  EStatusNguoiDung,
  PhongBanFacade,
  QuanLyNguoiDung,
  QuanLyNguoiDungFacade,
  RightMapRoleFacade,
  RolesFacade,
  RolesModel,
  UserModal,
} from '@store';
import { formatDayjsDate, formatPhoneNumber, uuidv4 } from '@utils';
import {
  Avatar,
  Button,
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
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import { ColumnsType } from 'antd/es/table';
import { SelectProps } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { UserDrawer } from './user.drawer';

interface DataType extends QuanLyNguoiDung {
  key: string;
}

type TagRender = SelectProps['tagRender'];

const Page: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const userFacade = QuanLyNguoiDungFacade();
  const departmentFacade = PhongBanFacade();
  const positionFacade = ChucVuFacade();
  const rolesFacade = RolesFacade();
  const employeeConfigurationFacade = CauHinhNhanSuFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const [formFilter] = Form.useForm();
  const [modalApi, contextModalApi] = Modal.useModal();
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
    rightMapRoleFacade.getRightMapByListCode('USER');

    onChangeDataTable({});
    rolesFacade.get({ size: -1 });
    if (id) {
      userFacade.set({ isVisible: true, isDetail: true });
      setSearchParams(
        (prev) => {
          prev.set('id', searchParams.get('id') ?? '');
          return prev;
        },
        { replace: true },
      );
    }

    if (!parsedFilter) return;

    // Format ngày nếu có
    const formattedFilter = {
      ...parsedFilter,
      // createdOnDate: parsedFilter.createdOnDate ? dayjs(parsedFilter.createdOnDate) : undefined,
      dateRange: parsedFilter.dateRange ? parsedFilter.dateRange.map((item: string) => dayjs(item)) : undefined,
    };

    // Set giá trị cho form
    formFilter.setFieldsValue(formattedFilter);
  }, []);

  useEffect(() => {
    switch (userFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
      case EStatusState.deleteFulfilled:
      case EStatusNguoiDung.lockFulfilled:
      case EStatusNguoiDung.unlockFulfilled:
        userFacade.get({ filter: filter ?? '{}' });
        userFacade.set({ isVisible: false });
        break;
    }
  }, [userFacade.status]);

  const dataSource: DataType[] =
    userFacade.pagination?.content.map((items, index) => ({
      ...items,
      lineNumber: (Number(searchParams.get('page') ?? 0) - 1) * Number(searchParams.get('size') ?? 0) + index + 1,
      id: items.id,
      key: uuidv4(),
      code: items.ma,
      name: items.name,
      phoneNumber: items.phoneNumber,
      email: items.email,
      isActive: items.isActive,
      listRole: items.listRole,
      isLockedOut: items.isLockedOut,
      avatarUrl: items.avatarUrl,
      createdOnDate: items.createdOnDate,
      position: items.chucVu?.tenChucVu,
    })) ?? [];

  const handleEdit = (data: QuanLyNguoiDung) => {
    userFacade.set({
      isVisible: true,
      data: data,
      isEdit: true,
      isDetail: false,
      isPassword: false,
    });

    setSearchParams(
      (prev) => {
        if (!prev.has('id')) prev.append('id', data.id ?? '');
        else prev.set('id', data.id ?? '');
        return prev;
      },
      { replace: true },
    );
  };
  const handleViewDetail = (data: QuanLyNguoiDung) => {
    userFacade.set({
      isVisible: true,
      data: data,
      isEdit: false,
      isDetail: true,
      isPassword: false,
    });
    setSearchParams(
      (prev) => {
        if (!prev.has('id')) prev.append('id', data.id ?? '');
        else prev.set('id', data.id ?? '');
        return prev;
      },
      { replace: true },
    );
  };
  const handleChangePassword = (data: QuanLyNguoiDung) => {
    userFacade.set({
      isVisible: true,
      data: data,
      isEdit: false,
      isDetail: false,
      isPassword: true,
    });
    setSearchParams(
      (prev) => {
        if (!prev.has('id')) prev.append('id', data.id ?? '');
        else prev.set('id', data.id ?? '');
        return prev;
      },
      { replace: true },
    );
  };
  const handleLockedOut = (data: QuanLyNguoiDung) => {
    data?.isLockedOut ? userFacade.unlock(data?.id ?? '') : userFacade.lock(data?.id ?? '');
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
    const fillQuery: QueryParams = { ...userFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    userFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    userFacade.set({ query: props.query, ...props.setKeyState });
  };

  const onFilter = (values: any) => {
    const currentFilter = JSON.parse(filter);
    Object.keys(values).forEach((key) => {
      if (values[key]) {
        if (['dateRange'].includes(key)) {
          currentFilter[key] = values[key].map((item: any) => dayjs(item).format('YYYY-MM-DD'));
        } else {
          currentFilter[key] = values[key];
        }
      } else {
        delete currentFilter[key];
      }
    });
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...currentFilter }),
      },
    });

    userFacade.set({ isFilterVisible: false });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      align: 'center',
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Mã người dùng',
      dataIndex: 'code',
      key: 'code',
      fixed: 'left',
      width: 140,
      ellipsis: true,
      render: (value, record) => (
        <Tooltip title={'Xem chi tiết người dùng'}>
          <Button className="font-normal hover:underline" type="link" onClick={() => handleViewDetail(record)}>
            {value}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      fixed: 'left',
      width: 200,
      render: (value, record) => (
        <Space>
          <Avatar src={record.avatarUrl} alt={record?.name} icon={<UserOutlined />} />
          <Typography.Text>{value}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'maPhongBan',
      key: 'maPhongBan',
      width: 160,
      ellipsis: true,
      render: (value, record) => {
        return (
          <div>
            <p className={'mb-1'}>{record?.phongBan?.title}</p>
            <p className={'text-gray-500'}>{record?.toThucHien?.title}</p>
          </div>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 236,
      ellipsis: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 160,
      render: (value) => <Typography.Text>{formatPhoneNumber(value)}</Typography.Text>,
    },
    {
      title: 'Nhóm người dùng',
      dataIndex: 'role',
      key: 'role',
      ellipsis: true,
      render: (_, record) => (
        <Flex wrap gap="4px 0">
          {record?.listRole?.map((item: RolesModel) => (
            <Tag key={item.id} color={'#108ee9'}>
              {item?.name}
            </Tag>
          ))}
        </Flex>
      ),
    },
    {
      title: 'Trạng thái TK',
      key: 'isLockedOut',
      width: 150,
      fixed: 'right',
      render: (item) => (
        <Switch
          className={`${item.isLockedOut ? '!bg-red-500' : '!bg-green-500'}`}
          checkedChildren="Hoạt động"
          unCheckedChildren="Đã khóa"
          checked={!item.isLockedOut}
          onChange={() => handleLockedOut(item)}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      key: 'createdOnDate',
      width: 105,
      render: (value) => formatDayjsDate(value),
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'Action',
      align: 'center',
      width: 150,
      fixed: 'right',
      render: (_, record: UserModal) => {
        const itemsMenu: ItemType[] = [
          {
            disabled: !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('UPDATE'),
            key: 'UPDATE',
            label: 'Cập nhật',
            onClick: () => handleEdit(record),
          },
          {
            disabled: !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('UPDATE'),
            key: 'CHANGE_PASSWORD',
            label: 'Đổi mật khẩu',
            onClick: () => handleChangePassword(record),
          },
          {
            disabled: !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('DELETE'),
            key: 'DELETE',
            label: 'Xóa',
            onClick: () => {
              modalApi.confirm({
                width: 600,
                title: `Bạn chắc chắn muốn xóa người dùng này?`,
                content: 'Thao tác này sẽ xóa người dùng bạn đã chọn. Thao tác này không thể khôi phục.',
                onOk: () => {
                  record?.id && userFacade.delete(record?.id);
                },
                onCancel: () => {},
                okText: 'Xác nhận',
                okButtonProps: { type: 'primary', danger: true },
                cancelText: 'Thoát',
                cancelButtonProps: { type: 'default', danger: true },
                closable: true,
              });
            },
          },
          {
            key: 'OPTION_USER',
            label: 'Cấu hình nhân sự',
            onClick: () => {
              employeeConfigurationFacade.set({
                isVisible: true,
                data: record,
              });
              employeeConfigurationFacade.getById({ id: record.id, keyState: '' });
            },
          },
        ];
        return (
          <Dropdown
            placement="bottomRight"
            trigger={['click']}
            menu={{
              items: itemsMenu,
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space size={'small'}>
                <Tooltip title={'Xem chi tiết người dùng'}>
                  <p className="hover:underline" onClick={() => handleViewDetail(record)}>
                    Xem chi tiết
                  </p>
                </Tooltip>
                <CaretDownOutlined className="text-blue-500 cursor-pointer px-2" />
              </Space>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  const keyLabelMap: Record<string, string> = {
    roleListCode: 'Nhóm người dùng',
    isLockedOut: 'Trạng thái khóa',
    departmentId: 'Phòng ban',
    positionId: 'Chức vụ',
    dateRange: 'Ngày tạo',
    fullTextSearch: 'Tìm kiếm',
  };

  const isLockedOut = [
    { label: 'Đã khóa', value: 'true' },
    { label: 'Hoạt động', value: 'false' },
  ];

  // Hàm ánh xạ giá trị từ value sang label
  const getValueLabel = (key: string, value: any) => {
    switch (key) {
      case 'roleListCode':
        return value
          .map((item: any) => rolesFacade.pagination?.content.find((role) => role.code === item)?.name || item)
          .join(', ');
      case 'departmentId':
        return departmentFacade.pagination?.content.find((item) => item.id === value)?.tenPhongBan || value;
      case 'positionId':
        return positionFacade.pagination?.content.find((item) => item.id === value)?.tenChucVu || value;
      case 'isLockedOut':
        return isLockedOut.find((item) => item.value === value)?.label || value;
      case 'dateRange':
        return value?.map((item: any) => formatDayjsDate(item)).join(' - ');
      default:
        return value;
    }
  };

  const tagRender: TagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="px-3 rounded-full"
        color={'#E6F4FF'}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        closeIcon={<CloseOutlined style={{ color: '#1890ff' }} />}
        style={{ marginInlineEnd: 4 }}
      >
        <span className="text-black text-sm">{label}</span>
      </Tag>
    );
  };

  return (
    <Spin spinning={userFacade.isLoading}>
      {contextModalApi}
      <SubHeader
        tool={
          !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('ADD') ? (
            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
              <Button
                disabled={true}
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  userFacade.set({
                    isVisible: true,
                    data: undefined,
                    isEdit: false,
                    isDetail: false,
                    isPassword: false,
                  })
                }
              >
                Thêm mới
              </Button>
            </Tooltip>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                userFacade.set({
                  isVisible: true,
                  data: undefined,
                  isEdit: false,
                  isDetail: false,
                  isPassword: false,
                })
              }
            >
              Thêm mới
            </Button>
          )
        }
      />
      <Flex className="px-5 mt-5" vertical gap={1.5}>
        <Table
          title={() => (
            <>
              <Flex gap={15} align="center">
                <div className="flex-1">
                  <SearchWidget
                    form={(form) => (formRef.current = form)}
                    callback={onChangeSearch}
                    placeholder={'Tìm kiếm theo mã nhân sự, tên nhân sự, chức vụ, phòng ban, email, số điện thoại'}
                  />
                </div>
                <Select
                  placeholder={'Chọn nhóm người dùng'}
                  className="w-60"
                  mode="multiple"
                  tagRender={tagRender}
                  value={parsedFilter.roleListCode}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  options={rolesFacade.pagination?.content.map((item) => ({
                    label: item.name,
                    value: item.code,
                  }))}
                  onChange={(value) => {
                    onChangeDataTable({
                      query: {
                        page: 1,
                        size,
                        filter: JSON.stringify({ ...parsedFilter, roleListCode: value }),
                      },
                    });
                  }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  loading={false}
                  onClick={() => {
                    onChangeDataTable({ query: { page, size, sort, filter } });
                  }}
                >
                  Tải lại
                </Button>
                <Button
                  icon={<FilterFilled />}
                  iconPosition="end"
                  onClick={() => userFacade.set({ isFilterVisible: true })}
                >
                  Bộ lọc khác
                </Button>
              </Flex>
              {filter && (
                <Flex className="mt-3" wrap gap="small">
                  {Object.entries(parsedFilter).map(([key, value]) => {
                    const keyName = keyLabelMap[key] || key;
                    const valueName = getValueLabel(key, value as string);
                    return (
                      <Tag
                        className="rounded-full py-0.5"
                        color="#E6F4FF"
                        key={key}
                        closable
                        closeIcon={
                          <CloseOutlined className="p-0.5 rounded hover:bg-slate-200" style={{ color: '#1890ff' }} />
                        }
                        onClose={() => {
                          const updatedFilter = { ...parsedFilter };
                          delete updatedFilter[key];

                          onChangeDataTable({
                            query: {
                              page: 1,
                              size,
                              filter: JSON.stringify(updatedFilter),
                            },
                          });

                          formFilter.setFieldsValue({ [key]: undefined });

                          switch (key) {
                            case 'fullTextSearch':
                              formRef.current?.resetFields(['search']);
                              break;
                          }
                        }}
                      >
                        <span className="text-black text-[14px] pl-0.5 h-">
                          {keyName}: {valueName}
                        </span>
                      </Tag>
                    );
                  })}
                </Flex>
              )}
            </>
          )}
          columns={columns}
          dataSource={dataSource}
          pagination={{
            size: 'small',
            className: 'pr-4',
            showSizeChanger: true,
            current: userFacade?.pagination?.page,
            pageSize: userFacade?.pagination?.size,
            total: userFacade?.pagination?.totalElements,
            pageSizeOptions: [20, 40, 60, 80],
            showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
            onChange: (page, size) => {
              let query = userFacade.query;
              query = { ...query, page: page, size: size };
              onChangeDataTable({ query: query });
            },
          }}
          rowKey="id"
          scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
        />
      </Flex>

      <Drawer
        title={'Bộ lọc'}
        maskClosable={false}
        forceRender
        open={userFacade.isFilterVisible}
        onClose={() => userFacade.set({ isFilterVisible: false })}
        closeIcon={false}
        extra={
          <Button type={'text'} icon={<CloseOutlined />} onClick={() => userFacade.set({ isFilterVisible: false })} />
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
        <Form form={formFilter} layout={'vertical'} onFinish={onFilter}>
          <Form.Item name={'roleListCode'} label={'Nhóm người dùng'}>
            <Select
              placeholder={'Chọn nhóm người dùng'}
              showSearch
              mode="multiple"
              value={parsedFilter.roleListCode}
              tagRender={tagRender}
              allowClear
              optionFilterProp="label"
              options={rolesFacade.pagination?.content.map((item) => ({
                label: item.name,
                value: item.code,
              }))}
            />
          </Form.Item>
          <Form.Item name={'positionId'} label={'Chức vụ'}>
            <Select
              placeholder={'Chọn chức vụ'}
              showSearch
              allowClear
              optionFilterProp="label"
              options={positionFacade.pagination?.content.map((item) => ({
                label: item.tenChucVu,
                value: item.id,
              }))}
            />
          </Form.Item>
          <Form.Item name={'departmentId'} label={'Phòng ban'}>
            <Select
              placeholder={'Chọn phòng ban'}
              showSearch
              allowClear
              optionFilterProp="label"
              options={departmentFacade.pagination?.content.map((item) => ({
                label: item.tenPhongBan,
                value: item.id,
              }))}
            />
          </Form.Item>
          <Form.Item name={'isLockedOut'} label={'Trạng thái khóa'}>
            <Select
              placeholder={'Chọn trạng thái'}
              showSearch
              allowClear
              optionFilterProp="label"
              options={[
                {
                  label: (
                    <Tag className="px-3.5 py-0.5 rounded-full text-sm" color={'green'} key={'Hoạt động'}>
                      Hoạt động
                    </Tag>
                  ),
                  value: 'false',
                },
                {
                  label: (
                    <Tag className="px-3.5 py-0.5 rounded-full text-sm" color={'red'} key={'Đã khóa'}>
                      Đã khóa
                    </Tag>
                  ),
                  value: 'true',
                },
              ]}
            />
          </Form.Item>
          <Form.Item name={'dateRange'} label={'Ngày tạo'}>
            <DatePicker.RangePicker
              className="w-full"
              format={'DD/MM/YYYY'}
              placement="bottomRight"
              allowClear
              presets={[
                {
                  label: 'Hôm nay',
                  value: [dayjs().startOf('day'), dayjs().endOf('day')],
                },
                {
                  label: 'Tuần này',
                  value: [dayjs().startOf('week'), dayjs().endOf('week')],
                },
                {
                  label: 'Tháng này',
                  value: [dayjs().startOf('month'), dayjs().endOf('month')],
                },
                {
                  label: 'Tuần trước',
                  value: [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')],
                },
                {
                  label: 'Tháng trước',
                  value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <UserDrawer />
      <DrawerCauHinhNhanSu />
    </Spin>
  );
};

export default Page;
