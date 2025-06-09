import { Icon } from '@components';
import React from 'react';
import { ITestDetails } from '../types';
import { TestHistoryItem } from './test-history';

interface TestHistorySectionProps {
  tests: ITestDetails[];
  conceptUuid?: string;
}

const TestHistorySection: React.FC<TestHistorySectionProps> = ({
  tests,
  conceptUuid,
}) => {
  if (tests.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Icon
            variant='clock'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h2 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Test History
          </h2>
        </div>

        <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-8 shadow-sm'>
          <div className='flex flex-col items-center justify-center py-4'>
            <Icon
              variant='clock'
              height={56}
              width={56}
              className='aucctus-stroke-brand-tertiary mb-4'
            />
            <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
              No completed tests yet
            </h3>
            <p className='aucctus-text-sm-regular aucctus-text-brand-secondary max-w-md text-center'>
              Once you complete tests, you&apos;ll see comprehensive results
              here. Each completed test provides valuable insights to help
              validate your concept and reduce risk.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon
            variant='clock'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h2 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Test History
          </h2>
        </div>
        <span className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
          {tests.length} test{tests.length !== 1 ? 's' : ''} completed
        </span>
      </div>

      <div className='space-y-4'>
        {tests.map((test) => (
          <TestHistoryItem
            key={test.uuid}
            test={test}
            isExpanded={false}
            conceptUuid={conceptUuid}
          />
        ))}
      </div>
    </div>
  );
};

export default TestHistorySection;
