import { App, Avatar, Button, Form, Input, Modal, Select } from 'antd';
import { FC, useEffect, useMemo, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import {
  CodeTypeFacade,
  EstatusVehicleRequest,
  RightMapRoleFacade,
  UserFacade,
  VehicleRequestExportConfig,
  VehicleRequestFacade,
} from '@store';
import { DefaultOptionType } from 'antd/es/select';
import { formatPhoneNumber, isLoadAllData, uuidv4 } from '@utils';

const ExportConfigModal: FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const vehicleRequestFacade = VehicleRequestFacade();
  const codeTypeFacade = CodeTypeFacade();
  const rightMapFacade = RightMapRoleFacade();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userFacade = UserFacade();
  const defaultValues = useMemo(() => {
    return {
      companyName: vehicleRequestFacade.exportConfig?.companyName || '',
      departmentName: vehicleRequestFacade.exportConfig?.departmentName || undefined,
      vehicleCoordinatorId: vehicleRequestFacade.exportConfig?.vehicleCoordinatorId || undefined,
    };
  }, [vehicleRequestFacade.exportConfig]);

  const userList = useMemo(
    () =>
      (userFacade.pagination?.content ?? []).map(
        (x) =>
          ({
            label: x.name,
            value: x.id,
            avatarUrl: x.avatarUrl,
            phoneNumber: x.phoneNumber,
            departmentCode: x.maPhongBan,
            position: x.chucVu?.tenChucVu,
          }) satisfies DefaultOptionType,
      ),
    [userFacade.pagination],
  );

  const onOpen = () => {
    if (!codeTypeFacade.organizationData) {
      codeTypeFacade.getOrganizationStructure({ size: -1 });
    }
    if (!isLoadAllData(userFacade)) {
      userFacade.get({ size: -1 });
    }
    if (!vehicleRequestFacade.exportConfig) {
      vehicleRequestFacade.getExportConfig();
    }
    form.setFieldsValue(defaultValues);
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
  };

  const onFinish = (values: VehicleRequestExportConfig) => {
    const messageKey = uuidv4();
    message.loading({ content: 'Đang cập nhật thông tin...', duration: 60000, key: messageKey });
    vehicleRequestFacade.updateExportConfig(values).finally(() => {
      message.destroy(messageKey);
      message.success('Cập nhật thông tin thành công');
    });
  };

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [defaultValues, form]);

  useEffect(() => {
    switch (vehicleRequestFacade.status) {
      case EstatusVehicleRequest.updateExportConfigFulfilled:
        onClose();
        vehicleRequestFacade.getExportConfig();
        break;
    }
  }, [vehicleRequestFacade.status]);

  return (
    <>
      {rightMapFacade.rightData?.rightCodes?.includes('CONFIGPRINT') && (
        <Button icon={<SettingOutlined />} onClick={onOpen}>
          Thiết lập giấy xin xe
        </Button>
      )}
      <Modal
        title="Thiết lập giấy xin xe"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={form.submit}
        onCancel={onClose}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={vehicleRequestFacade.isExportConfigLoading}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={defaultValues}>
          <Form.Item label="Tên công ty" name="companyName">
            <Input placeholder="Nhập tên công ty" />
          </Form.Item>
          <Form.Item label="Tên đơn vị" name="departmentName">
            <Input placeholder="Nhập tên đơn vị" />
          </Form.Item>
          <Form.Item label="Phụ trách điều xe" name="vehicleCoordinatorId">
            <Select
              loading={userFacade.isLoading}
              options={userList}
              optionRender={(item) => (
                <div className="flex items-center gap-3">
                  <Avatar
                    size={28}
                    className={`${!item.data.avatarUrl ? 'bg-green-500' : ''}`}
                    src={item.data.avatarUrl}
                  >
                    {!item.data.avatarUrl && item.data.label?.charAt(0)}
                  </Avatar>
                  <div className="flex-1 pr-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.data.label}</span>
                      <span className="text-gray-500 text-xs">{item.data.position}</span>
                    </div>
                    <div className="text-gray-500 text-xs flex flex-wrap gap-1">
                      <span className="font-medium">SĐT:</span>
                      {formatPhoneNumber(item.data.phoneNumber)}
                    </div>
                  </div>
                </div>
              )}
              placeholder="Chọn phụ trách điều xe"
              showSearch
              optionFilterProp="label"
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExportConfigModal;
