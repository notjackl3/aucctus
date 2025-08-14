import { FunctionComponent } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useIsUnauthRoute } from '../../app/hooks/router.hook';
import { AppPath } from '../routes';

const AuthGuard: FunctionComponent = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const isUnAuthRoute = useIsUnauthRoute();

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  // User is authenticated only if they have a Clerk session
  const isAuthenticated = isSignedIn;

  if (isAuthenticated && isUnAuthRoute) {
    return <Navigate to={AppPath.Home} replace />;
  }

  if (!isAuthenticated && !isUnAuthRoute) {
    return <Navigate to={AppPath.Login} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
