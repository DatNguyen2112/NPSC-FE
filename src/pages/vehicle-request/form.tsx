import React, { useEffect, useMemo } from 'react';
import {
  Avatar,
  Button,
  Card,
  CheckboxOptionType,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
} from 'antd';
import { formatPhoneNumber, isLoadAllData, lang, routerLinks, uuidv4 } from '@utils';
import { LeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CodeTypeFacade,
  ConstructionFacade,
  GlobalFacade,
  LoaiXeFacade,
  PhuongTienFacade,
  UserFacade,
  VehicleRequestFacade,
  vehicleRequestPriority,
  VehicleRequestViewModel,
} from '@store';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { EStatusState } from '@models';
import { customMessage } from 'src';

const priorityRadioItems: CheckboxOptionType[] = Object.values(vehicleRequestPriority).map((x) => ({
  label: x.label,
  value: x.value,
  style: {
    color: x.color,
    fontWeight: 500,
  },
}));

const VehicleRequestForm: React.FC = () => {
  const { editId } = useParams();
  const location = useLocation();
  const globalFacade = GlobalFacade();
  const vehicleRequestFacade = VehicleRequestFacade();
  const userFacade = UserFacade();
  const codeTypeFacade = CodeTypeFacade();
  const phuongTienFacade = PhuongTienFacade();
  const constructionFacade = ConstructionFacade();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      form.setFieldsValue({
        projectId: location?.state?.constructionId,
      });
    }
  }, []);

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
          }) satisfies DefaultOptionType,
      ),
    [userFacade.pagination],
  );
  const organizationList = useMemo(() => {
    return (codeTypeFacade.organizationData?.content ?? []).map(
      (x) =>
        ({
          label: x.title,
          value: x.id,
          code: x.code,
        }) satisfies DefaultOptionType,
    );
  }, [codeTypeFacade.organizationData]);
  const phuongTienList = useMemo(
    () =>
      (phuongTienFacade.pagination?.content ?? []).map(
        (x) =>
          ({
            label: `${x.bienSoXe} - ${x.loaiXe?.tenLoaiXe}`,
            value: x.id,
          }) satisfies DefaultOptionType,
      ),
    [phuongTienFacade.pagination],
  );
  const constructionList = useMemo(
    () =>
      (constructionFacade.pagination?.content ?? []).map(
        (x) =>
          ({
            label: x.name,
            value: x.id,
          }) satisfies DefaultOptionType,
      ),
    [constructionFacade.pagination],
  );

  function onFinish(data: any) {
    if (data.usageTime) {
      data.startDateTime = dayjs(data.usageTime[0]).format('YYYY-MM-DDTHH:mm:ss[Z]');
      data.endDateTime = dayjs(data.usageTime[1]).format('YYYY-MM-DDTHH:mm:ss[Z]');
      delete data.usageTime;
    }

    const messageKey = uuidv4();

    if (editId) {
      customMessage.loading({ content: 'Đang cập nhật yêu cầu...', duration: 60000, key: messageKey });
      vehicleRequestFacade.put({ ...data, id: editId }).finally(() => {
        customMessage.destroy(messageKey);
      });
    } else {
      customMessage.loading({ content: 'Đang tạo yêu cầu...', duration: 60000, key: messageKey });
      vehicleRequestFacade.post(data).finally(() => {
        customMessage.destroy(messageKey);
      });
    }
  }

  function setFormValues(vehicle: VehicleRequestViewModel) {
    form.setFieldsValue({
      ...vehicle,
      usageTime: [dayjs(vehicle.startDateTime), dayjs(vehicle.endDateTime)],
    });
  }

  useEffect(() => {
    if (!isLoadAllData(userFacade)) {
      userFacade.get({ size: -1 });
    }
    if (codeTypeFacade.organizationData?.size != -1) {
      codeTypeFacade.getOrganizationStructure({ size: -1 });
    }
    if (!isLoadAllData(phuongTienFacade)) {
      phuongTienFacade.get({ size: -1 });
    }
    if (!isLoadAllData(constructionFacade)) {
      constructionFacade.get({ size: -1 });
    }
  }, []);

  useEffect(() => {
    if (!editId && userFacade.pagination) {
      const user = userFacade.pagination.content.find((x) => x.id === globalFacade.user?.userModel?.id);
      form.setFieldsValue({
        userId: globalFacade.user?.userModel?.id,
        contactPhone: user?.phoneNumber,
        departmentId: organizationList.find((x) => x.code === user?.maPhongBan)?.value,
      });
    }
  }, [userFacade.pagination, organizationList]);

  useEffect(() => {
    if (!editId) return;

    const vehicle = vehicleRequestFacade.pagination?.content.find((x) => x.id === editId);

    if (vehicle) {
      setFormValues(vehicle);
    } else {
      vehicleRequestFacade.getById({ id: editId });
    }

    return () => {
      vehicleRequestFacade.set({ data: undefined });
    };
  }, [editId]);

  useEffect(() => {
    switch (vehicleRequestFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        vehicleRequestFacade.set({ status: EStatusState.idle });
        navigate(-1);
        break;
      case EStatusState.getByIdFulfilled:
        if (editId) {
          setFormValues(vehicleRequestFacade.data);
        }
        break;
    }
  }, [vehicleRequestFacade.status]);

  return (
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
        <Button icon={<SaveOutlined />} type="primary" onClick={form.submit} disabled={vehicleRequestFacade.isLoading}>
          Lưu yêu cầu
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 overflow-auto">
        <Form
          form={form}
          layout="vertical"
          className="h-full"
          onFinish={onFinish}
          initialValues={{
            priority: vehicleRequestPriority.Medium.value,
            numPassengers: 1,
            departureLocation: 'Xí nghiệp tư vấn',
          }}
        >
          <Row gutter={16}>
            {/* Left Column - Request Information */}
            <Col span={16}>
              <Card title="Thông tin yêu cầu" className="h-full">
                <Row gutter={16}>
                  {/* User */}
                  <Col span={12}>
                    <Form.Item
                      label="Người sử dụng xe"
                      name="userId"
                      rules={[{ required: true, message: 'Vui lòng chọn người sử dụng xe' }]}
                    >
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
                            <div>
                              <span className="font-medium">{item.data.label}</span>
                              <div className="text-gray-500 text-xs flex flex-wrap gap-1">
                                <span className="font-medium">SĐT:</span>
                                {formatPhoneNumber(item.data.phoneNumber)}
                              </div>
                            </div>
                          </div>
                        )}
                        onChange={(value) => {
                          const user = userList.find((x) => x.value === value);
                          form.setFieldsValue({
                            contactPhone: user?.phoneNumber,
                            departmentId: organizationList.find((x) => x.code === user?.departmentCode)?.value,
                          });
                        }}
                        placeholder="Chọn người sử dụng xe"
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                  </Col>

                  {/* Phone Number */}
                  <Col span={12}>
                    <Form.Item label="Số điện thoại" name="contactPhone">
                      <Input spellCheck={false} autoComplete="off" autoCorrect="off" placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>

                  {/* Department */}
                  <Col span={12}>
                    <Form.Item
                      label="Đơn vị sử dụng xe"
                      name="departmentId"
                      rules={[{ required: true, message: 'Vui lòng chọn đơn vị sử dụng xe' }]}
                    >
                      <Select
                        loading={codeTypeFacade.isLoading}
                        options={organizationList}
                        placeholder="Chọn đơn vị sử dụng xe"
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                  </Col>

                  {/* Project */}
                  <Col span={12}>
                    <Form.Item label="Dự án" name="projectId">
                      <Select
                        loading={constructionFacade.isLoading}
                        options={constructionList}
                        placeholder="Chọn dự án"
                        showSearch
                        optionFilterProp="label"
                        allowClear
                      />
                    </Form.Item>
                  </Col>

                  {/* Usage Time */}
                  <Col span={12}>
                    <Form.Item
                      label="Thời gian sử dụng"
                      name="usageTime"
                      rules={[{ required: true, message: 'Vui lòng chọn thời gian sử dụng' }]}
                    >
                      <DatePicker.RangePicker
                        className="w-full"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        format="DD-MM-YYYY"
                      />
                    </Form.Item>
                  </Col>

                  {/* Number of Passengers */}
                  <Col span={12}>
                    <Form.Item
                      label="Số lượng người"
                      name="numPassengers"
                      rules={[{ required: true, message: 'Vui lòng nhập số lượng người' }]}
                    >
                      <InputNumber placeholder="Nhập số lượng người" min={1} className="w-full" />
                    </Form.Item>
                  </Col>

                  {/* Departure Location */}
                  <Col span={24}>
                    <Form.Item
                      label="Điểm xuất phát"
                      name="departureLocation"
                      rules={[{ required: true, message: 'Vui lòng nhập điểm xuất phát' }]}
                    >
                      <Input
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        placeholder="Nhập điểm xuất phát"
                      />
                    </Form.Item>
                  </Col>

                  {/* Destination */}
                  <Col span={24}>
                    <Form.Item
                      label="Nơi đến"
                      name="destinationLocation"
                      rules={[{ required: true, message: 'Vui lòng nhập nơi đến' }]}
                    >
                      <Input spellCheck={false} autoComplete="off" autoCorrect="off" placeholder="Nhập nơi đến" />
                    </Form.Item>
                  </Col>

                  {/* Purpose */}
                  <Col span={24}>
                    <Form.Item
                      label="Nội dung công việc"
                      name="purpose"
                      rules={[{ required: true, message: 'Vui lòng nhập nội dung công việc' }]}
                    >
                      <Input.TextArea
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        rows={4}
                        placeholder="Nhập nội dung công việc"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Right Column - Additional Information */}
            <Col span={8}>
              <Card title="Thông tin bổ sung" className="h-full">
                {/* Priority */}
                <Form.Item label="Độ ưu tiên" name="priority">
                  <Radio.Group options={priorityRadioItems}></Radio.Group>
                </Form.Item>

                {/* Vehicle */}
                <Form.Item label="Xe" name="requestedVehicleId">
                  <Select
                    loading={phuongTienFacade.isLoading}
                    options={phuongTienList}
                    placeholder="Chọn xe"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                  />
                </Form.Item>

                {/* Notes */}
                <Form.Item label="Ghi chú" name="notes">
                  <Input.TextArea
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    rows={5}
                    placeholder="Nhập ghi chú"
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default VehicleRequestForm;
