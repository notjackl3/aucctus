import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon, FileDropzone, toast } from '@components';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import telemetry from '@libs/telemetry';
import { cn } from '@libs/utils/react';
import api from '@libs/api';
import {
  useTestResults,
  useCreateTestResultWithFiles,
  useDeleteTestResult,
  useDeleteTestResultSilent,
  useDeleteTestResultFile,
  useUpdateTestResult,
} from '@hooks/query/testing.hook';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { ITestResult } from '@libs/api/types/concept/testing';
import {
  ITestResultHandshakeMessage,
  ITestResultProcessingMessage,
  ITestResultCompletedMessage,
  ITestResultErrorMessage,
} from '@libs/api/types';
import TestCompletionLoadingOverlay from './test-impact/components/TestCompletionLoadingOverlay';
import TestResultProcessingStatus, {
  ITestResultProcessingState,
} from './TestResultProcessingStatus';

interface TestResultsProps {
  conceptUuid?: string;
  testUuid?: string;
  onResultsChange?: (hasResults: boolean, hasRecommendations: boolean) => void;
  isViewMode?: boolean; // Add prop to control view-only behavior
}

const TestResults: React.FC<TestResultsProps> = ({
  conceptUuid,
  testUuid,
  onResultsChange,
  isViewMode = false, // Default to false for backward compatibility
}) => {
  // Use props data if available, otherwise fetch (for backward compatibility)
  const shouldFetch = !!conceptUuid && !!testUuid;

  const { results: fetchedResults, isLoading: isFetchedResultsLoading } =
    useTestResults(conceptUuid || '', testUuid || '', { enabled: shouldFetch });

  // Type cast the results to include extended properties
  const results = fetchedResults as ITestResult[];
  const isResultsLoading = isFetchedResultsLoading;

  // Hook for creating test results with multiple files upload
  const createTestResultWithFiles = useCreateTestResultWithFiles();

  // Hook for deleting test results
  const deleteTestResult = useDeleteTestResult();

  // Hook for deleting test results without individual toasts (for bulk operations)
  const deleteTestResultSilent = useDeleteTestResultSilent();

  // Hook for deleting individual test result files
  const deleteTestResultFile = useDeleteTestResultFile();

  // Hook for updating test results with files
  const updateTestResult = useUpdateTestResult();

  // Query client for invalidating cache
  const queryClient = useQueryClient();

  // Local confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: 'deleteResult' | 'deleteFile' | 'deleteAll';
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // State to trigger dropzone reset
  const [dropzoneKey, setDropzoneKey] = useState(0);

  // State for bulk delete operation
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // State for download operation
  const [isDownloading, setIsDownloading] = useState(false);

  // Test result processing state
  const [processingState, setProcessingState] =
    useState<ITestResultProcessingState>({
      isProcessing: false,
      stage: null,
      message: '',
      progress: 0,
      error: null,
      testResultUuid: undefined,
      conceptUuid: undefined,
      testUuid: undefined,
      summary: undefined,
      learnings: [],
      keywords: [],
    });

  // Clear stale processing state when component mounts or test changes
  useEffect(() => {
    setProcessingState({
      isProcessing: false,
      stage: null,
      message: '',
      progress: 0,
      error: null,
      testResultUuid: undefined,
      conceptUuid: undefined,
      testUuid: undefined,
      summary: undefined,
      learnings: [],
      keywords: [],
    });
  }, [conceptUuid, testUuid]);

  // Socket event handlers for test result processing
  // NOTE: Multitenancy validation (account_uuid/user_uuid) is handled automatically by useSocketEvent hook
  useSocketEvent(
    'test.result.handshake',
    (handshake: ITestResultHandshakeMessage) => {
      telemetry.log('test.result.handshake received', {
        testResultUuid: handshake.testResultUuid,
        conceptUuid: handshake.conceptUuid,
        testUuid: handshake.testUuid,
      });

      // Validate that this message is for this specific component
      if (
        handshake.conceptUuid !== conceptUuid ||
        handshake.testUuid !== testUuid
      ) {
        telemetry.log('test.result.handshake ignored - component mismatch', {
          messageConceptUuid: handshake.conceptUuid,
          messageTestUuid: handshake.testUuid,
          componentConceptUuid: conceptUuid,
          componentTestUuid: testUuid,
        });
        return;
      }

      setProcessingState((prev) => {
        const newState = {
          ...prev,
          isProcessing: true, // Set processing to true when handshake is received
          stage: 'initializing',
          message: 'Initializing analysis...',
          progress: 0, // Start with 0 progress
          error: null,
          testResultUuid: handshake.testResultUuid,
          conceptUuid: handshake.conceptUuid,
          testUuid: handshake.testUuid,
        };

        telemetry.log('test.result.handshake state updated', {
          previousUuid: prev.testResultUuid,
          newUuid: newState.testResultUuid,
          isProcessing: true,
        });

        return newState;
      });
    },
  );

  useSocketEvent(
    'test.result.processing',
    (message: ITestResultProcessingMessage) => {
      telemetry.log('test.result.processing received', {
        testResultUuid: message.testResultUuid,
        stage: message.stage,
        progress: message.progress,
        value: message.value,
        currentStateUuid: processingState.testResultUuid,
      });

      setProcessingState((prev) => {
        // Validate that this message is for this specific component and matches current processing
        if (
          prev.testResultUuid !== message.testResultUuid &&
          prev.testResultUuid // Only validate if we have a UUID (allow initial state)
        ) {
          telemetry.log('test.result.processing ignored - UUID mismatch', {
            messageUuid: message.testResultUuid,
            stateUuid: prev.testResultUuid,
          });
          return prev;
        }

        // Determine if processing should be active
        // If message.value is explicitly false, processing is inactive
        // If message.value is true or undefined, check for progress/stage indicators
        const isActivelyProcessing =
          message.value === false
            ? false
            : message.value === true ||
              message.progress !== undefined ||
              Boolean(message.stage);

        const newState = {
          ...prev,
          testResultUuid: message.testResultUuid, // Ensure UUID is set
          isProcessing: isActivelyProcessing,
          stage: message.stage,
          progress:
            message.progress !== undefined ? message.progress : prev.progress, // Handle progress 0 properly
          message: `Processing: ${message.stage?.replace(/_/g, ' ') || prev.stage?.replace(/_/g, ' ') || 'in progress'}`,
          error: null,
        };

        telemetry.log('test.result.processing state updated', {
          newState: newState,
          messageUuid: message.testResultUuid,
          progress: message.progress,
          isProcessing: isActivelyProcessing,
          messageValue: message.value,
        });

        return newState;
      });
    },
  );

  useSocketEvent(
    'test.result.completed',
    (message: ITestResultCompletedMessage) => {
      telemetry.log('test.result.completed received', {
        testResultUuid: message.testResultUuid,
        summary: message.summary,
        learningsCount: message.learnings.length,
        keywordsCount: message.keywords.length,
      });

      if (processingState.testResultUuid === message.testResultUuid) {
        setProcessingState((prev) => ({
          ...prev,
          isProcessing: false,
          stage: 'completed',
          progress: 100,
          message: 'Analysis complete',
          summary: message.summary,
          learnings: message.learnings,
          keywords: message.keywords,
          error: null,
        }));

        // Refetch test results to show learnings in the main UI
        telemetry.log('test.result.completed invalidating queries', {
          conceptUuid,
          testUuid,
          testResultUuid: message.testResultUuid,
        });

        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testResults, conceptUuid, testUuid],
        });
      }
    },
  );

  useSocketEvent('test.result.error', (message: ITestResultErrorMessage) => {
    telemetry.error('test.result.error received', {
      testResultUuid: message.testResultUuid,
      code: message.code,
      message: message.message,
    });

    if (processingState.testResultUuid === message.testResultUuid) {
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        stage: 'error',
        progress: 0,
        error: message.message,
      }));
    }
  });

  // Notify parent about results state changes
  useEffect(() => {
    if (onResultsChange && !isResultsLoading) {
      const hasResults = results && results.length > 0;
      const hasRecommendations =
        hasResults &&
        results.some(
          (result: any) =>
            result.editRecommendations && result.editRecommendations.length > 0,
        );
      onResultsChange(hasResults, hasRecommendations);
    }
    // Deliberately excluding onResultsChange from dependencies to avoid loops
    // The callback should be memoized in the parent component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, isResultsLoading]);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle file upload
  const handleFilesUpload = async (
    uploadedFiles: {
      id: string;
      file: File;
      name: string;
      description: string;
    }[],
  ) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    if (uploadedFiles.length === 0) {
      return;
    }

    try {
      // Extract files and summary
      const files = uploadedFiles.map((uploadedFile) => uploadedFile.file);
      const summary =
        uploadedFiles.length > 0
          ? uploadedFiles[0].description || undefined
          : undefined;

      // Check if there are existing results
      const hasExistingResults = results && results.length > 0;

      if (hasExistingResults) {
        // Update the first existing result with additional files
        const firstResult = results[0];

        const updatedResult = await updateTestResult.mutateAsync({
          conceptUuid,
          testUuid,
          resultUuid: firstResult.uuid,
          data: {
            // Keep existing data, just add files
            title: firstResult.title,
            description: firstResult.description,
          },
          files, // Add the new files
        });

        // Set processing state for the updated result
        setProcessingState({
          isProcessing: true,
          stage: null,
          message: `Adding ${files.length} more files to existing results...`,
          progress: 0,
          error: null,
          testResultUuid: updatedResult.uuid,
          conceptUuid: conceptUuid,
          testUuid: testUuid,
          summary: undefined,
          learnings: [],
          keywords: [],
        });

        telemetry.log('test.result.update.success', {
          testResultUuid: updatedResult.uuid,
          conceptUuid,
          testUuid,
          fileCount: files.length,
          totalSize: uploadedFiles.reduce((sum, f) => sum + f.file.size, 0),
        });
      } else {
        // Create new test results
        const newResults = await createTestResultWithFiles.mutateAsync({
          conceptUuid,
          testUuid,
          files,
          summary,
          recommendations: undefined,
        });

        // Set initial processing state for the batch
        if (newResults.length > 0) {
          setProcessingState({
            isProcessing: true,
            stage: null,
            message: `Starting analysis of ${newResults.length} files...`,
            progress: 0,
            error: null,
            testResultUuid: newResults[0].uuid,
            conceptUuid: conceptUuid,
            testUuid: testUuid,
            summary: undefined,
            learnings: [],
            keywords: [],
          });
        }

        telemetry.log('test.result.batch.upload.success', {
          testResultUuids: newResults.map((r) => r.uuid),
          conceptUuid,
          testUuid,
          fileCount: files.length,
          totalSize: uploadedFiles.reduce((sum, f) => sum + f.file.size, 0),
        });
      }

      // Clear the dropzone by updating its key to force re-render
      setDropzoneKey((prev) => prev + 1);

      // The query will be invalidated and refetch the updated results
    } catch (error) {
      // The hook already shows a toast error message
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        error: 'Upload failed. Please try again.',
      }));
    }
  };

  // Handle delete result
  const handleDeleteResult = async (
    resultUuid: string,
    resultTitle: string,
  ) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    // Show local confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'deleteResult',
      title: 'Delete Test Result',
      message: `Are you sure you want to delete "${resultTitle}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteTestResult.mutateAsync({
            conceptUuid,
            testUuid,
            resultUuid,
          });

          // The query will be invalidated and refetch the updated results
        } catch (error) {
          // The hook already shows a toast error message
        }
        setConfirmationDialog(null);
      },
    });
  };

  // Handle delete individual file
  const handleDeleteFile = async (
    resultUuid: string,
    fileUuid: string,
    fileName: string,
  ) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    // Show local confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'deleteFile',
      title: 'Delete File',
      message: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteTestResultFile.mutateAsync({
            conceptUuid,
            testUuid,
            resultUuid,
            fileUuid,
          });

          // The query will be invalidated and refetch the updated results
        } catch (error) {
          // The hook already shows a toast error message
        }
        setConfirmationDialog(null);
      },
    });
  };

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

  // Show no data state if no results from API
  const hasResults = results && results.length > 0;

  // Determine processing completion status
  const isProcessingComplete =
    !processingState.isProcessing &&
    (processingState.stage === 'completed' || processingState.stage === null);

  // Allow deletions only if not in view mode and processing is complete
  const canDelete = !isViewMode && isProcessingComplete;

  // Handle bulk delete of all test results
  const handleDeleteAll = async () => {
    if (!conceptUuid || !testUuid || results.length === 0) return;

    // Show local confirmation dialog
    setConfirmationDialog({
      isOpen: true,
      type: 'deleteAll',
      title: 'Delete All Test Results',
      message: `Are you sure you want to delete all ${results.length} test results? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setIsDeletingAll(true);

          // Delete all test results sequentially using silent version to avoid multiple toasts
          for (const result of results) {
            await deleteTestResultSilent.mutateAsync({
              conceptUuid,
              testUuid,
              resultUuid: result.uuid,
            });
          }

          toast.success(
            `Successfully deleted all ${results.length} test results`,
          );
        } catch (error) {
          console.error('Error deleting all results:', error);
          toast.error('Failed to delete some results. Please try again.');
        } finally {
          setIsDeletingAll(false);
        }
        setConfirmationDialog(null);
      },
    });
  };

  // Handle download of synthetic test results as CSV
  const handleDownloadResults = async () => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing test information. Please try again.');
      return;
    }

    try {
      setIsDownloading(true);

      // Filter only synthetic results for CSV export
      const syntheticResults = results.filter((result) => result.isSynthetic);

      if (syntheticResults.length === 0) {
        toast.error('No synthetic test results found to download.');
        return;
      }

      // Call the backend export API
      const blob = await api.testing.exportTestResults(
        conceptUuid,
        testUuid,
        'pdf',
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synthetic_customer_interviews_${testUuid}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Downloaded ${syntheticResults.length} synthetic test results as PDF`,
      );
    } catch (error) {
      console.error('Error downloading results:', error);
      toast.error('Failed to download test results. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className='relative space-y-4'>
      {/* Loading Overlay for Test Result Analysis */}
      {(createTestResultWithFiles.isLoading || updateTestResult.isLoading) && (
        <TestCompletionLoadingOverlay
          title='Analyzing Test Results'
          description="We're processing your test data and extracting key insights. This may take up to a minute."
          subtitle='Our AI will provide learnings and recommendations soon...'
        />
      )}

      {/* Real-time Processing Status */}
      <TestResultProcessingStatus processingState={processingState} />

      {/* Information Section - Only show when no results */}
      {!hasResults && (
        <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'>
          <div className='flex items-start gap-3'>
            <div className='mt-1'>
              <Icon
                variant='clipboard'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
            </div>
            <div>
              <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
                Getting Started with Test Results
              </h4>
              <p className='aucctus-text-sm-regular aucctus-text-secondary mb-2'>
                Upload files from your test sessions to validate assumptions and
                improve your concept.
              </p>
              <ul className='aucctus-text-sm-regular aucctus-text-secondary list-disc space-y-1 pl-5'>
                <li>Focus on clear, objective observations</li>
                <li>Include specific numbers or quotes when possible</li>
                <li>Upload multiple test result files in one batch</li>
                <li>Categorize findings to connect them to your assumptions</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Results - Show before results, but hide during processing */}
      {!processingState.isProcessing &&
        !createTestResultWithFiles.isLoading &&
        !updateTestResult.isLoading &&
        !isViewMode && ( // Hide upload zone in view mode
          <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4'>
            <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
              {hasResults ? 'Add More Test Results' : 'Add Test Results'}
            </h4>
            <p className='aucctus-text-sm-regular aucctus-text-secondary mb-4'>
              {hasResults
                ? 'Upload additional files containing more test results to expand your analysis.'
                : 'Upload multiple files containing your test results. Add descriptive names and optional descriptions to help organize your findings.'}
            </p>

            <FileDropzone key={dropzoneKey} onFilesUpload={handleFilesUpload} />
          </div>
        )}

      {/* Results Grid */}
      {hasResults && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
              Test Results ({results.length} results)
            </h4>
            <div className='flex items-center gap-2'>
              {/* Download Button for Synthetic Results */}
              {results.some((result) => result.isSynthetic) && (
                <button
                  className='btn btn-light btn-sm flex items-center gap-2'
                  onClick={handleDownloadResults}
                  disabled={isDownloading}
                >
                  <Icon
                    variant='download'
                    className='aucctus-stroke-secondary h-4 w-4'
                  />
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </button>
              )}
              {canDelete && results.length > 0 && (
                <button
                  className='btn btn-danger btn-sm flex items-center gap-2'
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                >
                  <Icon
                    variant='trash'
                    className='aucctus-stroke-white h-4 w-4'
                  />
                  {isDeletingAll ? 'Deleting...' : 'Delete All'}
                </button>
              )}
              <Icon
                variant={isProcessingComplete ? 'check' : 'refresh'}
                className={cn(
                  'h-4 w-4',
                  isProcessingComplete
                    ? 'aucctus-stroke-success-primary'
                    : 'aucctus-stroke-brand-primary animate-spin',
                )}
              />
              <span
                className={cn(
                  'aucctus-text-sm-regular',
                  isProcessingComplete
                    ? 'aucctus-text-success-primary'
                    : 'aucctus-text-brand-primary',
                )}
              >
                {isProcessingComplete
                  ? 'All files processed'
                  : 'Processing files...'}
              </span>
            </div>
          </div>

          {/* Files Grid - Responsive layout for multiple files */}
          <div
            className={cn(
              'grid gap-4',
              results.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 lg:grid-cols-2',
            )}
          >
            {results.map((result) => (
              <div
                key={result.uuid}
                className='aucctus-border-secondary aucctus-bg-primary rounded-lg border transition-all hover:shadow-sm'
              >
                {/* File Header - Minimal */}
                <div className='px-4 py-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        variant={result.isSynthetic ? 'ai-conclusion' : 'pdf'}
                        className={cn(
                          'h-5 w-5',
                          result.isSynthetic
                            ? 'aucctus-stroke-brand-primary'
                            : 'aucctus-fill-brand-primary',
                        )}
                      />
                      <div className='min-w-0 flex-1'>
                        <h5 className='aucctus-text-sm-semibold aucctus-text-primary truncate'>
                          {result.title}
                        </h5>
                        {result.isSynthetic && result.personaName && (
                          <p className='aucctus-text-xs aucctus-text-secondary'>
                            {result.personaName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center gap-2'>
                      {canDelete && (
                        <button
                          onClick={() =>
                            handleDeleteResult(result.uuid, result.title)
                          }
                          className='aucctus-bg-secondary-hover rounded p-1'
                          disabled={deleteTestResult.isLoading}
                          title='Delete file'
                        >
                          <Icon
                            variant='trash'
                            className='aucctus-stroke-secondary h-4 w-4'
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Content */}
                {result.isSynthetic ? (
                  // Synthetic interview content with structured sections
                  <div className='px-4 pb-4'>
                    {result.description && (
                      <div className='mb-4'>
                        <h6 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                          Interview Content
                        </h6>
                        <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                          <pre className='aucctus-text-sm aucctus-text-secondary whitespace-pre-wrap font-sans'>
                            {result.description}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Structured Synthetic Interview Sections */}
                    <div className='space-y-4'>
                      {result.keyInsights && (
                        <div>
                          <h6 className='aucctus-text-sm-semibold aucctus-text-primary mb-2 flex items-center gap-2'>
                            <Icon
                              variant='lightbulb'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                            Key Insights
                          </h6>
                          <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                            <p className='aucctus-text-sm aucctus-text-secondary'>
                              {result.keyInsights}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.painPoints && (
                        <div>
                          <h6 className='aucctus-text-sm-semibold aucctus-text-primary mb-2 flex items-center gap-2'>
                            <Icon
                              variant='alert-triangle'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                            Pain Points
                          </h6>
                          <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                            <p className='aucctus-text-sm aucctus-text-secondary'>
                              {result.painPoints}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.solutionFeedback && (
                        <div>
                          <h6 className='aucctus-text-sm-semibold aucctus-text-primary mb-2 flex items-center gap-2'>
                            <Icon
                              variant='message-circle'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                            Solution Feedback
                          </h6>
                          <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                            <p className='aucctus-text-sm aucctus-text-secondary'>
                              {result.solutionFeedback}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.willingnessToPayFeedback && (
                        <div>
                          <h6 className='aucctus-text-sm-semibold aucctus-text-primary mb-2 flex items-center gap-2'>
                            <Icon
                              variant='currency-dollar'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                            Willingness to Pay
                          </h6>
                          <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                            <p className='aucctus-text-sm aucctus-text-secondary'>
                              {result.willingnessToPayFeedback}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.overallSentiment && (
                        <div>
                          <h6 className='aucctus-text-sm-semibold aucctus-text-primary mb-2 flex items-center gap-2'>
                            <Icon
                              variant='heart'
                              className='aucctus-stroke-brand-primary h-4 w-4'
                            />
                            Overall Sentiment
                          </h6>
                          <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                            <p className='aucctus-text-sm aucctus-text-secondary'>
                              {result.overallSentiment}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Fallback to summary if structured fields are not available */}
                      {!result.keyInsights &&
                        !result.painPoints &&
                        !result.solutionFeedback &&
                        !result.willingnessToPayFeedback &&
                        !result.overallSentiment &&
                        result.summary && (
                          <div>
                            <h6 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                              Summary
                            </h6>
                            <div className='aucctus-bg-secondary-subtle rounded-md p-3'>
                              <p className='aucctus-text-sm aucctus-text-secondary'>
                                {result.summary}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  // Regular file content
                  result.files.map((file) => (
                    <div className='p-4' key={file.uuid}>
                      {/* Description if available */}
                      {file.originalFilename && (
                        <div className='mb-3'>
                          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                            {file.originalFilename}
                          </p>
                        </div>
                      )}

                      {/* Metadata in compact grid */}
                      <div className='grid grid-cols-2 gap-3 text-xs'>
                        <div className='flex items-center gap-2'>
                          <Icon
                            variant='filecode'
                            className='aucctus-stroke-tertiary h-3 w-3 flex-shrink-0'
                          />
                          <div>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                              Size
                            </p>
                            <p className='aucctus-text-xs-semibold aucctus-text-brand-primary'>
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Icon
                            variant='calendar'
                            className='aucctus-stroke-tertiary h-3 w-3 flex-shrink-0'
                          />
                          <div>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                              Uploaded
                            </p>
                            <p className='aucctus-text-xs-semibold aucctus-text-brand-primary'>
                              {formatDate(file.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className='mt-3 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Icon
                            variant={isProcessingComplete ? 'check' : 'refresh'}
                            className={cn(
                              'h-3 w-3',
                              isProcessingComplete
                                ? 'aucctus-stroke-success-primary'
                                : 'aucctus-stroke-brand-primary animate-spin',
                            )}
                          />
                          <span
                            className={cn(
                              'rounded px-2 py-0.5 text-xs font-medium',
                              isProcessingComplete
                                ? 'aucctus-bg-success-secondary aucctus-text-success-primary'
                                : 'aucctus-bg-brand-secondary aucctus-text-brand-primary',
                            )}
                          >
                            {isProcessingComplete
                              ? 'Processed'
                              : 'Processing...'}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                            {file.fileExtension.toUpperCase()}
                          </p>
                          {file.fileUrl && (
                            <a
                              href={file.fileUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='btn btn-primary btn-xs flex items-center gap-1'
                              title='Download file'
                            >
                              <Icon
                                variant='download'
                                className='aucctus-stroke-white h-3 w-3'
                              />
                            </a>
                          )}
                          {canDelete && ( // Hide delete button in view mode
                            <button
                              onClick={() =>
                                handleDeleteFile(
                                  result.uuid,
                                  file.uuid,
                                  file.originalFilename || 'file',
                                )
                              }
                              className='btn btn-secondary btn-xs flex items-center gap-1'
                              disabled={deleteTestResultFile.isLoading}
                              title='Delete file'
                            >
                              <Icon
                                variant='trash'
                                className='aucctus-stroke-secondary h-3 w-3'
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>

          {/* Key Learnings Section - Enhanced for multiple files */}
          {results.length > 0 &&
            results[0].learnings &&
            results[0].learnings.length > 0 && (
              <div>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Icon
                      variant='lightbulb'
                      className='aucctus-stroke-brand-primary h-5 w-5 flex-shrink-0'
                    />
                    <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
                      Key Learnings from Analysis
                    </h4>
                  </div>
                  {results.length > 1 && (
                    <span className='aucctus-bg-brand-secondary aucctus-text-brand-primary rounded-full px-3 py-1 text-xs font-medium'>
                      From {results.length} files
                    </span>
                  )}
                </div>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                  {results[0].learnings.map((learning, index) => (
                    <div
                      key={learning.uuid}
                      className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-4'
                    >
                      <div className='mb-3 flex items-start justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='aucctus-bg-brand-primary aucctus-text-white flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold'>
                            {index + 1}
                          </span>
                          <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                            Learning #{index + 1}
                          </p>
                        </div>
                      </div>

                      <p className='aucctus-text-sm-regular aucctus-text-brand-primary mb-3 leading-relaxed'>
                        {learning.learning}
                      </p>

                      <div className='aucctus-bg-primary rounded-lg p-3'>
                        <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                          Impact Assessment:
                        </p>
                        <p className='aucctus-text-sm-semibold aucctus-text-secondary'>
                          {learning.impact}
                        </p>
                      </div>
                      <div className='aucctus-bg-tertiary mt-3 rounded-lg p-3'>
                        <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                          Source File:
                        </p>
                        <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                          {learning.sourceFilename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Local Confirmation Dialog - Use Portal for full screen coverage */}
      {confirmationDialog &&
        typeof document !== 'undefined' &&
        document.body &&
        createPortal(
          <div className='fixed inset-0 z-50 flex items-center justify-center'>
            {/* Backdrop */}
            <div
              className='aucctus-bg-secondary-solid absolute inset-0 bg-opacity-50'
              onClick={() => setConfirmationDialog(null)}
            />

            {/* Dialog */}
            <div className='aucctus-bg-primary aucctus-border-secondary relative max-w-md rounded-lg border p-6 shadow-lg'>
              <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
                {confirmationDialog.title}
              </h3>
              <p className='aucctus-text-sm aucctus-text-secondary mb-6'>
                {confirmationDialog.message}
              </p>

              <div className='flex justify-end gap-3'>
                <button
                  className='btn btn-light btn-sm'
                  onClick={() => setConfirmationDialog(null)}
                >
                  Cancel
                </button>
                <button
                  className='btn btn-danger btn-sm'
                  onClick={confirmationDialog.onConfirm}
                  disabled={isDeletingAll}
                >
                  {confirmationDialog.type === 'deleteAll' && isDeletingAll
                    ? 'Deleting...'
                    : confirmationDialog.type === 'deleteAll'
                      ? 'Delete All'
                      : 'Delete'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TestResults;
