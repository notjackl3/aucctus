import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import animations from '@assets/animations';

interface SimpleSuccessToastData {
  title: string;
  description?: string;
}

interface SimpleSuccessToastProps extends Partial<ToastContentProps> {
  data?: SimpleSuccessToastData;
}

/**
 * SimpleSuccessToast Component
 * Displays a simple success toast with confetti animation (no progress bar)
 * Perfect for instant completion notifications like "Version Restored"
 */
const SimpleSuccessToast: React.FC<SimpleSuccessToastProps> = ({
  data,
  closeToast,
}) => {
  const { title = 'Success', description } = data || {};

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

      {/* Title with confetti animation */}
      <div className='flex items-center gap-2 pr-6'>
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
        <p className='aucctus-text-sm aucctus-text-secondary mt-2'>
          {description}
        </p>
      )}
    </div>
  );
};

export default SimpleSuccessToast;
