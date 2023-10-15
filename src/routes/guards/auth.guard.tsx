import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectUser } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';


const AuthGuard: FunctionComponent = () => {
  const user = useSelector(selectUser);

  if (user) {
    if (!user.organizationId) {
      return <Navigate to={AppPath.OnBoarding} />
    }

    return <Outlet />
  }

  return <Navigate to={AppPath.SignIn} />

}

export default AuthGuard;