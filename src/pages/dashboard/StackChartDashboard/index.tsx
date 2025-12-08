import ReactECharts from 'echarts-for-react';

const PriceBarChart = ({ packageData }: { packageData: any }) => {
  const option = {
    title: [
      {
        text: 'Đơn vị: triệu (VND)',
        left: 'right',
        top: 28,
        textStyle: {
          fontStyle: 'italic',
          fontSize: 12,
          color: '#666',
        },
      },
    ],
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const invoice = params.find((p: any) => p.seriesName === 'Sản lượng dự kiến');
        const remaining = params.find((p: any) => p.seriesName === 'Giá trị nghiệm thu (trước VAT)');

        return `
      <div style="padding: 2px 0;">
  <div style="margin-bottom: 4px;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${invoice.color};margin-right:6px;"></span>
    <strong>Tổng sản lượng dự kiến:</strong>
    <span style="margin-left:2px">
      ${(Math.floor(Number(invoice.value) * 100) / 100).toLocaleString('en-US')} triệu (VND)
    </span>
  </div>
  <div>
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${remaining.color};margin-right:6px;"></span>
    <strong>Giá trị nghiệm thu (trước VAT):</strong>
    <span style="margin-left:2px">
      ${(Math.floor(Number(remaining.value) * 100) / 100).toLocaleString('en-US')} triệu (VND)
    </span>
  </div>
</div>
    `;
      },
    },
    legend: {
      data: ['Sản lượng dự kiến', 'Giá trị nghiệm thu (trước VAT)'],
      bottom: 0,
    },
    grid: {
      left: '20px',
      right: '20px',
      bottom: '50px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        rotate: 45,
      },
      data: packageData?.map((item: any) => item?.investorName),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: 'Sản lượng dự kiến',
        type: 'bar',
        data: packageData?.map((item: any) => item?.expectedQuantity / 1_000_000),
        barWidth: 20,
        itemStyle: {
          color: '#4EACF1',
          borderRadius: [6, 6, 0, 0],
        },
      },
      {
        name: 'Giá trị nghiệm thu (trước VAT)',
        type: 'bar',
        data: packageData?.map((item: any) => item?.receivedAmount / 1_000_000),
        barWidth: 20,
        itemStyle: {
          color: '#FDB45C',
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 450 }} />;
};

export default PriceBarChart;
