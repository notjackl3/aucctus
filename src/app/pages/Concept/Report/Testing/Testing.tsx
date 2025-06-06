import telemetry from '@libs/telemetry';
import React, { useState, useMemo, createContext, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  RecommendedTest,
  Test,
  ITestDetails,
  ITestDetailsExtended,
  Assumption,
} from './types';
import RecommendedTestSection from './components/RecommendedTestSection';
import TestHistorySection from './components/TestHistorySection';
import { useModal } from '@context/ModalContextProvider';
import { Modal, Loading, Icon } from '@components';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { useTestDetails } from '@hooks/query/testing.hook';

// Context for tracking test completion loading state
interface TestCompletionContextType {
  isCompletingTest: boolean;
  setIsCompletingTest: (loading: boolean) => void;
}

const TestCompletionContext = createContext<TestCompletionContextType>({
  isCompletingTest: false,
  setIsCompletingTest: () => {},
});

export const useTestCompletion = () => useContext(TestCompletionContext);

// Utility function to convert API test details to Test format for TestHistorySection
const convertApiTestsToTestFormat = (apiTests: ITestDetails[]): Test[] => {
  return apiTests.map((apiTest) => {
    // Cast to extended interface to access additional properties
    const extendedTest = apiTest as ITestDetailsExtended;

    return {
      id: apiTest.uuid,
      testName: apiTest.name,
      description: apiTest.description,
      type: 'manual' as const, // API tests are considered manual
      status:
        apiTest.status === 'completed'
          ? 'completed'
          : apiTest.status === 'active'
            ? 'in-progress'
            : 'planned',
      assumptions:
        extendedTest.assumptions?.map((assumption) => ({
          id: assumption.uuid,
          description: assumption.statement,
          category: assumption.category,
          confidence: Math.round(assumption.certainty * 100), // Convert 0-1 to 0-100
          risk: assumption.riskCategory as 'high' | 'medium' | 'low',
          status:
            assumption.validationType === 'validated'
              ? 'validated'
              : assumption.validationType === 'invalidated'
                ? 'invalidated'
                : assumption.validationType === 'partiallyValidated'
                  ? 'validated' // For display purposes, treat partial as validated
                  : 'untested',
        })) || [],
      date: new Date(apiTest.createdAt).toLocaleDateString(),
      // Enhanced results with API data
      results:
        apiTest.status === 'completed'
          ? {
              status: 'mixed' as const, // We'll calculate this based on validation results
              summary: extendedTest.insight || 'Test completed successfully',
              learnings: [], // This will be populated from actual test results
              nextSteps: [],
            }
          : undefined,
      // Add API-specific data for enhanced display
      apiData: {
        testType: apiTest.testType,
        objective: apiTest.objective,
        methodology: apiTest.methodology,
        targetParticipants: apiTest.targetParticipants,
        insight: extendedTest.insight,
        createdAt: apiTest.createdAt,
        updatedAt: apiTest.updatedAt,
      },
    };
  });
};

const Testing: React.FC = () => {
  const { openModal } = useModal();
  const { concept } = useOutletContext<IConceptReportContext>();
  const conceptUuid = concept?.uuid || '';

  // Fetch test details from API
  const {
    testDetails,
    isLoading: isTestDetailsLoading,
    error: testDetailsError,
  } = useTestDetails(conceptUuid);

  const [isCompletingTest, setIsCompletingTest] = useState(false);

  // Get the first non-completed test as the "next test" for the Run Test functionality
  const nextTest = useMemo(() => {
    if (testDetails && testDetails.length > 0) {
      // Find the first test that's not completed (active, planned, etc.)
      return testDetails.find((test) => test.status !== 'completed') || null;
    }
    return null;
  }, [testDetails]);

  // Convert only completed tests to format expected by TestHistorySection
  const convertedTests = useMemo(() => {
    if (testDetails && testDetails.length > 0) {
      // Filter to only show completed tests in history
      const completedTests = testDetails.filter(
        (test) => test.status === 'completed',
      );
      return convertApiTestsToTestFormat(completedTests);
    }
    return [];
  }, [testDetails]);

  // Generate recommended test based on API data
  const getRecommendedTest = (): RecommendedTest | null => {
    // If we have a real test from API, use it
    if (nextTest) {
      // Convert API assumptions to RecommendedTestSection format
      const convertedAssumptions: Assumption[] = nextTest.assumptions.map(
        (apiAssumption) => ({
          id: apiAssumption.uuid,
          description: apiAssumption.statement,
          category: apiAssumption.category,
          confidence: Math.round(apiAssumption.certainty * 100), // Convert 0-1 to 0-100
          risk: apiAssumption.riskCategory as 'high' | 'medium' | 'low',
          status: 'untested' as const,
        }),
      );

      return {
        testName: nextTest.name,
        description: nextTest.description,
        assumptions: convertedAssumptions,
      };
    }

    // No recommended test if no API data
    return null;
  };

  const handleRunTest = () => {
    if (nextTest) {
      // Open the TestExecutionModal with real test data
      openModal(
        Modal.TestExecutionModal,
        {
          testUuid: nextTest.uuid,
          testType: nextTest.testType,
          concept,
        },
        {
          position: 'center',
          backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-25',
          shouldCloseOnOverlayClick: true,
          shouldCloseOnEscape: true,
        },
      );

      // For telemetry purposes
      telemetry.log('testing_run_test', {
        testUuid: nextTest.uuid,
        testName: nextTest.name,
        testType: nextTest.testType,
      });
    }
  };

  const handleSelectAssumption = () => {
    // Placeholder for future functionality when we add the modal back
    // TODO: Implement assumption selection logic
  };

  // Show loading state while fetching test details
  if (isTestDetailsLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <Loading />
      </div>
    );
  }

  // Show error state if there's an error
  if (testDetailsError) {
    return (
      <div className='w-full space-y-6'>
        <div>
          <h1 className='aucctus-text-xl-semibold aucctus-text-brand-primary mb-2'>
            Testing
          </h1>
          <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
            Run tests to validate your assumptions and reduce risk
          </p>
        </div>

        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 shadow-sm'>
          <div className='flex flex-col items-center justify-center py-8'>
            <Icon
              variant='alert-triangle'
              height={48}
              width={48}
              className='aucctus-stroke-error-primary mb-4'
            />
            <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
              Oops! We&apos;re having trouble loading your tests
            </h3>
            <p className='aucctus-text-sm-regular aucctus-text-brand-secondary mb-4 max-w-md text-center'>
              Don&apos;t worry, this happens sometimes. Try refreshing the page
              or check back in a few minutes. Your testing data is safe and will
              be here when we&apos;re back up and running.
            </p>
            <button
              className='btn btn-primary'
              onClick={() => window.location.reload()}
            >
              <Icon
                variant='refresh'
                className='aucctus-stroke-white mr-2 h-4 w-4'
              />
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show no data state if no tests are available
  const hasNoData = !testDetails || testDetails.length === 0;

  return (
    <TestCompletionContext.Provider
      value={{ isCompletingTest, setIsCompletingTest }}
    >
      <div
        className='w-full space-y-6'
        role='region'
        aria-label='Testing Dashboard'
      >
        {/* Header */}
        <div>
          <h1 className='aucctus-text-xl-semibold aucctus-text-brand-primary mb-2'>
            Testing
          </h1>
          <p className='aucctus-text-sm-regular aucctus-text-brand-secondary'>
            Run tests to validate your assumptions and reduce risk
            {!hasNoData && (
              <span className='aucctus-text-brand-primary ml-2'>
                ({testDetails.length} test{testDetails.length !== 1 ? 's' : ''}{' '}
                total, {convertedTests.length} completed)
              </span>
            )}
          </p>
        </div>

        {hasNoData ? (
          // No data state
          <div className='space-y-6'>
            <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 shadow-sm'>
              <div className='flex flex-col items-center justify-center py-8'>
                <Icon
                  variant='clipboard'
                  height={48}
                  width={48}
                  className='aucctus-stroke-brand-tertiary mb-4'
                />
                <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
                  Ready to start testing?
                </h3>
                <p className='aucctus-text-sm-regular aucctus-text-brand-secondary mb-4 max-w-md text-center'>
                  Testing helps you validate your assumptions and reduce risk.
                  Create your first test to start gathering valuable insights
                  from your target audience.
                </p>
                <button className='btn btn-primary'>
                  <Icon
                    variant='plus'
                    className='aucctus-stroke-white mr-2 h-4 w-4'
                  />
                  Create Your First Test
                </button>
              </div>
            </div>

            {/* Empty Test History Section */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='clock'
                  className='aucctus-stroke-brand-primary h-5 w-5'
                />
                <h2 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
                  Test History
                </h2>
              </div>

              <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-6 shadow-sm'>
                <div className='flex flex-col items-center justify-center py-8'>
                  <Icon
                    variant='file'
                    height={48}
                    width={48}
                    className='aucctus-stroke-brand-tertiary mb-4'
                  />
                  <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-2'>
                    Your testing journey starts here
                  </h3>
                  <p className='aucctus-text-sm-regular aucctus-text-brand-secondary max-w-md text-center'>
                    Once you run tests, you&apos;ll see all your results and
                    insights here. Track your progress and learn from each test
                    to improve your concept.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Data available state
          <>
            {/* Recommended Test Section */}
            <div>
              <RecommendedTestSection
                recommendedTest={getRecommendedTest()}
                onRunTest={handleRunTest}
                onSelectAssumption={handleSelectAssumption}
                showBenchmark={true}
              />
            </div>

            {/* Test History Section - Use converted API data */}
            <TestHistorySection
              tests={convertedTests}
              conceptUuid={conceptUuid}
            />
          </>
        )}

        {/* Debug info for development */}
        {__ENVIRONMENT__ === 'development' && testDetails.length > 0 && (
          <div className='aucctus-bg-secondary mt-8 rounded-lg p-4'>
            <h3 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
              API Test Data (Development Only)
            </h3>
            <div className='space-y-2'>
              {testDetails.map((test) => (
                <div
                  key={test.uuid}
                  className='aucctus-text-sm aucctus-text-secondary'
                >
                  <strong>{test.name}</strong> - {test.testType} - {test.status}
                  <br />
                  <span className='aucctus-text-xs'>{test.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TestCompletionContext.Provider>
  );
};

export default Testing;
