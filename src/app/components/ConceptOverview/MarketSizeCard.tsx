import { Button, Icon } from '@components';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { executiveDashboardUIText } from './config';
import ProgressBar from './ProgressBar';

interface MarketSizeData {
  tam: string;
  sam: string;
  som: string;
  marketSummary: string | null;
  growthTrajectory: null;
}

interface MarketSizeCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
  conceptId?: string;
  marketSizeData: MarketSizeData | null;
  isLoadingFinancial: boolean;
}

const MarketSizeCard: React.FC<MarketSizeCardProps> = ({
  currentCardIndex: cardIndex,
  progress: cardProgress,
  totalCards,
  onCardClick,
  conceptId,
  marketSizeData,
  isLoadingFinancial,
}) => {
  const navigate = useNavigate();

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary h-full min-h-[350px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
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
            <Icon variant='globe' className='aucctus-stroke-tertiary h-4 w-4' />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              {executiveDashboardUIText.marketSize.title}
            </h3>
          </div>
          <Button
            color='secondary'
            size='sm'
            onClick={() =>
              navigate(
                `/concept/${conceptId}/financial-projection?tab=market-sizing`,
              )
            }
            className='aucctus-text-sm-medium aucctus-text-secondary-hover'
          >
            {executiveDashboardUIText.marketSize.detailsButton}
          </Button>
        </div>

        {marketSizeData && marketSizeData.marketSummary ? (
          // Two-column layout: Summary + Visualization
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
          // Single-column layout: Visualization only (expanded)
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
