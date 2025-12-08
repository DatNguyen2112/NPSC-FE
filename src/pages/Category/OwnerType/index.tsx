import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { CodeTypeManagement, InvestorTypeFacade } from '@store';
import { uuidv4 } from '@utils';
import { Button, Flex, FormInstance, Modal, Space, Spin, Table, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
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
  const investorTypeFacade = InvestorTypeFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
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
    investorTypeFacade.get({ size: -1 });
  }, []);

  useEffect(() => {
    switch (investorTypeFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
      case EStatusState.deleteFulfilled:
        onChangeDataTable({});
        break;
    }
  }, [investorTypeFacade.status]);

  const dataSource: DataType[] =
    investorTypeFacade.pagination?.content.map(
      (items, index): DataType => ({
        ...items,
        stt:
          (Number(investorTypeFacade.pagination?.page ?? 0) - 1) * Number(investorTypeFacade.pagination?.size ?? 0) +
          index +
          1,
        key: uuidv4(),
        createdOnDate: dayjs(items?.createdOnDate).format('DD/MM/YYYY'),
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
        investorTypeFacade.delete(id);
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
    const fillQuery: QueryParams = { ...investorTypeFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    investorTypeFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    investorTypeFacade.set({ query: props.query, ...props.setKeyState });
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
      title: <span>Mã loại chủ đầu tư </span>,
      dataIndex: 'code',
      key: 'code',
      width: 200,
    },
    {
      title: 'Tên loại chủ đầu tư',
      dataIndex: 'name',
      key: 'name',
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
                  investorTypeFacade.set({
                    isVisibleForm: true,
                  });
                  investorTypeFacade.getById({ id: record.id });
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
                investorTypeFacade.set({
                  isVisibleForm: true,
                });
                investorTypeFacade.getById({ id: record.id });
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

  // const menuItems: MenuProps['items'] =
  //   typesCodeTypeManagementFacade.pagination?.content.map((item: TypesCodeTypeManagement) => ({
  //     label: item.title,
  //     key: item.code,
  //   })) ?? [];

  // const handleClickMenuItems = (key: string) => {
  //   menuRef.current = key;
  //   formRef.current?.resetFields();
  //   parsedFilter.type = key;
  //   onChangeDataTable({
  //     query: {
  //       page: 1,
  //       size,
  //       filter: JSON.stringify({ ...parsedFilter }),
  //     },
  //   });
  //   scrollLeftWhenChanging('.ant-table-body');
  //   scrollTopWhenChanging('.ant-table-body');
  // };

  const tool = (
    <Space size={'middle'} className={'mx-4'}>
      <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
      <Button icon={<ReloadOutlined />} loading={investorTypeFacade.isLoading} onClick={() => onChangeDataTable({})}>
        Tải lại
      </Button>

      {!rightMapRoleFacade.rightDatas?.[0]?.rightCodes?.includes('ADD') ? (
        <Tooltip title="Bạn không có quyền thực hiện thao tác này">
          <Button
            disabled={true}
            type={'primary'}
            icon={<PlusOutlined />}
            onClick={() =>
              investorTypeFacade.set({
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
            investorTypeFacade.set({
              isVisibleForm: true,
            })
          }
        >
          Thêm mới
        </Button>
      )}
    </Space>
  );

  // const table = useMemo(
  //   () => (
  //     <Spin spinning={investorTypeFacade.isLoading}>
  //       <Table
  //         className={'w-[1000px]'}
  //         size="small"
  //         scroll={{ y: 'calc(100vh - 220px)' }}
  //         dataSource={dataSource}
  //         columns={column}
  //         pagination={{
  //           size: 'small',
  //           className: 'pr-4',
  //           showSizeChanger: true,
  //           current: investorTypeFacade?.pagination?.page,
  //           pageSize: investorTypeFacade?.pagination?.size,
  //           total: investorTypeFacade?.pagination?.totalElements,
  //           pageSizeOptions: [20, 40, 60, 80],
  //           showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
  //           onChange: (page, size) => {
  //             let query = investorTypeFacade.query;
  //             query = { ...query, page: page, size: size };
  //             onChangeDataTable({ query: query });
  //           },
  //         }}
  //         rowKey={'id'}
  //         expandable={{
  //           expandedRowRender: (record) => (
  //             <Table
  //               showHeader={false}
  //               size="small"
  //               pagination={false}
  //               dataSource={record.codeTypeItems}
  //               columns={[
  //                 {
  //                   title: 'STT',
  //                   dataIndex: 'lineNumber',
  //                   key: 'lineNumber',
  //                   align: 'center',
  //                   width: 80,
  //                   // lấy stt ở dataSource cha
  //                   render: (_, record) => {
  //                     const parentIndex = dataSource.findIndex((item) => item.id === record.codeTypeId);
  //                     const parentStt = dataSource[parentIndex]?.stt ?? 0;
  //                     return `${parentStt}.${record.lineNumber}`;
  //                   },
  //                 },
  //                 {
  //                   title: 'Mã',
  //                   dataIndex: 'code',
  //                   key: 'code',
  //                   width: 150,
  //                 },
  //                 {
  //                   title: 'Tên',
  //                   dataIndex: 'title',
  //                   key: 'title',
  //                   render: (value, record) => (
  //                     <Space>
  //                       <i className={`la-lg ${record?.iconClass}`}></i>
  //                       <Typography.Text>{value}</Typography.Text>
  //                     </Space>
  //                   ),
  //                 },
  //                 {
  //                   title: 'Ngày tạo',
  //                   dataIndex: 'createdOnDate',
  //                   key: 'createdOnDate',
  //                   width: 150,
  //                   render: (value) => formatDayjsDate(value),
  //                 },
  //                 {
  //                   title: null,
  //                   dataIndex: 'action',
  //                   key: 'Action',
  //                   align: 'center',
  //                   width: 150,
  //                 },
  //               ]}
  //             />
  //           ),
  //           rowExpandable: (record: any) => record.codeTypeItems && record.codeTypeItems.length > 0,
  //         }}
  //       />
  //     </Spin>
  //   ),
  //   [investorTypeFacade.isLoading],
  // );

  return (
    <>
      <SubHeader tool={tool}>{contextModalApi}</SubHeader>
      <div className={'w-[1200px] m-auto p-3'}>
        <Flex className="px-5 mt-5" vertical gap={1.5}>
          <Spin spinning={investorTypeFacade.isLoading}>
            <Table
              // size="small"
              // dataSource={dataSource}
              // columns={column}
              // pagination={{
              //   size: 'small',
              //   className: 'pr-4',
              //   showSizeChanger: true,
              //   current: investorTypeFacade?.pagination?.page,
              //   pageSize: investorTypeFacade?.pagination?.size,
              //   total: investorTypeFacade?.pagination?.totalElements,
              //   pageSizeOptions: [20, 40, 60, 80],
              //   showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
              //   onChange: (page, size) => {
              //     let query = investorTypeFacade.query;
              //     query = { ...query, page: page, size: size };
              //     onChangeDataTable({ query: query });
              //   },
              // }}
              // rowKey={'id'}
              // expandable={{
              //   expandedRowRender: (record) => (
              //     <Table
              //       showHeader={false}
              //       size="small"
              //       pagination={false}
              //       dataSource={record.codeTypeItems}
              //       columns={[
              //         {
              //           title: 'STT',
              //           dataIndex: 'lineNumber',
              //           key: 'lineNumber',
              //           align: 'center',
              //           width: 80,
              //           // lấy stt ở dataSource cha
              //           render: (_, record) => {
              //             const parentIndex = dataSource.findIndex((item) => item.id === record.codeTypeId);
              //             const parentStt = dataSource[parentIndex]?.stt ?? 0;
              //             return `${parentStt}.${record.lineNumber}`;
              //           },
              //         },
              //         {
              //           title: 'Mã',
              //           dataIndex: 'code',
              //           key: 'code',
              //           width: 150,
              //         },
              //         {
              //           title: 'Tên',
              //           dataIndex: 'title',
              //           key: 'title',
              //           render: (value, record) => (
              //             <Space>
              //               <i className={`la-lg ${record?.iconClass}`}></i>
              //               <Typography.Text>{value}</Typography.Text>
              //             </Space>
              //           ),
              //         },
              //         {
              //           title: 'Ngày tạo',
              //           dataIndex: 'createdOnDate',
              //           key: 'createdOnDate',
              //           width: 150,
              //           render: (value) => formatDayjsDate(value),
              //         },
              //         {
              //           title: null,
              //           dataIndex: 'action',
              //           key: 'Action',
              //           align: 'center',
              //           width: 150,
              //         },
              //       ]}
              //     />
              //   ),
              //   rowExpandable: (record: any) => record.codeTypeItems && record.codeTypeItems.length > 0,
              // }}
              // title={() => (
              //   <>
              //     <Flex gap={15} align="center">
              //       <div className="flex-1">
              //         <SearchWidget
              //           form={(form) => (formRef.current = form)}
              //           callback={onChangeSearch}
              //           placeholder={'Tìm kiếm theo mã nhân sự, tên nhân sự, chức vụ, phòng ban, email, số điện thoại'}
              //         />
              //       </div>
              //       <Select
              //         placeholder={'Chọn nhóm người dùng'}
              //         className="w-60"
              //         mode="multiple"
              //         tagRender={tagRender}
              //         value={parsedFilter.roleListCode}
              //         showSearch
              //         optionFilterProp="label"
              //         allowClear
              //         options={rolesFacade.pagination?.content.map((item) => ({
              //           label: item.name,
              //           value: item.code,
              //         }))}
              //         onChange={(value) => {
              //           onChangeDataTable({
              //             query: {
              //               page: 1,
              //               size,
              //               filter: JSON.stringify({ ...parsedFilter, roleListCode: value }),
              //             },
              //           });
              //         }}
              //       />
              //       <Button
              //         icon={<ReloadOutlined />}
              //         loading={false}
              //         onClick={() => {
              //           onChangeDataTable({ query: { page, size, sort, filter } });
              //         }}
              //       >
              //         Tải lại
              //       </Button>
              //       <Button
              //         icon={<FilterFilled />}
              //         iconPosition="end"
              //         onClick={() => userFacade.set({ isFilterVisible: true })}
              //       >
              //         Bộ lọc khác
              //       </Button>
              //     </Flex>
              //     {filter && (
              //       <Flex className="mt-3" wrap gap="small">
              //         {Object.entries(parsedFilter).map(([key, value]) => {
              //           const keyName = keyLabelMap[key] || key;
              //           const valueName = getValueLabel(key, value as string);
              //           return (
              //             <Tag
              //               className="rounded-full py-0.5"
              //               color="#E6F4FF"
              //               key={key}
              //               closable
              //               closeIcon={
              //                 <CloseOutlined className="p-0.5 rounded hover:bg-slate-200" style={{ color: '#1890ff' }} />
              //               }
              //               onClose={() => {
              //                 const updatedFilter = { ...parsedFilter };
              //                 delete updatedFilter[key];
              //
              //                 onChangeDataTable({
              //                   query: {
              //                     page: 1,
              //                     size,
              //                     filter: JSON.stringify(updatedFilter),
              //                   },
              //                 });
              //
              //                 formFilter.setFieldsValue({ [key]: undefined });
              //
              //                 switch (key) {
              //                   case 'fullTextSearch':
              //                     formRef.current?.resetFields(['search']);
              //                     break;
              //                 }
              //               }}
              //             >
              //           <span className="text-black text-[14px] pl-0.5 h-">
              //             {keyName}: {valueName}
              //           </span>
              //             </Tag>
              //           );
              //         })}
              //       </Flex>
              //     )}
              //   </>
              // )}
              columns={column}
              dataSource={dataSource}
              pagination={{
                size: 'small',
                className: 'pr-4',
                showSizeChanger: true,
                current: investorTypeFacade?.pagination?.page,
                pageSize: investorTypeFacade?.pagination?.size,
                total: investorTypeFacade?.pagination?.totalElements,
                pageSizeOptions: [20, 40, 60, 80],
                showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
                onChange: (page, size) => {
                  let query = investorTypeFacade.query;
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
