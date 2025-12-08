import React, { Fragment, useEffect, useMemo } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Spin,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  PrinterOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatDayjsDate, lang, routerLinks, uuidv4 } from '@utils';
import {
  ActivityHistory,
  EstatusVehicleRequest,
  RightMapRoleFacade,
  vehicleRequestAction,
  VehicleRequestFacade,
  vehicleRequestPriority,
  vehicleRequestStatus,
  VehicleRequestViewModel,
} from '@store';
import { EStatusState } from '@models';
import { customMessage } from 'src';
import { DescriptionsItemType } from 'antd/es/descriptions';
import VehicleShareModal from './vehicle-share-modal';
import { unwrapResult } from '@reduxjs/toolkit';

interface DescriptionsItemTypeExtended extends Omit<DescriptionsItemType, 'children'> {
  isAvailable?: boolean;
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
          {!isLoading && x.isAvailable && x.children()}
          {!isLoading && !x.isAvailable && <span>-</span>}
        </div>
      ),
    } satisfies DescriptionsItemType;
  });
}

const ActivityMessage: React.FC<{ activityHistory: ActivityHistory }> = ({ activityHistory: lichSu }) => {
  const messagePortions: (string | [string])[] = [[lichSu.createdByUserFullName]];

  switch (lichSu.action) {
    case vehicleRequestAction.CREATE:
      messagePortions.push('đã tạo yêu cầu xin xe');
      break;
    case vehicleRequestAction.UPDATE:
      messagePortions.push('đã chỉnh sửa yêu cầu xin xe');
      break;
    case vehicleRequestAction.SUBMIT:
      messagePortions.push('đã gửi duyệt yêu cầu xin xe');
      break;
    case vehicleRequestAction.SUBMIT_SHARING:
      messagePortions.push('đã gửi duyệt yêu cầu ghép xe');
      break;
    case vehicleRequestAction.APPROVE:
      messagePortions.push('đã duyệt yêu cầu xin xe');
      break;
    case vehicleRequestAction.APPROVE_SHARING:
      messagePortions.push('đã xác nhận ghép xe');
      break;
    case vehicleRequestAction.REJECT:
      messagePortions.push('đã từ chối yêu cầu xin xe');
      break;
    case vehicleRequestAction.DELETE:
      messagePortions.push('đã xoá yêu cầu xin xe');
      break;
  }
  return (
    <p>
      {messagePortions.map((x, i) => (
        <React.Fragment key={i}>{Array.isArray(x) ? <span className="font-medium">{x}</span> : x} </React.Fragment>
      ))}
    </p>
  );
};

const VehicleRequestDetail: React.FC = () => {
  const { id } = useParams();
  const vehicleRequestFacade = VehicleRequestFacade();
  const rightMapFacade = RightMapRoleFacade();
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [rejectForm] = Form.useForm();
  const itemsTimeLine = useMemo(
    () =>
      (vehicleRequestFacade.data?.activityHistories ?? []).map((item: ActivityHistory) => {
        function showRejectReason() {
          const lines = item.description?.split(/\r\n|\n/g) ?? [];

          modal.info({
            title: 'Lý do từ chối',
            content: lines ? (
              <>
                {lines.map((x, i) => (
                  <p key={i}>{x}</p>
                ))}
              </>
            ) : (
              <span className="italic opacity-85 font-medium">Lý do trống</span>
            ),
          });
        }

        return {
          key: item.id,
          color: 'blue',
          children: (
            <div>
              <div>
                <ActivityMessage activityHistory={item} />
              </div>
              {item.action === vehicleRequestAction.REJECT && (
                <Button
                  className="h-fit p-0 border-none text-xs"
                  type="link"
                  color="primary"
                  onClick={() => showRejectReason()}
                >
                  Xem lý do từ chối
                </Button>
              )}
              <div className="text-gray-500">{formatDayjsDate(item.createdOnDate)}</div>
            </div>
          ),
        };
      }),
    [vehicleRequestFacade.data?.activityHistories],
  );
  const basicInfoItems = useMemo(
    () =>
      addColonAndFallback(
        [
          {
            label: 'Mã yêu cầu',
            isAvailable: vehicleRequestFacade.data?.requestCode,
            children: () => vehicleRequestFacade.data?.requestCode,
          },
          {
            label: 'Trạng thái',
            isAvailable: vehicleRequestFacade.data?.status,
            children: () => (
              <Tag
                color={
                  vehicleRequestStatus[vehicleRequestFacade.data.status as keyof typeof vehicleRequestStatus].color
                }
                className="rounded-full"
              >
                {vehicleRequestStatus[vehicleRequestFacade.data.status as keyof typeof vehicleRequestStatus].label ||
                  vehicleRequestFacade.data.status}
              </Tag>
            ),
          },
          {
            label: 'Người tạo',
            isAvailable: vehicleRequestFacade.data?.createdByUserName,
            children: () => vehicleRequestFacade.data?.createdByUserName,
          },
          {
            label: 'Ngày tạo',
            isAvailable: vehicleRequestFacade.data?.createdOnDate,
            children: () => formatDayjsDate(vehicleRequestFacade.data.createdOnDate),
          },
          {
            label: 'Đơn vị sử dụng',
            isAvailable: vehicleRequestFacade.data?.departmentName,
            children: () => vehicleRequestFacade.data.departmentName,
          },
          {
            label: 'Dự án',
            isAvailable: vehicleRequestFacade.data?.projectId,
            children: () => (
              <Link
                to={`/${lang}${routerLinks('Construction')}/${vehicleRequestFacade.data.projectId}/construction-monitor`}
              >
                {vehicleRequestFacade.data?.projectName}
              </Link>
            ),
          },
          {
            label: 'Nội dung công việc',
            isAvailable: vehicleRequestFacade.data?.purpose,
            children: () => vehicleRequestFacade.data?.purpose,
            span: 2,
          },
        ],
        vehicleRequestFacade.isFormLoading,
      ),
    [vehicleRequestFacade.data, vehicleRequestFacade.isFormLoading],
  );
  const detailInfoItems = useMemo(
    () =>
      addColonAndFallback(
        [
          {
            label: 'Người sử dụng',
            isAvailable: vehicleRequestFacade.data?.user.name,
            children: () => vehicleRequestFacade.data?.user.name,
          },
          {
            label: 'Số điện thoại',
            isAvailable: vehicleRequestFacade.data?.contactPhone,
            children: () => vehicleRequestFacade.data?.contactPhone,
          },
          {
            label: 'Ngày bắt đầu sử dụng',
            isAvailable: vehicleRequestFacade.data?.startDateTime,
            children: () => formatDayjsDate(vehicleRequestFacade.data.startDateTime),
          },
          {
            label: 'Ngày kết thúc',
            isAvailable: vehicleRequestFacade.data?.endDateTime,
            children: () => formatDayjsDate(vehicleRequestFacade.data.endDateTime),
          },
          {
            label: 'Số lượng người',
            isAvailable: vehicleRequestFacade.data?.numPassengers,
            children: () => vehicleRequestFacade.data?.numPassengers,
          },
          {
            label: 'Độ ưu tiên',
            isAvailable: vehicleRequestFacade.data?.priority,
            children: () => {
              const priority =
                vehicleRequestPriority[vehicleRequestFacade.data.priority as keyof typeof vehicleRequestPriority];
              return (
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      backgroundColor: priority.color,
                    }}
                    className="size-1.5 rounded-full"
                  ></div>
                  <span>{priority.label}</span>
                </div>
              );
            },
          },
          {
            label: 'Loại xe',
            isAvailable: vehicleRequestFacade.data?.requestedVehicle?.loaiXe?.tenLoaiXe,
            children: () => vehicleRequestFacade.data?.requestedVehicle?.loaiXe?.tenLoaiXe,
          },
          {
            label: 'Xe',
            isAvailable: vehicleRequestFacade.data?.requestedVehicle?.bienSoXe,
            children: () => vehicleRequestFacade.data?.requestedVehicle?.bienSoXe,
          },
          {
            label: 'Điểm xuất phát',
            isAvailable: vehicleRequestFacade.data?.departureLocation,
            children: () => vehicleRequestFacade.data?.departureLocation,
          },
          {
            label: 'Nơi đến',
            isAvailable: vehicleRequestFacade.data?.destinationLocation,
            children: () => vehicleRequestFacade.data?.destinationLocation,
          },
          {
            label: 'Ghi chú',
            isAvailable: vehicleRequestFacade.data?.note,
            children: () => vehicleRequestFacade.data?.note,
            span: 2,
          },
        ],
        vehicleRequestFacade.isFormLoading,
      ),
    [vehicleRequestFacade.data, vehicleRequestFacade.isFormLoading],
  );

  useEffect(() => {
    if ((id && vehicleRequestFacade.data?.id !== id) || !vehicleRequestFacade.data?.activityHistories) {
      vehicleRequestFacade.getById({ id });
    }

    // return () => {
    //   vehicleRequestFacade.set({ data: undefined });
    // };
  }, [id, vehicleRequestFacade.data]);

  useEffect(() => {
    rightMapFacade.getRightMapByCode('VEHICLEREQUEST');
  }, []);

  const handleDelete = () => {
    modal.confirm({
      title: 'Xác nhận xóa yêu cầu xin xe?',
      content: 'Bạn có chắc chắn muốn xóa yêu cầu này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          customMessage.loading({ content: 'Đang xoá yêu cầu...', duration: 60000, key: messageKey });
          vehicleRequestFacade.delete(id).finally(() => {
            customMessage.destroy(messageKey);
          });
        }
      },
    });
  };

  const handleSendForApproval = () => {
    modal.confirm({
      title: 'Xác nhận gửi duyệt yêu cầu xin xe?',
      content: 'Bạn có chắc chắn muốn gửi duyệt yêu cầu xin xe này không?',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          customMessage.loading({ content: 'Đang gửi duyệt...', duration: 60000, key: messageKey });
          vehicleRequestFacade.submitForApproval(id).finally(() => {
            customMessage.destroy(messageKey);
          });
        }
      },
    });
  };

  const handleApprove = () => {
    modal.confirm({
      title: `Xác nhận phê duyệt yêu cầu ${
        vehicleRequestFacade.data.status === vehicleRequestStatus.PendingApproval.value ? 'xin' : 'ghép'
      } xe?`,
      content: `Bạn có chắc chắn muốn phê duyệt yêu cầu ${
        vehicleRequestFacade.data.status === vehicleRequestStatus.PendingApproval.value ? 'xin' : 'ghép'
      } xe này không?`,
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: () => {
        if (id) {
          const messageKey = uuidv4();
          customMessage.loading({ content: 'Đang phê duyệt...', duration: 60000, key: messageKey });
          let promise: Promise<any> | undefined = undefined;

          if (vehicleRequestFacade.data.status === vehicleRequestStatus.PendingApproval.value) {
            promise = vehicleRequestFacade.processApproval({ id, isApproved: true, rejectNotes: '' });
          } else if (vehicleRequestFacade.data.status === vehicleRequestStatus.WaitingForSharing.value) {
            promise = vehicleRequestFacade.approveVehicleSharing(id);
          }

          promise?.finally(() => {
            customMessage.destroy(messageKey);
          });
        }
      },
    });
  };

  const handleReject = () => {
    modal.confirm({
      title: 'Từ chối yêu cầu',
      content: (
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectNotes"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <Input.TextArea className="w-full" placeholder="Nhập lý do từ chối yêu cầu xin xe" rows={2} />
          </Form.Item>
        </Form>
      ),
      okText: 'Từ chối',
      cancelText: 'Hủy bỏ',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const values = await rejectForm.validateFields();

          if (id) {
            const messageKey = uuidv4();
            customMessage.loading({ content: 'Đang xử lý...', duration: 60000, key: messageKey });
            vehicleRequestFacade
              .processApproval({ id, isApproved: false, rejectNotes: values.rejectNotes })
              .then(() => {
                vehicleRequestFacade.getById({ id });
              })
              .finally(() => {
                customMessage.destroy(messageKey);
                rejectForm.resetFields();
              });
          }
        } catch {
          return await Promise.reject();
        }
      },
      onCancel: () => {
        rejectForm.resetFields();
      },
    });
  };

  useEffect(() => {
    switch (vehicleRequestFacade.status) {
      case EStatusState.deleteFulfilled:
        vehicleRequestFacade.set({ status: EStatusState.idle });
        navigate(`/${lang}${routerLinks('VehicleRequest')}`);
        break;
      case EstatusVehicleRequest.submitForApprovalFulfilled:
      case EstatusVehicleRequest.processApprovalFulfilled:
      case EstatusVehicleRequest.submitVehicleSharingFulfilled:
      case EstatusVehicleRequest.approveVehicleSharingFulfilled:
        vehicleRequestFacade.set({ status: EStatusState.idle });
        vehicleRequestFacade.getById({ id });
        break;
    }
  }, [vehicleRequestFacade.status]);

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-12 bg-white shadow-header px-4 flex justify-between items-center">
          <Button
            variant="link"
            size="large"
            onClick={() => {
              if (location.key === 'default') {
                navigate(`/${lang}${routerLinks('VehicleRequest')}`);
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
            {[
              vehicleRequestStatus.Draft.value,
              vehicleRequestStatus.Rejected.value,
              vehicleRequestStatus.Approved.value,
              vehicleRequestStatus.Shared.value,
            ].includes(vehicleRequestFacade.data?.status) && (
              <>
                <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>
                  Xoá yêu cầu
                </Button>
              </>
            )}
            {[vehicleRequestStatus.Draft.value, vehicleRequestStatus.Rejected.value].includes(
              vehicleRequestFacade.data?.status,
            ) && (
              <>
                <Tooltip
                  title={
                    !rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVAL')
                      ? 'Bạn không có quyền thực hiện thao tác này'
                      : null
                  }
                >
                  <Button
                    icon={<SendOutlined />}
                    disabled={!rightMapFacade.rightData?.rightCodes?.includes('SENDAPPROVAL')}
                    variant="outlined"
                    color="primary"
                    onClick={handleSendForApproval}
                  >
                    Gửi duyệt
                  </Button>
                </Tooltip>
                <Tooltip
                  title={
                    !rightMapFacade.rightData?.rightCodes?.includes('UPDATE')
                      ? 'Bạn không có quyền thực hiện thao tác này'
                      : null
                  }
                >
                  <Link to={`/${lang}${routerLinks('VehicleRequest')}/${id}/edit`}>
                    <Button
                      icon={<EditOutlined />}
                      type="primary"
                      disabled={!rightMapFacade.rightData?.rightCodes?.includes('UPDATE')}
                    >
                      Sửa yêu cầu
                    </Button>
                  </Link>
                </Tooltip>
              </>
            )}
            {[vehicleRequestStatus.PendingApproval.value, vehicleRequestStatus.WaitingForSharing.value].includes(
              vehicleRequestFacade.data?.status,
            ) && (
              <>
                <Tooltip
                  title={
                    !rightMapFacade.rightData?.rightCodes?.includes('APPROVE')
                      ? 'Bạn không có quyền thực hiện thao tác này'
                      : null
                  }
                >
                  <Button
                    icon={<CloseOutlined />}
                    variant="solid"
                    color="danger"
                    onClick={handleReject}
                    disabled={!rightMapFacade.rightData?.rightCodes?.includes('APPROVE')}
                  >
                    Từ chối
                  </Button>
                </Tooltip>
                <Tooltip
                  title={
                    !rightMapFacade.rightData?.rightCodes?.includes('APPROVE')
                      ? 'Bạn không có quyền thực hiện thao tác này'
                      : null
                  }
                >
                  <Button
                    icon={<CheckOutlined />}
                    type="primary"
                    onClick={handleApprove}
                    disabled={!rightMapFacade.rightData?.rightCodes?.includes('APPROVE')}
                  >
                    Phê duyệt
                  </Button>
                </Tooltip>
              </>
            )}
            {[
              vehicleRequestStatus.PendingApproval.value,
              vehicleRequestStatus.Approved.value,
              vehicleRequestStatus.WaitingForSharing.value,
              vehicleRequestStatus.Shared.value,
            ].includes(vehicleRequestFacade.data?.status) &&
              rightMapFacade.rightData?.rightCodes?.includes('PRINT') && (
                <Button
                  icon={<PrinterOutlined />}
                  loading={vehicleRequestFacade.isPdfLoading}
                  onClick={() => {
                    if (vehicleRequestFacade.data?.id) {
                      vehicleRequestFacade.printPdf(vehicleRequestFacade.data.id);
                    }
                  }}
                  disabled={vehicleRequestFacade.isPdfLoading}
                >
                  In giấy xin xe
                </Button>
              )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          <Row gutter={16}>
            {/* Left Column - Basic Information */}
            <Col span={16}>
              <Card title="Thông tin cơ bản" className="mb-4">
                <Descriptions labelStyle={{ width: '152px' }} items={basicInfoItems} colon={false} column={2} />
              </Card>

              <Card title="Thông tin chi tiết">
                <Descriptions labelStyle={{ width: '152px' }} items={detailInfoItems} colon={false} column={2} />
                {(vehicleRequestFacade.data?.sharingGroupRequests?.length ?? 0) > 0 && (
                  <p className="mt-2 italic">
                    {vehicleRequestFacade.data?.status == vehicleRequestStatus.WaitingForSharing.value ? (
                      <span>Yêu cầu xin xe này đang chờ được ghép với yêu cầu </span>
                    ) : (
                      <span>Yêu cầu xin xe này đã được ghép với yêu cầu </span>
                    )}
                    {vehicleRequestFacade.data?.sharingGroupRequests?.map((x: VehicleRequestViewModel, i: number) => (
                      <Fragment key={x.id}>
                        <Link to={`/${lang}${routerLinks('VehicleRequest')}/${x.id}`} className="hover:underline">
                          {x.requestCode}
                        </Link>
                        {i < vehicleRequestFacade.data.sharingGroupRequests.length - 1 ? ', ' : ''}
                      </Fragment>
                    ))}
                  </p>
                )}
              </Card>
            </Col>

            {/* Right Column - Processing History */}
            <Col span={8}>
              <Card title="Lịch sử xử lý" className="h-full">
                <Timeline items={itemsTimeLine} />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      <VehicleShareModal />
    </>
  );
};

export default VehicleRequestDetail;
