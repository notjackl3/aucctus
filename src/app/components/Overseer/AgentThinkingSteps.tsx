import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { AgentStep } from '@stores/overseer/types';
import React, { useState } from 'react';

interface AgentThinkingStepsProps {
  steps: AgentStep[];
}

const STEP_ICON_MAP: Record<NonNullable<AgentStep['icon']>, string> = {
  search: 'globe',
  scan: 'search-md',
  analyze: 'file-text',
  synthesize: 'sparkles',
};

const AgentThinkingSteps: React.FC<AgentThinkingStepsProps> = ({ steps }) => {
  const [expanded, setExpanded] = useState(false);

  const activeStep =
    steps.find((s) => s.status === 'active') || steps[steps.length - 1];
  const completedCount = steps.filter((s) => s.status === 'done').length;
  const allDone = completedCount === steps.length;

  if (steps.length === 0) return null;

  return (
    <div className='overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl'>
      {/* Collapsed summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className='group flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-white/5'
      >
        {!allDone ? (
          <Icon
            variant='loading-02'
            width={12}
            height={12}
            className='shrink-0 animate-spin stroke-blue-400'
          />
        ) : (
          <Icon
            variant='check'
            width={12}
            height={12}
            className='shrink-0 stroke-emerald-400'
          />
        )}
        <span className='flex-1 text-[11px] font-light text-white/50'>
          {!allDone ? activeStep?.label : `Completed ${completedCount} steps`}
        </span>
        <Icon
          variant='chevron-right'
          width={12}
          height={12}
          className={cn(
            'stroke-white/25 transition-transform duration-200',
            expanded && 'rotate-90',
          )}
        />
      </button>

      {/* Expanded steps */}
      {expanded && (
        <div className='space-y-0.5 border-t border-white/[0.06] px-3 py-1.5'>
          {steps.map((step) => {
            const iconVariant = STEP_ICON_MAP[step.icon || 'search'];
            return (
              <div key={step.id} className='flex items-start gap-2 py-1'>
                <div className='mt-0.5 shrink-0'>
                  {step.status === 'active' ? (
                    <Icon
                      variant='loading-02'
                      width={12}
                      height={12}
                      className='animate-spin stroke-blue-400'
                    />
                  ) : step.status === 'done' ? (
                    <Icon
                      variant='check'
                      width={12}
                      height={12}
                      className='stroke-emerald-400'
                    />
                  ) : (
                    <div className='h-3 w-3 rounded-full border border-white/15' />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <div
                    className={cn(
                      'text-[11px] font-light',
                      step.status === 'active'
                        ? 'text-white/70'
                        : step.status === 'done'
                          ? 'text-white/50'
                          : 'text-white/25',
                    )}
                  >
                    <Icon
                      variant={iconVariant as 'globe'}
                      width={12}
                      height={12}
                      className='-mt-0.5 mr-1 inline stroke-current'
                    />
                    {step.label}
                  </div>
                  {step.detail && (
                    <div className='mt-0.5 truncate text-[10px] text-white/30'>
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

export default AgentThinkingSteps;
