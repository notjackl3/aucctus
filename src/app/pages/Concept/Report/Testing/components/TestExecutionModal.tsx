import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@components';
import LoadingSpinner from '@components/Icon/LoadingSpinner';
import { cn } from '@libs/utils/react';
import { useModal } from '@context/ModalContextProvider';
import TabView, { TabElement } from '@components/Container/TabView/TabView';
import {
  useTestDetail,
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
  mode?: 'edit' | 'view'; // Add mode prop to control edit/view behavior
}

const TestExecutionModal: React.FC<TestExecutionModalProps> = ({
  assumptions = [],
  testType = 'Customer Interviews',
  testUuid,
  concept,
  mode = 'edit', // Default to edit mode for backward compatibility
}) => {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();
  const conceptUuid = concept?.uuid || '';

  // Always start with 'overview' tab
  const [activeTab, setActiveTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(['overview']),
  );

  // Only fetch test detail initially (needed for all tabs)
  const {
    testDetail,
    isLoading: isTestDetailLoading,
    error: testDetailError,
  } = useTestDetail(conceptUuid, testUuid || '');

  // Hook for completing test
  const completeTestDetail = useCompleteTestDetail();

  // Get completion context
  const { setIsCompletingTest } = useTestCompletion();

  // Determine if we're in view mode (completed tests are always view-only)
  const isViewMode = mode === 'view' || testDetail?.status === 'completed';

  // Update visited tabs when activeTab changes
  useEffect(() => {
    setVisitedTabs((prev) => new Set([...prev, activeTab]));
  }, [activeTab]);

  // Check if test can be completed (will be determined by Results tab)
  const [canCompleteTest, setCanCompleteTest] = useState(false);

  // Disabled tabs list - impact tab will be enabled by Results tab when appropriate
  const [disabledTabs, setDisabledTabs] = useState(['impact']);

  // Memoized callback to avoid infinite loops
  const handleResultsChange = useCallback(
    (hasResults: boolean, hasRecommendations: boolean) => {
      setCanCompleteTest(hasResults);
      setDisabledTabs((prev) =>
        hasRecommendations
          ? prev.filter((tab) => tab !== 'impact')
          : [...prev.filter((tab) => tab !== 'impact'), 'impact'],
      );
    },
    [],
  );

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
        return (
          <TestResults
            conceptUuid={conceptUuid}
            testUuid={testUuid}
            onResultsChange={handleResultsChange}
            isViewMode={isViewMode} // Pass view mode to TestResults
          />
        );

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
    // Parent modal container height is 90vh, this container height needs to match
    <div className='aucctus-bg-primary flex h-[90vh] w-[1200px] flex-col rounded-xl'>
      {/* Header */}
      <div className='aucctus-border-secondary flex flex-shrink-0 items-center justify-between border-b p-6'>
        <div className='flex items-center gap-3'>
          <Icon
            variant={isViewMode ? 'eye' : 'plus'}
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h2 className='aucctus-text-xl-semibold aucctus-text-brand-primary'>
            {testDetail ? testDetail.name : 'New Test'}
          </h2>
        </div>
        {isViewMode && (
          <div className='flex items-center gap-2'>
            <Icon variant='lock' className='aucctus-stroke-secondary h-4 w-4' />
            <span className='aucctus-text-sm-medium aucctus-text-secondary'>
              View Only
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation and Content Area - flex-1 to take remaining space */}
      <div className='flex min-h-0 flex-1 flex-col'>
        <TabView
          tabs={tabs}
          tabGroupClassName='w-full px-6 flex-shrink-0'
          tabContainerClassName='flex flex-1 items-center justify-center'
          tabClassName='flex flex-1 aucctus-bg-primary-hover items-center justify-center'
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
        <div className='flex justify-between'>
          {!isViewMode ? (
            <>
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
                    completeTestDetail.isLoading &&
                      'cursor-not-allowed opacity-50',
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
                    {completeTestDetail.isLoading
                      ? 'Completing...'
                      : 'Complete'}
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
            </>
          ) : (
            // View mode footer - only close button
            <div className='flex w-full justify-end'>
              <button className='btn btn-secondary' onClick={handleCloseModal}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestExecutionModal;
