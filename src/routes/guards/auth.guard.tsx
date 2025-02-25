import { useAuthStore } from '@stores/auth.store';
import { FunctionComponent } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsUnauthRoute } from '../../app/hooks/router.hook';
import { AppPath } from '../routes';

const AuthGuard: FunctionComponent = () => {
  const { isAuthenticated, initialized } = useAuthStore();
  const isUnAuthRoute = useIsUnauthRoute();

  if (initialized) {
    if (isAuthenticated() && isUnAuthRoute) {
      return <Navigate to={AppPath.Home} replace />;
    }
    if (!isAuthenticated() && !isUnAuthRoute) {
      return <Navigate to={AppPath.Login} replace />;
    }
  }

  return <Outlet />;
};

export default AuthGuard;
