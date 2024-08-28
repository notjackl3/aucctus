import React from 'react';
import { Route } from 'react-router-dom';
import Page from '@pages';
import { AppPath } from '@routes/routes';

const useSettingsRoutes = () => {
  return (
    <Route path={AppPath.Settings} element={<Page.SettingsPages.Settings />}>
      <Route
        index
        path={AppPath.SettingsAbout}
        element={<Page.SettingsPages.AboutDetails />}
      />
      <Route
        index
        path={AppPath.SettingsSecurity}
        element={<Page.SettingsPages.SecurityDetails />}
      />
    </Route>
  );
};

export default useSettingsRoutes;
