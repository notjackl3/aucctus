import useStore from '@stores/store';
import { FunctionComponent } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsUnauthRoute } from '../../app/hooks/router.hook';
import { AppPath } from '../routes';

const AuthGuard: FunctionComponent = () => {
  const isAuthenticated = useStore((state) => !!state.auth.access);
  const isUnAuthRoute = useIsUnauthRoute();

  if (isAuthenticated && isUnAuthRoute) {
    return <Navigate to={AppPath.Home} replace />;
  }

  if (!isAuthenticated && !isUnAuthRoute) {
    return <Navigate to={AppPath.Login} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
