import { FunctionComponent, useEffect } from 'react';

import { Outlet } from 'react-router-dom';

import analytics from '../../libs/analytics';
import { useAuth } from '../../app/context/Auth/AuthContextProvider';

const AuthGuard: FunctionComponent = () => {
  // This is a guard that will be used to protect routes that require authentication.
  // This is required here to ensure the user is authenticated before
  // they can access the protected routes.
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    analytics.debug('Authenticated: ', isAuthenticated);
  }, [isAuthenticated]);

  return <Outlet />;
};

export default AuthGuard;
