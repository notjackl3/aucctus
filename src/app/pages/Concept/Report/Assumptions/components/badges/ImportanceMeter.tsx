import React from 'react';
import GenericMeter from '../shared/GenericMeter';

interface ImportanceMeterProps {
  importance: number;
}

const ImportanceMeter: React.FC<ImportanceMeterProps> = ({ importance }) => {
  return <GenericMeter type='importance' value={importance} />;
};

export default ImportanceMeter;
