import React from 'react';
import { cn } from '@libs/utils/react';
import { ProcessingStatus } from '@libs/api/types';

interface StatusIndicatorProps {
  status: ProcessingStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  return (
    <div className='relative'>
      <div
        className={cn('h-1.5 w-1.5 animate-pulse rounded-full', {
          'aucctus-bg-success-solid-alt': status === 'completed',
          'aucctus-bg-secondary':
            status === 'processing' || status === 'pending',
          'aucctus-bg-error-solid': status === 'failed',
        })}
      ></div>
      <div
        className={cn(
          'absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full opacity-75',
          {
            'aucctus-bg-success-solid-alt': status === 'completed',
            'aucctus-bg-secondary':
              status === 'processing' || status === 'pending',
            'aucctus-bg-error-solid': status === 'failed',
          },
        )}
      ></div>
    </div>
  );
};

interface StatusBadgeProps {
  status: ProcessingStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getStatusConfig = (status: ProcessingStatus) => {
    switch (status) {
      case 'completed':
        return {
          borderColor: 'aucctus-border-success',
          backgroundColor: 'aucctus-bg-success-subtle',
          text: 'Report Complete',
        };
      case 'processing':
        return {
          borderColor: 'border-white/20',
          backgroundColor: 'aucctus-bg-secondary',
          text: 'Processing Report',
        };
      case 'pending':
        return {
          borderColor: 'aucctus-border-warning',
          backgroundColor: 'aucctus-bg-warning-subtle',
          text: 'Report Pending',
        };
      case 'failed':
        return {
          borderColor: 'aucctus-border-error',
          backgroundColor: 'aucctus-bg-error-subtle',
          text: 'Report Failed',
        };
      default:
        return {
          borderColor: 'aucctus-border-secondary',
          backgroundColor: 'aucctus-bg-secondary-subtle',
          text: 'Unknown Status',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={cn('mb-4', className)}>
      <div
        className={cn(
          'relative inline-flex items-center gap-1.5 rounded-full border bg-opacity-10 px-3 py-1 shadow-lg backdrop-blur-md',
          config.borderColor,
          config.backgroundColor,
        )}
      >
        <StatusIndicator status={status} />
        <span className='aucctus-text-xs-medium tracking-wide text-white'>
          {config.text}
        </span>
      </div>
    </div>
  );
};

export default StatusBadge;
