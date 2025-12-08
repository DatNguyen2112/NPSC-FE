import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { ChucVuFacade, PhongBanModel, RightMapRoleFacade } from '@store';
import { scrollLeftWhenChanging, uuidv4 } from '@utils';
import { Button, FormInstance, Modal, Pagination, Space, Spin, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import ChucVuDrawer from './chucVu.drawer';

interface DataType extends PhongBanModel {
  key: string;
}

const Page: React.FC = () => {
  const [modalApi, contextModalApi] = Modal.useModal();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');
  const formRef = useRef<FormInstance | undefined>(undefined);
  const chucVuFacade = ChucVuFacade();
  const rightMapRoleFacade = RightMapRoleFacade();

  useEffect(() => {
    chucVuFacade.get({});
    rightMapRoleFacade.getRightMapByListCode('CODETYPE');
  }, []);
  useEffect(() => {
    switch (chucVuFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
      case EStatusState.deleteFulfilled:
        chucVuFacade.get({ filter: filter ?? '{}' });
        chucVuFacade.set({ isVisible: false });
        break;
    }
  }, [chucVuFacade.status]);

  const datasource: DataType[] =
    chucVuFacade.pagination?.content.map((items, index) => ({
      stt: (Number(chucVuFacade.pagination?.page ?? 0) - 1) * Number(chucVuFacade.pagination?.size ?? 0) + index + 1,
      index: index + 1,
      id: items.id ?? '',
      key: uuidv4(),
      maChucVu: items.maChucVu ?? '',
      tenChucVu: items.tenChucVu ?? '',
      ghiChu: items.ghiChu ? items.ghiChu : '-',
    })) ?? [];
  const handleEdit = (data: PhongBanModel) => {
    chucVuFacade.set({
      isVisible: true,
      data: data,
      isEdit: true,
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
  const onChangeSearch = (value: string) => {
    onChangeDataTable({
      page: 1,
      size: 20,
      filter: JSON.stringify({ FullTextSearch: value }),
    });
  };
  const handleDelete = (id: string) => {
    modalApi.confirm({
      title: 'Xoá chức vụ?',
      content: 'Mọi dữ liệu về chức vụ này sẽ bị xoá vĩnh viễn. Bạn có chắc chắn muốn xoá chức vụ này ?',
      onOk: () => {
        chucVuFacade.delete(id);
      },
      onCancel: () => {},
      cancelText: 'Huỷ bỏ',
      okText: 'Xác nhận',
    });
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
    chucVuFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
  };
  const column: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
      width: 60,
    },
    {
      title: 'Mã chức vụ',
      dataIndex: 'maChucVu',
      key: 'maChucVu',
      width: 140,
      render: (value, record) => (
        <span
          className="text-sky-500 hover:text-sky-400 cursor-pointer hover:underline"
          onClick={() => handleEdit(record)}
        >
          {value}
        </span>
      ),
    },
    {
      title: 'Tên chức vụ',
      dataIndex: 'tenChucVu',
      key: 'tenChucVu',
      width: 300,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      // width: 200,
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'Action',
      align: 'center',
      width: 150,
      render: (_, record: any) => (
        <Space size={'small'}>
          {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('UPDATE') ? (
            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
              <Button disabled={true} onClick={() => handleEdit(record)} type={'link'}>
                Sửa
              </Button>
            </Tooltip>
          ) : (
            <Button onClick={() => handleEdit(record)} type={'link'}>
              Sửa
            </Button>
          )}

          {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('DELETE') ? (
            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
              <Button danger type="link" onClick={() => handleDelete(record.id)}>
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
        loading={chucVuFacade.isLoading}
        onClick={() => chucVuFacade.get({ filter: filter ?? '{}' })}
      >
        Tải lại
      </Button>

      {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('ADD') ? (
        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
          <Button
            disabled={true}
            type={'primary'}
            icon={<PlusOutlined />}
            onClick={() => chucVuFacade.set({ isVisible: true, data: undefined, isEdit: false })}
          >
            Thêm mới chức vụ
          </Button>
        </Tooltip>
      ) : (
        <Button
          type={'primary'}
          icon={<PlusOutlined />}
          onClick={() => chucVuFacade.set({ isVisible: true, data: undefined, isEdit: false })}
        >
          Thêm mới chức vụ
        </Button>
      )}
    </Space>
  );
  const table = useMemo(
    () => (
      <Table
        size="small"
        scroll={{ y: 'calc(100vh - 265px)' }}
        dataSource={datasource}
        columns={column}
        pagination={false}
      />
    ),
    [chucVuFacade.isLoading],
  );
  return (
    <>
      <SubHeader tool={tool} />
      {contextModalApi}
      <div className={'w-[1200px] m-auto p-3'}>
        <Spin spinning={chucVuFacade.isLoading}>
          {table}
          <Pagination
            className={'flex justify-end pt-3'}
            showSizeChanger
            current={chucVuFacade?.query?.page}
            pageSize={chucVuFacade?.pagination?.size}
            total={chucVuFacade?.pagination?.totalElements}
            pageSizeOptions={[20, 40, 60, 80]}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            onChange={(page, pageSize) => {
              onChangeDataTable({ page: page, size: pageSize });
              scrollLeftWhenChanging('.ant-table-body');
            }}
          />
        </Spin>
      </div>
      <ChucVuDrawer />
    </>
  );
};

export default Page;
