import React, { useEffect, useRef } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import telemetry from '@libs/telemetry';

export interface ITestResultProcessingState {
  isProcessing: boolean;
  stage: string | null;
  message: string;
  progress: number; // 0-100
  error: string | null;
  testResultUuid?: string;
  conceptUuid?: string;
  testUuid?: string;
  summary?: string;
  learnings: ITestLearningData[];
  keywords: string[];
}

export interface ITestLearningData {
  uuid: string;
  learning: string;
  impact: string;
}

interface TestResultProcessingStatusProps {
  processingState: ITestResultProcessingState;
  className?: string;
}

export const getStageDisplay = (stage: string): string => {
  const stageLabels: Record<string, string> = {
    extracting_text: 'Extracting Text',
    analyzing_content: 'Analyzing Content',
    generating_insights: 'Generating Insights',
    completed: 'Analysis Complete',
    error: 'Processing Failed',
  };
  return stageLabels[stage] || stage;
};

const getStageIcon = (stage: string): IconVariant => {
  const stageIcons: Record<string, IconVariant> = {
    extracting_text: 'clipboard',
    analyzing_content: 'message-circle',
    generating_insights: 'lightbulb',
    completed: 'check-circle-broken',
    error: 'alert-circle',
  };
  return stageIcons[stage] || 'refresh';
};

const TestResultProcessingStatus: React.FC<TestResultProcessingStatusProps> = ({
  processingState,
  className,
}) => {
  const prevStateRef = useRef(processingState);

  // Debug logging - only log when state actually changes
  useEffect(() => {
    const prevState = prevStateRef.current;
    const hasChanged =
      prevState.isProcessing !== processingState.isProcessing ||
      prevState.stage !== processingState.stage ||
      prevState.progress !== processingState.progress ||
      prevState.error !== processingState.error;

    if (hasChanged) {
      telemetry.log('[TestResultProcessingStatus] State:', {
        isProcessing: processingState.isProcessing,
        stage: processingState.stage,
        message: processingState.message,
        progress: processingState.progress,
        error: processingState.error,
        testResultUuid: processingState.testResultUuid,
      });
      prevStateRef.current = processingState;
    }
  }, [processingState]);

  if (
    !processingState.isProcessing &&
    !processingState.error &&
    !processingState.stage &&
    processingState.progress === 0
  ) {
    return null;
  }

  // Also hide if there's no testResultUuid and no active processing
  if (
    !processingState.testResultUuid &&
    !processingState.isProcessing &&
    processingState.stage !== 'completed'
  ) {
    return null;
  }

  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4',
        className,
      )}
    >
      {processingState.error ? (
        <div className='flex items-start gap-3'>
          <Icon
            variant='alert-circle'
            className='aucctus-stroke-error-primary mt-1 h-5 w-5 flex-shrink-0'
          />
          <div className='flex-1'>
            <div className='aucctus-text-md-semibold aucctus-text-error-primary mb-1'>
              Processing Failed
            </div>
            <p className='aucctus-text-sm-regular aucctus-text-secondary'>
              {processingState.error}
            </p>
          </div>
        </div>
      ) : (
        <div className='flex items-start gap-3'>
          <Icon
            variant={
              processingState.stage === 'completed'
                ? 'check-circle-broken'
                : getStageIcon(processingState.stage || '')
            }
            className={cn(
              'mt-1 h-5 w-5 flex-shrink-0',
              processingState.stage === 'completed'
                ? 'aucctus-stroke-success-primary'
                : 'aucctus-stroke-brand-primary animate-pulse',
            )}
          />
          <div className='flex-1'>
            <div className='aucctus-text-md-semibold aucctus-text-brand-primary mb-1'>
              {processingState.stage
                ? getStageDisplay(processingState.stage)
                : 'Processing...'}
            </div>
            <p className='aucctus-text-sm-regular aucctus-text-secondary mb-2'>
              {processingState.message}
            </p>

            {/* Progress Bar */}
            {processingState.isProcessing && processingState.progress > 0 && (
              <div className='mt-3'>
                <div className='aucctus-bg-tertiary h-2 w-full rounded-full'>
                  <div
                    className='aucctus-bg-success-primary h-2 rounded-full transition-all duration-500'
                    style={{ width: `${processingState.progress}%` }}
                  />
                </div>
                <p className='aucctus-text-xs-regular aucctus-text-tertiary mt-1'>
                  {processingState.progress}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultProcessingStatus;
