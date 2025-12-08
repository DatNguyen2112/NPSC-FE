import { DebtTransactionFacade } from '@store';
import { Modal, Table } from 'antd';
import { TableProps } from 'antd/lib';
import React from 'react';

type DebtTransactionGlossary = {
  glossary: string;
  meaning: string | JSX.Element;
};

const CustomerDebtGlossary = () => {
  const debtTransactionFacade = DebtTransactionFacade();
  const columns: TableProps<DebtTransactionGlossary>['columns'] = [
    {
      title: 'Thuật ngữ',
      dataIndex: 'glossary',
      key: 'glossary',
      width: 160,
    },
    {
      title: 'Ý nghĩa',
      dataIndex: 'meaning',
      key: 'meaning',
      width: 584,
    },
  ];

  const dataSources = [
    {
      key: 1,
      glossary: 'Nợ đầu kỳ',
      meaning:
        'Công nợ khách hàng tính đến hết ngày trước ngày chọn đầu tiên xem báo cáo công nợ. Nợ đầu kỳ dương là khách đang nợ cửa hàng, Nợ đầu kỳ âm là cửa hàng đang nợ khách. Ví dụ: Chọn xem báo cáo trong khoảng ngày ghi nhận từ 01/01/2022 đến 31/03/2022, công nợ đầu kỳ là tổng nợ của khách hàng còn lại đến hết ngày 31/12/2021',
    },
    {
      key: 2,
      glossary: 'Nợ tăng trong kỳ',
      meaning: (
        <>
          <p>Tổng giá trị giao dịch làm tăng công nợ của khách hàng trong khoảng thời gian ghi nhận:</p>
          <ul>
            <li>- Tiền khách phải trả khi đơn giao thành công</li>
            <li>- Giá trị phiếu chi tạo cho khách hàng</li>
            <li>- Giá trị hoàn trả khách khi trả hàng</li>
          </ul>
        </>
      ),
    },
    {
      key: 3,
      glossary: 'Nợ giảm trong kỳ',
      meaning: (
        <>
          <p>Tổng giá trị giao dịch làm giảm công nợ khách hàng trong khoảng thời gian ghi nhận:</p>
          <ul>
            <li>- Giá trị phiếu thu bao gồm thanh toán cho đơn hàng và phiếu thu tạo thủ công cho khách hàng</li>
            <li>- Giá trị hàng khách trả lại</li>
          </ul>
        </>
      ),
    },
    {
      key: 4,
      glossary: 'Nợ còn trong kỳ',
      meaning: 'Nợ còn trong kỳ = Nợ tăng trong kỳ - Nợ giảm trong kỳ',
    },
    {
      key: 5,
      glossary: 'Nợ cuối kỳ',
      meaning: (
        <>
          <p>Nợ cuối kỳ = Nợ đầu kỳ + Nợ còn trong kỳ</p>
          <p>Nợ cuối kỳ dương là khách đang nợ cửa hàng, Nợ cuối kỳ âm là cửa hàng đang nợ khách.</p>
        </>
      ),
    },
  ];
  return (
    <Modal
      width={800}
      title={'Bảng giải thích thuật ngữ'}
      open={debtTransactionFacade.isDebtReportModalGlossaryCustomerVisible}
      onCancel={() => debtTransactionFacade.set({ isDebtReportModalGlossaryCustomerVisible: false })}
      footer={null}
    >
      <Table pagination={false} bordered columns={columns} dataSource={dataSources} />
    </Modal>
  );
};

export default CustomerDebtGlossary;
