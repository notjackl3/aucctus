import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  useTestResults,
  useTestDetail,
  useTestParticipants,
} from '@hooks/query/testing.hook';
import {
  ITestResult,
  IAssumptionValidation,
  ITestLearning,
} from '@libs/api/types/concept/testing';
import TestCompletionLoadingOverlay from './test-impact/components/TestCompletionLoadingOverlay';
import TestResultProcessingStatus from './TestResultProcessingStatus';

// Extracted components
import TestResultsInfoSection from './components/TestResultsInfoSection';
import TestResultsHeader from './components/TestResultsHeader';
import TestResultCard from './components/TestResultCard';
import TestResultsConfirmationDialog from './components/TestResultsConfirmationDialog';
import RawResultsFiles from './components/RawResultsFiles';
import SummaryOfFindings from './components/SummaryOfFindings';
import AssumptionResultCard from './components/AssumptionResultCard';
import ResultsByParticipant from './components/ResultsByParticipant';
import TabBanner from '../common/TabBanner';
import { AssumptionCategory } from '@libs/api/types';

// Extracted hooks
import { useTestResultsState } from './hooks/useTestResultsState';
import { useTestResultsSocket } from './hooks/useTestResultsSocket';
import { useTestResultsOperations } from './hooks/useTestResultsOperations';

// Types
import { TestResultsProps } from './TestResults.types';
import { RefreshCw, Target } from 'lucide-react';

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

  // Fetch participants for Results by Participant section
  const { participants } = useTestParticipants(
    conceptUuid || '',
    testUuid || '',
    { enabled: shouldFetch },
  );

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

  // Aggregate all assumption validations from all test results, keyed by assumptionUuid
  // Consolidates supportingLearningUuids from all results into a single validation per assumption
  const assumptionValidationsMap = useMemo(() => {
    if (!results || results.length === 0)
      return new Map<string, IAssumptionValidation>();

    // Flatten all assumption validations from all results
    const allValidations = results
      .flatMap((result) => result.assumptionValidations || [])
      .filter(Boolean);

    // Consolidate by assumptionUuid - keep highest confidence and merge all supportingLearningUuids
    const validationMap = new Map<string, IAssumptionValidation>();
    allValidations.forEach((validation) => {
      const existing = validationMap.get(validation.assumptionUuid);
      // Ensure supportingLearningUuids is always an array (may be undefined/null from API)
      const validationUuids = validation.supportingLearningUuids || [];

      if (!existing) {
        // First validation for this assumption - clone it to avoid mutating original
        validationMap.set(validation.assumptionUuid, {
          ...validation,
          supportingLearningUuids: [...validationUuids],
        });
      } else {
        // Merge supportingLearningUuids (deduplicate)
        const existingUuids = existing.supportingLearningUuids || [];
        const mergedUuids = new Set([...existingUuids, ...validationUuids]);
        // Keep the validation with higher confidence, but with merged learning UUIDs
        if (validation.confidence > existing.confidence) {
          validationMap.set(validation.assumptionUuid, {
            ...validation,
            supportingLearningUuids: Array.from(mergedUuids),
          });
        } else {
          existing.supportingLearningUuids = Array.from(mergedUuids);
        }
      }
    });

    return validationMap;
  }, [results]);

  // Create a map of learnings keyed by learningUuid for quick lookup
  const learningsMap = useMemo(() => {
    if (!results || results.length === 0)
      return new Map<string, ITestLearning>();

    const learningMap = new Map<string, ITestLearning>();
    results.forEach((result) => {
      result.learnings?.forEach((learning) => {
        learningMap.set(learning.uuid, learning);
      });
    });

    return learningMap;
  }, [results]);

  // Handler for downloading source files from AssumptionResultCard
  const handleSourceClick = useCallback(
    (sourceFilename: string) => {
      if (!results) return;

      // Find the file across all results that matches the source filename
      for (const result of results) {
        if (result.files && Array.isArray(result.files)) {
          const file = result.files.find(
            (f) => f.originalFilename === sourceFilename,
          );
          if (file?.fileUrl) {
            // Create a temporary link and click it to download
            const link = document.createElement('a');
            link.href = file.fileUrl;
            link.download = file.originalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
          }
        }
      }
    },
    [results],
  );

  // Notify parent about results state changes - only when values actually change
  useEffect(() => {
    if (!isResultsLoading && onResultsChange) {
      const hasRecommendations =
        (testDetail?.comprehensiveRecommendations?.length ?? 0) > 0 ||
        (hasResults &&
          results.some(
            (result: any) =>
              result.editRecommendations &&
              result.editRecommendations.length > 0,
          ));

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
  }, [
    isResultsLoading,
    hasResults,
    results,
    testDetail?.comprehensiveRecommendations,
    onResultsChange,
  ]);

  // Loading state
  if (isResultsLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <RefreshCw className='aucctus-stroke-brand-primary h-6 w-6 animate-spin' />
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative space-y-6 overscroll-contain'>
      {/* Loading Overlay for Test Result Analysis */}
      {(operations.isCreating || operations.isUpdating) && (
        <TestCompletionLoadingOverlay
          title='Analyzing Test Results'
          description="We're processing your test data and extracting key insights. This may take up to a minute."
          subtitle='Our AI will provide learnings and recommendations soon...'
        />
      )}

      {/* Tab Banner */}
      <TabBanner
        icon='clipboard'
        title='Test Results'
        description={
          isViewMode
            ? 'Review the results and findings from this completed test.'
            : 'Upload and analyze results from your test.'
        }
      />

      {/* Real-time Processing Status - Hide only during active synthetic execution */}
      {!isSyntheticExecutionInProgress && (
        <TestResultProcessingStatus processingState={state.processingState} />
      )}

      {/* Information Section - Show when no results */}
      {!hasResults && <TestResultsInfoSection />}

      {/* Summary of Findings Section - Show when results exist */}
      {shouldShowFindings && <SummaryOfFindings testDetail={testDetail} />}

      {/* Results by Assumption Section - Show when assumptions exist */}
      {testDetail?.assumptions && testDetail.assumptions.length > 0 && (
        <div className='space-y-5'>
          <div className='flex items-center gap-2'>
            <Target className='aucctus-stroke-brand-primary h-5 w-5' />
            <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
              Results by Assumption
            </h4>
          </div>

          <div className='space-y-4'>
            {testDetail.assumptions.map((assumption) => (
              <AssumptionResultCard
                key={assumption.uuid}
                assumptionUuid={assumption.uuid}
                category={
                  assumption.category.toLowerCase() as AssumptionCategory
                }
                statement={assumption.statement}
                benchmark={assumption.benchmark || ''}
                benchmarkAchieved={assumption.validationStatus === 'validated'}
                assumptionValidationsMap={assumptionValidationsMap}
                learningsMap={learningsMap}
                onSourceClick={handleSourceClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results by Participant Section - Show when participants exist */}
      {participants && participants.length > 0 && (
        <ResultsByParticipant
          participants={participants}
          results={results || []}
          learningsMap={learningsMap}
          onSourceClick={handleSourceClick}
        />
      )}

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
        </div>
      )}

      {/* Raw Results Files Section - Moved to bottom */}
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
