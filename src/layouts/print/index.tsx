import React, { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

import { Content } from 'antd/es/layout/layout';
import { Outlet } from 'react-router';
import { T_MasterCtx } from '@layouts/admin';

const PrintLayout = ({ children }: PropsWithChildren) => {
  const [tool, setTool] = useState<ReactNode>(null);
  const outletCtx: T_MasterCtx = {
    tool: [tool, setTool],
  };
  return (
    <div className="bg-white">
      <div className="w-[900px] mx-auto py-3 p-1 text-black overflow-hidden">
        <Content className={'w-full h-full overflow-auto miniScroll'}>
          <Outlet context={outletCtx} />
        </Content>
      </div>
    </div>
  );
};
export default PrintLayout;
