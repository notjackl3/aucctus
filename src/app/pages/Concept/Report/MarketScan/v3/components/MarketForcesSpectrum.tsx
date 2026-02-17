import React from 'react';
import { cn } from '@libs/utils/react';
import type { IMarketForceV3 } from '@libs/api/types/concept/marketScan';
import { DynamicIcon } from '@libs/utils/iconMap';

interface MarketForcesSpectrumProps {
  trendCategories: IMarketForceV3[];
  selectedCategory: IMarketForceV3;
  onCategorySelect: (category: IMarketForceV3) => void;
}

// Helper function to get radar value from market force category
const getRadarValueFromCategory = (category: IMarketForceV3): number => {
  // Cast to extended type to access score property
  const extendedCategory = category as any;

  // Use the score property from the API data (0-100 scale, convert to 0-10)
  if (typeof extendedCategory.score === 'number') {
    return extendedCategory.score / 10; // Convert 0-100 to 0-10
  }

  // Fallback based on grading if score is not available
  if (extendedCategory.grading === 'Mostly Headwinds') {
    return 8; // High headwind value
  } else if (extendedCategory.grading === 'Mostly Tailwinds') {
    return 2; // High tailwind value
  }

  // Default middle value for mixed or unknown
  return 5;
};

const MarketForcesSpectrum: React.FC<MarketForcesSpectrumProps> = ({
  trendCategories,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className='aucctus-bg-primary rounded-lg p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
          Market Forces Spectrum
        </h3>
      </div>

      <div className='flex flex-col gap-4'>
        {trendCategories.map((category) => {
          const radarValue = getRadarValueFromCategory(category);
          const isSelected = selectedCategory.uuid === category.uuid;

          // Calculate position on spectrum based on radar value
          // 0 = strong tailwind (left), 10 = strong headwind (right)
          const position = `${radarValue * 10}%`;

          return (
            <div
              key={category.uuid}
              className={cn({
                'aucctus-bg-secondary rounded-lg p-3 transition-all': true,
                'ring-2 ring-blue-400 ring-offset-2': isSelected,
              })}
              onClick={() => onCategorySelect(category)}
            >
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <DynamicIcon
                    variant={category.icon as string}
                    className='aucctus-stroke-brand-primary h-5 w-5'
                  />
                  <span className='aucctus-text-md-semibold aucctus-text-primary'>
                    {category.category}
                  </span>
                </div>
              </div>

              {/* Spectrum bar */}
              <div className='relative h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400'>
                {/* Position indicator */}
                <div
                  className='absolute -top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md'
                  style={{ left: position, transform: 'translateX(-50%)' }}
                ></div>
              </div>

              <div className='mt-3 flex justify-between text-xs'>
                <span className='aucctus-text-success-primary font-medium'>
                  Strong Tailwind
                </span>
                <span className='aucctus-text-error-primary font-medium'>
                  Strong Headwind
                </span>
              </div>

              <div className='mt-3'>
                <div className='aucctus-text-sm aucctus-text-secondary'>
                  {category.summary}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketForcesSpectrum;
