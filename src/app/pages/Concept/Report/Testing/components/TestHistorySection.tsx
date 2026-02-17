import React from 'react';
import { ITestDetails } from '../types';
import { TestHistoryItem } from './test-history';
import type { ITestGenerationState } from '@hooks/sockets/testing';
import { Clock } from 'lucide-react';

interface TestHistorySectionProps {
  tests: ITestDetails[];
  conceptUuid?: string;
  concept?: any;
  generationState: ITestGenerationState;
}

const TestHistorySection: React.FC<TestHistorySectionProps> = ({
  tests,
  conceptUuid,
  concept,
  generationState,
}) => {
  if (tests.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
            Test History
          </h2>
        </div>

        <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-8 shadow-sm'>
          <div className='flex flex-col items-center justify-center py-4'>
            <Clock size={56} className='aucctus-stroke-tertiary mb-4' />
            <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
              No completed tests yet
            </h3>
            <p className='aucctus-text-sm aucctus-text-tertiary max-w-md text-center'>
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
        <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
          Test History
        </h2>
      </div>

      <div className='grid gap-4'>
        {tests.map((test) => (
          <TestHistoryItem
            key={test.uuid}
            test={test}
            isExpanded={false}
            conceptUuid={conceptUuid}
            concept={concept}
            generationState={generationState}
          />
        ))}
      </div>
    </div>
  );
};

export default TestHistorySection;
