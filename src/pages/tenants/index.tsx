import { Button, Dropdown, Flex, Form, Modal, Space, Spin, Table, Typography } from 'antd';
import { CaretDownOutlined, LoadingOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import React, { useEffect, useRef } from 'react';
import { TenantFacade } from '../../store/tenants';
import type { FormInstance, TableColumnsType } from 'antd';
import { lang, routerLinks, uuidv4 } from '@utils';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';

interface DataType {
  key?: React.Key;
  lineNumber: number;
  id?: string;
  name?: string;
  subDomain?: string;
  email?: string;
  phoneNumber?: string;
  plan?: string;
  maxUsers?: number;
  webUrl?: string;
}

const Tenant = () => {
  const tenantFacade = TenantFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalApi, contextModalApi] = Modal.useModal();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const navigate = useNavigate();
  const [formFilter] = Form.useForm();

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
    onChangeDataTable({});
  }, []);

  useEffect(() => {
    switch (tenantFacade.status) {
      case EStatusState.deleteFulfilled:
        onChangeDataTable({
          query: { page, size, sort, filter },
        });
        break;
    }
  }, [tenantFacade.status]);

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
    const fillQuery: QueryParams = { ...tenantFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    tenantFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    tenantFacade.set({ query: props.query, ...props.setKeyState });
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

  const dropdownItems = [
    {
      key: 'redirect',
      label: 'Truy cập',
    },
    {
      key: 'update',
      label: 'Cập nhật',
    },
    {
      key: 'delete',
      label: 'Xóa',
    },
  ];

  const handleUpdate = (id: string) => {
    navigate(`/${lang}${routerLinks('Tenant')}/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    modalApi.confirm({
      width: 600,
      title: `Bạn chắc chắn muốn xóa tenant này?`,
      content: 'Thao tác này sẽ xóa tenant bạn đã chọn. Thao tác này không thể khôi phục.',
      onOk: () => {
        id && tenantFacade.delete(id);
      },
      onCancel: () => {},
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true },
      cancelText: 'Thoát',
      cancelButtonProps: { type: 'default', danger: true },
      closable: true,
    });
  };
  const handleRedirect = (webUrl: string) => {
    if (!webUrl) return;

    window.open(webUrl, '_blank');
  };

  const dataSource: DataType[] =
    tenantFacade.pagination?.content.map(
      (item, index): DataType => ({
        lineNumber: (Number(searchParams.get('page') ?? 0) - 1) * Number(searchParams.get('size') ?? 0) + index + 1,
        key: uuidv4(),
        id: item.id,
        name: item.name,
        subDomain: item.subDomain,
        email: item.email,
        phoneNumber: item.phoneNumber,
        plan: item.plan,
        maxUsers: item.maxUsers,
        webUrl: item.webUrl,
      }),
    ) ?? [];

  const columns: TableColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 60,
      align: 'center',
      fixed: 'left',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 150,
      render: (value, record) => (
        <Link className="hover:underline" to={`/${lang}${routerLinks('Tenant')}/${record.id}/detail`}>
          {value}
        </Link>
      ),
    },
    {
      title: 'Subdomain',
      dataIndex: 'subDomain',
      key: 'subDomain',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 150,
      fixed: 'right',
      render: (record) => (
        <Dropdown
          placement="bottomRight"
          trigger={['click']}
          menu={{
            items: dropdownItems,
            onClick: (item) => {
              switch (item.key) {
                case 'update':
                  handleUpdate(record.id);
                  break;
                case 'delete':
                  handleDelete(record.id);
                  break;
                case 'redirect':
                  handleRedirect(record.webUrl);
                  break;
              }
            },
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space size={'small'}>
              <Link to={`/${lang}${routerLinks('Tenant')}/${record.id}/detail`}>Xem chi tiết</Link>
              <CaretDownOutlined className="text-blue-500 cursor-pointer px-2" />
            </Space>
          </a>
        </Dropdown>
      ),
    },
  ];

  return (
    <Spin size="large" indicator={<LoadingOutlined spin />} spinning={tenantFacade.isLoading}>
      {contextModalApi}
      <Flex className="px-8 pb-10" vertical gap={1.5}>
        <Flex className="h-14" align="center" justify="space-between">
          <Typography.Title level={5}>Danh sách Tenant</Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} href={`/#/${lang}${routerLinks('Tenant')}/create`}>
            Thêm mới
          </Button>
        </Flex>
        <div className="bg-white">
          <Table
            title={() => (
              <Flex gap={15} align="center">
                <div className="flex-1">
                  <SearchWidget
                    form={(form) => (formRef.current = form)}
                    callback={onChangeSearch}
                    placeholder={'Tìm kiếm theo tên, email, subdomain'}
                  />
                </div>
                <Button
                  icon={<ReloadOutlined />}
                  loading={false}
                  onClick={() => {
                    onChangeDataTable({ query: { page, size, sort, filter } });
                  }}
                >
                  Tải lại
                </Button>
              </Flex>
            )}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowKey="id"
            scroll={{ x: 'max-content', y: 55 * 11 }}
          />
        </div>
      </Flex>
    </Spin>
  );
};

export default Tenant;
