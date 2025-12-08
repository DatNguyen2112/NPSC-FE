import { QueryParams } from '@models';
import { QuotationFacade, QuotationModel } from '@store';
import { lang, routerLinks, scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { SubHeader } from '@layouts/admin';
import { Button, DatePicker, Pagination, Select, Space, Table, Tooltip } from 'antd';
import { EditOutlined, FilterFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { FormInstance } from 'antd/lib';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { RangePicker } = DatePicker;

interface DataType extends QuotationModel {
  key: string;
}

let currentFilter: any;
let fillQuery: QueryParams;
const Page: React.FC = () => {
  const quotationFacade = QuotationFacade();

  const navigate = useNavigate();
  const formRef = useRef<FormInstance | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const filter = searchParams.get('filter');
  const sort = searchParams.get('sort');

  useEffect(() => {
    quotationFacade.get({});
  }, []);

  const quotationData: DataType[] =
    quotationFacade?.pagination?.content?.map((item, index) => ({
      key: uuidv4(),
      index: index + 1,
      orderNumber:
        (Number(quotationFacade.pagination?.page ?? 0) - 1) * Number(quotationFacade.pagination?.size ?? 0) + index + 1,
      id: item.id,
      code: item.code ?? '',
      customerName: item.customerName ?? '',
      customerAddress: item.customerAddress ?? '',
      customerPhoneNumber: item.customerPhoneNumber ?? '',
      createdOnDate: item.createdOnDate,
    })) ?? [];

  // HANDLE NAVIGATE
  const handleDetail = (record: DataType) => {
    navigate(`/${lang}${routerLinks('Quotation')}/${record.id}/detail`);
  };

  const handleCreate = () => {
    navigate(`/${lang}${routerLinks('Quotation')}/create`);
  };

  const handleEdit = (record: QuotationModel) => {
    navigate(`/${lang}${routerLinks('Quotation')}/${record.id}/edit`);
  };

  // HANDLE SEARCH
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
    fillQuery = { ...quotationFacade.query, ...props.query };
    for (const key in fillQuery) {
      if (!fillQuery[key as keyof QueryParams]) delete fillQuery[key as keyof QueryParams];
    }
    quotationFacade.get(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>)?.toString() },
      { replace: true },
    );
    // eslint-disable-next-line react/prop-types
    quotationFacade.set({ query: props.query, ...props.setKeyState });
  };

  // HANDLE SELECTED DATE
  const handleSelectedCreateOnDateClick = (date: any) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    currentFilter = {
      ...currentFilter,
      dateRange: [dayjs(date[0]).format('YYYY-MM-DD'), dayjs(date[1]).format('YYYY-MM-DD')],
    };
    const query: QueryParams = {
      page: page ? Number(page) : 1,
      size: size ? Number(size) : 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query });
  };

  // HANDLE SELECTED QUOTE TYPE
  const handleSelectedQuoteTypeClick = (value: string) => {
    currentFilter = JSON.parse(searchParams.get('filter') || '{}');
    currentFilter.typeCode = value;
    const query: QueryParams = {
      page: page ? Number(page) : 1,
      size: size ? Number(size) : 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query });
  };

  const column: ColumnsType<DataType> = [
    {
      title: '#',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      align: 'center',
      width: 50,
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 155,
      render: (code, record) => (
        <Tooltip title={'Xem chi tiết'}>
          <a
            className="text-blue-500 hover:underline cursor-pointer"
            href={`/#/${lang}${routerLinks('Quotation')}/${record.id}/detail`}
            target="_blank"
            rel="noreferrer"
          >
            {code}
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Tên công ty',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 258,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'customerAddress',
      key: 'customerAddress',
      width: 258,
      ellipsis: { showTitle: true },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'customerPhoneNumber',
      key: 'customerPhoneNumber',
      width: 130,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      key: 'createdOnDate',
      width: 150,
      render: (createdOnDate) => <p>{dayjs(createdOnDate).format('DD/MM/YYYY HH:mm:00')}</p>,
    },
    {
      title: 'Thao tác',
      dataIndex: 'operation',
      key: 'operation',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={'Chỉnh sửa'}>
          <Button
            className="bg-[#D24400] hover:!bg-[#E55A1C]"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const tool = (
    <Space size={'middle'} className={'mx-4'}>
      <Button className="font-medium" type={'primary'} icon={<PlusOutlined />} onClick={() => handleCreate()}>
        Tạo báo giá
      </Button>
    </Space>
  );

  return (
    <>
      <SubHeader tool={tool} />
      <div className="bg-white mx-8 my-4">
        <Table
          title={() => (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <SearchWidget form={(form) => (formRef.current = form)} callback={onChangeSearch} />
                </div>
                <div className="space-x-3">
                  <RangePicker
                    style={{ width: 250 }}
                    format={'DD/MM/YYYY'}
                    placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                    onChange={handleSelectedCreateOnDateClick}
                  />
                  <Select
                    className="w-44"
                    placeholder={'Chọn loại báo giá'}
                    allowClear
                    showSearch
                    filterOption={(input: string, option?: { label?: string; value?: string }) =>
                      (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
                    }
                    optionLabelProp={'label'}
                    options={
                      [
                        {
                          label: 'Báo giá vật tư',
                          value: 'QuotationMaterial',
                        },
                        {
                          label: 'Báo giá sản phẩm',
                          value: 'QuotationProduct',
                        },
                      ] as any
                    }
                    onChange={handleSelectedQuoteTypeClick}
                  />
                  {/* <Button icon={<FilterFilled />} iconPosition="end">
                    Bộ lọc khác
                  </Button> */}
                  <Button
                    icon={<ReloadOutlined />}
                    loading={quotationFacade.isLoading}
                    onClick={() =>
                      quotationFacade.get({
                        filter: JSON.stringify(currentFilter || {}),
                      })
                    }
                  >
                    Tải lại
                  </Button>
                </div>
              </div>
            </>
          )}
          footer={() => (
            <Pagination
              className={'flex justify-end'}
              size="small"
              align="start"
              showSizeChanger
              current={quotationFacade?.query?.page}
              pageSize={quotationFacade?.pagination?.size}
              total={quotationFacade?.pagination?.totalElements}
              pageSizeOptions={[20, 40, 60, 80]}
              showTotal={(total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`}
              onChange={(page, pageSize) => {
                currentFilter = JSON.parse(searchParams.get('filter') || '{}');
                fillQuery = {
                  page,
                  size: pageSize,
                  filter: JSON.stringify(currentFilter),
                };
                onChangeDataTable({ query: fillQuery });
                scrollLeftWhenChanging('.ant-table-body');
                scrollTopWhenChanging('.ant-table-body');
              }}
            />
          )}
          dataSource={quotationData}
          columns={column}
          pagination={false}
        />
      </div>
    </>
  );
};

export default Page;
