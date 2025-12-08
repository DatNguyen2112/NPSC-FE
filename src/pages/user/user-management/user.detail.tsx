import React from 'react';
import { Badge, Button, Drawer, Form, Input, Modal, Select, Space, Spin, Tooltip } from 'antd';
import { CloseOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { DrawerForm } from '@core/drawer';
import { EFormRuleType, EFormType } from '@models';
import ChucVuDrawer from '@pages/shared-directory/chuc-vu/chucVu.drawer';
import { ChucVuFacade, QuanLyNguoiDungFacade, RolesFacade } from '@store';
import { useSearchParams } from 'react-router-dom';

export const UserDetail = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalApi, contextHolder] = Modal.useModal();
  const quanLyNguoiDungFacade = QuanLyNguoiDungFacade();
  const rolesFacade = RolesFacade();
  const chucVuFacade = ChucVuFacade();

  const RenderValues = ({ lable, value }: { lable: string; value: any }) => (
    <div className="flex mb-4">
      <p className="w-36">{lable}</p>
      <div className="font-semibold">{value}</div>
    </div>
  );
  const handleCloseDrawer = () => {};
  const onFinish = (values: any) => {};
  const handleEnableAccount = () => {
    modalApi.confirm({
      title: 'Thay đổi trạng thái tài khoản này?',
      content:
        'Bạn sắp khóa tài khoản người dùng này. Khi bị khóa, người dùng sẽ không thể đăng nhập hoặc sử dụng các tính năng của hệ thống. Bạn có chắc chắn muốn thực hiện không? ?',
      onOk: () => {
        quanLyNguoiDungFacade.data?.isLockedOut
          ? quanLyNguoiDungFacade.unlock(quanLyNguoiDungFacade.data.id ?? '')
          : quanLyNguoiDungFacade.lock(quanLyNguoiDungFacade.data?.id ?? '');
      },
      onCancel: () => {},
      cancelText: 'Huỷ bỏ',
      okText: 'Xác nhận',
    });
  };
  const renderTitle = () => {
    if (quanLyNguoiDungFacade.isEdit) {
      return 'Chỉnh sửa nhân sự';
    } else if (quanLyNguoiDungFacade.isDetail) {
      return 'Xem chi tiết nhân sự';
    } else if (quanLyNguoiDungFacade.isPassword) {
      return 'Đổi mật khẩu nhân sự';
    } else {
      return 'Thêm mới nhân sự';
    }
  };

  return (
    <Drawer
      title={renderTitle()}
      width={450}
      open={quanLyNguoiDungFacade.isVisible}
      onClose={handleCloseDrawer}
      maskClosable={false}
      closeIcon={false}
      afterOpenChange={(visible) => {
        if (!visible) {
          form.resetFields();
          setSearchParams(
            (prev) => {
              prev.delete('id');
              return prev;
            },
            { replace: true },
          );
        }
      }}
      extra={<Button icon={<CloseOutlined />} type={'text'} onClick={handleCloseDrawer} />}
      footer={
        <Space className={'flex justify-end'}>
          <Button type={'default'} block onClick={handleCloseDrawer}>
            Huỷ bỏ
          </Button>
          <Button
            className={`${quanLyNguoiDungFacade.data?.isLockedOut ? 'bg-yellow-500 hover:!bg-yellow-400' : ''} ${quanLyNguoiDungFacade.isDetail ? 'block' : 'hidden'}`}
            type={'primary'}
            danger={!quanLyNguoiDungFacade.data?.isLockedOut}
            onClick={() => handleEnableAccount}
          >
            {quanLyNguoiDungFacade.data?.isLockedOut ? 'Mở TK' : 'Khoá TK'}
          </Button>
          <Button
            className={`${quanLyNguoiDungFacade.isDetail ? 'hidden' : 'block'}`}
            type={'primary'}
            block
            onClick={form.submit}
          >
            Lưu lại
          </Button>
        </Space>
      }
    >
      <DrawerForm
        facade={rolesFacade}
        title={`${rolesFacade.isEdit ? 'Chỉnh sửa' : 'Thêm mới'} nhóm người dùng`}
        columns={[
          {
            title: 'Mã nhóm người dùng',
            name: 'code',
            formItem: {
              rules: [{ type: EFormRuleType.required }],
            },
          },
          {
            title: 'Tên nhóm người dùng',
            name: 'name',
            formItem: {
              rules: [{ type: EFormRuleType.required }],
            },
          },
          {
            title: 'Mô tả',
            name: 'description',
            formItem: {
              type: EFormType.textarea,
            },
          },
        ]}
        onSubmit={(values) => {
          if (rolesFacade?.data?.id) rolesFacade.put({ ...values, id: rolesFacade.data.id });
          else rolesFacade.post(values);
        }}
      />
      <ChucVuDrawer />
      <Spin spinning={quanLyNguoiDungFacade.isFormLoading}>
        <Form form={form} layout={'vertical'} onFinish={onFinish}>
          {quanLyNguoiDungFacade.isDetail ? (
            <>
              <RenderValues
                lable={'Nhóm người dùng:'}
                value={quanLyNguoiDungFacade.data?.listRole?.map((item: any) => <p key={item.id}>{item.name}</p>)}
              />
              <RenderValues lable={'Chức vụ:'} value={quanLyNguoiDungFacade.data?.chucVu?.tenChucVu ?? '---'} />
              <RenderValues lable={'Phòng ban:'} value={quanLyNguoiDungFacade.data?.phongBan?.tenPhongBan ?? '---'} />
              <RenderValues lable={'Tên tài khoản:'} value={quanLyNguoiDungFacade.data?.name ?? '---'} />
              <RenderValues lable={'Số điện thoại:'} value={quanLyNguoiDungFacade.data?.phoneNumber ?? '---'} />
              <RenderValues lable={'Email:'} value={quanLyNguoiDungFacade.data?.email ?? '---'} />
              <RenderValues
                lable={'Mật khẩu:'}
                value={<Input.Password variant="borderless" value={quanLyNguoiDungFacade.data?.plainTextPwd} />}
              />
              <RenderValues
                lable={'Trạng thái tài khoản:'}
                value={
                  <Badge
                    color={!quanLyNguoiDungFacade.data?.isLockedOut ? 'green' : ''}
                    status={quanLyNguoiDungFacade.data?.isLockedOut === true ? 'error' : 'processing'}
                    text={quanLyNguoiDungFacade.data?.isLockedOut === true ? 'Đã khóa' : 'Đang hoạt động'}
                  />
                }
              />
            </>
          ) : quanLyNguoiDungFacade.isPassword ? (
            <>
              <Form.Item
                name="password"
                label="Mật khẩu mới"
                rules={[
                  {
                    required: true,
                    // message: 'Please input your password!',
                  },
                ]}
                hasFeedback
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Xác nhận mật khẩu mới"
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    // message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Nhập lại mật khẩu mới không đáp ứng điều kiện quy định!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="roleListCode"
                label="Nhóm người dùng"
                rules={[{ required: true, message: 'Hãy chọn thông tin cho nhóm người dùng' }]}
              >
                <Select
                  suffixIcon={
                    <Tooltip title="Thêm mới nhóm người dùng">
                      <PlusCircleOutlined
                        className="text-green-600"
                        onClick={() => rolesFacade.set({ isVisible: true, data: undefined, isEdit: false })}
                      />
                    </Tooltip>
                  }
                  options={rolesFacade.pagination?.content.map((item) => {
                    return { label: item.name, value: item.code };
                  })}
                  placeholder={'Chọn nhóm người dùng'}
                  mode="multiple"
                  filterOption={(input: string, option?: { label?: string; value?: string }) =>
                    (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item
                name="idChucVu"
                label="Chức vụ"
                rules={[{ required: true, message: 'Hãy chọn thông tin cho chức vụ' }]}
              >
                <Select
                  options={chucVuFacade.pagination?.content.map((item) => {
                    return { label: item.tenChucVu, value: item.id };
                  })}
                  suffixIcon={
                    <Tooltip title="Thêm mới chức vụ">
                      <PlusCircleOutlined
                        className="text-green-600"
                        onClick={() => chucVuFacade.set({ isVisible: true, data: undefined, isEdit: false })}
                      />
                    </Tooltip>
                  }
                  placeholder={'Chọn chức vụ'}
                  filterOption={(input: string, option?: { label?: string; value?: string }) =>
                    (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item name="ma" label="Mã" rules={[{ required: true }]}>
                <Input placeholder={'Nhập mã'} />
              </Form.Item>
              <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
                <Input placeholder={'Nhập họ và tên'} />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
                <Input disabled={quanLyNguoiDungFacade.isEdit} placeholder={'Nhập email'} />
              </Form.Item>
              {/* <Form.Item name="userName" label="Tên người dùng" rules={[{ required: true }]}>
                <Input disabled={quanLyNguoiDungFacade.isEdit} placeholder={'Nhập tên người dùng'} />
              </Form.Item> */}
              <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, min: 10, max: 10 }]}>
                <Input type="number" placeholder={'Nhập số điện thoại'} />
              </Form.Item>
              {!quanLyNguoiDungFacade.isEdit && (
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                  <Input.Password placeholder={'Nhập mật khẩu'} />
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Spin>
    </Drawer>
  );
};
