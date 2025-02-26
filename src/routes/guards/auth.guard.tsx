import { useAuthStore } from '@stores/auth.store';
import React, { FunctionComponent } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsUnauthRoute } from '../../app/hooks/router.hook';
import { AppPath } from '../routes';

const AuthGuard: FunctionComponent = () => {
  const [auth, setAuth] = React.useState(false);
  const { isAuthenticated, access, refresh, initialized } = useAuthStore();
  const isUnAuthRoute = useIsUnauthRoute();

  React.useEffect(() => {
    setAuth(isAuthenticated());
  }, [access, refresh, isAuthenticated, initialized]);

  if (auth && isUnAuthRoute) {
    return <Navigate to={AppPath.Home} replace />;
  }

  if (!auth && !isUnAuthRoute) {
    return <Navigate to={AppPath.Login} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
