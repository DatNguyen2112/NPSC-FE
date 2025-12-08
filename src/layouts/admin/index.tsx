import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import AntMenu from '@layouts/admin/ant-menu';
import { AppBreadCrumb } from '@layouts/admin/AppBreadCrumb';
import FeedBackScreen from '@pages/feed-back';
import { GlobalFacade, TenantFacade } from '@store';
import { Key, Out, User } from '@svgs';
import { keyUser, lang, linkWebUrl, routerLinks } from '@utils';
import { Avatar, Button, Card, Divider, Drawer, Dropdown, Flex, Layout, Space, Typography } from 'antd';
import { Content, Header } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import classNames from 'classnames';
import { t } from 'i18next';
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { NavLink, Outlet } from 'react-router-dom';
import './index.less';
import NotificationDropdown from './notification';

export type T_MasterCtx = {
  tool: [ReactNode, (tool: ReactNode) => void];
  breadCrumb?: ReactNode;
  visible?: boolean;
};

const MasterLayout = () => {
  const [tool, setTool] = useState<ReactNode>(null);
  const globalFacade = GlobalFacade();
  const tenantFacade = TenantFacade();
  const { user } = globalFacade;
  const [isCollapsed, setIsCollapsed] = useState(innerWidth < 1280);
  const [isDesktop, setIsDesktop] = useState(innerWidth > 1280);
  const navigate = useNavigate();
  const users = JSON.parse(localStorage.getItem(keyUser) || '{}');
  const outletCtx: T_MasterCtx = {
    tool: [tool, setTool],
  };
  const admin = 'admin';
  const [logo, setLogo] = useState('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const subdomain = parts.length > 3 ? parts[0] : admin;

  useEffect(() => {
    // hostname khác admin thì gọi api lấy thông tin tenant
    if (subdomain !== admin) {
      tenantFacade.getByDomain(subdomain);
    }

    globalFacade.set({
      headerColor: users.themeConfig?.headerStyle ? users.themeConfig?.headerStyle : 'bg-white',
      siderColor: !users.themeConfig?.siderStyle ? users.themeConfig?.siderStyle : 'bg-white',
      show: false,
    });

    if (innerWidth < 1280 && !isCollapsed) {
      setTimeout(() => {
        setIsCollapsed(true);
      });
    }
    globalFacade.set({ feedbackSuccess: false });

    if (subdomain != admin) {
      // Cập nhật favicon
      setLogo(`${linkWebUrl + '/files/tenant/logo/' + subdomain + '-logo.png'}`);
    }

    const handleResize = () => {
      if (innerWidth < 1280 && !isCollapsed) {
        setIsCollapsed(true);
      }
      setIsDesktop(innerWidth > 1280);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize, true);
    };
  }, []);

  const handleChangeColor = (key: string, className: string) => {
    switch (key) {
      case 'header':
        globalFacade.set({ headerColor: className });
        break;
      case 'sider':
        globalFacade.set({ siderColor: className });
        break;
    }
  };
  const handleSubmit = () => {
    if (users) {
      Object.assign(users, {
        themeConfig: { headerStyle: globalFacade.headerColor, siderStyle: globalFacade.siderColor },
      });
    }
    localStorage.setItem(keyUser, JSON.stringify(users));
    if (globalFacade.user?.userId) {
      globalFacade.updateConfigTheme(globalFacade.user?.userId, {
        siderStyle: globalFacade.siderColor,
        headerStyle: globalFacade.headerColor,
      });
    }
  };

  return (
    <Layout className={'w-screen h-screen fixed'}>
      <FeedBackScreen />
      <Drawer
        width={500}
        title={null}
        styles={{
          body: {
            padding: 0,
          },
          header: {
            display: 'none',
          },
        }}
        footer={
          <Space className={'flex justify-end'}>
            <Button type={'primary'} onClick={handleSubmit}>
              Lưu cấu hình
            </Button>
          </Space>
        }
        onClose={() => globalFacade.set({ isShowConfig: false })}
        open={globalFacade.isShowConfig}
      >
        <Card
          title={
            <div className={'flex justify-between items-center'}>
              <p>Header Options</p>
              <div>
                <Button
                  className={'rounded-full'}
                  type={'primary'}
                  onClick={() => {
                    globalFacade.set({ headerColor: 'bg-white' });
                  }}
                >
                  Restore default
                </Button>
              </div>
            </div>
          }
          bordered={false}
        >
          <div className={'flex mb-3 justify-center font-medium'}>CHOOSE COLOR SCHEME</div>
          <div className={'flex items-center gap-2 justify-center'}>
            <Button
              onClick={() => handleChangeColor('header', 'bg-amber-400')}
              className={'w-9 rounded-[30px] bg-amber-300 hover:!bg-amber-500'}
            />
            <Button
              onClick={() => handleChangeColor('header', 'bg-green-300')}
              className={'w-9 rounded-[30px] bg-green-300 hover:!bg-green-500'}
            />
            <Button
              onClick={() => handleChangeColor('header', 'bg-gradient-to-r from-pink-100 to-pink-200')}
              className={'w-9 rounded-[30px] bg-gradient-to-r from-pink-100 to-pink-200'}
            />
            <Button
              onClick={() => handleChangeColor('header', 'bg-gradient-to-r from-blue-100 to-blue-200')}
              className={'w-9 rounded-[30px] bg-gradient-to-r from-blue-100 to-blue-200'}
            />
            <Button
              onClick={() => handleChangeColor('header', 'bg-cyan-400')}
              className={'w-9 rounded-[30px] bg-cyan-300 hover:!bg-cyan-500'}
            />
            <Button
              onClick={() => handleChangeColor('header', 'bg-gradient-to-r from-gray-400 to-gray-300')}
              className={'w-9 rounded-[30px] bg-[#f1f4f6]'}
            />
          </div>
        </Card>
        <Card
          title={
            <div className={'flex justify-between items-center'}>
              <p>Sider Options</p>
              <div>
                <Button
                  onClick={() => {
                    globalFacade.set({ siderColor: '!bg-[#002140]' });
                  }}
                  className={'rounded-full'}
                  type={'primary'}
                >
                  Restore default
                </Button>
              </div>
            </div>
          }
          bordered={false}
        >
          <div className={'flex mb-3 justify-center font-medium'}>CHOOSE COLOR SCHEME</div>
          <div className={'flex items-center gap-2 justify-center'}>
            <Button
              onClick={() => handleChangeColor('sider', 'bg-amber-300')}
              className={'w-9 rounded-[30px] bg-amber-300 hover:!bg-amber-500'}
            />
            <Button
              onClick={() => handleChangeColor('sider', 'bg-green-300')}
              className={'w-9 rounded-[30px] bg-green-300 hover:!bg-green-500'}
            />
            <Button
              onClick={() => handleChangeColor('sider', 'bg-gradient-to-r from-pink-100 to-pink-200')}
              className={'w-9 rounded-[30px] bg-gradient-to-r from-pink-100 to-pink-200'}
            />
            <Button
              onClick={() => handleChangeColor('sider', 'bg-gradient-to-r from-blue-200 to-blue-300')}
              className={'w-9 rounded-[30px] bg-gradient-to-r from-blue-200 to-blue-300'}
            />
            <Button
              onClick={() => handleChangeColor('sider', 'bg-cyan-400')}
              className={'w-9 rounded-[30px] bg-cyan-300 hover:!bg-cyan-500'}
            />
            <Button
              onClick={() => handleChangeColor('sider', 'bg-gradient-to-r from-gray-400 to-gray-300')}
              className={'w-9 rounded-[30px] bg-[#f1f4f6]'}
            />
          </div>
        </Card>
      </Drawer>
      <Sider
        className={'bg-white'}
        width={240}
        // collapsible
        collapsed={isCollapsed}
        onCollapse={(value) => setIsCollapsed(value)}
      >
        <NavLink
          to={user?.rights?.includes('CONSTRUCTION.VIEWALL') ? '/vn/dashboard' : '/vn/social-media'}
          className="flex items-center group mx-3 my-2 "
        >
          {/* <img
            className={'w-full min-w-12 mr-3 opacity-100 text-lg object-contain'}
            src={logo ? logo : '/assets/images/logo-long-geneat.png'}
            // src="https://vanhotea.com/wp-content/uploads/2024/05/logo2.png"
            alt="logo"
            style={{ maxWidth: '200px', maxHeight: '100px' }}
          /> */}
          <img
            className={classNames('w-12 h-10 object-contain min-w-12 mr-3', {
              'opacity-100 text-lg w-12': (!isCollapsed && isDesktop) || (isCollapsed && !isDesktop),
            })}
            src={logo ? logo : '/assets/images/img_1.png'}
            alt="logo"
          />
          <div
            id={'name-application'}
            className={`${isCollapsed ? 'hidden transition-all duration-100 opacity-1' : 'transition-all duration-150 absolute left-16 overflow-ellipsis overflow-hidden ml-2.5 opacity-100 delay-75 text-lg font-bold'} uppercase text-white`}
          >
            {subdomain === admin ? (
              <div className={'flex gap-2'}>
                <p className="font-bold text-[#283081] text-[18px]">
                  EVN<span className={'text-[#E81B22] italic'}>NPC</span>
                </p>
                <p className="font-bold text-[#283081] text-[18px] italic">NPSC</p>
              </div>
            ) : (
              tenantFacade.data?.name
            )}
          </div>
        </NavLink>
        <Divider className={'mt-0.5 mb-0'} />
        <AntMenu />
      </Sider>
      <Layout>
        <Header className={`${globalFacade.headerColor} h-14 p-0`}>
          <div className={'w-full h-full flex items-center text-center justify-between'}>
            <div className="flex item-center text-center mx-3 gap-1">
              <Button
                onClick={() => {
                  setIsCollapsed(!isCollapsed);
                  setIsDesktop(isDesktop);
                }}
                type={'text'}
                icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              />
              <div
                className={classNames('xl:block hidden', {
                  'is-active': (isCollapsed && isDesktop) || (!isCollapsed && !isDesktop),
                })}
              ></div>
              <div className={'flex !text-center'}>
                <h1 className={'title-page text-lg font-bold hidden sm:block'}></h1>
              </div>
            </div>
            <div className="flex items-center gap-5 absolute right-4">
              <NotificationDropdown />
              {/* <Button
                type={'text'}
                className={'flex items-center font-normal'}
                onClick={() => globalFacade.set({ show: true })}
              >
                <p>
                  <SlNote size={20} className={'!h-full'} color={'#1677ff'} />
                </p>
                Góp ý
              </Button> */}
              {/* <Button
                type={'text'}
                className={'flex items-center font-normal'}
                onClick={() => globalFacade.set({ isShowConfig: true })}
              >
                <p>
                  <IoColorPaletteOutline size={20} className={'!h-full'} color={'#1677ff'} />
                </p>
                Cấu hình layout
              </Button> */}
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: '0',
                      className: 'hover:!bg-white !border-b-slate-300 border-b !rounded-none',
                      label: (
                        <Flex align="center" gap={6}>
                          {/* <Image
                            className="rounded-full"
                            width={'30px'}
                            height={'30px'}
                            preview={false}
                            src={user?.userModel?.avatarUrl}
                            fallback={'/assets/images/avatar.jpeg'}
                          />
                          <div className="text-left leading-none mr-3 block pl-2">
                            <div className="font-semibold text-black text-sm leading-snug mb-0.5">
                              {user?.userModel?.name}
                            </div>
                            <div className="text-gray-500 text-[10px]">{user?.userModel?.email}</div>
                          </div> */}
                          <Avatar src={user?.userModel?.avatarUrl} alt={user?.userModel?.name}>
                            {user?.userModel?.name?.charAt(0)}
                          </Avatar>
                          <Flex vertical gap={3}>
                            <Typography.Text className="leading-3" strong>
                              {user?.userModel?.name}
                            </Typography.Text>
                            <Typography.Text className="leading-3" type="secondary">
                              {user?.userModel?.email}
                            </Typography.Text>
                          </Flex>
                        </Flex>
                      ),
                    },
                    {
                      key: '1',
                      className: 'h-11',
                      label: (
                        <div
                          className="flex"
                          onClick={() => navigate(`/${lang}${routerLinks('MyProfile')}?tab=1`, { replace: true })}
                        >
                          <div className="flex items-center">
                            <User className="w-6 h-6 pr-2 text-black" />
                          </div>
                          <div>{t('routes.admin.Layout.My Profile')}</div>
                        </div>
                      ),
                    },
                    {
                      key: '2',
                      className: 'h-11 !border-b-slate-300 border-b !rounded-none',
                      label: (
                        <div
                          className="flex"
                          onClick={() => navigate(`/${lang}${routerLinks('MyProfile')}?tab=3`, { replace: true })}
                        >
                          <div className="flex items-center">
                            <Key className="w-6 h-6 pr-2 text-black" />
                          </div>
                          <div>{t('routes.admin.Layout.Change Password')}</div>
                        </div>
                      ),
                    },
                    {
                      key: '3',
                      className: 'h-11',
                      label: (
                        <a
                          className="flex"
                          onClick={() => navigate(`/${lang}${routerLinks('Login')}`, { replace: true })}
                        >
                          <div className="flex items-center">
                            <Out className="w-6 h-6 pr-2 text-black" />
                          </div>
                          <div>{t('routes.admin.Layout.Sign out')}</div>
                        </a>
                      ),
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <section className="flex items-center gap-2 hover:cursor-pointer !rounded-full" id={'dropdown-profile'}>
                  {/* <Image
                    className="rounded-full"
                    width={'30px'}
                    height={'30px'}
                    preview={false}
                    src={user?.userModel?.avatarUrl}
                    fallback={'/assets/images/avatar.jpeg'}
                  /> */}
                  {/* <p>{user?.userModel?.name}</p> */}
                  <Avatar src={user?.userModel?.avatarUrl} alt={user?.userModel?.name}>
                    {user?.userModel?.name?.charAt(0)}
                  </Avatar>
                  <Typography.Text className={'font-semibold hover:text-blue-500'}>
                    {user?.userModel?.name}
                  </Typography.Text>
                </section>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Divider className={'my-0'} />
        <Content className={'w-full !max-h-full overflow-auto miniScroll'}>
          <Outlet context={outletCtx} />
        </Content>
        {/* <Footer className={'text-center h-7 leading-7 !p-0'}>
          {t('layout.footer', { year: new Date().getFullYear() })}
        </Footer> */}
      </Layout>
    </Layout>
  );
};

export const SubHeader = (props: {
  children?: React.ReactNode;
  tool?: React.ReactNode;
  breadcrumb?: string;
  isVisible?: boolean;
}) => {
  return (
    <div className={'flex flex-col sticky top-0 z-10 shadow-header'}>
      <div className={'flex justify-between bg-white'}>
        <AppBreadCrumb breadCrumb={props.breadcrumb ?? ''} />
        <div className={'mx-3 flex items-center'}>{props.tool}</div>
      </div>
      <Content className={'!max-h-[90%] overflow-auto miniScroll'}>{props.children}</Content>
    </div>
  );
};

export default MasterLayout;
