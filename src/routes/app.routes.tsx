import React, { FunctionComponent } from 'react'
import {
  Routes,
  Route,
} from "react-router-dom";
import Page from '../app/pages';
import { AppPath } from './routes';

export const AppRoutes: FunctionComponent = () => {

  return (
    <Routes>
      <Route path={AppPath.Home} element={<Page.Dashboard />} />
    </Routes>
  )
}