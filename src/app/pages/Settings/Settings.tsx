import { FunctionComponent, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
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
    <div className='box-border flex h-auto w-full flex-col items-center p-8 pb-12'>
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
