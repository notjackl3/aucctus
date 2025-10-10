import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import { Icon } from '@components';
import animations from '@assets/animations';

interface CompletedToastData {
  title: string;
  description?: string;
  completedTime?: number;
  onViewNow?: () => void;
}

interface CompletedToastProps extends Partial<ToastContentProps> {
  data?: CompletedToastData;
}

/**
 * CompletedToast Component
 * Displays a success toast with confetti animation and completion details
 */
const CompletedToast: React.FC<CompletedToastProps> = ({ data }) => {
  const {
    title = 'Completed',
    description,
    completedTime,
    onViewNow,
  } = data || {};

  return (
    <div className='flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 border-l-green-500 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80'>
      {/* Title with confetti animation */}
      <div className='mb-3 flex items-center gap-2'>
        <Lottie
          animationData={animations.confetti}
          loop={true}
          className='h-5 w-5'
        />
        <span className='aucctus-text-md-semibold aucctus-text-primary'>
          {title}
        </span>
      </div>

      {/* Description if provided */}
      {description && (
        <p className='aucctus-text-sm aucctus-text-secondary mb-3'>
          {description}
        </p>
      )}

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
              <Icon
                variant='check'
                className='aucctus-stroke-white'
                height={12}
                width={12}
              />
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
