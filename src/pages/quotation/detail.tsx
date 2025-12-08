import { LeftOutlined } from '@ant-design/icons';
import { ParameterFacade, QuotationFacade, QuotationItemModel, QuotationModel } from '@store';
import { lang, routerLinks, uuidv4 } from '@utils';
import { Button, Col, Row, Space, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const QuotationDetail = () => {
  const parameterFacade = ParameterFacade();
  const quotationFacade = QuotationFacade();

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    parameterFacade.get({});
  }, []);

  useEffect(() => {
    if (id !== null && id !== '' && id !== undefined) {
      quotationFacade.getById({ id: id });
    }
  }, [id]);

  const ghiChu = parameterFacade.pagination?.content.find((item) => item.name === 'GHICHU');

  const quotationData: QuotationModel[] =
    quotationFacade.data?.quotationItem?.map((items: QuotationItemModel, index: number) => ({
      stt:
        (Number(quotationFacade.pagination?.page ?? 0) - 1) * Number(quotationFacade.pagination?.size ?? 0) + index + 1,
      index: index + 1,
      id: items.id ?? '',
      key: uuidv4(),
      name: items.name,
      specifications: items.specifications,
      unit: items.unit,
      quantity: items.quantity,
      unitPrice: items.unitPrice,
      unitPriceDiscountAmount: items.unitPriceDiscountAmount,
      lineAmount: items.lineAmount,
    })) ?? [];

  // HANDLE CANCEL
  const onCancel = () => {
    navigate(`/${lang}${routerLinks('Quotation')}`);
  };

  const column: ColumnsType<QuotationModel> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      align: 'center',
      width: 60,
    },
    {
      title: (
        <div className="text-center">
          PRODUCT NAME/
          <br />
          TÊN SẢN PHẨM
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: (
        <div className="text-center">
          SPECIFICATIONS/
          <br />
          QUY CÁCH
        </div>
      ),
      dataIndex: 'specifications',
      key: 'specifications',
      render: (text: string) => (
        <div className={'no-tooltip'} dangerouslySetInnerHTML={{ __html: text }} title={text} />
      ),
    },
    {
      title: (
        <div className="text-center">
          UNIT/
          <br />
          ĐƠN VỊ TÍNH
        </div>
      ),
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
    },
    {
      title: (
        <div className="text-center">
          QUANTINY/
          <br />
          SỐ LƯỢNG
        </div>
      ),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: (
        <div className="text-center">
          PRICE /UNIT
          <br />
          ĐƠN GIÁ
          <br />
          (VND)
        </div>
      ),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (unitPrice: number) => <p>{unitPrice.toLocaleString()}</p>,
    },
    {
      title: (
        <div className="text-center">
          DISCOUNT AMOUNT/
          <br />
          CHẾT KHẤU
        </div>
      ),
      dataIndex: 'unitPriceDiscountAmount',
      key: 'unitPriceDiscountAmount',
      width: 100,
      align: 'right',
      render: (unitPriceDiscountAmount: number) => <p>{unitPriceDiscountAmount.toLocaleString()}</p>,
    },
    {
      title: (
        <div className="text-center">
          AMOUNT/
          <br />
          THÀNH TIỀN
        </div>
      ),
      dataIndex: 'lineAmount',
      key: 'lineAmount',
      width: 120,
      align: 'right',
      render: (lineAmount: number) => <p>{lineAmount.toLocaleString()}</p>,
    },
  ];
  return (
    <>
      <Spin spinning={quotationFacade.isFormLoading}>
        <div className={'bg-white w-full flex justify-between h-12 items-center sticky top-0 z-20 shadow-header'}>
          <Button type={'link'} icon={<LeftOutlined />} className={'text-gray-600 font-medium'} onClick={onCancel}>
            Chi tiết báo giá
          </Button>
          <Space className={'pr-4'}>
            <Button
              type={'default'}
              className={'hover:!bg-blue-50 border-blue-400 text-blue-400 font-medium'}
              onClick={onCancel}
            >
              Thoát
            </Button>
          </Space>
        </div>
        <div className="w-[1200px] mx-auto p-2">
          <h1 className="text-2xl text-center font-bold uppercase">BẢNG BÁO GIÁ/QUOTATION</h1>
          <Row className="mt-4">
            <Col span={24} className={'px-2 py-2.5 flex items-center'}>
              <b className="w-36">Kính gửi:</b>
              <p>{quotationFacade.data?.customerName}</p>
            </Col>
            <Col span={24} className={'px-2 py-2.5 flex items-center'}>
              <b className="w-36">Địa chỉ:</b>
              <p>{quotationFacade.data?.customerAddress}</p>
            </Col>
            <Col span={12} className={'px-2 py-2.5 flex items-center'}>
              <b className="w-36">Số điện thoại:</b>
              <p>{quotationFacade.data?.customerPhoneNumber}</p>
            </Col>
            <Col span={12} className={'px-2 py-2.5 flex items-center'}>
              <b className="w-36">Mã số thuế:</b>
              <p>{quotationFacade.data?.customerTaxCode}</p>
            </Col>
            <Col span={12} className={'px-2 py-2.5 flex items-center'}>
              <b className="w-36">Mã đơn hàng:</b>
              <p>{quotationFacade.data?.orderCode}</p>
            </Col>
            <Col span={12} className={'px-2 py-2.5 flex items-center'}>
              <b className="w-36">Dự án:</b>
              <p>{quotationFacade.data?.projectName}</p>
            </Col>

            {/* <Col span={24} className={'px-2 py-2.5 flex items-center'}>
              <b className="w-36">Loại báo giá:</b>
              <p>{quotationFacade.data?.typeCode}</p>
            </Col> */}
            <Col span={24} className={'px-2'}>
              <span className="italic">
                Lời đầu tiên, xin trân trọng cảm ơn quý khách hàng đã quan tâm đến sản phẩm của công ty chúng tôi. Chúng
                tôi xin gửi đến quý khách hàng bảng báo giá như sau:
              </span>
            </Col>
            <Col span={24} className={'px-2'}>
              <Table
                size="small"
                scroll={{ y: 'calc(100vh - 265px)' }}
                dataSource={quotationData}
                columns={column}
                footer={() => (
                  <div className=" font-medium p-3 ">
                    <div className="flex justify-between items-center">
                      <span className="pl-5">Total</span>
                      <span>{quotationFacade?.data?.subTotalAmount.toLocaleString() ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="pl-5">Vat {quotationFacade.data?.vatPercent}%</span>
                      <span>{quotationFacade.data?.vatAmount.toLocaleString() ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="pl-5">Total Amount</span>
                      <span>{quotationFacade.data?.totalAmount.toLocaleString() ?? 0}</span>
                    </div>
                  </div>
                )}
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '30'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
              />
            </Col>
            <Col span={24} className={'px-2'}>
              <ul>
                <li className="font-bold italic">Ghi chú:</li>
                <div
                  dangerouslySetInnerHTML={{ __html: quotationFacade.data?.note || '' }}
                  title={quotationFacade.data?.note}
                  className="break-words no-tooltip"
                />
              </ul>
            </Col>
            <Col span={12} className={'px-2'} />
            <Col span={12} className={'px-2 mb-44'}>
              <div className="text-center mr-32 mt-7">
                <p className="italic">
                  Bắc Ninh, {dayjs(quotationFacade.data?.createdOnDate).format('Ngày DD [tháng] MM [năm] YYYY')}
                </p>
                <p className="uppercase font-bold">Công ty Mạnh Khanh</p>
              </div>
            </Col>
          </Row>
        </div>
      </Spin>
    </>
  );
};

export default QuotationDetail;
