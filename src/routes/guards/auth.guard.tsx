import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectUser } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';


const AuthGuard: FunctionComponent = () => {
  const user = useSelector(selectUser);

  if (user) {
    return <Outlet />
  }

  return <Navigate to={AppPath.SignIn} />

}

export default AuthGuard;