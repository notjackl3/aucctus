import React from 'react';
import { Icon } from '@components';
import { ITestResult } from '@libs/api/types/concept/testing';
import { handleApplyRecommendations } from '../../utils/testUtils';

interface TestResultsDisplayProps {
  testResults: ITestResult[];
  hasResults: boolean;
}

const TestResultsDisplay: React.FC<TestResultsDisplayProps> = ({
  testResults,
  hasResults,
}) => {
  if (!hasResults || testResults.length === 0) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 text-center'>
        <Icon
          variant='barchart'
          className='aucctus-stroke-tertiary mx-auto mb-3 h-12 w-12'
        />
        <h5 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
          Analysis in Progress
        </h5>
        <p className='aucctus-text-sm-regular aucctus-text-secondary'>
          Test results have been uploaded but analysis is still being processed.
          Learnings and recommendations will appear here once ready.
        </p>
      </div>
    );
  }

  const firstResult = testResults[0];
  const learnings = firstResult?.learnings || [];
  const recommendations = firstResult?.editRecommendations || [];

  return (
    <div className='space-y-6'>
      {/* Key Learnings */}
      {learnings.length > 0 && (
        <div className='space-y-4'>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex items-center gap-2'>
            <Icon
              variant='lightbulb'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            Key Learnings ({learnings.length})
          </h4>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {learnings.map((learning) => (
              <div
                key={learning.uuid}
                className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'
              >
                <div className='flex items-start gap-3'>
                  <div className='aucctus-bg-brand-secondary aucctus-border-brand mt-1 flex-shrink-0 rounded-full border p-1'>
                    <Icon
                      variant='check'
                      className='aucctus-stroke-brand-primary h-3 w-3'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-2'>
                      {learning.learning}
                    </p>
                    <div className='aucctus-bg-secondary-extra-subtle rounded p-3'>
                      <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                        Impact:
                      </p>
                      <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                        {learning.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex items-center gap-2'>
              <Icon
                variant='arrowright'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
              Recommendations ({recommendations.length})
            </h4>
            <button
              className='btn btn-primary btn-sm flex items-center gap-2'
              onClick={handleApplyRecommendations}
            >
              <Icon variant='check' className='aucctus-stroke-white h-4 w-4' />
              Apply All
            </button>
          </div>
          <div className='space-y-3'>
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4'
              >
                <div className='flex items-start gap-3'>
                  <div className='aucctus-bg-secondary aucctus-border-secondary mt-1 flex-shrink-0 rounded-full border p-1'>
                    <Icon
                      variant='arrowright'
                      className='aucctus-stroke-brand-primary h-4 w-4'
                    />
                  </div>
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-start justify-between'>
                      <h6 className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                        {recommendation.title}
                      </h6>
                      <span className='aucctus-bg-secondary-extra-subtle aucctus-text-tertiary aucctus-border-secondary rounded-full border px-2 py-0.5 text-xs'>
                        {recommendation.section}
                      </span>
                    </div>
                    <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                      {recommendation.description}
                    </p>
                    <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded border p-3'>
                      <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                        Test Evidence:
                      </p>
                      <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                        {recommendation.testEvidence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Available */}
      {learnings.length === 0 && recommendations.length === 0 && (
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 text-center'>
          <Icon
            variant='barchart'
            className='aucctus-stroke-tertiary mx-auto mb-3 h-12 w-12'
          />
          <h5 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
            Analysis in Progress
          </h5>
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Test results have been uploaded but analysis is still being
            processed. Learnings and recommendations will appear here once
            ready.
          </p>
        </div>
      )}
    </div>
  );
};

export default TestResultsDisplay;
