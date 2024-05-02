import { FunctionComponent, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './styles/settings.module.scss';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import TabView from '../../components/Container/TabView/TabView';

export const SETTING_TABS = [
  { label: 'About you', value: AppPath.SettingsAbout },
  { label: 'Security', value: AppPath.SettingsSecurity },
];

const Settings: FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<string>(AppPath.SettingsAbout);
  const navigate = useNavigate();

  const onTabSelect = useCallback(
    (value: string) => {
      setActiveTab(value);
      const route = value;
      navigate(route);
    },
    [navigate],
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
          activeTab={activeTab}
        >
          <Outlet />
        </TabView>
      </div>
    </div>
  );
};

export default Settings;
