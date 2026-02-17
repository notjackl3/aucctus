import React from 'react';
import { ITestResult } from '@libs/api/types/concept/testing';
import { ITestDetails } from '../../types';
import { cn } from '@libs/utils/react';
import { ArrowRight, BarChart3, Check, Lightbulb, Users } from 'lucide-react';

interface TestResultsDisplayProps {
  testResults: ITestResult[];
  hasResults: boolean;
  testDetails: ITestDetails;
}

const priorityConfig = {
  critical: {
    color: 'aucctus-text-error-primary',
    bgColor: 'aucctus-bg-error-subtle',
    label: 'Critical',
  },
  high: {
    color: 'aucctus-text-warning-primary',
    bgColor: 'aucctus-bg-warning-subtle',
    label: 'High',
  },
  medium: {
    color: 'aucctus-text-info-primary',
    bgColor: 'aucctus-bg-info-subtle',
    label: 'Medium',
  },
  low: {
    color: 'aucctus-text-secondary',
    bgColor: 'aucctus-bg-secondary-subtle',
    label: 'Low',
  },
};

const TestResultsDisplay: React.FC<TestResultsDisplayProps> = ({
  testResults,
  hasResults,
  testDetails,
}) => {
  if (!hasResults || testResults.length === 0) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 text-center'>
        <BarChart3 className='aucctus-stroke-tertiary mx-auto mb-3 h-12 w-12' />
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
  // Use comprehensiveRecommendations from test details (includes status, appliedAt, etc.)
  const recommendations = testDetails?.comprehensiveRecommendations || [];

  return (
    <div className='space-y-6'>
      {/* Key Learnings */}
      {learnings.length > 0 && (
        <div className='space-y-4'>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex items-center gap-2'>
            <Lightbulb className='aucctus-stroke-brand-primary h-5 w-5' />
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
                    <Check className='aucctus-stroke-brand-primary h-3 w-3' />
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
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex items-center gap-2'>
            <ArrowRight className='aucctus-stroke-brand-primary h-5 w-5' />
            Recommendations ({recommendations.length})
          </h4>
          <div className='space-y-3'>
            {recommendations.map((recommendation) => {
              const priorityStyle = priorityConfig[recommendation.priority];
              const isApplied = recommendation.status === 'applied';

              return (
                <div
                  key={recommendation.uuid}
                  className={cn(
                    'rounded-lg border-2 p-4',
                    isApplied
                      ? 'aucctus-border-secondary aucctus-bg-secondary-subtle opacity-60'
                      : 'aucctus-bg-primary aucctus-border-secondary',
                  )}
                >
                  <div className='flex items-start gap-3'>
                    {/* Status indicator */}
                    <div className='flex-shrink-0 pt-1'>
                      {isApplied ? (
                        <div className='aucctus-bg-success-solid aucctus-border-success flex h-5 w-5 items-center justify-center rounded border-2'>
                          <Check className='aucctus-stroke-white h-3 w-3' />
                        </div>
                      ) : (
                        <div className='aucctus-bg-secondary aucctus-border-secondary flex h-5 w-5 items-center justify-center rounded-full border p-1'>
                          <ArrowRight className='aucctus-stroke-brand-primary h-3 w-3' />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-start justify-between gap-2'>
                        <h6
                          className={cn(
                            'aucctus-text-sm-semibold flex-1',
                            isApplied
                              ? 'aucctus-text-tertiary'
                              : 'aucctus-text-brand-primary',
                          )}
                        >
                          {recommendation.recommendation}
                        </h6>
                        <div className='flex items-center gap-2'>
                          {isApplied && (
                            <div className='aucctus-bg-success-subtle aucctus-text-success-primary aucctus-text-xs-medium rounded-full px-2 py-1'>
                              Applied
                            </div>
                          )}
                          <div
                            className={cn(
                              'aucctus-text-xs-medium rounded-full px-2 py-1',
                              priorityStyle.bgColor,
                              priorityStyle.color,
                            )}
                          >
                            {priorityStyle.label}
                          </div>
                        </div>
                      </div>

                      <p
                        className={cn(
                          'aucctus-text-sm-regular',
                          isApplied
                            ? 'aucctus-text-tertiary'
                            : 'aucctus-text-secondary',
                        )}
                      >
                        <span
                          className={
                            isApplied
                              ? 'aucctus-text-quaternary'
                              : 'aucctus-text-tertiary'
                          }
                        >
                          Target:
                        </span>{' '}
                        {recommendation.section}
                      </p>

                      <div
                        className={cn(
                          'rounded-md p-3',
                          isApplied
                            ? 'aucctus-bg-secondary'
                            : 'aucctus-bg-secondary-extra-subtle aucctus-border-secondary border',
                        )}
                      >
                        <p
                          className={cn(
                            'aucctus-text-xs-regular mb-1',
                            isApplied
                              ? 'aucctus-text-quaternary'
                              : 'aucctus-text-tertiary',
                          )}
                        >
                          Rationale:
                        </p>
                        <p
                          className={cn(
                            'aucctus-text-sm-regular',
                            isApplied
                              ? 'aucctus-text-tertiary'
                              : 'aucctus-text-secondary',
                          )}
                        >
                          {recommendation.rationale}
                        </p>
                      </div>

                      {recommendation.sourceCount > 0 && (
                        <div className='flex items-center gap-2'>
                          <Users
                            className={cn(
                              'h-4 w-4',
                              isApplied
                                ? 'aucctus-stroke-quaternary'
                                : 'aucctus-stroke-tertiary',
                            )}
                          />
                          <p
                            className={cn(
                              'aucctus-text-xs-regular',
                              isApplied
                                ? 'aucctus-text-quaternary'
                                : 'aucctus-text-tertiary',
                            )}
                          >
                            Based on {recommendation.sourceCount} test result
                            {recommendation.sourceCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results Available */}
      {learnings.length === 0 && recommendations.length === 0 && (
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 text-center'>
          <BarChart3 className='aucctus-stroke-tertiary mx-auto mb-3 h-12 w-12' />
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
