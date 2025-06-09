import React from 'react';
import { Icon } from '@components';

interface ValidationStats {
  validated: number;
  invalidated: number;
  untested: number;
  total: number;
}

interface TestValidationStatsProps {
  validationStats: ValidationStats;
  testStatus: string;
  targetParticipants?: number;
  assumptionsCount: number;
}

const TestValidationStats: React.FC<TestValidationStatsProps> = ({
  validationStats,
  testStatus,
  targetParticipants,
  assumptionsCount,
}) => {
  if (testStatus === 'completed') {
    return (
      <div className='grid grid-cols-3 gap-2'>
        <div className='aucctus-bg-success-secondary rounded-lg p-3 text-center'>
          <div className='aucctus-text-success-primary text-xl font-bold'>
            {validationStats.validated}
          </div>
          <div className='aucctus-text-xs-medium aucctus-text-success-primary'>
            Validated
          </div>
        </div>
        <div className='aucctus-bg-error-secondary rounded-lg p-3 text-center'>
          <div className='aucctus-text-error-primary text-xl font-bold'>
            {validationStats.invalidated}
          </div>
          <div className='aucctus-text-xs-medium aucctus-text-error-primary'>
            Invalidated
          </div>
        </div>
        <div className='aucctus-bg-secondary rounded-lg p-3 text-center'>
          <div className='aucctus-text-brand-primary text-xl font-bold'>
            {validationStats.untested}
          </div>
          <div className='aucctus-text-xs-medium aucctus-text-brand-tertiary'>
            Untested
          </div>
        </div>
      </div>
    );
  }

  if (testStatus === 'active') {
    return (
      <div className='aucctus-bg-brand-section rounded-lg p-4 text-center'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <Icon
            variant='clock'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <span className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
            Test in Progress
          </span>
        </div>
        <p className='aucctus-text-xs-regular aucctus-text-brand-secondary'>
          {targetParticipants
            ? `Target: ${targetParticipants} participants`
            : 'Collecting data...'}
        </p>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-secondary rounded-lg p-4 text-center'>
      <div className='aucctus-text-sm-semibold aucctus-text-brand-tertiary mb-1'>
        Test Planned
      </div>
      <p className='aucctus-text-xs-regular aucctus-text-secondary'>
        {assumptionsCount} assumption{assumptionsCount !== 1 ? 's' : ''} to test
      </p>
    </div>
  );
};

export default TestValidationStats;
