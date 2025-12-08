import { Flex, Spin, Button, Space, Form, Row, Col, Card, Input, InputNumber } from 'antd';
import { LeftOutlined, LoadingOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import { lang, linkApi, routerLinks } from '@utils';
import { TenantFacade } from '../../store/tenants';
import { useNavigate, useParams } from 'react-router';
import { EStatusState } from '@models';
import { Upload } from '@core/upload';

const EditFormPage = () => {
  const tenantFacade = TenantFacade();
  const [tenantForm] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    id && tenantFacade.getById({ id });
  }, []);

  useEffect(() => {
    switch (tenantFacade.status) {
      case EStatusState.postFulfilled:
      case EStatusState.putFulfilled:
        navigate(`/${lang}${routerLinks('Tenant')}`);
        break;
      case EStatusState.getByIdFulfilled:
        tenantForm.setFieldsValue(tenantFacade.data);
        break;
    }
  }, [tenantFacade.status]);

  const onFinish = (values: any) => {
    id ? tenantFacade.put({ ...values, id }) : tenantFacade.post(values);
  };

  return (
    <Spin size="large" indicator={<LoadingOutlined spin />} spinning={tenantFacade.isFormLoading}>
      <Flex className={'bg-white h-12 sticky top-0 z-20 shadow-header'} justify="space-between" align="center">
        <Button color="default" variant="link" icon={<LeftOutlined />} href={`/#/${lang}${routerLinks('Tenant')}`}>
          Quay lại danh sách tenant
        </Button>
        <Space size={'small'} className={'pr-4'}>
          <Button type="primary" onClick={() => tenantForm.submit()}>
            Lưu lại
          </Button>
        </Space>
      </Flex>
      <div className="max-w-8xl mx-auto p-6">
        <Form form={tenantForm} onFinish={onFinish} layout={'vertical'}>
          <Row gutter={16}>
            <Col span={24}>
              <Card className="h-full" title="Thông tin tenant">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={'Tên (Tên hiển thị menu)'}
                      name={'name'}
                      rules={[{ required: true, message: 'Vui lòng nhập tên tenant' }]}
                    >
                      <Input maxLength={12} placeholder="Nhập tên tenant" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={'Subdomain'}
                      name={'subDomain'}
                      rules={[{ required: true, message: 'Vui lòng nhập subdomain' }]}
                    >
                      <Input placeholder="Nhập subdomain" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={'Email'}
                      name={'email'}
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                    >
                      <Input disabled={id ? true : false} placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={'Số điện thoại'}
                      name={'phoneNumber'}
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={'Tên công ty'}
                      name={'companyName'}
                      rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
                    >
                      <Input placeholder="Nhập tên công ty" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={'Mã số thuế'}
                      name={'mst'}
                      rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}
                    >
                      <Input placeholder="Nhập mã số thuế" />
                    </Form.Item>
                  </Col>
                  {id ? (
                    ''
                  ) : (
                    <>
                      <Col span={12}>
                        {' '}
                        <Form.Item
                          name="password"
                          label="Mật khẩu"
                          rules={[
                            {
                              required: true,
                            },
                          ]}
                          hasFeedback
                        >
                          <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="confirm"
                          label="Xác nhận mật khẩu"
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
                                return Promise.reject(new Error('Nhập lại mật khẩu không đáp ứng điều kiện quy định!'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password placeholder="Nhập lại mật khẩu" />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                  <Col span={12}>
                    <Form.Item
                      name={'attachments'}
                      label="Logo"
                      rules={[{ required: true, message: 'Vui lòng tải ảnh logo' }]}
                    >
                      <Upload
                        isShowImage={true}
                        multiple={false}
                        url={linkApi + `/upload/blob/logo`}
                        action={`attach`}
                        accept={'image/*'}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </Spin>
  );
};

export default EditFormPage;
