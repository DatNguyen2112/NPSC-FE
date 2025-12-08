import ReactECharts from 'echarts-for-react';

const PriorityDonutChart = ({ data, title }: { data: any; title: string }) => {
  const generateColor = (text: string) => {
    switch (text) {
      case 'Cấp 1':
        return '#feaba6';
      case 'Cấp 2':
        return '#f7e787';
      case 'Cấp 3':
        return '#a7fc82';
      case 'PC':
        return '#a7fc82';
      case 'CĐT':
        return '#f7e787';
      case 'BQLDA':
        return '#feaba6';
    }
  };

  const packageData = data?.map((item: any) => ({
    ...item,
    itemStyle: { color: generateColor(item?.name) },
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params.color};margin-right:6px;"></span>
      <strong>${params?.data?.name}</strong>
      <br/>Số lượng: ${params?.data?.value}
      <br/>Tỷ lệ: ${params?.percent}%
    `;
      },
    },
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    },
    legend: {
      orient: 'vertical',
      right: '3%',
      top: '25%',
      data: data?.map((item: any) => item?.name),
      formatter: data?.map((item: any) => item?.name),
      textStyle: {
        fontFamily: 'Roboto, sans-serif',
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.45)',
      },
    },
    color: packageData?.map((item: any) => item?.itemStyle?.color),
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['45%', '80%'],
        center: ['40%', '51%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },

        data: data,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 260 }} />;
};

export default PriorityDonutChart;
