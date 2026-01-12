import { FunctionComponent, useState } from 'react';
import { Icon, toast } from '@components';
import { IPocMilestone, PocMilestoneStatus } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IMilestonesSectionProps {
  milestones: IPocMilestone[];
}

const STATUS_CONFIG: Record<
  PocMilestoneStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    dotColor: string;
    icon: IconVariant;
  }
> = {
  not_started: {
    label: 'Not Started',
    color: 'aucctus-text-tertiary',
    bgColor: 'aucctus-bg-tertiary',
    dotColor: 'bg-gray-300 dark:bg-gray-600',
    icon: 'circle',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-primary-600 dark:text-primary-400',
    bgColor: 'bg-primary-100 dark:bg-primary-900',
    dotColor: 'bg-primary-500',
    icon: 'loading-02',
  },
  completed: {
    label: 'Completed',
    color: 'text-success-600 dark:text-success-400',
    bgColor: 'bg-success-100 dark:bg-success-900',
    dotColor: 'bg-success-500',
    icon: 'check-circle-broken',
  },
  blocked: {
    label: 'Blocked',
    color: 'text-error-600 dark:text-error-400',
    bgColor: 'bg-error-100 dark:bg-error-900',
    dotColor: 'bg-error-500',
    icon: 'alert-circle',
  },
};

interface IMilestoneRowProps {
  milestone: IPocMilestone;
  status: PocMilestoneStatus;
  onStatusChange: (uuid: string, status: PocMilestoneStatus) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const MilestoneRow: FunctionComponent<IMilestoneRowProps> = ({
  milestone,
  status,
  onStatusChange,
  isExpanded,
  onToggleExpand,
}) => {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusConfig = STATUS_CONFIG[status];

  const handleStatusChange = (newStatus: PocMilestoneStatus): void => {
    onStatusChange(milestone.uuid, newStatus);
    setIsStatusMenuOpen(false);
  };

  return (
    <div
      className={cn(
        'group border-b last:border-b-0',
        'aucctus-border-secondary',
        'transition-all duration-300 ease-out',
      )}
    >
      {/* Main Row - Clickable */}
      <button
        onClick={onToggleExpand}
        className={cn(
          'flex w-full items-center gap-4 px-6 py-4',
          'transition-all duration-200',
          isExpanded ? 'aucctus-bg-secondary' : 'hover:aucctus-bg-secondary/50',
        )}
      >
        {/* Week Badge */}
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
            'transition-all duration-300',
            'shadow-sm',
            status === 'completed'
              ? 'bg-gradient-to-br from-success-500 to-success-600 shadow-success-500/25'
              : status === 'in_progress'
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/25'
                : status === 'blocked'
                  ? 'bg-gradient-to-br from-error-500 to-error-600 shadow-error-500/25'
                  : 'aucctus-bg-tertiary',
          )}
        >
          <div className='flex flex-col items-center'>
            <span
              className={cn(
                'text-[10px] font-medium uppercase',
                status === 'not_started'
                  ? 'aucctus-text-tertiary'
                  : 'text-white/70',
              )}
            >
              W
            </span>
            <span
              className={cn(
                'text-lg font-bold leading-none',
                status === 'not_started'
                  ? 'aucctus-text-secondary'
                  : 'text-white',
              )}
            >
              {milestone.weekNumber}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className='flex min-w-0 flex-1 flex-col gap-0.5 text-left'>
          <span className='aucctus-text-primary aucctus-text-md-semibold'>
            {milestone.title}
          </span>
          <span className='aucctus-text-tertiary aucctus-text-sm line-clamp-1'>
            {milestone.description}
          </span>
        </div>

        {/* Status Badge */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsStatusMenuOpen(!isStatusMenuOpen);
          }}
          className='relative'
        >
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5',
              statusConfig.bgColor,
              'transition-all duration-200',
              'cursor-pointer hover:opacity-80',
            )}
          >
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                statusConfig.dotColor,
                status === 'in_progress' && 'animate-pulse',
              )}
            />
            <span className={cn('text-xs font-semibold', statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>

          {/* Dropdown Menu */}
          {isStatusMenuOpen && (
            <>
              <div
                className='fixed inset-0 z-10'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStatusMenuOpen(false);
                }}
              />
              <div
                className={cn(
                  'absolute right-0 top-full z-20 mt-2',
                  'w-40 overflow-hidden rounded-lg',
                  'aucctus-bg-primary',
                  'aucctus-border-secondary border',
                  'shadow-xl',
                  'animate-fade-in',
                )}
              >
                {(Object.keys(STATUS_CONFIG) as PocMilestoneStatus[]).map(
                  (statusKey) => {
                    const config = STATUS_CONFIG[statusKey];
                    const isSelected = statusKey === status;
                    return (
                      <button
                        key={statusKey}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(statusKey);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2.5 px-4 py-2.5 text-left',
                          'transition-all duration-150',
                          isSelected
                            ? 'aucctus-bg-secondary'
                            : 'hover:aucctus-bg-secondary',
                        )}
                      >
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            config.dotColor,
                          )}
                        />
                        <span
                          className={cn('text-sm font-medium', config.color)}
                        >
                          {config.label}
                        </span>
                        {isSelected && (
                          <Icon
                            variant='check'
                            className='ml-auto h-4 w-4 stroke-primary-500'
                          />
                        )}
                      </button>
                    );
                  },
                )}
              </div>
            </>
          )}
        </div>

        {/* Deliverables Count */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5',
            'aucctus-bg-tertiary',
          )}
        >
          <Icon
            variant='clipboard'
            className='aucctus-stroke-tertiary h-3.5 w-3.5'
          />
          <span className='aucctus-text-secondary text-xs font-medium'>
            {milestone.deliverables.length}
          </span>
        </div>

        {/* Expand/Collapse Icon */}
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'aucctus-bg-tertiary',
            'transition-all duration-300 ease-out',
            'group-hover:aucctus-bg-secondary',
            isExpanded && 'rotate-180 bg-primary-100 dark:bg-primary-900',
          )}
        >
          <Icon
            variant='chevrondown'
            className={cn(
              'h-4 w-4 transition-colors duration-200',
              isExpanded
                ? 'stroke-primary-500'
                : 'aucctus-stroke-tertiary group-hover:aucctus-stroke-secondary',
            )}
          />
        </div>
      </button>

      {/* Expanded Details */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className='px-6 pb-5'>
          <div className='ml-16 flex flex-col gap-4'>
            {/* Description */}
            <p className='aucctus-text-secondary aucctus-text-sm leading-relaxed'>
              {milestone.description}
            </p>

            {/* Deliverables Grid */}
            {milestone.deliverables.length > 0 && (
              <div className='flex flex-col gap-3'>
                <span className='aucctus-text-tertiary text-xs font-semibold uppercase tracking-wider'>
                  Deliverables
                </span>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                  {milestone.deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3',
                        'aucctus-bg-primary',
                        'aucctus-border-secondary border',
                        'transition-all duration-200',
                        'hover:scale-[1.01] hover:shadow-sm',
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div
                        className={cn(
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md',
                          status === 'completed'
                            ? 'bg-success-100 dark:bg-success-900'
                            : 'aucctus-bg-tertiary',
                        )}
                      >
                        <Icon
                          variant={status === 'completed' ? 'check' : 'circle'}
                          className={cn(
                            'h-3.5 w-3.5',
                            status === 'completed'
                              ? 'stroke-success-500'
                              : 'aucctus-stroke-tertiary',
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'aucctus-text-sm',
                          status === 'completed'
                            ? 'aucctus-text-tertiary line-through'
                            : 'aucctus-text-primary',
                        )}
                      >
                        {deliverable}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MilestonesSection: FunctionComponent<IMilestonesSectionProps> = ({
  milestones,
}) => {
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  // Ephemeral state for milestone statuses (will be replaced with API)
  const [milestoneStatuses, setMilestoneStatuses] = useState<
    Record<string, PocMilestoneStatus>
  >(() => {
    const initial: Record<string, PocMilestoneStatus> = {};
    milestones.forEach((m) => {
      initial[m.uuid] = m.status;
    });
    return initial;
  });

  const handleStatusChange = (
    uuid: string,
    newStatus: PocMilestoneStatus,
  ): void => {
    setMilestoneStatuses((prev) => ({
      ...prev,
      [uuid]: newStatus,
    }));
    const statusLabel = STATUS_CONFIG[newStatus].label;
    toast.success(`Milestone updated to "${statusLabel}"`);
  };

  const toggleExpand = (uuid: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  const toggleAllExpanded = (): void => {
    if (isAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(milestones.map((m) => m.uuid)));
    }
    setIsAllExpanded(!isAllExpanded);
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
        'overflow-hidden',
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-5'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-gradient-to-br from-primary-500 to-primary-600',
              'shadow-lg shadow-primary-500/25',
            )}
          >
            <Icon variant='target' className='h-5 w-5 stroke-white' />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-md-semibold'>
              Milestone Plan
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              {milestones.length} milestones across{' '}
              {milestones.length > 0
                ? Math.max(...milestones.map((m) => m.weekNumber))
                : 0}{' '}
              weeks
            </span>
          </div>
        </div>

        {/* Modern Toggle Button */}
        <button
          onClick={toggleAllExpanded}
          className={cn(
            'group flex items-center gap-2 rounded-lg px-4 py-2.5',
            'aucctus-bg-secondary',
            'aucctus-border-secondary border',
            'transition-all duration-300 ease-out',
            'hover:scale-[1.02] hover:shadow-md',
            'active:scale-[0.98]',
          )}
        >
          <span className='aucctus-text-secondary aucctus-text-sm-medium'>
            {isAllExpanded ? 'Collapse' : 'Expand'}
          </span>
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-lg',
              'bg-gradient-to-br from-primary-500 to-primary-600',
              'transition-all duration-300 ease-out',
              'group-hover:shadow-md group-hover:shadow-primary-500/30',
              isAllExpanded && 'rotate-180',
            )}
          >
            <Icon
              variant='chevrondown'
              className='h-3.5 w-3.5 stroke-white stroke-[2.5]'
            />
          </div>
        </button>
      </div>

      {/* Milestone Cards */}
      <div className='flex flex-col'>
        {sortedMilestones.map((milestone) => (
          <MilestoneRow
            key={milestone.uuid}
            milestone={milestone}
            status={milestoneStatuses[milestone.uuid] || milestone.status}
            onStatusChange={handleStatusChange}
            isExpanded={expandedIds.has(milestone.uuid)}
            onToggleExpand={() => toggleExpand(milestone.uuid)}
          />
        ))}
      </div>
    </div>
  );
};

export default MilestonesSection;
