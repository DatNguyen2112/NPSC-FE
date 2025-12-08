import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { QueryParams } from '@models';
import { PriorityLevelMap, TaskFacade } from '@store';
import { Button, DatePicker, Drawer, Form, Select, Space } from 'antd';
import dayjs from 'dayjs';

const FilterDrawer = ({
  parsedFilter,
  onChangeDataTable,
}: {
  parsedFilter: any;
  onChangeDataTable: (props: { query?: QueryParams }) => void;
}) => {
  const taskFacade = TaskFacade();
  const [formFilter] = Form.useForm();
  const onFilter = (values: any) => {
    parsedFilter.priorityLevel = values.priorityLevel;
    if (values.dueDateRange) {
      parsedFilter.dueDateRange = [
        dayjs(values.dueDateRange[0]).add(1).format('YYYY-MM-DD'),
        dayjs(values.dueDateRange[1]).add(1).format('YYYY-MM-DD'),
      ];
    } else delete parsedFilter.dueDateRange;

    onChangeDataTable({
      query: {
        page: 1,
        filter: JSON.stringify(parsedFilter),
      },
    });
    taskFacade.set({ isFilter: false });
  };

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        icon={<FilterOutlined />}
        onClick={() => taskFacade.set({ isFilter: true })}
      >
        Bộ lọc
      </Button>
      <Drawer
        title={'Bộ lọc'}
        maskClosable={false}
        forceRender
        open={taskFacade.isFilter}
        onClose={() => taskFacade.set({ isFilter: false })}
        closeIcon={false}
        extra={<Button type={'text'} icon={<CloseOutlined />} onClick={() => taskFacade.set({ isFilter: false })} />}
        footer={
          <Space className={'flex justify-end'}>
            <Button onClick={() => formFilter.resetFields()} danger>
              Xóa bộ lọc
            </Button>
            <Button type={'primary'} onClick={formFilter.submit}>
              Lọc
            </Button>
          </Space>
        }
      >
        <Form
          form={formFilter}
          layout={'vertical'}
          onFinish={onFilter}
          fields={[
            {
              name: 'priorityLevel',
              value: parsedFilter?.priorityLevel,
            },
            {
              name: 'dueDateRange',
              value: parsedFilter?.dueDateRange && [
                dayjs(parsedFilter?.dueDateRange[0]),
                dayjs(parsedFilter?.dueDateRange[1]),
              ],
            },
          ]}
        >
          <Form.Item name={'priorityLevel'} label={'Độ ưu tiên'}>
            <Select
              placeholder="Chọn độ ưu tiên"
              allowClear
              showSearch
              optionFilterProp={'label'}
              options={Object.values(PriorityLevelMap).map((item) => ({
                label: item.label,
                value: item.value,
              }))}
            />
          </Form.Item>
          <Form.Item name={'dueDateRange'} label={'Hạn chót'}>
            <DatePicker.RangePicker
              className="w-full"
              allowClear
              format="DD/MM/YYYY"
              placeholder={['Hạn từ ngày', 'Đến ngày']}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default FilterDrawer;
