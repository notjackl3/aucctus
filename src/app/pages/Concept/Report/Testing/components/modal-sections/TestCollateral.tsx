import React, { useRef, useEffect } from 'react';
import { Icon, toast, Loading, ConceptReportSkeletons } from '@components';
import { cn } from '@libs/utils/react';
import {
  useTestCollateral,
  useTestCollateralManager,
  useUploadTestCollateralImage,
  useTestCollateralRequest,
} from '@hooks/query/testing.hook';
import TabBanner from '../common/TabBanner';

import {
  CollateralType,
  ICollateralRegenerationStatus,
  ITestCollateral,
} from '@libs/api/types/concept/testing';

interface TestCollateralProps {
  conceptUuid?: string;
  testUuid?: string;
  initialSelectedCollateralUuid?: string;
  isRegenerating?: boolean;
  regenerationStatus?: ICollateralRegenerationStatus;
}

const TestCollateral: React.FC<TestCollateralProps> = ({
  conceptUuid,
  testUuid,
  initialSelectedCollateralUuid,
  isRegenerating = false,
  regenerationStatus,
}) => {
  // Use props data if available, otherwise fetch (for backward compatibility)
  const shouldFetch = !!conceptUuid && !!testUuid;

  const {
    collateral: fetchedCollateral,
    isLoading: isFetchedCollateralLoading,
    collateralRegeneration,
  } = useTestCollateral(conceptUuid || '', testUuid || '', {
    enabled: shouldFetch,
  });

  // Use provided data or fallback to fetched data
  const collateral = fetchedCollateral;
  const isCollateralLoading = isFetchedCollateralLoading;
  const isRegeneratingFromApi =
    collateralRegeneration?.status === 'running' ||
    regenerationStatus?.status === 'running';
  const effectiveIsRegenerating = isRegenerating || isRegeneratingFromApi;

  const [selectedItem, setSelectedItem] =
    React.useState<ITestCollateral | null>(null);

  // State for editable content
  const [editContent, setEditContent] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State for custom collateral request expansion
  const [isCustomizeExpanded, setIsCustomizeExpanded] = React.useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Upload image collateral hook
  const uploadImageCollateral = useUploadTestCollateralImage();

  // Custom collateral request hook
  const {
    customRequest,
    setCustomRequest,
    handleCustomRequest,
    isLoading: isSubmittingRequest,
  } = useTestCollateralRequest(conceptUuid || '', testUuid || '');

  // Focus custom input when expanded
  useEffect(() => {
    if (isCustomizeExpanded && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCustomizeExpanded]);

  // Update edit content when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setEditContent(selectedItem.content);
    }
  }, [selectedItem]);

  // Hook for managing all collateral feedback states
  const {
    getProcessingState,
    getFeedbackText,
    setFeedbackText,
    clearProcessingState: clearFeedbackProcessingState,
    submitFeedback,
    handleKeyDown: handleKeyDownFeedback,
    checkCompletedFeedback,
    isLoading: isSubmittingFeedback,
  } = useTestCollateralManager(conceptUuid || '', testUuid || '', () => {
    // The update was successful, the query cache will be invalidated automatically
    // by the WebSocket events, so the collateral data will refresh
  });

  // Get processing state for selected item
  const feedbackProcessingState = selectedItem
    ? getProcessingState(selectedItem.id)
    : {
        isProcessing: false,
        progress: 0,
        message: '',
        stage: undefined,
        error: null,
        collateralUuid: undefined,
      };

  // Check if feedback is processing
  const isFeedbackProcessing = feedbackProcessingState.isProcessing;

  // Get feedback text for selected item
  const feedback = selectedItem ? getFeedbackText(selectedItem.id) : '';
  const setFeedback = (text: string) => {
    if (selectedItem) {
      setFeedbackText(selectedItem.id, text);
    }
  };

  // Handle feedback submission for selected item
  const handleFeedbackSubmission = () => {
    if (selectedItem && feedback.trim()) {
      submitFeedback(selectedItem.id, feedback, selectedItem.updatedAt);
    }
  };

  // Convert API collateral to ITestCollateral format
  const convertApiCollateral = (apiCollateral: any[]): ITestCollateral[] => {
    return apiCollateral.map((item) => {
      // Map API types to component types
      let componentType: CollateralType = 'text'; // default
      let content = item?.content;
      switch (item.type) {
        case 'image':
          componentType = 'image';
          content = item?.contentUrl;
          break;
        case 'text':
        case 'guide':
        case 'survey':
        case 'document':
          componentType = 'text';
          break;
        case 'file':
        default:
          componentType = 'file';
          break;
      }

      return {
        id: item.uuid,
        title: item.title,
        description: item.description,
        type: componentType,
        content,
        format: item.format,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
  };

  // Get display collateral from API only
  const displayCollateral = React.useMemo(() => {
    if (!collateral) return [];

    // Handle direct array format
    if (Array.isArray(collateral) && collateral.length > 0) {
      return convertApiCollateral(collateral);
    }

    // Handle API response with results array
    if (
      typeof collateral === 'object' &&
      'results' in collateral &&
      Array.isArray(collateral.results) &&
      collateral.results.length > 0
    ) {
      return convertApiCollateral(collateral.results);
    }

    return [];
  }, [collateral]);

  // Update selected item when collateral changes (including after feedback updates)
  React.useEffect(() => {
    if (displayCollateral.length > 0) {
      // Check all items for completed feedback based on updatedAt changes
      displayCollateral.forEach((item) => {
        if (item.updatedAt) {
          checkCompletedFeedback(item.id, item.updatedAt);
        }
      });

      setSelectedItem((prevSelectedItem) => {
        // Check if we have an initial selection to make
        if (initialSelectedCollateralUuid && !prevSelectedItem) {
          const initialItem = displayCollateral.find(
            (item) => item.id === initialSelectedCollateralUuid,
          );
          if (initialItem) {
            return initialItem;
          }
        }

        if (!prevSelectedItem) {
          // Select first item if none selected
          return displayCollateral[0];
        } else {
          // Update selectedItem with fresh data if it exists in the new collateral
          const updatedSelectedItem = displayCollateral.find(
            (item) => item.id === prevSelectedItem.id,
          );
          if (
            updatedSelectedItem &&
            JSON.stringify(updatedSelectedItem) !==
              JSON.stringify(prevSelectedItem)
          ) {
            return updatedSelectedItem;
          }
          return prevSelectedItem;
        }
      });
    }
  }, [
    displayCollateral,
    checkCompletedFeedback,
    initialSelectedCollateralUuid,
  ]);

  // Additional effect to handle initial selection when both data and UUID are available
  React.useEffect(() => {
    if (initialSelectedCollateralUuid && displayCollateral.length > 0) {
      const targetItem = displayCollateral.find(
        (item) => item.id === initialSelectedCollateralUuid,
      );
      if (targetItem) {
        setSelectedItem(targetItem);
      }
    }
  }, [initialSelectedCollateralUuid, displayCollateral]);

  // Handle item selection
  const handleItemSelect = (item: ITestCollateral) => {
    setSelectedItem(item);

    // Check if this item's feedback processing might be complete based on updatedAt time
    if (item.updatedAt) {
      checkCompletedFeedback(item.id, item.updatedAt);
    }
  };

  // Handle content copy
  const handleCopyContent = () => {
    if (selectedItem) {
      navigator.clipboard.writeText(selectedItem.content);
      toast.success(
        'Content Copied',
        `${selectedItem.title} copied to clipboard`,
      );
    }
  };

  // Handle content download
  const handleDownloadContent = () => {
    if (!selectedItem) return;

    if (selectedItem.type === 'text') {
      const element = document.createElement('a');
      const file = new Blob([selectedItem.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${selectedItem.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (selectedItem.type === 'image') {
      const link = document.createElement('a');
      link.href = selectedItem.content;
      link.download = `${selectedItem.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success(
      'Download Complete',
      `${selectedItem.title} downloaded successfully`,
    );
  };

  // Handle file upload
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && conceptUuid && testUuid) {
        try {
          await uploadImageCollateral.mutateAsync({
            conceptUuid,
            testUuid,
            file,
            title: file.name.replace(/\.[^/.]+$/, ''),
          });
        } catch (_error) {
          // Error handled by mutation hook
        }
      }
    };
    input.click();
  };

  // Handle custom collateral request submission
  const handleCustomCollateralSubmit = () => {
    if (customRequest.trim()) {
      handleCustomRequest();
      setIsCustomizeExpanded(false);
    }
  };

  if (isCollateralLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <Icon
            variant='refresh'
            className='aucctus-stroke-brand-primary h-6 w-6 animate-spin'
          />
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Loading collateral...
          </p>
        </div>
      </div>
    );
  }

  // Show no data state if no collateral available
  const hasNoCollateral = displayCollateral.length === 0;

  return (
    <div
      className={cn(
        'relative flex h-full flex-col overscroll-contain',
        !effectiveIsRegenerating && 'space-y-4',
      )}
    >
      {!effectiveIsRegenerating && (
        <>
          {/* Tab Banner */}
          <TabBanner
            icon='file-open'
            title='Test Collateral'
            description="Review and customize the materials you'll use to run your test."
          />

          {hasNoCollateral ? (
            // No data state
            <div className='aucctus-bg-secondary-subtle aucctus-border-secondary flex flex-1 items-center justify-center rounded-lg border p-6'>
              <div className='flex flex-col items-center justify-center text-center'>
                <Icon
                  variant='file-open'
                  className='aucctus-stroke-tertiary mb-4 h-8 w-8'
                />
                <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
                  No collateral found
                </h4>
                <p className='aucctus-text-sm-regular aucctus-text-secondary max-w-md'>
                  Test collateral such as interview guides, mockups, and other
                  materials will appear here once they&apos;re created for this
                  test.
                </p>
              </div>
            </div>
          ) : (
            // Data available state - New 1/3 + 2/3 grid layout
            <div className='grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-3'>
              {/* Left column - Collateral Items List - 1/3 width */}
              <div className='flex h-full flex-col'>
                {/* Scrollable cards area */}
                <div className='flex-1 space-y-3 overflow-y-auto pr-1'>
                  {displayCollateral.map((item) => {
                    const itemProcessingState = getProcessingState(item.id);
                    const isItemProcessing = itemProcessingState.isProcessing;
                    const hasItemError = itemProcessingState.error;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'aucctus-border-secondary aucctus-bg-primary hover:aucctus-border-brand-primary cursor-pointer rounded-lg border p-4 transition-colors',
                          selectedItem?.id === item.id &&
                            'aucctus-border-brand-primary aucctus-bg-brand-secondary',
                          isItemProcessing && 'aucctus-border-brand-secondary',
                          hasItemError && 'aucctus-border-error',
                        )}
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='relative'>
                            {item.type === 'text' ? (
                              <Icon
                                variant='file-text'
                                className='aucctus-stroke-tertiary h-8 w-8 shrink-0'
                              />
                            ) : item.type === 'image' ? (
                              <Icon
                                variant='image'
                                className='aucctus-stroke-tertiary h-8 w-8 shrink-0'
                              />
                            ) : (
                              <Icon
                                variant='file-attachment'
                                className='aucctus-stroke-tertiary h-8 w-8 shrink-0'
                              />
                            )}
                            {isItemProcessing && (
                              <div className='absolute -right-1 -top-1'>
                                <div className='aucctus-bg-brand-primary h-3 w-3 animate-pulse rounded-full' />
                              </div>
                            )}
                            {hasItemError && (
                              <div className='absolute -right-1 -top-1'>
                                <Icon
                                  variant='alert-circle'
                                  className='aucctus-stroke-error-primary h-3 w-3'
                                />
                              </div>
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h5 className='aucctus-text-sm-medium aucctus-text-primary mb-1 truncate'>
                              {item.title}
                            </h5>
                            <p className='aucctus-text-xs-regular aucctus-text-secondary line-clamp-2'>
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Customize Collateral - Expandable Input */}
                  {isCustomizeExpanded ? (
                    <div className='aucctus-border-secondary aucctus-bg-primary animate-fade-in rounded-lg border shadow-sm'>
                      <div className='p-3'>
                        <input
                          ref={customInputRef}
                          type='text'
                          value={customRequest}
                          onChange={(e) => setCustomRequest(e.target.value)}
                          placeholder='Describe the collateral you need...'
                          className='aucctus-text-sm aucctus-text-primary placeholder:aucctus-text-placeholder w-full border-0 bg-transparent px-0 py-6 focus:outline-none'
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCustomCollateralSubmit();
                            }
                            if (e.key === 'Escape') {
                              setIsCustomizeExpanded(false);
                              setCustomRequest('');
                            }
                          }}
                          disabled={isSubmittingRequest}
                        />
                      </div>
                      <div className='aucctus-border-secondary aucctus-bg-secondary-subtle flex justify-end border-t px-3 py-2'>
                        <button
                          onClick={handleCustomCollateralSubmit}
                          disabled={
                            !customRequest.trim() || isSubmittingRequest
                          }
                          className='btn btn-primary btn-sm flex h-7 items-center gap-1 px-3 text-xs disabled:opacity-50'
                        >
                          {isSubmittingRequest ? (
                            <Loading isSmall />
                          ) : (
                            <>
                              Generate
                              <Icon
                                variant='arrowright'
                                className='aucctus-stroke-secondary h-3 w-3'
                              />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCustomizeExpanded(true)}
                      disabled={isFeedbackProcessing || isSubmittingFeedback}
                      className='aucctus-text-secondary hover:aucctus-text-primary hover:aucctus-border-brand-primary flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <Icon
                        variant='plus'
                        className='aucctus-stroke-secondary h-4 w-4'
                      />
                      <span className='aucctus-text-sm-medium'>
                        Customize Collateral
                      </span>
                    </button>
                  )}

                  {/* Upload File Button */}
                  <button
                    onClick={handleFileUpload}
                    disabled={
                      isFeedbackProcessing ||
                      isSubmittingFeedback ||
                      uploadImageCollateral.isLoading
                    }
                    className='aucctus-text-secondary hover:aucctus-text-primary hover:aucctus-border-brand-primary flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {uploadImageCollateral.isLoading ? (
                      <Loading isSmall />
                    ) : (
                      <Icon
                        variant='upload'
                        className='aucctus-stroke-secondary h-4 w-4'
                      />
                    )}
                    <span className='aucctus-text-sm-medium'>
                      {uploadImageCollateral.isLoading
                        ? 'Uploading...'
                        : 'Upload File'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right column - Selected Content - 2/3 width */}
              <div className='h-full md:col-span-2'>
                <div className='aucctus-border-secondary aucctus-bg-primary flex h-full flex-col overflow-hidden rounded-lg border'>
                  {/* Header Section - Fixed at top */}
                  <div className='aucctus-border-secondary aucctus-bg-secondary-subtle flex flex-shrink-0 items-center justify-between border-b px-4 py-3'>
                    <div className='min-w-0 flex-1'>
                      <h4 className='aucctus-text-md-medium aucctus-text-primary truncate'>
                        {selectedItem?.title || 'No item selected'}
                      </h4>
                      {selectedItem?.description && (
                        <p className='aucctus-text-sm-regular aucctus-text-secondary mt-0.5 line-clamp-1'>
                          {selectedItem.description}
                        </p>
                      )}
                    </div>
                    {selectedItem && (
                      <div className='flex shrink-0 gap-1.5'>
                        {selectedItem.type === 'text' && (
                          <>
                            <button
                              className='aucctus-bg-primary hover:aucctus-bg-secondary-subtle aucctus-border-secondary flex h-8 w-8 items-center justify-center rounded border'
                              onClick={handleCopyContent}
                            >
                              <Icon
                                variant='clipboard'
                                className='aucctus-stroke-secondary h-4 w-4'
                              />
                            </button>
                            <button
                              className='aucctus-bg-primary hover:aucctus-bg-secondary-subtle aucctus-border-secondary flex h-8 w-8 items-center justify-center rounded border'
                              onClick={handleDownloadContent}
                            >
                              <Icon
                                variant='download'
                                className='aucctus-stroke-secondary h-4 w-4'
                              />
                            </button>
                          </>
                        )}
                        {selectedItem.type === 'image' && (
                          <button
                            className='aucctus-bg-primary hover:aucctus-bg-secondary-subtle aucctus-border-secondary flex h-8 w-8 items-center justify-center rounded border'
                            onClick={handleDownloadContent}
                          >
                            <Icon
                              variant='download'
                              className='aucctus-stroke-secondary h-4 w-4'
                            />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedItem ? (
                    <>
                      {/* Content Section - Scrollable with dotted background */}
                      <div
                        className='flex-1 overflow-y-auto p-4'
                        style={{
                          backgroundImage:
                            'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        {selectedItem.type === 'text' ? (
                          <div className='aucctus-bg-primary aucctus-border-secondary h-full rounded-lg border shadow-sm'>
                            <textarea
                              ref={textareaRef}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className='aucctus-text-sm aucctus-text-primary h-full w-full resize-none rounded-lg bg-transparent p-5 leading-relaxed focus:outline-none'
                              placeholder='Enter your collateral content...'
                            />
                          </div>
                        ) : selectedItem.type === 'image' ? (
                          <div className='flex h-full items-start justify-center'>
                            <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4 shadow-sm'>
                              <img
                                src={selectedItem.content}
                                alt={selectedItem.title}
                                className='max-h-80 rounded object-contain'
                              />
                            </div>
                          </div>
                        ) : (
                          <div className='flex h-full items-center justify-center'>
                            <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
                              Preview not available for this file type
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Simplified Feedback Section - Fixed at bottom */}
                      <div className='aucctus-border-secondary aucctus-bg-primary flex-shrink-0 border-t px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          {isSubmittingFeedback || isFeedbackProcessing ? (
                            <div className='flex flex-1 items-center gap-2'>
                              <Loading isSmall />
                              <span className='aucctus-text-sm-regular aucctus-text-secondary'>
                                {isFeedbackProcessing
                                  ? 'Processing feedback...'
                                  : 'Submitting...'}
                              </span>
                            </div>
                          ) : feedbackProcessingState.error ? (
                            <div className='flex flex-1 items-center gap-2'>
                              <Icon
                                variant='alert-circle'
                                className='aucctus-stroke-error-primary h-4 w-4'
                              />
                              <span className='aucctus-text-sm-regular aucctus-text-error-primary flex-1'>
                                {feedbackProcessingState.error}
                              </span>
                              <button
                                onClick={() =>
                                  selectedItem &&
                                  clearFeedbackProcessingState(selectedItem.id)
                                }
                                className='btn btn-secondary btn-sm'
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                type='text'
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                onKeyDown={(e) =>
                                  selectedItem &&
                                  handleKeyDownFeedback(
                                    selectedItem.id,
                                    e,
                                    selectedItem.updatedAt,
                                  )
                                }
                                placeholder='Enter feedback to regenerate this collateral'
                                className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary placeholder:aucctus-text-placeholder focus:aucctus-border-brand-primary flex-1 rounded border px-3 py-2 text-sm focus:outline-none'
                                disabled={
                                  isSubmittingFeedback || isFeedbackProcessing
                                }
                              />
                              <button
                                onClick={handleFeedbackSubmission}
                                disabled={
                                  !feedback.trim() ||
                                  isSubmittingFeedback ||
                                  isFeedbackProcessing
                                }
                                className='btn btn-secondary btn-sm flex h-9 w-9 items-center justify-center p-0 disabled:opacity-50'
                              >
                                <Icon
                                  variant='arrowright'
                                  className='aucctus-stroke-secondary h-4 w-4'
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className='flex h-full items-center justify-center p-6'>
                      <div className='text-center'>
                        <Icon
                          variant='file-attachment'
                          className='aucctus-stroke-tertiary mx-auto mb-2 h-8 w-8'
                        />
                        <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
                          Select a collateral item to view its content
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {effectiveIsRegenerating && (
        <div className='aucctus-bg-primary absolute inset-0 z-20 flex rounded-lg p-0'>
          <div className='w-full p-0'>
            <ConceptReportSkeletons.TestCollateralSkeleton />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCollateral;
