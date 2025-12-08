import ReactECharts from 'echarts-for-react';

const DebtBarChart = ({ data }: { data: any }) => {
  const option = {
    title: [
      {
        left: 'right',
        top: 0,
        textStyle: {
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
        const invoice = params.find((p: any) => p.seriesName === 'Đã xuất hóa đơn');
        const remaining = params.find((p: any) => p.seriesName === 'Còn lại');
        const total = params.find((p: any) => p.seriesName === 'Giá trị quyết toán');

        return `
      <div style="padding: 6px 0;">
        <div style="margin-bottom: 6px;">
          <strong>Giá trị nghiệm thu (trước VAT):</strong>
          <span style="margin-left:4px">${Math.floor(Number(total.value) * 100) / 100} triệu (VND)</span>
        </div>
        <div style="margin-bottom: 4px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${invoice.color};margin-right:6px;"></span>
          <strong>Đã xuất hóa đơn:</strong>
          <span style="margin-left:4px">${Math.floor((invoice.value / 1_000_000) * 100) / 100} triệu (VND)</span>
        </div>
        <div>
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${remaining.color};margin-right:6px;"></span>
          <strong>Còn lại:</strong>
          <span style="margin-left:4px">${Math.floor((remaining.value / 1_000_000) * 100) / 100} triệu (VND)</span>
        </div>
      </div>
    `;
      },
    },
    legend: {
      bottom: 10,
      data: ['Đã xuất hóa đơn', 'Còn lại'],
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      min: 0,
      axisLabel: {
        formatter: (value: number) => `${value / 1_000_000}`,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: data?.map((item: any) => item?.constructionName),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        formatter: function (value: string) {
          const words = value.split(' ');
          const chunkSize = Math.ceil(words.length / 3); // chia đều thành 3 dòng
          const lines = [];

          for (let i = 0; i < words.length; i += chunkSize) {
            lines.push(words.slice(i, i + chunkSize).join(' '));
          }

          return lines.join('\n');
        },
        lineHeight: 18,
      },
    },
    series: [
      {
        name: 'Đã xuất hóa đơn',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#64b5f6',
          borderRadius: [10, 0, 0, 10],
        },
        data: data?.map((item: any) => item?.totalHasExportBill),
      },
      {
        name: 'Còn lại',
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color: '#e0e0e0',
          borderRadius: [0, 10, 10, 0],
        },
        data: data?.map((item: any) => item?.totalRemaining),
      },
      {
        name: 'Giá trị quyết toán',
        type: 'bar',
        stack: 'total',
        barGap: '-100%', // chồng lên để hiển thị label
        label: {
          show: true,
          position: [10, 15],
          top: '10%',
        },
        itemStyle: {
          color: 'transparent', // ẩn thanh bar
        },
        data: data?.map((item: any) => Math.floor((item?.totalExpectedAmountBeforeVAT / 1_000_000) * 100) / 100),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
};

export default DebtBarChart;
