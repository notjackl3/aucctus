import React, { useState, useEffect } from 'react';
import { Icon, FileDropzone, toast } from '@components';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import telemetry from '@libs/telemetry';
import {
  useTestResults,
  useCreateTestResultWithFile,
  useDeleteTestResult,
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
}

const TestResults: React.FC<TestResultsProps> = ({
  conceptUuid,
  testUuid,
  onResultsChange,
}) => {
  // Use props data if available, otherwise fetch (for backward compatibility)
  const shouldFetch = !!conceptUuid && !!testUuid;

  const { results: fetchedResults, isLoading: isFetchedResultsLoading } =
    useTestResults(conceptUuid || '', testUuid || '', { enabled: shouldFetch });

  // Type cast the results to include extended properties
  const results = fetchedResults as ITestResult[];
  const isResultsLoading = isFetchedResultsLoading;

  // Hook for creating test results with file upload
  const createTestResultWithFile = useCreateTestResultWithFile();

  // Hook for deleting test results
  const deleteTestResult = useDeleteTestResult();

  // Query client for invalidating cache
  const queryClient = useQueryClient();

  // State to trigger dropzone reset
  const [dropzoneKey, setDropzoneKey] = useState(0);

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
  const handleFileUpload = async (uploadedFile: {
    file: File;
    name: string;
    description: string;
  }) => {
    if (!conceptUuid || !testUuid) {
      toast.error('Missing concept or test information');
      return;
    }

    try {
      const result = await createTestResultWithFile.mutateAsync({
        conceptUuid,
        testUuid,
        file: uploadedFile.file,
        summary: uploadedFile.description || undefined,
        recommendations: undefined, // Could be added to the FileDropzone form later
      });

      // Set initial processing state
      telemetry.log('test.result.upload.success', {
        testResultUuid: result.uuid,
        conceptUuid,
        testUuid,
        fileName: uploadedFile.file.name,
        fileSize: uploadedFile.file.size,
      });

      setProcessingState({
        isProcessing: true,
        stage: null,
        message: 'Starting analysis...',
        progress: 0,
        error: null,
        testResultUuid: result.uuid,
        conceptUuid: conceptUuid,
        testUuid: testUuid,
        summary: undefined,
        learnings: [],
        keywords: [],
      });

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

  // Handle file removal - only needed for dropzone component
  const handleFileRemove = () => {
    // This will be called when the user removes a file from the dropzone
    // The dropzone component handles its own state for the current file
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

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resultTitle}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

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

  return (
    <div className='relative space-y-4'>
      {/* Loading Overlay for Test Result Analysis */}
      {createTestResultWithFile.isLoading && (
        <TestCompletionLoadingOverlay
          title='Analyzing Test Results'
          description="We're processing your test data and extracting key insights. This may take up to a minute."
          subtitle='Our AI will provide learnings and recommendations soon...'
        />
      )}

      {/* Real-time Processing Status */}
      <TestResultProcessingStatus processingState={processingState} />

      {/* Results Grid */}
      {hasResults && (
        <div className='space-y-3'>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
            Uploaded Results
          </h4>
          <div className='grid gap-3'>
            {results.map((result) => (
              <div
                key={result.uuid}
                className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4 transition-all hover:shadow-sm'
              >
                <div className='flex items-start gap-4'>
                  {/* File Icon */}
                  <div className='aucctus-bg-secondary aucctus-border-secondary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border'>
                    <Icon variant='pdf' className='h-6 w-6' />
                  </div>

                  {/* File Details */}
                  <div className='min-w-0 flex-1'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div className='min-w-0 flex-1'>
                        <h5 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-1 truncate'>
                          {result.title}
                        </h5>
                        {result.description && (
                          <p className='aucctus-text-sm-regular aucctus-text-secondary mb-2 line-clamp-2'>
                            {result.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className='ml-4 flex items-center gap-2'>
                        {result.fileUrl && (
                          <a
                            href={result.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='btn btn-primary btn-sm flex items-center justify-center'
                          >
                            <Icon
                              variant='download'
                              className='aucctus-stroke-white h-4 w-4'
                            />
                          </a>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteResult(result.uuid, result.title)
                          }
                          className='btn btn-primary btn-sm flex items-center justify-center'
                          disabled={deleteTestResult.isLoading}
                        >
                          <Icon
                            variant='trash'
                            className='aucctus-stroke-white h-4 w-4'
                          />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className='aucctus-bg-secondary-subtle rounded-lg p-4'>
                      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
                        {/* File Name */}
                        <div className='flex items-center gap-2'>
                          <Icon
                            variant='file'
                            className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                          />
                          <div className='min-w-0'>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                              Original File
                            </p>
                            <p className='aucctus-text-sm-semibold aucctus-text-brand-primary truncate'>
                              {result.originalFilename}
                            </p>
                          </div>
                        </div>

                        {/* File Type & Size */}
                        <div className='flex items-center gap-2'>
                          <Icon
                            variant='filecode'
                            className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                          />
                          <div>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                              Type & Size
                            </p>
                            <p className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                              {result.fileType.toUpperCase()} •{' '}
                              {formatFileSize(result.fileSize)}
                            </p>
                          </div>
                        </div>

                        {/* Upload Date */}
                        <div className='flex items-center gap-2'>
                          <Icon
                            variant='calendar'
                            className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                          />
                          <div>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                              Uploaded
                            </p>
                            <p className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                              {formatDate(result.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className='flex items-center gap-2'>
                          <Icon
                            variant='check'
                            className='aucctus-stroke-success-primary h-4 w-4 flex-shrink-0'
                          />
                          <span className='aucctus-bg-success-secondary aucctus-text-success-primary rounded-full px-2 py-0.5 text-xs font-semibold'>
                            Processed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Learnings Section - Outside of individual cards, Two Columns */}
          {results.length > 0 &&
            results[0].learnings &&
            results[0].learnings.length > 0 && (
              <div>
                <div className='mb-3 flex items-center gap-3'>
                  <Icon
                    variant='lightbulb'
                    className='aucctus-stroke-brand-primary h-5 w-5 flex-shrink-0'
                  />
                  <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                    Key Learnings
                  </h4>
                </div>
                <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                  {results[0].learnings.map((learning) => (
                    <div
                      key={learning.uuid}
                      className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-3'
                    >
                      <div>
                        <p className='aucctus-text-sm-regular aucctus-text-brand-primary mb-2'>
                          {learning.learning}
                        </p>
                        <div className='aucctus-bg-primary rounded p-2'>
                          <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                            Impact:
                          </p>
                          <p className='aucctus-text-sm-semibold aucctus-text-secondary'>
                            {learning.impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

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
                Adding Test Results
              </h4>
              <p className='aucctus-text-sm-regular aucctus-text-secondary mb-2'>
                Record key findings from your test sessions. These will be used
                to validate your assumptions and improve your concept.
              </p>
              <ul className='aucctus-text-sm-regular aucctus-text-secondary list-disc space-y-1 pl-5'>
                <li>Focus on clear, objective observations</li>
                <li>Include specific numbers or quotes when possible</li>
                <li>
                  Categorize each finding to connect it to your assumptions
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Results - Only show when no results */}
      {!hasResults && (
        <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4'>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
            Add Test Results
          </h4>
          <p className='aucctus-text-sm-regular aucctus-text-secondary mb-4'>
            Upload a file containing your test results. Include a descriptive
            name and optional description to help organize your findings.
          </p>

          <FileDropzone
            key={dropzoneKey}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            maxSizeInMB={25}
          />
        </div>
      )}
    </div>
  );
};

export default TestResults;
