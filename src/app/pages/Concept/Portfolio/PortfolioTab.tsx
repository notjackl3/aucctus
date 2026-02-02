/**
 * Portfolio Tab
 *
 * Main container for the Portfolio tab content within the Concept Bank page.
 * Displays executive summary, high scoring concepts carousel,
 * and portfolio balance widget (donut chart).
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Banner, ConceptReportSkeletons } from '@components';
import OverseerWrapper from '@components/Overseer/OverseerWrapper';
import {
  useBulkPrioritySocketEvents,
  useConceptPriorities,
  useGenerateBulkConceptPriorities,
  usePortfolioSummary,
} from '@hooks/query/concept-priority.hook';
import { useConcepts } from '@hooks/query/concepts.hook';
import { useAutoInitScoringConfig } from '@hooks/query/scoringConfig.hook';
import api from '@libs/api';
import useStore from '@stores/store';
import {
  HighScoringConceptsCarousel,
  PortfolioBalanceWidget,
  PortfolioExecutiveSummary,
} from './components';
import { ConceptStage, HighScoringConcept, HorizonData } from './types';

// Helper to map concept backend category to display stage
const mapCategoryToStage = (category?: string): ConceptStage => {
  const categoryMap: Record<string, ConceptStage> = {
    draft: 'Ideating',
    active: 'In Review',
    completed: 'Commercialized',
    archived: 'Commercialized',
  };
  return categoryMap[category || ''] || 'Ideating';
};

// Default pillar colors for visual variety
const DEFAULT_PILLAR_COLORS = [
  'hsl(153, 79%, 40%)', // Green
  'hsl(217, 100%, 58%)', // Blue
  'hsl(259, 91%, 66%)', // Purple
  'hsl(199, 89%, 48%)', // Cyan
  'hsl(38, 92%, 50%)', // Orange
];

const PortfolioTab: React.FC = () => {
  const navigate = useNavigate();
  const account = useStore((state) => state.auth.account);

  // Auto-initialize scoring config with defaults if none exists
  useAutoInitScoringConfig(account?.uuid);

  // Fetch real priorities
  const { priorities, isLoading: prioritiesLoading } = useConceptPriorities();

  // Get top 6 priority concept UUIDs for the carousel
  const topPriorityUuids = useMemo(() => {
    if (!priorities || priorities.length === 0) return '';
    return priorities
      .filter((p) => p.overallPriorityScore > 0)
      .sort((a, b) => b.overallPriorityScore - a.overallPriorityScore)
      .slice(0, 6)
      .map((p) => p.conceptUuid)
      .join(',');
  }, [priorities]);

  // Fetch only the top priority concepts for the carousel (efficient)
  const { data: topConceptsData, isLoading: topConceptsLoading } = useConcepts({
    uuids: topPriorityUuids || undefined,
  });

  // Fetch all concepts for the banner check (needs full list to find concepts without priorities)
  const { data: allConceptsData, isLoading: allConceptsLoading } = useConcepts({
    pageSize: 100, // Get more concepts to check against priorities
  });

  // Combined loading state
  const conceptsLoading = topConceptsLoading || allConceptsLoading;

  // Bulk priority generation
  const bulkPriorityMutation = useGenerateBulkConceptPriorities();
  const { progress, startCalculating, resetProgress } =
    useBulkPrioritySocketEvents();

  // Fetch portfolio summary from API
  const { portfolioSummary } = usePortfolioSummary();

  // Check if we should show the banner
  // Count all concepts without priorities (including incomplete ones - they will receive low scores)
  const conceptsWithoutPrioritiesCount = useMemo(() => {
    if (!allConceptsData?.results) return 0;
    const priorityUuids = new Set(priorities?.map((p) => p.conceptUuid) || []);
    return allConceptsData.results.filter((c) => !priorityUuids.has(c.uuid))
      .length;
  }, [allConceptsData?.results, priorities]);

  // Track loading state for fetching concepts before bulk calculation
  const [isFetchingConcepts, setIsFetchingConcepts] = useState(false);

  // Combined loading state for showing skeletons during priority calculation
  const isCalculatingPriorities =
    isFetchingConcepts ||
    bulkPriorityMutation.isLoading ||
    progress.isCalculating;

  const showPriorityBanner =
    conceptsWithoutPrioritiesCount > 0 && !isCalculatingPriorities;

  const handleCalculateAllPriorities = useCallback(async () => {
    // Fetch all concepts to get UUIDs (handles pagination)
    setIsFetchingConcepts(true);
    try {
      const allConcepts = await api.concept.getConcepts({ pageSize: 199 });
      const priorityUuids = new Set(
        priorities?.map((p) => p.conceptUuid) || [],
      );

      // Filter to all concepts without priorities (including incomplete - they will receive low scores)
      const conceptUuidsToCalculate = allConcepts.results
        .filter((c) => !priorityUuids.has(c.uuid))
        .map((c) => c.uuid);

      if (conceptUuidsToCalculate.length > 0) {
        // Start calculating immediately to show skeletons
        // This persists until the completion WebSocket event is received
        startCalculating(conceptUuidsToCalculate.length);
        try {
          await bulkPriorityMutation.mutateAsync(conceptUuidsToCalculate);
        } catch {
          // Reset progress if the mutation fails (e.g., scoring criteria not configured)
          // This prevents the page from being stuck in skeleton/loading mode
          resetProgress();
        }
      }
    } finally {
      setIsFetchingConcepts(false);
    }
  }, [priorities, bulkPriorityMutation, startCalculating, resetProgress]);

  // Get high scoring concepts from real data
  const highScoringConcepts = useMemo<HighScoringConcept[]>(() => {
    if (!priorities || !topConceptsData?.results) return [];

    // Create concept map for lookup
    const conceptMap = new Map(topConceptsData.results.map((c) => [c.uuid, c]));

    // Sort by overall score descending and take top 6
    const sortedPriorities = [...priorities]
      .filter((p) => p.overallPriorityScore > 0)
      .sort((a, b) => b.overallPriorityScore - a.overallPriorityScore)
      .slice(0, 6);

    return sortedPriorities
      .map((priority, index) => {
        const concept = conceptMap.get(priority.conceptUuid);
        if (!concept) return null;

        const ownerName = concept.createdBy
          ? `${concept.createdBy.firstName || ''} ${concept.createdBy.lastName || ''}`.trim()
          : 'Unknown';
        const ownerInitials = concept.createdBy
          ? `${concept.createdBy.firstName?.[0] || ''}${concept.createdBy.lastName?.[0] || ''}`.toUpperCase()
          : 'UN';

        return {
          id: concept.identifier,
          uuid: concept.uuid, // Pass UUID for fetching concept overview image
          title: concept.title,
          description:
            concept.summary || concept.overview || 'No description available',
          score: priority.overallPriorityScore,
          strategicPillar: 'Innovation', // TODO: Get from properties when available
          pillarColor:
            DEFAULT_PILLAR_COLORS[index % DEFAULT_PILLAR_COLORS.length],
          stage: mapCategoryToStage(concept.category),
          owner: {
            name: ownerName || 'Unknown',
            initials: ownerInitials || 'UN',
          },
        };
      })
      .filter((c): c is HighScoringConcept => c !== null);
  }, [priorities, topConceptsData]);

  // Get executive summary from real data or use a default
  const executiveSummary = useMemo(() => {
    if (portfolioSummary?.executiveInsight) {
      return portfolioSummary.executiveInsight;
    }
    if (priorities && priorities.length > 0) {
      const avgScore = Math.round(
        priorities.reduce((sum, p) => sum + p.overallPriorityScore, 0) /
          priorities.length,
      );
      const highPriorityCount = priorities.filter(
        (p) => p.overallPriorityScore >= 70,
      ).length;
      return `Your portfolio contains ${priorities.length} scored concepts with an average priority score of ${avgScore}. ${highPriorityCount} concepts are high priority and ready for advancement.`;
    }
    return 'Calculate priorities for your concepts to see portfolio insights and recommendations.';
  }, [portfolioSummary, priorities]);

  // Get horizon data - prefer computing from priorities API data, fallback to WebSocket summary
  const horizonData = useMemo<HorizonData[]>(() => {
    // First, try to compute from priorities array (API data)
    if (priorities && priorities.length > 0) {
      // Count concepts by innovation horizon
      let coreCount = 0;
      let adjacentCount = 0;
      let disruptiveCount = 0;

      priorities.forEach((priority) => {
        switch (priority.innovationHorizon) {
          case 'core':
            coreCount++;
            break;
          case 'adjacent':
            adjacentCount++;
            break;
          case 'disruptive':
            disruptiveCount++;
            break;
          // Skip concepts without horizon classification
        }
      });

      const total = coreCount + adjacentCount + disruptiveCount;
      if (total > 0) {
        return [
          {
            horizon: 'H1',
            label: 'Core',
            count: coreCount,
            percentage: Math.round((coreCount / total) * 100),
            color: 'hsl(142, 76%, 36%)', // Green
            description: 'Incremental improvements to existing business',
          },
          {
            horizon: 'H2',
            label: 'Adjacent',
            count: adjacentCount,
            percentage: Math.round((adjacentCount / total) * 100),
            color: 'hsl(199, 89%, 48%)', // Blue
            description: 'Expansion into new markets or capabilities',
          },
          {
            horizon: 'H3',
            label: 'Disruptive',
            count: disruptiveCount,
            percentage: Math.round((disruptiveCount / total) * 100),
            color: 'hsl(273, 80%, 40%)', // Purple
            description: 'Transformational innovations',
          },
        ];
      }
    }

    // Fallback to WebSocket portfolio summary if no priorities with horizons
    const breakdown = portfolioSummary?.horizonBreakdown;
    if (!breakdown) return [];

    const total =
      breakdown.coreCount + breakdown.adjacentCount + breakdown.disruptiveCount;
    if (total === 0) return [];

    return [
      {
        horizon: 'H1',
        label: 'Core',
        count: breakdown.coreCount,
        percentage: breakdown.corePercentage,
        color: 'hsl(142, 76%, 36%)', // Green
        description: 'Incremental improvements to existing business',
      },
      {
        horizon: 'H2',
        label: 'Adjacent',
        count: breakdown.adjacentCount,
        percentage: breakdown.adjacentPercentage,
        color: 'hsl(199, 89%, 48%)', // Blue
        description: 'Expansion into new markets or capabilities',
      },
      {
        horizon: 'H3',
        label: 'Disruptive',
        count: breakdown.disruptiveCount,
        percentage: breakdown.disruptivePercentage,
        color: 'hsl(273, 80%, 40%)', // Purple
        description: 'Transformational innovations',
      },
    ];
  }, [priorities, portfolioSummary?.horizonBreakdown]);

  const handleViewAllConcepts = useCallback(() => {
    // Navigate to concepts tab - will be handled by parent route
    navigate('/concept');
  }, [navigate]);

  const handleConceptClick = useCallback(
    (conceptId: string) => {
      // Navigate to concept detail page
      navigate(`/concept/${conceptId}`);
    },
    [navigate],
  );

  return (
    <OverseerWrapper pageContext='portfolio'>
      <div className='animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300'>
        {/* Priority Calculation Banner */}
        {showPriorityBanner && (
          <Banner
            title='Portfolio Priority Scoring Available'
            description={`You have ${conceptsWithoutPrioritiesCount} concept${conceptsWithoutPrioritiesCount === 1 ? '' : 's'} without priority scores. Calculate priorities to see which concepts align best with your strategic goals.`}
            onAction={handleCalculateAllPriorities}
            isLoading={isCalculatingPriorities}
            buttonText={
              isFetchingConcepts
                ? 'Loading...'
                : progress.isCalculating
                  ? `Calculating ${progress.current}/${progress.total}...`
                  : 'Calculate Priorities'
            }
            iconVariant='bar-chart-12'
          />
        )}

        {/* Executive Summary */}
        {isCalculatingPriorities ? (
          <ConceptReportSkeletons.PortfolioExecutiveSummarySkeleton />
        ) : (
          <PortfolioExecutiveSummary summary={executiveSummary} />
        )}

        {/* High Scoring Concepts Carousel */}
        <HighScoringConceptsCarousel
          concepts={highScoringConcepts}
          isLoading={
            prioritiesLoading || conceptsLoading || isCalculatingPriorities
          }
          onViewAll={handleViewAllConcepts}
          onConceptClick={handleConceptClick}
        />

        {/* Portfolio Balance Widget (Donut Chart) - shows AI-classified innovation horizons */}
        {isCalculatingPriorities ? (
          <ConceptReportSkeletons.PortfolioBalanceWidgetSkeleton />
        ) : (
          <PortfolioBalanceWidget
            horizonData={horizonData}
            totalIdeas={
              horizonData.reduce((sum, h) => sum + h.count, 0) ||
              portfolioSummary?.totalAnalyzed ||
              0
            }
            portfolioSummary={portfolioSummary}
          />
        )}
      </div>
    </OverseerWrapper>
  );
};

export default React.memo(PortfolioTab);
