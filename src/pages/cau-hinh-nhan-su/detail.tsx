import { CauHinhNhanSuFacade } from '@store';
import { Button, Card, Divider, Drawer, Flex, Modal, Space, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { formatCurrency, formatCurrencyNumber } from '@utils';

const ModalDetail: React.FC = () => {
  const cauHinhNhanSuFacade = CauHinhNhanSuFacade();

  const [searchParams, setSearchParams] = useSearchParams();

  const handleClose = () => {
    cauHinhNhanSuFacade.set({ isDetail: false });
  };

  console.log(cauHinhNhanSuFacade.data);

  return (
    <Drawer
      title={'Xem chi tiết cấu hình nhân sự'}
      width={450}
      open={cauHinhNhanSuFacade.isDetail}
      closable={false}
      forceRender
      closeIcon={false}
      extra={<Button type={'text'} onClick={handleClose} icon={<CloseOutlined />} />}
      afterOpenChange={(visible) => {
        if (!visible) {
          cauHinhNhanSuFacade.set({ isCustomerSelected: false });
          setSearchParams(
            (prev) => {
              prev.delete('id');
              return prev;
            },
            { replace: true },
          );
        }
      }}
      footer={
        <Space className={'flex justify-start'}>
          <Button type={'default'} block onClick={handleClose}>
            Đóng
          </Button>
        </Space>
      }
    >
      <>
        <Spin spinning={cauHinhNhanSuFacade.isLoading}>
          <div>
            <div>
              <h1 className="font-semibold mb-4">Thông tin cấu hình nhân sự</h1>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Mã nhân sự</span>
                    <span className="text-[#0F1824]">: {cauHinhNhanSuFacade.data?.ma ?? '---'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Tên nhân sự</span>
                    <span className="text-[#0F1824]">: {cauHinhNhanSuFacade.data?.tenNhanSu ?? '---'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Chức vụ</span>
                    <span className="text-[#0F1824]">: {cauHinhNhanSuFacade.data?.chucVu?.tenChucVu ?? '---'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Phòng ban</span>
                    <span className="text-[#0F1824]">: {cauHinhNhanSuFacade.data?.phongBan?.tenPhongBan ?? '---'}</span>
                  </div>
                </div>
              </div>
            </div>
            <Divider />
            <div>
              <h1 className="font-semibold mb-4">Thông tin lương</h1>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Lương cơ bản</span>
                    <span className="text-[#0F1824]">
                      : {formatCurrencyNumber(cauHinhNhanSuFacade.data?.luongCoBan ?? 0) ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Ăn ca</span>
                    <span className="text-[#0F1824]">
                      : {formatCurrencyNumber(cauHinhNhanSuFacade.data?.anCa ?? 0) ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Điện thoại</span>
                    <span className="text-[#0F1824]">
                      : {formatCurrencyNumber(cauHinhNhanSuFacade.data?.dienThoai ?? 0) ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Trang phục</span>
                    <span className="text-[#0F1824]">
                      : {formatCurrencyNumber(cauHinhNhanSuFacade.data?.trangPhuc ?? 0) ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Divider />
            <div>
              <h1 className="font-semibold mb-4">Thông tin khác</h1>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Ngày tạo</span>
                    <span className="text-[#0F1824]">
                      : {dayjs(cauHinhNhanSuFacade?.data?.createdOnDate).format('DD-MM-YYYY HH:mm') ?? '---'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Ngày cập nhật cuối</span>
                    <span className="text-[#0F1824]">
                      : {dayjs(cauHinhNhanSuFacade.data?.lastModifiedOnDate).format('DD-MM-YYYY HH:mm') ?? '---'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Người tạo</span>
                    <span className="text-[#0F1824]">: {cauHinhNhanSuFacade.data?.createdByUserName ?? '---'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-40 text-lable">Người chỉnh sửa cuối</span>
                    <span className="text-[#0F1824]">
                      : {cauHinhNhanSuFacade.data?.lastModifiedByUserName ?? '---'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </>
    </Drawer>
    // <Modal
    //   title={'Xem chi tiết cấu hình nhân sự'}
    //   className="modal-fullScreen"
    //   centered
    //   width="100vw"
    //   open={cauHinhNhanSuFacade.isDetail}
    //   cancelButtonProps={{ disabled: true }}
    //   closable
    //   afterOpenChange={(visible) => {
    //     if (!visible) {
    //       cauHinhNhanSuFacade.set({ isCustomerSelected: false });
    //       setSearchParams(
    //         (prev) => {
    //           prev.delete('id');
    //           return prev;
    //         },
    //         { replace: true },
    //       );
    //     }
    //   }}
    //   onCancel={handleClose}
    //   footer={
    //     <div className={`bg-white w-full bottom-0 right-0 z-50 fixed border p-5`}>
    //       <Flex align="center" justify="start">
    //         <Button onClick={handleClose}>Hủy bỏ</Button>
    //       </Flex>
    //     </div>
    //   }
    // >
    //   <>
    //     <Spin spinning={cauHinhNhanSuFacade.isLoading}>
    //       <div className="bg-gray-100 p-8">
    //         <div className="max-w-3xl mx-auto">
    //           <Card title="Chi Tiết Cấu Hình Nhân Sự" className="mb-4">
    //             <h2 className="text-lg font-semibold">Thông Tin Nhân Sự</h2>
    //             <p>
    //               <strong>Mã:</strong> {cauHinhNhanSuFacade.data?.ma}
    //             </p>
    //             <p>
    //               <strong>Tên Nhân Sự:</strong> {cauHinhNhanSuFacade.data?.tenNhanSu}
    //             </p>
    //           </Card>
    //           <Card title="Chức Vụ" className="mb-4">
    //             <p>
    //               <strong>Mã Chức Vụ:</strong> {cauHinhNhanSuFacade.data?.chucVu.maChucVu}
    //             </p>
    //             <p>
    //               <strong>Tên Chức Vụ:</strong> {cauHinhNhanSuFacade.data?.chucVu.tenChucVu}
    //             </p>
    //             <p>
    //               <strong>Ghi Chú:</strong> {cauHinhNhanSuFacade.data?.chucVu.ghiChu}
    //             </p>
    //           </Card>
    //           <Card title="Thông Tin Lương" className="mb-4">
    //             <p>
    //               <strong>Lương Cơ Bản:</strong> {cauHinhNhanSuFacade.data?.luongCoBan.toLocaleString()} VND
    //             </p>
    //             <p>
    //               <strong>Ăn Ca:</strong> {cauHinhNhanSuFacade.data?.anCa.toLocaleString()} VND
    //             </p>
    //             <p>
    //               <strong>Điện Thoại:</strong> {cauHinhNhanSuFacade.data?.dienThoai.toLocaleString()} VND
    //             </p>
    //             <p>
    //               <strong>Trang Phục:</strong> {cauHinhNhanSuFacade.data?.trangPhuc.toLocaleString()} VND
    //             </p>
    //           </Card>
    //           <Card title="Thông Tin Khác">
    //             <p>
    //               <strong>Created By User ID:</strong> {cauHinhNhanSuFacade.data?.createdByUserId}
    //             </p>
    //             <p>
    //               <strong>Last Modified By User ID:</strong> {cauHinhNhanSuFacade.data?.lastModifiedByUserId}
    //             </p>
    //             <p>
    //               <strong>Last Modified On Date:</strong> {cauHinhNhanSuFacade.data?.lastModifiedOnDate}
    //             </p>
    //             <p>
    //               <strong>Created On Date:</strong> {cauHinhNhanSuFacade.data?.createdOnDate}
    //             </p>
    //             <p>
    //               <strong>Created By User Name:</strong> {cauHinhNhanSuFacade.data?.createdByUserName}
    //             </p>
    //             <p>
    //               <strong>Last Modified By User Name:</strong> {cauHinhNhanSuFacade.data?.lastModifiedByUserName}
    //             </p>
    //           </Card>
    //         </div>
    //       </div>
    //     </Spin>
    //   </>
    // </Modal>
  );
};

export default ModalDetail;
