import { CaretDownOutlined, ExportOutlined, ImportOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { SubHeader } from '@layouts/admin';
import { QueryParams } from '@models';
import { SearchWidget } from '@pages/shared-directory/search-widget';
import { QuotationFacade, QuotationModel } from '@store';
import { lang, routerLinks, scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import { Button, DatePicker, Dropdown, Modal, Pagination, Select, Space, Spin, Table, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ExportFileQuotationModal from './ExportFileModal';

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
  const [modalApi, contextModalApi] = Modal.useModal();

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
      status: item.status ?? '',
      totalAmount: item.totalAmount,
      createdOnDate: item.createdOnDate,
    })) ?? [];

  // HANDLE NAVIGATE
  const handleDetail = (record: DataType) => {
    navigate(`/${lang}${routerLinks('Quotation')}/${record.id}/detail`);
  };

  const handleCreate = () => {
    quotationFacade.set({ isHiddenProductInputSearch: false });
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
  const handleSelectedDateRange = (date: any) => {
    //filter dateRange nếu dateRange không có giá trị thì lấy currentFilter và xóa dateRange
    if (!date) {
      currentFilter = JSON.parse(filter || '{}');
      delete currentFilter.dateRange;
    }
    //filter dateRange nếu dateRange có giá trị thì lấy currentFilter và gán dateRange
    else {
      currentFilter = JSON.parse(filter || '{}');
      currentFilter.dateRange = [dayjs(date[0]).format('YYYY-MM-DD'), dayjs(date[1]).format('YYYY-MM-DD')];
    }
    //query
    fillQuery = {
      page: 1,
      size: 20,
      filter: JSON.stringify(currentFilter),
    };
    onChangeDataTable({ query: fillQuery });
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

  // handle Open Export File Modal
  const handleOpenExportFileModal = () => {
    quotationFacade.set({ isExportFileModalQuotation: true });
  };

  const column: ColumnsType<DataType> = [
    {
      title: 'STT',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      align: 'center',
      width: 60,
      fixed: 'left',
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 190,
      fixed: 'left',
      render: (code, record) => (
        <Tooltip title={'Xem chi tiết báo giá'}>
          <Link className="hover:underline" to={`/${lang}${routerLinks('Quotation')}/${record.id}/detail`}>
            {code}
          </Link>
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
      title: 'Giá trị',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      width: 130,
      render: (totalAmount) => <p>{totalAmount?.toLocaleString()}</p>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 155,
      align: 'center',
      fixed: 'right',
      render: (status) => (
        <Tag
          className="px-3.5 py-0.5 rounded-full text-sm"
          color={
            (status === 'DRAFT' && 'default') ||
            (status === 'PENDING_APPROVAL' && 'processing') ||
            (status === 'INTERNAL_APPROVAL' && 'warning') ||
            (status === 'CUSTOMER_APPROVED' && 'success') ||
            (status === 'CANCELLED' && 'error') ||
            'default'
          }
        >
          {(status === 'DRAFT' && 'Nháp') ||
            (status === 'PENDING_APPROVAL' && 'Chờ duyệt') ||
            (status === 'INTERNAL_APPROVAL' && 'Duyệt nội bộ') ||
            (status === 'CUSTOMER_APPROVED' && 'Khách hàng duyệt') ||
            (status === 'CANCELLED' && 'Hủy')}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      key: 'createdOnDate',
      width: 150,
      render: (createdOnDate) => <p>{dayjs(createdOnDate).format('DD/MM/YYYY HH:mm:ss')}</p>,
    },
    {
      title: 'Thao tác',
      key: 'operation',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: '1',
                  label: (
                    <a onClick={() => handleEdit(record)} className="text-gray-900 hover:!text-blue-500">
                      Cập nhật
                    </a>
                  ),
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Tooltip title={'Xem chi tiết báo giá'}>
                  <Link className="hover:underline" to={`/${lang}${routerLinks('Quotation')}/${record.id}/detail`}>
                    Xem chi tiết
                  </Link>
                </Tooltip>
                <CaretDownOutlined />
              </Space>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Spin spinning={quotationFacade.isLoading}>
        {contextModalApi}
        <div className="px-8 pb-10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between h-14">
            <div>
              <Button className="font-medium" type="text" icon={<ExportOutlined />} onClick={handleOpenExportFileModal}>
                Xuất file
              </Button>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Tạo báo giá
            </Button>
          </div>
          <div className="bg-white px-4 pb-2">
            <Table
              title={() => (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <SearchWidget
                        placeholder="Tìm theo mã phiếu, tên công ty, số điện thoại"
                        form={(form) => (formRef.current = form)}
                        callback={onChangeSearch}
                      />
                    </div>
                    <div className="space-x-3">
                      <DatePicker.RangePicker
                        style={{ width: 250 }}
                        format={'DD/MM/YYYY'}
                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        onChange={handleSelectedDateRange}
                      />
                      <Select
                        className="w-44"
                        placeholder={'Chọn loại báo giá'}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        options={[
                          {
                            label: 'Báo giá vật tư',
                            value: 'QuotationMaterial',
                          },
                          {
                            label: 'Báo giá sản phẩm',
                            value: 'QuotationProduct',
                          },
                        ]}
                        onChange={handleSelectedQuoteTypeClick}
                      />
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
              scroll={{ y: 55 * 11 }}
              columns={column}
              pagination={false}
            />
          </div>
        </div>
        {quotationFacade.isExportFileModalQuotation && <ExportFileQuotationModal />}
      </Spin>
    </>
  );
};

export default Page;
