import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { selectAccessToken } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';


const AuthGuard: FunctionComponent = () => {
  const accessToken = useSelector(selectAccessToken);
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!accessToken) {
      navigate(AppPath.SignIn);
    }
  }, [accessToken, navigate]);

  if (accessToken) {
    return <Outlet />
  }

  return <Navigate to={AppPath.SignIn} />

}

export default AuthGuard;