import { keyRefreshToken, keyToken, linkApi, routerLinks } from '@utils';
import { Responses } from '@models';
import { customMessage } from '../index';

export const API = {
  init: () =>
    ({
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        authorization: localStorage.getItem(keyToken) ? 'Bearer ' + localStorage.getItem(keyToken) : '',
        'Accept-Language': localStorage.getItem('i18nextLng') || '',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    }) as RequestInit,
  responsible: async <T>(
    url: string,
    params: { [key: string]: string } = {},
    config: RequestInit,
    headers: RequestInit['headers'] = {},
    throwText: boolean = false,
  ) => {
    config.headers = { ...config.headers, ...headers };

    const linkParam = Object.keys(params)
      .map(
        (key) =>
          key + '=' + encodeURIComponent(typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key]),
      )
      .join('&');
      const response = await fetch(
        (url.includes('https://') || url.includes('http://') ? '' : linkApi) + url + (linkParam && '?' + linkParam),
        config,
      );
    if (response.status === 401 && url !== `${routerLinks('Auth', 'api')}/login`) {
      await customMessage.error({ content: 'Phiên đăng nhập hết hạn' });
      localStorage.removeItem(keyToken);
      location.reload();
    }
    const res: Responses<T> = await response.json();
    if (response.ok) return res;
    if (!res.isSuccess && res.message) {
      if (!throwText) customMessage.error({ content: res.message });
      else throw new Error(res.message);
    }
    throw {};
  },
  get: <T>(url: string, params = {}, headers?: RequestInit['headers'], throwText: boolean = false) =>
    API.responsible<T>(url, params, { ...API.init(), method: 'GET' }, headers, throwText),
  post: <T>(url: string, data = {}, params = {}, headers?: RequestInit['headers'], throwText: boolean = false) =>
    API.responsible<T>(url, params, { ...API.init(), method: 'POST', body: JSON.stringify(data) }, headers, throwText),
  put: <T>(url: string, data = {}, params = {}, headers?: RequestInit['headers'], throwText: boolean = false) =>
    API.responsible<T>(url, params, { ...API.init(), method: 'PUT', body: JSON.stringify(data) }, headers, throwText),
  delete: <T>(url: string, params = {}, headers?: RequestInit['headers'], throwText: boolean = false) =>
    API.responsible<T>(url, params, { ...API.init(), method: 'DELETE' }, headers, throwText),
  refresh: async () => {
    const res = await API.get<{ accessToken: string; refreshToken: null }>(
      `${routerLinks('Auth', 'api')}/refresh-token`,
      {},
      { authorization: 'Bearer ' + localStorage.getItem(keyRefreshToken) },
    );
    if (res) {
      localStorage.setItem(keyToken, res.data!.accessToken);
      return 'Bearer ' + res.data!.accessToken;
    }
  },
};
