import React from 'react';

const ConfirmEmail = React.lazy(() => import('./ConfirmEmail'));
const ForgotPassword = React.lazy(() => import('./ForgotPassword'));
const ResetPassword = React.lazy(() => import('./ResetPassword'));
const ResetPasswordSuccess = React.lazy(() => import('./ResetPasswordSuccess'));
const Login = React.lazy(() => import('./Login'));
const SignUp = React.lazy(() => import('./SignUp'));
const EmailConfirmation = React.lazy(() => import('./EmailConfirmation'));

const Auth = {
  Login,
  SignUp,
  ForgotPassword,
  ResetPassword,
  ResetPasswordSuccess,
  ConfirmEmail,
  EmailConfirmation,
};

export default Auth;
