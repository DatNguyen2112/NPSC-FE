import { keyToken, lang, routerLinks } from '@utils';
import { Spin } from 'antd';
import React, { Suspense } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

const pages = [
  {
    layout: React.lazy(() => import('@layouts/guest')),
    isPublic: true,
    child: [],
  },
  {
    layout: React.lazy(() => import('@layouts/auth')),
    isPublic: true,
    child: [
      {
        path: routerLinks('Login'),
        component: React.lazy(() => import('@pages/login')),
      },
      {
        path: routerLinks('ForgetPassword'),
        component: React.lazy(() => import('@pages/forget-password')),
      },
      {
        path: routerLinks('VerifyForotPassword'),
        component: React.lazy(() => import('@pages/forget-password/otp')),
      },
      {
        path: routerLinks('SetPassword'),
        component: React.lazy(() => import('@pages/forget-password/otp/set-password')),
      },
    ],
  },
  {
    layout: React.lazy(() => import('@layouts/admin')),
    isPublic: false,
    child: [
      {
        path: '/',
        component: routerLinks('Dashboard'),
      },
      {
        path: routerLinks('MyProfile'),
        component: React.lazy(() => import('@pages/my-profile')),
      },
      {
        path: routerLinks('Dashboard'),
        component: React.lazy(() => import('@pages/dashboard')),
      },
      {
        path: routerLinks('Parameter'),
        component: React.lazy(() => import('@pages/parameter')),
      },
      {
        path: routerLinks('Navigation'),
        component: React.lazy(() => import('@pages/navigation')),
      },
      {
        path: routerLinks('Data'),
        component: React.lazy(() => import('@pages/data')),
      },
      {
        path: routerLinks('Post'),
        component: React.lazy(() => import('@pages/post')),
      },
      {
        path: routerLinks('Test'),
        component: React.lazy(() => import('@pages/shared-directory/Test')),
      },
      {
        path: routerLinks('User'),
        component: React.lazy(() => import('@pages/user/user-management')),
      },
      // MANH KHANH
      {
        path: routerLinks('Code'),
        component: React.lazy(() => import('@pages/codetype')),
      },
      {
        path: routerLinks('PhongBan'),
        component: React.lazy(() => import('@pages/shared-directory/phong-ban')),
      },
      {
        path: routerLinks('ChucVu'),
        component: React.lazy(() => import('@pages/shared-directory/chuc-vu')),
      },
      {
        path: routerLinks('Roles'),
        component: React.lazy(() => import('@pages/user/user-group-management')),
      },
      {
        path: routerLinks('RightMapRole'),
        component: React.lazy(() => import('@pages/right-map-role')),
      },
      {
        path: routerLinks('PhieuThu'),
        component: React.lazy(() => import('src/pages/cashflow-management/receipt-management')),
      },
      {
        path: routerLinks('BaoGia'),
        component: React.lazy(() => import('@pages/quotation')),
      },
      {
        path: routerLinks('CauHinhNhanSu'),
        component: React.lazy(() => import('@pages/cau-hinh-nhan-su')),
      },
      {
        path: routerLinks('PhieuThu') + '/create',
        component: React.lazy(() => import('@pages/cashflow-management/receipt-management/create.form')),
      },
      {
        path: routerLinks('PhieuThu') + '/create-multiple',
        component: React.lazy(() => import('@pages/cashflow-management/receipt-management/create-multiple')),
      },
      {
        path: routerLinks('PhieuThu') + '/:id/edit',
        component: React.lazy(() => import('@pages/cashflow-management/receipt-management/edit.form')),
      },
      {
        path: routerLinks('vouchers'),
        component: React.lazy(() => import('src/pages/cashflow-management/vouchers')),
      },
      {
        path: routerLinks('ChiPhi'),
        component: React.lazy(() => import('src/pages/cashflow-management/payment-voucher')),
      },
      {
        path: routerLinks('ChiPhi') + '/create-multiple',
        component: React.lazy(() => import('src/pages/cashflow-management/payment-voucher/create-multiple')),
      },
      {
        path: routerLinks('ChiPhi') + '/create',
        component: React.lazy(() => import('@pages/cashflow-management/payment-voucher/create.form')),
      },
      {
        path: routerLinks('ChiPhi') + '/:id/edit',
        component: React.lazy(() => import('@pages/cashflow-management/payment-voucher/edit.form')),
      },
      {
        path: routerLinks('Quotation'),
        component: React.lazy(() => import('src/pages/quotationv2')),
      },
      {
        path: routerLinks('Quotation') + '/create',
        component: React.lazy(() => import('src/pages/quotationv2/quotationv2.form')),
      },
      {
        path: routerLinks('Quotation') + '/:id/edit',
        component: React.lazy(() => import('@pages/quotationv2/quotationv2.form')),
      },
      {
        path: routerLinks('Quotation') + '/:id/detail',
        component: React.lazy(() => import('@pages/quotationv2/detail')),
      },
      {
        path: routerLinks('CustomerDebtReport'),
        component: React.lazy(() => import('@pages/customers-debt-report')),
      },
      {
        path: routerLinks('SupplierDebtReport'),
        component: React.lazy(() => import('@pages/suppliers-debt-report')),
      },
      {
        path: routerLinks('ReportsFinance'),
        component: React.lazy(() => import('@pages/reports-finance')),
      },
      // Báo cáo dòng tiền
      {
        path: routerLinks('CashFlowReport'),
        component: React.lazy(() => import('@pages/cash-flow-report')),
      },
      // Công trình
      {
        path: routerLinks('Construction'),
        component: React.lazy(() => import('@pages/du-an-v2/construction')),
      },
      // Thêm mới công trình
      {
        path: routerLinks('Construction') + '/create',
        component: React.lazy(() => import('@pages/du-an-v2/construction/construction.form')),
      },
      {
        path: routerLinks('Construction') + '/:id/edit',
        component: React.lazy(() => import('@pages/du-an-v2/construction/construction.form')),
      },
      {
        path: routerLinks('Construction') + '/:id/construction-monitor',
        component: React.lazy(() => import('@pages/du-an-v2/construction-monitor')),
      },

      // Issue Management
      {
        path: routerLinks('IssueManagement'),
        component: React.lazy(() => import('@pages/du-an-v2/issue-management')),
      },
      {
        path: routerLinks('IssueManagement') + '/create',
        component: React.lazy(() => import('@pages/du-an-v2/issue-management/issue-management.form')),
      },
      {
        path: routerLinks('IssueManagement') + '/:id/edit',
        component: React.lazy(() => import('@pages/du-an-v2/issue-management/issue-management.form')),
      },
      {
        path: routerLinks('IssueManagement') + '/:id/detail',
        component: React.lazy(() => import('@pages/du-an-v2/issue-management/issue-management.details')),
      },
      // Hợp đồng/phụ lục
      {
        path: routerLinks('Contract'),
        component: React.lazy(() => import('@pages/du-an-v2/contract')),
      },
      {
        path: routerLinks('Contract') + '/create',
        component: React.lazy(() => import('@pages/du-an-v2/contract/form')),
      },
      {
        path: routerLinks('Contract') + '/:editId/edit',
        component: React.lazy(() => import('@pages/du-an-v2/contract/form')),
      },
      {
        path: routerLinks('Contract') + '/:id',
        component: React.lazy(() => import('@pages/du-an-v2/contract/detail')),
      },
      {
        path: '/debt-report',
        component: React.lazy(() => import('@pages/du-an-v2/contract/debt-report')),
      },
      {
        path: routerLinks('CashbookDashboard'),
        component: React.lazy(() => import('@pages/cashbook-dashboard')),
      },
      {
        path: routerLinks('Tenant'),
        component: React.lazy(() => import('@pages/tenants')),
      },
      {
        path: routerLinks('Tenant') + '/:id/edit',
        component: React.lazy(() => import('@pages/tenants/edit')),
      },
      {
        path: routerLinks('Tenant') + '/:id/detail',
        component: React.lazy(() => import('@pages/tenants/detail')),
      },
      {
        path: routerLinks('Tenant') + '/create',
        component: React.lazy(() => import('@pages/tenants/edit')),
      },
      {
        path: routerLinks('TaskManagement'),
        component: React.lazy(() => import('@pages/task-management')),
      },
      {
        path: routerLinks('TaskManagement') + '/:id/detail',
        component: React.lazy(() => import('@pages/task-management/detail')),
      },
      {
        path: routerLinks('TaskManagement') + '/create',
        component: React.lazy(() => import('@pages/task-management/detail')),
      },
      {
        path: routerLinks('ChartOfAccount'),
        component: React.lazy(() => import('@pages/chart-of-accounts')),
      },
      {
        path: routerLinks('Xe'),
        component: React.lazy(() => import('@pages/quan-ly-xe')),
      },
      {
        path: routerLinks('LaiXe'),
        component: React.lazy(() => import('@pages/lai-xe')),
      },
      {
        path: routerLinks('LoaiXe'),
        component: React.lazy(() => import('@pages/quan-ly-loai-xe')),
      },
      {
        path: routerLinks('VehicleRequest'),
        component: React.lazy(() => import('@pages/vehicle-request')),
      },
      {
        path: routerLinks('VehicleRequest') + '/create',
        component: React.lazy(() => import('@pages/vehicle-request/form')),
      },
      {
        path: routerLinks('VehicleRequest') + '/:id',
        component: React.lazy(() => import('@pages/vehicle-request/detail')),
      },
      {
        path: routerLinks('VehicleRequest') + '/:editId/edit',
        component: React.lazy(() => import('@pages/vehicle-request/form')),
      },
      {
        path: routerLinks('ConstructionSocialMedia'),
        component: React.lazy(() => import('@pages/du-an-v2/construction-social-media')),
      },

      // Danh mục
      {
        path: routerLinks('VoltageType'),
        component: React.lazy(() => import('@pages/Category/VoltageType/index')),
      },
      {
        path: routerLinks('OwnerType'),
        component: React.lazy(() => import('@pages/Category/OwnerType/index')),
      },
      {
        path: routerLinks('ProcessTemplate'),
        component: React.lazy(() => import('@pages/Category/ProcessTemplate/index')),
      },
      {
        path: routerLinks('Investor'),
        component: React.lazy(() => import('@pages/Category/Investor/index')),
      },
      {
        path: routerLinks('ConsultService'),
        component: React.lazy(() => import('@pages/Category/ConsultService/index')),
      },
      {
        path: routerLinks('ProjectTemplate'),
        component: React.lazy(() => import('@pages/project-template')),
      },
      {
        path: routerLinks('ProjectTemplate') + '/add',
        component: React.lazy(() => import('@pages/project-template/edit')),
      },
      {
        path: routerLinks('ProjectTemplate') + '/:id/edit',
        component: React.lazy(() => import('@pages/project-template/edit')),
      },
      {
        path: routerLinks('Task') + '/:constructionId/create',
        component: React.lazy(() => import('@pages/du-an-v2/construction-monitor/task/form')),
      },
      {
        path: routerLinks('TaskPersonal') + '/create',
        component: React.lazy(() => import('@pages/du-an-v2/construction-monitor/task/form-task-personal')),
      },
      {
        path: routerLinks('TaskPersonal') + '/:id/edit',
        component: React.lazy(() => import('@pages/du-an-v2/construction-monitor/task/form-task-personal')),
      },
      {
        path: routerLinks('Task') + '/:constructionId/edit-view/:id',
        component: React.lazy(() => import('@pages/du-an-v2/construction-monitor/task/edit-view')),
      },
      {
        path: '/work-report',
        component: React.lazy(() => import('@pages/du-an-v2/construction-monitor/task/work-report')),
      },
    ], // 💬 generate link to here
  },

  // {
  //   layout: React.lazy(() => import('@layouts/print')),
  //   isPublic: true,
  //   child: [
  //     {
  //       path: routerLinks('PhieuNhap') + '/:id/print',
  //       // component: React.lazy(() => import('@pages/phieu-nhap/printPhieu')),
  //     },
  //     {
  //       path: routerLinks('PhieuXuat') + '/:id/print',
  //       component: React.lazy(() => import('@pages/phieu-xuat/printPhieu')),
  //     },
  //   ],
  // },
];

const Layout = ({
  layout: MasterLayout,
  isPublic = false,
}: {
  layout: React.LazyExoticComponent<({ children }: { children?: React.ReactNode }) => JSX.Element>;
  isPublic: boolean;
}) => {
  if (isPublic || !!localStorage.getItem(keyToken))
    return (
      <MasterLayout>
        <Outlet />
      </MasterLayout>
    );

  return <Navigate to={`/${lang}${routerLinks('Login')}`} />;
};

const Page = ({
  component: Comp,
}: {
  component: React.LazyExoticComponent<() => JSX.Element> | React.LazyExoticComponent<React.FC<any>>;
}) => <Comp />;
const Pages = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path={'/:lang'}>
          {/*<Route path={'/:lang' + '/auth/login'} element={<AuthLayout />} />*/}
          {pages.map(({ layout, isPublic, child }, index) => (
            // <Route key={index} element={<MasterLayout isPublic={isPublic} />}>
            <Route key={index} element={<Layout layout={layout} isPublic={isPublic} />}>
              {child.map(({ path = '', component }, subIndex: number) => (
                <Route
                  key={path + subIndex}
                  path={'/:lang' + path}
                  element={
                    <Suspense
                      fallback={
                        <Spin>
                          <div className="!w-screen !h-screen" />
                        </Spin>
                      }
                    >
                      {typeof component === 'string' ? (
                        <Navigate to={'/' + lang + component} />
                      ) : (
                        <Page component={component} />
                      )}
                    </Suspense>
                  }
                />
              ))}
            </Route>
          ))}
        </Route>
        <Route path="*" element={<Navigate to={'/' + lang + '/'} />} />
      </Routes>
    </HashRouter>
  );
};

export default Pages;
