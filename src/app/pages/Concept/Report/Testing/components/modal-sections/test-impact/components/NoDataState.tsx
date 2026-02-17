import React from 'react';
import { Lightbulb } from 'lucide-react';
const NoDataState: React.FC = () => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-8'>
      <div className='flex flex-col items-center justify-center text-center'>
        <Lightbulb className='aucctus-stroke-tertiary mb-4 h-12 w-12' />
        <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
          No impact analysis available
        </h4>
        <p className='aucctus-text-sm-regular aucctus-text-secondary max-w-md'>
          Impact analysis will be generated once you have test results and
          validated assumptions to analyze.
        </p>
      </div>
    </div>
  );
};

export default NoDataState;
