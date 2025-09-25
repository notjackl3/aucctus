import React from 'react';
import { Icon } from '@components';
import { TestResultsKeyLearningsProps } from '../TestResults.types';

const TestResultsKeyLearnings: React.FC<TestResultsKeyLearningsProps> = ({
  results,
}) => {
  // Aggregate learnings from ALL test results, not just the first one
  const allLearnings = React.useMemo(() => {
    if (!results || results.length === 0) return [];

    return results.flatMap(
      (result) =>
        result.learnings?.map((learning: any) => ({
          ...learning,
          sourceFilename:
            result.originalFilename || result.title || 'Unknown source',
        })) || [],
    );
  }, [results]);

  // Only show if we have learnings from any result
  if (allLearnings.length === 0) {
    return null;
  }

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='lightbulb'
            className='aucctus-stroke-brand-primary h-5 w-5 flex-shrink-0'
          />
          <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Key Learnings from Analysis
          </h4>
        </div>
        {results.length > 1 && (
          <span className='aucctus-bg-brand-secondary aucctus-text-brand-primary rounded-full px-3 py-1 text-xs font-medium'>
            From {results.length} files
          </span>
        )}
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {allLearnings.map((learning: any, index: number) => (
          <div
            key={learning.uuid}
            className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-4'
          >
            <div className='mb-3'>
              <p className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                Learning #{index + 1}
              </p>
            </div>

            <p className='aucctus-text-sm-regular aucctus-text-brand-primary mb-3 leading-relaxed'>
              {learning.learning}
            </p>

            <div className='aucctus-bg-primary rounded-lg p-3'>
              <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                Impact Assessment:
              </p>
              <p className='aucctus-text-sm-semibold aucctus-text-secondary'>
                {learning.impact}
              </p>
            </div>
            <div className='aucctus-bg-tertiary mt-3 rounded-lg p-3'>
              <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                Source File:
              </p>
              <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                {learning.sourceFilename}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestResultsKeyLearnings;
