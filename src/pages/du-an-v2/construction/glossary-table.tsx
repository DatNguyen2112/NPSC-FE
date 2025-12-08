import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

type DataType = {
  keyword: string;
  meaning: string;
};
const GlossaryTable = () => {
  const dataSource: DataType[] = [
    {
      keyword: 'Ngày tạo',
      meaning: 'Là ngày công trình hoặc dự án được tạo trên hệ thống',
    },
    {
      keyword: 'Tổng giá trị',
      meaning: 'Là tổng giá trị của công trình hoặc dự án đã bao gồm VAT. Đơn vị tính là VNĐ',
    },
    {
      keyword: 'Tổng thu',
      meaning:
        'Là số tiền thu được của công trình hoặc dự án. Đơn vị tính là VNĐ',
    },
    {
      keyword: 'Tổng chi',
      meaning:
        'Là số tiền chi để thực hiện công trình hoặc dự án. Đơn vị tính là VNĐ',
    },
    {
      keyword: 'Lãi lỗ',
      meaning:
        'Được tính bằng Tổng thu - Tổng chi của công trình hoặc dự án. Đơn vị tính là VNĐ',
    },
  ];

  const column: ColumnsType<DataType> = [
    {
      title: 'Thuật ngữ',
      dataIndex: 'keyword',
      width: 160,
    },
    {
      title: 'Ý nghĩa',
      dataIndex: 'meaning',
    },
  ];

  return <Table size={'small'} bordered dataSource={dataSource} columns={column} pagination={false} />;
};
export default GlossaryTable;
