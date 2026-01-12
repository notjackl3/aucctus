import { FunctionComponent, useState } from 'react';
import {
  Star,
  ChevronDown,
  Lightbulb,
  Target,
  Layers,
  Clock,
  TrendingUp,
  Signal,
  Loader2,
  ExternalLink,
  FileText,
  Zap,
} from 'lucide-react';
import { cn } from '@libs/utils/react';
import type {
  IOpportunityCluster,
  ISignal,
  SignalStatus,
} from '@libs/api/types';

import styles from '../../signal-scanning.module.scss';

// ============================================
// Linked Signal Mini Card
// ============================================

interface LinkedSignalProps {
  signal: ISignal;
  onCreateConcept?: (signalUuid: string) => void;
  onUpdateStatus?: (signalUuid: string, status: SignalStatus) => void;
}

const LinkedSignalMiniCard: FunctionComponent<LinkedSignalProps> = ({
  signal,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sources = signal.sources || [];
  const hasSources = sources.length > 0;

  return (
    <div
      className={cn(
        styles.linkedSignalCard,
        styles[signal.stance],
        'aucctus-bg-primary aucctus-border-primary',
      )}
    >
      <div className={styles.linkedSignalHeader}>
        <div className={cn(styles.linkedSignalDot, styles[signal.stance])} />
        <div className={styles.linkedSignalContent}>
          <div className='mb-1 flex flex-wrap items-center gap-1.5'>
            <span
              className={cn('text-[9px] font-medium uppercase', {
                'aucctus-text-success-primary': signal.stance === 'bullish',
                'aucctus-text-error-primary': signal.stance === 'bearish',
                'aucctus-text-tertiary': signal.stance === 'neutral',
              })}
            >
              {signal.stance}
            </span>
            <span
              className={cn(
                'flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px]',
                {
                  'aucctus-bg-success-secondary aucctus-text-success-primary':
                    signal.trend === 'accelerating',
                  'aucctus-bg-warning-secondary aucctus-text-warning-primary':
                    signal.trend === 'stable',
                  'aucctus-bg-error-secondary aucctus-text-error-primary':
                    signal.trend === 'decelerating',
                },
              )}
            >
              <Zap className='h-2 w-2' />
              {signal.trend}
            </span>
            <span
              className={cn('rounded px-1 py-0.5 text-[9px] font-medium', {
                'aucctus-bg-error-secondary aucctus-text-error-primary':
                  signal.impact === 'high',
                'aucctus-bg-warning-secondary aucctus-text-warning-primary':
                  signal.impact === 'medium',
                'aucctus-bg-secondary aucctus-text-tertiary':
                  signal.impact === 'low',
              })}
            >
              {signal.impact}
            </span>
          </div>
          <h5 className={cn(styles.linkedSignalTitle, 'aucctus-text-primary')}>
            {signal.title}
          </h5>
          <p className='aucctus-text-tertiary mt-0.5 line-clamp-1 text-[11px]'>
            {signal.description}
          </p>
          <div
            className={cn(
              styles.linkedSignalMeta,
              'aucctus-text-tertiary mt-1.5',
            )}
          >
            <span className='flex items-center gap-1'>
              <Clock className='h-2.5 w-2.5' />
              {formatDate(signal.detectedAt)}
            </span>
            <span>{signal.theme.replace(/_/g, ' ')}</span>
            <span>{signal.confidence}% confidence</span>
            <span>{signal.relevanceScore}% relevance</span>
          </div>
          {/* Clickable sources */}
          {hasSources && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {sources.slice(0, 2).map((source) => (
                <a
                  key={source.uuid}
                  href={source.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='aucctus-bg-secondary-hover aucctus-border-primary group/source inline-flex items-center gap-1 rounded border px-1.5 py-0.5 transition-all'
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className='aucctus-stroke-tertiary h-2.5 w-2.5' />
                  <span className='aucctus-text-tertiary group-hover/source:aucctus-text-brand-primary max-w-[100px] truncate text-[10px]'>
                    {source.title}
                  </span>
                  <ExternalLink className='aucctus-stroke-tertiary h-2.5 w-2.5 opacity-0 transition-opacity group-hover/source:opacity-100' />
                </a>
              ))}
              {sources.length > 2 && (
                <span className='aucctus-text-tertiary self-center text-[10px]'>
                  +{sources.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// Opportunity Cluster Card
// ============================================

interface OpportunityClusterCardProps {
  cluster: IOpportunityCluster;
  onCreateConcept: (opportunityUuid: string) => void;
  onCreateConceptFromSignal?: (signalUuid: string) => void;
  onUpdateSignalStatus?: (signalUuid: string, status: SignalStatus) => void;
  isCreating?: boolean;
  /** Start expanded (default: false) */
  defaultExpanded?: boolean;
}

const OpportunityClusterCard: FunctionComponent<
  OpportunityClusterCardProps
> = ({
  cluster,
  onCreateConcept,
  onCreateConceptFromSignal,
  onUpdateSignalStatus,
  isCreating = false,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { opportunity, linkedSignals } = cluster;

  const formatEstimatedValue = (value: number | null): string => {
    if (value === null) return '--';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const hasLinkedSignals = linkedSignals.length > 0;

  // Count stances for quick visualization
  const stanceCounts = linkedSignals.reduce(
    (acc, s) => {
      acc[s.stance]++;
      return acc;
    },
    { bullish: 0, bearish: 0, neutral: 0 },
  );

  return (
    <div
      className={cn(
        styles.clusterCard,
        styles[opportunity.priority],
        'aucctus-bg-primary aucctus-border-primary',
      )}
    >
      {/* Opportunity Header */}
      <div className={styles.clusterHeader}>
        <div className='flex items-start gap-3'>
          <div className='aucctus-bg-secondary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg'>
            <Star className='aucctus-text-warning-primary h-4 w-4' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='mb-1.5 flex flex-wrap items-center gap-2'>
              <span className='aucctus-text-warning-primary text-[10px] font-medium uppercase tracking-wide'>
                Opportunity
              </span>
              <span className='aucctus-text-tertiary text-[10px]'>·</span>
              <span className={cn(styles.badge, styles.theme, 'text-[10px]')}>
                {String(opportunity.category).replace(/_/g, ' ')}
              </span>
              <span
                className={cn(styles.badge, 'text-[10px]', {
                  [styles.bullish]: opportunity.priority === 'high',
                  [styles.neutral]: opportunity.priority !== 'high',
                })}
              >
                {opportunity.priority} priority
              </span>
            </div>
            <h4 className='aucctus-text-primary aucctus-text-md-medium'>
              {opportunity.title}
            </h4>
            <p className='aucctus-text-secondary aucctus-text-sm mt-1 line-clamp-2'>
              {opportunity.description}
            </p>

            <div className='mt-3 flex flex-wrap items-center gap-4'>
              <span className='aucctus-text-tertiary flex items-center gap-1.5 text-xs'>
                <Target className='h-3 w-3' />
                {formatEstimatedValue(opportunity.estimatedValue)}
              </span>
              <span className='aucctus-text-tertiary flex items-center gap-1.5 text-xs'>
                <Layers className='h-3 w-3' />
                {opportunity.impact} impact / {opportunity.effort} effort
              </span>
              {hasLinkedSignals && (
                <span className='aucctus-text-tertiary flex items-center gap-1.5 text-xs'>
                  <Signal className='h-3 w-3' />
                  {linkedSignals.length} signal
                  {linkedSignals.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800'>
          <button
            onClick={() => onCreateConcept(opportunity.uuid)}
            disabled={isCreating}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all',
              {
                'aucctus-bg-primary-hover': !isCreating,
                'cursor-not-allowed opacity-50': isCreating,
              },
            )}
          >
            {isCreating ? (
              <Loader2 className='aucctus-text-white h-3.5 w-3.5 animate-spin' />
            ) : (
              <Lightbulb className='aucctus-text-white h-3.5 w-3.5' />
            )}
            <span className='aucctus-text-white text-xs font-medium'>
              Create Concept
            </span>
          </button>
          <button className='aucctus-bg-primary-hover flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all'>
            <TrendingUp className='aucctus-stroke-secondary h-3.5 w-3.5' />
            <span className='aucctus-text-secondary text-xs font-medium'>
              Track
            </span>
          </button>
        </div>
      </div>

      {/* Linked Signals Expander */}
      {hasLinkedSignals && (
        <>
          <div
            className={cn(styles.clusterExpander, 'aucctus-bg-secondary')}
            onClick={() => setIsExpanded(!isExpanded)}
            role='button'
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsExpanded(!isExpanded);
              }
            }}
          >
            <div className='flex items-center gap-3'>
              <span className='aucctus-text-secondary text-xs font-medium'>
                Based on {linkedSignals.length} signal
                {linkedSignals.length !== 1 ? 's' : ''}
              </span>
              {/* Stance mini indicators */}
              <div className='flex items-center gap-1.5'>
                {stanceCounts.bullish > 0 && (
                  <span className='flex items-center gap-0.5 text-[10px]'>
                    <span className='h-1.5 w-1.5 rounded-full bg-green-500' />
                    <span className='aucctus-text-success-primary'>
                      {stanceCounts.bullish}
                    </span>
                  </span>
                )}
                {stanceCounts.bearish > 0 && (
                  <span className='flex items-center gap-0.5 text-[10px]'>
                    <span className='h-1.5 w-1.5 rounded-full bg-red-500' />
                    <span className='aucctus-text-error-primary'>
                      {stanceCounts.bearish}
                    </span>
                  </span>
                )}
                {stanceCounts.neutral > 0 && (
                  <span className='flex items-center gap-0.5 text-[10px]'>
                    <span className='h-1.5 w-1.5 rounded-full bg-gray-400' />
                    <span className='aucctus-text-tertiary'>
                      {stanceCounts.neutral}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <ChevronDown
              className={cn(
                styles.expanderIcon,
                'aucctus-stroke-tertiary h-4 w-4',
                { [styles.expanded]: isExpanded },
              )}
            />
          </div>

          {/* Linked Signals List */}
          <div
            className={cn(styles.clusterSignals, {
              [styles.expanded]: isExpanded,
            })}
          >
            <div className={styles.clusterSignalsInner}>
              {linkedSignals.map((signal) => (
                <LinkedSignalMiniCard
                  key={signal.uuid}
                  signal={signal}
                  onCreateConcept={onCreateConceptFromSignal}
                  onUpdateStatus={onUpdateSignalStatus}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OpportunityClusterCard;
