import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { EStatusGlobal, GlobalFacade, LoginModel } from '@store';
import { lang } from '@utils';
import { Button, Checkbox, Form, Image, Input, Spin } from 'antd';
import { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
const Page = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const globalFacade = GlobalFacade();
  const { isLoading, status, user, login, profile } = globalFacade;
  const [form] = Form.useForm();
  useEffect(() => {
    if (status === EStatusGlobal.loginFulfilled && user && Object.keys(user).length > 0) {
      navigate(
        user?.rights?.includes('CONSTRUCTION.VIEWALL') ? '/' + lang + '/dashboard' : '/' + lang + '/social-media',
        { replace: true },
      );
      profile();
    }
  }, [status]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter') document.getElementById('idSubmit')?.click();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  const onFinish = (values: LoginModel) => {
    const data: LoginModel = {
      username: values.username,
      password: values.password,
      rememberMe: values.rememberMe ? values.rememberMe : false,
    };
    login(data);
  };

  return (
    <Fragment>
      <div className={'bg-white py-10 rounded-[6px] w-[770px] flex items-center shadow-sm'}>
        <div className={'hidden h-full sm:hidden md:block lg:block w-[38%]'}>
          <Image
            src={'/assets/images/bg-login.jpg'}
            preview={false}
            height={500}
            className={'w-full object-cover'}
            alt="logo"
          />
        </div>
        <div className={'flex-1 px-3'}>
          <div className="text-center mb-8">
            <h1
              className="intro-x !text-4xl mb-8 font-medium  leading-8 md:text-5xl md:leading-10 lg:leading-10"
              id={'title-login'}
            >
              {t('routes.auth.login.title')}
            </h1>
            <h5 className="intro-x font-normal text-gray-400 ">{t('routes.auth.login.subTitle')}</h5>
          </div>
          <div className="mx-auto lg:w-3/4 relative bg-white">
            <Spin spinning={isLoading}>
              <Form form={form} layout={'vertical'} onFinish={onFinish}>
                <Form.Item label={'Email'} name={'username'} rules={[{ type: 'email', required: true }]}>
                  <Input prefix={<MailOutlined />} placeholder={'example@gmail.com'} />
                </Form.Item>
                <Form.Item label={'Mật khẩu'} name={'password'} rules={[{ required: true }]}>
                  <Input.Password prefix={<LockOutlined className={'font-medium'} />} placeholder={'********'} />
                </Form.Item>
                <Form.Item name={'rememberMe'}>
                  <Checkbox>Nhớ mật khẩu</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button className={'w-full rounded-[8px]'} type="primary" htmlType={'submit'}>
                    Đăng nhập
                  </Button>
                </Form.Item>
                <div className={'flex justify-center text-gray-400'}>
                  Bạn quên mật khẩu? Lấy lại mật khẩu{' '}
                  <a href={'/#/vn/forgot-password'} className={'ml-1'}>
                    tại đây
                  </a>
                </div>
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
    </Fragment>
  );
};

export default Page;
