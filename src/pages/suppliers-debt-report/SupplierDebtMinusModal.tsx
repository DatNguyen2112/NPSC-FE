import { DebtReportFilter, DebtTransactionFacade, DebtTransactionModel } from '@store';
import { lang, routerLinks, scrollLeftWhenChanging, scrollTopWhenChanging, uuidv4 } from '@utils';
import { Modal, Pagination, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Table } from 'antd';

interface DebtColumnType extends DebtTransactionModel {
  key: string;
}
export default function SupplierDebtMinusModal({ supplierId }: { supplierId?: string }): React.ReactElement {
  const debtTransactionFacade = DebtTransactionFacade();
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get('filter');
  const currentFilter: DebtReportFilter = JSON.parse(filter || '{}');

  useEffect(() => {
    if (supplierId) {
      debtTransactionFacade.get({
        filter: JSON.stringify({
          entityId: supplierId,
          dateRange: currentFilter.dateRange,
          debtAmountType: 1, // công nợ âm
        }),
      });
    }
  }, [supplierId]);

  const debtIncreaseSupplierData: DebtColumnType[] =
    debtTransactionFacade.pagination?.content?.map((items: DebtTransactionModel, index: number) => ({
      key: uuidv4(),
      lineNumber: index + 1,
      entityType: items.entityType,
      originalDocumentId: items.originalDocumentId,
      originalDocumentCode: items.originalDocumentCode,
      originalDocumentType: items.originalDocumentType,
      createdByUserName: items.createdByUserName,
      createdOnDate: items.createdOnDate,
      note: items.note,
      changeAmount: items.changeAmount,
      debtAmount: items.debtAmount,
    })) || [];

  const debtIncreaseSupplierColumns: ColumnsType<DebtColumnType> = [
    {
      title: 'STT',
      dataIndex: 'lineNumber',
      key: 'lineNumber',
      width: 55,
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOnDate',
      key: 'createdOnDate',
      width: 169,
      render: (createdOnDate: string) => {
        return <p>{createdOnDate && dayjs(createdOnDate).format('DD/MM/YYYY HH:mm')}</p>;
      },
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'originalDocumentCode',
      key: 'originalDocumentCode',
      width: 200,
      render: (originalDocumentCode: string, record: DebtTransactionModel) => {
        let link;
        switch (record.originalDocumentType) {
          case 'sales_order':
            link = `/#/${lang}${routerLinks('SaleOrder')}/${record.originalDocumentId}`;
            break;
          case 'purchase_order':
            link = `/#/${lang}${routerLinks('PurchaseOrder')}/${record.originalDocumentId}`;
            break;
          case 'customer_return':
            link = `/#/${lang}${routerLinks('SalesOrderReturn')}/${record.originalDocumentId}`;
            break;
          case 'supplier_return':
            link = `/#/${lang}${routerLinks('PurchaseOrderReturn')}/${record.originalDocumentId}`;
            break;
          case 'receipt_voucher':
            link = `/#/${lang}${routerLinks('PhieuThu')}/${record.originalDocumentId}/edit`;
            break;
          case 'payment_voucher':
            link = `/#/${lang}${routerLinks('ChiPhi')}/${record.originalDocumentId}/edit`;
            break;
          default:
            link = `/#/${lang}${routerLinks('SaleOrder')}/${record.originalDocumentId}`;
        }
        return (
          <div>
            {record.originalDocumentId && (
              <a className="hover:underline" href={link} target="_blank" rel="noreferrer">
                {originalDocumentCode}
              </a>
            )}
          </div>
        );
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      width: 234,
    },
    {
      title: 'Công nợ giảm',
      dataIndex: 'changeAmount',
      key: 'changeAmount',
      align: 'right',
      width: 156,
      render: (changeAmount: number) => {
        return <p>{(changeAmount * -1)?.toLocaleString()}</p>;
      },
    },
  ];

  return (
    <Modal
      width={960}
      title={'Công nợ nhà cung cấp giảm trong kỳ'}
      open={debtTransactionFacade.isDebtReportModalNegativeSupplierVisible}
      onCancel={() => debtTransactionFacade.set({ isDebtReportModalNegativeSupplierVisible: false })}
      footer={null}
    >
      <Spin spinning={debtTransactionFacade.isLoading}>
        <div className="flex items-center gap-2">
          <h3>Nhà cung cấp:</h3>
          <div className="flex items-center gap-1">
            <p>{debtTransactionFacade.pagination?.content?.[0]?.entityName}</p>
            <p>-</p>
            <Link
              to={{
                pathname: `/${lang}${routerLinks('NhaCungCap')}/${debtTransactionFacade.pagination?.content?.[0]?.entityId}/view-detail`,
              }}
              target="_blank"
            >
              {debtTransactionFacade.pagination?.content?.[0]?.entityCode}
            </Link>
          </div>
        </div>
        <Table
          className="mt-4"
          columns={debtIncreaseSupplierColumns}
          dataSource={debtIncreaseSupplierData}
          pagination={false}
          footer={() => (
            <Pagination
              className={'flex justify-end px-2'}
              size="small"
              showSizeChanger
              current={debtTransactionFacade?.query?.page}
              pageSize={debtTransactionFacade?.pagination?.size}
              total={debtTransactionFacade?.pagination?.totalElements}
              pageSizeOptions={[20, 40, 60, 80]}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              onChange={(page, pageSize) => {
                debtTransactionFacade.get({
                  filter: JSON.stringify({
                    entityId: supplierId,
                    dateRange: currentFilter.dateRange,
                    debtAmountType: 0,
                  }),
                  page: page,
                  size: pageSize,
                });
                scrollLeftWhenChanging('.ant-table-body');
                scrollTopWhenChanging('.ant-table-body');
              }}
            />
          )}
        />
      </Spin>
    </Modal>
  );
}
