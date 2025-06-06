import React from 'react';
import { AssumptionStatusV2 } from '@libs/api/types';
import GenericStatusBadge from '../shared/GenericStatusBadge';
import { ASSUMPTION_STATUS_CONFIGS } from '../../constants/statusConfigs';

interface StatusBadgeProps {
  status: AssumptionStatusV2;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Map status to config key, with fallback for untested
  const configKey = status === 'untested' ? 'untested' : status;
  const config =
    ASSUMPTION_STATUS_CONFIGS[configKey] || ASSUMPTION_STATUS_CONFIGS.untested;

  return <GenericStatusBadge config={config} />;
};

export default StatusBadge;
