import NavDrawer from '@components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '@routes/routes';
import { useAuthStore } from '@stores/auth.store';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateLayout = () => {
  const { user } = useAuthStore();

  if (user && !user.account) {
    return <Navigate to={AppPath.Onboarding} replace />;
  }

  return (
    <div className='flex min-h-screen flex-row items-start overflow-hidden bg-neutral-50'>
      <NavDrawer />
      <div className='ml-[15.5rem] min-h-screen w-[calc(100vw-15.5rem)] overflow-auto'>
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateLayout;
