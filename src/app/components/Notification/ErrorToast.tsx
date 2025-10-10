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
const ErrorToast: React.FC<ErrorToastProps> = ({ data }) => {
  const {
    title = 'Something Went Wrong',
    description = 'Please try again.',
    onRetry,
  } = data || {};

  return (
    <div className='flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 border-l-red-500 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80'>
      {/* Title with error animation */}
      <div className='mb-2 flex items-center gap-2'>
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
