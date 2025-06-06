import { Icon, Container } from '@components';
import { cn } from '@libs/utils/react';
import React, { useMemo } from 'react';
import { Test } from '../types';
import AssumptionDetailCard from '../../Assumptions/components/cards/AssumptionDetailCard';
import GenericStatusBadge from '../../Assumptions/components/shared/GenericStatusBadge';
import { TEST_STATUS_CONFIGS } from '../../Assumptions/constants/statusConfigs';
import {
  IAssumptionV2,
  AssumptionCategory,
  AssumptionStatusV2,
  TestTypeV2,
  TestResult,
} from '@libs/api/types';
import { useTestResults } from '@hooks/query/testing.hook';

// Extended interface to match API response for test results
interface ExtendedTestResult {
  uuid: string;
  title: string;
  description?: string;
  fileType: string;
  testDetailsUuid: string;
  sourceUuid: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  originalFilename: string;
  summary?: string;
  learnings?: Array<{
    uuid: string;
    learning: string;
    impact: string;
    testResultUuid: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  editRecommendations?: Array<{
    title: string;
    reason: string;
    section: string;
    description: string;
    testEvidence: string;
  }>;
}

interface TestHistorySectionProps {
  tests: Test[];
  conceptUuid?: string;
}

interface TestHistoryItemProps {
  test: Test;
  isExpanded: boolean;
  conceptUuid?: string;
}

const TestStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = TEST_STATUS_CONFIGS[status] || TEST_STATUS_CONFIGS.planned;
  return <GenericStatusBadge config={config} />;
};

const TestHistoryItem: React.FC<TestHistoryItemProps> = ({
  test,
  isExpanded,
  conceptUuid,
}) => {
  // Fetch test results to get learnings and recommendations
  const { results: fetchedResults } = useTestResults(
    conceptUuid || '',
    test.id,
    {
      enabled: !!conceptUuid && !!test.id && test.status === 'completed',
    },
  );

  // Type cast the results to include extended properties
  const testResults = (fetchedResults as ExtendedTestResult[]) || [];
  const hasResults = testResults.length > 0;
  const firstResult = hasResults ? testResults[0] : null;
  const learnings = firstResult?.learnings || [];
  const recommendations = firstResult?.editRecommendations || [];

  // Calculate validation stats from assumptions
  const validationStats = useMemo(() => {
    const validated = test.assumptions.filter(
      (a) => a.status === 'validated',
    ).length;
    const invalidated = test.assumptions.filter(
      (a) => a.status === 'invalidated',
    ).length;
    const untested = test.assumptions.filter(
      (a) => a.status === 'untested',
    ).length;

    return { validated, invalidated, untested, total: test.assumptions.length };
  }, [test.assumptions]);

  // Map our assumptions to the format expected by AssumptionDetailCard
  const mappedAssumptions = useMemo(() => {
    return test.assumptions.map((assumption) => {
      // Convert string risk (high, medium, low) to number (0-100)
      const riskValue = (() => {
        switch (assumption.risk) {
          case 'high':
            return 80;
          case 'medium':
            return 50;
          case 'low':
            return 20;
          default:
            return 50;
        }
      })();

      // Map status from Testing types to Assumptions types
      const statusValue = (() => {
        if (!assumption.status) return 'untested' as AssumptionStatusV2;
        return assumption.status as unknown as AssumptionStatusV2;
      })();

      return {
        id: assumption.id,
        statement: assumption.description,
        category: (assumption.category?.toLowerCase() ||
          'desirability') as AssumptionCategory,
        status: statusValue,
        risk: riskValue,
        certainty: assumption.confidence || 50,
        confidence: assumption.confidence || 50,
        importance: 70, // Default to high importance
        impactPoints: 7, // Default impact points (0-10)
        validationPercentage:
          statusValue === 'validated'
            ? 100
            : statusValue === 'invalidated'
              ? 0
              : statusValue === 'partially_validated'
                ? 50
                : 0,
        tests: [
          {
            id: test.id,
            name: test.testName,
            type: 'experiment' as TestTypeV2,
            date: test.date || new Date().toISOString().split('T')[0],
            result: (test.results?.status === 'validated'
              ? 'validated'
              : test.results?.status === 'invalidated'
                ? 'invalidated'
                : 'untested') as TestResult,
          },
        ],
        priority: 'medium',
        benchmark: assumption.benchmark,
      } as IAssumptionV2;
    });
  }, [test]);

  // Format test type for display
  const formatTestType = (testType: string) => {
    const typeMap: Record<string, string> = {
      interview: 'Interview',
      survey: 'Survey',
      usability: 'Usability Test',
      ab: 'A/B Test',
      focus_group: 'Focus Group',
      prototype: 'Prototype Test',
      other: 'Other',
    };
    return typeMap[testType] || testType;
  };

  // Handle apply recommendations
  const handleApplyRecommendations = () => {
    alert('Apply Recommendations feature is coming soon!');
  };

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary overflow-hidden rounded-xl border shadow-sm'>
      {/* Test Header */}
      <div className='p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          {/* Left Section - Test Info */}
          <div className='flex-1 space-y-3'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex-1'>
                <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-1'>
                  {test.testName}
                </h3>
                <div className='flex flex-wrap items-center gap-3'>
                  <TestStatusBadge status={test.status} />
                  {test.apiData?.testType && (
                    <span className='aucctus-text-xs-medium aucctus-text-brand-tertiary aucctus-bg-secondary-subtle rounded-md px-2 py-1'>
                      {formatTestType(test.apiData.testType)}
                    </span>
                  )}
                  <span className='aucctus-text-xs-regular aucctus-text-secondary'>
                    {test.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Description and Objective */}
            <div className='space-y-2'>
              <p className='aucctus-text-sm-regular aucctus-text-secondary line-clamp-2'>
                {test.apiData?.objective || test.description}
              </p>
              {test.apiData?.insight && test.status === 'completed' && (
                <div className='aucctus-bg-secondary-extra-subtle rounded-lg p-3'>
                  <h4 className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-1 flex items-center gap-1'>
                    <Icon
                      variant='lightbulb'
                      className='aucctus-stroke-brand-primary h-4 w-4'
                    />
                    Key Insight
                  </h4>
                  <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
                    {test.apiData.insight}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Metrics and Actions */}
          <div className='flex h-full flex-col justify-between gap-3 lg:w-80'>
            {/* Validation Results */}
            {test.status === 'completed' ? (
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
            ) : test.status === 'in-progress' ? (
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
                  {test.apiData?.targetParticipants
                    ? `Target: ${test.apiData.targetParticipants} participants`
                    : 'Collecting data...'}
                </p>
              </div>
            ) : (
              <div className='aucctus-bg-secondary rounded-lg p-4 text-center'>
                <div className='aucctus-text-sm-semibold aucctus-text-brand-tertiary mb-1'>
                  Test Planned
                </div>
                <p className='aucctus-text-xs-regular aucctus-text-secondary'>
                  {test.assumptions.length} assumption
                  {test.assumptions.length !== 1 ? 's' : ''} to test
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              className={cn(
                'btn btn-disabled w-full transition-all duration-200',
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Disabled - no action
              }}
              disabled={true}
              aria-expanded={false}
              aria-controls={`test-details-${test.id}`}
            >
              <>
                <Icon
                  variant='clock'
                  className='aucctus-stroke-disabled mr-2 h-4 w-4'
                />
                Coming Soon
              </>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content using Container.Collapsible */}
      <Container.Collapsible open={isExpanded} id={`test-details-${test.id}`}>
        <div className='aucctus-border-secondary aucctus-bg-secondary-extra-subtle border-t'>
          <div className='space-y-6 p-6'>
            {/* Test Results Section */}
            {test.status === 'completed' && hasResults && (
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
                        <Icon
                          variant='check'
                          className='aucctus-stroke-white h-4 w-4'
                        />
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
                      Test results have been uploaded but analysis is still
                      being processed. Learnings and recommendations will appear
                      here once ready.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Show test overview for non-completed tests */}
            {test.status !== 'completed' && test.apiData && (
              <div className='space-y-4'>
                <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex items-center gap-2'>
                  <Icon
                    variant='file'
                    className='aucctus-stroke-brand-primary h-5 w-5'
                  />
                  Test Overview
                </h4>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='aucctus-bg-primary rounded-lg p-4'>
                    <h5 className='aucctus-text-sm-semibold aucctus-text-brand-tertiary mb-2'>
                      Objective
                    </h5>
                    <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                      {test.apiData.objective}
                    </p>
                  </div>
                  {test.apiData.methodology && (
                    <div className='aucctus-bg-primary rounded-lg p-4'>
                      <h5 className='aucctus-text-sm-semibold aucctus-text-brand-tertiary mb-2'>
                        Methodology
                      </h5>
                      <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                        {test.apiData.methodology}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tested Assumptions */}
            <div className='space-y-4'>
              <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary flex items-center gap-2'>
                <Icon
                  variant='clipboard'
                  className='aucctus-stroke-brand-primary h-5 w-5'
                />
                Tested Assumptions ({test.assumptions.length})
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
          </div>
        </div>
      </Container.Collapsible>
    </div>
  );
};

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
            key={test.id}
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
