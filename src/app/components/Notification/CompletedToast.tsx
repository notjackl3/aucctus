import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import Avatar from '@components/Avatar';
import animations from '@assets/animations';
import useStore from '@stores/store';
import { Check } from 'lucide-react';

interface CompletedToastData {
  title: string;
  conceptTitle?: string;
  completedTime?: number;
  onViewNow?: () => void;
}

interface CompletedToastProps extends Partial<ToastContentProps> {
  data?: CompletedToastData;
}

/**
 * CompletedToast Component
 * Displays a success toast with confetti animation and completion details
 * Styled to match ProgressToast with Avatar and concept title
 */
const CompletedToast: React.FC<CompletedToastProps> = ({
  data,
  closeToast,
}) => {
  const {
    title = 'Completed',
    conceptTitle,
    completedTime,
    onViewNow,
  } = data || {};

  const user = useStore((state) => state.auth.user);

  return (
    <div className='relative flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 border-l-green-500 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80'>
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
            className='h-8 min-h-8 w-8 min-w-8 flex-shrink-0 border-none !bg-green-100 [&_span]:!text-green-700'
          />
        )}

        {/* Title with confetti animation */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Lottie
              animationData={animations.confetti}
              loop={true}
              className='h-5 w-5'
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

      {/* Completion status section */}
      <div className='space-y-3'>
        {/* Progress bar at 100% with checkmark */}
        <div className='flex items-center gap-3'>
          <div className='relative flex-1'>
            <div className='aucctus-bg-secondary h-3 overflow-hidden rounded'>
              <div
                className='h-full bg-green-600 transition-all duration-300'
                style={{
                  width: '100%',
                  backgroundImage:
                    'linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.08) 75%, transparent 75%, transparent)',
                  backgroundSize: '1rem 1rem',
                }}
              />
            </div>
            {/* Checkmark circle on the right */}
            <div className='aucctus-border-primary absolute -right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center rounded-full border-[3px] border-white bg-green-600'>
              <Check size={12} className='aucctus-stroke-white' />
            </div>
          </div>
          <span className='aucctus-text-xs-medium aucctus-text-secondary whitespace-nowrap text-right'>
            100%
          </span>
        </div>

        {/* Footer with completion time and action */}
        <div className='flex items-center justify-between'>
          {completedTime !== undefined && (
            <span className='aucctus-text-xs aucctus-text-secondary'>
              Completed in {completedTime}s
            </span>
          )}
          {!completedTime && <div />}
          {onViewNow && (
            <button
              className='btn btn-primary btn-sm h-7 border-0 px-3 text-white'
              onClick={onViewNow}
            >
              View Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedToast;
