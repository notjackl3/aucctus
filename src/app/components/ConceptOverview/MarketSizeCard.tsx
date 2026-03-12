import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConceptReportContext } from '@pages/Concept/Report/ConceptReport/ConceptReportContext';
import { executiveDashboardUIText } from './config';
import ProgressBar from './ProgressBar';
import { CircleDollarSign, Globe } from 'lucide-react';

interface MarketSizeData {
  tam: string;
  sam: string;
  som: string;
  marketSummary: string | null;
  growthTrajectory: null;
}

interface ImpactSizeData {
  formattedValue: string;
  summary: string | null;
}

interface MarketSizeCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
  conceptId?: string;
  marketSizeData: MarketSizeData | null;
  impactSizeData?: ImpactSizeData | null;
  isCostSavings?: boolean;
  isLoadingFinancial: boolean;
}

const MarketSizeCard: React.FC<MarketSizeCardProps> = ({
  currentCardIndex: cardIndex,
  progress: cardProgress,
  totalCards,
  onCardClick,
  conceptId,
  marketSizeData,
  impactSizeData,
  isCostSavings,
  isLoadingFinancial,
}) => {
  const navigate = useNavigate();
  const { isReadOnly, navigateToTab } = useConceptReportContext();

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isReadOnly) {
        navigateToTab('financial');
      } else {
        navigate(
          isCostSavings
            ? `/concept/${conceptId}/financial-projection?tab=impact-sizing`
            : `/concept/${conceptId}/financial-projection?tab=market-sizing`,
        );
      }
    },
    [navigate, conceptId, isCostSavings, isReadOnly, navigateToTab],
  );

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full min-h-[350px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
      <div className='flex h-full flex-col p-6'>
        {/* Progress Bar Navigation - Isolated component for performance */}
        <ProgressBar
          currentCardIndex={cardIndex}
          progress={cardProgress}
          totalCards={totalCards}
          onCardClick={onCardClick}
        />

        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {isCostSavings ? (
              <CircleDollarSign className='aucctus-stroke-tertiary h-4 w-4' />
            ) : (
              <Globe className='aucctus-stroke-tertiary h-4 w-4' />
            )}
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              {isCostSavings
                ? executiveDashboardUIText.impactSizing.title
                : executiveDashboardUIText.marketSize.title}
            </h3>
          </div>
          <button
            onClick={handleDetailsClick}
            className='aucctus-bg-primary-hover aucctus-text-sm-medium aucctus-text-secondary-hover rounded-lg px-3 py-1.5'
          >
            {isCostSavings
              ? executiveDashboardUIText.impactSizing.detailsButton
              : executiveDashboardUIText.marketSize.detailsButton}
          </button>
        </div>

        {isCostSavings && impactSizeData ? (
          // Cost-savings mode: Summary + Savings metric
          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Left - Impact Sizing Summary Text */}
            <div className='flex flex-col justify-start px-2 py-2'>
              {isLoadingFinancial ? (
                <div className='aucctus-text-lg aucctus-text-secondary'>
                  Loading impact data...
                </div>
              ) : impactSizeData.summary ? (
                <p className='aucctus-text-md-semibold aucctus-text-primary'>
                  {impactSizeData.summary}
                </p>
              ) : (
                <p className='aucctus-text-md aucctus-text-tertiary'>
                  Cost savings impact analysis based on operational assumptions.
                </p>
              )}
            </div>

            {/* Right - Savings Metric (single row: icon | label → value) */}
            <div className='flex min-h-0 flex-col items-center justify-center'>
              <div className='w-full max-w-[260px]'>
                <div className='aucctus-border-brand aucctus-bg-brand-secondary rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <CircleDollarSign className='aucctus-stroke-brand-primary h-4 w-4' />
                      <span className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                        Savings
                      </span>
                    </div>
                    <div className='aucctus-header-xs-bold aucctus-text-brand-primary'>
                      {impactSizeData.formattedValue}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isCostSavings ? (
          // Cost-savings mode but no data available
          <div className='flex flex-1 items-center justify-center'>
            <p className='aucctus-text-md aucctus-text-tertiary'>
              Impact sizing data not yet available.
            </p>
          </div>
        ) : marketSizeData && marketSizeData.marketSummary ? (
          // Revenue mode: Two-column layout with Summary + TAM/SAM/SOM
          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Left - Market Summary Text */}
            <div className='flex flex-col justify-start px-2 py-2'>
              {isLoadingFinancial ? (
                <div className='aucctus-text-lg aucctus-text-secondary'>
                  Loading market data...
                </div>
              ) : (
                <p className='aucctus-text-md-semibold aucctus-text-primary'>
                  {marketSizeData.marketSummary}
                </p>
              )}
            </div>

            {/* Right - TAM SAM SOM Nested Squares */}
            <div className='flex min-h-0 items-center justify-center'>
              <div className='relative aspect-square w-full max-w-[220px] overflow-hidden rounded-tl-xl bg-gray-100 shadow-inner'>
                {/* TAM - Outer square */}
                <div className='absolute inset-0 rounded-tl-xl bg-[#F5F3F3] p-2'>
                  <div className='text-xs font-bold text-gray-800'>
                    {marketSizeData.tam}
                  </div>
                  <div className='text-xs font-semibold text-gray-800'>TAM</div>
                </div>

                {/* SAM - Middle square */}
                <div className='absolute bottom-0 right-0 h-[60%] w-[60%] rounded-tl-xl bg-[#DAD5D5] p-2'>
                  <div className='text-xs font-bold text-gray-800'>
                    {marketSizeData.sam}
                  </div>
                  <div className='text-xs font-semibold text-gray-800'>SAM</div>
                </div>

                {/* SOM - Inner square */}
                <div className='absolute bottom-0 right-0 h-[36%] w-[36%] rounded-tl-xl bg-[#514141] p-2 shadow-md'>
                  <div className='text-xs font-bold text-white'>
                    {marketSizeData.som}
                  </div>
                  <div className='text-xs font-semibold text-white'>SOM</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Revenue mode: Single-column TAM/SAM/SOM (no summary)
          <div className='flex flex-1 items-center justify-center px-4 py-2'>
            <div className='relative aspect-square w-full max-w-[280px] overflow-hidden rounded-tl-xl bg-gray-100 shadow-inner'>
              {/* TAM - Outer square */}
              <div className='absolute inset-0 rounded-tl-xl bg-[#F5F3F3] p-2'>
                <div className='text-xs font-bold text-gray-800'>
                  {marketSizeData?.tam || 'N/A'}
                </div>
                <div className='text-xs font-semibold text-gray-800'>TAM</div>
              </div>

              {/* SAM - Middle square */}
              <div className='absolute bottom-0 right-0 h-[60%] w-[60%] rounded-tl-xl bg-[#DAD5D5] p-2'>
                <div className='text-xs font-bold text-gray-800'>
                  {marketSizeData?.sam || 'N/A'}
                </div>
                <div className='text-xs font-semibold text-gray-800'>SAM</div>
              </div>

              {/* SOM - Inner square */}
              <div className='absolute bottom-0 right-0 h-[36%] w-[36%] rounded-tl-xl bg-[#514141] p-2 shadow-md'>
                <div className='text-xs font-bold text-white'>
                  {marketSizeData?.som || 'N/A'}
                </div>
                <div className='text-xs font-semibold text-white'>SOM</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketSizeCard;
