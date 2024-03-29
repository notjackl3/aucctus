import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAccessToken } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';

const AuthGuard: FunctionComponent = () => {
  const isAuthenticated = useSelector(hasAccessToken);

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to={AppPath.Login} />;
};

export default AuthGuard;
