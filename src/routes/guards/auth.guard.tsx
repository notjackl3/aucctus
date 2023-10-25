import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { selectAccessToken, selectUser } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';


const AuthGuard: FunctionComponent = () => {
  const accessToken = useSelector(selectAccessToken);


  if (accessToken) {
    return <Outlet />
  }

  return <Navigate to={AppPath.SignIn} />

}

export default AuthGuard;