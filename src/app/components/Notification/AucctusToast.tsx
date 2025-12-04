import React from 'react';
import Icon from '../Icon';
import Avatar from '../Avatar';
import { ToastContentProps } from 'react-toastify';
import useStore from '@stores/store';

// Define possible status types
type ToastStatus = 'warning' | 'alert' | 'success';

interface CustomToastProps extends Partial<ToastContentProps> {
  data?: {
    primaryMessage: string;
    secondaryMessage?: string;
    status?: ToastStatus;
  };
}

const iconDefaultProps = {
  height: 20,
  width: 20,
};

const statusStyles: Record<
  ToastStatus,
  {
    iconVariant: IconVariant;
    iconColor: string;
    avatarBg: string;
    borderColor: string;
  }
> = {
  warning: {
    iconVariant: 'alert-circle',
    iconColor: 'stroke-yellow-500',
    avatarBg: '!bg-yellow-100 [&_span]:!text-yellow-700',
    borderColor: 'border-l-yellow-500',
  },
  alert: {
    iconVariant: 'alert-triangle',
    iconColor: 'stroke-red-600',
    avatarBg: '!bg-red-100 [&_span]:!text-red-700',
    borderColor: 'border-l-red-500',
  },
  success: {
    iconVariant: 'check-circle-broken',
    iconColor: 'stroke-green-600',
    avatarBg: '!bg-green-100 [&_span]:!text-green-700',
    borderColor: 'border-l-green-500',
  },
};

const AucctusToast: React.FC<CustomToastProps> = ({ closeToast, data }) => {
  const primaryMessage = data?.primaryMessage || 'An update occurred.';
  const secondaryMessage = data?.secondaryMessage;
  const status = data?.status || 'warning';
  const user = useStore((state) => state.auth.user);

  const { iconVariant, iconColor, avatarBg, borderColor } =
    statusStyles[status];

  return (
    <div
      className={`relative flex w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-l-4 ${borderColor} bg-white/80 p-4 shadow-lg backdrop-blur-md dark:bg-gray-900/80`}
    >
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
            className={`h-8 min-h-8 w-8 min-w-8 flex-shrink-0 border-none ${avatarBg}`}
          />
        )}

        {/* Title with icon */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <Icon
              variant={iconVariant}
              {...iconDefaultProps}
              className={iconColor}
            />
            <span className='aucctus-text-md-semibold aucctus-text-primary line-clamp-1'>
              {primaryMessage}
            </span>
          </div>
          {secondaryMessage && (
            <span className='aucctus-text-xs aucctus-text-secondary line-clamp-2'>
              {secondaryMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AucctusToast;
