import { App, ConfigProvider, message, notification } from 'antd';
import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import { lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';

import { GlobalFacade, setupMessaging, setupStore } from '@store';
import { lang, reportWebVitals } from '@utils';
import { MessageInstance } from 'antd/es/message/interface';
import { NotificationInstance } from 'antd/es/notification/interface';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Cài đặt ngôn ngữ cho dayjs
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import LoadingScreen from './components/LoadingScreen';
import Router from './router';
dayjs.locale('vi');
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale('vi', {
  relativeTime: {
    future: '%s tới',
    past: '%s trước',
    s: 'vài giây',
    m: '1 phút',
    mm: '%d phút',
    h: '1 giờ',
    hh: '%d giờ',
    d: '1 ngày',
    dd: '%d ngày',
    M: '1 tháng',
    MM: '%d tháng',
    y: '1 năm',
    yy: '%d năm',
  },
});
export let customMessage: MessageInstance;
export let customNotification: NotificationInstance;
const fallbackLng = localStorage.getItem('i18nextLng');
if (!fallbackLng) {
  localStorage.setItem('i18nextLng', 'en');
}
i18n
  .use(XHR)
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: fallbackLng || 'en',
    interpolation: {
      escapeValue: false,
    },
  });
const store = setupStore();
let container: HTMLElement;
const Styling = lazy(() => import('./utils/init/styling'));
setupMessaging(store);

const Context = () => {
  const { locale, setLanguage } = GlobalFacade();
  const [api, contextHolder] = message.useMessage({});
  const [apiNotification, contextHolderNotification] = notification.useNotification();
  useEffect(() => {
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.indexOf('temp-') === 0) {
        localStorage.removeItem(localStorage.key(i) || '');
      }
    }
    customMessage = api;
    customNotification = apiNotification;
    setLanguage(lang);
  }, []);

  return (
    <Styling>
      {contextHolder}
      {contextHolderNotification}
      <ConfigProvider
        theme={{
          token: { controlHeight: 36, borderRadius: 3 },
          components: {
            Button: {
              fontWeight: 500,
            },
          },
        }}
        locale={locale}
      >
        <App>
          <Router />
        </App>
      </ConfigProvider>
    </Styling>
  );
};

document.addEventListener(
  'DOMContentLoaded',
  () => {
    if (!container) {
      container = document.getElementById('root') as HTMLElement;
      const root = createRoot(container);

      root.render(
        <Suspense
          fallback={
            // <>
            //   <div className="flex justify-center items-center h-full w-full">
            //     <Spin indicator={<LoadingOutlined style={{ fontSize: 26 }} spin />}>
            //       <Image
            //         width={80}
            //         src="/public/assets/images/logo-quotation.png"
            //         fallback="/public/assets/images/no-image.png"
            //         alt="logo-loading"
            //       />
            //     </Spin>
            //   </div>
            // </>
            // <div id="handle-preloader">
            //   <div className={'!w-full !h-full flex justify-center items-center'}>
            //     <Spin indicator={<LoadingOutlined style={{ fontSize: 26 }} spin />}>
            //       <img width={80} height={80} src={'../public/assets/images/logo.png'} alt={'logo'} />
            //     </Spin>
            //   </div>
            // </div>
            <LoadingScreen />
          }
        >
          <Provider store={store}>
            <Context />
          </Provider>
        </Suspense>,
      );
    }
  },
  { passive: true },
);
reportWebVitals();
