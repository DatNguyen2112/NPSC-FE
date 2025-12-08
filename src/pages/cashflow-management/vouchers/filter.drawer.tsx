import { Button, DatePicker, Drawer, Form, Select, Space, Tag } from 'antd';
import React, { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { CashBookTransactionFormFilter, CodeTypeFacade, CodeTypeModel, CashbookTransactionFacade } from '@store';
import type { SelectProps } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QueryParams } from '@models';
import isoWeek from 'dayjs/plugin/isoWeek';

type TagRender = SelectProps['tagRender'];

dayjs.extend(isoWeek);

const VouchersFilterModal = () => {
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const codeTypeFacade = CodeTypeFacade();
  const today = dayjs();
  const startOfMonth = today.startOf('month').format('YYYY-MM-DD');
  const endOfMonth = today.endOf('month').format('YYYY-MM-DD');

  useEffect(() => {
    codeTypeFacade.getPaymentMethods({ size: -1 });
  }, []);

  console.log(cashBookTransactionFacade.dateRange);
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
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
  const currentFilter = JSON.parse(filter ? filter : '{}');

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
    const fillQuery: QueryParams = { ...cashBookTransactionFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    cashBookTransactionFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    cashBookTransactionFacade.set({ query: props.query, ...props.setKeyState });
  };

  const handleClose = () => {
    cashBookTransactionFacade.set({ isFilterVoucher: false });
  };

  const onFinish = (values: any) => {
    const dataFilter = {
      ...currentFilter,
      ...values,
      dateRange: values.dateRange
        ? values.dateRange
        : [dayjs(startOfMonth, 'YYYY-MM-DD'), dayjs(endOfMonth, 'YYYY-MM-DD')],
      isActive: 'COMPLETED',
    };
    const query = JSON.stringify(dataFilter);
    onChangeDataTable({
      query: {
        page: Number(page),
        size: Number(size),
        filter: query,
      },
    });

    cashBookTransactionFacade.set({ isFilterVoucher: false, dateRange: dataFilter.dateRange });
    cashBookTransactionFacade.getTransactionSummary({ filter: query });
  };

  const tagRender: TagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="px-3 rounded-full"
        color={'#E6F4FF'}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        closeIcon={<CloseOutlined style={{ color: '#1890ff' }} />}
        style={{ marginInlineEnd: 4 }}
      >
        <span className="text-black text-sm">{label}</span>
      </Tag>
    );
  };

  return (
    <>
      <Drawer
        title={'Bộ lọc'}
        maskClosable={false}
        forceRender
        open={cashBookTransactionFacade.isFilterVoucher}
        onClose={handleClose}
        closeIcon={false}
        extra={<Button type={'text'} icon={<CloseOutlined />} onClick={handleClose} />}
        footer={
          <Space className={'flex justify-end'}>
            <Button onClick={() => form.resetFields()}>Reset bộ lọc</Button>
            <Button type={'primary'} onClick={form.submit}>
              Lọc
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout={'vertical'}
          onFinish={onFinish}
          fields={[
            {
              name: 'entityTypeCodes',
              value: currentFilter.entityTypeCodes ? currentFilter.entityTypeCodes : undefined,
            },
            {
              name: 'listPaymentMethodCode',
              value: currentFilter.listPaymentMethodCode ? currentFilter.listPaymentMethodCode : undefined,
            },
            {
              name: 'dateRange',
              value: currentFilter.dateRange
                ? [dayjs(currentFilter?.dateRange[0]), dayjs(currentFilter?.dateRange[1])]
                : undefined,
            },
            {
              name: 'listPurposeCode',
              value: currentFilter.listPurposeCode ? currentFilter.listPurposeCode : undefined,
            },
            {
              name: 'listReceiptCode',
              value: currentFilter.listReceiptCode ? currentFilter.listReceiptCode : undefined,
            },
          ]}
        >
          <Form.Item label={'Nhóm người nộp/nhận'} name={'entityTypeCodes'}>
            <Select
              placeholder={'Chọn nhóm người nộp/nhận'}
              mode="multiple"
              showSearch
              allowClear
              tagRender={tagRender}
              options={codeTypeFacade.entityGroup?.content?.map((item: CodeTypeModel) => ({
                label: item.title,
                value: item.code,
              }))}
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label={'Hình thức thanh toán'} name={'listPaymentMethodCode'}>
            <Select
              placeholder={'Chọn hình thức thanh toán'}
              mode="multiple"
              showSearch
              allowClear
              tagRender={tagRender}
              options={codeTypeFacade?.paymentMethods?.content?.map((item: CodeTypeModel) => ({
                label: item.title,
                value: item.code,
              }))}
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label={'Ngày tạo'} name={'dateRange'}>
            <DatePicker.RangePicker
              format="DD/MM/YYYY"
              className={'w-full'}
              presets={[
                {
                  label: <Tag color="processing">Hôm nay</Tag>,
                  value: [dayjs(today), dayjs(today)],
                },
                {
                  label: <Tag color="processing">Hôm qua</Tag>,
                  value: [dayjs(today).subtract(1, 'day'), dayjs(today).subtract(1, 'day')],
                },
                {
                  label: <Tag color="processing">Hôm kia</Tag>,
                  value: [dayjs(today).subtract(2, 'day'), dayjs(today).subtract(2, 'day')],
                },
                {
                  label: <Tag color="processing">Tuần trước</Tag>,
                  value: [
                    dayjs(today).subtract(1, 'week').startOf('isoWeek'),
                    dayjs(today).subtract(1, 'week').endOf('isoWeek'),
                  ],
                },
                {
                  label: <Tag color="processing">Tuần này</Tag>,
                  value: [dayjs(today).startOf('isoWeek'), dayjs(today).endOf('isoWeek')],
                },
                {
                  label: <Tag color="processing">Tháng trước</Tag>,
                  value: [
                    dayjs(today).subtract(1, 'month').startOf('month'),
                    dayjs(today).subtract(1, 'month').endOf('month'),
                  ],
                },
                {
                  label: <Tag color="processing">Tháng này</Tag>,
                  value: [dayjs(today).startOf('month'), dayjs(today).endOf('month')],
                },
              ]}
            />
          </Form.Item>
          <Form.Item label={'Loại phiếu thu'} name={'listPurposeCode'}>
            <Select
              allowClear
              showSearch
              optionFilterProp={'label'}
              mode={'multiple'}
              tagRender={tagRender}
              placeholder="Chọn loại phiếu thu"
              options={codeTypeFacade.purposeReceipts?.content?.map((item: CodeTypeModel) => ({
                label: item.title,
                value: item.code,
              }))}
            />
          </Form.Item>
          <Form.Item label={'Loại phiếu chi'} name={'listReceiptCode'}>
            <Select
              allowClear
              showSearch
              mode={'multiple'}
              tagRender={tagRender}
              optionFilterProp={'label'}
              placeholder="Chọn loại phiếu chi"
              options={codeTypeFacade.expenditurePurposes?.content?.map((item: CodeTypeModel) => ({
                label: item.title,
                value: item.code,
              }))}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default VouchersFilterModal;
