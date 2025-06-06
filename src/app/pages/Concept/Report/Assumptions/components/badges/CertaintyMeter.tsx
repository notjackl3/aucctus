import React from 'react';
import GenericMeter from '../shared/GenericMeter';

interface CertaintyMeterProps {
  certainty: number;
}

const CertaintyMeter: React.FC<CertaintyMeterProps> = ({ certainty }) => {
  return <GenericMeter type='certainty' value={certainty} />;
};

export default CertaintyMeter;
