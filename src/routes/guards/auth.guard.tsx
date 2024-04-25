import React, { FunctionComponent, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { hasAccessToken, selectAccessToken, selectRefreshToken, simpleLogout } from '../../features/auth/auth.slice';
import { AppPath } from '../routes';
import { useRefreshToken } from '../../app/hooks/query/auth.hook';
import { store } from '../../app/store';
import api from '../../libs/api';

const AuthGuard: FunctionComponent = () => {
  const isAuthenticated = useSelector(hasAccessToken);
  const refresh = useSelector(selectRefreshToken);
  const accessToken = useSelector(selectAccessToken);
  const { mutate } = useRefreshToken();

  useEffect(() => {
    // Set refresh token and logout actions
    api.setRefreshTokenAction(() => {
      return new Promise((resolve, reject) => {
        if (!refresh) {
          reject();
          return;
        }

        mutate(refresh, {
          onSuccess: (data) => {
            resolve(data);
          },
          onError: (error) => {
            reject(error);
          },
        });
        return;
      });
    });
    api.setLogoutAction(() => store.dispatch(simpleLogout()));
  }, [mutate, refresh]);

  useEffect(() => {
    if (!accessToken && refresh) {
      mutate(refresh);
    }
  }, [accessToken, refresh, mutate]);

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to={AppPath.Login} />;
};

export default AuthGuard;
