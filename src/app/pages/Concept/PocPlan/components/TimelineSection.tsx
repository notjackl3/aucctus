import { FunctionComponent } from 'react';
import { ComponentTooltip } from '@components';
import { IPocTimelinePhase, IPocMilestone } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { Clock } from 'lucide-react';

// Milestone tooltip content component
const MilestoneTooltipContent: FunctionComponent<{
  milestone: IPocMilestone;
  phaseColor: string;
}> = ({ milestone, phaseColor }) => (
  <div
    className={cn(
      'aucctus-bg-primary rounded-lg px-4 py-3 shadow-xl',
      'aucctus-border-secondary border',
      'min-w-[200px] max-w-[280px]',
    )}
  >
    <div className='flex items-start gap-3'>
      <div
        className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white'
        style={{ backgroundColor: phaseColor }}
      >
        W{milestone.weekNumber}
      </div>
      <div className='flex flex-col gap-1'>
        <p className='aucctus-text-primary aucctus-text-sm-semibold'>
          {milestone.title}
        </p>
        <p className='aucctus-text-secondary aucctus-text-xs'>
          {milestone.description}
        </p>
        {milestone.deliverables.length > 0 && (
          <div className='aucctus-border-secondary mt-2 flex flex-col gap-1 border-t pt-2'>
            <span className='aucctus-text-tertiary aucctus-text-xs font-medium'>
              Deliverables:
            </span>
            <ul className='flex flex-col gap-0.5'>
              {milestone.deliverables.slice(0, 2).map((d, i) => (
                <li
                  key={i}
                  className='aucctus-text-secondary aucctus-text-xs flex items-center gap-1'
                >
                  <span className='h-1 w-1 flex-shrink-0 rounded-lg bg-current' />
                  <span className='line-clamp-1'>{d}</span>
                </li>
              ))}
              {milestone.deliverables.length > 2 && (
                <li className='aucctus-text-tertiary aucctus-text-xs'>
                  +{milestone.deliverables.length - 2} more
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
);

interface ITimelineSectionProps {
  phases: IPocTimelinePhase[];
  milestones: IPocMilestone[];
  totalWeeks: number;
  currentWeek?: number; // Optional: current week for "Today" indicator
}

const TimelineSection: FunctionComponent<ITimelineSectionProps> = ({
  phases,
  milestones,
  totalWeeks,
  currentWeek = 2, // Default to week 2 for demo (will be calculated from start date in production)
}) => {
  // Generate week numbers
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Calculate which weeks to display labels for (simplify for longer timelines)
  const getWeekLabelInterval = (): number => {
    if (totalWeeks <= 8) return 1;
    if (totalWeeks <= 12) return 2;
    return 4;
  };
  const labelInterval = getWeekLabelInterval();

  // Calculate "Today" position
  const todayPosition =
    currentWeek > 0 && currentWeek <= totalWeeks
      ? ((currentWeek - 0.5) / totalWeeks) * 100
      : null;

  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-xl p-8',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
      )}
    >
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
            <Clock className='aucctus-stroke-brand-primary h-5 w-5' />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-md-semibold'>
              POC Timeline
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              {totalWeeks}-week execution plan
            </span>
          </div>
        </div>

        {/* Current Week Badge */}
        {currentWeek > 0 && currentWeek <= totalWeeks && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2',
              'bg-gradient-to-r from-primary-500/10 to-primary-600/10',
              'border border-primary-200 dark:border-primary-800',
            )}
          >
            <div className='h-2 w-2 animate-pulse rounded-lg bg-primary-500' />
            <span className='aucctus-text-primary aucctus-text-sm-medium'>
              Week {currentWeek} of {totalWeeks}
            </span>
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      <div className='flex flex-col gap-4'>
        {/* Week Headers - simplified for longer timelines */}
        <div className='flex items-end gap-0'>
          <div className='w-28 flex-shrink-0' />
          <div className='relative flex flex-1 gap-0'>
            {weeks.map((week) => {
              const showLabel =
                week === 1 || week === totalWeeks || week % labelInterval === 0;
              return (
                <div key={week} className='flex-1 text-center'>
                  {showLabel && (
                    <span className='aucctus-text-tertiary aucctus-text-xs'>
                      W{week}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Bars */}
        <div className='relative flex flex-col gap-2'>
          {/* Today Indicator Line - spans all phases */}
          {todayPosition !== null && (
            <div
              className='pointer-events-none absolute bottom-0 top-0 z-10'
              style={{
                left: `calc(7rem + ${todayPosition}% * (100% - 7rem) / 100)`,
              }}
            >
              <div className='relative h-full'>
                <div className='absolute bottom-0 top-0 w-0.5 bg-primary-500' />
                <div
                  className={cn(
                    'absolute -top-6 left-1/2 -translate-x-1/2',
                    'rounded-md px-2 py-0.5',
                    'bg-primary-500 text-[10px] font-medium text-white',
                    'whitespace-nowrap',
                  )}
                >
                  Today
                </div>
              </div>
            </div>
          )}

          {phases.map((phase) => {
            const startPercent = ((phase.startWeek - 1) / totalWeeks) * 100;
            const widthPercent =
              ((phase.endWeek - phase.startWeek + 1) / totalWeeks) * 100;

            return (
              <div key={phase.uuid} className='flex items-center gap-0'>
                {/* Phase Label */}
                <div className='w-28 flex-shrink-0 pr-3'>
                  <span className='aucctus-text-primary aucctus-text-sm-medium'>
                    {phase.name}
                  </span>
                </div>

                {/* Timeline Bar */}
                <div className='aucctus-bg-secondary relative h-10 flex-1 overflow-hidden rounded-lg'>
                  <div
                    className='absolute bottom-0 top-0 flex items-center justify-center rounded-lg transition-all'
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: phase.color,
                    }}
                  >
                    <span className='truncate px-2 text-xs font-medium text-white'>
                      {phase.description}
                    </span>
                  </div>

                  {/* Milestone Markers */}
                  {milestones
                    .filter((m) => phase.milestoneIds.includes(m.uuid))
                    .map((milestone) => {
                      const milestonePosition =
                        ((milestone.weekNumber - 0.5) / totalWeeks) * 100;
                      return (
                        <div
                          key={milestone.uuid}
                          className='absolute top-1/2 -translate-y-1/2'
                          style={{ left: `${milestonePosition}%` }}
                        >
                          <ComponentTooltip
                            tip={
                              <MilestoneTooltipContent
                                milestone={milestone}
                                phaseColor={phase.color}
                              />
                            }
                            preferredPosition='above'
                          >
                            <div
                              className={cn(
                                'h-3 w-3 rounded-lg border-2 border-white',
                                'cursor-pointer shadow-sm',
                                'transition-transform hover:scale-125',
                              )}
                              style={{ backgroundColor: phase.color }}
                            />
                          </ComponentTooltip>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className='aucctus-border-secondary flex items-center gap-6 border-t pt-4'>
          <div className='flex items-center gap-2'>
            <div className='h-3 w-3 rounded-lg bg-primary-500' />
            <span className='aucctus-text-tertiary aucctus-text-xs'>
              Milestone
            </span>
          </div>
          <div className='flex items-center gap-4'>
            {phases.map((phase) => (
              <div key={phase.uuid} className='flex items-center gap-2'>
                <div
                  className='h-3 w-6 rounded'
                  style={{ backgroundColor: phase.color }}
                />
                <span className='aucctus-text-tertiary aucctus-text-xs'>
                  {phase.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSection;
