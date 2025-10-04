import { Badge, Loading } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import {
  useConceptCustomerProfiles,
  useConceptExecutiveSummaries,
  useConceptMarketScan,
  useConceptOverview,
  useMarketScanMarketForcesV3,
} from '@hooks/query/concepts.hook';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import React, { useCallback, useEffect, useState } from 'react';
import { EXECUTIVE_DASHBOARD_CONFIG, executiveDashboardUIText } from './config';

import images from '@assets/img';
import BusinessModelCard from './BusinessModelCard';
import ConceptVideoGeneration from './ConceptVideoGeneration';
import CustomerProfilesCard from './CustomerProfilesCard';
import DifferentiatorsCard from './DifferentiatorsCard';
import EcosystemCard from './EcosystemCard';
import InfoSectionCard from './InfoSectionCard';
import KeyAssumptionsCard from './KeyAssumptionsCard';
import MarketSizeCard from './MarketSizeCard';
import OurRightToWinCard from './OurRightToWinCard';
import ShouldWeDoThisBanner from './ShouldWeDoThisBanner';
import TrendsDriversCard from './TrendsDriversCard';

interface ExecutiveDashboardProps {
  className?: string;
  conceptUuid?: string; // UUID for fetching real concept overview data
  conceptId?: string; // ID for navigation routing
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  className = '',
  conceptUuid,
  conceptId,
}) => {
  // const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Debug mode check
  const isDebugMode = useDebugMode();

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

  // Calculate overall loading state
  const isLoading =
    isLoadingOverview ||
    isLoadingExecutiveSummaries ||
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

  // Transform financial projection data for market sizing
  const marketSizeData = React.useMemo(() => {
    if (
      !financialProjectionV2 ||
      !financialProjectionV2.marketSizings ||
      financialProjectionV2.marketSizings.length === 0
    ) {
      return null;
    }

    // Format currency values
    const formatCurrency = (value: number) => {
      if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
      if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
      return `$${value.toFixed(2)}`;
    };

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
  }, [financialProjectionV2, executiveSummaries, conceptOverview]);

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

  // Total number of cards
  const totalCards = 6;

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

    switch (currentCardIndex) {
      case 0:
        return (
          <MarketSizeCard
            {...commonProps}
            conceptId={conceptId}
            marketSizeData={marketSizeData}
            isLoadingFinancial={isLoadingFinancial}
          />
        );
      case 1:
        return (
          <TrendsDriversCard
            {...commonProps}
            conceptId={conceptId}
            conceptUuid={conceptUuid}
            marketForces={marketForces}
            isLoadingMarketForces={isLoadingMarketForces}
            executiveSummary={executiveSummaries?.marketScanTrendsDrivers}
          />
        );
      case 2:
        return (
          <EcosystemCard
            {...commonProps}
            conceptId={conceptId}
            conceptUuid={conceptUuid}
            marketScan={marketScan}
            isLoadingMarketScan={isLoadingMarketScan}
            executiveSummary={executiveSummaries?.marketScanEcosystem}
          />
        );
      case 3:
        return (
          <BusinessModelCard
            {...commonProps}
            conceptId={conceptId}
            conceptUuid={conceptUuid}
            financialProjectionV2={financialProjectionV2}
            isLoadingFinancial={isLoadingFinancial}
            executiveSummary={executiveSummaries?.financialBusinessModel}
          />
        );
      case 4:
        return (
          <CustomerProfilesCard
            {...commonProps}
            conceptUuid={conceptUuid}
            conceptId={conceptId}
            customerProfiles={customerProfiles}
            isLoadingCustomerProfiles={isLoadingCustomerProfiles}
            executiveSummary={executiveSummaries?.customerProfiles}
          />
        );
      case 5:
        return (
          <KeyAssumptionsCard
            {...commonProps}
            conceptId={conceptId}
            conceptUuid={conceptUuid}
            categoryMetrics={assumptionsCategoryMetrics}
            isLoadingAssumptions={isLoadingAssumptions}
            executiveSummary={executiveSummaries?.keyAssumptions}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state while fetching data
  if (conceptUuid && isLoading) {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center ${className}`}
      >
        <Loading />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Should We Do This Banner */}
      <ShouldWeDoThisBanner
        recommendation={conceptOverview?.shouldWeDoThis}
        isLoading={isLoadingOverview}
      />

      {/* Hero Section with Concept Image and Value Prop */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left - Concept Image */}
        <div className='flex items-start justify-center'>
          <div className='aucctus-bg-primary aucctus-border-secondary relative h-[420px] w-full overflow-hidden rounded-xl border shadow-lg'>
            <img
              src={
                conceptOverview?.conceptImageUrl ||
                images.aiExplorationsBackground
              }
              alt={executiveDashboardUIText.conceptVisualization.altText}
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
            <div className='absolute bottom-4 left-4 right-4'>
              <Badge.Default
                value={executiveDashboardUIText.conceptVisualization.badgeText}
                classNameBadge='aucctus-bg-primary aucctus-text-primary aucctus-border-primary'
              />
            </div>
          </div>
        </div>

        {/* Right - What is it, Value Proposition and Problem Statement */}
        <div className='space-y-6'>
          <InfoSectionCard
            iconVariant='lightbulb'
            title={executiveDashboardUIText.sections.whatIsIt}
            content={
              conceptOverview?.whatIsThis || 'No product description available'
            }
          />

          <InfoSectionCard
            iconVariant='target'
            title={executiveDashboardUIText.sections.valueProposition}
            content={
              conceptOverview?.valueProposition ||
              'No value proposition available'
            }
          />

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

      {/* Three Column Layout: Differentiators, Our Right to Win, Tab Summary Carousel */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
        {/* Differentiators Card */}
        <DifferentiatorsCard differentiators={differentiators} />

        {/* Our Right to Win Card */}
        <OurRightToWinCard rightsToWin={rightsToWin} />

        {/* Tab Summary Cards with Progress Navigation */}
        <div className='relative h-fit lg:col-span-2'>
          {/* Current Card Display */}
          <div
            className='transition-all duration-500 ease-in-out'
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            {renderCurrentCard()}
          </div>
        </div>
      </div>

      {/* Concept Video Generation - Debug Mode Only */}
      {isDebugMode && conceptUuid && (
        <div className='mt-8'>
          <ConceptVideoGeneration
            conceptUuid={conceptUuid}
            existingVideoUrl={
              (conceptOverview as any)?.conceptVideoUrl as string | undefined
            }
            videoStatus={
              (conceptOverview as any)?.videoStatus as
                | 'generating'
                | 'complete'
                | 'error'
                | undefined
            }
            videoGenerationStage={
              (conceptOverview as any)?.videoGenerationStage as
                | string
                | undefined
            }
            videoGenerationProgress={
              (conceptOverview as any)?.videoGenerationProgress as
                | number
                | undefined
            }
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(ExecutiveDashboard);
