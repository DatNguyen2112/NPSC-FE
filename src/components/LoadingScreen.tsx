import { useState, useEffect } from 'react';
import { Image, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { linkApi, linkWebUrl } from '@utils';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [logo, setLogo] = useState('');

  useEffect(() => {
    const handleLoaded = () => setIsLoading(false);

    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const subdomain = parts.length > 3 ? parts[0] : 'admin';
    if (subdomain != 'admin') {
      // Cập nhật favicon
      setLogo(`${linkWebUrl + '/files/tenant/logo/' + subdomain + '-logo.png'}`);
    }

    if (document.readyState === 'complete') {
      handleLoaded();
    } else {
      window.addEventListener('DOMContentLoaded', handleLoaded);
      return () => window.removeEventListener('DOMContentLoaded', handleLoaded);
    }
  }, []);

  return isLoading ? (
    <Spin
      size="large"
      indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
      fullscreen
      tip={
        <Image
          width={100}
          src={logo ? logo : '/assets/images/logo.png'}
          alt="logo-loading"
          fallback={'/assets/images/no-image.png'}
          preview={false}
        />
      }
    />
  ) : null; // No need to render children directly here
}
