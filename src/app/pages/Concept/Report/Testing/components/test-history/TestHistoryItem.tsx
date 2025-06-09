import React, { useMemo } from 'react';
import { Icon, Container } from '@components';
import { cn } from '@libs/utils/react';
import { ITestDetails } from '../../types';
import GenericStatusBadge from '../../../Assumptions/components/shared/GenericStatusBadge';
import { TEST_STATUS_CONFIGS } from '../../../Assumptions/constants/statusConfigs';
import {
  IAssumptionV2,
  AssumptionCategory,
  AssumptionStatusV2,
  TestTypeV2,
  TestResult,
} from '@libs/api/types';
import { useTestResults } from '@hooks/query/testing.hook';
import { ITestResult } from '@libs/api/types/concept/testing';
import { formatTestType, riskLevelToNumber } from '../../utils/testUtils';
import TestValidationStats from './TestValidationStats';
import TestResultsDisplay from './TestResultsDisplay';
import TestAssumptionsDisplay from './TestAssumptionsDisplay';

interface TestHistoryItemProps {
  test: ITestDetails;
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
    test.uuid,
    {
      enabled: !!conceptUuid && !!test.uuid && test.status === 'completed',
    },
  );

  // Type cast the results to include extended properties
  const testResults = (fetchedResults as ITestResult[]) || [];
  const hasResults = testResults.length > 0;

  // Calculate validation stats from assumptions
  const validationStats = useMemo(() => {
    const validated = test.assumptions.filter(
      (a) => a.validationStatus === 'validated',
    ).length;
    const invalidated = test.assumptions.filter(
      (a) => a.validationStatus === 'invalidated',
    ).length;
    const untested = test.assumptions.filter(
      (a) => a.validationStatus === 'untested',
    ).length;

    return { validated, invalidated, untested, total: test.assumptions.length };
  }, [test.assumptions]);

  // Map our assumptions to the format expected by AssumptionDetailCard
  const mappedAssumptions = useMemo(() => {
    return test.assumptions.map((assumption) => {
      // Convert risk level to number for processing
      const riskValue = riskLevelToNumber(assumption.riskLevel);

      // Map status from Testing types to Assumptions types
      const statusValue = (() => {
        if (!assumption.validationStatus)
          return 'untested' as AssumptionStatusV2;
        return assumption.validationStatus as unknown as AssumptionStatusV2;
      })();

      return {
        id: assumption.uuid,
        statement: assumption.statement,
        category: (assumption.category?.toLowerCase() ||
          'desirability') as AssumptionCategory,
        status: statusValue,
        risk: riskValue,
        certainty: assumption.certainty || 50,
        confidence: assumption.certainty || 50,
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
            id: test.uuid,
            name: test.name,
            type: 'experiment' as TestTypeV2,
            date: new Date(test.createdAt).toLocaleDateString(),
            result: (test.status === 'completed'
              ? 'validated'
              : 'untested') as TestResult,
          },
        ],
        priority: 'medium',
        benchmark: assumption.benchmark,
      } as IAssumptionV2;
    });
  }, [test]);

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
                  {test.name}
                </h3>
                <div className='flex flex-wrap items-center gap-3'>
                  <TestStatusBadge status={test.status} />
                  {test.testType && (
                    <span className='aucctus-text-xs-medium aucctus-text-brand-tertiary aucctus-bg-secondary-subtle rounded-md px-2 py-1'>
                      {formatTestType(test.testType)}
                    </span>
                  )}
                  <span className='aucctus-text-xs-regular aucctus-text-secondary'>
                    {new Date(test.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Description and Objective */}
            <div className='space-y-2'>
              <p className='aucctus-text-sm-regular aucctus-text-secondary line-clamp-2'>
                {test.objective || test.description}
              </p>
              {test.status === 'completed' && (
                <div className='aucctus-bg-secondary-extra-subtle rounded-lg p-3'>
                  <h4 className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-1 flex items-center gap-1'>
                    <Icon
                      variant='lightbulb'
                      className='aucctus-stroke-brand-primary h-4 w-4'
                    />
                    Key Insight
                  </h4>
                  <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
                    Test completed successfully
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Metrics and Actions */}
          <div className='flex h-full flex-col justify-between gap-3 lg:w-80'>
            {/* Validation Results using TestValidationStats component */}
            <TestValidationStats
              validationStats={validationStats}
              testStatus={test.status}
              targetParticipants={test.targetParticipants}
              assumptionsCount={test.assumptions.length}
            />

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
              aria-controls={`test-details-${test.uuid}`}
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
      <Container.Collapsible open={isExpanded} id={`test-details-${test.uuid}`}>
        <div className='aucctus-border-secondary aucctus-bg-secondary-extra-subtle border-t'>
          <div className='space-y-6 p-6'>
            {/* Test Results Section */}
            {test.status === 'completed' && (
              <TestResultsDisplay
                testResults={testResults}
                hasResults={hasResults}
              />
            )}

            {/* Show test overview for non-completed tests */}
            {test.status !== 'completed' && (
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
                      {test.objective}
                    </p>
                  </div>
                  {test.methodology && (
                    <div className='aucctus-bg-primary rounded-lg p-4'>
                      <h5 className='aucctus-text-sm-semibold aucctus-text-brand-tertiary mb-2'>
                        Methodology
                      </h5>
                      <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                        {test.methodology}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tested Assumptions */}
            <TestAssumptionsDisplay mappedAssumptions={mappedAssumptions} />
          </div>
        </div>
      </Container.Collapsible>
    </div>
  );
};

export default TestHistoryItem;
