import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { refreshAuth, selectUser } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';
import { useAppDispatch } from '../../app/hooks';


const AuthGuard: FunctionComponent = () => {
  const user = useSelector(selectUser);
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      dispatch(refreshAuth())
    }
  }, [user])

  if (user) {
    return <Outlet />
  }

  return <Navigate to={AppPath.SignIn} state={{ from: location }} replace />

}

export default AuthGuard;