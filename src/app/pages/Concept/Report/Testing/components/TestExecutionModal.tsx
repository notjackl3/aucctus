import React, { useState, useEffect } from 'react';
import { Icon } from '@components';
import LoadingSpinner from '@components/Icon/LoadingSpinner';
import { cn } from '@libs/utils/react';
import { useModal } from '@context/ModalContextProvider';
import TabView, { TabElement } from '@components/Container/TabView/TabView';
import {
  useTestDetail,
  useTestResults,
  useCompleteTestDetail,
} from '@hooks/query/testing.hook';
import { Assumption } from '../types';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { animated, easings, useTransition } from '@react-spring/web';
import { useTestCompletion } from '../Testing';

// Test Execution Modal Sections
import TestOverview from './modal-sections/TestOverview';
import TestParticipants from './modal-sections/TestParticipants';
import TestCollateral from './modal-sections/TestCollateral';
import TestExecution from './modal-sections/TestExecution';
import TestResults from './modal-sections/TestResults';
import TestImpact from './modal-sections/test-impact/TestImpact';

interface TestExecutionModalProps {
  assumptions?: Assumption[];
  testType?: string;
  testUuid?: string;
  concept: any;
}

// Storage key for remembering the last active tab
const TEST_MODAL_TAB_STORAGE_KEY = 'test-execution-modal-active-tab';

// Helper functions for localStorage
const getStoredActiveTab = (): string => {
  try {
    return localStorage.getItem(TEST_MODAL_TAB_STORAGE_KEY) || 'overview';
  } catch (error) {
    return 'overview';
  }
};

const setStoredActiveTab = (tab: string): void => {
  try {
    localStorage.setItem(TEST_MODAL_TAB_STORAGE_KEY, tab);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to store active tab in localStorage:', error);
  }
};

const TestExecutionModal: React.FC<TestExecutionModalProps> = ({
  assumptions = [],
  testType = 'Customer Interviews',
  testUuid,
  concept,
}) => {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();
  const conceptUuid = concept?.uuid || '';

  // Initialize with stored tab or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => getStoredActiveTab());
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(['overview']),
  );

  // Only fetch test detail initially (needed for all tabs)
  const {
    testDetail,
    isLoading: isTestDetailLoading,
    error: testDetailError,
  } = useTestDetail(conceptUuid, testUuid || '');

  // Fetch test results when results tab is visited (needed for Complete button logic)
  const shouldFetchResults =
    visitedTabs.has('results') && !!conceptUuid && !!testUuid;
  const { results } = useTestResults(conceptUuid, testUuid || '', {
    enabled: shouldFetchResults,
  });

  // Hook for completing test
  const completeTestDetail = useCompleteTestDetail();

  // Get completion context
  const { setIsCompletingTest } = useTestCompletion();

  // Update visited tabs when activeTab changes and save to localStorage
  useEffect(() => {
    setVisitedTabs((prev) => new Set([...prev, activeTab]));
    setStoredActiveTab(activeTab);
  }, [activeTab]);

  // Check if test can be completed (requires test results)
  const canCompleteTest = results && results.length > 0;

  // Enhanced close modal function
  const handleCloseModal = () => {
    // Invalidate queries to ensure parent component gets fresh data
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.testDetails, conceptUuid],
    });

    if (testUuid) {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testDetail, conceptUuid, testUuid],
      });
    }

    closeModal();
  };

  // Handle test completion
  const handleCompleteTest = async () => {
    if (!conceptUuid || !testUuid || !canCompleteTest) {
      return;
    }

    // Set loading state for the parent component
    setIsCompletingTest(true);

    try {
      await completeTestDetail.mutateAsync({
        conceptUuid,
        testUuid,
      });

      // Close modal after successful completion
      handleCloseModal();
    } catch (error) {
      // Error handling is done by the mutation hook
    } finally {
      // Clear loading state
      setIsCompletingTest(false);
    }
  };

  const tabs: TabElement[] = [
    {
      value: 'overview',
      label: (
        <div className='flex items-center gap-2'>
          <Icon variant='file' className='aucctus-stroke-secondary h-4 w-4' />
          <span>Overview</span>
        </div>
      ),
    },
    {
      value: 'participants',
      label: (
        <div className='flex items-center gap-2'>
          <Icon
            variant='users-03'
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <span>Participants</span>
        </div>
      ),
    },
    {
      value: 'collateral',
      label: (
        <div className='flex items-center gap-2'>
          <Icon
            variant='file-attachment'
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <span>Collateral</span>
        </div>
      ),
    },
    {
      value: 'execute',
      label: (
        <div className='flex items-center gap-2'>
          <Icon
            variant='play-square'
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <span>Execute</span>
        </div>
      ),
    },
    {
      value: 'results',
      label: (
        <div className='flex items-center gap-2'>
          <Icon
            variant='barchart'
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <span>Results</span>
          {results && results.length > 0 && (
            <span className='aucctus-bg-brand-secondary aucctus-text-brand-primary rounded-full px-2 py-0.5 text-xs'>
              {results.length}
            </span>
          )}
        </div>
      ),
    },
    {
      value: 'impact',
      label: (
        <div className='flex items-center gap-2'>
          <Icon
            variant='lightbulb'
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <span>Impact</span>
        </div>
      ),
    },
  ];

  // Disabled tabs list
  const disabledTabs = ['impact'].filter((tabId) => {
    // Enable impact tab if we have test results with recommendations
    if (tabId === 'impact' && results && results.length > 0) {
      const hasRecommendations = results.some(
        (result: any) =>
          result.editRecommendations && result.editRecommendations.length > 0,
      );
      return !hasRecommendations; // Only disable if no recommendations
    }
    return true; // Keep other tabs disabled
  });

  const getTabIndex = (tabId: string) => {
    return tabs.findIndex((tab) => tab.value === tabId);
  };

  const goToNextTab = () => {
    const currentIndex = getTabIndex(activeTab);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      if (disabledTabs.includes(nextTab.value)) {
        if (currentIndex + 2 < tabs.length) {
          setActiveTab(tabs[currentIndex + 2].value);
        }
      } else {
        setActiveTab(nextTab.value);
      }
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = getTabIndex(activeTab);
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      if (disabledTabs.includes(prevTab.value)) {
        if (currentIndex - 2 >= 0) {
          setActiveTab(tabs[currentIndex - 2].value);
        }
      } else {
        setActiveTab(prevTab.value);
      }
    }
  };

  const isFirstTab = getTabIndex(activeTab) === 0;
  const isLastTab =
    getTabIndex(activeTab) === tabs.length - 1 ||
    (getTabIndex(activeTab) === tabs.length - 2 &&
      disabledTabs.includes(tabs[tabs.length - 1].value));

  // Use fallback assumptions if no test is provided
  const displayAssumptions = assumptions;
  const displayTestType = testDetail?.testType || testType;

  const transition = useTransition(activeTab, {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    leave: { opacity: 0, transform: 'translateX(20px)' },
    config: { duration: 500, easing: easings.easeInOutCubic },
  });

  // Render tab content with lazy loading
  const renderTabContent = (item: string) => {
    // Only render if tab has been visited
    if (!visitedTabs.has(item)) {
      return null;
    }

    switch (item) {
      case 'overview':
        return (
          <TestOverview
            assumptions={displayAssumptions}
            testType={displayTestType}
            testDetail={testDetail}
          />
        );

      case 'participants':
        return (
          <TestParticipants
            conceptUuid={conceptUuid}
            testUuid={testUuid}
            testDetail={testDetail}
          />
        );

      case 'collateral':
        return <TestCollateral conceptUuid={conceptUuid} testUuid={testUuid} />;

      case 'execute':
        return <TestExecution />;

      case 'results':
        return <TestResults conceptUuid={conceptUuid} testUuid={testUuid} />;

      case 'impact':
        return (
          <TestImpact
            assumptions={displayAssumptions}
            conceptUuid={conceptUuid}
            testUuid={testUuid}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className='aucctus-bg-primary flex h-[920px] w-[1200px] flex-col rounded-xl'>
      {/* Header */}
      <div className='aucctus-border-secondary flex flex-shrink-0 items-center gap-3 border-b p-6'>
        <Icon variant='plus' className='aucctus-stroke-brand-primary h-5 w-5' />
        <h2 className='aucctus-text-xl-semibold aucctus-text-brand-primary flex items-center gap-2'>
          {testDetail ? testDetail.name : 'New Test'}
          <span className='aucctus-text-xs-medium aucctus-text-brand-primary aucctus-border-brand rounded-full border px-2.5 py-0.5'>
            {displayTestType}
          </span>
        </h2>
      </div>

      {/* Tab Navigation and Content Area - flex-1 to take remaining space */}
      <div className='flex min-h-0 flex-1 flex-col'>
        <TabView
          tabs={tabs}
          tabGroupClassName='w-full px-6 flex-shrink-0'
          className='flex min-h-0 w-full flex-1 flex-col'
          variant='button'
          onTabSelect={(value) => {
            if (!disabledTabs.includes(value)) {
              setActiveTab(value);
            }
          }}
          activeTab={activeTab}
        >
          {/* Content area - flex-1 with min-h-0 for proper scrolling */}
          <div className='h-full w-full flex-1 overflow-hidden'>
            <div className='relative h-full'>
              {isTestDetailLoading ? (
                <div className='flex h-full items-center justify-center p-6'>
                  <div className='flex flex-col items-center gap-4'>
                    <LoadingSpinner className='aucctus-stroke-brand-primary h-8 w-8' />
                    <p className='aucctus-text-sm aucctus-text-secondary'>
                      Loading test data...
                    </p>
                  </div>
                </div>
              ) : testDetailError ? (
                <div className='flex h-full items-center justify-center p-6'>
                  <div className='flex flex-col items-center gap-4 text-center'>
                    <Icon
                      variant='alert-triangle'
                      className='aucctus-stroke-error-primary h-8 w-8'
                    />
                    <p className='aucctus-text-sm aucctus-text-error-primary'>
                      Error loading test data
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {transition((style, item) => (
                    <animated.div
                      style={style}
                      className='absolute inset-0 overflow-y-auto p-6'
                    >
                      {renderTabContent(item)}
                    </animated.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </TabView>
      </div>

      {/* Footer - flex-shrink-0 to maintain fixed height */}
      <div className='aucctus-border-secondary rounded-lg border p-6'>
        {/* Information about completion requirement */}
        {isLastTab && !canCompleteTest && (
          <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary mb-4 flex items-center gap-2 rounded-lg border p-2'>
            <Icon
              variant='help-circle'
              className='aucctus-stroke-brand-primary h-4 w-4 flex-shrink-0'
            />
            <p className='aucctus-text-sm-regular aucctus-text-secondary'>
              Add results to complete this test
            </p>
          </div>
        )}

        <div className='flex justify-between'>
          <button
            className={cn(
              'btn btn-secondary flex items-center gap-1',
              isFirstTab && 'cursor-not-allowed opacity-50',
            )}
            onClick={goToPreviousTab}
            disabled={isFirstTab}
          >
            <Icon
              variant='arrowleft'
              className='aucctus-stroke-secondary h-4 w-4'
            />
            Previous
          </button>

          <div className='flex gap-2'>
            <button
              className={cn(
                'btn btn-secondary',
                completeTestDetail.isLoading && 'cursor-not-allowed opacity-50',
              )}
              onClick={handleCloseModal}
              disabled={completeTestDetail.isLoading}
            >
              Cancel
            </button>

            {isLastTab ? (
              <button
                className={cn(
                  'btn btn-primary flex items-center gap-1',
                  (!canCompleteTest || completeTestDetail.isLoading) &&
                    'cursor-not-allowed opacity-50',
                )}
                onClick={handleCompleteTest}
                disabled={!canCompleteTest || completeTestDetail.isLoading}
                title={
                  !canCompleteTest
                    ? 'Add results to complete this test'
                    : completeTestDetail.isLoading
                      ? 'Completing test...'
                      : 'Complete test'
                }
              >
                {completeTestDetail.isLoading ? (
                  <Icon
                    variant='refresh'
                    className='aucctus-stroke-white h-4 w-4 animate-spin'
                  />
                ) : (
                  <Icon
                    variant='check'
                    className='aucctus-stroke-white h-4 w-4'
                  />
                )}
                {completeTestDetail.isLoading ? 'Completing...' : 'Complete'}
              </button>
            ) : (
              <button
                className='btn btn-primary flex items-center gap-1'
                onClick={goToNextTab}
              >
                Next
                <Icon
                  variant='arrowright'
                  className='aucctus-stroke-white h-4 w-4'
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestExecutionModal;
