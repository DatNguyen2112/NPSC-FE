import { CloseOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { DrawerForm } from '@core/drawer';
import { EFormRuleType, EFormType, EStatusState } from '@models';
import ChucVuDrawer from '@pages/shared-directory/chuc-vu/chucVu.drawer';
import DrawerPhongBan from '@pages/shared-directory/phong-ban/DrawerPhongBan';
import {
  ChucVuFacade,
  CodeTypeFacade,
  EStatusNguoiDung,
  PhongBanFacade,
  QuanLyNguoiDung,
  QuanLyNguoiDungFacade,
  RightMapRoleFacade,
  RolesFacade,
} from '@store';
import { Badge, Button, Drawer, Form, Input, Modal, Select, Space, Spin, Tooltip } from 'antd';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

let data: any;
export const UserDrawer = () => {
  const [form] = Form.useForm();
  const quanLyNguoiDungFacade = QuanLyNguoiDungFacade();
  const phongBanFacade = PhongBanFacade();
  const rolesFacade = RolesFacade();
  const chucVuFacade = ChucVuFacade();
  const [modalApi, contextHolder] = Modal.useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const codeTypeFacade = CodeTypeFacade();
  const rightMapRoleFacade = RightMapRoleFacade();

  useEffect(() => {
    rolesFacade.get({});
    chucVuFacade.get({ size: -1 });
    phongBanFacade.get({ size: -1 });
    codeTypeFacade.getOrganizationStructure({ size: -1 });
    rightMapRoleFacade.getRightMapByListCode('USER');
  }, []);

  const maPhongBan = Form.useWatch('maPhongBan', form);

  useEffect(() => {
    switch (quanLyNguoiDungFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        quanLyNguoiDungFacade.get(JSON.parse(quanLyNguoiDungFacade.queryParams ?? ''));
        break;
      case EStatusState.getByIdFulfilled:
        const listItems = codeTypeFacade.organizationData?.content?.find(
          (item) => item?.code === quanLyNguoiDungFacade?.data?.phongBan?.code,
        )?.codeTypeItems;

        quanLyNguoiDungFacade.set({
          listItems: listItems,
        });

        data = {
          ...quanLyNguoiDungFacade.data,
          roleListCode: quanLyNguoiDungFacade.data?.listRole?.map((item: any) => item.code) ?? null,
          idChucVu: quanLyNguoiDungFacade?.data?.chucVu?.id ?? null,
          maPhongBan: quanLyNguoiDungFacade?.data?.phongBan?.code ?? null,
          maTo: quanLyNguoiDungFacade?.data?.toThucHien?.code ?? null,
        };

        for (const key in data) {
          if (key !== 'password') form.setFieldValue(key, data[key as keyof QuanLyNguoiDung]);
        }
        break;
      case EStatusNguoiDung.lockFulfilled:
      case EStatusNguoiDung.unlockFulfilled:
        quanLyNguoiDungFacade.getById({ id: searchParams.get('id') ?? '', keyState: '' });
        break;
    }
  }, [quanLyNguoiDungFacade.status]);

  useEffect(() => {
    if (quanLyNguoiDungFacade.isVisible && searchParams.has('id')) {
      quanLyNguoiDungFacade.getById({ id: searchParams.get('id') ?? '', keyState: '' });
    }
  }, [quanLyNguoiDungFacade.isVisible]);

  const onFinish = (values: any) => {
    // console.log(values)
    if (quanLyNguoiDungFacade.isEdit) {
      return quanLyNguoiDungFacade.put({ ...values, id: searchParams.get('id') ?? '' });
    } else if (quanLyNguoiDungFacade.isPassword) {
      return quanLyNguoiDungFacade.changePassword(quanLyNguoiDungFacade.data?.id ?? '', {
        password: values.password ?? '',
      });
    } else return quanLyNguoiDungFacade.post({ ...values });
  };

  const handleCloseDrawer = () => {
    quanLyNguoiDungFacade.set({ isVisible: false });
  };
  const RenderValues = ({ lable, value }: { lable: string; value: any }) => (
    <div className="flex mb-4">
      <p className="w-36">{lable}</p>
      <div className="font-semibold">{value}</div>
    </div>
  );
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

  useEffect(() => {
    switch (rolesFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        rolesFacade.get({});
        form.setFieldValue('roleListCode', [rolesFacade.data?.code]);
        break;
    }
  }, [rolesFacade.status]);

  useEffect(() => {
    switch (chucVuFacade.status) {
      case EStatusState.putFulfilled:
      case EStatusState.postFulfilled:
        chucVuFacade.get({ size: -1 });
        form.setFieldValue('idChucVu', chucVuFacade.data?.id);
        break;
    }
  }, [chucVuFacade.status]);

  // useEffect(() => {
  //   switch (phongBanFacade.status) {
  //     case EStatusState.putFulfilled:
  //     case EStatusState.postFulfilled:
  //       phongBanFacade.get({ size: -1 });
  //       form.setFieldValue('idPhongBan', phongBanFacade.data?.id);
  //       break;
  //   }
  // }, [phongBanFacade.status]);

  return (
    <>
      {contextHolder}
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
            {!rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('ADD') ||
            (searchParams.get('id') && !rightMapRoleFacade?.rightDatas?.[0]?.rightCodes?.includes('UPDATE')) ? (
              <Tooltip title="Bạn không có quyền thực hiện thao tác này">
                <Button
                  disabled={true}
                  className={`${quanLyNguoiDungFacade.isDetail ? 'hidden' : 'block'}`}
                  type={'primary'}
                  block
                  onClick={form.submit}
                >
                  Lưu lại
                </Button>
              </Tooltip>
            ) : (
              <Button
                className={`${quanLyNguoiDungFacade.isDetail ? 'hidden' : 'block'}`}
                type={'primary'}
                block
                onClick={form.submit}
              >
                Lưu lại
              </Button>
            )}
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
        <DrawerPhongBan />
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
                <Form.Item
                  name="maPhongBan"
                  label="Phòng ban"
                  rules={[{ required: true, message: 'Hãy chọn thông tin cho phòng ban' }]}
                >
                  <Select
                    allowClear
                    onChange={(value) => {
                      if (value) {
                        const listItems = codeTypeFacade.organizationData?.content?.find(
                          (item) => item?.code === value,
                        )?.codeTypeItems;

                        quanLyNguoiDungFacade.set({
                          listItems: listItems,
                        });

                        form.setFieldsValue({
                          maTo: null,
                        });
                      } else {
                        quanLyNguoiDungFacade.set({
                          listItems: [],
                        });

                        form.setFieldsValue({
                          maTo: null,
                        });
                      }
                    }}
                    options={codeTypeFacade.organizationData?.content?.map((item) => {
                      return { label: item.title, value: item.code };
                    })}
                    // suffixIcon={
                    //   <Tooltip title="Thêm mới phòng ban">
                    //     <PlusCircleOutlined
                    //       className="text-green-600"
                    //       onClick={() => phongBanFacade.set({ isVisible: true, data: undefined, isEdit: false })}
                    //     />
                    //   </Tooltip>
                    // }
                    placeholder={'Chọn phòng ban'}
                    filterOption={(input: string, option?: { label?: string; value?: string }) =>
                      (option?.label ?? '').toLowerCase().includes(input?.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item name="maTo" label="Tổ">
                  <Select
                    allowClear
                    disabled={
                      form.getFieldValue('maPhongBan') === undefined || form.getFieldValue('maPhongBan') === null
                    }
                    options={quanLyNguoiDungFacade?.listItems?.map((item: any) => {
                      return { label: item.title, value: item.code };
                    })}
                    // suffixIcon={
                    //   <Tooltip title="Thêm mới phòng ban">
                    //     <PlusCircleOutlined
                    //       className="text-green-600"
                    //       onClick={() => phongBanFacade.set({ isVisible: true, data: undefined, isEdit: false })}
                    //     />
                    //   </Tooltip>
                    // }
                    placeholder={'Chọn tổ'}
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
    </>
  );
};
