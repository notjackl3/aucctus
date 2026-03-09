import { Badge, ConceptReportSkeletons } from '@components';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import {
  useConceptCustomerProfiles,
  useConceptExecutiveSummaries,
  useConceptMarketScan,
  useConceptOverview,
  useMarketScanMarketForcesV3,
  useUploadConceptCustomImage,
  useUpdateConceptImageSettings,
} from '@hooks/query/concepts.hook';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import {
  buildExpression,
  evaluateExpression,
} from '@pages/Concept/Report/FinancialProjections/shared/expressionBuilder';
import { AppPath } from '@routes/routes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EXECUTIVE_DASHBOARD_CONFIG, executiveDashboardUIText } from './config';

import images from '@assets/img';
import BusinessModelCard from './BusinessModelCard';
import CustomerProfilesCard from './CustomerProfilesCard';
import DifferentiatorsCard from './DifferentiatorsCard';
import EcosystemCard from './EcosystemCard';
import GutCheckBanner from './GutCheckBanner';
import ImageUploadButton from './ImageUploadButton';
import ImageToggleControls from './ImageToggleControls';
import InfoSectionCard from './InfoSectionCard';
import KeyAssumptionsCard from './KeyAssumptionsCard';
import MarketSizeCard from './MarketSizeCard';
import OurRightToWinCard from './OurRightToWinCard';
import TrendsDriversCard from './TrendsDriversCard';

interface ExecutiveDashboardProps {
  className?: string;
  conceptUuid?: string; // UUID for fetching real concept overview data
  conceptId?: string; // ID for navigation routing
  concept?: any; // Add concept prop for unified loading detection
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  className = '',
  conceptUuid,
  conceptId,
  concept,
}) => {
  // const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Image upload and settings mutations
  const uploadMutation = useUploadConceptCustomImage(conceptUuid || '');
  const updateSettings = useUpdateConceptImageSettings(conceptUuid || '');

  // Centralized data fetching - load all data for the cards
  const { conceptOverview, isLoading: isLoadingOverview } =
    useConceptOverview(conceptUuid);
  const { executiveSummaries, isLoading: isLoadingExecutiveSummaries } =
    useConceptExecutiveSummaries(conceptUuid);
  const { financialProjectionV2, isLoading: isLoadingFinancial } =
    useFinancialProjectionV2(conceptUuid || '');
  const { profiles: customerProfiles, isLoading: isLoadingCustomerProfiles } =
    useConceptCustomerProfiles(conceptUuid || '');
  const { marketScan, isLoading: isLoadingMarketScan } = useConceptMarketScan(
    conceptUuid || '',
  );
  const { marketForces, isLoading: isLoadingMarketForces } =
    useMarketScanMarketForcesV3(conceptUuid || '');
  const {
    categoryMetrics: assumptionsCategoryMetrics,
    isLoading: isLoadingAssumptions,
  } = useFilteredAssumptions(conceptId || '');

  // Use unified loading state to detect pending sections
  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptOverview,
    concept,
    additionalLoadingStates: [isLoadingOverview, isLoadingExecutiveSummaries],
  });

  // Calculate overall loading state for the main dashboard content
  // Only block the entire dashboard for overview data (needed for hero section)
  // Individual carousel cards will handle their own loading states
  const isLoading = isSectionPending || hasBlockingLoad;

  // Separate loading state for the carousel section
  const isCarouselLoading =
    isSectionPending ||
    hasBlockingLoad ||
    isLoadingFinancial ||
    isLoadingCustomerProfiles ||
    isLoadingMarketScan ||
    isLoadingMarketForces ||
    isLoadingAssumptions;

  const differentiators =
    conceptOverview?.differentiators &&
    conceptOverview.differentiators.length > 0
      ? conceptOverview.differentiators
      : [];
  const rightsToWin =
    conceptOverview?.rightsToWin && conceptOverview.rightsToWin.length > 0
      ? conceptOverview.rightsToWin
      : [];

  // Format currency values for dashboard cards
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }, []);

  // Transform financial projection data for market sizing
  const marketSizeData = React.useMemo(() => {
    if (
      !financialProjectionV2 ||
      !financialProjectionV2.marketSizings ||
      financialProjectionV2.marketSizings.length === 0
    ) {
      return null;
    }

    // Get market sizing data - specifically look for "top_down" methodology first
    const topDownMarketSizing = financialProjectionV2.marketSizings.find(
      (sizing) => sizing.type === 'top_down',
    );
    const marketSizing =
      topDownMarketSizing || financialProjectionV2.marketSizings[0];

    const hasPreCalculatedValues =
      marketSizing.expectedTam !== null &&
      marketSizing.expectedSam !== null &&
      marketSizing.expectedSom !== null;

    if (hasPreCalculatedValues) {
      return {
        tam: formatCurrency(marketSizing.expectedTam!),
        sam: formatCurrency(marketSizing.expectedSam!),
        som: formatCurrency(marketSizing.expectedSom!),
        marketSummary:
          executiveSummaries?.financialMarketSizeRevenue ||
          conceptOverview?.marketSizeSummary ||
          null,
        growthTrajectory: null,
      };
    }

    return null;
  }, [
    financialProjectionV2,
    executiveSummaries,
    conceptOverview,
    formatCurrency,
  ]);

  // Determine if this is a cost-savings concept
  const isCostSavings = concept?.financialProjectionType === 'cost_savings';

  // Transform financial projection data for impact sizing (cost-saving concepts)
  const impactSizeData = React.useMemo(() => {
    if (
      !isCostSavings ||
      !financialProjectionV2 ||
      !financialProjectionV2.impactSizings ||
      financialProjectionV2.impactSizings.length === 0
    ) {
      return null;
    }

    const impactSizing = financialProjectionV2.impactSizings[0];
    if (
      !impactSizing.assumptionEntries ||
      impactSizing.assumptionEntries.length === 0
    ) {
      return null;
    }

    const sortedEntries = [...impactSizing.assumptionEntries].sort(
      (a, b) => a.order - b.order,
    );

    const expression = buildExpression(sortedEntries);
    const calculatedValue = evaluateExpression(expression, 'impact sizing');

    return {
      formattedValue: formatCurrency(calculatedValue),
      summary: executiveSummaries?.financialMarketSizeCostSavings || null,
    };
  }, [
    isCostSavings,
    financialProjectionV2,
    executiveSummaries,
    formatCurrency,
  ]);

  const handleCardClick = useCallback((index: number) => {
    setCurrentCardIndex(index);
    setProgress(0);
  }, []);

  const handleCardHover = useCallback(() => {
    setIsAutoPlaying(false);
  }, []);

  const handleCardLeave = useCallback(() => {
    setIsAutoPlaying(true);
    setProgress(0);
  }, []);

  const handleRevertToAI = useCallback(() => {
    updateSettings.mutate({
      useCustomImage: false,
      customImageUrl: undefined,
    });
  }, [updateSettings]);

  // Build card renderers array — conditionally exclude Business Model for cost-savings
  const cardRenderers = useMemo(() => {
    const cards: ((commonProps: {
      currentCardIndex: number;
      progress: number;
      totalCards: number;
      onCardClick: (index: number) => void;
    }) => React.ReactNode)[] = [
      (props) => (
        <MarketSizeCard
          {...props}
          conceptId={conceptId}
          marketSizeData={marketSizeData}
          impactSizeData={impactSizeData}
          isCostSavings={isCostSavings}
          isLoadingFinancial={isLoadingFinancial}
        />
      ),
      (props) => (
        <TrendsDriversCard
          {...props}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          marketForces={marketForces}
          isLoadingMarketForces={isLoadingMarketForces}
          executiveSummary={executiveSummaries?.marketScanTrendsDrivers}
        />
      ),
      (props) => (
        <EcosystemCard
          {...props}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          marketScan={marketScan}
          isLoadingMarketScan={isLoadingMarketScan}
          executiveSummary={executiveSummaries?.marketScanEcosystem}
          concept={concept}
        />
      ),
    ];

    // Only include Business Model card for revenue concepts
    if (!isCostSavings) {
      cards.push((props) => (
        <BusinessModelCard
          {...props}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          financialProjectionV2={financialProjectionV2}
          isLoadingFinancial={isLoadingFinancial}
          executiveSummary={executiveSummaries?.financialBusinessModel}
        />
      ));
    }

    cards.push(
      (props) => (
        <CustomerProfilesCard
          {...props}
          conceptUuid={conceptUuid}
          conceptId={conceptId}
          customerProfiles={customerProfiles}
          isLoadingCustomerProfiles={isLoadingCustomerProfiles}
          executiveSummary={executiveSummaries?.customerProfiles}
        />
      ),
      (props) => (
        <KeyAssumptionsCard
          {...props}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          categoryMetrics={assumptionsCategoryMetrics}
          isLoadingAssumptions={isLoadingAssumptions}
          executiveSummary={executiveSummaries?.keyAssumptions}
        />
      ),
    );

    return cards;
  }, [
    isCostSavings,
    conceptId,
    conceptUuid,
    marketSizeData,
    impactSizeData,
    isLoadingFinancial,
    marketForces,
    isLoadingMarketForces,
    executiveSummaries,
    marketScan,
    isLoadingMarketScan,
    concept,
    financialProjectionV2,
    customerProfiles,
    isLoadingCustomerProfiles,
    assumptionsCategoryMetrics,
    isLoadingAssumptions,
  ]);

  const totalCards = cardRenderers.length;

  // Auto-progression logic
  useEffect(() => {
    if (!isAutoPlaying || totalCards <= 1) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const increment =
          (EXECUTIVE_DASHBOARD_CONFIG.PROGRESS_INTERVAL /
            EXECUTIVE_DASHBOARD_CONFIG.CARD_DURATION) *
          100;
        const newProgress = prev + increment;

        // Clamp to 100% to ensure we show full progress
        if (newProgress >= 100) {
          // Set to 100% first, then switch on next tick
          if (prev >= 100) {
            setCurrentCardIndex((current) => (current + 1) % totalCards);
            return 0;
          }
          return 100;
        }

        return newProgress;
      });
    }, EXECUTIVE_DASHBOARD_CONFIG.PROGRESS_INTERVAL);

    return () => clearInterval(progressTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPlaying, totalCards]); // Intentionally exclude currentCardIndex to avoid restarting timer

  // Render current card based on index
  const renderCurrentCard = () => {
    const commonProps = {
      currentCardIndex,
      progress,
      totalCards,
      onCardClick: handleCardClick,
    };

    const renderer = cardRenderers[currentCardIndex];
    return renderer ? renderer(commonProps) : null;
  };

  // Show skeleton loading state while fetching data or when section is pending
  if (conceptUuid && isLoading) {
    return (
      <div className={className}>
        <ConceptReportSkeletons.ExecutiveDashboardSkeleton />
      </div>
    );
  }

  return (
    <div data-section-id='overview' className={`space-y-8 ${className}`}>
      {/* Gut Check Banner */}
      <div data-section-id='gut_check'>
        <GutCheckBanner
          recommendation={conceptOverview?.shouldWeDoThis}
          isLoading={isLoadingOverview}
        />
      </div>

      {/* Hero Section with Concept Image and Value Prop */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left - Concept Image */}
        <div className='flex items-start justify-center'>
          <div className='aucctus-border-primary relative h-[420px] w-full overflow-hidden rounded-xl border shadow-lg'>
            {/* Gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />

            {/* Concept image */}
            <img
              src={
                conceptOverview?.useCustomImage &&
                conceptOverview?.customImageUrl
                  ? conceptOverview.customImageUrl
                  : conceptOverview?.conceptImageUrl ||
                    images.aiExplorationsBackground
              }
              alt={executiveDashboardUIText.conceptVisualization.altText}
              className='relative z-10 h-full w-full object-cover'
              loading='eager'
            />

            {/* Image controls overlay */}
            <div className='absolute right-4 top-4 z-20'>
              <div className='flex flex-col gap-2'>
                <ImageUploadButton
                  conceptUuid={conceptUuid || ''}
                  isCustomActive={!!conceptOverview?.customImageUrl}
                  uploadMutation={uploadMutation}
                />
                {conceptOverview?.useCustomImage &&
                  conceptOverview?.customImageUrl && (
                    <ImageToggleControls
                      isReverting={updateSettings.isLoading}
                      onRevertToAI={handleRevertToAI}
                    />
                  )}
              </div>
            </div>

            {/* Badge */}
            <div className='absolute bottom-4 left-4 right-4 z-20'>
              <Badge.Default
                value={executiveDashboardUIText.conceptVisualization.badgeText}
                classNameBadge='aucctus-bg-primary aucctus-text-primary aucctus-border-primary'
              />
            </div>
          </div>
        </div>

        {/* Right - What is it, Value Proposition and Problem Statement */}
        <div className='space-y-6'>
          <div data-section-id='concept_overview'>
            <InfoSectionCard
              iconVariant='lightbulb'
              title={executiveDashboardUIText.sections.whatIsIt}
              content={
                conceptOverview?.whatIsThis ||
                'No product description available'
              }
            />
          </div>

          <div data-section-id='concept_value_proposition'>
            <InfoSectionCard
              iconVariant='target'
              title={executiveDashboardUIText.sections.valueProposition}
              content={
                conceptOverview?.valueProposition ||
                'No value proposition available'
              }
            />
          </div>

          <div data-section-id='concept_problem_statement'>
            <InfoSectionCard
              iconVariant='alert-triangle'
              title={executiveDashboardUIText.sections.problemStatement}
              content={
                conceptOverview?.problemStatement ||
                'No problem statement available'
              }
            />
          </div>
        </div>
      </div>

      {/* Three Column Layout: Differentiators, Our Right to Win, Tab Summary Carousel */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
        {/* Differentiators Card */}
        <div data-section-id='differentiators'>
          <DifferentiatorsCard differentiators={differentiators} />
        </div>

        {/* Our Right to Win Card */}
        <div data-section-id='rights_to_win'>
          <OurRightToWinCard rightsToWin={rightsToWin} />
        </div>

        {/* Tab Summary Cards with Progress Navigation */}
        <div className='relative h-fit lg:col-span-2'>
          {/* Show loading skeleton for carousel section while data loads */}
          {isCarouselLoading ? (
            <ConceptReportSkeletons.DashboardCarouselCardSkeleton />
          ) : (
            /* Current Card Display */
            <div
              className='transition-all duration-500 ease-in-out'
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardLeave}
            >
              {renderCurrentCard()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ExecutiveDashboard);
