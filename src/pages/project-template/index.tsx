import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import { InputSearch } from '@pages/shared-directory/input-search';
import { ProjectTemplateFacade, ProjectTemplateModel } from '@store';
import { formatDayjsDate, lang, routerLinks } from '@utils';
import { Button, Card, Flex, Modal, Space, Table, TableColumnsType } from 'antd';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function Page() {
  const projectTemplateFacade = ProjectTemplateFacade();
  const { isLoading, get, query, set, status, pagination, isEdit, isCreate } = projectTemplateFacade;
  const [modalApi, contextModalApi] = Modal.useModal();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    const fillQuery: QueryParams = { ...query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    set({ query: props.query, ...props.setKeyState });
  };

  useEffect(() => {
    onChangeDataTable({});
  }, []);

  useEffect(() => {
    switch (status) {
      case EStatusState.deleteFulfilled:
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        onChangeDataTable({});
        break;
    }
  }, [status]);

  const columns: TableColumnsType<ProjectTemplateModel> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      align: 'center',
      width: 60,
    },
    {
      title: 'Mã template',
      dataIndex: 'code',
      width: 165,
      fixed: 'left',
      render: (value, record) => (
        <Link to={`/${lang}${routerLinks('ProjectTemplate')}/${record.id}/edit`}>{value}</Link>
      ),
    },
    {
      title: 'Tên template',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Số giai đoạn',
      dataIndex: 'numStages',
      align: 'center',
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      width: 110,
      render: (value) => formatDayjsDate(value),
      align: 'center',
    },
    {
      title: 'Thao tác',
      width: 200,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => projectTemplateFacade.getById({ id: record.id || '' })}
            href={`#/${lang}${routerLinks('ProjectTemplate')}/add`}
          >
            Nhân bản
          </Button>
          <Button type="link" href={`#/${lang}${routerLinks('ProjectTemplate')}/${record.id}/edit`}>
            Sửa
          </Button>
          <Button
            danger
            onClick={() =>
              modalApi.confirm({
                title: 'Xác nhận xoá template dự án',
                content: 'Template dự án sẽ bị xóa. Bạn có muốn tiếp tục?',
                onOk: () => {
                  record?.id && projectTemplateFacade.delete(record?.id);
                },
                onCancel: () => {},
                okText: 'Đồng ý',
                okButtonProps: { variant: 'outlined' },
                cancelText: 'Huỷ',
                cancelButtonProps: { danger: true },
              })
            }
            type="link"
          >
            Xóa
          </Button>
        </Space>
      ),
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

  return (
    <>
      {contextModalApi}
      <SubHeader />
      <div className="m-6 intro-x">
        <Card size="small" variant="borderless">
          <Flex className="!mb-4" gap={16}>
            <InputSearch
              defaultValue={parsedFilter?.fullTextSearch}
              callback={onChangeSearch}
              placeholder={'Tìm kiếm theo mã, tên template dự án'}
            />
            <Space className="float-right" size={16}>
              <Button
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
              </Button>
              <Button type="primary" icon={<PlusOutlined />} href={`#/${lang}${routerLinks('ProjectTemplate')}/add`}>
                Thêm mới
              </Button>
            </Space>
          </Flex>
          <Table<ProjectTemplateModel>
            loading={isLoading}
            size="small"
            dataSource={pagination?.content.map((item, index) => ({
              ...item,
              numStages: item.templateStages?.length,
              stt: (Number(page ?? 0) - 1) * Number(size) + index + 1,
            }))}
            columns={columns}
            rowKey="id"
            scroll={{ x: 'max-content', y: 'calc(100vh - 330px)' }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: [10, 20, 50, 100],
              total: pagination?.totalElements,
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
      </div>
    </>
  );
}
