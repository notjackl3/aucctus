import AucctusSocketBootstrap from '@bootstraps/aucctusSocket.bootstrap';
import NavDrawer from '@components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '@routes/routes';
import { useAuthStore } from '@stores/auth.store';
import { Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@libs/utils/react';

const PrivateLayout = () => {
  const { user } = useAuthStore();
  const [navCollapsed, setNavCollapsed] = useState(true);

  if (user && !user.account) {
    return <Navigate to={AppPath.Onboarding} replace />;
  }

  return (
    <AucctusSocketBootstrap>
      <div className='aucctus-bg-secondary-extra-subtle flex min-h-screen flex-row items-start overflow-hidden'>
        <NavDrawer onExpandCollapse={setNavCollapsed} />
        <div
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
