import { Button, Card, Col, DatePicker, Divider, Flex, Form, Image, Input, Row, Select, Spin, Tabs } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import React from 'react';

import { EStatusGlobal, EStatusUser, GlobalFacade, User, UserFacade } from '@store';
import { lang, routerLinks } from '@utils';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { Upload } from '@core/upload';
const Page = () => {
  const { user, isLoading, profile, status, putProfile, data, changePasswordProfile } = GlobalFacade();
  const userFacade = UserFacade();
  const [formDetail] = Form.useForm();
  const [form] = Form.useForm();
  const [form2] = Form.useForm();

  useEffect(() => {
    profile();
  }, []);
  useEffect(() => {
    switch (status) {
      case EStatusGlobal.putProfileFulfilled:
        profile();
        break;
      case EStatusGlobal.profileFulfilled:
        for (const key in data?.userModel) {
          form.setFieldValue('password', null);
          if (key === 'birthdate' && data?.userModel[key]) {
            form.setFieldValue('birthdate', dayjs(data?.userModel[key]));
          } else form.setFieldValue(key, data?.userModel[key as keyof User]);

          formDetail.setFieldValue('password', null);
          if (key === 'birthdate' && data?.userModel[key]) {
            formDetail.setFieldValue('birthdate', dayjs(data?.userModel[key]));
          } else formDetail.setFieldValue(key, data?.userModel[key as keyof User]);
        }
        break;
    }
  }, [status]);

  useEffect(() => {
    switch (userFacade.status) {
      case EStatusUser.putAvatarFulfilled:
        profile();
        break;
    }
  }, [userFacade.status]);

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const [activeKey, setActiveKey] = useState<string>(tab || '1');
  useEffect(() => {
    if (tab) setActiveKey(tab);
    const navList = document.querySelector<HTMLElement>('.ant-tabs-nav-list')!;
    const mediaQuery = window.matchMedia('(max-width: 375px)');

    if (tab === '2' && mediaQuery.matches) navList.style.transform = 'translate(-49px, 0px)';
    else navList.style.transform = 'translate(0px, 0px)';
  }, [tab]);

  const navigate = useNavigate();
  const onChangeTab = (key: string) => {
    setActiveKey(key);
    navigate(`/${lang}${routerLinks('MyProfile')}?tab=${key}`);
  };

  const roleName = useRef('');
  if (user?.userModel?.listRole) roleName.current = user?.userModel?.listRole[0]?.name ?? '';

  const onFinish = (value: User) => {
    const result = {
      id: data?.userId,
      userName: value.userName,
      name: value.name,
      email: value.email,
      phoneNumber: value.phoneNumber,
      birthdate: dayjs(value.birthdate).format('YYYY-MM-DDTHH:mm:ss[Z]'),
      gender: value.gender,
      roleListCode: data?.userModel?.roleListCode,
    };
    putProfile({ ...result });
  };
  const onPassword = (value: any) => {
    changePasswordProfile({ id: data?.userId, password: value?.password });
    form2.setFieldValue('password', null);
    form2.setFieldValue('retypedPassword', null);
  };

  const handleChange = (value: any) => {
    if (value[0].fileUrl) {
      userFacade.putAvatar(data?.userId ?? '', value[0].fileUrl);
    }
  };
  return (
    <>
      <div className="max-w-5xl p-4 mx-auto">
        {/* CARD ITEM 1 */}
        <div className="flex gap-3">
          <Spin spinning={isLoading}>
            <Card className="w-80">
              <div className="flex flex-col items-center gap-3 justify-center">
                <Image
                  className="!rounded-full"
                  width={130}
                  height={130}
                  src={data?.userModel?.avatarUrl}
                  fallback="/assets/images/avatar.jpeg"
                />
                <Upload action={`avatar`} isShowImage={false} multiple={false} onChange={handleChange}></Upload>
              </div>
              <h1 className="text-center text-lg mt-2">{data?.userModel?.name}</h1>
              <div>
                <Divider className="my-3" />
                <Flex justify="space-between">
                  <b>Chức vụ</b>
                  <p>{data?.userModel?.chucVu?.tenChucVu}</p>
                </Flex>
                <Divider className="my-3" />
                <Flex justify="space-between">
                  <b>Ngày tạo</b>
                  <p>
                    {data?.userModel?.createdOnDate ? dayjs(data?.userModel?.createdOnDate).format('DD/MM/YYYY') : ''}
                  </p>
                </Flex>
                <Divider className="my-3" />
              </div>
            </Card>
          </Spin>
          <div className="flex-1 w-auto">
            <Tabs
              type="card"
              onTabClick={(key: string) => onChangeTab(key)}
              activeKey={activeKey}
              size="large"
              // className="profile"
              items={[
                {
                  key: '1',
                  label: 'Thông tin cá nhân',
                  children: (
                    <Spin spinning={isLoading}>
                      <div className={'bg-white p-5'}>
                        <Form disabled form={formDetail} layout={'vertical'}>
                          <Row gutter={24}>
                            <Col span={24}>
                              <Form.Item name="name" label="Họ và tên">
                                <Input placeholder={'Nhập họ và tên'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="email" label="Email">
                                <Input placeholder={'Nhập email'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="phoneNumber" label="Số điện thoại">
                                <Input type="number" placeholder={'Nhập email'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="birthdate" label="Ngày sinh">
                                <DatePicker format={'DD-MM-YYYY'} placeholder={'Chọn ngày sinh'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="gender" label="Giới tính">
                                <Select
                                  className="!w-52"
                                  placeholder={'Chọn giới tính'}
                                  options={[
                                    {
                                      label: 'Nữ',
                                      value: 'FEMALE',
                                    },
                                    {
                                      label: 'Nam',
                                      value: 'MALE',
                                    },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </Spin>
                  ),
                },
                {
                  key: '2',
                  label: 'Chỉnh sửa thông tin cá nhân',
                  children: (
                    <Spin spinning={isLoading}>
                      <div className={'bg-white p-5'}>
                        <Form form={form} layout={'vertical'} onFinish={onFinish}>
                          <Row gutter={24}>
                            <Col span={24}>
                              <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
                                <Input placeholder={'Nhập họ và tên'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                <Input placeholder={'Nhập email'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[{ required: true, min: 10, max: 11 }]}
                              >
                                <Input type="number" placeholder={'Nhập email'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="birthdate" label="Ngày sinh" rules={[{ required: true }]}>
                                <DatePicker format={'DD-MM-YYYY'} placeholder={'Chọn ngày sinh'} />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                                <Select
                                  className="!w-52"
                                  placeholder={'Chọn giới tính'}
                                  options={[
                                    {
                                      label: 'Nữ',
                                      value: 'FEMALE',
                                    },
                                    {
                                      label: 'Nam',
                                      value: 'MALE',
                                    },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={24}>
                              <Form.Item className="flex justify-end">
                                <Button type="primary" htmlType="submit">
                                  Lưu lại
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </Spin>
                  ),
                },
                {
                  key: '3',
                  label: 'Đổi mật khẩu',
                  children: (
                    <Spin spinning={isLoading}>
                      <div className={'bg-white rounded-b-xl p-5'}>
                        <Form form={form2} layout={'vertical'} onFinish={onPassword}>
                          <Row gutter={24}>
                            <Col span={24}>
                              <Form.Item name="password" label="Mật khẩu" hasFeedback rules={[{ required: true }]}>
                                <Input.Password placeholder={'Nhập mật khẩu'} />
                              </Form.Item>
                            </Col>
                            <Col span={24}>
                              <Form.Item
                                name="retypedPassword"
                                dependencies={['password']}
                                label="Xác nhận mật khẩu mới"
                                hasFeedback
                                rules={[
                                  { required: true },
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        new Error('Nhập lại mật khẩu mới không đáp ứng điều kiện quy định!'),
                                      );
                                    },
                                  }),
                                ]}
                              >
                                <Input.Password placeholder={'Nhập lại mật khẩu mới'} />
                              </Form.Item>
                            </Col>
                            <Col span={24}>
                              <Form.Item className="flex justify-end">
                                <Button type="primary" htmlType="submit">
                                  Lưu lại
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      </div>
                    </Spin>
                  ),
                },
              ]}
            ></Tabs>
          </div>
        </div>
      </div>
    </>
  );
};
export default Page;
