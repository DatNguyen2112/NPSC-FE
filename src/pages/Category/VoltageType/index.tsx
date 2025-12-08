import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { CodeTypeFacade, CodeTypeManagement, CodeTypeManagementFacade, TypesCodeTypeManagementFacade } from '@store';
import { formatDayjsDate, uuidv4 } from '@utils';
import { Button, Flex, FormInstance, Modal, Space, Spin, Table, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { RightMapRoleFacade } from 'src/store/right-map-role';
import EditForm from './edit.drawer';

interface DataType extends CodeTypeManagement {
  stt?: number;
  key?: string;
  children?: DataType[];
}

const Page: React.FC = () => {
  const navigate = useNavigate();
  const menuRef = useRef<string>('CONSULT_SERVICE');
  const [modalApi, contextModalApi] = Modal.useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const codeTypeManagementFacade = CodeTypeManagementFacade();
  const codeTypeFacade = CodeTypeFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const typesCodeTypeManagementFacade = TypesCodeTypeManagementFacade();
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
    rightMapRoleFacade.getRightMapByListCode('CODETYPE');
    codeTypeFacade.getVoltageType({ size: -1 });
  }, []);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
      case EStatusState.deleteFulfilled:
        codeTypeFacade.getVoltageType({ size: -1 });
        break;
    }
  }, [codeTypeManagementFacade.status]);

  const dataSource: DataType[] =
    codeTypeFacade.voltageTypeData?.content?.map(
      (items, index): DataType => ({
        stt:
          (Number(codeTypeManagementFacade.pagination?.page ?? 0) - 1) *
            Number(codeTypeManagementFacade.pagination?.size ?? 0) +
          index +
          1,
        key: uuidv4(),
        id: items.id ?? '-',
        title: items.title ?? '-',
        code: items.code ?? '-',
        description: items.description ?? '-',
        createdOnDate: items.createdOnDate ? dayjs(items.createdOnDate).format('DD/MM/YYYY') : '-',
        iconClass: items.iconClass,
        codeTypeItems: items.codeTypeItems,
      }),
    ) ?? [];

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

  const handleDelete = (id: string) => {
    modalApi.confirm({
      title: 'Xoá danh mục?',
      content: 'Mọi dữ liệu về danh mục này sẽ bị xoá vĩnh viễn. Bạn có chắc chắn muốn xoá danh mục này ?',
      onOk: () => {
        codeTypeManagementFacade.delete(id);
      },
      onCancel: () => {},
      cancelText: 'Huỷ bỏ',
      okText: 'Xác nhận',
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
    const fillQuery: QueryParams = { ...codeTypeManagementFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    codeTypeFacade.getVoltageType(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    codeTypeManagementFacade.set({ query: props.query, ...props.setKeyState });
  };

  const column: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
      width: 80,
    },
    {
      title: <span>Mã loại cấp điện áp</span>,
      dataIndex: 'code',
      key: 'code',
      width: 200,
    },
    {
      title: 'Tên loại cấp điện áp',
      dataIndex: 'title',
      key: 'title',
      render: (value, record) => (
        <Space>
          <i className={`la-lg ${record?.iconClass}`}></i>
          <Typography.Text>{value}</Typography.Text>
        </Space>
      ),
      width: 200,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      key: 'createdOnDate',
      width: 150,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'Action',
      align: 'center',
      width: 150,
      render: (_, record: any) => (
        <Space>
          {!rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('UPDATE') ? (
            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
              <Button
                disabled={true}
                onClick={() => {
                  codeTypeManagementFacade.set({
                    isVisibleForm: true,
                  });
                  codeTypeManagementFacade.getById({ id: record.id });
                  setSearchParams((prev) => {
                    prev.set('id', record.id);
                    return prev;
                  });
                }}
                type={'link'}
              >
                Sửa
              </Button>
            </Tooltip>
          ) : (
            <Button
              onClick={() => {
                codeTypeManagementFacade.set({
                  isVisibleForm: true,
                });
                codeTypeManagementFacade.getById({ id: record.id });
                setSearchParams((prev) => {
                  prev.set('id', record.id);
                  return prev;
                });
              }}
              type={'link'}
            >
              Sửa
            </Button>
          )}

          {!rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('DELETE') ? (
            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
              <Button disabled={true} danger type="link" onClick={() => handleDelete(record.id)}>
                Xóa
              </Button>
            </Tooltip>
          ) : (
            <Button danger type="link" onClick={() => handleDelete(record.id)}>
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tool = (
    <Space size={'middle'} className={'mx-4'}>
      <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
      <Button
        icon={<ReloadOutlined />}
        loading={codeTypeManagementFacade.isLoading}
        onClick={() => onChangeDataTable({})}
      >
        Tải lại
      </Button>

      {!rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('ADD') ? (
        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
          <Button
            disabled={true}
            type={'primary'}
            icon={<PlusOutlined />}
            onClick={() =>
              codeTypeManagementFacade.set({
                isVisibleForm: true,
              })
            }
          >
            Thêm mới
          </Button>
        </Tooltip>
      ) : (
        <Button
          type={'primary'}
          icon={<PlusOutlined />}
          onClick={() =>
            codeTypeManagementFacade.set({
              isVisibleForm: true,
            })
          }
        >
          Thêm mới
        </Button>
      )}
    </Space>
  );

  const table = useMemo(
    () => (
      <Spin spinning={codeTypeManagementFacade.isLoading}>
        <Table
          className={'w-[1000px]'}
          size="small"
          scroll={{ y: 'calc(100vh - 220px)' }}
          dataSource={dataSource}
          columns={column}
          pagination={{
            size: 'small',
            className: 'pr-4',
            showSizeChanger: true,
            current: codeTypeManagementFacade?.pagination?.page,
            pageSize: codeTypeManagementFacade?.pagination?.size,
            total: codeTypeManagementFacade?.pagination?.totalElements,
            pageSizeOptions: [20, 40, 60, 80],
            showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
            onChange: (page, size) => {
              let query = codeTypeManagementFacade.query;
              query = { ...query, page: page, size: size };
              onChangeDataTable({ query: query });
            },
          }}
          rowKey={'id'}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                showHeader={false}
                size="small"
                pagination={false}
                dataSource={record.codeTypeItems}
                columns={[
                  {
                    title: 'STT',
                    dataIndex: 'lineNumber',
                    key: 'lineNumber',
                    align: 'center',
                    width: 80,
                    // lấy stt ở dataSource cha
                    render: (_, record) => {
                      const parentIndex = dataSource.findIndex((item) => item.id === record.codeTypeId);
                      const parentStt = dataSource[parentIndex]?.stt ?? 0;
                      return `${parentStt}.${record.lineNumber}`;
                    },
                  },
                  {
                    title: 'Mã',
                    dataIndex: 'code',
                    key: 'code',
                    width: 150,
                  },
                  {
                    title: 'Tên',
                    dataIndex: 'title',
                    key: 'title',
                    render: (value, record) => (
                      <Space>
                        <i className={`la-lg ${record?.iconClass}`}></i>
                        <Typography.Text>{value}</Typography.Text>
                      </Space>
                    ),
                  },
                  {
                    title: 'Ngày tạo',
                    dataIndex: 'createdOnDate',
                    key: 'createdOnDate',
                    width: 150,
                    render: (value) => formatDayjsDate(value),
                  },
                  {
                    title: null,
                    dataIndex: 'action',
                    key: 'Action',
                    align: 'center',
                    width: 150,
                  },
                ]}
              />
            ),
            rowExpandable: (record: any) => record.codeTypeItems && record.codeTypeItems.length > 0,
          }}
        />
      </Spin>
    ),
    [codeTypeManagementFacade.isLoading],
  );

  return (
    <>
      <SubHeader tool={tool}>{contextModalApi}</SubHeader>
      <div className={'w-[1200px] m-auto p-3'}>
        <Flex className="px-5 mt-5" vertical gap={1.5}>
          <Spin spinning={codeTypeFacade.isLoading}>
            <Table
              columns={column}
              dataSource={dataSource}
              pagination={{
                size: 'small',
                className: 'pr-4',
                showSizeChanger: true,
                current: codeTypeManagementFacade?.pagination?.page,
                pageSize: codeTypeManagementFacade?.pagination?.size,
                total: codeTypeManagementFacade?.pagination?.totalElements,
                pageSizeOptions: [20, 40, 60, 80],
                showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
                onChange: (page, size) => {
                  let query = codeTypeManagementFacade.query;
                  query = { ...query, page: page, size: size };
                  onChangeDataTable({ query: query });
                },
              }}
              rowKey="id"
              scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
            />
          </Spin>
        </Flex>
      </div>

      <EditForm />
    </>
  );
};

export default Page;
