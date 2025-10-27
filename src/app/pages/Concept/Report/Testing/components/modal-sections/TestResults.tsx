import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Icon } from '@components';
import { useTestResults, useTestDetail } from '@hooks/query/testing.hook';
import { ITestResult } from '@libs/api/types/concept/testing';
import TestCompletionLoadingOverlay from './test-impact/components/TestCompletionLoadingOverlay';
import TestResultProcessingStatus from './TestResultProcessingStatus';

// Extracted components
import TestResultsInfoSection from './components/TestResultsInfoSection';
import TestResultsHeader from './components/TestResultsHeader';
import TestResultCard from './components/TestResultCard';
import TestResultsKeyLearnings from './components/TestResultsKeyLearnings';
import TestResultsConfirmationDialog from './components/TestResultsConfirmationDialog';
import RawResultsFiles from './components/RawResultsFiles';
import SummaryOfFindings from './components/SummaryOfFindings';

// Extracted hooks
import { useTestResultsState } from './hooks/useTestResultsState';
import { useTestResultsSocket } from './hooks/useTestResultsSocket';
import { useTestResultsOperations } from './hooks/useTestResultsOperations';

// Types
import { TestResultsProps } from './TestResults.types';

const TestResults: React.FC<TestResultsProps> = ({
  conceptUuid,
  testUuid,
  onResultsChange,
  isViewMode = false,
  executionState,
}) => {
  // Custom hooks for state management
  const state = useTestResultsState({ conceptUuid, testUuid });

  // Ref to track previous state and prevent unnecessary updates
  const prevResultsStateRef = useRef<{
    hasResults: boolean;
    hasRecommendations: boolean;
  }>({ hasResults: false, hasRecommendations: false });

  // State for multiple card expansion
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(
    new Set(),
  );

  // Handle card expansion toggle - allows multiple cards to be open
  const handleCardToggle = useCallback((cardId: string) => {
    setExpandedCardIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  // Data fetching
  const shouldFetch = !!conceptUuid && !!testUuid;
  const { results: fetchedResults, isLoading: isResultsLoading } =
    useTestResults(conceptUuid || '', testUuid || '', { enabled: shouldFetch });

  // Fetch test detail for aggregated findings - but not while processing to avoid stale data
  const shouldFetchTestDetail =
    shouldFetch && !state.processingState.isProcessing;

  const { testDetail } = useTestDetail(conceptUuid || '', testUuid || '', {
    enabled: shouldFetchTestDetail,
  });

  const results = fetchedResults as ITestResult[];

  // Operations hook
  const operations = useTestResultsOperations({
    conceptUuid,
    testUuid,
    results,
    setProcessingState: state.setProcessingState,
    setConfirmationDialog: state.setConfirmationDialog,
    setIsDeletingAll: state.setIsDeletingAll,
    setIsDownloading: state.setIsDownloading,
    resetDropzone: state.resetDropzone,
  });

  // Socket event handling
  useTestResultsSocket({
    conceptUuid,
    testUuid,
    processingState: state.processingState,
    setProcessingState: state.setProcessingState,
  });

  // Computed values
  const hasResults = results && results.length > 0;
  const hasSyntheticResults =
    hasResults && results.some((result) => result.isSynthetic);
  const regularResults = results
    ? results.filter((result) => !result.isSynthetic)
    : [];
  const hasRegularResults = regularResults.length > 0;
  const isProcessingComplete =
    !state.processingState.isProcessing &&
    (state.processingState.stage === 'completed' ||
      state.processingState.stage === null);
  const canDelete = !isViewMode && isProcessingComplete;

  // Determine if we should show results - always show if results exist
  // Only consider synthetic execution in progress if executionState is explicitly provided AND running
  const isSyntheticExecutionInProgress =
    executionState &&
    executionState.status === 'running' &&
    executionState.progress < 100 &&
    executionState.executionId; // Must have execution ID to be valid synthetic execution
  const shouldShowResults = hasResults; // Always show results if they exist
  const shouldShowFindings = hasResults; // Always show findings if results exist

  // Notify parent about results state changes - only when values actually change
  useEffect(() => {
    if (!isResultsLoading && onResultsChange) {
      const hasRecommendations =
        hasResults &&
        results.some(
          (result: any) =>
            result.editRecommendations && result.editRecommendations.length > 0,
        );

      // Only call onResultsChange if values have actually changed
      const prevState = prevResultsStateRef.current;
      if (
        prevState.hasResults !== hasResults ||
        prevState.hasRecommendations !== hasRecommendations
      ) {
        prevResultsStateRef.current = { hasResults, hasRecommendations };
        onResultsChange(hasResults, hasRecommendations);
      }
    }
  }, [isResultsLoading, hasResults, results, onResultsChange]);

  // Loading state
  if (isResultsLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <Icon
            variant='refresh'
            className='aucctus-stroke-brand-primary h-6 w-6 animate-spin'
          />
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative space-y-4'>
      {/* Loading Overlay for Test Result Analysis */}
      {(operations.isCreating || operations.isUpdating) && (
        <TestCompletionLoadingOverlay
          title='Analyzing Test Results'
          description="We're processing your test data and extracting key insights. This may take up to a minute."
          subtitle='Our AI will provide learnings and recommendations soon...'
        />
      )}

      {/* Real-time Processing Status - Hide only during active synthetic execution */}
      {!isSyntheticExecutionInProgress && (
        <TestResultProcessingStatus processingState={state.processingState} />
      )}

      {/* Information Section - Show when no results */}
      {!hasResults && <TestResultsInfoSection />}

      {/* Raw Results Files Section - Always show results if they exist */}
      <RawResultsFiles
        results={results || []}
        canDelete={canDelete}
        onDeleteFile={
          operations.handleDeleteFile as (
            resultUuid: string,
            fileUuid: string,
            filename: string,
          ) => void
        }
        onDeleteAllFiles={operations.handleDeleteAllFiles}
        onFilesUpload={operations.handleFilesUpload}
        isViewMode={isViewMode}
      />

      {/* Summary of Findings Section - Show when results exist */}
      {shouldShowFindings && <SummaryOfFindings testDetail={testDetail} />}

      {/* Results Grid - Show when results exist */}
      {shouldShowResults && hasRegularResults && (
        <div className='space-y-6'>
          <TestResultsHeader
            resultsCount={regularResults.length}
            hasResults={hasRegularResults}
            hasSyntheticResults={hasSyntheticResults}
            canDelete={canDelete}
            onDownloadResults={operations.handleDownloadResults}
            onDeleteAll={operations.handleDeleteAll}
            isDownloading={state.isDownloading}
            isDeletingAll={state.isDeletingAll}
          />

          {/* Interview Cards - Grid Layout (replaces masonry to prevent visual repositioning) */}
          {/* Note: Synthetic results are now displayed as PDF files in Raw Results Files section */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {results
              .filter((result) => !result.isSynthetic) // Hide synthetic interview cards
              .map((result) => {
                const isExpanded = expandedCardIds.has(result.uuid);
                return (
                  <div key={result.uuid} className='h-fit'>
                    <TestResultCard
                      result={result}
                      viewMode={state.viewModes[result.uuid] || 'structured'}
                      onToggleViewMode={state.toggleViewMode}
                      onDeleteResult={operations.handleDeleteResult}
                      onDeleteFile={operations.handleDeleteFile}
                      canDelete={canDelete}
                      isProcessingComplete={isProcessingComplete}
                      isExpanded={isExpanded}
                      onToggleExpansion={() => handleCardToggle(result.uuid)}
                    />
                  </div>
                );
              })}
          </div>

          {/* Key Learnings Section */}
          <TestResultsKeyLearnings results={results} />
        </div>
      )}

      {/* Key Learnings Section - Show even if only synthetic results exist */}
      {shouldShowResults && !hasRegularResults && (
        <div className='space-y-6'>
          <TestResultsKeyLearnings results={results} />
        </div>
      )}

      {/* Confirmation Dialog */}
      <TestResultsConfirmationDialog
        confirmationDialog={state.confirmationDialog}
        onClose={() => state.setConfirmationDialog(null)}
        isDeletingAll={state.isDeletingAll}
      />
    </div>
  );
};

export default TestResults;
