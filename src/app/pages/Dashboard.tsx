import { FunctionComponent } from 'react';
import DashboardHeader from '../components/DashbaordHeader';
import { useSelector } from 'react-redux';
import { selectAccount } from '../../features/auth/auth.slice';

import styles from '../assets/styles/pages/dashboard.module.scss';

const Dashboard: FunctionComponent = () => {
  const { name: accountName } = useSelector(selectAccount) || { name: '' };

  return (
    <div className={styles.dashboard}>
      <DashboardHeader
        title={accountName || ''}
        supportingText="The latest domain reports as they relate to your business."
      />
    </div>
  );
};

export default Dashboard;
