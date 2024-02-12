import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectAccessToken } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';


const AuthGuard: FunctionComponent = () => {
  const accessToken = useSelector(selectAccessToken);


  if (accessToken) {
    return <Outlet />
  }

  return <Navigate to={AppPath.SignIn} />

}

export default AuthGuard;