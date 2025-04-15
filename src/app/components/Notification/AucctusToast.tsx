import React from 'react';
import Icon from '../Icon';
import { ToastContentProps } from 'react-toastify';

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
  height: 24,
  width: 24,
};

const statusStyles: Record<
  ToastStatus,
  { iconVariant: IconVariant; iconColor: string }
> = {
  warning: {
    iconVariant: 'alert-circle',
    iconColor: 'stroke-yellow-500',
  },
  alert: {
    iconVariant: 'alert-triangle',
    iconColor: 'stroke-red-600',
  },
  success: {
    iconVariant: 'check-circle-broken',
    iconColor: 'stroke-green-600',
  },
};

const AucctusToast: React.FC<CustomToastProps> = ({ closeToast, data }) => {
  const primaryMessage = data?.primaryMessage || 'An update occurred.'; // Default primary message
  const secondaryMessage = data?.secondaryMessage;
  const status = data?.status || 'warning'; // Default to warning status

  const { iconVariant, iconColor } = statusStyles[status];

  return (
    <div className='aucctus-bg-primary aucctus-border-primary flex w-full min-w-[800px] overflow-hidden rounded-lg p-4'>
      <div className='flex flex-grow items-start justify-between gap-3'>
        <div className='flex flex-grow items-center gap-3'>
          <Icon
            variant={iconVariant}
            {...iconDefaultProps}
            className={iconColor}
          />
          <div className='flex flex-col pl-2'>
            <span className='aucctus-text-md-medium aucctus-text-primary'>
              {primaryMessage}
            </span>
            {secondaryMessage && (
              <span className='aucctus-text-sm aucctus-text-secondary mt-1'>
                {secondaryMessage}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={closeToast}
          className='aucctus-text-secondary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md p-1 transition-colors hover:bg-black/10'
          aria-label='Close notification'
        >
          <Icon variant='closeX' className='h-4 w-4 stroke-current' />
        </button>
      </div>
    </div>
  );
};

export default AucctusToast;
