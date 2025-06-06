import React from 'react';
import { Assumption, ITestDetails } from '../../types';
import TestMethodCard from '../common/TestMethodCard';
import AssumptionDetailCard from '../../../Assumptions/components/cards/AssumptionDetailCard';
import {
  IAssumptionV2,
  AssumptionCategory,
  AssumptionStatusV2,
  RiskCategory,
} from '@libs/api/types';
import { Icon } from '@components';

interface TestOverviewProps {
  assumptions?: Assumption[];
  testType?: string;
  testDetail?: ITestDetails | null;
}

const TestOverview: React.FC<TestOverviewProps> = ({
  assumptions = [],
  testType = 'Customer Interviews',
  testDetail,
}) => {
  // Use test detail data if available
  const displayTestType = testDetail?.testType || testType;
  const testName = testDetail?.name || displayTestType;
  const testDescription =
    testDetail?.description ||
    'One-on-one conversations with target users to uncover needs, pain points, and experiences. Through structured questioning, you&apos;ll gather qualitative insights that quantitative data might miss.';
  const testObjective =
    testDetail?.objective ||
    'Customer interviews are highly effective for gathering deep insights directly from your users. They allow you to uncover hidden pain points, validate assumptions, and build empathy with your audience.';

  // Format the title to include "1-1" if it's a customer interview
  const formattedTitle = displayTestType.toLowerCase().includes('interview')
    ? `${testName}`
    : testName;

  // Convert API assumptions directly to IAssumptionV2 format (skip intermediate Assumption format)
  const convertApiToAssumptionCard = (apiAssumption: any): IAssumptionV2 => {
    return {
      uuid: apiAssumption.uuid,
      id: apiAssumption.uuid, // Alias for backward compatibility
      statement: apiAssumption.statement,
      category: apiAssumption.category as AssumptionCategory,
      risk: apiAssumption.riskScore || 0.5, // Use riskScore from API or default
      certainty: apiAssumption.certainty, // Already in 0-1 range
      importance: apiAssumption.importance, // Already in 0-1 range
      certaintyCategory: (apiAssumption.riskLevel as RiskCategory) || 'medium',
      importanceCategory: 'high' as RiskCategory, // Default based on importance value
      riskCategory: (apiAssumption.riskLevel as RiskCategory) || 'medium',
      metadata: {},
      createdAt: apiAssumption.createdAt || new Date().toISOString(),
      lastModified: apiAssumption.updatedAt || new Date().toISOString(),

      // Computed display fields
      status: (apiAssumption.validationType === 'validated'
        ? 'validated'
        : apiAssumption.validationType === 'invalidated'
          ? 'invalidated'
          : apiAssumption.validationType === 'partiallyValidated'
            ? 'partially_validated'
            : 'untested') as AssumptionStatusV2,
      confidence: apiAssumption.certainty, // Alias for certainty
      impactPoints: Math.round(apiAssumption.importance * 10), // Convert 0-1 to 0-10
      validationPercentage: 0, // Will be updated based on test results
      tests: [], // Empty tests array for now
      priority: 'medium',
      benchmark: apiAssumption.benchmark, // Include benchmark from API
    };
  };

  // Convert Testing assumptions to Assumption card format (for props fallback)
  const convertToAssumptionCard = (assumption: Assumption): IAssumptionV2 => {
    // Map risk from string to number
    const riskValue = (() => {
      switch (assumption.risk) {
        case 'high':
          return 0.8; // Convert to 0-1 range
        case 'medium':
          return 0.5;
        case 'low':
          return 0.2;
        default:
          return 0.5;
      }
    })();

    return {
      uuid: assumption.id || '',
      id: assumption.id || '',
      statement: assumption.description,
      category: (assumption.category?.toLowerCase() ||
        'desirability') as AssumptionCategory,
      risk: riskValue, // 0-1 range as expected by API
      certainty: (assumption.confidence || 0) / 100, // Convert back to 0-1 range
      importance: 0.7, // Default importance for testing (0-1 range)
      certaintyCategory: 'medium' as RiskCategory,
      importanceCategory: 'high' as RiskCategory,
      riskCategory: (assumption.risk as RiskCategory) || 'medium',
      metadata: {},
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),

      // Computed display fields
      status: (assumption.status || 'untested') as AssumptionStatusV2,
      confidence: (assumption.confidence || 0) / 100, // Convert to 0-1 range
      impactPoints: 7, // Default impact points (0-10)
      validationPercentage: 0, // Will be updated based on test results
      tests: [], // Empty tests array for now
      priority: 'medium',
      benchmark: assumption.benchmark, // Include benchmark from original assumption
    };
  };

  // Determine which assumptions to display - convert directly to IAssumptionV2
  const getDisplayAssumptions = (): IAssumptionV2[] => {
    // Use assumptions from testDetail if available
    if (testDetail?.assumptions && testDetail.assumptions.length > 0) {
      return testDetail.assumptions.map(convertApiToAssumptionCard);
    }
    // Fallback to props assumptions - convert them to IAssumptionV2 format
    if (assumptions.length > 0) {
      return assumptions.map(convertToAssumptionCard);
    }
    return [];
  };

  const displayAssumptions = getDisplayAssumptions();

  return (
    <div className='space-y-6'>
      {/* Test Method Card */}
      <TestMethodCard
        title={formattedTitle}
        description={testDescription}
        insight={testObjective}
      />

      {/* Test Details from API */}
      {testDetail && (
        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-6'>
          <h3 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-4'>
            Test Details
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-sm-semibold aucctus-text-secondary min-w-0 flex-shrink-0'>
                Status:
              </span>
              <span
                className={`aucctus-text-sm-semibold capitalize ${
                  testDetail.status === 'active'
                    ? 'aucctus-text-success-primary'
                    : testDetail.status === 'completed'
                      ? 'aucctus-text-brand-primary'
                      : 'aucctus-text-tertiary'
                }`}
              >
                {testDetail.status}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-sm-semibold aucctus-text-secondary min-w-0 flex-shrink-0'>
                Target Participants:
              </span>
              <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
                {testDetail.targetParticipants}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='aucctus-text-sm-semibold aucctus-text-secondary min-w-0 flex-shrink-0'>
                Notes:
              </span>
              <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
                {testDetail.notes || 'No notes available'}
              </span>
            </div>
            {testDetail.methodology && (
              <div>
                <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
                  Methodology:
                </span>
                <p className='aucctus-text-sm-regular aucctus-text-brand-primary mt-1'>
                  {testDetail.methodology}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assumptions Section */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            Assumptions Being Tested
          </h3>
          {testDetail?.assumptions && testDetail.assumptions.length > 0 && (
            <span className='aucctus-text-sm-regular aucctus-text-secondary'>
              {testDetail.assumptions.length} assumption
              {testDetail.assumptions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {displayAssumptions.length > 0 ? (
          <div className='space-y-3'>
            {displayAssumptions.map((assumption) => (
              <AssumptionDetailCard
                key={assumption.uuid || assumption.statement}
                assumption={assumption}
                showBenchmark={true}
              />
            ))}
          </div>
        ) : (
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-8'>
            <div className='flex flex-col items-center justify-center text-center'>
              <Icon
                variant='clipboard'
                className='aucctus-stroke-tertiary mb-4 h-12 w-12'
              />
              <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
                No assumptions found
              </h4>
              <p className='aucctus-text-sm-regular aucctus-text-secondary max-w-md'>
                Assumptions being tested will appear here once they&apos;re
                linked to this test.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestOverview;
