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
      meaning: 'Là ngày phiếu thu hoặc phiếu chi được tạo trên hệ thống',
    },
    {
      keyword: 'Ngày ghi nhận',
      meaning: 'Là ngày xác nhận thu/chi người dùng đã chọn khi tạo phiếu',
    },
    {
      keyword: 'Quỹ đầu kỳ',
      meaning:
        'Là số tiền trong quỹ tính đến ngày trước khoảng ngày lọc. VD: Thời gian được lọc từ ngày 02/11/2020 - 15/11/2020 (Ngày tạo) ->Quỹ đầu kỳ là số tiền tính đến ngày 01/11/2020',
    },
    {
      keyword: 'Tổng thu',
      meaning:
        'Là số tiền công ty thu về trong khoảng ngày lọc. VD: Thời gian được lọc từ ngày 02/11/2020 - 15/11/2020 (Ngày tạo) -> Tổng thu là số tiền thu được trong thời gian từ 02/11/2020 - 15/11/2020',
    },
    {
      keyword: 'Tổng chi',
      meaning:
        'Là số tiền công ty chi, thanh toán trong khoảng ngày lọc. VD: Thời gian được lọc từ ngày 02/11/2020 - 15/11/2020 (Ngày tạo) -> Tổng chi là số tiền bỏ ra trong thời gian từ 02/11/2020 - 15/11/2020',
    },
    {
      keyword: 'Tồn quỹ',
      meaning:
        'Là số tiền trong quỹ tính đến ngày cuối trong khoảng ngày lọc. Tồn quỹ = Quỹ đầu kỳ + Tổng thu - Tổng chi. VD: Thời gian được lọc từ ngày 02/11/2020 - 15/11/2020 (Ngày tạo) -> Tồn quỹ là số tiền tính đến ngày 15/11/2020',
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
