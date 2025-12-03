import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import animations from '@assets/animations';
import AgentProgressBar from '@components/Progress/AgentProgressBar';
import Avatar from '@components/Avatar';
import useStore from '@stores/store';
import {
  useConceptReportCancel,
  useConceptNotifyOnComplete,
  useConceptNotifyOnCompleteStatus,
} from '@hooks/query/concepts.hook';

interface ProgressToastData {
  title: string;
  conceptTitle?: string;
  progress?: number;
  estimatedTime?: number;
  onCancel?: () => void;
  agentName?: string;
  conceptUuid?: string;
  conceptIdentifier?: string;
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
const ProgressToast: React.FC<ProgressToastProps> = ({ data, closeToast }) => {
  const {
    title = 'Processing',
    conceptTitle,
    estimatedTime = 5,
    progress: explicitProgress,
    onCancel,
    agentName,
    conceptUuid,
    conceptIdentifier,
    message,
    startTime,
    overrideEstimatedSeconds,
    fallbackEstimatedSeconds,
    expectedItemCount,
    completedItemCount,
  } = data || {};

  const user = useStore((state) => state.auth.user);

  // Hooks for cancel and email notification
  const { mutate: cancelReport, isLoading: isCancelling } =
    useConceptReportCancel();
  const { mutate: scheduleNotification } = useConceptNotifyOnComplete();
  const { hasNotificationScheduled } =
    useConceptNotifyOnCompleteStatus(conceptUuid);

  const handleCancel = () => {
    if (conceptUuid && conceptIdentifier) {
      cancelReport({ conceptUuid, conceptIdentifier });
      closeToast?.();
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleEmail = () => {
    if (conceptUuid && !hasNotificationScheduled) {
      scheduleNotification(conceptUuid);
    }
  };

  const progress = explicitProgress ?? 0;

  const remainingTime = Math.ceil((estimatedTime * (100 - progress)) / 100);

  const hasAgentProgress = Boolean(agentName);

  return (
    <div className='relative flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 border-l-blue-500 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80'>
      {/* Close button */}
      <button
        onClick={closeToast}
        className='aucctus-stroke-secondary group absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-gray-200/50'
        aria-label='Close'
      >
        <span className='text-gray-400 group-hover:text-gray-600'>×</span>
      </button>

      {/* Header with avatar and title */}
      <div className='mb-3 flex items-center gap-3 pr-6'>
        {/* User Avatar */}
        {user && (
          <Avatar
            firstName={user.firstName || ''}
            lastName={user.lastName || ''}
            src={user.profileImage}
            className='h-8 min-h-8 w-8 min-w-8 flex-shrink-0 border-none !bg-blue-100 [&_span]:!text-blue-700'
          />
        )}

        {/* Title with hourglass animation */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Lottie
              animationData={animations.hourglass}
              loop={true}
              className='h-5 w-5 [&_path]:!fill-blue-500'
            />
            <span className='aucctus-text-primary aucctus-text-md line-clamp-1 font-semibold'>
              {title}
            </span>
          </div>
          {conceptTitle && (
            <span className='aucctus-text-xs aucctus-text-secondary line-clamp-1'>
              {conceptTitle}
            </span>
          )}
        </div>
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
              showPercentage
              showTimeRemaining
              size='md'
              theme='brand'
              startTime={startTime}
              onCancel={
                conceptUuid && conceptIdentifier && !isCancelling
                  ? handleCancel
                  : undefined
              }
              onEmail={conceptUuid ? handleEmail : undefined}
              isEmailScheduled={hasNotificationScheduled}
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
            <span className='aucctus-text-xs-medium aucctus-text-secondary min-w-[36px] text-right'>
              {Math.round(progress)}%
            </span>
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
