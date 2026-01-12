import { FunctionComponent, useState, useMemo } from 'react';
import { cn } from '@libs/utils/react';
import {
  AlertTriangle,
  Sparkles,
  Eye,
  Clock,
  ChevronDown,
  ChevronRight,
  History,
  Star,
} from 'lucide-react';
import type {
  IStrategicInsight,
  InsightClassification,
} from '@libs/api/types/strategicForesight';

interface ActiveInsightsListProps {
  insights: IStrategicInsight[];
  selectedInsightUuid: string | null;
  onInsightSelect: (uuid: string) => void;
  filterClassification?: InsightClassification | 'all';
  maxItems?: number;
  className?: string;
  // Collapsible props
  collapsible?: boolean;
  defaultExpanded?: boolean;
  title?: string;
  // Inactive list styling
  isInactiveList?: boolean;
  // Toggle for showing inactive signals (only on active list)
  showInactiveToggle?: boolean;
  showInactiveSignals?: boolean;
  onToggleInactiveSignals?: () => void;
  inactiveCount?: number;
  // Group by priority (classification) for corporate innovation workflow
  groupByPriority?: boolean;
}

// Priority-based grouping for corporate innovation workflow
type PriorityGroup = 'threat' | 'opportunity' | 'watch';

interface PriorityGroupedInsights {
  threat: IStrategicInsight[];
  opportunity: IStrategicInsight[];
  watch: IStrategicInsight[];
}

const priorityGroupConfig: Record<
  PriorityGroup,
  {
    label: string;
    icon: typeof AlertTriangle;
    iconClass: string;
    labelClass: string;
  }
> = {
  threat: {
    label: 'Threats Requiring Action',
    icon: AlertTriangle,
    iconClass: 'aucctus-text-error-primary',
    labelClass: 'aucctus-text-error-primary',
  },
  opportunity: {
    label: 'Strategic Opportunities',
    icon: Sparkles,
    iconClass: 'aucctus-text-success-primary',
    labelClass: 'aucctus-text-success-primary',
  },
  watch: {
    label: 'Monitor',
    icon: Eye,
    iconClass: 'aucctus-text-warning-primary',
    labelClass: 'aucctus-text-warning-primary',
  },
};

const ClassificationDot: FunctionComponent<{
  classification: InsightClassification;
  size?: 'sm' | 'md';
  inactive?: boolean;
}> = ({ classification, size = 'sm', inactive = false }) => {
  const sizeClass = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5';

  if (inactive) {
    return (
      <span
        className={cn(
          'aucctus-bg-tertiary flex-shrink-0 rounded-full opacity-50',
          sizeClass,
        )}
      />
    );
  }

  return (
    <span
      className={cn('flex-shrink-0 rounded-full', sizeClass, {
        'aucctus-bg-error-solid': classification === 'threat',
        'aucctus-bg-success-solid': classification === 'opportunity',
        'aucctus-bg-warning-solid': classification === 'watch',
      })}
      style={{
        boxShadow:
          classification === 'threat'
            ? '0 0 6px rgba(239, 68, 68, 0.5)'
            : classification === 'opportunity'
              ? '0 0 6px rgba(16, 185, 129, 0.5)'
              : '0 0 6px rgba(245, 158, 11, 0.5)',
      }}
    />
  );
};

const ClassificationIcon: FunctionComponent<{
  classification: InsightClassification;
  className?: string;
  inactive?: boolean;
}> = ({ classification, className, inactive = false }) => {
  if (inactive) {
    return (
      <Eye
        className={cn(
          'aucctus-text-tertiary h-3.5 w-3.5 opacity-50',
          className,
        )}
      />
    );
  }
  if (classification === 'threat') {
    return (
      <AlertTriangle
        className={cn('aucctus-text-error-primary h-3.5 w-3.5', className)}
      />
    );
  }
  if (classification === 'opportunity') {
    return (
      <Sparkles
        className={cn('aucctus-text-success-primary h-3.5 w-3.5', className)}
      />
    );
  }
  return (
    <Eye
      className={cn('aucctus-text-warning-primary h-3.5 w-3.5', className)}
    />
  );
};

const ActiveInsightsList: FunctionComponent<ActiveInsightsListProps> = ({
  insights,
  selectedInsightUuid,
  onInsightSelect,
  filterClassification = 'all',
  maxItems = 8,
  className,
  collapsible = false,
  defaultExpanded = true,
  title = 'Active Signals',
  isInactiveList = false,
  showInactiveToggle = false,
  showInactiveSignals = false,
  onToggleInactiveSignals,
  inactiveCount = 0,
  groupByPriority = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter insights by classification
  const filteredInsights = useMemo(() => {
    return insights
      .filter(
        (i) =>
          filterClassification === 'all' ||
          i.classification === filterClassification,
      )
      .slice(0, maxItems);
  }, [insights, filterClassification, maxItems]);

  // Group insights by priority (classification) for corporate innovation workflow
  const groupedInsights = useMemo((): PriorityGroupedInsights => {
    if (!groupByPriority) {
      return { threat: filteredInsights, opportunity: [], watch: [] };
    }

    const groups: PriorityGroupedInsights = {
      threat: [],
      opportunity: [],
      watch: [],
    };
    filteredInsights.forEach((insight) => {
      groups[insight.classification].push(insight);
    });
    return groups;
  }, [filteredInsights, groupByPriority]);

  const headerContent = (
    <div className='flex w-full items-center justify-between'>
      <div className='flex items-center gap-2'>
        {collapsible &&
          (isExpanded ? (
            <ChevronDown className='aucctus-text-tertiary h-4 w-4' />
          ) : (
            <ChevronRight className='aucctus-text-tertiary h-4 w-4' />
          ))}
        {isInactiveList && (
          <History className='aucctus-text-tertiary h-3.5 w-3.5' />
        )}
        <h3 className='aucctus-text-secondary text-xs font-medium uppercase tracking-wide'>
          {title} ({filteredInsights.length})
        </h3>
      </div>

      {/* Toggle for showing inactive signals */}
      {showInactiveToggle && inactiveCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleInactiveSignals?.();
          }}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors',
            showInactiveSignals
              ? 'aucctus-bg-brand-primary aucctus-text-brand-primary'
              : 'aucctus-text-tertiary aucctus-bg-tertiary-hover',
          )}
        >
          <History className='h-3 w-3' />
          {showInactiveSignals ? 'Hide' : 'Show'} older ({inactiveCount})
        </button>
      )}
    </div>
  );

  if (filteredInsights.length === 0) {
    return (
      <div className={cn('aucctus-bg-primary rounded-lg p-4', className)}>
        {collapsible ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='w-full text-left'
          >
            {headerContent}
          </button>
        ) : (
          headerContent
        )}
        {isExpanded && (
          <p className='aucctus-text-tertiary mt-3 text-sm italic'>
            {isInactiveList
              ? 'No older signals match the current filter.'
              : 'No active signals match the current filter.'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('aucctus-bg-primary rounded-lg p-4', className)}>
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='mb-3 w-full text-left'
        >
          {headerContent}
        </button>
      ) : (
        <div className='mb-3'>{headerContent}</div>
      )}

      {isExpanded && (
        <div className='space-y-4'>
          {groupByPriority ? (
            // Render grouped by priority (classification) for corporate innovation workflow
            (['threat', 'opportunity', 'watch'] as PriorityGroup[]).map(
              (priorityGroup) => {
                const groupInsights = groupedInsights[priorityGroup];
                if (groupInsights.length === 0) return null;

                const {
                  label,
                  icon: GroupIcon,
                  iconClass,
                  labelClass,
                } = priorityGroupConfig[priorityGroup];

                return (
                  <div key={priorityGroup}>
                    <div className='mb-2 flex items-center gap-2'>
                      <GroupIcon className={cn('h-3.5 w-3.5', iconClass)} />
                      <span
                        className={cn(
                          'text-[11px] font-medium uppercase tracking-wide',
                          labelClass,
                        )}
                      >
                        {label} ({groupInsights.length})
                      </span>
                    </div>
                    <div className='space-y-1'>
                      {groupInsights.map((insight: IStrategicInsight) => {
                        const isSelected = selectedInsightUuid === insight.uuid;

                        return (
                          <button
                            key={insight.uuid}
                            onClick={() => onInsightSelect(insight.uuid)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                              'group',
                              isSelected
                                ? 'aucctus-bg-brand-primary aucctus-border-brand ring-1'
                                : 'aucctus-bg-secondary-hover',
                              isInactiveList && 'opacity-60',
                            )}
                          >
                            <ClassificationDot
                              classification={insight.classification}
                              inactive={isInactiveList}
                            />

                            <div className='min-w-0 flex-1'>
                              <div className='flex items-center gap-1.5'>
                                {insight.isTracked && (
                                  <Star className='aucctus-text-warning-primary h-3 w-3 flex-shrink-0 fill-current' />
                                )}
                                <p
                                  className={cn(
                                    'truncate text-sm font-medium transition-colors',
                                    isSelected
                                      ? 'aucctus-text-brand-primary'
                                      : isInactiveList
                                        ? 'aucctus-text-tertiary'
                                        : 'aucctus-text-primary',
                                  )}
                                >
                                  {insight.headline}
                                </p>
                              </div>
                              <div className='mt-0.5 flex items-center gap-2'>
                                <span className='aucctus-text-tertiary flex items-center gap-1 text-[10px]'>
                                  <Clock className='h-2.5 w-2.5' />
                                  {insight.timeHorizonLabel}
                                </span>
                                {isInactiveList &&
                                  insight.status !== 'active' && (
                                    <>
                                      <span className='aucctus-text-tertiary text-[10px]'>
                                        ·
                                      </span>
                                      <span className='aucctus-text-quaternary text-[10px] capitalize'>
                                        {insight.status}
                                      </span>
                                    </>
                                  )}
                              </div>
                            </div>

                            <ClassificationIcon
                              classification={insight.classification}
                              inactive={isInactiveList}
                              className={cn(
                                'flex-shrink-0 opacity-0 transition-opacity',
                                isSelected
                                  ? 'opacity-100'
                                  : 'group-hover:opacity-60',
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )
          ) : (
            // Render flat list
            <div className='space-y-1'>
              {filteredInsights.map((insight) => {
                const isSelected = selectedInsightUuid === insight.uuid;

                return (
                  <button
                    key={insight.uuid}
                    onClick={() => onInsightSelect(insight.uuid)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                      'group',
                      isSelected
                        ? 'aucctus-bg-brand-primary aucctus-border-brand ring-1'
                        : 'aucctus-bg-secondary-hover',
                      isInactiveList && 'opacity-60',
                    )}
                  >
                    <ClassificationDot
                      classification={insight.classification}
                      inactive={isInactiveList}
                    />

                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-1.5'>
                        {insight.isTracked && (
                          <Star className='aucctus-text-warning-primary h-3 w-3 flex-shrink-0 fill-current' />
                        )}
                        <p
                          className={cn(
                            'truncate text-sm font-medium transition-colors',
                            isSelected
                              ? 'aucctus-text-brand-primary'
                              : isInactiveList
                                ? 'aucctus-text-tertiary'
                                : 'aucctus-text-primary',
                          )}
                        >
                          {insight.headline}
                        </p>
                      </div>
                      <div className='mt-0.5 flex items-center gap-2'>
                        <span className='aucctus-text-tertiary text-[10px] capitalize'>
                          {insight.classification}
                        </span>
                        <span className='aucctus-text-tertiary text-[10px]'>
                          ·
                        </span>
                        <span className='aucctus-text-tertiary flex items-center gap-1 text-[10px]'>
                          <Clock className='h-2.5 w-2.5' />
                          {insight.timeHorizonLabel}
                        </span>
                        {isInactiveList && insight.status !== 'active' && (
                          <>
                            <span className='aucctus-text-tertiary text-[10px]'>
                              ·
                            </span>
                            <span className='aucctus-text-quaternary text-[10px] capitalize'>
                              {insight.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <ClassificationIcon
                      classification={insight.classification}
                      inactive={isInactiveList}
                      className={cn(
                        'flex-shrink-0 opacity-0 transition-opacity',
                        isSelected ? 'opacity-100' : 'group-hover:opacity-60',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveInsightsList;
