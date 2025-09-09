import { Badge, Button, Icon } from '@components';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EXECUTIVE_DASHBOARD_CONFIG,
  mockConceptOverview,
  mockDifferentiators,
  mockExecutiveDashboardUIText,
  mockMarketSizeData,
  mockRightToWin,
} from './fixtures';

import images from '@assets/img';
import BusinessModelCard from './BusinessModelCard';
import CustomerProfilesCard from './CustomerProfilesCard';
import EcosystemCard from './EcosystemCard';
import InfoSectionCard from './InfoSectionCard';
import KeyAssumptionsCard from './KeyAssumptionsCard';
import TrendsDriversCard from './TrendsDriversCard';

interface ExecutiveDashboardProps {
  className?: string;
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
}) => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

  // MarketSizeCard component - converted to use Aucctus components
  const MarketSizeCard: React.FC<CardComponentProps> = useCallback(
    ({
      currentCardIndex: cardIndex,
      progress: cardProgress,
      totalCards,
      onCardClick,
    }) => (
      <div className='aucctus-bg-secondary aucctus-border-secondary h-[320px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
        <div className='flex h-full flex-col p-6'>
          {/* Progress Bar Navigation */}
          <div className='mb-4'>
            <div className='flex gap-2'>
              {Array.from({ length: totalCards }).map((_, index: number) => (
                <div key={index} className='flex-1'>
                  <div
                    className='aucctus-bg-disabled h-1 cursor-pointer overflow-hidden rounded-full'
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardClick(index);
                    }}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        index === cardIndex
                          ? 'aucctus-bg-primary-solid'
                          : index < cardIndex
                            ? 'aucctus-bg-primary-solid'
                            : 'bg-transparent'
                      }`}
                      style={{
                        width:
                          index === cardIndex
                            ? `${cardProgress}%`
                            : index < cardIndex
                              ? '100%'
                              : '0%',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='globe'
                className='aucctus-stroke-tertiary h-4 w-4'
              />
              <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                {mockExecutiveDashboardUIText.marketSize.title}
              </h3>
            </div>
            <Button
              color='secondary'
              size='sm'
              onClick={() => navigate('/market-scan')}
              className='aucctus-text-sm-medium aucctus-text-secondary-hover'
            >
              {mockExecutiveDashboardUIText.marketSize.detailsButton}
            </Button>
          </div>

          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Left - Market Summary Text */}
            <div className='flex flex-col justify-center px-2'>
              <p className='aucctus-text-lg aucctus-text-primary leading-tight'>
                {mockMarketSizeData.marketSummary}
              </p>
            </div>

            {/* Right - TAM SAM SOM Nested Squares */}
            <div className='flex min-h-0 items-center justify-center'>
              <div className='relative aspect-square w-full max-w-[200px] overflow-hidden rounded-tl-xl bg-gray-100 shadow-inner'>
                {/* TAM - Outer square */}
                <div className='absolute inset-0 rounded-tl-xl bg-[#F5F3F3] p-2'>
                  <div className='text-xs font-bold text-gray-800'>
                    {mockMarketSizeData.tam}
                  </div>
                  <div className='text-xs font-semibold text-gray-800'>TAM</div>
                </div>

                {/* SAM - Middle square */}
                <div className='absolute bottom-0 right-0 h-[60%] w-[60%] rounded-tl-xl bg-[#DAD5D5] p-2'>
                  <div className='text-xs font-bold text-gray-800'>
                    {mockMarketSizeData.sam}
                  </div>
                  <div className='text-xs font-semibold text-gray-800'>SAM</div>
                </div>

                {/* SOM - Inner square */}
                <div className='absolute bottom-0 right-0 h-[36%] w-[36%] rounded-tl-xl bg-[#514141] p-2 shadow-md'>
                  <div className='text-xs font-bold text-white'>
                    {mockMarketSizeData.som}
                  </div>
                  <div className='text-xs font-semibold text-white'>SOM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [navigate],
  );

  // Tab summary cards for carousel - exact order from lovable ExecutiveDashboard
  const tabSummaryCards: TabSummaryCard[] = [
    { component: MarketSizeCard },
    {
      component: (props: CardComponentProps) => (
        <TrendsDriversCard
          currentCardIndex={props.currentCardIndex}
          progress={props.progress}
          totalCards={props.totalCards}
          onCardClick={props.onCardClick}
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
        />
      ),
    },
  ];

  // Auto-progression logic
  useEffect(() => {
    if (!isAutoPlaying) return;

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

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Section with Concept Image and Value Prop */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left - Concept Image */}
        <div className='flex h-full items-start justify-center'>
          <div className='aucctus-bg-primary aucctus-border-secondary relative h-full w-full overflow-hidden rounded-xl border shadow-lg'>
            <img
              src={images.aiExplorationsBackground}
              alt={mockExecutiveDashboardUIText.conceptVisualization.altText}
              className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
            <div className='absolute bottom-4 left-4 right-4'>
              <Badge.Default
                value={
                  mockExecutiveDashboardUIText.conceptVisualization.badgeText
                }
                classNameBadge='aucctus-bg-primary aucctus-text-primary aucctus-border-primary'
              />
            </div>
          </div>
        </div>

        {/* Right - What is it, Value Proposition and Problem Statement */}
        <div className='space-y-6'>
          <InfoSectionCard
            iconVariant='lightbulb'
            title={mockExecutiveDashboardUIText.sections.whatIsIt}
            content={mockConceptOverview.whatIsIt}
          />

          <InfoSectionCard
            iconVariant='target'
            title={mockExecutiveDashboardUIText.sections.valueProposition}
            content={mockConceptOverview.valueProposition}
          />

          <InfoSectionCard
            iconVariant='alert-triangle'
            title={mockExecutiveDashboardUIText.sections.problemStatement}
            content={mockConceptOverview.problemStatement}
          />
        </div>
      </div>

      {/* Three Column Layout: Differentiators, Our Right to Win, Tab Summary Carousel */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
        {/* Differentiators Card */}
        <div className='aucctus-border-secondary aucctus-bg-secondary h-[320px] rounded-lg border lg:col-span-1'>
          <div className='flex h-full flex-col p-6'>
            <h3 className='aucctus-header-xs-semibold aucctus-text-primary mb-4 flex items-center gap-2'>
              <Icon
                variant='star-01'
                className='aucctus-stroke-info-primary h-5 w-5'
              />
              {mockExecutiveDashboardUIText.sections.differentiators}
            </h3>

            <div className='flex-1 space-y-3'>
              {mockDifferentiators.map((differentiator) => (
                <div
                  key={differentiator.id}
                  className='aucctus-border-info-extra-subtle aucctus-bg-info-subtle rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <div className='aucctus-bg-info-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full'>
                      <span className='aucctus-text-xs-semibold aucctus-text-info-primary'>
                        {differentiator.id}
                      </span>
                    </div>
                    <p className='aucctus-text-xs aucctus-text-primary'>
                      {differentiator.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Right to Win Card */}
        <div className='aucctus-border-secondary aucctus-bg-secondary h-[320px] rounded-lg border lg:col-span-1'>
          <div className='flex h-full flex-col p-6'>
            <h3 className='aucctus-header-xs-semibold aucctus-text-primary mb-4 flex items-center gap-2'>
              <Icon
                variant='target'
                className='aucctus-stroke-success-primary h-5 w-5'
              />
              {mockExecutiveDashboardUIText.sections.ourRightToWin}
            </h3>

            <div className='flex-1 space-y-3'>
              {mockRightToWin.map((item) => (
                <div
                  key={item.id}
                  className='aucctus-border-success-extra-subtle aucctus-bg-success-subtle rounded-lg border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <div className='aucctus-bg-success-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full'>
                      <span className='aucctus-text-xs-semibold aucctus-text-success-primary'>
                        {item.id}
                      </span>
                    </div>
                    <p className='aucctus-text-xs aucctus-text-primary'>
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Summary Cards with Progress Navigation */}
        <div className='relative h-fit lg:col-span-2'>
          {/* Current Card Display */}
          <div
            className='min-h-[400px] transition-all duration-500 ease-in-out'
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
