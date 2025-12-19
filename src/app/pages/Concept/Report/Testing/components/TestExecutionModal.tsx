import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@components';
import LoadingSpinner from '@components/Icon/LoadingSpinner';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
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
import useStore from '@stores/store';
import { useCollateralRegenerationEvents } from '@hooks/sockets/testing';

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

  // Track modal open state for synthetic execution toast
  const setModalOpen = useStore((state) => state.syntheticTesting.setModalOpen);

  // Set modal as open on mount, closed on unmount
  useEffect(() => {
    // Set modal open FIRST (synchronously)
    setModalOpen(true);

    // Then dismiss any existing toast (use setTimeout to ensure state is updated)
    const dismissTimeout = setTimeout(() => {
      const state = useStore.getState().syntheticTesting.lastExecutionState;
      if (state?.conceptUuid && state?.testUuid) {
        window.dispatchEvent(
          new CustomEvent('synthetic-modal-opened', {
            detail: {
              conceptUuid: state.conceptUuid,
              testUuid: state.testUuid,
            },
          }),
        );
      }
    }, 0);

    return () => {
      // Clear the dismiss timeout if component unmounts before it fires
      clearTimeout(dismissTimeout);

      // Set modal closed FIRST
      setModalOpen(false);

      // Then create toast if needed with a longer delay to avoid race with remount
      const createTimeout = setTimeout(() => {
        // Check if modal is still closed (not reopened)
        const currentModalState =
          useStore.getState().syntheticTesting.isModalOpen;
        if (currentModalState) {
          return;
        }

        const state = useStore.getState().syntheticTesting.lastExecutionState;

        if (state && state.progress !== undefined && state.progress < 100) {
          window.dispatchEvent(
            new CustomEvent('synthetic-modal-closed', {
              detail: state,
            }),
          );
        }
      }, 100); // Longer delay to ensure modal state is stable

      // Store timeout ID so it can be cleared if needed
      (window as any).__syntheticToastCreateTimeout = createTimeout;
    };
  }, [setModalOpen]);

  // Always start with 'overview' tab
  const [activeTab, setActiveTab] = useState('overview');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(['overview']),
  );

  // State for tracking selected collateral when navigating from execute tab
  const [selectedCollateralUuid, setSelectedCollateralUuid] = useState<
    string | undefined
  >();

  // Listen for collateral regeneration WebSocket events
  const { isRegenerating: socketCollateralRegenerating } =
    useCollateralRegenerationEvents(conceptUuid, testUuid || '');

  // Track synthetic execution state for coordinating Results tab display
  // Note: We get execution state from TestExecution component to avoid duplicate socket listeners
  const [executionState, setExecutionState] = useState<any>(null);
  const isSyntheticExecutionRunning = React.useMemo(() => {
    const status = executionState?.status;
    return (
      status === 'running' || status === 'starting' || status === 'cancelling'
    );
  }, [executionState?.status]);

  // Only fetch test detail initially (needed for all tabs)
  const {
    testDetail,
    isLoading: isTestDetailLoading,
    error: testDetailError,
  } = useTestDetail(conceptUuid, testUuid || '');

  const collateralRegenerationStatus = testDetail?.collateralRegenerationStatus;
  const isCollateralRegeneratingFromServer =
    collateralRegenerationStatus?.status === 'running';
  const isCollateralRegenerating =
    socketCollateralRegenerating || isCollateralRegeneratingFromServer;

  // Hook for completing test
  const completeTestDetail = useCompleteTestDetail();

  // Determine if we're in view mode (completed tests are always view-only)
  const isViewMode = mode === 'view' || testDetail?.status === 'completed';

  // Update visited tabs when activeTab changes
  useEffect(() => {
    setVisitedTabs((prev) => new Set([...prev, activeTab]));

    // Clear selected collateral UUID when navigating away from collateral tab
    if (activeTab !== 'collateral' && selectedCollateralUuid) {
      setSelectedCollateralUuid(undefined);
    }

    // Invalidate collateral query when switching to collateral tab
    if (activeTab === 'collateral' && conceptUuid && testUuid) {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testCollateral, conceptUuid, testUuid],
      });
    }

    // Invalidate synthetic execution status query when switching to execute tab
    if (activeTab === 'execute' && conceptUuid && testUuid) {
      queryClient.invalidateQueries({
        queryKey: ['syntheticExecutionStatus', conceptUuid, testUuid],
      });
    }
  }, [activeTab, conceptUuid, testUuid, queryClient, selectedCollateralUuid]);

  // Check if test can be completed (will be determined by Results tab)
  const [canCompleteTest, setCanCompleteTest] = useState(false);

  // Disabled tabs list - impact tab will be enabled by Results tab when appropriate
  const [disabledTabs, setDisabledTabs] = useState(['impact']);

  // Update disabled tabs when synthetic execution state changes
  useEffect(() => {
    setDisabledTabs((prev) => {
      const hasRecommendations = !prev.includes('impact');

      if (isSyntheticExecutionRunning) {
        // Add results and impact to disabled tabs when synthetic is running
        const tabs = ['results', 'impact'];
        return Array.from(new Set([...prev, ...tabs]));
      } else {
        // Remove results from disabled tabs when synthetic is not running
        // Keep impact disabled if there are no recommendations
        return hasRecommendations ? [] : ['impact'];
      }
    });
  }, [isSyntheticExecutionRunning]);

  // Enable Impact tab when testDetail has comprehensiveRecommendations
  // This ensures Impact is enabled even if Results tab hasn't been visited
  useEffect(() => {
    if (!isSyntheticExecutionRunning && !isTestDetailLoading) {
      const hasRecommendations =
        (testDetail?.comprehensiveRecommendations?.length ?? 0) > 0;

      if (hasRecommendations) {
        setDisabledTabs((prev) => prev.filter((tab) => tab !== 'impact'));
      }
    }
  }, [
    testDetail?.comprehensiveRecommendations,
    isSyntheticExecutionRunning,
    isTestDetailLoading,
  ]);

  // Memoized callback to avoid infinite loops
  const handleResultsChange = useCallback(
    (hasResults: boolean, hasRecommendations: boolean) => {
      setCanCompleteTest(hasResults);

      // Only update impact tab if synthetic is not running
      if (!isSyntheticExecutionRunning) {
        setDisabledTabs((prev) =>
          hasRecommendations
            ? prev.filter((tab) => tab !== 'impact')
            : [...prev.filter((tab) => tab !== 'impact'), 'impact'],
        );
      }
    },
    [isSyntheticExecutionRunning],
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

    try {
      await completeTestDetail.mutateAsync({
        conceptUuid,
        testUuid,
      });

      // Close modal after successful completion
      handleCloseModal();
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  // Helper function to wrap tab label with tooltip if disabled
  const createTabLabel = useCallback(
    (icon: string, label: string, tabValue: string): React.ReactNode => {
      const isDisabled = disabledTabs.includes(tabValue);
      const iconClass = cn(
        'h-4 w-4',
        isDisabled ? 'aucctus-stroke-disabled' : 'aucctus-stroke-secondary',
      );
      const textClass = isDisabled ? 'aucctus-text-disabled' : '';

      const tabContent = (
        <div className={cn('flex items-center gap-2', textClass)}>
          <Icon variant={icon as any} className={iconClass} />
          <span>{label}</span>
        </div>
      );

      // Add tooltip for disabled tabs when synthetic is running
      if (
        isDisabled &&
        isSyntheticExecutionRunning &&
        (tabValue === 'results' || tabValue === 'impact')
      ) {
        return (
          <ComponentTooltip
            tip={
              <div className='aucctus-bg-primary aucctus-border-secondary rounded border px-3 py-2 shadow-lg'>
                <p className='aucctus-text-primary aucctus-text-xs'>
                  Complete synthetic test execution to view {tabValue}
                </p>
              </div>
            }
          >
            <span className='inline-flex'>{tabContent}</span>
          </ComponentTooltip>
        );
      }

      return tabContent;
    },
    [disabledTabs, isSyntheticExecutionRunning],
  );

  const tabs: TabElement[] = React.useMemo(
    () => [
      {
        value: 'overview',
        label: createTabLabel('file-text', 'Overview', 'overview'),
      },
      {
        value: 'participants',
        label: createTabLabel('users-02', 'Participants', 'participants'),
      },
      {
        value: 'collateral',
        label: createTabLabel('file-plus', 'Collateral', 'collateral'),
      },
      {
        value: 'execute',
        label: createTabLabel('play', 'Execute', 'execute'),
      },
      {
        value: 'results',
        label: createTabLabel('chart-column', 'Results', 'results'),
      },
      {
        value: 'impact',
        label: createTabLabel('lightbulb', 'Impact', 'impact'),
      },
    ],
    [createTabLabel],
  );

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

  // Removed React Spring transition to prevent component unmounting

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
            isCollateralRegenerating={isCollateralRegenerating}
            isSyntheticRunning={isSyntheticExecutionRunning}
            isActive={activeTab === 'participants'}
          />
        );

      case 'collateral':
        return (
          <TestCollateral
            conceptUuid={conceptUuid}
            testUuid={testUuid}
            initialSelectedCollateralUuid={selectedCollateralUuid}
            isRegenerating={isCollateralRegenerating}
            regenerationStatus={collateralRegenerationStatus}
          />
        );

      case 'execute':
        return (
          <TestExecution
            conceptUuid={conceptUuid}
            testUuid={testUuid}
            testName={testDetail?.name}
            isCollateralRegenerating={isCollateralRegenerating}
            onNavigateToCollateral={(collateralUuid) => {
              // Set the selected collateral UUID
              setSelectedCollateralUuid(collateralUuid);
              // Navigate to collateral tab
              setActiveTab('collateral');
            }}
            onNavigateToResults={() => {
              // Navigate to results tab
              setActiveTab('results');
            }}
            onExecutionStateChange={setExecutionState}
          />
        );

      case 'results':
        return (
          <TestResults
            conceptUuid={conceptUuid}
            testUuid={testUuid}
            onResultsChange={handleResultsChange}
            isViewMode={isViewMode} // Pass view mode to TestResults
            executionState={executionState} // Pass execution state for progress coordination
          />
        );

      case 'impact':
        return (
          <TestImpact
            assumptions={displayAssumptions}
            conceptUuid={conceptUuid}
            testUuid={testUuid}
            conceptIdentifier={concept?.identifier}
            onCloseModal={closeModal}
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
          tabGroupClassName='aucctus-border-secondary w-full border-b px-6 py-0 flex-shrink-0'
          tabContainerClassName='grid w-full grid-cols-6'
          tabClassName='flex flex-1 items-center justify-center py-3 mt-4'
          className='flex min-h-0 w-full flex-1 flex-col'
          variant='default'
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
                  {/* Render all visited tabs but only show the active one */}
                  {Array.from(visitedTabs).map((tabKey) => (
                    <div
                      key={tabKey}
                      className={cn(
                        'absolute inset-0 overflow-y-auto p-6',
                        activeTab !== tabKey && 'hidden',
                      )}
                    >
                      {renderTabContent(tabKey)}
                    </div>
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
