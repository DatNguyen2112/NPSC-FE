import { Content } from 'antd/es/layout/layout';
import { PropsWithChildren } from 'react';
import { Outlet } from 'react-router';

const PublicLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className=" min-h-full">
      <Content className={'w-full h-full overflow-auto miniScroll'}>
        <div className="2xl:container w-full mx-auto">
          <Outlet />
        </div>
      </Content>
    </div>
  );
};
export default PublicLayout;
