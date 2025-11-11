import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import animations from '@assets/animations';

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

      {/* Title with error animation */}
      <div className='mb-2 flex items-center gap-2 pr-6'>
        <Lottie
          animationData={animations.error}
          loop={true}
          className='h-5 w-5 [&_path]:!fill-red-500'
        />
        <span className='aucctus-text-md-semibold aucctus-text-error-primary'>
          {title}
        </span>
      </div>

      {/* Description */}
      <p className='aucctus-text-sm aucctus-text-secondary mb-3'>
        {description}
      </p>

      {/* Retry button if provided */}
      {onRetry && (
        <button
          className='aucctus-border-error aucctus-text-error-primary hover:aucctus-bg-error-solid hover:aucctus-text-white mt-2 h-8 rounded-md border bg-white/90 px-4 text-sm font-medium transition-colors'
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorToast;
