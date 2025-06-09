import React from 'react';
import { Icon } from '@components';
import { IAssumptionV2 } from '@libs/api/types';
import AssumptionDetailCard from '../../../Assumptions/components/cards/AssumptionDetailCard';

interface TestAssumptionsDisplayProps {
  mappedAssumptions: IAssumptionV2[];
}

const TestAssumptionsDisplay: React.FC<TestAssumptionsDisplayProps> = ({
  mappedAssumptions,
}) => {
  return (
    <div className='space-y-4'>
      <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex items-center gap-2'>
        <Icon
          variant='clipboard'
          className='aucctus-stroke-brand-primary h-5 w-5'
        />
        Tested Assumptions ({mappedAssumptions.length})
      </h4>
      <div className='space-y-3'>
        {mappedAssumptions.map((assumption) => (
          <AssumptionDetailCard
            key={assumption.id}
            assumption={assumption}
            showBenchmark={true}
          />
        ))}
      </div>
    </div>
  );
};

export default TestAssumptionsDisplay;
