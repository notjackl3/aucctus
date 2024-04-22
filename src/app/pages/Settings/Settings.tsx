import { FunctionComponent, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './styles/settings.module.scss';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import TabView from '../../components/TabView/TabView';

export const SETTING_TABS = [
  { label: 'About you', value: AppPath.SettingsAbout },
  { label: 'Security', value: AppPath.SettingsSecurity },
];

const Settings: FunctionComponent = () => {
  const navigate = useNavigate();

  const onTabSelect = useCallback(
    (value: string) => {
      const route = value;
      navigate(route);
    },
    [navigate]
  );

  return (
    <div className={`${styles.settings}`}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{'Settings'}</h1>
        </div>
      </div>
      <div className={styles.contentContainer}>
        <TabView
          tabs={SETTING_TABS}
          className={styles.tabs}
          variant="default"
          onTabSelect={onTabSelect}
          defaultTab={AppPath.SettingsAbout}
        >
          <Outlet />
        </TabView>
      </div>
    </div>
  );
};

export default Settings;
