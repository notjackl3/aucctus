import React from 'react';
import GenericStatusBadge from '../shared/GenericStatusBadge';
import { RISK_LEVEL_CONFIGS } from '../../constants/statusConfigs';

interface RiskBadgeProps {
  risk: number;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ risk }) => {
  // Determine risk level based on risk score
  const getRiskLevel = (risk: number) => {
    if (risk >= 70) return 'high';
    if (risk >= 40) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel(risk);
  const config = RISK_LEVEL_CONFIGS[riskLevel];

  return <GenericStatusBadge config={config} />;
};

export default RiskBadge;
