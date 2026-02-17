import AucctusSocketBootstrap from '@bootstraps/aucctusSocket.bootstrap';
import NavDrawer from '@components/Navigation/NavDrawer/NavDrawer';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateLayout = () => {
  const account = useStore((state) => state.auth.account);
  const user = useStore((state) => state.auth.user);

  const [navCollapsed, setNavCollapsed] = useState(true);
  if (user && !account) {
    return <Navigate to={AppPath.Onboarding} replace />;
  }

  return (
    <AucctusSocketBootstrap>
      <div className='aucctus-bg-secondary-extra-subtle flex min-h-screen flex-row items-start overflow-hidden'>
        <NavDrawer onExpandCollapse={setNavCollapsed} />
        <div
          data-scroll-container
          className={cn(
            'min-h-screen overflow-auto transition-all duration-300',
            {
              'w-[calc(100vw-6rem)]': navCollapsed,
              'ml-[6rem]': navCollapsed,
              'w-[calc(100vw-15.5rem)]': !navCollapsed,
              'ml-[15.5rem]': !navCollapsed,
            },
          )}
        >
          <Outlet />
        </div>
      </div>
    </AucctusSocketBootstrap>
  );
};

export default PrivateLayout;
