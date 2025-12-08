import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { CashbookTransactionFacade } from '@store';
import {
  Card,
  Col,
  DatePicker,
  Row, Segmented,
  Spin,
  Statistic,
  Tag,
  TimeRangePickerProps,
  Tooltip,
} from 'antd';
import { StatisticProps } from 'antd/lib';
import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import dayjs, { Dayjs } from 'dayjs';
import { InfoCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { FcMoneyTransfer } from "react-icons/fc";
import { PiMoneyThin } from "react-icons/pi";
import { IoArrowUpCircleOutline } from "react-icons/io5";

interface DashboardData {
  xaxis: string[];
  yaxis: number[];
}

interface DataPoint {
  x: string;
  y: number;
}

interface DataLine {
  id: string;
  data: DataPoint[];
}

const rangePresets: TimeRangePickerProps['presets'] = [
  {
    label: <Tag color="processing">Tháng này</Tag>,
    value: [dayjs(dayjs()).startOf('month'), dayjs(dayjs()).endOf('month')],
  },
  {
    label: <Tag color="processing">Tháng trước</Tag>,
    value: [
      dayjs(dayjs()).subtract(1, 'month').startOf('month'),
      dayjs(dayjs()).subtract(1, 'month').endOf('month'),
    ],
  },
  {
    label: <Tag color="processing">Tuần này</Tag>,
    value: [dayjs(dayjs()).startOf('week'), dayjs(dayjs()).endOf('week')],
  },
  {
    label: <Tag color="processing">Tuần trước</Tag>,
    value: [
      dayjs(dayjs()).subtract(1, 'week').startOf('week'),
      dayjs(dayjs()).subtract(1, 'week').endOf('week'),
    ],
  },
  {
    label: <Tag color="processing">Hôm nay</Tag>,
    value: [dayjs(dayjs()), dayjs(dayjs())],
  },
];

function transformDashboardData(dashboardData: DashboardData, id: string): DataLine[] {
  if (dashboardData && dashboardData.xaxis.length > 0){
    return [
      {
        id,
        data: dashboardData?.xaxis?.map((date, index) => ({
          x: date,
          y: dashboardData?.yaxis[index],
        })),
      },
    ];
  } else {
    return [];
  }

}
const Page = () => {
  const cashbookFacade = CashbookTransactionFacade();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().add(-1, 'month'), dayjs()]);

  useEffect(() => {
    cashbookFacade.getDashboardWithTotal({
      filter: `{"dateRange": ["${dateRange[0].toISOString()}", "${dateRange[1].toISOString()}"]}`,
    });
    cashbookFacade.getDashboardWithNoFilter({
      filter: `{"dateRange": ["${dateRange[0].toISOString()}", "${dateRange[1].toISOString()}"]}`,
    });
  }, [dateRange]);
  useEffect(() => {
    cashbookFacade.getDashboardWithNoFilter({
      filter: `{"dateRange": ["${dateRange[0].toISOString()}", "${dateRange[1].toISOString()}"]}`,
    });
    cashbookFacade.getDashboardWithTotal({
      filter: `{"dateRange": ["${dateRange[0].toISOString()}", "${dateRange[1].toISOString()}"]}`,
    });
    cashbookFacade.getExpendituresDashboard({ dateType: 'MONTHS' });
    cashbookFacade.getReceiptsDashboard({ dateType: 'MONTHS' });
  }, []);

  const formatter: StatisticProps['formatter'] = (value) => {
    return (
      <div className="flex flex-col">
        <div className={'flex gap-2 items-center'}>
          <p className={'text-sm uppercase'}>Tồn quỹ</p>
          <Tooltip title={'Tồn quỹ của toàn bộ hệ thống'} trigger={'hover'}>
            <InfoCircleTwoTone className={'w-4 h-4'}/>
          </Tooltip>
        </div>
        <div className={'flex items-center gap-2'}>
          <CountUp
            end={value as number}
            decimals={3}
            separator=","
          />
        </div>
        <span className="mt-1 text-gray-400 text-sm">triệu VNĐ</span>
      </div>
    );
  };
  console.log(cashbookFacade?.dashboardDataWithNoFilter?.expendituresDataWithPurpose);
  const formatReceipt: StatisticProps['formatter'] = (value) => {
    return (
      <div className="flex flex-col">
        <p className={'text-sm uppercase'}>Tổng thu </p>
        <div className={'flex items-center gap-2'}>
          <CountUp
            end={value as number}
            decimals={3}
            separator=","
          />
        </div>
        <span className="mt-1 text-gray-400 text-sm">triệu VNĐ</span>
      </div>
    );
  };
  const formatPayment: StatisticProps['formatter'] = (value) => {
    return (
      <div className="flex flex-col">
        <p className={'text-sm uppercase'}>Tổng chi</p>
        <div className={'flex items-center gap-2'}>
          <CountUp
            end={value as number}
            decimals={3}
            separator=","
          />
        </div>
        <span className="mt-1 text-gray-400 text-sm">triệu VNĐ</span>
      </div>
    );
  };
  const formatGrowthMonth: StatisticProps['formatter'] = (value) => {
    return (
      <div className="flex flex-col">
        <p className={'text-sm uppercase'}>Tổng thu</p>
        <div className={'flex items-center gap-2'}>
          <IoArrowUpCircleOutline color={'#169C44FF'} />
          <CountUp
            end={value as number}
            separator=","
          />
          %
        </div>
        <span className="mt-1 text-gray-400 text-sm">So với cùng kỳ tháng trước</span>
      </div>
    );
  };
  const formatGrowthDay: StatisticProps['formatter'] = (value) => {
    return (
      <div className="flex flex-col">
        <p className={'text-sm uppercase'}>Tổng thu</p>
        <div className={'flex items-center gap-2'}>
          <IoArrowUpCircleOutline color={'#169C44FF'} />
          <CountUp
            end={value as number}
            separator=","
          />
          %
        </div>
        <span className="mt-1 text-gray-400 text-sm">So với hôm qua</span>
      </div>
    );
  };
  const formatLeftAmount: StatisticProps['formatter'] = (value) => {
    return (
      <div className="flex flex-col">
        <p className={'text-sm uppercase'}>Còn lại</p>
        <div className={'flex items-center gap-2'}>
          <CountUp
            className={`${Number(value) < 0 ? '!text-red-500' : ''}`}
            end={value as number}
            decimals={3}
            separator=","
          />
        </div>
        <span className="mt-1 text-gray-400 text-sm">triệu VNĐ</span>
      </div>
    );
  };

  return (
    <>
      <div className="grid gap-5 p-8 h-[90rem]">
        <div className="h-full w-full flex flex-col gap-4">
          <div className="flex mb-3">
            <DatePicker.RangePicker
              value={dateRange}
              format="DD/MM/YYYY"
              presets={rangePresets}
              onChange={(e) => setDateRange([e?.[0] ?? dayjs(), e?.[1] ?? dayjs()])}
            />
          </div>
          <Row gutter={12}>
            <Col span={17}>
              <Card className={'rounded-[10px] text-sm'} bodyStyle={{paddingTop: '10px', paddingBottom: '10px'}} title={null}>
                <div className={'!flex justify-between'}>
                  <Statistic
                    value={cashbookFacade?.dashboardDataWithNoFilter?.fund}
                    precision={2}
                    formatter={formatter}
                    prefix={<RiMoneyDollarCircleLine />}
                    valueStyle={{ display: 'flex', alignItems: 'center'}}
                  />
                  <div className={'border-r-[1px]'}></div>
                  <Statistic
                    value={cashbookFacade?.dashboardDataAmount?.totalReceiptsAmount}
                    precision={2}
                    formatter={formatReceipt}
                    valueStyle={{ color: '#22b14f', display: 'flex', alignItems: 'center' }}
                    prefix={<FcMoneyTransfer className={'h-full flex items-center'}/>}
                  />
                  <div className={'border-r-[1px]'}></div>
                  <Statistic
                    value={cashbookFacade?.dashboardDataAmount?.totalExpendituresAmount}
                    precision={2}
                    valueStyle={{ color: '#ae1e23', display: 'flex', alignItems: 'center' }}
                    prefix={<FcMoneyTransfer />}
                    formatter={formatPayment}
                  />
                  <div className={'border-r-[1px]'}></div>
                  <Statistic
                    value={cashbookFacade?.dashboardDataAmount?.leftAmount}
                    precision={2}
                    valueStyle={{ color: '#196ec3', display: 'flex', alignItems: 'center' }}
                    formatter={formatLeftAmount}
                    prefix={<PiMoneyThin />}
                  />
                </div>
              </Card>
            </Col>
            <Col span={7}>
              <Card className={'rounded-[10px] text-sm'} bodyStyle={{paddingTop: '10px', paddingBottom: '10px'}} title={null}>
                <div className={'w-full !flex justify-between'}>
                  <Statistic
                    value={cashbookFacade?.dashboardDataAmount?.percentChangeReceipts_Yesterday}
                    precision={2}
                    valueStyle={{ color: '#169c44', display: 'flex', alignItems: 'center' }}
                    formatter={formatGrowthDay}
                  />
                  <div className={'border-r-[1px]'}></div>
                  <Statistic
                    value={cashbookFacade?.dashboardDataAmount?.percentChangeReceipts_LastMonth}
                    precision={2}
                    valueStyle={{ color: '#169c44', display: 'flex', alignItems: 'center' }}
                    formatter={formatGrowthMonth}
                  />
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 14]}>
            <Col span={12}>
              <Card className={'rounded-[10px]'} title={<div className={'flex justify-center uppercase'}>Tổng hợp thu theo mục đích</div>}>
                <div className={'h-96'}>
                  <ResponsiveBar
                    data={cashbookFacade?.dashboardDataWithNoFilter?.receiptsPurpose ?? []}
                    keys={['totalAmount']}
                    indexBy="description"
                    margin={{
                      top: 20,
                      right: 50,
                      bottom: 90,
                      left: 80,
                    }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'set1' }}
                    colorBy="indexValue"
                    borderColor={{
                      from: 'color',
                      modifiers: [['darker', 1.6]],
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 10,
                      tickRotation: 45,
                      // legend: 'Mục đích',
                      legendPosition: 'middle',
                      legendOffset: 32,
                      truncateTickAt: 10,
                    }}
                    axisLeft={{
                      tickSize: 3,
                      tickPadding: 6,
                      tickRotation: -20,
                      legend: 'Tổng tiền (triệu VNĐ)',
                      legendPosition: 'middle',
                      legendOffset: -55,
                      truncateTickAt: -20,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{
                      from: 'color',
                      modifiers: [['darker', 9]],
                    }}
                    tooltip={({ value, color, indexValue }) => {
                      const formattedValue = new Intl.NumberFormat('en-US').format(Number(value));
                      return (
                        <div
                          style={{
                            padding: '8px',
                            background: '#fff',
                            border: `1px solid ${color}`,
                          }}
                        >
                          <div>
                            <div style={{ color, fontWeight: 'bold', marginBottom: 4 }}>{indexValue}</div>
                            <span className="font-bold">
                                {formattedValue} <span className="font-semibold">triệu VNĐ</span>
                              </span>
                          </div>
                        </div>
                      );
                    }}
                    theme={{
                      axis: {
                        legend: {
                          text: {
                            fontSize: 14,
                            fill: '#333333',
                            outlineWidth: 0,
                            outlineColor: 'transparent',
                            fontFamily: 'Segoe UI',
                            fontWeight: 'bold',
                          },
                        },
                      },
                    }}
                    role="application"
                  />
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card className={'rounded-[10px]'} title={<div className={'flex justify-center uppercase'}>Tổng hợp chi theo mục đích</div>}>
                <div className={'h-96'}>
                  {cashbookFacade?.dashboardDataWithNoFilter?.expendituresDataWithPurpose != undefined ? (
                    <>
                      <ResponsiveBar
                        data={cashbookFacade?.dashboardDataWithNoFilter?.expendituresDataWithPurpose}
                        keys={['totalAmount']}
                        indexBy="description"
                        margin={{
                          top: 20,
                          right: 50,
                          bottom: 90,
                          left: 80,
                        }}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        colors={{ scheme: 'nivo' }}
                        colorBy="indexValue"
                        borderColor={{
                          from: 'color',
                          modifiers: [['darker', 1.6]],
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 10,
                          tickRotation: 45,
                          // legend: 'Mục đích',
                          legendPosition: 'middle',
                          legendOffset: 32,
                          truncateTickAt: 10,
                        }}
                        axisLeft={{
                          tickSize: 3,
                          tickPadding: 6,
                          tickRotation: -20,
                          legend: 'Tổng tiền (triệu VNĐ)',
                          legendPosition: 'middle',
                          legendOffset: -55,
                          truncateTickAt: -20,
                        }}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{
                          from: 'color',
                          modifiers: [['darker', 9]],
                        }}
                        tooltip={({ value, color, indexValue }) => {
                          const formattedValue = new Intl.NumberFormat('en-US').format(Number(value));
                          return (
                            <div
                              style={{
                                padding: '8px',
                                background: '#fff',
                                border: `1px solid ${color}`,
                              }}
                            >
                              <div>
                                <div style={{ color, fontWeight: 'bold', marginBottom: 4 }}>{indexValue}</div>
                                <span className="font-bold">
                                  {formattedValue} <span className="font-semibold">triệu VNĐ</span>
                                </span>
                              </div>
                            </div>
                          );
                        }}
                        theme={{
                          axis: {
                            legend: {
                              text: {
                                fontSize: 14,
                                fill: '#333333',
                                outlineWidth: 0,
                                outlineColor: 'transparent',
                                fontFamily: 'Segoe UI',
                                fontWeight: 'bold',
                              },
                            },
                          },
                        }}
                        role="application"
                      />
                    </>
                  ) : (
                    <div className=" mt-3 flex justify-center items-center h-64">
                      <Spin indicator={<LoadingOutlined spin />} size="large" />
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card className={'rounded-[10px]'} title={<div className={'flex justify-center uppercase'}>Tổng hợp thu theo thời gian</div>}>
                {cashbookFacade?.receiptsDashboardData ? (
                  <div className={'h-96'}>
                    <Segmented
                      className="absolute top-4 right-4 z-10"
                      options={[
                        { value: 'DAYS', label: 'Ngày' },
                        { value: 'MONTHS', label: 'Tháng' },
                        { value: 'YEARS', label: 'Năm' },
                      ]}
                      defaultValue="MONTHS"
                      onChange={(value) => {
                        cashbookFacade.getReceiptsDashboard({ dateType: value });
                      }}
                    />
                    <ResponsiveLine
                      data={transformDashboardData(cashbookFacade?.receiptsDashboardData as DashboardData, 'Thu')}
                      margin={{ top: 40, right: 110, bottom: 100, left: 80 }}
                      xScale={{ type: 'point' }}
                      yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: true,
                        reverse: false,
                      }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        // legend: 'Thời gian',
                        legendOffset: 36,
                        legendPosition: 'middle',
                        truncateTickAt: 0,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -20,
                        legend: 'Tổng tiền (triệu VNĐ)',
                        legendOffset: -55,
                        legendPosition: 'middle',
                        truncateTickAt: 0,
                      }}
                      pointSize={10}
                      pointColor={{ theme: 'background' }}
                      pointBorderWidth={2}
                      colors={{ scheme: 'dark2' }}
                      pointBorderColor={{ from: 'serieColor' }}
                      pointLabel="data.yFormatted"
                      pointLabelYOffset={-12}
                      enableTouchCrosshair={true}
                      useMesh={true}
                      legends={[
                        {
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: 'left-to-right',
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: 'circle',
                          symbolBorderColor: 'rgba(0, 0, 0, .5)',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1,
                              },
                            },
                          ],
                        },
                      ]}
                      theme={{
                        axis: {
                          legend: {
                            text: {
                              fontSize: 14,
                              fill: '#333333',
                              outlineWidth: 0,
                              outlineColor: 'transparent',
                              fontFamily: 'Segoe UI',
                              fontWeight: 'bold',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className=" mt-3 flex justify-center items-center h-72">
                    <Spin indicator={<LoadingOutlined spin />} size="large" />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card className={'rounded-[10px]'} title={<div className={'flex justify-center uppercase'}>Tổng hợp chi theo thời gian</div>}>
                {cashbookFacade?.receiptsDashboardData ? (
                  <div className={'h-96'}>
                    <Segmented
                      className="absolute top-4 right-4 z-10"
                      options={[
                        { value: 'DAYS', label: 'Ngày' },
                        { value: 'MONTHS', label: 'Tháng' },
                        { value: 'YEARS', label: 'Năm' },
                      ]}
                      defaultValue="MONTHS"
                      onChange={(value) => {
                        cashbookFacade.getExpendituresDashboard({ dateType: value });
                      }}
                    />
                    <ResponsiveLine
                      data={transformDashboardData(cashbookFacade?.expendituresDashboardData as DashboardData, 'Chi')}
                      margin={{ top: 40, right: 110, bottom: 100, left: 80 }}
                      xScale={{ type: 'point' }}
                      yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: true,
                        reverse: false,
                      }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        // legend: 'Thời gian',
                        legendOffset: 36,
                        legendPosition: 'middle',
                        truncateTickAt: 0,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -20,
                        legend: 'Tổng tiền (triệu VNĐ)',
                        legendOffset: -55,
                        legendPosition: 'middle',
                        truncateTickAt: 0,
                      }}
                      pointSize={10}
                      colors={{ scheme: 'tableau10' }}
                      pointColor={{ theme: 'background' }}
                      pointBorderWidth={2}
                      pointBorderColor={{ from: 'serieColor' }}
                      pointLabel="data.yFormatted"
                      pointLabelYOffset={-12}
                      enableTouchCrosshair={true}
                      useMesh={true}
                      legends={[
                        {
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: 'left-to-right',
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: 'circle',
                          symbolBorderColor: 'rgba(0, 0, 0, .5)',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1,
                              },
                            },
                          ],
                        },
                      ]}
                      theme={{
                        axis: {
                          legend: {
                            text: {
                              fontSize: 14,
                              fill: '#333333',
                              outlineWidth: 0,
                              outlineColor: 'transparent',
                              fontFamily: 'Segoe UI',
                              fontWeight: 'bold',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className=" mt-3 flex justify-center items-center h-72">
                    <Spin indicator={<LoadingOutlined spin />} size="large" />
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  )
};
export default Page;
