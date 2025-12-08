import { PropsWithChildren, useEffect } from 'react';

import { GlobalFacade, TaskNotificationFacade } from '@store';

import './index.less';

const AuthLayout = ({ children }: PropsWithChildren) => {
  const globalFacade = GlobalFacade();
  const notificationFacade = TaskNotificationFacade();
  
  useEffect(() => {
    globalFacade.logout();
    notificationFacade.revokeFCM();
  }, []);

  return (
    <div className="relative">
      <div className="block lg:flex h-full bg-gray-100 bg-cover bg-no-repeat object-cover">
        <div className=" min-h-full h-screen hidden lg:block "></div>
        <div className="absolute left-0 top-0 w-screen h-screen z-0"></div>
        <div className="w-full h-screen  flex items-center justify-between lg:items-center relative">
          <div className=" flex justify-center p-10 w-full">{children}</div>
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
