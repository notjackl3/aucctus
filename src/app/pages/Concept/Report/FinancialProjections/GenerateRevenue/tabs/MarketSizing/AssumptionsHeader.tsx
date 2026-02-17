import React from 'react';
import { cn } from '@libs/utils/react';
import { RefreshCw } from 'lucide-react';

interface AssumptionsHeaderProps {
  resetToDefaults: () => void;
  bodyClassName?: string;
}

const AssumptionsHeader: React.FC<AssumptionsHeaderProps> = ({
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
      </div>

      <button
        onClick={resetToDefaults}
        className='btn btn-light flex items-center gap-2 text-sm'
      >
        <RefreshCw className='aucctus-stroke-tertiary h-4 w-4' />
        Reset
      </button>
    </div>
  );
};

export default AssumptionsHeader;
