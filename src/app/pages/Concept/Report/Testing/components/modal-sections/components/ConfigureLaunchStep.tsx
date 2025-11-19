import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';

interface IConfigureLaunchStepProps {
  isReady: boolean;
  onExecute: () => void;
  isLoading?: boolean;
  disabledReason?: string;
}

const ConfigureLaunchStep: React.FC<IConfigureLaunchStepProps> = ({
  isReady,
  onExecute,
  isLoading = false,
  disabledReason,
}) => {
  const isButtonDisabled = !isReady || isLoading || !!disabledReason;
  const ariaLabel = isButtonDisabled
    ? disabledReason || 'Complete configuration to launch test'
    : 'Launch synthetic test';

  const launchButton = (
    <button
      onClick={onExecute}
      disabled={isButtonDisabled}
      className={cn(
        'btn btn-lg flex items-center justify-center gap-3 px-12 py-6 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl',
        !isButtonDisabled
          ? 'btn-primary'
          : 'aucctus-bg-secondary aucctus-text-secondary cursor-not-allowed opacity-50',
      )}
      aria-label={ariaLabel}
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
              !isButtonDisabled
                ? 'aucctus-stroke-white'
                : 'aucctus-stroke-secondary',
            )}
          />
          Launch Test
        </>
      )}
    </button>
  );

  return (
    <div className='flex justify-center'>
      {/* Launch Button - Centered, prominent */}
      {disabledReason ? (
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary rounded border px-3 py-2 shadow-lg'>
              <p className='aucctus-text-primary aucctus-text-xs'>
                {disabledReason}
              </p>
            </div>
          }
        >
          <span className='inline-flex'>{launchButton}</span>
        </ComponentTooltip>
      ) : (
        launchButton
      )}
    </div>
  );
};

export default React.memo(ConfigureLaunchStep);
