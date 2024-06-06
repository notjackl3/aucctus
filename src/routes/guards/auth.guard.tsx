import { FunctionComponent } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppPath } from '../routes';
import { useApp } from '../../app/context/AppContextProvider';

const AuthGuard: FunctionComponent = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to={AppPath.Login} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
