import ReactECharts from 'echarts-for-react';

const PieCharts = ({ packageData }: { packageData: any }) => {
  console.log(packageData);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      textStyle: {
        fontSize: 14,
        color: '#333',
      },
      data: ['Đã nghiệm thu', 'Chưa nghiệm thu'],
    },
    series: [
      {
        name: 'Tình trạng nghiệm thu',
        type: 'pie',
        radius: '70%',
        data: packageData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{c}%',
          fontSize: 14,
          position: 'inside',
          fontWeight: 'bold',
          color: '#000',
        },
      },
    ],
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <ReactECharts option={option} style={{ height: '300px' }} />
    </div>
  );
};

export default PieCharts;
