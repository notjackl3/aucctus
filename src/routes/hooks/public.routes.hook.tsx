import React from 'react';
import { Route } from 'react-router-dom';
import Page from '@pages';
import Layout from '@routes/layouts';
import { AppPath } from '@routes/routes';

const usePublicRoutes = () => {
  return (
    <Route element={<Layout.Public />}>
      <Route index path={AppPath.Login} element={<Page.Auth.Login />} />
      <Route path={AppPath.SignUp} element={<Page.Auth.SignUp />} />
      <Route path={AppPath.VerifyEmail} element={<Page.Auth.VerifyEmail />} />
      <Route
        path={AppPath.ForgotPassword}
        element={<Page.Auth.ForgotPassword />}
      />
      <Route
        path={AppPath.ResetPassword}
        element={<Page.Auth.ResetPassword />}
      />
      <Route path={AppPath.ConfirmEmail} element={<Page.Auth.ConfirmEmail />} />
    </Route>
  );
};

export default usePublicRoutes;
