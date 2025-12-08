import { LeftOutlined, PrinterFilled } from '@ant-design/icons';
import PrintContent from '@pages/PrintContent/PrintContent';
import { ParameterFacade, QuotationFacade, QuotationItemModel, QuotationModel } from '@store';
import { formatVietnameseDate, lang, routerLinks, uuidv4 } from '@utils';
import { Button, Card, Col, Row, Space, Spin, Table, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useReactToPrint } from 'react-to-print';

const QuotationDetail: React.FC = () => {
  const parameterFacade = ParameterFacade();
  const quotationFacade = QuotationFacade();

  const navigate = useNavigate();
  const { id } = useParams();

  // Feature: In báo giá
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Quotation_${quotationFacade.data?.code}`,
    pageStyle: `
      * {
        font-family: "Times New Roman", Times, serif;
      }
    `,
  });

  useEffect(() => {
    parameterFacade.get({});
  }, []);

  useEffect(() => {
    if (id) {
      quotationFacade.getById({ id: id });
    }
  }, [id]);

  const quotationData: QuotationModel[] =
    quotationFacade.data?.quotationItem?.map((items: QuotationItemModel, index: number) => ({
      index: index + 1,
      id: items.id ?? '',
      key: uuidv4(),
      lineNumber: items.lineNumber,
      name: items.name,
      specifications: items.specifications,
      unit: items.unit,
      quantity: items.quantity,
      unitPrice: items.unitPrice,
      unitPriceDiscountAmount: items.unitPriceDiscountAmount,
      lineAmount: items.lineAmount,
      afterLineDiscountGoodsAmount: items.afterLineDiscountGoodsAmount,
    })) ?? [];

  // HANDLE CANCEL
  const onCancel = () => {
    navigate(`/${lang}${routerLinks('Quotation')}`);
  };

  const handleEditQuotation = () => {
    navigate(`/${lang}${routerLinks('Quotation')}/${id}/edit`);
  };

  const column: ColumnsType<QuotationModel> = [
    {
      title: '#',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      align: 'center',
      width: 40,
    },
    {
      title: 'Tên sản phẩm/vật tư',
      dataIndex: 'name',
      key: 'name',
      width: 256,
      ellipsis: true,
    },
    {
      title: 'Quy cách',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 225,
      ellipsis: true,
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 142,
      align: 'right',
      ellipsis: true,
      render: (unitPrice: number) => <p>{unitPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>,
    },
    {
      title: 'Chiết khấu',
      dataIndex: 'unitPriceDiscountAmount',
      key: 'unitPriceDiscountAmount',
      width: 130,
      align: 'right',
      ellipsis: true,
      render: (unitPriceDiscountAmount: number) => (
        <p>{unitPriceDiscountAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'afterLineDiscountGoodsAmount',
      key: 'afterLineDiscountGoodsAmount',
      width: 150,
      align: 'right',
      ellipsis: true,
      render: (afterLineDiscountGoodsAmount: number) => (
        <p>{afterLineDiscountGoodsAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'lineNote',
      key: 'lineNote',
      width: 150,
      ellipsis: true,
      render: (lineNote: string) => <p>{lineNote}</p>,
    },
  ];

  return (
    <>
      <Spin spinning={quotationFacade.isFormLoading}>
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            Quay lại danh sách báo giá
          </Button>
          <Space className={'pr-4'}>
            <Button type={'primary'} className={'font-medium'} onClick={handleEditQuotation}>
              Sửa báo giá
            </Button>
          </Space>
        </div>
        <div className="max-w-[1430px] mx-auto py-6 px-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-3 flex-col">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-medium">{quotationFacade.data?.code}</h1>
                <Tag
                  className="px-3.5 py-0.5 rounded-full text-sm"
                  color={
                    (quotationFacade.data?.status === 'DRAFT' && 'default') ||
                    (quotationFacade.data?.status === 'PENDING_APPROVAL' && 'processing') ||
                    (quotationFacade.data?.status === 'INTERNAL_APPROVAL' && 'warning') ||
                    (quotationFacade.data?.status === 'CUSTOMER_APPROVED' && 'success') ||
                    (quotationFacade.data?.status === 'CANCELLED' && 'error') ||
                    'default'
                  }
                >
                  {(quotationFacade.data?.status === 'DRAFT' && 'Nháp') ||
                    (quotationFacade.data?.status === 'PENDING_APPROVAL' && 'Chờ duyệt') ||
                    (quotationFacade.data?.status === 'INTERNAL_APPROVAL' && 'Duyệt nội bộ') ||
                    (quotationFacade.data?.status === 'CUSTOMER_APPROVED' && 'Khách hàng duyệt') ||
                    (quotationFacade.data?.status === 'CANCELLED' && 'Hủy')}
                </Tag>
              </div>
              <div>
                <Button className="font-semibold" icon={<PrinterFilled />} onClick={() => reactToPrintFn()}>
                  In báo giá
                </Button>
                {/* In báo giá */}
                <div className={'hidden'}>
                  {/* Truyền dữ liệu vào PrintContent */}
                  <PrintContent ref={contentRef}>
                    <div className="text-center mb-5">
                      <img className="mx-auto mb-2 h-16" src="/assets/images/logo-quotation.png" alt="Company Logo" />
                      <h1 className="text-lg font-semibold">MANH KHANH SERVICE AND TRADING COMPANY LIMITED</h1>
                      <p>Address: Lạc Nhuế - Thụy Hòa - Yên Phong - Bắc Ninh</p>
                      <p>Tax code: 2301147715 | Hotline: Mr. Son 0962.500.596 / 0983.191.402</p>
                    </div>
                    {/* Title */}
                    <div className="text-center my-3">
                      <h2 className="text-lg font-bold">PRICE QUOTATION</h2>
                      <h2 className="text-base font-bold">BẢNG BÁO GIÁ</h2>
                    </div>
                    {/*Thông tin khách hàng*/}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <h4 className="font-semibold min-w-max">Kính gửi:</h4>
                        <span>{quotationFacade.data?.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-semibold min-w-max">Mã số thuế:</h4>
                        {quotationFacade.data?.customerTaxCode ? (
                          <span>{quotationFacade.data?.customerTaxCode}</span>
                        ) : (
                          <span className="line-clamp-1">{'.'.repeat(300)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-semibold min-w-max">Địa chỉ:</h4>
                        {quotationFacade.data?.customerAddress ? (
                          <span>{quotationFacade.data?.customerAddress}</span>
                        ) : (
                          <span className="line-clamp-1">{'.'.repeat(300)}</span>
                        )}
                      </div>
                      {/* Thông tin dự án */}
                      <div className="flex items-center gap-1">
                        <h4 className="font-semibold min-w-max">Tên dự án:</h4>
                        {quotationFacade.data?.projectName ? (
                          <span>{quotationFacade.data?.projectName}</span>
                        ) : (
                          <span className="line-clamp-1">{'.'.repeat(300)}</span>
                        )}
                      </div>
                    </div>
                    {/*Thông tin sản phẩm*/}
                    <div className="mt-2 mb-6">
                      <span className="italic">
                        Lời đầu tiên, xin trân trọng cảm ơn quý khách hàng đã quan tâm đến sản phẩm của công ty chúng
                        tôi. Chúng tôi xin gửi đến quý khách hàng bảng báo giá như sau:
                      </span>
                      <h1 className="text-end italic">Đơn vị: VND</h1>
                      <table className="w-full border border-gray-300 text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border max-w-10 border-gray-300 p-1 text-center">#</th>
                            <th className="border max-w-36 border-gray-300 p-1 text-left">Tên hàng</th>
                            <th className="border max-w-32 border-gray-300 p-1 text-left">Quy cách</th>
                            <th className="border max-w-20 border-gray-300 p-1 text-left">ĐVT</th>
                            <th className="border max-w-12 border-gray-300 p-1 text-center">SL</th>
                            <th className="border max-w-20 border-gray-300 p-1 text-right">ĐG</th>
                            <th className="border max-w-24 border-gray-300 p-1 text-right">Chiết khấu</th>
                            <th className="border max-w-24 border-gray-300 p-1 text-right">Thành tiền</th>
                            <th className="border max-w-48 border-gray-300 p-1 text-left">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotationFacade.data?.quotationItem &&
                            quotationFacade.data?.quotationItem.map((item: QuotationItemModel) => (
                              <tr key={item.id}>
                                <td width={40} className="border border-gray-300 p-1 text-center max-w-10 break-words">
                                  {item.lineNumber}
                                </td>
                                <td width={144} className="border border-gray-300 p-1 max-w-36 break-words">
                                  {item.name}
                                </td>
                                <td width={128} className="border border-gray-300 p-1 max-w-32 break-words">
                                  {item.specifications}
                                </td>
                                <td width={80} className="border border-gray-300 p-1 max-w-20 break-words">
                                  {item.unit}
                                </td>
                                <td width={48} className="border border-gray-300 p-1 text-center max-w-12 break-words">
                                  {item.quantity?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </td>
                                <td width={80} className="border border-gray-300 p-1 text-right max-w-20 break-words">
                                  {item.unitPrice?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </td>
                                <td width={96} className="border border-gray-300 p-1 text-right max-w-24 break-words">
                                  {item.unitPriceDiscountAmount?.toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td width={96} className="border border-gray-300 p-1 text-right max-w-24 break-words">
                                  {item.afterLineDiscountGoodsAmount?.toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td width={192} className="border border-gray-300 p-1 max-w-48 break-words">
                                  {item.lineNote}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>

                      <div className="flex justify-between mt-2 pb-2 border-b">
                        {/* Ghi chú */}
                        <div className="w-80">
                          <h1 className="font-semibold italic mb-1">Ghi chú:</h1>
                          {quotationFacade.data?.note ? (
                            <span>{quotationFacade.data?.note}</span>
                          ) : (
                            <div className="space-y-2 w-full">
                              <span className="line-clamp-1">{'.'.repeat(120)}</span>
                              <span className="line-clamp-1">{'.'.repeat(120)}</span>
                              <span className="line-clamp-1">{'.'.repeat(120)}</span>
                            </div>
                          )}
                        </div>
                        {/* Các chi phí */}
                        <div className="space-y-1">
                          {/* Tổng tiền */}
                          <div className="flex items-center justify-between font-semibold">
                            <span className="w-44">
                              Tổng tiền (
                              {quotationData.reduce(
                                (acc: number, cur: QuotationItemModel) => acc + (cur.quantity || 0),
                                0,
                              )}{' '}
                              sản phẩm)
                            </span>
                            <span className="ml-2 text-right">
                              {quotationFacade.data?.subTotalAmount?.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                          {/* VAT */}
                          {// map qua các sản phẩm trong báo giá để lấy ra VAT của từng sản phẩm
                          quotationFacade.data?.quotationItem?.map((item: QuotationItemModel) => {
                            if (item?.lineVATPercent || 0 > 0) {
                              return (
                                <div key={item.id} className="flex items-center justify-between">
                                  <span className="w-44">VAT ({item.lineVATPercent}%)</span>
                                  <span className="ml-2 text-right">
                                    {item.lineVATAmount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              );
                            }
                          })}
                          {/* Chiết khấu */}
                          <div className="flex items-center justify-between">
                            <span className="w-44">Chiết khấu</span>
                            <span className="ml-2 text-right">
                              {quotationFacade.data?.discountAmount?.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                          {/*Chi phí vận chuyển*/}
                          <div className="flex items-center justify-between">
                            <span className="w-44">Chi phí vận chuyển</span>
                            <span className="ml-2 text-right">
                              {quotationFacade.data?.shippingCostAmount?.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                          {/*Chi phí khác*/}
                          <div className="flex items-center justify-between">
                            <span className="w-44">Chi phí khác</span>
                            <span className="ml-2 text-right">
                              {quotationFacade.data?.otherCostAmount?.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                          {/*Tổng phải trả*/}
                          <div className="flex items-center justify-between font-semibold">
                            <span className="w-44">Tổng phải trả</span>
                            <span className="ml-2 text-right">
                              {quotationFacade.data?.totalAmount?.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <div className="text-center space-y-1">
                          <p className="italic">Bắc Ninh, {formatVietnameseDate(dayjs().format('YYYY-MM-DD'))}</p>
                          <h1 className="uppercase font-semibold">Công ty Mạnh Khanh</h1>
                        </div>
                      </div>
                    </div>
                  </PrintContent>
                </div>
              </div>
            </div>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={24} lg={13} xl={15} xxl={16}>
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card
                    title={
                      <div>
                        <h1>Thông tin khách hàng</h1>
                        <div className="font-semibold flex gap-2">
                          <Tooltip title={'Xem chi tiết khách hàng'}>
                            <a
                              href={`/#/${lang}${routerLinks('KhachHang')}/${quotationFacade.data?.customerId}/view-detail`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {quotationFacade.data?.customerName ?? ''}
                            </a>
                          </Tooltip>{' '}
                          - <p>{quotationFacade.data?.customerPhoneNumber ?? ''}</p>
                        </div>
                      </div>
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex">
                        <p className="w-28">Mã khách hàng</p>
                        <p>: {quotationFacade.data?.customerCode ?? '---'}</p>
                      </div>
                      <div className="flex">
                        <p className="w-28">Địa chỉ</p>
                        <p>: {quotationFacade.data?.customerAddress ?? '---'}</p>
                      </div>
                      <div className="flex">
                        <p className="w-28">Mã số thuế</p>
                        <p>: {quotationFacade.data?.customerTaxCode ?? '---'}</p>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={24} hidden={quotationFacade.data?.projectName === null ? true : false}>
                  <Card title="Thông tin dự án">
                    <Row gutter={24}>
                      <Col span={12} className="flex">
                        <p className="mr-1.5">Tên dự án:</p>
                        <Tooltip title={'Xem chi tiết dự án'}>
                          <a className="hover:underline" href="#" target="_blank" rel="noreferrer">
                            {quotationFacade.data?.projectName ?? '---'}
                          </a>
                        </Tooltip>
                      </Col>
                      <Col span={12} className="flex">
                        <p className="mr-1.5">Mã dự án:</p>
                        <p>{quotationFacade.data?.projectCode ?? '---'}</p>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="Thông tin báo giá">
                    <Row gutter={24}>
                      <Col span={12}>
                        <div className="space-y-2">
                          <div className="flex">
                            <p className="w-28">Loại báo giá:</p>
                            <p>
                              {quotationFacade.data?.typeCode === 'QuotationMaterial'
                                ? 'Báo giá vật tư'
                                : 'Báo giá sản phẩm'}
                            </p>
                          </div>
                          <div className="flex">
                            <p className="w-28">Ngày hết hạn:</p>
                            <p>{dayjs(quotationFacade.data?.dueDate).format('DD/MM/YYYY HH:mm') ?? '---'}</p>
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="space-y-2">
                          <div className="flex">
                            <p className="w-44">Phương thức dự kiến:</p>
                            <p>{quotationFacade.data?.paymentMethodName}</p>
                          </div>
                          <div className="flex">
                            <p className="w-44">Trạng thái:</p>
                            <Tag
                              className="px-3.5 py-0.5 rounded-full text-sm"
                              color={
                                (quotationFacade.data?.status === 'DRAFT' && 'default') ||
                                (quotationFacade.data?.status === 'PENDING_APPROVAL' && 'processing') ||
                                (quotationFacade.data?.status === 'INTERNAL_APPROVAL' && 'warning') ||
                                (quotationFacade.data?.status === 'CUSTOMER_APPROVED' && 'success') ||
                                (quotationFacade.data?.status === 'CANCELLED' && 'error') ||
                                'default'
                              }
                            >
                              {(quotationFacade.data?.status === 'DRAFT' && 'Nháp') ||
                                (quotationFacade.data?.status === 'PENDING_APPROVAL' && 'Chờ duyệt') ||
                                (quotationFacade.data?.status === 'INTERNAL_APPROVAL' && 'Duyệt nội bộ') ||
                                (quotationFacade.data?.status === 'CUSTOMER_APPROVED' && 'Khách hàng duyệt') ||
                                (quotationFacade.data?.status === 'CANCELLED' && 'Hủy')}
                            </Tag>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={24} lg={11} xl={9} xxl={8}>
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card title="Thông tin bổ sung" bordered>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <p className="w-28">Ngày tạo</p>
                        <p>: {dayjs(quotationFacade.data?.createdOnDate).format('DD/MM/YYYY HH:mm') ?? '---'}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="w-28">Người tạo</p>
                        <p>: {quotationFacade.data?.createdByUserName ?? '---'}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="w-28">Ngày cập nhật</p>
                        <p>: {dayjs(quotationFacade.data?.lastModifiedOnDate).format('DD/MM/YYYY HH:mm') ?? '---'}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="w-28">Người cập nhật cuối cùng</p>
                        <p>: {quotationFacade.data?.lastModifiedByUserName ?? '---'}</p>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">Ghi chú</h3>
                        <p className="w-full line-clamp-3">{quotationFacade.data?.note ?? 'Chưa có ghi chú'}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">Lý do chiết khấu</h3>
                        <p className="w-full line-clamp-2">
                          {quotationFacade.data?.discountReason ?? 'Chưa có lý do chiết khấu'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Card title="Thông tin sản phẩm/vật tư">
                <Table
                  scroll={{ y: 'calc(100vh - 600px)' }}
                  columns={column}
                  dataSource={quotationData}
                  pagination={false}
                  footer={() => (
                    <div className="flex justify-end">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="w-64">
                            Tổng tiền (
                            {
                              // tính tổng số lượng sản phẩm trong báo giá tính theo quantity
                              quotationData
                                .reduce((acc: number, cur: QuotationItemModel) => acc + (cur.quantity || 0), 0)
                                .toLocaleString(undefined, { maximumFractionDigits: 0 })
                            }{' '}
                            sản phẩm)
                          </p>
                          <p>
                            {(quotationFacade.data?.subTotalAmount ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        {// map qua các sản phẩm trong báo giá để lấy ra VAT của từng sản phẩm nếu vatPercent !== 0
                        quotationFacade.data?.quotationItem?.map((item: QuotationItemModel) => {
                          if (item?.lineVATPercent || 0 > 0) {
                            return (
                              <div key={item?.id} className="flex justify-between">
                                <p className="w-64">VAT ({item.lineVATPercent ?? 0}%)</p>
                                <p>
                                  {(item.lineVATAmount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                              </div>
                            );
                          }
                        })}
                        <div className="flex justify-between">
                          <p className="w-64">Chiết khấu</p>
                          <p>
                            {(quotationFacade.data?.discountAmount ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="w-64">Chi phí vận chuyển</p>
                          <p>
                            {(quotationFacade.data?.shippingCostAmount ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="w-64">Chi phí khác</p>
                          <p>
                            {(quotationFacade.data?.otherCostAmount ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <p className="w-64">Tổng phải trả</p>
                          <p>
                            {(quotationFacade.data?.totalAmount ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>
    </>
  );
};

export default QuotationDetail;
