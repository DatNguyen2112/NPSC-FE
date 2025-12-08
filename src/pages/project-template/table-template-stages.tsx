import { CloseOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { ToolTip } from '@core/tooltip';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Form, FormInstance, Input, Table } from 'antd';
import React, { useContext, useMemo } from 'react';

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
interface TableTemplateStagesProps {
  projectTemplateForm: FormInstance<any>;
  taskFields: any[];
  addTask: () => void;
  removeTask: (name: any) => void;
  stageIndex: number;
}

const TableTemplateStages: React.FC<TableTemplateStagesProps> = ({
  projectTemplateForm,
  taskFields,
  addTask,
  removeTask,
  stageIndex,
}) => {
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const templateStages = projectTemplateForm.getFieldValue('templateStages');
      const tasks = templateStages[stageIndex]?.tasks || [];
      const oldIndex = tasks.findIndex((_: any, idx: number) => idx === active?.id);
      const newIndex = tasks.findIndex((_: any, idx: number) => idx === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        templateStages[stageIndex] = {
          ...templateStages[stageIndex],
          tasks: newTasks,
        };
        projectTemplateForm.setFieldsValue({
          templateStages,
        });
      }
    }
  };

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={taskFields.map((i: any) => i.key)} strategy={verticalListSortingStrategy}>
        <Table
          components={{ body: { row: rowTable } }}
          dataSource={taskFields}
          pagination={false}
          rowKey="key"
          columns={[
            { className: '!p-0.5 bg-neutral-50', width: 60, align: 'center' },
            {
              width: 60,
              align: 'center',
              className: '!p-0.5',
              render: () => <DragHandle />,
            },
            {
              title: 'STT',
              render: (_, __, index) => index + 1,
              width: 60,
              align: 'center',
              className: '!p-0.5',
            },
            {
              title: 'Tên',
              className: '!p-2',
              render: (_, taskField) => (
                <Form.Item name={[taskField.name, 'name']} rules={[{ required: true, message: 'Nhập tên công việc' }]}>
                  <Input placeholder="Tên công việc" />
                </Form.Item>
              ),
            },
            {
              title: 'Mô tả',
              className: '!p-2',
              render: (_, taskField) => (
                <Form.Item name={[taskField.name, 'description']}>
                  <Input placeholder="Mô tả" />
                </Form.Item>
              ),
            },
            {
              width: 50,
              className: '!p-2',
              render: (_, taskField) => (
                <ToolTip title={'Xóa'}>
                  <Button type="link" danger icon={<CloseOutlined />} onClick={() => removeTask(taskField.name)} />
                </ToolTip>
              ),
            },
          ]}
          footer={() => (
            <Button type="dashed" onClick={() => addTask()} icon={<PlusOutlined />} block>
              Thêm công việc
            </Button>
          )}
        />
      </SortableContext>
    </DndContext>
  );
};
export default TableTemplateStages;
