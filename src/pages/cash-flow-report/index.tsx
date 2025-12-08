import { QueryParams } from '@models';
import { CashFlowReportItem, ProjectFacade, ReceiptVouchersModel, CashbookTransactionFacade } from '@store';
import { Button, DatePicker, Flex, List, Select, Space, Spin, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { formatAmount } from '@utils';
import { ExportOutlined } from '@ant-design/icons';

const CashFlowReportPage = () => {
  const cashBookTransactionFacade = CashbookTransactionFacade();
  const projectFacade = ProjectFacade();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const currentFilter = JSON.parse(filter);

  useEffect(() => {
    onChangeDataTable({ query: { filter: JSON.stringify({ yearDate: currentFilter?.yearDate || dayjs() }) } });
    projectFacade.get({ size: -1 });
  }, []);

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
    cashBookTransactionFacade.getCashFlowReport(fillQuery);
    navigate(
      { search: new URLSearchParams(fillQuery as unknown as Record<string, string>).toString() },
      { replace: true },
    );
    cashBookTransactionFacade.set({ query: props.query, ...props.setKeyState });
  };

  return (
    <Spin spinning={cashBookTransactionFacade.isLoading}>
      <div className="m-5 space-y-5">
        <Flex justify="space-between" align="center">
          <Typography.Title level={4}>Báo cáo dòng tiền</Typography.Title>
          <Space size={'small'}>
            <Select
              className="w-80"
              placeholder={'Chọn dự án'}
              allowClear
              showSearch
              optionLabelProp={'label'}
              options={projectFacade.pagination?.content?.map((item) => ({
                label: item.tenDuAn,
                value: item.id,
                code: item.maDuAn,
              }))}
              optionRender={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Typography.Text strong>{item.label}</Typography.Text>}
                    description={
                      <Typography.Text
                        style={{
                          fontSize: 12,
                        }}
                        type="secondary"
                        italic
                      >
                        {item.data.code}
                      </Typography.Text>
                    }
                  />
                </List.Item>
              )}
              filterOption={(input, option: any) => {
                const searchText = input.toLowerCase();
                return (
                  option.label.toLowerCase().includes(searchText) || option.code?.toLowerCase().includes(searchText)
                );
              }}
              onChange={(value) => {
                onChangeDataTable({ query: { filter: JSON.stringify({ projectId: value }) } });
              }}
            />
            <Button
              icon={<ExportOutlined />}
              onClick={() => cashBookTransactionFacade.exportCashFlowReportToExcel({ filter: currentFilter })}
            >
              Xuất file
            </Button>
          </Space>
        </Flex>
        <div>
          <Typography.Text className="flex justify-end" italic>
            Đơn vị: VNĐ
          </Typography.Text>
          <div className="overflow-x-auto w-full">
            <table
              className="w-full border-collapse border border-gray-300 bg-white text-sm shadow-md"
              style={{ minWidth: '1200px' }}
            >
              {/* <!-- Header --> */}
              <thead>
                <tr className="bg-[#2B4263] text-white font-semibold">
                  <th className="w-8 border border-gray-300 p-2 py-4 text-center">#</th>
                  <th
                    className="text-left border border-gray-300 p-2 py-4"
                    style={{ width: '180px', minWidth: '180px' }}
                  >
                    Năm tài chính bắt đầu
                  </th>
                  <th className="border border-gray-300 p-2 py-4">(Tiền) Bắt đầu</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 1</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 2</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 3</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 4</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 5</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 6</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 7</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 8</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 9</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 10</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 11</th>
                  <th className="border border-gray-300 p-2 py-4">Tháng 12</th>
                  <th className="w-32 border border-gray-300 p-2 py-4">Tổng cộng</th>
                </tr>
              </thead>

              <tbody>
                {/* <!-- Ghi chú --> */}
                <tr>
                  <td className="border border-gray-300 text-center"></td>
                  <td className="border border-gray-300 font-semibold" colSpan={1}>
                    <DatePicker
                      className="w-full"
                      picker="year"
                      format={'YYYY'}
                      allowClear={false}
                      variant="filled"
                      value={dayjs(currentFilter?.yearDate)}
                      presets={[
                        {
                          label: <Tag color="processing">Năm nay</Tag>,
                          value: dayjs(),
                        },
                        {
                          label: <Tag color="processing">Năm trước</Tag>,
                          value: dayjs().subtract(1, 'year'),
                        },
                        {
                          label: <Tag color="processing">Năm sau</Tag>,
                          value: dayjs().add(1, 'year'),
                        },
                      ]}
                      onChange={(date, dateString) => {
                        onChangeDataTable({ query: { filter: JSON.stringify({ yearDate: date }) } });
                      }}
                    />
                  </td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>

                {/* <!-- Số dư đầu kỳ --> */}
                <tr className="font-semibold">
                  <td className="border border-gray-300 p-2 text-center"></td>
                  <td className="border border-gray-300 p-2">
                    {cashBookTransactionFacade.data?.openingCashBalance?.title}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.startAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.januaryAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.februaryAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.marchAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.aprilAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.mayAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.juneAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.julyAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.augustAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.septemberAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.octoberAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.novemberAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.decemberAmount)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-semibold">
                    {formatAmount(cashBookTransactionFacade.data?.openingCashBalance?.totalAmount)}
                  </td>
                </tr>

                {/* <!-- Dòng tiền thu vào --> */}
                <tr className="bg-[#2B4263] text-white font-semibold">
                  <td className="border border-gray-300 p-2 py-4 text-center">#</td>
                  <td className="border border-gray-300 p-2 py-4" colSpan={15}>
                    Dòng tiền thu vào
                  </td>
                </tr>
                {cashBookTransactionFacade.data?.receiptVouchers?.items?.map(
                  (item: CashFlowReportItem, index: number) => (
                    <>
                      <tr>
                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2">{item.title}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.startAmount ?? 0)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.januaryAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.februaryAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.marchAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.aprilAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.mayAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.juneAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.julyAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.augustAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.septemberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.octoberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.novemberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.decemberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.totalAmount)}</td>
                      </tr>
                    </>
                  ),
                )}
                {cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount && (
                  <tr className="font-semibold bg-[#d1e2f2]">
                    <td className="border border-gray-300 p-2 text-center"></td>
                    <td className="border border-gray-300 p-2">
                      {cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.title}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.startAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.januaryAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.februaryAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.marchAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.aprilAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.mayAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.juneAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.julyAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.augustAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.septemberAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.octoberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.novemberAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.decemberAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.receiptTotalAmount?.totalAmount)}
                    </td>
                  </tr>
                )}
                {/* {cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance && (
                  <tr className="font-semibold bg-[#d1e2f2]">
                    <td className="border border-gray-300 p-2 text-center"></td>
                    <td className="border border-gray-300 p-2">
                      {cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.title}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.startAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.januaryAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.februaryAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.marchAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.aprilAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.mayAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.juneAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.julyAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.augustAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.septemberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.octoberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.novemberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.decemberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.receiptVouchers?.totalCashBalance?.totalAmount)}
                    </td>
                  </tr>
                )} */}

                {/* <!-- Dòng tiền Chi ra --> */}
                <tr className="bg-[#2B4263] text-white font-semibold">
                  <td className="border border-gray-300 p-2 py-4 text-center">#</td>
                  <td className="border border-gray-300 p-2 py-4" colSpan={15}>
                    Dòng tiền chi ra
                  </td>
                </tr>
                {cashBookTransactionFacade.data?.paymentVouchers?.items?.map(
                  (item: CashFlowReportItem, index: number) => (
                    <>
                      <tr>
                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2">{item.title}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.startAmount ?? 0)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.januaryAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.februaryAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.marchAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.aprilAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.mayAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.juneAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.julyAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.augustAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.septemberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.octoberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.novemberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.decemberAmount)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatAmount(item.totalAmount)}</td>
                      </tr>
                    </>
                  ),
                )}
                {cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount && (
                  <tr className="font-semibold bg-[#d1e2f2]">
                    <td className="border border-gray-300 p-2 text-center"></td>
                    <td className="border border-gray-300 p-2">
                      {cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.title}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.startAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.januaryAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.februaryAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.marchAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.aprilAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.mayAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.juneAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.julyAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.augustAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.septemberAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.octoberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.novemberAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(
                        cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.decemberAmount,
                      )}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.paymentVouchers?.paymentTotalAmount?.totalAmount)}
                    </td>
                  </tr>
                )}
                {cashBookTransactionFacade.data?.closingCashBalance && (
                  <tr className="font-semibold bg-[#d1e2f2]">
                    <td className="border border-gray-300 p-2 text-center"></td>
                    <td className="border border-gray-300 p-2">
                      {cashBookTransactionFacade.data?.closingCashBalance?.title}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.startAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.januaryAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.februaryAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.marchAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.aprilAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.mayAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.juneAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.julyAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.augustAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.septemberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.octoberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.novemberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.decemberAmount)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {formatAmount(cashBookTransactionFacade.data?.closingCashBalance?.totalAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default CashFlowReportPage;
