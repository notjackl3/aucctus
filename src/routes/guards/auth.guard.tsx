import { FunctionComponent } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppPath } from '../routes';
import { useApp } from '../../app/context/AppContextProvider';
import { useIsUnauthRoute } from '../../app/hooks/router.hook';

const AuthGuard: FunctionComponent = () => {
  const { isAuthenticated, isLoading } = useApp();
  const isUnAuthRoute = useIsUnauthRoute();

  if (!isLoading) {
    if (isAuthenticated && isUnAuthRoute) {
      return <Navigate to={AppPath.Home} replace />;
    }
    if (!isAuthenticated && !isUnAuthRoute) {
      return <Navigate to={AppPath.Login} replace />;
    }
  }

  return <Outlet />;
};

export default AuthGuard;
