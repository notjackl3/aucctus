import React, { useState } from 'react';
import { Loading } from '@components';
import { cn } from '@libs/utils/react';
import { ExpandCollapse } from '@hooks/animation/animation.hook';
import {
  useTestCollateralRequest,
  useCreateTestCollateral,
} from '@hooks/query/testing.hook';
import { AlertCircle, ArrowRight, Plus } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface RequestCustomCollateralProps {
  conceptUuid?: string;
  testUuid?: string;
  isDisabled?: boolean;
}

const RequestCustomCollateral: React.FC<RequestCustomCollateralProps> = ({
  conceptUuid,
  testUuid,
  isDisabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { processingState, clearProcessingState } = useCreateTestCollateral();

  const {
    customRequest,
    setCustomRequest,
    handleCustomRequest,
    handleKeyDown,
    isLoading: isSubmittingRequest,
  } = useTestCollateralRequest(conceptUuid || '', testUuid || '');

  // Local state for retry functionality (only for WebSocket processing errors)
  const [lastRequest, setLastRequest] = useState('');

  // Track the last submitted request for WebSocket retry purposes
  React.useEffect(() => {
    if (customRequest.trim()) {
      setLastRequest(customRequest.trim());
    }
  }, [customRequest]);

  // Handle retry for WebSocket processing errors only
  const handleRetry = () => {
    if (!lastRequest) return;
    setCustomRequest(lastRequest);
    handleCustomRequest();
  };

  // Check if we're currently processing
  const isProcessing = processingState.isProcessing;
  const isSubmittingOrProcessing = isSubmittingRequest || isProcessing;

  // Format stage name from snake_case to readable text
  const formatStageName = (stage: string): string => {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Collapse after successful completion
  React.useEffect(() => {
    if (processingState.stage === 'completed') {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        clearProcessingState();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [processingState.stage, clearProcessingState]);

  return (
    <div className='overflow-hidden rounded-lg border border-black'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isDisabled}
        className='aucctus-bg-secondary-hover flex w-full items-center justify-between p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50'
        type='button'
      >
        <div className='flex items-center gap-2'>
          <Plus className='aucctus-stroke-tertiary h-5 w-5' />
          <span className='aucctus-text-sm-semibold aucctus-text-tertiary'>
            Request Custom Collateral
          </span>
        </div>
        <DynamicIcon
          variant={isExpanded ? 'chevronup' : 'chevrondown'}
          className='aucctus-stroke-tertiary h-4 w-4'
        />
      </button>

      <ExpandCollapse
        isExpanded={isExpanded}
        withOpacity
        collapsedHeight={0}
        maxHeight={400}
        duration={0.3}
      >
        <div className='px-4 pb-4 pt-4'>
          <div className='flex gap-2'>
            {isSubmittingOrProcessing ? (
              <div className='aucctus-bg-secondary-subtle aucctus-border-secondary flex flex-1 flex-col gap-3 rounded border p-4'>
                <div className='flex items-center gap-2'>
                  <Loading isSmall />
                  <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
                    {isProcessing
                      ? 'Creating Collateral'
                      : 'Submitting Request'}
                  </span>
                </div>

                {isProcessing && (
                  <>
                    <div className='space-y-2'>
                      <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                        {processingState.message ||
                          'Processing your request...'}
                      </p>

                      {/* Progress Bar */}
                      <div className='aucctus-bg-secondary h-2 w-full rounded-full'>
                        <div
                          className='aucctus-bg-success-primary h-2 rounded-full transition-all duration-300'
                          style={{
                            width: `${processingState.progress}%`,
                          }}
                        />
                      </div>

                      {/* Progress Details */}
                      <div className='flex items-center justify-between'>
                        <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                          {processingState.stage &&
                            `Stage: ${formatStageName(processingState.stage)}`}
                        </span>
                        <span className='aucctus-text-xs-regular aucctus-text-tertiary'>
                          {processingState.progress}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : processingState.error ? (
              <div className='aucctus-bg-error-secondary aucctus-border-error flex flex-1 flex-col gap-3 rounded border p-4'>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='aucctus-stroke-error-primary h-5 w-5' />
                  <span className='aucctus-text-sm-semibold aucctus-text-error-primary'>
                    Processing Failed
                  </span>
                </div>

                <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                  {processingState.error}
                </p>

                {/* Action Buttons */}
                <div className='flex gap-2'>
                  <button
                    onClick={clearProcessingState}
                    className='btn btn-secondary btn-sm'
                  >
                    Close
                  </button>
                  <button
                    onClick={handleRetry}
                    className='btn btn-primary btn-sm'
                    disabled={!lastRequest.trim()}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  type='text'
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Describe the collateral you need'
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary placeholder:aucctus-text-placeholder focus:aucctus-border-brand-primary flex-1 rounded border px-3 py-2 text-sm focus:outline-none'
                  disabled={isSubmittingOrProcessing || isDisabled}
                />
                <button
                  onClick={handleCustomRequest}
                  disabled={
                    !customRequest.trim() ||
                    isSubmittingOrProcessing ||
                    isDisabled
                  }
                  className='btn btn-primary btn-sm flex items-center gap-1 disabled:opacity-50'
                >
                  {isSubmittingOrProcessing ? (
                    <Loading isSmall />
                  ) : (
                    <ArrowRight
                      className={cn(
                        'h-4 w-4',
                        !customRequest.trim()
                          ? 'stroke-gray-400'
                          : 'stroke-white',
                      )}
                    />
                  )}
                  {isSubmittingOrProcessing ? 'Sending...' : 'Send'}
                </button>
              </>
            )}
          </div>
        </div>
      </ExpandCollapse>
    </div>
  );
};

export default RequestCustomCollateral;
