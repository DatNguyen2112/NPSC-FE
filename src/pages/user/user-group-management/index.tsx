import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { DrawerForm } from '@core/drawer';
import { SubHeader } from '@layouts/admin';
import { EFormRuleType, EFormType, EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { PhongBanModel, ChucVuFacade, NhomVatTuFacade, NhomVatTuModel, RolesFacade, RolesModel } from '@store';
import { scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import { Button, FormInstance, Modal, Pagination, Space, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
interface DataType extends RolesModel {
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
  const rolesFacade = RolesFacade();

  useEffect(() => {
    rolesFacade.get({});
  }, []);
  useEffect(() => {
    switch (rolesFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
      case EStatusState.deleteFulfilled:
        rolesFacade.get({ filter: filter ?? '{}' });
        rolesFacade.set({ isVisible: false });
        break;
    }
  }, [rolesFacade.status]);

  const datasource: DataType[] =
    rolesFacade.pagination?.content.map((items, index) => ({
      stt: (Number(rolesFacade.pagination?.page ?? 0) - 1) * Number(rolesFacade.pagination?.size ?? 0) + index + 1,
      index: index + 1,
      id: items.id ?? '',
      key: uuidv4(),
      code: items.code ? items.code : '-',
      name: items.name ? items.name : '-',
      description: items.description ? items.description : '-',
    })) ?? [];
  const handleEdit = (data: RolesModel) => {
    rolesFacade.set({
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
      title: 'Xoá nhóm người dùng?',
      content:
        'Mọi dữ liệu về nhóm người dùng này sẽ bị xoá vĩnh viễn. Bạn có chắc chắn muốn xoá nhóm người dùng này ?',
      onOk: () => {
        rolesFacade.delete(id);
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
    rolesFacade.get(fillQuery);
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
      title: 'Mã nhóm người dùng',
      dataIndex: 'code',
      key: 'code',
      width: 200,
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
      title: 'Tên nhóm người dùng',
      dataIndex: 'name',
      key: 'name',
      width: 300,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
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
          <Button onClick={() => handleEdit(record)} type={'link'}>
            Sửa
          </Button>
          <Button danger type="link" onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const tool = (
    <Space size={'middle'} className={'mx-4'}>
      <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
      <Button
        icon={<ReloadOutlined />}
        loading={rolesFacade.isLoading}
        onClick={() => rolesFacade.get({ filter: filter ?? '{}' })}
      >
        Tải lại
      </Button>
      <Button
        type={'primary'}
        icon={<PlusOutlined />}
        onClick={() => rolesFacade.set({ isVisible: true, data: undefined, isEdit: false })}
      >
        Thêm mới nhóm người dùng
      </Button>
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
    [rolesFacade.isLoading],
  );
  return (
    <>
      <SubHeader tool={tool} />
      {contextModalApi}
      <div className={'w-[1200px] m-auto p-3'}>
        <Spin spinning={rolesFacade.isLoading}>
          {table}
          <Pagination
            className={'flex justify-end pt-3'}
            showSizeChanger
            current={rolesFacade?.query?.page}
            pageSize={rolesFacade?.pagination?.size}
            total={rolesFacade?.pagination?.totalElements}
            pageSizeOptions={[20, 40, 60, 80]}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            onChange={(page, pageSize) => {
              onChangeDataTable({ page: page, size: pageSize });
              scrollLeftWhenChanging('.ant-table-body');
              scrollTopWhenChanging('.ant-table-body');
            }}
          />
        </Spin>
      </div>
      <DrawerForm
        facade={rolesFacade}
        title={`${rolesFacade.isEdit ? 'Chỉnh sửa' : 'Thêm mới'} nhóm người dùng`}
        afterOpenChange={(visible) => {
          if (!visible) {
            setSearchParams(
              (prev) => {
                prev.delete('id');
                return prev;
              },
              { replace: true },
            );
          }
        }}
        columns={[
          {
            title: 'Mã nhóm người dùng',
            name: 'code',
            formItem: {
              rules: [{ type: EFormRuleType.required }],
            },
          },
          {
            title: 'Tên nhóm người dùng',
            name: 'name',
            formItem: {
              rules: [{ type: EFormRuleType.required }],
            },
          },
          {
            title: 'Mô tả',
            name: 'description',
            formItem: {
              type: EFormType.textarea,
            },
          },
        ]}
        onSubmit={(values) => {
          if (rolesFacade?.data?.id) rolesFacade.put({ ...values, id: rolesFacade.data.id });
          else rolesFacade.post(values);
        }}
      />
    </>
  );
};

export default Page;
