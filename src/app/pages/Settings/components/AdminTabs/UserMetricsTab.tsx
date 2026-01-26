import { FunctionComponent } from 'react';
import UserMetricsPanel from '../UserMetricsPanel';

/**
 * User Metrics Tab - wraps the existing UserMetricsPanel component
 * for use in the Admin Dashboard tab structure.
 */
const UserMetricsTab: FunctionComponent = () => {
  return <UserMetricsPanel />;
};

export default UserMetricsTab;
