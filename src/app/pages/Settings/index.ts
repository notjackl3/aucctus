import React from 'react';

const Settings = React.lazy(() => import('./Settings'));
const AboutDetails = React.lazy(() => import('./components/AboutDetails'));
const SecurityDetails = React.lazy(() => import('./components/SecurityDetails'));

const SettingsPages = {
  AboutDetails,
  SecurityDetails,
  Settings,
};

export default SettingsPages;
