import React, { useState, useEffect } from 'react';
import { Icon, FileDropzone, toast } from '@components';
import {
  useTestResults,
  useCreateTestResultWithFile,
  useDeleteTestResult,
} from '@hooks/query/testing.hook';
import { ITestResult } from '@libs/api/types/concept/testing';

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

  // State to trigger dropzone reset
  const [dropzoneKey, setDropzoneKey] = useState(0);

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
      await createTestResultWithFile.mutateAsync({
        conceptUuid,
        testUuid,
        file: uploadedFile.file,
        summary: uploadedFile.description || undefined,
        recommendations: undefined, // Could be added to the FileDropzone form later
      });

      // Clear the dropzone by updating its key to force re-render
      setDropzoneKey((prev) => prev + 1);

      // The query will be invalidated and refetch the updated results
    } catch (error) {
      // The hook already shows a toast error message
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
        <div className='absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-4 text-center'>
            <div className='relative'>
              <Icon
                variant='refresh'
                className='aucctus-stroke-brand-primary h-12 w-12 animate-spin'
              />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='aucctus-bg-brand-primary h-3 w-3 animate-pulse rounded-full'></div>
              </div>
            </div>
            <div className='space-y-2'>
              <h4 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
                Analyzing Test Results
              </h4>
              <p className='aucctus-text-sm-regular aucctus-text-secondary max-w-md'>
                We&apos;re processing your test data and extracting key
                insights. This may take up to a minute.
              </p>
              <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                Our AI will provide learnings and recommendations soon...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className='space-y-2'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
          Test Results
        </h3>
        <p className='aucctus-text-sm-regular aucctus-text-secondary'>
          Record and analyze findings from your test
          {hasResults && (
            <span className='aucctus-text-brand-primary ml-2'>
              ({results.length} file{results.length !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

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
                    <div className='aucctus-bg-secondary-subtle rounded-lg p-3'>
                      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
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
                          <div>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary'>
                              Status
                            </p>
                            <span className='aucctus-bg-success-secondary aucctus-text-success-primary rounded-full px-2 py-0.5 text-xs font-semibold'>
                              Processed
                            </span>
                          </div>
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
                      <div className='flex items-start gap-3'>
                        <div className='aucctus-bg-brand-secondary aucctus-border-brand mt-1 flex-shrink-0 rounded-full border p-1'>
                          <Icon
                            variant='check'
                            className='aucctus-stroke-brand-primary h-3 w-3'
                          />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-2'>
                            {learning.learning}
                          </p>
                          <div className='aucctus-bg-primary rounded p-2'>
                            <p className='aucctus-text-xs-regular aucctus-text-tertiary mb-1'>
                              Impact:
                            </p>
                            <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                              {learning.impact}
                            </p>
                          </div>
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
