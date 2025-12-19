import React, { useMemo, useState } from 'react';
import { Icon, Container } from '@components';
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
import { riskLevelToNumber } from '../../utils/testUtils';
import TestValidationStats from './TestValidationStats';
import TestAssumptionsDisplay from './TestAssumptionsDisplay';

interface TestHistoryItemProps {
  test: ITestDetails;
  isExpanded: boolean;
  conceptUuid?: string;
  concept?: any;
  generationState: {
    status: string;
  };
}

const TestStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = TEST_STATUS_CONFIGS[status] || TEST_STATUS_CONFIGS.planned;
  return <GenericStatusBadge config={config} />;
};

const TestHistoryItem: React.FC<TestHistoryItemProps> = ({ test }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate validation stats from assumptions
  const validationStats = useMemo(() => {
    const normalizeStatus = (status: string | undefined): string => {
      if (!status) return 'untested';
      if (status === 'partiallyValidated') return 'partially_validated';
      return status.toLowerCase();
    };

    const validated = test.assumptions.filter(
      (a) => normalizeStatus(a.validationStatus) === 'validated',
    ).length;
    const invalidated = test.assumptions.filter(
      (a) => normalizeStatus(a.validationStatus) === 'invalidated',
    ).length;

    return {
      validated,
      invalidated,
    };
  }, [test.assumptions]);

  // Map assumptions to the format expected by TestAssumptionsDisplay
  const mappedAssumptions = useMemo(() => {
    const normalizeStatus = (
      status: string | undefined,
    ): AssumptionStatusV2 => {
      if (!status) return 'untested';
      if (status === 'partiallyValidated') return 'partially_validated';
      return status.toLowerCase() as AssumptionStatusV2;
    };

    return test.assumptions.map((assumption) => {
      const riskValue = riskLevelToNumber(assumption.riskLevel);
      const statusValue = normalizeStatus(assumption.validationStatus);

      return {
        id: assumption.uuid,
        statement: assumption.statement,
        category: (assumption.category?.toLowerCase() ||
          'desirability') as AssumptionCategory,
        status: statusValue,
        risk: riskValue,
        certainty: assumption.certainty || 50,
        confidence: assumption.certainty || 50,
        importance: 70,
        impactPoints: 7,
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

  // Get learning summary from objective or description
  const learningSummary = test.objective || test.description || '';

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className='aucctus-border-secondary aucctus-bg-primary overflow-hidden rounded-lg border'>
      <div className='p-5'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
          {/* Left Column - Test Info */}
          <div className='lg:col-span-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h3 className='aucctus-text-md-medium aucctus-text-brand-primary'>
                  {test.name}
                </h3>
                <TestStatusBadge status={test.status} />
              </div>
              <p className='aucctus-text-sm aucctus-text-tertiary'>
                {new Date(test.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Middle Column - Learning Summary */}
          <div className='lg:col-span-5'>
            <div className='space-y-2'>
              <h4 className='aucctus-text-sm-medium aucctus-text-primary'>
                Learning Summary
              </h4>
              <p className='aucctus-text-sm aucctus-text-secondary'>
                {learningSummary}
              </p>
            </div>
          </div>

          {/* Right Column - Stats and Toggle */}
          <div className='lg:col-span-3'>
            <div className='space-y-3'>
              {/* Validation Stats */}
              <TestValidationStats validationStats={validationStats} />

              {/* Toggle Button */}
              <button
                onClick={handleToggle}
                className='btn btn-light btn-sm w-full gap-1'
              >
                {isExpanded ? (
                  <>
                    Hide Details
                    <Icon
                      variant='chevronup'
                      className='aucctus-stroke-primary h-3.5 w-3.5'
                    />
                  </>
                ) : (
                  <>
                    View Details
                    <Icon
                      variant='chevrondown'
                      className='aucctus-stroke-primary h-3.5 w-3.5'
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <Container.Collapsible open={isExpanded} id={`test-details-${test.uuid}`}>
        <div className='aucctus-border-secondary border-t p-5'>
          <TestAssumptionsDisplay mappedAssumptions={mappedAssumptions} />
        </div>
      </Container.Collapsible>

      {/* Revert Test Button - Commented out for now
      {test.status === 'completed' && (
        <button
          className="btn btn-primary w-full"
          onClick={handleRevertTest}
        >
          <Icon variant='refresh' className='mr-2 h-4 w-4' />
          Revert Test
        </button>
      )}
      */}
    </div>
  );
};

export default TestHistoryItem;
