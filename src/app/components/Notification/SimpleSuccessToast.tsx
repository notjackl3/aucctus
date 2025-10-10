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
const SimpleSuccessToast: React.FC<SimpleSuccessToastProps> = ({ data }) => {
  const { title = 'Success', description } = data || {};

  return (
    <div className='flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 border-l-green-500 bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80'>
      {/* Title with confetti animation */}
      <div className='flex items-center gap-2'>
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
