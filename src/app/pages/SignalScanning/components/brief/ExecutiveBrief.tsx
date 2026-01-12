import { FunctionComponent } from 'react';
import { Icon } from '@components';
import type { IExecutiveBrief } from '@libs/api/types/strategicForesight';

interface ExecutiveBriefProps {
  brief: IExecutiveBrief | null;
  isLoading: boolean;
  onInsightClick?: (uuid: string) => void;
}

const ExecutiveBrief: FunctionComponent<ExecutiveBriefProps> = ({
  brief,
  isLoading,
}) => {
  // Loading skeleton with compact proportions
  if (isLoading) {
    return (
      <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-5 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
        <div className='mb-2 flex animate-pulse items-center gap-2'>
          <div className='aucctus-bg-tertiary h-4 w-4 rounded' />
          <div className='aucctus-bg-tertiary h-3 w-28 rounded' />
        </div>
        <div className='animate-pulse space-y-2'>
          <div className='aucctus-bg-tertiary h-4 w-full rounded' />
          <div className='aucctus-bg-tertiary h-4 w-11/12 rounded' />
          <div className='aucctus-bg-tertiary h-4 w-4/5 rounded' />
        </div>
      </div>
    );
  }

  // Empty state
  if (!brief) {
    return (
      <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-5 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
        <div className='mb-2 flex items-center gap-2'>
          <Icon
            variant='lightbulb'
            className='aucctus-stroke-secondary flex-shrink-0'
            height={16}
            width={16}
          />
          <h3 className='aucctus-text-secondary aucctus-text-xs font-semibold uppercase tracking-wider'>
            Executive Brief
          </h3>
        </div>
        <p className='aucctus-text-tertiary aucctus-text-sm italic leading-relaxed'>
          No executive brief available. Click Refresh to scan for signals and
          generate insights.
        </p>
      </div>
    );
  }

  // Normal state - matching ExecutiveSummaryBanner style with better proportions
  return (
    <div className='aucctus-bg-primary w-full rounded-lg border-b border-l-4 border-r border-t border-gray-light-200 border-l-primary-500 px-5 py-4 shadow-sm dark:border-gray-light-800 dark:border-l-primary-400'>
      <div className='mb-2 flex items-center gap-2'>
        <Icon
          variant='lightbulb'
          className='aucctus-stroke-secondary flex-shrink-0'
          height={16}
          width={16}
        />
        <h3 className='aucctus-text-secondary aucctus-text-xs font-semibold uppercase tracking-wider'>
          Executive Brief
        </h3>
      </div>
      <p className='aucctus-text-primary aucctus-text-md leading-relaxed'>
        {brief.narrative}
      </p>
    </div>
  );
};

export default ExecutiveBrief;
