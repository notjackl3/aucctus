import { FunctionComponent, useEffect } from 'react';
import { usePocPlanStatus, useOnPocPlanReady } from '@hooks/query/pocPlan.hook';
import { cn } from '@libs/utils/react';
import { Check, Rocket } from 'lucide-react';

interface IPocGeneratingOverlayProps {
  conceptUuid: string;
  conceptTitle: string;
  onComplete?: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  analyzing: 'Analyzing concept data',
  generating_objectives: 'Generating strategic objectives',
  generating_milestones: 'Creating milestone plan',
  generating_resources: 'Estimating resources',
  generating_risks: 'Assessing risks',
  finalizing: 'Finalizing POC plan',
};

const PocGeneratingOverlay: FunctionComponent<IPocGeneratingOverlayProps> = ({
  conceptUuid,
  conceptTitle,
  onComplete,
}) => {
  const { stage, progress, message, isComplete } = usePocPlanStatus(
    conceptUuid,
    {
      enabled: true,
      enablePolling: true,
    },
  );
  const { refreshPocPlan } = useOnPocPlanReady(conceptUuid);

  useEffect(() => {
    if (isComplete) {
      refreshPocPlan();
      onComplete?.();
    }
  }, [isComplete, refreshPocPlan, onComplete]);

  const stageLabel = stage ? STAGE_LABELS[stage] || message : message;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-black/60 backdrop-blur-sm',
        'animate-fade-in',
      )}
    >
      <div
        className={cn(
          'aucctus-bg-primary',
          'flex max-w-lg flex-col items-center gap-8 p-12',
          'rounded-2xl shadow-2xl',
          'animate-slide-in-center',
        )}
      >
        {/* Animated Icon */}
        <div className='relative'>
          {/* Pulsing ring */}
          <div
            className={cn(
              'absolute inset-0 rounded-full',
              'bg-gradient-to-r from-primary-500 to-primary-600',
              'animate-ping opacity-30',
            )}
            style={{ animationDuration: '2s' }}
          />
          {/* Inner circle with icon */}
          <div
            className={cn(
              'relative flex h-24 w-24 items-center justify-center',
              'rounded-full',
              'bg-gradient-to-br from-primary-500 to-primary-700',
              'shadow-lg',
            )}
          >
            <Rocket className='h-12 w-12 animate-pulse stroke-white' />
          </div>
        </div>

        {/* Title */}
        <div className='flex flex-col items-center gap-2 text-center'>
          <h2 className='aucctus-text-primary aucctus-header-lg-semibold'>
            Generating POC Plan
          </h2>
          <p className='aucctus-text-secondary aucctus-text-md'>
            for <span className='font-medium'>{conceptTitle}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className='flex w-full flex-col gap-3'>
          <div className='aucctus-bg-secondary h-3 w-full overflow-hidden rounded-full'>
            <div
              className={cn(
                'h-full rounded-full',
                'bg-gradient-to-r from-primary-500 to-primary-600',
                'transition-all duration-500 ease-out',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className='flex items-center justify-between'>
            <span className='aucctus-text-secondary aucctus-text-sm'>
              {stageLabel}
            </span>
            <span className='aucctus-text-brand-primary aucctus-text-sm-semibold'>
              {progress}%
            </span>
          </div>
        </div>

        {/* Stage Steps */}
        <div className='flex w-full flex-col gap-2'>
          {Object.entries(STAGE_LABELS).map(([stageKey, label], index) => {
            const stageIndex = Object.keys(STAGE_LABELS).indexOf(stage || '');
            const currentIndex = index;
            const isComplete = currentIndex < stageIndex;
            const isCurrent = stage === stageKey;

            return (
              <div
                key={stageKey}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2',
                  'transition-all duration-300',
                  isCurrent && 'aucctus-bg-brand-secondary',
                  isComplete && 'opacity-60',
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full',
                    'transition-all duration-300',
                    isComplete && 'bg-success-500',
                    isCurrent && 'bg-primary-500',
                    !isComplete && !isCurrent && 'aucctus-bg-tertiary',
                  )}
                >
                  {isComplete ? (
                    <Check className='h-3 w-3 stroke-white stroke-2' />
                  ) : isCurrent ? (
                    <div className='h-2 w-2 animate-pulse rounded-full bg-white' />
                  ) : (
                    <span className='aucctus-text-tertiary text-xs'>
                      {index + 1}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'aucctus-text-sm',
                    isCurrent
                      ? 'aucctus-text-primary font-medium'
                      : 'aucctus-text-tertiary',
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Info text */}
        <p className='aucctus-text-tertiary aucctus-text-xs text-center'>
          This usually takes about 30-60 seconds. Please do not close this page.
        </p>
      </div>
    </div>
  );
};

export default PocGeneratingOverlay;
