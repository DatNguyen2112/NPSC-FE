import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Image, Input, Spin,Form } from 'antd';
import { EStatusGlobal, GlobalFacade } from '@store';
import { lang, routerLinks } from '@utils';
import { MailOutlined } from '@ant-design/icons';

const Page = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { isLoading, status, data, forgottenPassword } = GlobalFacade();
  useEffect(() => {
    if (status === EStatusGlobal.forgottenPasswordFulfilled) {
      navigate(`/${lang}${routerLinks('VerifyForotPassword')}`);
    }
  }, [status]);
  const onFinish = (values: any) => {
    forgottenPassword({email: values.username})
  }

  return (
    <Fragment>
      <div className={'bg-white py-10 rounded-[6px] w-[770px] flex items-center shadow-sm'}>
        <div className={"hidden h-full sm:hidden md:block lg:block w-[38%]"}>
          <Image src={'/assets/images/bg-login.jpg'} preview={false} height={500} className={'w-full object-cover'} alt="logo" />
        </div>
        <div className={'flex-1 px-3'}>
          <div className="text-center mb-8">
            <h1
              className="intro-x !text-4xl mb-8 font-medium  leading-8 md:text-5xl md:leading-10 lg:leading-10"
              id={'title-login'}
            >
              {t('routes.auth.login.Forgot Password')}
            </h1>
            <h5 className="intro-x font-normal text-gray-400 ">{t('routes.auth.reset-password.subTitle')}</h5>
          </div>
          <div className="mx-auto lg:w-3/4 relative bg-white">
            <Spin spinning={isLoading}>
              <Form form={form} layout={'vertical'} onFinish={onFinish}>
                <Form.Item label={'Email khôi phục'} name={'username'} rules={[{ type: 'email', required: true }]}>
                  <Input prefix={<MailOutlined />}  placeholder={'example@gmail.com'} />
                </Form.Item>
                <Form.Item>
                  <Button className={'w-full rounded-[8px]'} type="primary" htmlType={'submit'}>Lấy mã OTP</Button>
                </Form.Item>
                <Button onClick={() => navigate(`/${lang}${routerLinks('Login')}`)} className={'w-full underline'} type={'link'}>Quay về trang đăng nhập</Button>
              </Form>
            </Spin>
            {/*<Spin spinning={isLoading}>*/}
            {/*  <Form*/}
            {/*    values={{ ...data }}*/}
            {/*    className="intro-x form-login"*/}
            {/*    columns={[*/}
            {/*      {*/}
            {/*        name: 'username',*/}
            {/*        title: 'Email',*/}
            {/*        formItem: {*/}
            {/*          placeholder: 'Nhập Email',*/}
            {/*          rules: [{ type: EFormRuleType.required }, { type: EFormRuleType.email }],*/}
            {/*        },*/}
            {/*      },*/}
            {/*      {*/}
            {/*        name: 'password',*/}
            {/*        title: t('columns.auth.login.password'),*/}
            {/*        formItem: {*/}
            {/*          placeholder: 'columns.auth.login.Enter Password',*/}
            {/*          type: EFormType.password,*/}
            {/*          notDefaultValid: true,*/}
            {/*          rules: [{ type: EFormRuleType.required }],*/}
            {/*        },*/}
            {/*      },*/}
            {/*    ]}*/}
            {/*    textSubmit={'routes.auth.login.Log In'}*/}
            {/*    handSubmit={login}*/}
            {/*    disableSubmit={isLoading}*/}
            {/*  />*/}
            {/*</Spin>*/}
            {/* <div className="absolute top-2/3 right-0 text-right">
          <button
            className={'text-teal-900 font-normal underline hover:no-underline mt-2'}
            onClick={() => navigate(`/${lang}${routerLinks('ForgetPassword')}`)}
          >
            {t('routes.auth.login.Forgot Password')}
          </button>
        </div> */}
          </div>
        </div>

      </div>
      {/*<div className="text-center mb-8">*/}
      {/*  <h1*/}
      {/*    className="intro-x text-3xl mb-8 font-bold text-green-900 leading-8 md:text-5xl lg:leading-10"*/}
      {/*    id={'title-login'}*/}
      {/*  >*/}
      {/*    {t('routes.auth.login.Forgot Password')}*/}
      {/*  </h1>*/}
      {/*  <h5 className="intro-x font-normal text-green-900 ">{t('routes.auth.reset-password.subTitle')}</h5>*/}
      {/*</div>*/}
      {/*<div className="mx-auto lg:w-3/4">*/}
      {/*  <Spin spinning={isLoading}>*/}
      {/*    <Form*/}
      {/*      values={{ ...data }}*/}
      {/*      className="intro-x form-forgetPassword"*/}
      {/*      columns={[*/}
      {/*        {*/}
      {/*          name: 'email',*/}
      {/*          title: t('columns.auth.reset-password.Recovery Email'),*/}
      {/*          formItem: {*/}
      {/*            placeholder: 'columns.auth.reset-password.Recovery Email',*/}
      {/*            rules: [{ type: EFormRuleType.required }, { type: EFormRuleType.email }],*/}
      {/*          },*/}
      {/*        },*/}
      {/*      ]}*/}
      {/*      textSubmit={'routes.auth.reset-password.OTP'}*/}
      {/*      handSubmit={(values) => forgottenPassword({ ...values })}*/}
      {/*      disableSubmit={isLoading}*/}
      {/*    />*/}
      {/*  </Spin>*/}
      {/*  <div className="text-center mt-3">*/}
      {/*    <button*/}
      {/*      className={'text-sky-600 font-normal underline hover:no-underline hover:text-sky-500'}*/}
      {/*      onClick={() => navigate(`/${lang}${routerLinks('Login')}`)}*/}
      {/*    >*/}
      {/*      {' '}*/}
      {/*      {t('routes.auth.reset-password.Go back to login')}*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </Fragment>
  );
};

export default Page;
