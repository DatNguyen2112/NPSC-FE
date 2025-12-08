import { Button, Drawer, Form, Space, Input, Select, DatePicker, Avatar, CheckboxOptionType } from 'antd';
import React, { useMemo } from 'react';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import {
  CodeTypeFacade,
  filterFieldNameMap,
  LoaiXeFacade,
  PhuongTienFacade,
  UserFacade,
  VehicleRequestFacade,
  vehicleRequestPriority,
} from '@store';
import { DefaultOptionType } from 'antd/es/select';
import { formatPhoneNumber, isLoadAllData } from '@utils';
import dayjs from 'dayjs';

interface FilterDrawerProps {
  filter: Record<string, any>;
  loadFunc: (filter: Record<string, any>, force?: boolean) => void;
}

const priorityRadioItems: CheckboxOptionType[] = Object.values(vehicleRequestPriority).map((x) => ({
  label: x.label,
  value: x.value,
  style: {
    color: x.color,
    fontWeight: 500,
  },
}));

const FilterDrawer: React.FC<FilterDrawerProps> = ({ filter, loadFunc }) => {
  const [form] = Form.useForm();
  const vehicleRequestFacade = VehicleRequestFacade();
  const userFacade = UserFacade();
  const codeTypeFacade = CodeTypeFacade();
  const loaiXeFacade = LoaiXeFacade();
  const phuongTienFacade = PhuongTienFacade();
  const selectedLoaiXeId = Form.useWatch('requestedVehicleTypeId', form);
  const userList = useMemo(
    () =>
      (userFacade.pagination?.content ?? []).map(
        (x) =>
          ({
            label: x.name,
            value: x.id,
            avatarUrl: x.avatarUrl,
            phoneNumber: x.phoneNumber,
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
        }) satisfies DefaultOptionType,
    );
  }, [codeTypeFacade.organizationData]);
  const loaiXeList = useMemo(
    () =>
      (loaiXeFacade.pagination?.content ?? []).map(
        (x) =>
          ({
            label: x.tenLoaiXe,
            value: x.id,
          }) satisfies DefaultOptionType,
      ),
    [loaiXeFacade.pagination],
  );
  const phuongTienList = useMemo(
    () =>
      (phuongTienFacade.pagination?.content ?? [])
        .filter((x) => x.loaiXeId === selectedLoaiXeId)
        .map(
          (x) =>
            ({
              label: x.bienSoXe,
              value: x.id,
            }) satisfies DefaultOptionType,
        ),
    [phuongTienFacade.pagination, selectedLoaiXeId],
  );

  const handleClose = () => {
    vehicleRequestFacade.set({ isFilterDrawerOpen: false });
  };

  const resetFilter = () => {
    form.resetFields();

    const emptyFilter = { ...filter };

    Object.keys(emptyFilter).forEach((x) => {
      emptyFilter[x] = undefined;
    });

    loadFunc(emptyFilter);
    vehicleRequestFacade.set({ isFilterDrawerOpen: false });
  };

  const onFinish = (values: any) => {
    if (values.createdDateRange) {
      values.createdDateRange = [
        dayjs(values.createdDateRange[0]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        dayjs(values.createdDateRange[1]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      ];
    }
    if (values.usageDateRange) {
      values.usageDateRange = [
        dayjs(values.usageDateRange[0]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
        dayjs(values.usageDateRange[1]).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      ];
    }

    loadFunc(values);
    vehicleRequestFacade.set({ isFilterDrawerOpen: false });
  };

  const onDrawerOpen = () => {
    vehicleRequestFacade.set({ isFilterDrawerOpen: true });

    if (!isLoadAllData(userFacade)) {
      userFacade.get({ size: -1 });
    }
    if (codeTypeFacade.organizationData?.size != -1) {
      codeTypeFacade.getOrganizationStructure({ size: -1 });
    }
    if (!isLoadAllData(loaiXeFacade)) {
      loaiXeFacade.get({ size: -1 });
    }
    if (!isLoadAllData(phuongTienFacade)) {
      phuongTienFacade.get({ size: -1 });
    }

    const createdDateRange = filter.createdDateRange
      ? [dayjs(filter.createdDateRange[0]), dayjs(filter.createdDateRange[1])]
      : undefined;
    const usageDateRange = filter.usageDateRange
      ? [dayjs(filter.usageDateRange[0]), dayjs(filter.usageDateRange[1])]
      : undefined;

    form.resetFields();
    form.setFieldsValue({
      ...filter,
      createdDateRange,
      usageDateRange,
    });
  };

  return (
    <>
      <Button icon={<FilterOutlined />} color="primary" variant="outlined" onClick={onDrawerOpen}>
        Bộ lọc
      </Button>
      <Drawer
        title="Bộ lọc"
        closeIcon={false}
        extra={<Button type={'text'} icon={<CloseOutlined />} onClick={handleClose} />}
        onClose={handleClose}
        open={vehicleRequestFacade.isFilterDrawerOpen}
        footer={
          <Space className={'flex justify-end'}>
            <Button onClick={resetFilter}>Xoá hết bộ lọc</Button>
            <Button type={'primary'} onClick={form.submit}>
              Lọc
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label={filterFieldNameMap.requestCode} name="requestCode">
            <Input placeholder="Nhập mã yêu cầu" />
          </Form.Item>

          <Form.Item label={filterFieldNameMap.createdByUserId} name="createdByUserId">
            <Select
              className="w-full"
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
              placeholder="Chọn người tạo"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label={filterFieldNameMap.priority} name="priority">
            <Select
              placeholder="Chọn độ ưu tiên"
              showSearch
              optionFilterProp="label"
              className="w-full"
              options={priorityRadioItems}
            />
          </Form.Item>

          <Form.Item label={filterFieldNameMap.createdDateRange} name="createdDateRange">
            <DatePicker.RangePicker
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              className="w-full"
            />
          </Form.Item>

          <Form.Item label={filterFieldNameMap.usageDateRange} name="usageDateRange">
            <DatePicker.RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} className="w-full" />
          </Form.Item>

          <Form.Item label={filterFieldNameMap.departmentId} name="departmentId">
            <Select
              loading={codeTypeFacade.isLoading}
              options={organizationList}
              placeholder="Chọn đơn vị sử dụng xe"
              showSearch
              optionFilterProp="label"
              className="w-full"
            />
          </Form.Item>

          <Form.Item label={filterFieldNameMap.userId} name="userId">
            <Select
              className="w-full"
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
              placeholder="Chọn người sử dụng xe"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item
              label={filterFieldNameMap.requestedVehicleTypeId}
              name="requestedVehicleTypeId"
              className="flex-1"
            >
              <Select
                loading={loaiXeFacade.isLoading}
                options={loaiXeList}
                placeholder="Chọn loại xe"
                showSearch
                optionFilterProp="label"
                allowClear
                className="w-full"
                onChange={() => {
                  form.setFieldValue('requestedVehicleId', undefined);
                }}
              />
            </Form.Item>

            {/* Vehicle */}
            <Form.Item label={filterFieldNameMap.requestedVehicleId} name="requestedVehicleId" className="flex-1">
              <Select
                loading={phuongTienFacade.isLoading}
                disabled={!selectedLoaiXeId}
                options={phuongTienList}
                placeholder="Chọn xe"
                showSearch
                optionFilterProp="label"
                allowClear
                className="w-full"
              />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </>
  );
};

export default FilterDrawer;
