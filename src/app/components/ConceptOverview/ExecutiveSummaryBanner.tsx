import React from 'react';
import { Icon } from '@components';

interface ExecutiveSummaryBannerProps {
  summary?: string;
  isLoading?: boolean;
}

const ExecutiveSummaryBanner: React.FC<ExecutiveSummaryBannerProps> = ({
  summary,
  isLoading = false,
}) => {
  // Don't render if no summary and not loading
  if (!summary && !isLoading) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
        <div className='flex items-start gap-3'>
          <Icon
            variant='lightbulb'
            className='aucctus-stroke-tertiary mt-1 flex-shrink-0'
            height={20}
            width={20}
          />
          <div className='min-w-0 flex-1'>
            <h3 className='aucctus-text-tertiary aucctus-text-sm mb-3 font-medium uppercase tracking-wider'>
              EXECUTIVE SUMMARY
            </h3>
            <div className='aucctus-bg-secondary h-12 animate-pulse rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-6 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
      <div className='mb-3 flex items-center gap-3'>
        <Icon
          variant='lightbulb'
          className='aucctus-stroke-tertiary flex-shrink-0'
          height={20}
          width={20}
        />
        <h3 className='aucctus-text-tertiary aucctus-text-sm font-medium uppercase tracking-wider'>
          EXECUTIVE SUMMARY
        </h3>
      </div>
      <p className='aucctus-text-primary aucctus-text-xl-semibold leading-relaxed'>
        {summary}
      </p>
    </div>
  );
};

export default React.memo(ExecutiveSummaryBanner);
