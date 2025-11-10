import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import animations from '@assets/animations';
import AgentProgressBar from '@components/Progress/AgentProgressBar';

interface ProgressToastData {
  title: string;
  progress?: number;
  estimatedTime?: number;
  onCancel?: () => void;
  agentName?: string;
  conceptUuid?: string;
  message?: string;
  startTime?: number;
  overrideEstimatedSeconds?: number | null;
  fallbackEstimatedSeconds?: number | null;
  expectedItemCount?: number;
  completedItemCount?: number;
}

interface ProgressToastProps extends Partial<ToastContentProps> {
  data?: ProgressToastData;
}

/**
 * ProgressToast Component
 * Displays a toast notification with animated progress indicator and cancel action
 */
const ProgressToast: React.FC<ProgressToastProps> = ({ data }) => {
  const {
    title = 'Processing',
    estimatedTime = 5,
    progress: explicitProgress,
    onCancel,
    agentName,
    conceptUuid,
    message,
    startTime,
    overrideEstimatedSeconds,
    fallbackEstimatedSeconds,
    expectedItemCount,
    completedItemCount,
  } = data || {};

  const progress = explicitProgress ?? 0;

  const remainingTime = Math.ceil((estimatedTime * (100 - progress)) / 100);

  const hasAgentProgress = Boolean(agentName);

  return (
    <div className='flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 border-l-blue-500 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80'>
      {/* Title with animation */}
      <div className='mb-3 flex items-center gap-2'>
        <Lottie
          animationData={animations.hourglass}
          loop={true}
          className='h-5 w-5 [&_path]:!fill-[#120A0A]'
        />
        <span className='aucctus-text-md-semibold aucctus-text-primary'>
          {title}
        </span>
      </div>

      {/* Progress section */}
      <div className='space-y-3'>
        {hasAgentProgress ? (
          <div className='space-y-2'>
            <AgentProgressBar
              agentName={agentName || ''}
              conceptUuid={conceptUuid}
              progress={explicitProgress}
              overrideEstimatedSeconds={overrideEstimatedSeconds}
              fallbackEstimatedSeconds={fallbackEstimatedSeconds}
              expectedItemCount={expectedItemCount}
              completedItemCount={completedItemCount}
              message={message}
              showPercentage={false}
              showTimeRemaining
              size='md'
              theme='brand'
              startTime={startTime}
            />
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-secondary relative h-3 flex-1 overflow-hidden rounded'>
              <div
                className='h-full bg-[#120A0A] transition-all duration-300'
                style={{
                  width: `${progress}%`,
                  backgroundImage:
                    'linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.08) 75%, transparent 75%, transparent)',
                  backgroundSize: '1rem 1rem',
                }}
              />
            </div>
          </div>
        )}

        {/* Footer with remaining time and cancel action */}
        <div className='flex items-center justify-between gap-3'>
          {!hasAgentProgress && (
            <span className='aucctus-text-xs aucctus-text-secondary'>
              ~{remainingTime}s remaining
            </span>
          )}
          {onCancel && (
            <button
              className='aucctus-text-sm aucctus-border-error aucctus-text-error-primary aucctus-bg-error-subtle h-7 rounded-md border px-3 transition-colors hover:opacity-80'
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressToast;
