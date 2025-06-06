import React, { useState } from 'react';
import { Icon, toast } from '@components';
import { cn } from '@libs/utils/react';
import { useTestCollateral } from '@hooks/query/testing.hook';
import ReactMarkdown from 'react-markdown';

// Define types for test collateral
type CollateralType = 'text' | 'image' | 'file';

interface CollateralItem {
  id: string;
  title: string;
  description: string;
  type: CollateralType;
  content: string;
  format?: string; // for files: pdf, docx, etc.
}

interface TestCollateralProps {
  conceptUuid?: string;
  testUuid?: string;
}

const TestCollateral: React.FC<TestCollateralProps> = ({
  conceptUuid,
  testUuid,
}) => {
  // Use props data if available, otherwise fetch (for backward compatibility)
  const shouldFetch = !!conceptUuid && !!testUuid;

  const {
    collateral: fetchedCollateral,
    isLoading: isFetchedCollateralLoading,
  } = useTestCollateral(conceptUuid || '', testUuid || '', {
    enabled: shouldFetch,
  });

  // Use provided data or fallback to fetched data
  const collateral = fetchedCollateral;
  const isCollateralLoading = isFetchedCollateralLoading;

  const [selectedItem, setSelectedItem] = useState<CollateralItem | null>(null);

  // Convert API collateral to CollateralItem format
  const convertApiCollateral = (apiCollateral: any[]): CollateralItem[] => {
    return apiCollateral.map((item) => {
      // Map API types to component types
      let componentType: CollateralType = 'text'; // default

      switch (item.type) {
        case 'image':
          componentType = 'image';
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
        content: item.content,
        format: item.format,
      };
    });
  };

  // Get display collateral from API only
  const getDisplayCollateral = (): CollateralItem[] => {
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
  };

  const displayCollateral = getDisplayCollateral();

  // Update selected item when collateral changes
  React.useEffect(() => {
    if (displayCollateral.length > 0 && !selectedItem) {
      setSelectedItem(displayCollateral[0]);
    }
  }, [displayCollateral, selectedItem]);

  // Handle item selection
  const handleItemSelect = (item: CollateralItem) => {
    setSelectedItem(item);
  };

  // Handle content copy
  const handleCopyContent = () => {
    if (selectedItem) {
      navigator.clipboard.writeText(selectedItem.content);
      toast.success(`${selectedItem.title} copied to clipboard`);
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

    toast.success(`${selectedItem.title} downloaded successfully`);
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

  // Get collateral count for display
  const getCollateralCount = (): number => {
    if (!collateral) return 0;

    if (Array.isArray(collateral)) {
      return collateral.length;
    }

    if (
      typeof collateral === 'object' &&
      collateral !== null &&
      'results' in collateral
    ) {
      const resultsArray = (collateral as any).results;
      if (Array.isArray(resultsArray)) {
        return resultsArray.length;
      }
    }

    return 0;
  };

  const collateralCount = getCollateralCount();

  return (
    <div className='flex h-full flex-col space-y-4'>
      {/* Header Section */}
      <div className='flex-shrink-0'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
          Test Collateral
          {!hasNoCollateral && (
            <span className='aucctus-text-brand-primary ml-2'>
              ({collateralCount} item{collateralCount !== 1 ? 's' : ''})
            </span>
          )}
        </h3>
      </div>

      {hasNoCollateral ? (
        // No data state
        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary flex flex-1 items-center justify-center rounded-lg border p-6'>
          <div className='flex flex-col items-center justify-center text-center'>
            <Icon
              variant='file-attachment'
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
        // Data available state
        <div className='flex min-h-0 flex-1 gap-6'>
          {/* Left column - Collateral Items List with fixed input at bottom */}
          <div className='flex h-full w-1/3 flex-col'>
            {/* Scrollable list */}
            <div className='min-h-0 flex-1 space-y-4 overflow-y-auto pr-1'>
              {displayCollateral.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'aucctus-border-secondary aucctus-bg-primary hover:aucctus-bg-secondary-subtle cursor-pointer rounded-lg border p-4 transition-colors',
                    selectedItem?.id === item.id &&
                      'aucctus-border-brand-primary aucctus-bg-secondary-extra-subtle',
                  )}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className='flex items-start gap-3'>
                    {item.type === 'text' ? (
                      <Icon
                        variant='file'
                        className='aucctus-stroke-tertiary h-5 w-5 shrink-0'
                      />
                    ) : item.type === 'image' ? (
                      <Icon
                        variant='filecode'
                        className='aucctus-stroke-tertiary h-5 w-5 shrink-0'
                      />
                    ) : (
                      <Icon
                        variant='file-attachment'
                        className='aucctus-stroke-tertiary h-5 w-5 shrink-0'
                      />
                    )}
                    <div className='min-w-0 flex-1'>
                      <h5 className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-1 truncate'>
                        {item.title}
                      </h5>
                      <p className='aucctus-text-xs-regular aucctus-text-secondary line-clamp-2'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed input at bottom */}
            <div className='aucctus-border-secondary aucctus-bg-secondary-subtle mt-4 flex-shrink-0 rounded-lg border p-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Icon
                    variant='plus'
                    className='aucctus-stroke-tertiary h-5 w-5'
                  />
                  <span className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                    Request Custom Collateral
                  </span>
                </div>
                <div className='aucctus-bg-disabled aucctus-border-disabled rounded border p-3 text-center'>
                  <p className='aucctus-text-sm-regular aucctus-text-disabled'>
                    Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Selected Content */}
          <div className='min-h-0 flex-1'>
            <div className='aucctus-border-secondary aucctus-bg-primary flex h-full flex-col overflow-hidden rounded-lg border'>
              {/* Header Section - Fixed at top */}
              <div className='aucctus-border-secondary aucctus-bg-secondary-subtle flex flex-shrink-0 items-center justify-between border-b px-4 py-3'>
                <div className='min-w-0 flex-1'>
                  <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary truncate'>
                    {selectedItem?.title || 'No item selected'}
                  </h4>
                  {selectedItem?.description && (
                    <p className='aucctus-text-sm-regular aucctus-text-secondary line-clamp-1'>
                      {selectedItem.description}
                    </p>
                  )}
                </div>
                {selectedItem && (
                  <div className='flex shrink-0 gap-2'>
                    {selectedItem.type === 'text' && (
                      <>
                        <button
                          className='btn btn-secondary btn-sm flex items-center gap-1'
                          onClick={handleCopyContent}
                        >
                          <Icon
                            variant='clipboard'
                            className='aucctus-stroke-secondary h-4 w-4'
                          />
                          Copy
                        </button>
                        <button
                          className='btn btn-secondary btn-sm flex items-center gap-1'
                          onClick={handleDownloadContent}
                        >
                          <Icon
                            variant='download'
                            className='aucctus-stroke-secondary h-4 w-4'
                          />
                          Download
                        </button>
                      </>
                    )}
                    {selectedItem.type === 'image' && (
                      <button
                        className='btn btn-secondary btn-sm flex items-center gap-1'
                        onClick={handleDownloadContent}
                      >
                        <Icon
                          variant='download'
                          className='aucctus-stroke-secondary h-4 w-4'
                        />
                        Download
                      </button>
                    )}
                  </div>
                )}
              </div>

              {selectedItem ? (
                <>
                  {/* Content Section - Scrollable */}
                  <div className='flex-1 overflow-y-auto'>
                    {selectedItem.type === 'text' ? (
                      <div className='aucctus-bg-secondary-subtle aucctus-text-primary overflow-y-auto rounded-md'>
                        <div className='prose prose-sm aucctus-text-primary max-w-none p-4'>
                          <ReactMarkdown>
                            {selectedItem.content.replace(/\\n/g, '\n')}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : selectedItem.type === 'image' ? (
                      <div className='flex h-full items-center justify-center'>
                        <img
                          src={selectedItem.content}
                          alt={selectedItem.title}
                          className='max-h-full max-w-full object-contain'
                        />
                      </div>
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
                          Preview not available for this file type
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section - Fixed at bottom */}
                  <div className='aucctus-border-secondary flex-shrink-0 border-t p-4'>
                    <div className='aucctus-border-secondary aucctus-bg-secondary-subtle rounded-lg border p-4'>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                          <Icon
                            variant='message-circle'
                            className='aucctus-stroke-tertiary h-5 w-5'
                          />
                          <span className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                            Provide Feedback
                          </span>
                        </div>
                        <div className='aucctus-bg-disabled aucctus-border-disabled rounded border p-3 text-center'>
                          <p className='aucctus-text-sm-regular aucctus-text-disabled'>
                            Coming Soon
                          </p>
                        </div>
                      </div>
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
    </div>
  );
};

export default TestCollateral;
