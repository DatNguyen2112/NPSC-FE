import { DebtTransactionFacade } from '@store';
import { Modal, Table } from 'antd';
import { TableProps } from 'antd/lib';
import React from 'react';

type DebtTransactionGlossary = {
  glossary: string;
  meaning: string | JSX.Element;
};

const SupplierDebtGlossary = () => {
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
        'Công nợ nhà cung cấp tính đến hết ngày trước ngày bắt đầu ghi nhận công nợ. Nợ đầu kỳ dương là cửa hàng đang nợ nhà cung cấp, Nợ đầu kỳ âm là nhà cung cấp đang nợ cửa hàng.',
    },
    {
      key: 2,
      glossary: 'Nợ tăng trong kỳ',
      meaning: (
        <>
          <p>Tổng giá trị giao dịch làm tăng công nợ nhà cung cấp trong khoảng thời gian ghi nhận:</p>
          <ul>
            <li>- Tiền phải trả nhà cung cấp khi nhập hàng vào kho</li>
            <li>
              - Giá trị phiếu thu bao gồm phiếu thu tạo tự động khi nhận tiền trả hàng Nhà cung cấp và phiếu thu tạo thủ
              công cho Nhà cung cấp
            </li>
          </ul>
        </>
      ),
    },
    {
      key: 3,
      glossary: 'Nợ giảm trong kỳ',
      meaning: (
        <>
          <p>Tổng giá trị giao dịch làm giảm công nợ nhà cung cấp trong khoảng thời gian ghi nhận:</p>
          <ul>
            <li>- Giá trị phiếu chi bao gồm thanh toán cho đơn nhập hàng và phiếu chi tạo thủ công cho nhà cung cấp</li>
            <li>- Giá trị hàng trả lại Nhà cung cấp</li>
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
          <p>Nợ cuối kỳ dương là cửa hàng đang nợ Nhà cung cấp, Nợ cuối kỳ âm là Nhà cung cấp đang nợ cửa hàng</p>
        </>
      ),
    },
  ];
  return (
    <Modal
      width={800}
      title={'Bảng giải thích thuật ngữ'}
      open={debtTransactionFacade.isDebtReportModalGlossarySupplierVisible}
      onCancel={() => debtTransactionFacade.set({ isDebtReportModalGlossarySupplierVisible: false })}
      footer={null}
    >
      <Table pagination={false} bordered columns={columns} dataSource={dataSources} />
    </Modal>
  );
};

export default SupplierDebtGlossary;
