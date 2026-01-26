import { FunctionComponent, useState, useCallback } from 'react';
import TabView from '../../../components/Container/TabView/TabView';
import {
  AccountSettingsTab,
  AccountMetricsTab,
  UserMetricsTab,
} from './AdminTabs';

// Tab configuration
const ADMIN_TABS = [
  { label: 'Account Settings', value: 'account-settings' },
  { label: 'Account Metrics', value: 'account-metrics' },
  { label: 'User Metrics', value: 'user-metrics' },
];

const AdminDetails: FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<string>('account-settings');

  const onTabSelect = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account-settings':
        return <AccountSettingsTab />;
      case 'account-metrics':
        return <AccountMetricsTab />;
      case 'user-metrics':
        return <UserMetricsTab />;
      default:
        return <AccountSettingsTab />;
    }
  };

  return (
    <div className='flex h-full w-full flex-col items-start'>
      <div className='mb-8 flex w-full items-start justify-between'>
        <div className='flex flex-col'>
          <h3 className='aucctus-text-xl-semibold aucctus-text-brand-secondary'>
            Admin Dashboard
          </h3>
          <div className='aucctus-text-sm aucctus-text-secondary'>
            Administrative tools and metrics for Aucctus admins.
          </div>
        </div>
      </div>

      <TabView
        tabs={ADMIN_TABS}
        className='h-full w-full'
        variant='button'
        onTabSelect={onTabSelect}
        activeTab={activeTab}
        tabGroupClassName='mb-6'
      >
        {renderTabContent()}
      </TabView>
    </div>
  );
};

export default AdminDetails;
