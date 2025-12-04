import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import animations from '@assets/animations';
import Avatar from '@components/Avatar';
import useStore from '@stores/store';

interface ErrorToastData {
  title: string;
  description: string;
  onRetry?: () => void;
}

interface ErrorToastProps extends Partial<ToastContentProps> {
  data?: ErrorToastData;
}

/**
 * ErrorToast Component
 * Displays an error toast with animated error icon and retry action
 */
const ErrorToast: React.FC<ErrorToastProps> = ({ data, closeToast }) => {
  const {
    title = 'Something Went Wrong',
    description = 'Please try again.',
    onRetry,
  } = data || {};
  const user = useStore((state) => state.auth.user);

  return (
    <div className='relative flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 border-l-red-500 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80'>
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
            className='h-8 min-h-8 w-8 min-w-8 flex-shrink-0 border-none !bg-red-100 [&_span]:!text-red-700'
          />
        )}

        {/* Title with error animation */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Lottie
              animationData={animations.error}
              loop={true}
              className='h-5 w-5 [&_path]:!fill-red-500'
            />
            <span className='aucctus-text-md-semibold aucctus-text-error-primary line-clamp-1'>
              {title}
            </span>
          </div>
          {/* Description */}
          <span className='aucctus-text-xs aucctus-text-secondary line-clamp-2'>
            {description}
          </span>
        </div>
      </div>

      {/* Retry button if provided */}
      {onRetry && (
        <button
          className='aucctus-border-error aucctus-text-error-primary hover:aucctus-bg-error-solid hover:aucctus-text-white h-8 rounded-md border bg-white/90 px-4 text-sm font-medium transition-colors'
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorToast;
