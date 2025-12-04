import React from 'react';
import Lottie from 'lottie-react';
import { ToastContentProps } from 'react-toastify';
import animations from '@assets/animations';
import Avatar from '@components/Avatar';
import useStore from '@stores/store';

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
      <div className='flex items-center gap-3 pr-6'>
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
            <span className='aucctus-text-md-semibold aucctus-text-primary line-clamp-1'>
              {title}
            </span>
          </div>
          {/* Description if provided */}
          {description && (
            <span className='aucctus-text-xs aucctus-text-secondary line-clamp-1'>
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleSuccessToast;
