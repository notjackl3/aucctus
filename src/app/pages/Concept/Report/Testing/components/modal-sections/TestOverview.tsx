import React from 'react';
import { Icon } from '@components';
import { AssumptionCategory } from '@libs/api/types';
import { Assumption, ITestDetails, ITestAssumptionDetailed } from '../../types';
import TestMethodCard from '../common/TestMethodCard';
import TestAssumptionCard from '../common/TestAssumptionCard';
import TabBanner from '../common/TabBanner';

interface TestOverviewProps {
  assumptions?: Assumption[];
  testType?: string;
  testDetail?: ITestDetails | null;
}

// Helper to get assumption data in a normalized format for TestAssumptionCard
interface NormalizedAssumption {
  id: string;
  category: AssumptionCategory;
  statement: string;
  benchmark?: string;
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
    "One-on-one conversations with target users to uncover needs, pain points, and experiences. Through structured questioning, you'll gather qualitative insights that quantitative data might miss.";

  // Format the title to include "1-1" if it's a customer interview
  const formattedTitle = displayTestType.toLowerCase().includes('interview')
    ? `1-1 ${testName}`
    : testName;

  // Normalize API assumptions to simple format for TestAssumptionCard
  const normalizeApiAssumption = (
    apiAssumption: ITestAssumptionDetailed,
  ): NormalizedAssumption => ({
    id: apiAssumption.uuid,
    category: apiAssumption.category as AssumptionCategory,
    statement: apiAssumption.statement,
    benchmark: apiAssumption.benchmark,
  });

  // Normalize legacy Assumption props to simple format
  const normalizeLegacyAssumption = (
    assumption: Assumption,
  ): NormalizedAssumption => ({
    id: assumption.id,
    category: (assumption.category?.toLowerCase() ||
      'desirability') as AssumptionCategory,
    statement: assumption.description,
    benchmark: assumption.benchmark,
  });

  // Get normalized assumptions from either source
  const getDisplayAssumptions = (): NormalizedAssumption[] => {
    // Use assumptions from testDetail if available
    if (testDetail?.assumptions && testDetail.assumptions.length > 0) {
      return testDetail.assumptions.map(normalizeApiAssumption);
    }
    // Fallback to props assumptions
    if (assumptions.length > 0) {
      return assumptions.map(normalizeLegacyAssumption);
    }
    return [];
  };

  const displayAssumptions = getDisplayAssumptions();

  return (
    <div className='space-y-6'>
      {/* Tab Banner */}
      <TabBanner
        icon='clipboard-list'
        title='Test Overview'
        description="Review the test method and assumptions you'll be validating with this test."
      />

      {/* Test Method Card */}
      <TestMethodCard
        title={formattedTitle}
        description={testDescription}
        icon='heart'
      />

      {/* Assumptions Section */}
      <div className='space-y-3'>
        {displayAssumptions.length > 0 ? (
          displayAssumptions.map((assumption) => (
            <TestAssumptionCard
              key={assumption.id || assumption.statement}
              category={assumption.category}
              statement={assumption.statement}
              benchmark={assumption.benchmark}
            />
          ))
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
