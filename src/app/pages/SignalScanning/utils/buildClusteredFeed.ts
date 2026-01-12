/**
 * Builds a priority-sorted clustered feed from signals, opportunities, and intelligence.
 *
 * Feed Structure:
 * - Opportunities are the primary unit with linked signals nested beneath
 * - Standalone signals (not linked to any opportunity) appear as individual items
 * - Intelligence items appear standalone, sorted by relevance
 *
 * Priority Scoring:
 * - Opportunities: Use existing priorityScore (0-100)
 * - Signals: (impact weight * 40) + (confidence * 0.3) + (recency bonus up to 30)
 * - Intelligence: relevanceScore (0-100)
 */

import type {
  ISignal,
  IOpportunity,
  IIntelligenceItem,
  ClusteredFeedItem,
  IOpportunityCluster,
  IStandaloneSignal,
  IStandaloneIntelligence,
} from '@libs/api/types';

// ============================================
// Priority Scoring
// ============================================

const IMPACT_WEIGHTS: Record<string, number> = {
  high: 40,
  medium: 25,
  low: 10,
};

/**
 * Calculate recency bonus (0-30 points)
 * Items from last 24h get max bonus, decaying over 7 days
 */
const calculateRecencyBonus = (dateString: string): number => {
  const itemDate = new Date(dateString).getTime();
  const now = Date.now();
  const hoursSinceDetection = (now - itemDate) / (1000 * 60 * 60);

  if (hoursSinceDetection <= 24) return 30;
  if (hoursSinceDetection <= 48) return 25;
  if (hoursSinceDetection <= 72) return 20;
  if (hoursSinceDetection <= 168) return 10; // 7 days
  return 0;
};

/**
 * Calculate priority score for a standalone signal
 */
const calculateSignalPriority = (signal: ISignal): number => {
  const impactScore = IMPACT_WEIGHTS[signal.impact] || 10;
  const confidenceScore = signal.confidence * 0.3;
  const recencyBonus = calculateRecencyBonus(signal.detectedAt);

  return Math.min(100, impactScore + confidenceScore + recencyBonus);
};

/**
 * Calculate priority score for intelligence item
 */
const calculateIntelligencePriority = (item: IIntelligenceItem): number => {
  const recencyBonus = calculateRecencyBonus(item.publishedAt) * 0.3;
  return Math.min(100, item.relevanceScore + recencyBonus);
};

// ============================================
// Feed Building
// ============================================

export interface BuildClusteredFeedOptions {
  signals: ISignal[];
  opportunities: IOpportunity[];
  intelligence: IIntelligenceItem[];
  /** Maximum items in the feed (default: 20) */
  limit?: number;
  /** Include intelligence items in feed (default: true) */
  includeIntelligence?: boolean;
}

export interface ClusteredFeedResult {
  items: ClusteredFeedItem[];
  /** Count of signals linked to opportunities */
  linkedSignalCount: number;
  /** Count of standalone signals */
  standaloneSignalCount: number;
  /** Total items before limit applied */
  totalCount: number;
}

/**
 * Build a priority-sorted clustered feed.
 *
 * Algorithm:
 * 1. Create opportunity clusters by resolving linkedSignalUuids to actual signals
 * 2. Identify standalone signals (not linked to any opportunity)
 * 3. Convert intelligence items to standalone items
 * 4. Merge all items and sort by priority score
 */
export const buildClusteredFeed = ({
  signals,
  opportunities,
  intelligence,
  limit = 20,
  includeIntelligence = true,
}: BuildClusteredFeedOptions): ClusteredFeedResult => {
  // Create signal lookup map for efficient access
  const signalMap = new Map<string, ISignal>(signals.map((s) => [s.uuid, s]));

  // Track which signals are linked to opportunities
  const linkedSignalUuids = new Set<string>();

  // 1. Build opportunity clusters
  const opportunityClusters: IOpportunityCluster[] = opportunities.map(
    (opportunity) => {
      // Resolve linked signals (with safety check for undefined/null)
      const oppLinkedSignalUuids = opportunity.linkedSignalUuids || [];
      const linkedSignals = oppLinkedSignalUuids
        .map((uuid) => signalMap.get(uuid))
        .filter((s): s is ISignal => s !== undefined);

      // Track linked signal UUIDs
      oppLinkedSignalUuids.forEach((uuid) => linkedSignalUuids.add(uuid));

      // Find related intelligence (match by theme/category - simple heuristic)
      // In production, this relationship would come from the backend
      const relatedIntelligence: IIntelligenceItem[] = [];

      return {
        type: 'opportunity_cluster' as const,
        opportunity,
        linkedSignals,
        relatedIntelligence,
        priorityScore: opportunity.priorityScore,
        sortDate: opportunity.createdAt,
      };
    },
  );

  // 2. Build standalone signals (those not linked to any opportunity)
  const standaloneSignals: IStandaloneSignal[] = signals
    .filter((signal) => !linkedSignalUuids.has(signal.uuid))
    .map((signal) => ({
      type: 'standalone_signal' as const,
      signal,
      priorityScore: calculateSignalPriority(signal),
      sortDate: signal.detectedAt,
    }));

  // 3. Build standalone intelligence items
  const standaloneIntelligence: IStandaloneIntelligence[] = includeIntelligence
    ? intelligence.map((item) => ({
        type: 'standalone_intelligence' as const,
        intelligence: item,
        priorityScore: calculateIntelligencePriority(item),
        sortDate: item.publishedAt,
      }))
    : [];

  // 4. Merge and sort by priority score (descending)
  const allItems: ClusteredFeedItem[] = [
    ...opportunityClusters,
    ...standaloneSignals,
    ...standaloneIntelligence,
  ].sort((a, b) => {
    // Primary sort: priority score (descending)
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    // Secondary sort: recency (descending)
    return new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime();
  });

  return {
    items: allItems.slice(0, limit),
    linkedSignalCount: linkedSignalUuids.size,
    standaloneSignalCount: standaloneSignals.length,
    totalCount: allItems.length,
  };
};

// ============================================
// Filtering Utilities
// ============================================

export type FeedFilterType =
  | 'all'
  | 'opportunities'
  | 'signals'
  | 'intelligence';

/**
 * Filter clustered feed items by type
 */
export const filterClusteredFeed = (
  items: ClusteredFeedItem[],
  filterType: FeedFilterType,
): ClusteredFeedItem[] => {
  if (filterType === 'all') return items;

  return items.filter((item) => {
    switch (filterType) {
      case 'opportunities':
        return item.type === 'opportunity_cluster';
      case 'signals':
        return item.type === 'standalone_signal';
      case 'intelligence':
        return item.type === 'standalone_intelligence';
      default:
        return true;
    }
  });
};

/**
 * Search clustered feed items by text
 */
export const searchClusteredFeed = (
  items: ClusteredFeedItem[],
  searchQuery: string,
): ClusteredFeedItem[] => {
  if (!searchQuery.trim()) return items;

  const query = searchQuery.toLowerCase();

  return items.filter((item) => {
    switch (item.type) {
      case 'opportunity_cluster': {
        const opp = item.opportunity;
        const matchesOpp =
          opp.title.toLowerCase().includes(query) ||
          opp.description.toLowerCase().includes(query);
        const matchesLinkedSignals = item.linkedSignals.some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query),
        );
        return matchesOpp || matchesLinkedSignals;
      }
      case 'standalone_signal':
        return (
          item.signal.title.toLowerCase().includes(query) ||
          item.signal.description.toLowerCase().includes(query)
        );
      case 'standalone_intelligence':
        return (
          item.intelligence.title.toLowerCase().includes(query) ||
          item.intelligence.summary.toLowerCase().includes(query)
        );
      default:
        return false;
    }
  });
};

// ============================================
// Feed Statistics
// ============================================

export interface FeedCounts {
  all: number;
  opportunities: number;
  signals: number;
  intelligence: number;
}

/**
 * Count items by type for filter badges
 */
export const countFeedItems = (items: ClusteredFeedItem[]): FeedCounts => {
  return items.reduce(
    (counts, item) => {
      counts.all++;
      switch (item.type) {
        case 'opportunity_cluster':
          counts.opportunities++;
          break;
        case 'standalone_signal':
          counts.signals++;
          break;
        case 'standalone_intelligence':
          counts.intelligence++;
          break;
      }
      return counts;
    },
    { all: 0, opportunities: 0, signals: 0, intelligence: 0 },
  );
};
