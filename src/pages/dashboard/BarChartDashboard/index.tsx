import ReactECharts from 'echarts-for-react';

const DashboardChart = ({ data }: { data: any }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        return `
        <p>${params[0]?.name}</p>
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params[0].color};margin-right:6px;"></span>
      <span>${params[0]?.value}</span>
      
    `;
      },
    },
    grid: {
      bottom: 20, // tăng chiều cao phần đáy để nhãn không bị chìm
      containLabel: true, // tự động căn lề nếu cần
    },
    xAxis: {
      type: 'category',
      data: data.map((item: any) => item.name),
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
    },
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    },
    series: [
      {
        data: data.map((item: any) => item.value),
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: '#3399FF',
          opacity: 0.6,
        },
      },
    ],
  };

  return (
    <div style={{ height: '480px', overflowX: 'auto' }}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default DashboardChart;
