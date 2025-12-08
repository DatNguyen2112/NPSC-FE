import ReactECharts from 'echarts-for-react';

const ContractChart = ({ data }: { data: any }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params: any) => {
        const invoice = params.find((p: any) => p.seriesName === 'Số lượng hợp đồng');
        const remaining = params.find((p: any) => p.seriesName === 'Giá trị hợp đồng');

        return `
      <div style="padding: 2px 0;">
        <div style="margin-bottom: 4px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${invoice.color};margin-right:6px;"></span>
          <strong>Số lượng hợp đồng:</strong>
          <span style="margin-left:2px">${invoice.value.toLocaleString('vi-VN')}</span>
        </div>
        <div>
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${remaining.color};margin-right:6px;"></span>
          <strong>Giá trị hợp đồng (trước VAT):</strong>
           <span style="margin-left:2px">
      ${(Math.floor(Number(remaining.value) * 100) / 100).toLocaleString('en-US')} triệu (VND)
    </span>
        </div>
      </div>
    `;
      },
    },
    textStyle: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    },
    legend: {
      data: ['Số lượng hợp đồng', 'Giá trị hợp đồng'],
      bottom: 0,
    },
    xAxis: [
      {
        type: 'category',
        data: data?.map((item: any) => item?.investorName),
        axisLabel: {
          rotate: 30, // xoay nhãn để dễ nhìn
        },
      },
    ],
    grid: {
      bottom: 20, // tăng chiều cao phần đáy để nhãn không bị chìm
      containLabel: true, // tự động căn lề nếu cần
    },
    yAxis: [
      {
        type: 'value',
        name: 'Hợp đồng',
        min: 0,
        position: 'left',
      },
      {
        type: 'value',
        name: 'triệu (VND)',
        min: 0,
        position: 'right',
      },
    ],
    series: [
      {
        name: 'Số lượng hợp đồng',
        type: 'bar',
        data: data?.map((item: any) => item?.contractQuantity),
        itemStyle: {
          color: '#4fc3f7',
        },
        barWidth: '40%',
      },
      {
        name: 'Giá trị hợp đồng',
        type: 'line',
        yAxisIndex: 1,
        data: data?.map((item: any) => item?.contractAmount / 1_000_000),
        itemStyle: {
          color: '#9c7bff',
        },
        smooth: true,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '400px' }} />;
};

export default ContractChart;
