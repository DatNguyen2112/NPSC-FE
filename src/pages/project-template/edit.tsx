import { CloseOutlined, HolderOutlined, LeftOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ToolTip } from '@core/tooltip';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EStatusState } from '@models';
import { ProjectTemplateFacade, ProjectTemplateModel } from '@store';
import { lang, routerLinks } from '@utils';
import { Button, Card, Col, Flex, Form, Input, Row, Space, Spin, Table } from 'antd';
import React, { useContext, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import './index.less';
import TableTemplateStages from './table-template-stages';
interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}
const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      className="!bg-white"
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}
const rowTable: React.FC<RowProps> = (props) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    // transition,
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
export default function ProjectTemplateCreatePage() {
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      // setDataSource((prevState) => {
      //   const activeIndex = prevState.findIndex((record) => record.key === active?.id);
      //   const overIndex = prevState.findIndex((record) => record.key === over?.id);
      //   return arrayMove(prevState, activeIndex, overIndex);
      // });
      projectTemplateForm.setFieldsValue({
        templateStages: arrayMove(
          projectTemplateForm.getFieldValue('templateStages'),
          projectTemplateForm
            .getFieldValue('templateStages')
            .findIndex((stage: any, index: number) => index === active?.id),
          projectTemplateForm
            .getFieldValue('templateStages')
            .findIndex((stage: any, index: number) => index === over?.id),
        ),
      });
    }
  };
  const projectTemplateFacade = ProjectTemplateFacade();
  const navigate = useNavigate();
  const { id } = useParams();
  const [projectTemplateForm] = Form.useForm();

  useEffect(() => {
    if (id) projectTemplateFacade.getById({ id });
  }, []);

  useEffect(() => {
    switch (projectTemplateFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        navigate(`/${lang}${routerLinks('ProjectTemplate')}`);
        break;
      case EStatusState.getByIdFulfilled:
        projectTemplateForm.setFieldsValue(projectTemplateFacade.data);
        break;
    }
  }, [projectTemplateFacade.status]);

  const onFinish = (values: ProjectTemplateModel) => {
    if (id) projectTemplateFacade.put({ ...values, id });
    else projectTemplateFacade.post(values);
  };

  return (
    <Spin spinning={projectTemplateFacade.isFormLoading}>
      <Flex className={'bg-white h-12 sticky top-0 z-20 shadow-header'} justify="space-between" align="center">
        <Button
          color="default"
          variant="link"
          icon={<LeftOutlined />}
          href={`/#/${lang}${routerLinks('ProjectTemplate')}`}
        >
          Quay lại
        </Button>
        <Space size={'small'} className={'pr-4'}>
          <Button
            loading={projectTemplateFacade.isLoading}
            icon={<SaveOutlined />}
            type="primary"
            onClick={() => projectTemplateForm.submit()}
          >
            Lưu lại
          </Button>
        </Space>
      </Flex>
      <div id="template-stages" className="m-6 intro-x">
        <Form
          form={projectTemplateForm}
          initialValues={{
            templateStages: [
              {
                name: '',
                description: '',
                // tasks: [
                //   {
                //     name: '',
                //     description: '',
                //   },
                // ],
              },
            ],
          }}
          layout={'vertical'}
          onFinish={onFinish}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card size="small" title={'Thông tin chung'} variant="borderless">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Mã template" name="code" rules={[{ required: true }]}>
                      <Input placeholder="Nhập tên tài sản" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Tên template" name="name" rules={[{ required: true }]}>
                      <Input placeholder="Nhập tên tài sản" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Mô tả" name="description">
                      <Input.TextArea placeholder="Nhập mô tả" rows={2} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card
                size="small"
                title={'Chi tiết các giai đoạn thực hiện'}
                variant="borderless"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="my-1.5"
                    onClick={() =>
                      projectTemplateForm.setFieldsValue({
                        templateStages: [
                          ...projectTemplateForm.getFieldValue('templateStages'),
                          { name: '', description: '' },
                        ],
                      })
                    }
                  >
                    Thêm giai đoạn
                  </Button>
                }
              >
                <Form.List name={'templateStages'}>
                  {(templateStages, { add, remove }) => (
                    <>
                      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                        <SortableContext
                          items={templateStages.map((i) => i.key)}
                          strategy={verticalListSortingStrategy}
                        >
                          <Table
                            components={{ body: { row: rowTable } }}
                            dataSource={templateStages}
                            // scroll={{ x: 100, y: 55 * 5 }}
                            pagination={false}
                            // expandable={{
                            //   columnWidth: 60,
                            //   expandIconColumnIndex: 1,
                            //   expandedRowRender: (stage, stageIndex) => (
                            //     <Form.List name={[stage.name, 'tasks']}>
                            //       {(taskFields, { add: addTask, remove: removeTask }) => (
                            //         <TableTemplateStages
                            //           projectTemplateForm={projectTemplateForm}
                            //           taskFields={taskFields}
                            //           addTask={addTask}
                            //           removeTask={removeTask}
                            //           stageIndex={stageIndex}
                            //         />
                            //       )}
                            //     </Form.List>
                            //   ),
                            // }}
                            columns={[
                              {
                                className: '!p-0.5',
                                align: 'center',
                                width: 60,
                                render: () => <DragHandle />,
                              },
                              {
                                className: '!p-0.5',
                                title: 'STT',
                                dataIndex: 'stepOrder',
                                align: 'center',
                                width: 60,
                                render: (_, __, index) => <p>{index + 1}</p>,
                              },
                              {
                                className: '!p-2',
                                title: 'Tên giai đoạn',
                                dataIndex: 'name',
                                render: (value, record, index) => (
                                  <Form.Item
                                    className="!mb-0"
                                    name={[index, 'name']}
                                    rules={[{ required: true, message: 'Tên giai đoạn là bắt buộc!' }]}
                                  >
                                    <Input autoFocus className="w-full" placeholder="Nhập tên giai đoạn" />
                                  </Form.Item>
                                ),
                              },
                              {
                                className: '!p-2',
                                title: 'Mô tả',
                                dataIndex: 'description',
                                render: (value, record, index) => (
                                  <Form.Item className="!mb-0" name={[index, 'description']}>
                                    <Input className="w-full" placeholder="Nhập mô tả" />
                                  </Form.Item>
                                ),
                              },
                              {
                                width: 50,
                                className: '!p-2',
                                render: (value, record, index) => (
                                  <ToolTip title={'Xóa'}>
                                    <Button type="link" danger icon={<CloseOutlined />} onClick={() => remove(index)} />
                                  </ToolTip>
                                ),
                              },
                            ]}
                          />
                        </SortableContext>
                      </DndContext>
                    </>
                  )}
                </Form.List>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </Spin>
  );
}
