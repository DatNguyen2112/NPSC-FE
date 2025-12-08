import ReactECharts from 'echarts-for-react';

const DebtChart = ({ data }: { data: any }) => {
  const option = {
    title: {
      left: 'right',
      top: 0,
      textStyle: {
        fontSize: 12,
        color: '#666',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}: ${Math.floor((data.value / 1_000_000) * 100) / 100} triệu (VND)`;
      },
    },
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    },
    grid: { left: 50, right: 30, bottom: 50, top: 60 },
    xAxis: {
      type: 'category',
      data: data?.map((item: any) => item?.title),
      axisLine: { lineStyle: { color: '#000' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: any) => `${value / 1_000_000}`,
      },
      splitLine: { show: false },
      min: 'dataMin', // Bắt đầu từ giá trị nhỏ nhất trong dữ liệu
    },
    series: [
      {
        data: data?.map((item: any) => item?.amount),
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: '#4DB2FF',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return (
    <div>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  );
};

export default DebtChart;
