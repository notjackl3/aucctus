import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';
import type { AgentStep } from '@stores/overseer/types';
import React, { useState } from 'react';
import { Check, ChevronRight, Loader2 } from 'lucide-react';

interface PersonaThinkingStepsProps {
  steps: AgentStep[];
}

const STEP_ICON_MAP: Record<NonNullable<AgentStep['icon']>, string> = {
  search: 'globe',
  scan: 'search-md',
  analyze: 'file-text',
  synthesize: 'sparkles',
};

const PersonaThinkingSteps: React.FC<PersonaThinkingStepsProps> = ({
  steps,
}) => {
  const [expanded, setExpanded] = useState(false);

  const activeStep =
    steps.find((s) => s.status === 'active') || steps[steps.length - 1];
  const completedCount = steps.filter((s) => s.status === 'done').length;
  const allDone = completedCount === steps.length;

  if (steps.length === 0) return null;

  return (
    <div className='aucctus-border-secondary overflow-hidden rounded-lg border'>
      {/* Collapsed summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className='aucctus-bg-primary-hover group flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors'
      >
        {!allDone ? (
          <Loader2
            size={12}
            className='aucctus-stroke-brand-primary shrink-0 animate-spin'
          />
        ) : (
          <Check size={12} className='shrink-0 stroke-emerald-500' />
        )}
        <span className='aucctus-text-secondary flex-1 text-[11px] font-light'>
          {!allDone ? activeStep?.label : `Completed ${completedCount} steps`}
        </span>
        <ChevronRight
          size={12}
          className={cn(
            'aucctus-stroke-tertiary transition-transform duration-200',
            expanded && 'rotate-90',
          )}
        />
      </button>

      {/* Expanded steps */}
      {expanded && (
        <div className='aucctus-border-secondary space-y-0.5 border-t px-3 py-1.5'>
          {steps.map((step) => {
            const iconVariant = STEP_ICON_MAP[step.icon || 'search'];
            return (
              <div key={step.id} className='flex items-start gap-2 py-1'>
                <div className='mt-0.5 shrink-0'>
                  {step.status === 'active' ? (
                    <Loader2
                      size={12}
                      className='aucctus-stroke-brand-primary animate-spin'
                    />
                  ) : step.status === 'done' ? (
                    <Check size={12} className='stroke-emerald-500' />
                  ) : (
                    <div className='aucctus-border-secondary h-3 w-3 rounded-full border' />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <div
                    className={cn(
                      'text-[11px] font-light',
                      step.status === 'active'
                        ? 'aucctus-text-primary'
                        : step.status === 'done'
                          ? 'aucctus-text-secondary'
                          : 'aucctus-text-tertiary',
                    )}
                  >
                    <DynamicIcon
                      variant={iconVariant as 'globe'}
                      width={12}
                      height={12}
                      className='-mt-0.5 mr-1 inline stroke-current'
                    />
                    {step.label}
                  </div>
                  {step.detail && (
                    <div className='aucctus-text-tertiary mt-0.5 truncate text-[10px]'>
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PersonaThinkingSteps;
