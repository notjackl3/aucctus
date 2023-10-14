import React, { FunctionComponent } from 'react'
import {
  useMatch,
  Routes,
  Route,
} from "react-router-dom";
import Page from '../app/pages';

export const AuthRoutes: FunctionComponent = () => {


  return (
    <>
      <Route index element={<Page.Auth.Register />} />
      <Route path={`/`} element={<Page.Auth.Register />} />
      <Route path={`/sign-in`} element={<Page.Auth.SignIn />} />
      <Route path='*' element={<Page.NotFound />} />
    </>
  )
}

