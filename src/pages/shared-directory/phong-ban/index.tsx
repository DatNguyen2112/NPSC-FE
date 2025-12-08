import { DeleteOutlined, EditOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import {
  ChartOfAccountCodeTypeManagementFacade,
  CodeTypeFacade,
  CodeTypeManagement,
  CodeTypeManagementFacade,
  RightMapRoleFacade,
} from '@store';
import type { MenuProps } from 'antd';
import { Button, Card, ConfigProvider, Flex, Form, Modal, Space, Table, Tooltip, Typography } from 'antd';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CreateModal from './CreateModal';
import EditModal from './EditModal';
import './index.less';

type MenuItem = Required<MenuProps>['items'][number];
interface DataType extends CodeTypeManagement {
  key?: React.Key;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const RowContext = React.createContext<RowContextProps>({});

const RowDrag: React.FC<RowProps> = (props) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

export default function ChartOfAccountsPage() {
  const chartOfAccountCodeTypeManagementFacade = ChartOfAccountCodeTypeManagementFacade();
  const codeTypeManagementFacade = CodeTypeManagementFacade();
  const codeTypeFacade = CodeTypeFacade();
  const rightMapRoleFacade = RightMapRoleFacade();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizationData, setOrganizationData] = useState<any>([]);
  const [chartOfAccountForm] = Form.useForm();

  const navigate = useNavigate();
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
  if (!parsedFilter.type) {
    parsedFilter.type = 'purposeReceipt';
  }

  useEffect(() => {
    rightMapRoleFacade.getRightMapByListCode('CODETYPE');
    // onChangeDataTable({ query: { page, size, filter: JSON.stringify({ ...parsedFilter }) } });
    // chartOfAccountCodeTypeManagementFacade.get({ size: -1 });

    codeTypeFacade.getOrganizationStructure({ size: -1, sort: 'ASC' });
  }, []);

  useEffect(() => {
    if (codeTypeFacade?.organizationData?.content?.length) {
      setOrganizationData(codeTypeFacade?.organizationData.content);
    }
  }, [codeTypeFacade?.organizationData?.content]);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.putFulfilled:
        codeTypeManagementFacade.set({ isVisibleFormCOA: false, id: undefined });
        codeTypeFacade.getOrganizationStructure({ size: -1, sort: 'ASC' });
        break;
      case EStatusState.postFulfilled:
        codeTypeManagementFacade.set({ isCreateCodeType: false, id: undefined });
        codeTypeFacade.getOrganizationStructure({ size: -1, sort: 'ASC' });
        break;
      case EStatusState.deleteFulfilled:
        codeTypeFacade.getOrganizationStructure({ size: -1, sort: 'ASC' });
        break;
    }
  }, [codeTypeManagementFacade.status]);

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
    codeTypeFacade.getOrganizationStructure(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    codeTypeManagementFacade.set({ query: props.query, ...props.setKeyState });
  };

  const DragHandle: React.FC = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ cursor: 'move' }}
        disabled={codeTypeManagementFacade?.pagination?.totalElements === 1}
        ref={setActivatorNodeRef}
        {...listeners}
      />
    );
  };

  // const menuItems: DataType[] =
  //   chartOfAccountCodeTypeManagementFacade.pagination?.content.map((item: DataType) => ({
  //     label: item.title,
  //     key: item.code,
  //   })) ?? [];

  const handleClickMenuItems = (key: string) => {
    parsedFilter.type = key;
    onChangeDataTable({
      query: {
        page: 1,
        size,
        filter: JSON.stringify({ ...parsedFilter }),
      },
    });
  };

  // const renderTitle = () => {
  //   switch (parsedFilter.type) {
  //     case 'purposeReceipt':
  //       return 'Mục đích thu';
  //     case 'EXPENDITURE_PURPOSE':
  //       return 'Mục đích chi';
  //     case 'EQUITY':
  //       return 'Vốn chủ sở hữu';
  //   }
  // };

  // const renderDesc = () => {
  //   switch (parsedFilter.type) {
  //     case 'purposeReceipt':
  //       return 'Sử dụng để theo dõi doanh thu bán hàng cho khách hàng hoặc các khoản thu nhập khác bên ngoài hoạt động kinh doanh';
  //     case 'EXPENDITURE_PURPOSE':
  //       return 'Sử dụng để theo dõi tất cả các chi phí kinh doanh của bạn';
  //     case 'EQUITY':
  //       return 'Được sử dụng để theo dõi vốn chủ sở hữu của bạn';
  //   }
  // };

  const handleDelete = (id: string) => {
    modalApi.confirm({
      width: 600,
      title: `Bạn có chắc chắn muốn xóa phân loại này?`,
      content: 'Thao tác này sẽ xóa vĩnh viễn phân loại cha và các phân loại con của nó',
      onOk: () => {
        id && codeTypeManagementFacade.delete(id);
      },
      onCancel: () => {},
      okText: 'Xác nhận',
      okButtonProps: { type: 'primary', danger: true },
      cancelText: 'Huỷ bỏ',
      cancelButtonProps: { type: 'default' },
    });
  };

  const onDragEnd = (index: number, event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active?.id === over?.id) return;

    const currentCodeTypeItems = organizationData[index]?.codeTypeItems ?? [];

    const oldIndex = currentCodeTypeItems.findIndex((x: any) => x.id === active?.id);
    const newIndex = currentCodeTypeItems.findIndex((x: any) => x.id === over?.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updatedItems = arrayMove(currentCodeTypeItems, oldIndex, newIndex);
    const updatedData = [...organizationData];

    updatedData[index] = {
      ...updatedData[index],
      codeTypeItems: updatedItems,
    };

    if (updatedData) {
      codeTypeManagementFacade.put({
        title: updatedData[index]?.title,
        codeTypeItems: updatedData[index]?.codeTypeItems?.map((item: any) => ({
          code: item?.code,
          title: item?.title,
          iconClass: item?.iconClass,
        })) as any,
        id: updatedData[index]?.id,
      });
    }

    setOrganizationData(updatedData);
  };

  return (
    <>
      {contextModalApi}
      <SubHeader />
      <div className={'w-[1200px] m-auto p-2'}>
        <Flex className="px-5 mt-5" vertical gap={1.5}>
          <Card loading={codeTypeManagementFacade.isLoading} id="table-list" size="small" variant="borderless">
            <div className="flex justify-between items-center">
              <Typography.Title level={4}>Cơ cấu tổ chức XNTV</Typography.Title>
              <Button
                className="mb-4"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => codeTypeManagementFacade.set({ isCreateCodeType: true, isEdit: false })}
              >
                Thêm mới
              </Button>
            </div>

            {organizationData?.map((item: CodeTypeManagement, index: number) => {
              const dataSource = item?.codeTypeItems?.map((item) => ({
                key: item.id as string,
                title: item.title,
                code: item.code,
                iconClass: item.iconClass,
              }));
              return (
                <DndContext
                  modifiers={[restrictToVerticalAxis]}
                  key={item.id}
                  onDragEnd={(e) => {
                    onDragEnd(index, e);
                  }}
                >
                  <SortableContext items={dataSource?.map((i) => i.key) ?? []} strategy={verticalListSortingStrategy}>
                    <ConfigProvider
                      renderEmpty={() => <Typography.Text type="secondary">Chưa có dữ liệu</Typography.Text>}
                    >
                      <Table
                        size="small"
                        components={{ body: { row: RowDrag } }}
                        rowKey={'key'}
                        pagination={false}
                        showHeader={false}
                        title={() => (
                          <Flex justify="space-between" align="center">
                            <Typography.Text className="uppercase">{item.title}</Typography.Text>

                            {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('UPDATE') ? (
                              <div className="flex justify-end">
                                <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                                  <Button
                                    disabled={true}
                                    hidden={(item.codeTypeItems ?? [])?.length === 0}
                                    type="link"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                      codeTypeManagementFacade.set({
                                        isVisibleFormCOA: true,
                                        isEdit: true,
                                        id: item.id,
                                      });
                                      chartOfAccountForm.setFieldsValue({
                                        codeTypeItems: item?.codeTypeItems,
                                      });
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                                  <Button
                                    disabled={true}
                                    hidden={(item.codeTypeItems ?? [])?.length === 0}
                                    type="link"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                      handleDelete(item?.id as string);
                                    }}
                                  />
                                </Tooltip>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <Tooltip title="Chỉnh sửa">
                                  <Button
                                    hidden={(item.codeTypeItems ?? [])?.length === 0}
                                    type="link"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                      codeTypeManagementFacade.set({
                                        isVisibleFormCOA: true,
                                        isEdit: true,
                                        id: item.id,
                                      });
                                      chartOfAccountForm.setFieldsValue({
                                        codeTypeItems: item?.codeTypeItems,
                                      });
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip title="Xoá">
                                  <Button
                                    hidden={(item.codeTypeItems ?? [])?.length === 0}
                                    type="link"
                                    size="small"
                                    icon={<DeleteOutlined className="text-[#FF4D4F]" />}
                                    onClick={() => {
                                      handleDelete(item?.id as string);
                                    }}
                                  />
                                </Tooltip>
                              </div>
                            )}
                          </Flex>
                        )}
                        columns={[
                          { key: 'sort', align: 'center', width: 60, render: () => <DragHandle /> },
                          {
                            title: 'Tên',
                            dataIndex: 'title',
                            key: 'title',
                            width: '60%',
                            render: (value, record) => (
                              <Space>
                                <i className={`la-lg ${record?.iconClass}`}></i>
                                <Typography.Text>{value}</Typography.Text>
                              </Space>
                            ),
                          },
                          {
                            title: 'Mã',
                            dataIndex: 'code',
                            key: 'code',
                          },
                        ]}
                        dataSource={dataSource}
                        footer={() =>
                          !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('ADD') ? (
                            <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                              <Button
                                disabled={true}
                                size="small"
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={() =>
                                  codeTypeManagementFacade.set({ isVisibleFormCOA: true, isEdit: false, id: item.id })
                                }
                              >
                                Thêm mới
                              </Button>
                            </Tooltip>
                          ) : (
                            <Button
                              size="small"
                              type="link"
                              icon={<PlusOutlined />}
                              onClick={() =>
                                codeTypeManagementFacade.set({ isVisibleFormCOA: true, isEdit: false, id: item.id })
                              }
                            >
                              Thêm mới
                            </Button>
                          )
                        }
                      />
                    </ConfigProvider>
                  </SortableContext>
                </DndContext>
              );
            })}
          </Card>
        </Flex>
      </div>
      {codeTypeManagementFacade.isVisibleFormCOA && <EditModal chartOfAccountForm={chartOfAccountForm} />}
      {codeTypeManagementFacade.isCreateCodeType && <CreateModal />}
    </>
  );
}
