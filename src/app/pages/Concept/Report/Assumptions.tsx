import telemetry from '@libs/telemetry';
import React from 'react';
import AssumptionsV1 from './Assumptions/AssumptionsV1';
import AssumptionsV2 from './Assumptions/AssumptionsV2';

// Declare feature flag
declare const FEATURE_ASSUMPTIONS_V2: boolean;
const Assumptions: React.FC = () => {
  telemetry.log('chill bro', FEATURE_ASSUMPTIONS_V2);

  if (FEATURE_ASSUMPTIONS_V2) {
    return <AssumptionsV2 />;
  }
  return <AssumptionsV1 />;
};

export default Assumptions;
