import { SubHeader } from '@layouts/admin';
import { EStatusState, QueryParams } from '@models';
import { ChartOfAccountCodeTypeManagementFacade, CodeTypeManagement, CodeTypeManagementFacade } from '@store';
import { Col, Menu, Row, Card, Table, ConfigProvider, Typography, Flex, Button, Space, Form, Tooltip } from 'antd';
import React, { cloneElement, useContext, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './index.less';
import type { MenuProps } from 'antd';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { DeleteOutlined, EditOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { uuidv4 } from '@utils';
import EditModal from './EditModal';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [chartOfAccountForm] = Form.useForm();
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
  if (!parsedFilter.type) {
    parsedFilter.type = 'purposeReceipt';
  }

  useEffect(() => {
    onChangeDataTable({ query: { page, size, filter: JSON.stringify({ ...parsedFilter }) } });
    chartOfAccountCodeTypeManagementFacade.get({ size: -1 });
  }, []);

  useEffect(() => {
    switch (codeTypeManagementFacade.status) {
      case EStatusState.putFulfilled:
        codeTypeManagementFacade.set({ isVisibleFormCOA: false, id: undefined });
        onChangeDataTable({ query: { page, size, filter: JSON.stringify({ ...parsedFilter }) } });
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
    codeTypeManagementFacade.get(fillQuery);
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

  const menuItems: DataType[] =
    chartOfAccountCodeTypeManagementFacade.pagination?.content.map((item: DataType) => ({
      label: item.title,
      key: item.code,
    })) ?? [];

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

  const renderTitle = () => {
    switch (parsedFilter.type) {
      case 'purposeReceipt':
        return 'Mục đích thu';
      case 'EXPENDITURE_PURPOSE':
        return 'Mục đích chi';
      case 'EQUITY':
        return 'Vốn chủ sở hữu';
    }
  };

  const renderDesc = () => {
    switch (parsedFilter.type) {
      case 'purposeReceipt':
        return 'Sử dụng để theo dõi doanh thu bán hàng cho khách hàng hoặc các khoản thu nhập khác bên ngoài hoạt động kinh doanh';
      case 'EXPENDITURE_PURPOSE':
        return 'Sử dụng để theo dõi tất cả các chi phí kinh doanh của bạn';
      case 'EQUITY':
        return 'Được sử dụng để theo dõi vốn chủ sở hữu của bạn';
    }
  };

  return (
    <>
      <SubHeader />
      <div className="max-w-8xl mx-auto p-6">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card loading={chartOfAccountCodeTypeManagementFacade.isLoading} size="small" variant="borderless">
              <Menu
                inlineIndent={12}
                defaultSelectedKeys={[parsedFilter?.type]}
                forceSubMenuRender={true}
                mode={'inline'}
                items={menuItems as MenuItem[]}
                onClick={({ key }) => handleClickMenuItems(key)}
              />
            </Card>
          </Col>
          <Col span={18}>
            <Card loading={codeTypeManagementFacade.isLoading} id="table-list" size="small" variant="borderless">
              <Flex vertical className="mb-4">
                <Typography.Title level={4}>{renderTitle()}</Typography.Title>
                <Typography.Text type="secondary">{renderDesc()}</Typography.Text>
              </Flex>
              {codeTypeManagementFacade.pagination?.content.map((item: CodeTypeManagement, index: number) => {
                const dataSource = item?.codeTypeItems?.map((item) => ({
                  key: uuidv4(),
                  id: item.id,
                  title: item.title,
                  code: item.code,
                  iconClass: item.iconClass,
                }));
                return (
                  <DndContext modifiers={[restrictToVerticalAxis]} key={index}>
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
                            // {
                            //   title: 'Thao tác',
                            //   key: 'action',
                            //   width: 64,
                            //   render: () => (
                            //     <Space size="small" align="center">
                            //       <Button
                            //         type="text"
                            //         size="small"
                            //         icon={<EditOutlined />}
                            //         onClick={() =>
                            //           codeTypeManagementFacade.set({ isVisibleFormCOA: true, id: item.id })
                            //         }
                            //       />
                            //       <Button type="text" size="small" icon={<DeleteOutlined />} />
                            //     </Space>
                            //   ),
                            // },
                          ]}
                          dataSource={dataSource}
                          footer={() => (
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
                          )}
                        />
                      </ConfigProvider>
                    </SortableContext>
                  </DndContext>
                );
              })}
            </Card>
          </Col>
        </Row>
      </div>
      {codeTypeManagementFacade.isVisibleFormCOA && <EditModal chartOfAccountForm={chartOfAccountForm} />}
    </>
  );
}
