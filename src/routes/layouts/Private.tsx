import NavDrawer from '@components/Navigation/NavDrawer/NavDrawer';
import { AppPath } from '@routes/routes';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../app/stores/app.store';

const PrivateLayout = () => {
  const { user } = useAppStore();

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
