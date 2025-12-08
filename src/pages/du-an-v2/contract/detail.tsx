import React, { useEffect, useMemo, useRef } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Row,
  Skeleton,
  Space,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, LeftOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatDayjsDate, lang, routerLinks, uuidv4 } from '@utils';
import {
  ContractFacade,
  contractImplementationStatuses,
  AppendixAttachment,
  ContractAppendix,
  contractSupplementaryContractRequires,
  contractAcceptanceDocumentStatuses,
  contractInvoiceStatuses,
  ActivityHistory,
  contractAction,
} from '@store';
import { EStatusState } from '@models';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { RightMapRoleFacade } from 'src/store/right-map-role';
import Descriptions, { DescriptionsItemType } from 'antd/es/descriptions';

interface DescriptionsItemTypeExtended extends Omit<DescriptionsItemType, 'children'> {
  isAvailable?: boolean;
  align?: 'start' | 'end' | 'center';
  children: () => React.ReactNode;
}

function addColonAndFallback(items: DescriptionsItemTypeExtended[], isLoading?: boolean): DescriptionsItemType[] {
  return items.map((x) => {
    return {
      ...x,
      children: (
        <div className="flex gap-2 items-start w-full">
          <span className="text-black/50">:</span>
          <Skeleton active title={false} loading={isLoading} paragraph={{ rows: 1 }} />
          {!isLoading && x.isAvailable && (
            <div style={{ justifyContent: x.align ?? 'start' }} className="flex-1 flex">
              {x.children()}
            </div>
          )}
          {!isLoading && !x.isAvailable && <span>-</span>}
        </div>
      ),
    } satisfies DescriptionsItemType;
  });
}

export function formatCurrency(value: number | string): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const ContractDetail: React.FC = () => {
  const { id } = useParams();
  const appendixCardRef = useRef<HTMLDivElement>(null);
  const contractFacade = ContractFacade();
  const rightMapFacade = RightMapRoleFacade();
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const taxRatePercentage = contractFacade.data?.taxRatePercentage ?? 0;
  const valueBeforeVatAmount = contractFacade.data?.valueBeforeVatAmount ?? 0;
  const acceptanceValueBeforeVatAmount = contractFacade.data?.acceptanceValueBeforeVatAmount ?? 0;
  const paidAmount = contractFacade.data?.paidAmount ?? 0;
  const valueAmount = Math.round(valueBeforeVatAmount + (valueBeforeVatAmount * taxRatePercentage) / 100);
  const acceptanceValueAmount = Math.round(
    acceptanceValueBeforeVatAmount + (acceptanceValueBeforeVatAmount * taxRatePercentage) / 100,
  );
  const remainValue = acceptanceValueBeforeVatAmount - paidAmount;
  const needExtendContract = useMemo(() => {
    if (contractFacade.data?.contractSigningDate && contractFacade.data?.contractDurationDays != null) {
      return dayjs(contractFacade.data.contractSigningDate)
        .add(contractFacade.data.contractDurationDays, 'day')
        .isBefore(dayjs());
    }
  }, [contractFacade.data]);
  const itemsTimeLine = useMemo(
    () =>
      (contractFacade.data?.activityHistories ?? []).map((item: ActivityHistory) => {
        let msg = '';

        switch (item.action) {
          case contractAction.CREATE:
            msg = ' đã tạo hợp đồng';
            break;
          case contractAction.UPDATE:
            msg = ' đã chỉnh sửa thông tin hợp đồng';
            break;
          case contractAction.DELETE:
            msg = ' đã xoá hợp đồng';
            break;
        }
        return {
          key: item.id,
          color: 'blue',
          children: (
            <div>
              <div>
                <span className="font-medium">{item.createdByUserFullName}</span>
                {msg}
              </div>
              <div className="text-gray-500 text-xs">{formatDayjsDate(item.createdOnDate, 'DD/MM/YYYY HH:mm')}</div>
            </div>
          ),
        };
      }),
    [contractFacade.data?.activityHistories],
  );

  // Contract general info items (gộp basic và detail)
  const contractGeneralInfoItems = useMemo(
    () =>
      addColonAndFallback(
        [
          {
            label: 'Tên công trình/dự án',
            isAvailable: contractFacade.data?.construction?.name,
            children: () => (
              <Link
                className="font-medium"
                to={`/${lang}${routerLinks('Construction')}/${contractFacade.data?.construction.id}/construction-monitor`}
              >
                {contractFacade.data?.construction?.name}
              </Link>
            ),
            span: 2,
          },
          {
            label: 'Mã hợp đồng',
            isAvailable: contractFacade.data?.code,
            children: () => (
              <div className="flex items-center gap-3">
                <Typography.Text>{contractFacade.data?.code}</Typography.Text>
                {needExtendContract && <span className="text-red-500 text-xs">Cần gia hạn hợp đồng!</span>}
              </div>
            ),
          },
          {
            label: 'Giai đoạn',
            isAvailable: contractFacade.data?.templateStageName,
            children: () => contractFacade.data?.templateStageName,
          },
          {
            label: 'Ngày phê duyệt h/đồng',
            isAvailable: contractFacade.data?.approvalDate,
            children: () => formatDayjsDate(contractFacade.data.approvalDate),
          },
          {
            label: 'Tình hình thực hiện',
            isAvailable: contractFacade.data?.implementationStatus,
            children: () => {
              const implementationStatus =
                contractImplementationStatuses[
                  contractFacade.data.implementationStatus as keyof typeof contractImplementationStatuses
                ];
              return (
                <Tag className="rounded-full mx-0" color={implementationStatus.color}>
                  {implementationStatus.label}
                </Tag>
              );
            },
          },
          {
            label: 'Quản lý dự án',
            isAvailable: contractFacade.data?.construction?.ownerTypeCode,
            children: () =>
              `${contractFacade.data?.construction?.investor?.name} - ${contractFacade.data?.construction?.ownerTypeCode}`,
          },
          {
            label: 'Năm giao A',
            isAvailable: contractFacade.data?.assignmentAYear,
            children: () => contractFacade.data?.assignmentAYear,
          },
          {
            label: 'Cấp điện áp',
            isAvailable: contractFacade.data?.construction?.voltage,
            children: () => (
              <Tag
                className="rounded-full mx-0"
                color={contractFacade.data?.construction?.voltage?.description || undefined}
              >
                {contractFacade.data?.construction?.voltage?.title}
              </Tag>
            ),
          },
          {
            label: 'Dịch vụ tư vấn',
            isAvailable: contractFacade.data?.consultingService,
            children: () => (
              <Tag
                className="rounded-full mx-0"
                color={contractFacade.data?.consultingService?.description || undefined}
              >
                {contractFacade.data?.consultingService?.title}
              </Tag>
            ),
          },
          {
            label: 'Số hợp đồng',
            isAvailable: contractFacade.data?.contractNumber,
            children: () => contractFacade.data?.contractNumber,
          },
          {
            label: 'Thời hạn hợp đồng',
            isAvailable: contractFacade.data?.contractDurationDays,
            children: () => `${contractFacade.data?.contractDurationDays} ngày`,
          },
          {
            label: 'Ngày ký hợp đồng',
            isAvailable: contractFacade.data?.contractSigningDate,
            children: () => formatDayjsDate(contractFacade.data.contractSigningDate),
          },
          {
            label: 'Tình hình lập HS NT',
            isAvailable: contractFacade.data?.acceptanceDocumentStatus,
            children: () => {
              const acceptanceDocumentStatus =
                contractAcceptanceDocumentStatuses[
                  contractFacade.data.acceptanceDocumentStatus as keyof typeof contractAcceptanceDocumentStatuses
                ];
              return (
                <Tag className="rounded-full mx-0" color={acceptanceDocumentStatus.color}>
                  {acceptanceDocumentStatus.label}
                </Tag>
              );
            },
          },
        ],
        contractFacade.isFormLoading,
      ),
    [contractFacade.data, contractFacade.isFormLoading, needExtendContract],
  );

  // Contract value info items
  const contractValueInfoItems = useMemo(
    () =>
      addColonAndFallback(
        [
          {
            label: 'Giá trị HĐ (trước VAT)',
            isAvailable: contractFacade.data?.valueBeforeVatAmount !== undefined,
            align: 'end',
            children: () => `${formatCurrency(contractFacade.data?.valueBeforeVatAmount ?? 0)} VND`,
          },
          {
            label: 'Sản lượng dự kiến',
            isAvailable: contractFacade.data?.expectedVolume !== undefined,
            align: 'end',
            children: () => `${formatCurrency(contractFacade.data?.expectedVolume ?? 0)} VND`,
          },
          {
            label: 'Giá trị NT (trước VAT)',
            isAvailable: contractFacade.data?.acceptanceValueBeforeVatAmount !== undefined,
            align: 'end',
            children: () => `${formatCurrency(contractFacade.data?.acceptanceValueBeforeVatAmount ?? 0)} VND`,
          },
          {
            label: `Giá trị HĐ (VAT ${contractFacade.data?.taxRatePercentage ?? 0}%)`,
            isAvailable: valueAmount !== undefined,
            align: 'end',
            children: () => `${formatCurrency(valueAmount)} VND`,
          },
          {
            label: `Giá trị NT (VAT ${contractFacade.data?.taxRatePercentage ?? 0}%)`,
            isAvailable: acceptanceValueAmount !== undefined,
            align: 'end',
            children: () => `${formatCurrency(acceptanceValueAmount)} VND`,
          },
          {
            label: 'Giá trị đã xuất hóa đơn',
            isAvailable: contractFacade.data?.paidAmount !== undefined,
            align: 'end',
            children: () => `${formatCurrency(contractFacade.data?.paidAmount ?? 0)} VND`,
          },
          {
            label: 'Giá trị còn lại',
            isAvailable: remainValue !== undefined,
            align: 'end',
            children: () => `${formatCurrency(remainValue)} VND`,
          },
        ],
        contractFacade.isFormLoading,
      ),
    [contractFacade.data, contractFacade.isFormLoading, valueAmount, acceptanceValueAmount, remainValue],
  );

  // Contract additional info items
  const contractAdditionalInfoItems = useMemo(
    () =>
      addColonAndFallback(
        [
          {
            label: 'Ngày phê duyệt thiết kế',
            isAvailable: contractFacade.data?.designApprovalDate,
            children: () => formatDayjsDate(contractFacade.data.designApprovalDate),
          },
          {
            label: 'Tình hình xuất hóa đơn',
            isAvailable:
              contractFacade.data?.invoiceStatus &&
              contractInvoiceStatuses[contractFacade.data.invoiceStatus as keyof typeof contractInvoiceStatuses],
            children: () => (
              <Tag
                className="rounded-full mx-0"
                color={
                  contractInvoiceStatuses[contractFacade.data.invoiceStatus as keyof typeof contractInvoiceStatuses]
                    .color
                }
              >
                {
                  contractInvoiceStatuses[contractFacade.data.invoiceStatus as keyof typeof contractInvoiceStatuses]
                    .label
                }
              </Tag>
            ),
          },
          {
            label: 'Ngày lập BB bàn giao',
            isAvailable: contractFacade.data?.handoverRecordDate,
            children: () => formatDayjsDate(contractFacade.data.handoverRecordDate),
          },
          {
            label: 'Ngày lập BB KS HT',
            isAvailable: contractFacade.data?.siteSurveyRecordDate,
            children: () => formatDayjsDate(contractFacade.data.siteSurveyRecordDate),
          },
          {
            label: 'Ngày lập BB NT KS',
            isAvailable: contractFacade.data?.surveyAcceptanceRecordDate,
            children: () => formatDayjsDate(contractFacade.data.surveyAcceptanceRecordDate),
          },
          {
            label: 'Kế hoạch nghiệm thu',
            isAvailable: contractFacade.data?.acceptancePlan,
            children: () => contractFacade.data?.acceptancePlan,
          },
          {
            label: 'Vướng mắc',
            isAvailable: contractFacade.data?.issues,
            children: () => contractFacade.data?.issues,
            span: 2,
          },
          {
            label: 'Ghi chú',
            isAvailable: contractFacade.data?.notes,
            children: () => contractFacade.data?.notes,
            span: 2,
          },
        ],
        contractFacade.isFormLoading,
      ),
    [contractFacade.data, contractFacade.isFormLoading],
  );

  // Contract acceptance info items
  const contractAcceptanceInfoItems = useMemo(
    () =>
      addColonAndFallback(
        [
          {
            label: 'Tháng dự kiến duyệt',
            isAvailable: contractFacade.data?.expectedApprovalMonth,
            children: () => contractFacade.data?.expectedApprovalMonth,
          },
          {
            label: 'Tháng dự kiến NT',
            isAvailable: contractFacade.data?.expectedAcceptanceMonth,
            children: () => contractFacade.data?.expectedAcceptanceMonth,
          },
          {
            label: 'Ngày xuất hóa đơn',
            isAvailable: !!contractFacade.data?.invoiceIssuanceDates?.length,
            children: () => (
              <div className="flex flex-col">
                <Typography.Text>
                  {contractFacade.data.invoiceIssuanceDates.map((date: string) => formatDayjsDate(date)).join(', ')}
                </Typography.Text>
              </div>
            ),
          },
          {
            label: 'Năm nghiệm thu',
            isAvailable: contractFacade.data?.acceptanceYear,
            children: () => contractFacade.data?.acceptanceYear,
          },
        ],
        contractFacade.isFormLoading,
      ),
    [contractFacade.data, contractFacade.isFormLoading],
  );

  // Handle delete contract
  const handleDelete = () => {
    modal.confirm({
      title: 'Xác nhận xoá hợp đồng?',
      content: 'Bạn có chắc chắn muốn xoá hợp đồng này không?',
      okText: 'Xoá',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          message.loading({ content: 'Đang xoá hợp đồng...', duration: 60000, key: messageKey });
          contractFacade.delete(id).finally(() => {
            message.destroy(messageKey);
          });
        }
      },
    });
  };

  // Appendix columns
  const appendixColumns: ColumnsType<ContractAppendix> = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nội dung phụ lục',
      dataIndex: 'content',
      key: 'content',
      width: 300,
    },
    {
      title: 'File đính kèm',
      dataIndex: 'attachment',
      key: 'attachment',
      width: 180,
      ellipsis: true,
      render: (attachment: AppendixAttachment) =>
        attachment ? (
          <a href={attachment.fileUrl} className="flex flex-nowrap gap-2 font-medium" target="_blank" rel="noreferrer">
            <PaperClipOutlined />
            <span className="text-ellipsis overflow-hidden">{attachment.fileName}</span>
          </a>
        ) : (
          '-'
        ),
    },
  ];

  // Fetch contract data
  useEffect(() => {
    if (id && contractFacade.data?.id !== id) {
      contractFacade.getById({ id });
    }
  }, [id, contractFacade.data]);

  // Handle status changes
  useEffect(() => {
    if (contractFacade.status === EStatusState.deleteFulfilled) {
      contractFacade.set({ status: EStatusState.idle });
      navigate(`/${lang}${routerLinks('Contract')}`);
    }
  }, [contractFacade.status]);

  useEffect(() => {
    rightMapFacade.getRightMapByCode('CONTRACT');
  }, []);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="h-12 bg-white shadow-header px-4 flex justify-between items-center">
        <Button
          variant="link"
          size="large"
          onClick={() => {
            if (location.key === 'default') {
              navigate(`/${lang}${routerLinks('Contract')}`);
            } else {
              navigate(-1);
            }
          }}
          className="text-neutral-500 p-0 h-fit border-none shadow-none"
          icon={<LeftOutlined />}
        >
          Quay lại
        </Button>
        <div className="flex gap-2">
          <Tooltip
            title={
              !rightMapFacade.rightData?.rightCodes?.includes('DELETE')
                ? 'Bạn không có quyền thực hiện thao tác này'
                : null
            }
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleDelete}
              disabled={!rightMapFacade.rightData?.rightCodes?.includes('DELETE')}
            >
              Xóa hợp đồng
            </Button>
          </Tooltip>
          <Tooltip
            title={
              !rightMapFacade.rightData?.rightCodes?.includes('UPDATE')
                ? 'Bạn không có quyền thực hiện thao tác này'
                : null
            }
          >
            <div>
              <Link
                to={`/${lang}${routerLinks('Contract')}/${id}/edit`}
                className={`${!rightMapFacade.rightData?.rightCodes?.includes('UPDATE') ? 'pointer-events-none' : ''}`}
              >
                <Button
                  icon={<EditOutlined />}
                  type="primary"
                  disabled={!rightMapFacade.rightData?.rightCodes?.includes('UPDATE')}
                >
                  Sửa hợp đồng
                </Button>
              </Link>
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-[2fr_1fr] grid-rows-[repeat(3,auto)] gap-4">
          <Card title="Thông tin chung">
            <Descriptions labelStyle={{ width: '168px' }} items={contractGeneralInfoItems} colon={false} column={2} />
          </Card>

          <Card title="Thông tin giá trị">
            <Descriptions labelStyle={{ width: '168px' }} items={contractValueInfoItems} colon={false} column={1} />
          </Card>

          <Card title="Thông tin bổ sung">
            <Descriptions
              labelStyle={{ width: '168px' }}
              items={contractAdditionalInfoItems}
              colon={false}
              column={2}
            />
          </Card>

          <Card title="Thông tin nghiệm thu" className="h-full overflow-hidden">
            <Descriptions
              labelStyle={{ width: '168px' }}
              items={contractAcceptanceInfoItems}
              colon={false}
              column={1}
            />
          </Card>

          <Card
            title={
              <div className="flex items-center gap-2">
                Thông tin phụ lục
                {contractFacade.data?.supplementaryContractRequired && (
                  <Tag
                    color={
                      contractSupplementaryContractRequires[
                        contractFacade.data
                          .supplementaryContractRequired as keyof typeof contractSupplementaryContractRequires
                      ].color
                    }
                    className="rounded-full mx-0"
                  >
                    {
                      contractSupplementaryContractRequires[
                        contractFacade.data
                          .supplementaryContractRequired as keyof typeof contractSupplementaryContractRequires
                      ].label
                    }
                  </Tag>
                )}
              </div>
            }
            className="h-full overflow-hidden"
            ref={appendixCardRef}
          >
            {contractFacade.isFormLoading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : contractFacade.data?.appendices && contractFacade.data.appendices.length > 0 ? (
              <Table
                dataSource={contractFacade.data.appendices}
                columns={appendixColumns}
                pagination={false}
                rowKey={(record) => record.content}
              />
            ) : (
              <Empty description="Không có phụ lục" />
            )}
          </Card>

          <Card title="Lịch sử xử lý" className="h-full overflow-hidden">
            <Timeline items={itemsTimeLine} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
