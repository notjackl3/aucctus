import { FunctionComponent, useEffect, useState } from 'react';

import { Outlet } from 'react-router-dom';

import { useAuth } from '../../app/hooks/query/auth.hook';
import analytics from '../../libs/analytics';

const AuthGuard: FunctionComponent = () => {
  // This is a guard that will be used to protect routes that require authentication.
  // This is required here to ensure the user is authenticated before
  // they can access the protected routes.
  const { isAuthenticated, refreshToken, tokens } = useAuth();
  const [hasDoneInitialRefresh, setHasDoneInitialRefresh] = useState<boolean>(true);

  useEffect(() => {
    // Set access token
    if (tokens.refresh && !hasDoneInitialRefresh) {
      setHasDoneInitialRefresh(true);
      refreshToken.mutate();
      console.log('Refresh Token');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDoneInitialRefresh]);

  useEffect(() => {
    analytics.debug('Authenticated: ', isAuthenticated);
  }, [isAuthenticated]);

  return <Outlet />;
};

export default AuthGuard;
