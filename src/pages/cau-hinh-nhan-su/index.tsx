import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import {
  CauHinhNhanSuFacade,
  CauHinhNhanSuModel,
  ChucVuFacade,
  ChucVuModel,
  PhongBanFacade,
  PhongBanModel,
} from '@store';
import { formatCurrency, scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import { Button, Flex, Modal, Pagination, Select, Space, Spin, Table } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { FormInstance } from 'antd/lib';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import DrawerCauHinhNhanSu from './create';
import ModalDetail from './detail';

interface DataType extends CauHinhNhanSuModel {
  key: string;
}

const Page: React.FC = () => {
  const cauHinhNhanSuFacade = CauHinhNhanSuFacade();
  const chucVuFacade = ChucVuFacade();
  const phongBanFacade = PhongBanFacade();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    cauHinhNhanSuFacade.get({});
    chucVuFacade.get({});
    phongBanFacade.get({});
  }, []);

  useEffect(() => {
    switch (cauHinhNhanSuFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
      case EStatusState.deleteFulfilled:
        cauHinhNhanSuFacade.get({ filter: filter ?? '{}' });
        cauHinhNhanSuFacade.set({ isVisible: false });
        break;
    }
  }, [cauHinhNhanSuFacade.status]);

  const [modalApi, contextModalApi] = Modal.useModal();
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');

  const datasource: DataType[] =
    cauHinhNhanSuFacade.pagination?.content.map((items, index) => ({
      stt:
        (Number(cauHinhNhanSuFacade.pagination?.page ?? 0) - 1) * Number(cauHinhNhanSuFacade.pagination?.size ?? 0) +
        index +
        1,
      index: index + 1,
      id: items.id ? items.id : '---',
      key: uuidv4(),
      ma: items.ma ? items.ma : '---',
      tenNhanSu: items.tenNhanSu ? items.tenNhanSu : '---',
      chucVu: items.chucVu?.tenChucVu ? items.chucVu?.tenChucVu : '---',
      phongBan: items.phongBan?.tenPhongBan ? items.phongBan?.tenPhongBan : '---',
      luongCoBan: items.luongCoBan ? formatCurrency(items.luongCoBan) : 0,
      anCa: items.anCa ? formatCurrency(items.anCa) : 0,
      dienThoai: items.dienThoai ? formatCurrency(items.dienThoai) : 0,
      trangPhuc: items.trangPhuc ? formatCurrency(items.trangPhuc) : 0,
      lastModifiedOnDate: items.lastModifiedOnDate ? items.lastModifiedOnDate : '---',
      createdOnDate: items.createdOnDate ? items.createdOnDate : '---',
      createdByUserName: items.createdByUserName ? items.createdByUserName : '---',
    })) ?? [];

  //CONSTANT
  let currentFilter: any;
  let fillQuery: QueryParams;

  const column: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
      width: 50,
    },
    {
      title: 'Mã nhân sự',
      dataIndex: 'ma',
      key: 'ma',
      width: 122,
      render: (value, record) => (
        // <span
        //   className="text-sky-500 hover:text-sky-400 cursor-pointer hover:underline"
        //   // onClick={() => handleEdit(record)}
        // >
        //   {value}
        // </span>
        <Button className="p-0" type={'link'} onClick={() => handleDetail(record)}>
          {value}
        </Button>
      ),
    },
    {
      title: 'Tên nhân sự',
      dataIndex: 'tenNhanSu',
      key: 'tenNhanSu',
      width: 140,
    },
    {
      title: 'Chức vụ',
      dataIndex: 'chucVu',
      key: 'chucVu',
      width: 140,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'phongBan',
      key: 'phongBan',
      width: 140,
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'luongCoBan',
      key: 'luongCoBan',
      align: 'right',
      width: 120,
    },
    {
      title: 'Ăn ca',
      dataIndex: 'anCa',
      key: 'anCa',
      align: 'right',
      width: 90,
    },
    {
      title: 'Điện thoại',
      dataIndex: 'dienThoai',
      key: 'dienThoai',
      align: 'right',
      width: 90,
    },
    {
      title: 'Trang phục',
      dataIndex: 'trangPhuc',
      key: 'trangPhuc',
      align: 'right',
      width: 90,
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'Action',
      align: 'center',
      width: 80,
      render: (_, record: any) => (
        <Space size={'small'}>
          <Button type={'link'} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          {/* <Button
            danger
            type="link"
            //   onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button> */}
        </Space>
      ),
    },
  ];

  const onChangeSearch = (value: string) => {
    if (filter) {
      currentFilter = JSON.parse(filter);
      currentFilter.FullTextSearch = value;
      const query: QueryParams = {
        page: 1,
        size: 20,
        filter: JSON.stringify(currentFilter),
      };
      onChangeDataTable({ query });
    } else {
      onChangeDataTable({
        query: {
          page: 1,
          size: 20,
          filter: JSON.stringify({ FullTextSearch: value }),
        },
      });
    }
  };

  const onChangeDataTable = (props: { query?: QueryParams; setKeyState?: object }) => {
    // eslint-disable-next-line react/prop-types
    if (!props.query) {
      props.query = {
        page: Number(page),
        size: Number(size),
        filter: filter ?? '',
        sort: sort ?? '',
      };
    }

    // eslint-disable-next-line react/prop-types
    fillQuery = { ...cauHinhNhanSuFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    cauHinhNhanSuFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    // eslint-disable-next-line react/prop-types
    cauHinhNhanSuFacade.set({ query: props.query, ...props.setKeyState });
  };

  const handleSelect = (value: string, id: string) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    switch (id) {
      case 'ChucVu':
        currentFilter.ChucVu = value;
        break;
      case 'PhongBan':
        currentFilter.PhongBan = value;
        break;
    }

    const query: QueryParams = {
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query });
  };

  const handleEdit = (data: CauHinhNhanSuModel) => {
    cauHinhNhanSuFacade.set({
      isVisible: true,
      data: data,
    });
    cauHinhNhanSuFacade.getById({ id: data.id, keyState: '' });
    setSearchParams(
      (prev) => {
        if (!prev.has('id')) prev.append('id', data.id ?? '');
        else prev.set('id', data.id ?? '');
        return prev;
      },
      { replace: true },
    );
  };

  // const handleCreate = () => {
  //   cauHinhNhanSuFacade.set({ isVisible: true, data: undefined, isEdit: false });
  // };

  const handleDetail = (data: CauHinhNhanSuModel) => {
    cauHinhNhanSuFacade.set({ isDetail: true, data: data });
    cauHinhNhanSuFacade.getById({ id: data?.id, keyState: '' });
  };

  return (
    <>
      <Spin spinning={cauHinhNhanSuFacade.isLoading}>
        <div className="px-8 py-6">
          {/* <div className={'flex items-center justify-end h-16 '}>
              <Button type={'primary'} icon={<PlusOutlined />}>
                Thêm mới cấu hình nhân sự
              </Button>
            </div> */}
          <Table
            scroll={{ y: 'calc(100vh - 350px)' }}
            title={() => (
              <Flex gap={20}>
                <div className="flex-1">
                  <SearchWidget
                    className="flex-1 !w-full"
                    placeholder="Tìm kiếm theo mã nhân sự, tên nhân sự, chức vụ, phòng ban"
                    form={(form) => (formRef.current = form)}
                    callback={onChangeSearch}
                  />
                </div>
                <Select
                  className="w-36"
                  options={chucVuFacade.pagination?.content.map((item: ChucVuModel) => {
                    return { label: item.tenChucVu, value: item.tenChucVu };
                  })}
                  allowClear
                  placeholder={'Chức vụ'}
                  showSearch
                  filterOption={(input: string, option?: { label?: string; value?: string }) =>
                    (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
                  }
                  onChange={(value) => {
                    handleSelect(value, 'ChucVu');
                  }}
                />
                <Select
                  className="w-36"
                  options={phongBanFacade.pagination?.content.map((item: PhongBanModel) => {
                    return { label: item.tenPhongBan, value: item.tenPhongBan };
                  })}
                  allowClear
                  placeholder={'Phòng ban'}
                  showSearch
                  filterOption={(input: string, option?: { label?: string; value?: string }) =>
                    (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
                  }
                  onChange={(value) => {
                    handleSelect(value, 'PhongBan');
                  }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  loading={cauHinhNhanSuFacade.isLoading}
                  onClick={() => cauHinhNhanSuFacade.get({ filter: filter ?? '{}' })}
                >
                  Tải lại
                </Button>
                {/* <Button type={'primary'} icon={<PlusOutlined />} onClick={() => handleCreate()}>
                  Thêm mới cấu hình nhân sự
                </Button> */}
              </Flex>
            )}
            dataSource={datasource}
            columns={column}
            pagination={false}
            footer={() => (
              <Pagination
                className={'flex justify-end'}
                showSizeChanger
                current={cauHinhNhanSuFacade?.query?.page}
                pageSize={cauHinhNhanSuFacade?.pagination?.size}
                total={cauHinhNhanSuFacade?.pagination?.totalElements}
                pageSizeOptions={[20, 40, 60, 80]}
                showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
                onChange={(page, pageSize) => {
                  onChangeDataTable({ query: { page: page, size: pageSize } });
                  scrollLeftWhenChanging('.ant-table-body');
                  scrollTopWhenChanging('.ant-table-body');
                }}
              />
            )}
          />
        </div>
      </Spin>
      <DrawerCauHinhNhanSu />
      <ModalDetail />
    </>
  );
};

export default Page;
