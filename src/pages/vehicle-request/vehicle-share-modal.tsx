import { VehicleRequestFacade } from '@store';
import { Modal } from 'antd';
import { FC } from 'react';
import { CheckOutlined, CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatDayjsDate, lang, routerLinks } from '@utils';

const VehicleShareModal: FC = () => {
  const vehicleRequestFacade = VehicleRequestFacade();

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <ExclamationCircleFilled className="text-[22px] text-yellow-500" />
          Yêu cầu xin xe bị trùng!
        </div>
      }
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={!!vehicleRequestFacade.sharingModalForRequestId}
      onOk={() => {
        if (vehicleRequestFacade.sharingModalNextAction === 'approve') {
          vehicleRequestFacade.approveVehicleSharing(
            vehicleRequestFacade.sharingModalForRequestId ?? '',
            vehicleRequestFacade.shareableRequests?.map((x) => x.id) || [],
          );
        } else if (vehicleRequestFacade.sharingModalNextAction === 'submit') {
          vehicleRequestFacade.submitVehicleSharing(
            vehicleRequestFacade.sharingModalForRequestId ?? '',
            vehicleRequestFacade.shareableRequests?.map((x) => x.id) || [],
          );
        }
      }}
      onCancel={() => vehicleRequestFacade.set({ sharingModalForRequestId: undefined })}
      okText="Xác nhận"
      okButtonProps={{ icon: <CheckOutlined /> }}
      cancelText="Hủy bỏ"
      cancelButtonProps={{ icon: <CloseOutlined /> }}
      confirmLoading={vehicleRequestFacade.isLoading}
    >
      <div className="pl-[34px] space-y-3">
        {vehicleRequestFacade.shareableRequests?.map((x) => (
          <div key={x.id}>
            <p>
              Yêu cầu xin xe này bị trùng với yêu cầu{' '}
              <Link
                to={`/${lang}${routerLinks('VehicleRequest')}/${x.id}`}
                className="hover:underline"
                onClick={() => {
                  vehicleRequestFacade.set({
                    sharingModalForRequestId: undefined,
                  });
                }}
              >
                {x.requestCode}
              </Link>
              :
            </p>
            <p>
              Người sử dụng xe: {x.user.name} ({x.numPassengers} người)
            </p>
            <p>
              Thời gian sử dụng: {formatDayjsDate(x.startDateTime)} - {formatDayjsDate(x.endDateTime)}
            </p>
            <p>
              Xe: {x.requestedVehicle?.bienSoXe} ({x.requestedVehicle?.loaiXe?.tenLoaiXe})
            </p>
            <p>Điểm xuất phát: {x.departureLocation}</p>
            <p>Nơi đến: {x.destinationLocation}</p>
          </div>
        ))}
        {vehicleRequestFacade.sharingModalNextAction === 'approve' && <p>Bạn có muốn ghép xe?</p>}
        {vehicleRequestFacade.sharingModalNextAction === 'submit' && <p>Bạn có muốn gửi duyệt đề nghị ghép xe?</p>}
      </div>
    </Modal>
  );
};

export default VehicleShareModal;
