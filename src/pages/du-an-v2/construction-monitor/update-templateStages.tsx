import { CloseOutlined, HolderOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ToolTip } from '@core/tooltip';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConstructionFacade, ConstructionModel, EStatusConstruction, TemplateStage } from '@store';
import { uuidv4 } from '@utils';
import {
  App,
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import React, { useContext, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import dayjs from 'dayjs';

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

export const UpdateTemplateStagesModal = () => {
  const { modal } = App.useApp();
  const constructionFacade = ConstructionFacade();
  const { id: constructionId = '' } = useParams();

  console.log(constructionFacade.data);

  useEffect(() => {
    formUpdateStages.setFieldsValue({
      templateStages: constructionFacade.templateStages?.map((item: TemplateStage) => ({
        ...item,
        expiredDate: dayjs(item?.expiredDate),
      })),
    });
  }, []);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      formUpdateStages.setFieldsValue({
        templateStages: arrayMove(
          formUpdateStages.getFieldValue('templateStages'),
          formUpdateStages
            .getFieldValue('templateStages')
            .findIndex((stage: any, index: number) => index === active?.id),
          formUpdateStages.getFieldValue('templateStages').findIndex((stage: any, index: number) => index === over?.id),
        ),
      });
    }
  };
  const [formUpdateStages] = Form.useForm();

  useEffect(() => {
    switch (constructionFacade.status) {
      case EStatusConstruction.putTemplateStagesFulfilled:
        handleClose();
        constructionFacade.getById({
          id: constructionFacade.data?.id,
        });
        constructionFacade.getTemplateStages(constructionId);
        break;
    }
  }, [constructionFacade.status]);

  const onFinish = (values: ConstructionModel) => {
    const updatedTemplateStages = (values?.templateStages || []).map((stage: any, index: number) => ({
      ...stage,
      stepOrder: index + 1,
      id: stage?.id || uuidv4(),
      expiredDate: dayjs(stage?.expiredDate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
    }));
    constructionFacade.putTemplateStages(constructionFacade.data?.id, updatedTemplateStages);
  };
  const handleClose = () => {
    formUpdateStages.resetFields();
    constructionFacade.set({ isUpdateTemplateStagesModal: false });
  };
  const isDisable = (index: number) => {
    let isDisable = false;

    const arr = constructionFacade?.data?.tasks?.filter(
      (item: any) => item?.templateStageId == formUpdateStages.getFieldValue('templateStages')[index]?.id,
    );

    if (arr.some((item: any) => item?.status != 'NotStarted')) {
      isDisable = true;
    }

    return isDisable;
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            wireframe: true,
          },
        },
      }}
    >
      <Modal
        title="Chỉnh sửa giai đoạn"
        width={900}
        open={constructionFacade.isUpdateTemplateStagesModal}
        okText="Lưu lại"
        cancelButtonProps={{ hidden: true }}
        okButtonProps={{ icon: <SaveOutlined /> }}
        onOk={formUpdateStages.submit}
        onCancel={() => handleClose()}
        centered
        confirmLoading={constructionFacade.isFormLoading}
      >
        <Spin spinning={constructionFacade.isFormLoading}>
          <Form
            form={formUpdateStages}
            layout={'vertical'}
            onFinish={onFinish}
            className="max-h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
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
                            footer={() => (
                              <Button className="w-full" icon={<PlusOutlined />} onClick={() => add()}>
                                Thêm giai đoạn
                              </Button>
                            )}
                            dataSource={templateStages}
                            // scroll={{ x: 100, y: 55 * 5 }}
                            pagination={false}
                          >
                            <Table.Column
                              className="!p-0.5"
                              align={'center'}
                              width={28}
                              render={() => <DragHandle />}
                            />
                            <Table.Column
                              className="!p-0.5"
                              title={'Bước'}
                              dataIndex={'stepOrder'}
                              align={'center'}
                              width={28}
                              render={(_, __, index) => <p>{index + 1}</p>}
                            />
                            <Table.Column
                              className="!p-2"
                              title="Tên giai đoạn"
                              dataIndex={'name'}
                              width={150}
                              render={(value, record, index) => (
                                <Form.Item
                                  className="!mb-0"
                                  name={[index, 'name']}
                                  rules={[{ required: true, message: 'Tên giai đoạn là bắt buộc!' }]}
                                >
                                  <Input autoFocus className="w-full" placeholder="Nhập tên giai đoạn" />
                                </Form.Item>
                              )}
                            />
                            <Table.Column
                              className="!p-2"
                              title="Mô tả"
                              dataIndex={'description'}
                              width={150}
                              render={(value, record, index) => (
                                <Form.Item className="!mb-0" name={[index, 'description']}>
                                  <Input className="w-full" placeholder="Nhập mô tả" />
                                </Form.Item>
                              )}
                            />
                            <Table.Column
                              className="!p-2"
                              title="Hạn dự kiến hoàn thành"
                              dataIndex={'expiredDate'}
                              width={150}
                              render={(value, record, index) => (
                                <Form.Item className="!mb-0" name={[index, 'expiredDate']}>
                                  <DatePicker
                                    defaultValue={null}
                                    format={'DD/MM/YYYY'}
                                    className="w-full"
                                    placeholder="Chọn hạn dự kiến hoàn thành"
                                  />
                                </Form.Item>
                              )}
                            />
                            <Table.Column
                              className="!p-2"
                              align="center"
                              dataIndex={'isDone'}
                              width={60}
                              fixed="right"
                              render={(value, record, index) => (
                                <Space>
                                  {formUpdateStages.getFieldValue('templateStages')[index]?.isDone ||
                                  isDisable(index) ? (
                                    <Tooltip title="Giai đoạn này có công việc đang hoặc đã thực hiện">
                                      <Button
                                        type="link"
                                        disabled
                                        icon={<CloseOutlined className={'cursor-default'} />}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <ToolTip title={'Xóa'}>
                                      <Button
                                        type="link"
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() => {
                                          modal.confirm({
                                            title: 'Xác nhận xóa giai đoạn',
                                            content:
                                              'Bạn có chắc chắn muốn xóa giai đoạn này? Thao tác này khi lưu sẽ xóa giai đoạn và các công việc trong giai đoạn đó. Thao tác này không thể khôi phục.',
                                            okText: 'Xác nhận',
                                            okType: 'danger',
                                            okButtonProps: {
                                              type: 'primary',
                                            },
                                            onOk() {
                                              remove(index);
                                            },
                                          });
                                        }}
                                      />
                                    </ToolTip>
                                  )}
                                </Space>
                              )}
                            />
                          </Table>
                        </SortableContext>
                      </DndContext>
                    </>
                  )}
                </Form.List>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    </ConfigProvider>
  );
};
