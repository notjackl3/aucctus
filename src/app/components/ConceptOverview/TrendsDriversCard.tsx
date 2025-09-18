import { Button, Icon } from '@components';
import HexagonChart from '@pages/Concept/Report/MarketScan/v3/components/HexagonChart';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface TrendsDriversCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
  conceptId?: string;
  conceptUuid?: string;
  // Centralized data props
  marketForces?: any[];
  isLoadingMarketForces?: boolean;
  executiveSummary?: string;
}

const TrendsDriversCard: React.FC<TrendsDriversCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
  conceptId,
  conceptUuid,
  marketForces = [],
  isLoadingMarketForces = false,
  executiveSummary,
}) => {
  const navigate = useNavigate();

  // Use the passed-in data
  const displayMarketForces = marketForces.length > 0 ? marketForces : [];
  const selectedCategory = displayMarketForces[0] || null;

  const isLoading = isLoadingMarketForces;

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/concept/${conceptId}/market-scan?tab=trends-drivers`);
    },
    [navigate, conceptId],
  );

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      onCardClick(index);
    },
    [onCardClick],
  );

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary h-full cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
      <div className='flex h-full flex-col p-6'>
        {/* Progress Bar Navigation */}
        <div className='mb-4'>
          <div className='flex gap-2'>
            {Array.from({ length: totalCards }).map((_, index) => (
              <div key={index} className='flex-1'>
                <div
                  className='aucctus-bg-disabled h-1 cursor-pointer overflow-hidden rounded-full'
                  onClick={(e) => handleProgressBarClick(e, index)}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      index === currentCardIndex
                        ? 'aucctus-bg-primary-solid'
                        : index < currentCardIndex
                          ? 'aucctus-bg-primary-solid'
                          : 'bg-transparent'
                    }`}
                    style={{
                      width:
                        index === currentCardIndex
                          ? `${progress}%`
                          : index < currentCardIndex
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
              variant='line-chart-up'
              className='aucctus-stroke-tertiary h-4 w-4'
            />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              Trends & Drivers
            </h3>
          </div>
          <Button
            color='secondary'
            size='sm'
            onClick={handleDetailsClick}
            className='aucctus-text-sm-medium aucctus-text-secondary-hover'
          >
            Details
          </Button>
        </div>

        {executiveSummary ? (
          // Two-column layout: Summary + Visualization
          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex flex-col justify-center px-2'>
              {isLoading ? (
                <div className='aucctus-text-lg aucctus-text-secondary'>
                  Loading trends analysis...
                </div>
              ) : (
                <p className='aucctus-text-sm aucctus-text-primary'>
                  {executiveSummary}
                </p>
              )}
            </div>

            <div className='flex min-h-0 items-center justify-center'>
              <div className='aspect-square max-h-[200px] w-full max-w-[200px]'>
                {isLoading ? (
                  <div className='flex h-full items-center justify-center'>
                    <div className='aucctus-text-sm aucctus-text-secondary'>
                      Loading...
                    </div>
                  </div>
                ) : displayMarketForces.length > 0 ? (
                  <HexagonChart
                    trendCategories={displayMarketForces}
                    selectedCategory={selectedCategory}
                    onCategorySelect={() => {
                      // no-op for overview card
                    }}
                  />
                ) : (
                  <div className='aucctus-text-sm aucctus-text-secondary'>
                    No trends data available
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Single-column layout: Visualization only (expanded)
          <div className='flex flex-1 items-start justify-center px-4 pb-2 pt-0'>
            <div className='aspect-square max-h-[280px] w-full max-w-[280px]'>
              {isLoading ? (
                <div className='flex h-full items-center justify-center'>
                  <div className='aucctus-text-lg aucctus-text-secondary'>
                    Loading trends analysis...
                  </div>
                </div>
              ) : displayMarketForces.length > 0 ? (
                <HexagonChart
                  trendCategories={displayMarketForces}
                  selectedCategory={selectedCategory}
                  onCategorySelect={() => {
                    // no-op for overview card
                  }}
                />
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <div className='aucctus-text-sm aucctus-text-secondary'>
                    No trends data available
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TrendsDriversCard);
