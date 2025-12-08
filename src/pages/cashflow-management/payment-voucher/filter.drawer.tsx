import { Button, Drawer, Form, Select, Space, Tag } from 'antd';
import React, { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import {
  CodeTypeFacade,
  CodeTypeManagement,
  CodeTypeModel,
  ProjectFacade,
  CashbookTransactionFacade,
  CashbookTransactionModel,
  CashBookTransactionFormFilter,
} from '@store';
import type { SelectProps } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { QueryParams } from '@models';
import { useNavigate, useSearchParams } from 'react-router-dom';

type TagRender = SelectProps['tagRender'];

let fillQuery: QueryParams;
let defaultStartDate: string;
let defaultEndDate: string;
dayjs.extend(isoWeek);

const FilterPaymentVoucher = () => {
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const codeTypeFacade = CodeTypeFacade();
  const projectFacade = ProjectFacade();

  useEffect(() => {
    codeTypeFacade.getPaymentMethods({ size: -1 });
    codeTypeFacade.getExpenditurePurposes({ size: -1 });
    projectFacade.get({ size: -1 });
  }, []);

  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const filter = searchParams.get('filter');
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const sort = searchParams.get('sort');
  let filterObj = JSON.parse(searchParams.get('filter') || '{}');
  const handleClose = () => {
    cashBookTransactionFacade.set({ isFilterPaymentVoucher: false });
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
    fillQuery = { ...cashBookTransactionFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    cashBookTransactionFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>)?.toString() },
      { replace: true },
    );
    // eslint-disable-next-line react/prop-types
    cashBookTransactionFacade.set({ query: props.query, ...props.setKeyState });
  };

  const onFinish = (values: CashBookTransactionFormFilter) => {
    filterObj = {
      ...filterObj,
      isActive: values.isActive,
      listPaymentMethodCode: values.listPaymentMethodCode,
      listPurposeCode: values.listPurposeCode,
      projectId: values.projectId,
    }
    delete filterObj.createdOnDate;
    const query: QueryParams = {
      page: 1,
      size: 20,
      filter: JSON.stringify(filterObj),
    };

    onChangeDataTable({ query });
    cashBookTransactionFacade.set({ isFilterPaymentVoucher: false });
  };

  const tagRender: TagRender = (props) => {
    const { label, closable, onClose } = props;
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
        open={cashBookTransactionFacade.isFilterPaymentVoucher}
        onClose={handleClose}
        closeIcon={false}
        extra={<Button type={'text'} icon={<CloseOutlined />} onClick={handleClose} />}
        footer={
          <Space className={'flex justify-end'}>
            <Button danger onClick={() => form.resetFields()}>
              Xóa bộ lọc
            </Button>
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
          fields={[{ name: 'isActive', value: filterObj.isActive !== 'all' ? filterObj.isActive : undefined }]}
        >
          <Form.Item label={'Hình thức thanh toán'} name={'listPaymentMethodCode'}>
            <Select
              placeholder={'Chọn hình thức thanh toán'}
              allowClear
              showSearch
              optionFilterProp={'label'}
              mode={'multiple'}
              // tagRender={tagRender}
              options={
                codeTypeFacade?.paymentMethods?.content?.map((item: CodeTypeManagement) => ({
                  label: item.title,
                  value: item.code,
                })) ?? []
              }
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label={'Dự án'} name={'projectId'}>
            <Select
              placeholder={'Chọn dự án'}
              showSearch
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase()) ||
                option?.name?.toLowerCase().includes(input.toLowerCase())
              }
              options={projectFacade.pagination?.content?.map((item) => ({
                label: item.tenDuAn,
                value: item.id,
              }))}
            />
          </Form.Item>
          {/*<Form.Item label={'Ngày tạo'} name={'createdOnDate'}>*/}
          {/*  <Select*/}
          {/*    placeholder={'Chọn ngày tạo'}*/}
          {/*    showSearch*/}
          {/*    allowClear*/}
          {/*    options={[*/}
          {/*      {*/}
          {/*        label: 'Hôm nay',*/}
          {/*        value: 'homNay',*/}
          {/*      },*/}
          {/*      {*/}
          {/*        label: 'Hôm qua',*/}
          {/*        value: 'homQua',*/}
          {/*      },*/}
          {/*      {*/}
          {/*        label: 'Tuần trước',*/}
          {/*        value: 'tuanTruoc',*/}
          {/*      },*/}
          {/*      {*/}
          {/*        label: 'Tuần này',*/}
          {/*        value: 'tuanNay',*/}
          {/*      },*/}
          {/*      {*/}
          {/*        label: 'Tháng trước',*/}
          {/*        value: 'thangTruoc',*/}
          {/*      },*/}
          {/*      {*/}
          {/*        label: 'Tháng này',*/}
          {/*        value: 'thangNay',*/}
          {/*      },*/}
          {/*    ]}*/}
          {/*    filterOption={(input: string, option?: { label?: string; value?: string }) =>*/}
          {/*      (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())*/}
          {/*    }*/}
          {/*  />*/}
          {/*</Form.Item>*/}
          <Form.Item label={'Loại phiếu'} name={'listPurposeCode'}>
            <Select
              allowClear
              showSearch
              mode={'multiple'}
              optionFilterProp={'label'}
              placeholder="Chọn loại phiếu chi"
              options={codeTypeFacade.expenditurePurposes?.content?.map((item: CodeTypeModel) => ({
                label: item.title,
                value: item.code,
              }))}
            />
          </Form.Item>
          <Form.Item label={'Trạng thái'} name={'isActive'}>
            <Select
              placeholder={'Chọn trạng thái'}
              // mode="multiple"
              showSearch
              allowClear
              tagRender={tagRender}
              options={[
                {
                  label: 'Hoàn thành',
                  value: 'COMPLETED',
                },
                {
                  label: 'Đã hủy',
                  value: 'CANCELED',
                },
                {
                  label: 'Nháp',
                  value: 'WAIT_TRANSFER',
                },
              ]}
              filterOption={(input: string, option?: { label?: string; value?: string }) =>
                (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default FilterPaymentVoucher;
