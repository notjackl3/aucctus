import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface AssumptionsHeaderProps {
  activeFilter?: 'tam' | 'sam' | 'som';
  isFilterActive: boolean;
  resetToDefaults: () => void;
  bodyClassName?: string;
}

const AssumptionsHeader: React.FC<AssumptionsHeaderProps> = ({
  activeFilter,
  isFilterActive,
  resetToDefaults,
  bodyClassName,
}) => {
  return (
    <div
      className={cn(
        'aucctus-bg-primary sticky top-0 z-10 flex items-center justify-between',
        bodyClassName,
      )}
    >
      <div>
        <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
          Assumptions
        </h3>
        <p className='aucctus-text-xs aucctus-text-tertiary'>
          {isFilterActive
            ? `Filtered by ${activeFilter?.toUpperCase()}`
            : 'Determined assumptions for the market size'}
        </p>
      </div>

      <button
        onClick={resetToDefaults}
        className='btn btn-light flex items-center gap-2 text-sm'
      >
        <Icon variant='refresh' className='aucctus-stroke-tertiary h-4 w-4' />
        Reset
      </button>
    </div>
  );
};

export default AssumptionsHeader;
