import { FunctionComponent, useMemo, useState } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Signal,
  Star,
  Newspaper,
  Clock,
  Lightbulb,
  Link,
  EyeOff,
  ExternalLink,
  FileText,
  Loader2,
  Zap,
} from 'lucide-react';
import { cn } from '@libs/utils/react';
import type {
  ISignal,
  IOpportunity,
  IIntelligenceItem,
  SignalStatus,
  ClusteredFeedItem,
} from '@libs/api/types';
import {
  buildClusteredFeed,
  filterClusteredFeed,
  searchClusteredFeed,
  countFeedItems,
  type FeedFilterType,
} from '../../utils';
import { OpportunityClusterCard } from '../cards';

import styles from '../../signal-scanning.module.scss';

// ============================================
// Standalone Signal Card (for signals not in clusters)
// ============================================

interface StandaloneSignalCardProps {
  signal: ISignal;
  onCreateConcept: (signalUuid: string) => void;
  onUpdateStatus: (signalUuid: string, status: SignalStatus) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
}

const StandaloneSignalCard: FunctionComponent<StandaloneSignalCardProps> = ({
  signal,
  onCreateConcept,
  onUpdateStatus,
  isCreating = false,
  isUpdating = false,
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

  const isDisabled = isCreating || isUpdating;

  // Collect all available sources
  const sources = signal.sources || [];
  const hasSources = sources.length > 0;

  return (
    <div
      className={cn(
        styles.signalCard,
        styles[signal.stance],
        'aucctus-bg-primary aucctus-border-primary group',
      )}
    >
      <div className='flex items-start gap-3'>
        <div className='aucctus-bg-secondary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg'>
          <Signal className='aucctus-text-brand-primary h-4 w-4' />
        </div>
        <div className='min-w-0 flex-1'>
          {/* Header badges */}
          <div className='mb-1.5 flex flex-wrap items-center gap-2'>
            <span
              className={cn('text-[10px] font-medium uppercase tracking-wide', {
                'aucctus-text-success-primary': signal.stance === 'bullish',
                'aucctus-text-error-primary': signal.stance === 'bearish',
                'aucctus-text-tertiary': signal.stance === 'neutral',
              })}
            >
              {signal.stance}
            </span>
            <span className='aucctus-text-tertiary text-[10px]'>·</span>
            <span className={cn(styles.badge, styles.theme, 'text-[10px]')}>
              {signal.theme.replace(/_/g, ' ')}
            </span>
            <span
              className={cn(
                styles.badge,
                styles[signal.trend],
                'flex items-center gap-1 text-[10px]',
              )}
            >
              <Zap className='h-2.5 w-2.5' />
              {signal.trend}
            </span>
            {/* Impact badge */}
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[10px] font-medium uppercase',
                {
                  'aucctus-bg-error-secondary aucctus-text-error-primary':
                    signal.impact === 'high',
                  'aucctus-bg-warning-secondary aucctus-text-warning-primary':
                    signal.impact === 'medium',
                  'aucctus-bg-secondary aucctus-text-tertiary':
                    signal.impact === 'low',
                },
              )}
            >
              {signal.impact} impact
            </span>
          </div>

          {/* Title */}
          <h4 className='aucctus-text-primary aucctus-text-md-medium group-hover:aucctus-text-brand-primary transition-colors'>
            {signal.title}
          </h4>

          {/* Description */}
          <p className='aucctus-text-secondary aucctus-text-sm mt-1 line-clamp-2'>
            {signal.description}
          </p>

          {/* Tags */}
          {signal.tags && signal.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {signal.tags.slice(0, 5).map((tag, idx) => (
                <span
                  key={idx}
                  className='aucctus-bg-brand-secondary aucctus-text-brand-primary rounded px-1.5 py-0.5 text-[10px]'
                >
                  {tag}
                </span>
              ))}
              {signal.tags.length > 5 && (
                <span className='aucctus-text-tertiary text-[10px]'>
                  +{signal.tags.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Related context */}
          {((signal.relatedCustomers && signal.relatedCustomers.length > 0) ||
            (signal.relatedCompetitors &&
              signal.relatedCompetitors.length > 0) ||
            (signal.relatedIndustries &&
              signal.relatedIndustries.length > 0)) && (
            <div className='mt-2 flex flex-wrap gap-2 text-[10px]'>
              {signal.relatedCustomers &&
                signal.relatedCustomers.length > 0 && (
                  <span className='aucctus-text-tertiary'>
                    <span className='font-medium'>Customers:</span>{' '}
                    {signal.relatedCustomers.slice(0, 2).join(', ')}
                    {signal.relatedCustomers.length > 2 && '...'}
                  </span>
                )}
              {signal.relatedCompetitors &&
                signal.relatedCompetitors.length > 0 && (
                  <span className='aucctus-text-tertiary'>
                    <span className='font-medium'>Competitors:</span>{' '}
                    {signal.relatedCompetitors.slice(0, 2).join(', ')}
                    {signal.relatedCompetitors.length > 2 && '...'}
                  </span>
                )}
              {signal.relatedIndustries &&
                signal.relatedIndustries.length > 0 && (
                  <span className='aucctus-text-tertiary'>
                    <span className='font-medium'>Industries:</span>{' '}
                    {signal.relatedIndustries.slice(0, 2).join(', ')}
                    {signal.relatedIndustries.length > 2 && '...'}
                  </span>
                )}
            </div>
          )}

          {/* Linked concept badge */}
          {signal.linkedConceptUuid && (
            <div className='mt-2'>
              <span className='aucctus-bg-success-secondary aucctus-text-success-primary inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium'>
                <Link className='h-2.5 w-2.5' />
                Linked to: {signal.linkedConceptTitle || 'Concept'}
              </span>
            </div>
          )}

          {/* Metadata row */}
          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <span className='aucctus-text-tertiary flex items-center gap-1 text-xs'>
              <Clock className='h-3 w-3' />
              {formatDate(signal.detectedAt)}
            </span>
            <span className='aucctus-text-tertiary text-xs'>
              {signal.confidence}% confidence
            </span>
            <span className='aucctus-text-tertiary text-xs'>
              {signal.relevanceScore}% relevance
            </span>
          </div>

          {/* Clickable Sources */}
          {hasSources && (
            <div className='mt-3 border-t border-gray-100 pt-3 dark:border-gray-800'>
              <span className='aucctus-text-tertiary mb-2 block text-[10px] font-medium uppercase tracking-wide'>
                Sources ({sources.length})
              </span>
              <div className='flex flex-wrap gap-2'>
                {sources.slice(0, 3).map((source) => (
                  <a
                    key={source.uuid}
                    href={source.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='aucctus-bg-secondary-hover aucctus-border-primary group/source inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-all'
                  >
                    <FileText className='aucctus-stroke-tertiary h-3 w-3 flex-shrink-0' />
                    <span className='aucctus-text-secondary group-hover/source:aucctus-text-brand-primary max-w-[150px] truncate text-xs'>
                      {source.title}
                    </span>
                    <ExternalLink className='aucctus-stroke-tertiary h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover/source:opacity-100' />
                  </a>
                ))}
                {sources.length > 3 && (
                  <span className='aucctus-text-tertiary self-center text-xs'>
                    +{sources.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800'>
        <button
          onClick={() => onCreateConcept(signal.uuid)}
          disabled={isDisabled}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all',
            {
              'aucctus-bg-primary-hover': !isDisabled,
              'cursor-not-allowed opacity-50': isDisabled,
            },
          )}
        >
          {isCreating ? (
            <Loader2 className='text-brand-500 h-3.5 w-3.5 animate-spin' />
          ) : (
            <Lightbulb className='text-brand-500 h-3.5 w-3.5' />
          )}
          <span className='aucctus-text-white text-xs font-medium'>
            Create Concept
          </span>
        </button>
        <button
          disabled={isDisabled}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all',
            {
              'aucctus-bg-primary-hover': !isDisabled,
              'cursor-not-allowed opacity-50': isDisabled,
            },
          )}
        >
          <Link className='aucctus-stroke-secondary h-3.5 w-3.5' />
          <span className='aucctus-text-secondary text-xs font-medium'>
            Attach
          </span>
        </button>
        <button
          onClick={() => onUpdateStatus(signal.uuid, 'ignored')}
          disabled={isDisabled}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all',
            {
              'aucctus-bg-primary-hover': !isDisabled,
              'cursor-not-allowed opacity-50': isDisabled,
            },
          )}
        >
          {isUpdating ? (
            <Loader2 className='aucctus-stroke-tertiary h-3.5 w-3.5 animate-spin' />
          ) : (
            <EyeOff className='aucctus-stroke-tertiary h-3.5 w-3.5' />
          )}
          <span className='aucctus-text-tertiary text-xs font-medium'>
            Ignore
          </span>
        </button>
      </div>
    </div>
  );
};

// ============================================
// Standalone Intelligence Card
// ============================================

interface StandaloneIntelligenceCardProps {
  item: IIntelligenceItem;
}

const StandaloneIntelligenceCard: FunctionComponent<
  StandaloneIntelligenceCardProps
> = ({ item }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className='aucctus-bg-primary aucctus-border-primary group rounded-xl border p-4 transition-all hover:shadow-sm'>
      <div className='flex items-start gap-3'>
        <div className='aucctus-bg-secondary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg'>
          <Newspaper className='aucctus-text-info-primary h-4 w-4' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='mb-1.5 flex flex-wrap items-center gap-2'>
            <span className='aucctus-text-info-primary text-[10px] font-medium uppercase tracking-wide'>
              Intelligence
            </span>
            <span className='aucctus-text-tertiary text-[10px]'>·</span>
            <span className={cn(styles.badge, styles.theme, 'text-[10px]')}>
              {String(item.category).replace(/_/g, ' ')}
            </span>
            <span className='aucctus-text-tertiary flex items-center gap-1 text-[10px]'>
              <Clock className='h-2.5 w-2.5' />
              {formatDate(item.publishedAt)}
            </span>
          </div>
          <h4 className='aucctus-text-primary aucctus-text-md-medium group-hover:aucctus-text-brand-primary transition-colors'>
            {item.title}
          </h4>
          <p className='aucctus-text-secondary aucctus-text-sm mt-1'>
            {item.summary}
          </p>

          <div className='mt-3 flex items-center justify-between'>
            {item.url ? (
              <a
                href={item.url}
                target='_blank'
                rel='noopener noreferrer'
                className='aucctus-text-brand-primary hover:aucctus-text-brand-secondary flex items-center gap-1 text-xs transition-colors'
              >
                <FileText className='h-3 w-3' />
                {item.source}
                <ExternalLink className='h-3 w-3' />
              </a>
            ) : (
              <span className='aucctus-text-tertiary flex items-center gap-1 text-xs'>
                <FileText className='h-3 w-3' />
                {item.source}
              </span>
            )}
            <span className='aucctus-text-tertiary text-xs'>
              {item.relevanceScore}% relevance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Feed Filter Tabs
// ============================================

interface FeedFilterTabsProps {
  selectedFilter: FeedFilterType;
  onSelectFilter: (filter: FeedFilterType) => void;
  counts: {
    all: number;
    opportunities: number;
    signals: number;
    intelligence: number;
  };
}

const FeedFilterTabs: FunctionComponent<FeedFilterTabsProps> = ({
  selectedFilter,
  onSelectFilter,
  counts,
}) => {
  const tabs: Array<{
    value: FeedFilterType;
    label: string;
    icon: typeof Star;
  }> = [
    { value: 'all', label: 'All', icon: Star },
    { value: 'opportunities', label: 'Opportunities', icon: Star },
    { value: 'signals', label: 'Signals', icon: Signal },
    { value: 'intelligence', label: 'Intelligence', icon: Newspaper },
  ];

  return (
    <div className='flex flex-wrap gap-2'>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onSelectFilter(tab.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
            {
              'aucctus-bg-brand-solid aucctus-text-white':
                selectedFilter === tab.value,
              'aucctus-bg-secondary aucctus-text-secondary aucctus-bg-primary-hover':
                selectedFilter !== tab.value,
            },
          )}
        >
          {tab.label}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
              {
                'bg-white/20 text-white': selectedFilter === tab.value,
                'aucctus-bg-tertiary aucctus-text-primary':
                  selectedFilter !== tab.value,
              },
            )}
          >
            {counts[tab.value]}
          </span>
        </button>
      ))}
    </div>
  );
};

// ============================================
// Clustered Feed Component
// ============================================

export interface ClusteredFeedProps {
  signals: ISignal[];
  opportunities: IOpportunity[];
  intelligence: IIntelligenceItem[];
  isLoading: boolean;
  onCreateConceptFromSignal: (signalUuid: string) => void;
  onCreateConceptFromOpportunity: (opportunityUuid: string) => void;
  onUpdateSignalStatus: (signalUuid: string, status: SignalStatus) => void;
  isCreatingFromSignal?: boolean;
  isCreatingFromOpportunity?: boolean;
  isUpdatingSignalStatus?: boolean;
}

const ClusteredFeed: FunctionComponent<ClusteredFeedProps> = ({
  signals,
  opportunities,
  intelligence,
  isLoading,
  onCreateConceptFromSignal,
  onCreateConceptFromOpportunity,
  onUpdateSignalStatus,
  isCreatingFromSignal = false,
  isCreatingFromOpportunity = false,
  isUpdatingSignalStatus = false,
}) => {
  const [filterType, setFilterType] = useState<FeedFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Build clustered feed
  const clusteredFeed = useMemo(() => {
    return buildClusteredFeed({
      signals,
      opportunities,
      intelligence,
      limit: 50,
      includeIntelligence: true,
    });
  }, [signals, opportunities, intelligence]);

  // Apply filters and search
  const filteredItems = useMemo(() => {
    let items = clusteredFeed.items;
    items = filterClusteredFeed(items, filterType);
    items = searchClusteredFeed(items, searchQuery);
    return items;
  }, [clusteredFeed.items, filterType, searchQuery]);

  // Count items for filter badges (before search filter)
  const filterCounts = useMemo(() => {
    const typeFiltered = filterClusteredFeed(clusteredFeed.items, 'all');
    return countFeedItems(searchClusteredFeed(typeFiltered, searchQuery));
  }, [clusteredFeed.items, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  // Render individual feed items
  const renderFeedItem = (item: ClusteredFeedItem) => {
    switch (item.type) {
      case 'opportunity_cluster':
        return (
          <OpportunityClusterCard
            key={`opp-${item.opportunity.uuid}`}
            cluster={item}
            onCreateConcept={onCreateConceptFromOpportunity}
            onCreateConceptFromSignal={onCreateConceptFromSignal}
            onUpdateSignalStatus={onUpdateSignalStatus}
            isCreating={isCreatingFromOpportunity}
          />
        );
      case 'standalone_signal':
        return (
          <StandaloneSignalCard
            key={`sig-${item.signal.uuid}`}
            signal={item.signal}
            onCreateConcept={onCreateConceptFromSignal}
            onUpdateStatus={onUpdateSignalStatus}
            isCreating={isCreatingFromSignal}
            isUpdating={isUpdatingSignalStatus}
          />
        );
      case 'standalone_intelligence':
        return (
          <StandaloneIntelligenceCard
            key={`intel-${item.intelligence.uuid}`}
            item={item.intelligence}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='h-6 w-24 animate-pulse rounded bg-gray-300' />
          <div className='h-4 w-16 animate-pulse rounded bg-gray-300' />
        </div>
        <div className='flex gap-2'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='h-8 w-20 animate-pulse rounded-lg bg-gray-300'
            />
          ))}
        </div>
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-40 w-full animate-pulse rounded-xl bg-gray-300'
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Section header with search */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <h2 className='aucctus-text-primary aucctus-text-lg-semibold'>
            Priority Feed
          </h2>
          <span className='aucctus-text-tertiary aucctus-text-xs'>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            {clusteredFeed.linkedSignalCount > 0 && (
              <span className='ml-1'>
                ({clusteredFeed.linkedSignalCount} signals in clusters)
              </span>
            )}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Search className='aucctus-stroke-tertiary absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <input
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='aucctus-bg-secondary aucctus-border-primary aucctus-text-primary w-56 rounded-lg border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>
          {(searchQuery || filterType !== 'all') && (
            <button
              onClick={clearFilters}
              className='aucctus-bg-primary-hover rounded-lg p-2 transition-all'
            >
              <X className='aucctus-stroke-tertiary h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <FeedFilterTabs
        selectedFilter={filterType}
        onSelectFilter={setFilterType}
        counts={filterCounts}
      />

      {/* Feed list */}
      {filteredItems.length === 0 ? (
        <div className='aucctus-bg-secondary rounded-xl p-8 text-center'>
          <p className='aucctus-text-tertiary text-sm'>
            No items found. Try adjusting your filters or refresh to scan for
            new signals.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filteredItems.slice(0, 15).map((item, index) => (
            <div
              key={`feed-${index}`}
              className='animate-fade-in'
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {renderFeedItem(item)}
            </div>
          ))}
        </div>
      )}

      {filteredItems.length > 15 && (
        <div className='flex justify-center pt-2'>
          <button className='aucctus-bg-primary-hover flex items-center gap-2 rounded-lg px-4 py-2 transition-all'>
            <span className='aucctus-text-brand-primary aucctus-text-sm-medium'>
              Load more ({filteredItems.length - 15} remaining)
            </span>
            <ArrowRight className='aucctus-text-brand-primary h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
};

export default ClusteredFeed;
