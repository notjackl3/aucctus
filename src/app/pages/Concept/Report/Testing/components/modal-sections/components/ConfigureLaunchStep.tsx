import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface IConfigureLaunchStepProps {
  isReady: boolean;
  onExecute: () => void;
  isLoading?: boolean;
}

const ConfigureLaunchStep: React.FC<IConfigureLaunchStepProps> = ({
  isReady,
  onExecute,
  isLoading = false,
}) => {
  return (
    <div className='flex justify-center'>
      {/* Launch Button - Centered, prominent */}
      <button
        onClick={onExecute}
        disabled={!isReady || isLoading}
        className={cn(
          'btn btn-lg flex items-center justify-center gap-3 px-12 py-6 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl',
          isReady && !isLoading
            ? 'btn-primary'
            : 'aucctus-bg-secondary aucctus-text-secondary cursor-not-allowed opacity-50',
        )}
        aria-label={
          isReady
            ? 'Launch synthetic test'
            : 'Complete configuration to launch test'
        }
      >
        {isLoading ? (
          <>
            <Icon
              variant='loading-02'
              className='aucctus-stroke-white h-5 w-5 animate-spin'
            />
            Launching...
          </>
        ) : (
          <>
            <Icon
              variant='rocket'
              className={cn(
                'h-5 w-5',
                isReady ? 'aucctus-stroke-white' : 'aucctus-stroke-secondary',
              )}
            />
            Launch Test
          </>
        )}
      </button>
    </div>
  );
};

export default React.memo(ConfigureLaunchStep);
