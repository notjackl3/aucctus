import { Banner } from '@components';
import useStore from '@stores/store';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import { isAucctusAdmin } from '../../../libs/utils/account';
import TabView from '../../components/Container/TabView/TabView';

const BASE_SETTING_TABS = [
  { label: 'About you', value: AppPath.SettingsAbout },
  { label: 'Security', value: AppPath.SettingsSecurity },
];

const ADMIN_TAB = { label: 'Admin', value: AppPath.SettingsAdmin };

const Settings: FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useStore((state) => state.auth);

  // Build tabs list conditionally based on admin status
  const SETTING_TABS = useMemo(() => {
    if (isAucctusAdmin(user)) {
      return [...BASE_SETTING_TABS, ADMIN_TAB];
    }
    return BASE_SETTING_TABS;
  }, [user]);

  // Initialize activeTab based on current route
  const getActiveTabFromRoute = useCallback(
    (pathname: string) => {
      const matchingTab = SETTING_TABS.find((tab) => tab.value === pathname);
      return matchingTab ? matchingTab.value : AppPath.SettingsAbout;
    },
    [SETTING_TABS],
  );

  const [activeTab, setActiveTab] = useState<string>(() =>
    getActiveTabFromRoute(location.pathname),
  );

  const missingFields = useMemo(() => {
    if (!user) return [];

    const missing = [];
    if (!user.firstName) missing.push('First Name');
    if (!user.lastName) missing.push('Last Name');

    return missing;
  }, [user]);

  const onTabSelect = useCallback(
    (value: string) => {
      if (missingFields.length > 0) return;
      setActiveTab(value);
      const route = value;
      navigate(route);
    },
    [navigate, missingFields],
  );

  return (
    <div className='box-border flex h-auto w-full flex-col items-center p-8 pb-12'>
      {missingFields.length > 0 && (
        <Banner
          title='Complete your profile'
          description={`Please complete the following required fields: ${missingFields.join(', ')}`}
          variant='warning'
          iconVariant='alert-circle'
          showButton={false}
        />
      )}
      <div className='mb-8 flex flex-row items-start justify-between self-stretch'>
        <div className='flex flex-row items-center justify-start'>
          <h1 className='aucctus-header-sm-medium aucctus-text-brand-primary'>
            Settings
          </h1>
        </div>
      </div>
      <div className='flex h-full flex-row flex-wrap items-start gap-6 self-stretch'>
        <TabView
          tabs={SETTING_TABS}
          className='h-full w-full'
          variant='default'
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
