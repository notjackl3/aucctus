import { NucleusPage, OverseerWrapper } from '@components';
import React from 'react';

const NucleusTesting: React.FC = () => {
  return (
    <OverseerWrapper pageContext='nucleus'>
      <div className='aucctus-bg-primary min-h-screen p-8'>
        <NucleusPage />
      </div>
    </OverseerWrapper>
  );
};

export default NucleusTesting;
