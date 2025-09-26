import { Badge, Button, Icon } from '@components';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useConceptOverview,
  useConceptExecutiveSummaries,
  useConceptCustomerProfiles,
  useConceptMarketScan,
  useMarketScanMarketForcesV3,
} from '@hooks/query/concepts.hook';
import { useFinancialProjectionV2 } from '@hooks/query/financialProjections.hook';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import { EXECUTIVE_DASHBOARD_CONFIG, executiveDashboardUIText } from './config';

import images from '@assets/img';
import BusinessModelCard from './BusinessModelCard';
import CustomerProfilesCard from './CustomerProfilesCard';
import EcosystemCard from './EcosystemCard';
import TrendsDriversCard from './TrendsDriversCard';
import KeyAssumptionsCard from './KeyAssumptionsCard';
import MarketSizeCard from './MarketSizeCard';
import InfoSectionCard from './InfoSectionCard';
import ShouldWeDoThisBanner from './ShouldWeDoThisBanner';
import DifferentiatorsCard from './DifferentiatorsCard';
import OurRightToWinCard from './OurRightToWinCard';

interface ExecutiveDashboardProps {
  className?: string;
  conceptUuid?: string; // UUID for fetching real concept overview data
  conceptId?: string; // ID for navigation routing
}

interface CardComponentProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
}

interface TabSummaryCard {
  component:
    | React.ComponentType<CardComponentProps>
    | (() => React.ReactElement);
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

  // ComingSoonCard component - temporarily replaces all tab summary cards
  const ComingSoonCard: React.FC<CardComponentProps> = useCallback(
    () => (
      <div className='aucctus-bg-secondary aucctus-border-secondary h-full rounded-lg border transition-all duration-200'>
        <div className='flex h-full flex-col items-center justify-center p-6 text-center'>
          <div className='m-6'>
            <Icon
              variant='clock'
              className='aucctus-stroke-tertiary mx-auto mb-4 h-12 w-12'
            />
            <h3 className='aucctus-header-md-semibold aucctus-text-primary mb-2'>
              Coming Soon
            </h3>
          </div>
        </div>
      </div>
    ),
    [],
  );

  // Original tab summary cards - now with centralized data passed as props
  const originalTabSummaryCards: TabSummaryCard[] = [
    {
      component: (props: CardComponentProps) => (
        <MarketSizeCard
          currentCardIndex={props.currentCardIndex}
          progress={props.progress}
          totalCards={props.totalCards}
          onCardClick={props.onCardClick}
          conceptId={conceptId}
          marketSizeData={marketSizeData}
          isLoadingFinancial={isLoadingFinancial}
        />
      ),
    },
    {
      component: (props: CardComponentProps) => (
        <TrendsDriversCard
          currentCardIndex={props.currentCardIndex}
          progress={props.progress}
          totalCards={props.totalCards}
          onCardClick={props.onCardClick}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          // Pass centralized data
          marketForces={marketForces}
          isLoadingMarketForces={isLoadingMarketForces}
          executiveSummary={executiveSummaries?.marketScanTrendsDrivers}
        />
      ),
    },
    {
      component: (props: CardComponentProps) => (
        <EcosystemCard
          currentCardIndex={props.currentCardIndex}
          progress={props.progress}
          totalCards={props.totalCards}
          onCardClick={props.onCardClick}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          // Pass centralized data
          marketScan={marketScan}
          isLoadingMarketScan={isLoadingMarketScan}
          executiveSummary={executiveSummaries?.marketScanEcosystem}
        />
      ),
    },
    {
      component: (props: CardComponentProps) => (
        <BusinessModelCard
          currentCardIndex={props.currentCardIndex}
          progress={props.progress}
          totalCards={props.totalCards}
          onCardClick={props.onCardClick}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          // Pass centralized data
          financialProjectionV2={financialProjectionV2}
          isLoadingFinancial={isLoadingFinancial}
          executiveSummary={executiveSummaries?.financialBusinessModel}
        />
      ),
    },
    {
      component: (props: CardComponentProps) => (
        <CustomerProfilesCard
          currentCardIndex={props.currentCardIndex}
          progress={props.progress}
          totalCards={props.totalCards}
          onCardClick={props.onCardClick}
          conceptUuid={conceptUuid}
          conceptId={conceptId}
          // Pass centralized data
          customerProfiles={customerProfiles}
          isLoadingCustomerProfiles={isLoadingCustomerProfiles}
          executiveSummary={executiveSummaries?.customerProfiles}
        />
      ),
    },
    {
      component: (props: CardComponentProps) => (
        <KeyAssumptionsCard
          currentCardIndex={props.currentCardIndex}
          progress={props.progress}
          totalCards={props.totalCards}
          onCardClick={props.onCardClick}
          conceptId={conceptId}
          conceptUuid={conceptUuid}
          // Pass centralized data
          categoryMetrics={assumptionsCategoryMetrics}
          isLoadingAssumptions={isLoadingAssumptions}
          executiveSummary={executiveSummaries?.keyAssumptions}
        />
      ),
    },
  ];

  // Currently active cards
  const tabSummaryCards: TabSummaryCard[] = originalTabSummaryCards;

  // Auto-progression logic - disabled for "Coming Soon" card but kept for when original cards are restored
  useEffect(() => {
    if (!isAutoPlaying || tabSummaryCards.length <= 1) return;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress =
          prev +
          (EXECUTIVE_DASHBOARD_CONFIG.PROGRESS_INTERVAL /
            EXECUTIVE_DASHBOARD_CONFIG.CARD_DURATION) *
            100;

        if (newProgress >= 100) {
          setCurrentCardIndex(
            (current) => (current + 1) % tabSummaryCards.length,
          );
          return 0;
        }

        return newProgress;
      });
    }, EXECUTIVE_DASHBOARD_CONFIG.PROGRESS_INTERVAL);

    return () => clearInterval(progressTimer);
  }, [isAutoPlaying, currentCardIndex, tabSummaryCards.length]);

  // Show loading state while fetching data
  if (conceptUuid && isLoading) {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center ${className}`}
      >
        <div className='text-center'>
          <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
          <p className='text-secondary'>Loading concept overview...</p>
        </div>
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
            {React.createElement(tabSummaryCards[currentCardIndex].component, {
              currentCardIndex,
              progress,
              totalCards: tabSummaryCards.length,
              onCardClick: handleCardClick,
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ExecutiveDashboard);
