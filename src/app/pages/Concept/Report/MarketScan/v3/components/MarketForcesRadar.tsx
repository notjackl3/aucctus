import React from 'react';
import { Badge, Button, Icon, Loading } from '@components';
import { cn } from '@libs/utils/react';
import type {
  IconVariant,
  IMarketForceV3,
} from '@libs/api/types/concept/marketScan';
import { useMarketScanMarketForcesV3 } from '@hooks/query/concepts.hook';
import HexagonChart from './HexagonChart';
import RadarLegend from './RadarLegend';

// Extended interface to include additional properties from the API
interface ExtendedMarketForce extends IMarketForceV3 {
  score?: number;
  grading?: string;
}

interface MarketForcesRadarProps {
  conceptUuid: string;
  trendCategories: IMarketForceV3[];
  selectedCategory: IMarketForceV3;
  onCategorySelect: (category: IMarketForceV3) => void;
}

const MarketForcesRadar: React.FC<MarketForcesRadarProps> = ({
  conceptUuid,
  trendCategories,
  selectedCategory,
  onCategorySelect,
}) => {
  const { isLoading, error } = useMarketScanMarketForcesV3(conceptUuid);

  // Function to get the inverted radar value to match the chart positioning
  const getInvertedRadarValue = (radarValue: number) => {
    return 10 - radarValue;
  };
  // Function to get category text directly from API grading
  const getCategoryText = (category: IMarketForceV3) => {
    const extendedCategory = category as ExtendedMarketForce;
    return extendedCategory.grading || 'Headwinds & Tailwinds';
  };

  // Function to get gradient color based on radar position
  const getGradientColor = (radarValue: number) => {
    const invertedValue = getInvertedRadarValue(radarValue);
    const normalizedPosition = invertedValue / 10; // 0 to 1 where 0 = center (red), 1 = edge (green)

    if (normalizedPosition <= 0.5) {
      // Interpolate between red (center) and yellow (middle)
      const ratio = normalizedPosition * 2; // 0 to 1
      const red = Math.round(239 + (252 - 239) * ratio); // 239 to 252
      const green = Math.round(68 + (211 - 68) * ratio); // 68 to 211
      const blue = Math.round(68 + (77 - 68) * ratio); // 68 to 77
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Interpolate between yellow (middle) and green (edge)
      const ratio = (normalizedPosition - 0.5) * 2; // 0 to 1
      const red = Math.round(252 + (16 - 252) * ratio); // 252 to 16
      const green = Math.round(211 + (185 - 211) * ratio); // 211 to 185
      const blue = Math.round(77 + (129 - 77) * ratio); // 77 to 129
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  // Function to get darker border color
  const getBorderColor = (radarValue: number) => {
    const invertedValue = getInvertedRadarValue(radarValue);
    const normalizedPosition = invertedValue / 10;

    if (normalizedPosition <= 0.5) {
      const ratio = normalizedPosition * 2;
      const red = Math.round(220 + (235 - 220) * ratio);
      const green = Math.round(50 + (180 - 50) * ratio);
      const blue = Math.round(50 + (60 - 50) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      const ratio = (normalizedPosition - 0.5) * 2;
      const red = Math.round(235 + (5 - 235) * ratio);
      const green = Math.round(180 + (160 - 180) * ratio);
      const blue = Math.round(60 + (110 - 60) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  const getTabButtonStyle = (category: IMarketForceV3, isSelected: boolean) => {
    const grading = getCategoryText(category);

    if (grading === 'Mostly Headwinds') {
      // Mostly headwinds (Red)
      return cn({
        'aucctus-text-error-primary': true,
        'ring-red-400': isSelected,
        'ring-2 ring-offset-2': isSelected,
      });
    } else if (grading === 'Mostly Tailwinds') {
      // Mostly tailwinds (Green)
      return cn({
        'aucctus-text-success-primary': true,
        'ring-green-400': isSelected,
        'ring-2 ring-offset-2': isSelected,
      });
    } else {
      // Mixed signals (Yellow)
      return cn({
        'aucctus-text-warning-primary': true,
        'ring-yellow-400': isSelected,
        'ring-2 ring-offset-2': isSelected,
      });
    }
  };

  // Helper function to derive radar value from market force category
  const getRadarValueFromCategory = (category: IMarketForceV3): number => {
    // Cast to extended type
    const extendedCategory = category as ExtendedMarketForce;

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

  // Group categories by grading attribute
  const groupedCategories = {
    mostlyHeadwinds: trendCategories.filter(
      (cat) => getCategoryText(cat) === 'Mostly Headwinds',
    ),
    mixed: trendCategories.filter(
      (cat) => getCategoryText(cat) === 'Headwinds & Tailwinds',
    ),
    mostlyTailwinds: trendCategories.filter(
      (cat) => getCategoryText(cat) === 'Mostly Tailwinds',
    ),
  };

  // Create array for 2 rows of 3 buttons each
  const allCategories = [
    ...groupedCategories.mostlyHeadwinds,
    ...groupedCategories.mixed,
    ...groupedCategories.mostlyTailwinds,
  ];
  const firstRow = allCategories.slice(0, 3);
  const secondRow = allCategories.slice(3, 6);

  if (isLoading) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
        <div className='flex h-64 items-center justify-center'>
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
        <div className='flex h-64 items-center justify-center'>
          <p className='aucctus-text-error-primary'>
            Error loading market forces data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
      <div className='relative p-6'>
        <div className='mb-4'>
          <div className='mb-1 flex items-center gap-2'>
            <Icon
              variant='trendup'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
              Market Forces Radar
            </h3>
          </div>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Analysis of external factors that could impact your concept
          </p>
        </div>
        {/* Legend positioned in top right */}
        <div className='absolute right-6 top-6'>
          <RadarLegend />
        </div>
      </div>

      <div className='p-4'>
        <div className='flex flex-col pr-6 lg:flex-row'>
          {/* Radar Chart Section */}
          <div className='flex w-fit flex-shrink-0 flex-col'>
            <div className='mb-4'>
              <HexagonChart
                trendCategories={trendCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={onCategorySelect}
              />
            </div>
          </div>

          {/* Category Details Section */}
          <div className='flex min-w-0 flex-1 flex-col'>
            {/* Tab Buttons in 2 rows of 3 */}
            <div className='mb-6 flex flex-col gap-3'>
              {/* First Row */}
              <div className='grid grid-cols-3 gap-3'>
                {firstRow.map((category) => {
                  const isSelected = selectedCategory.uuid === category.uuid;
                  const radarValue = getRadarValueFromCategory(category);

                  return (
                    <Button
                      key={category.uuid}
                      color='light'
                      size='md'
                      onClick={() => onCategorySelect(category)}
                      className={cn({
                        'aucctus-text-sm-semibold flex h-auto w-full items-center justify-center gap-2 px-4 py-3 transition-all':
                          true,
                        [getTabButtonStyle(category, isSelected)]: true,
                      })}
                      style={{
                        backgroundColor: getGradientColor(radarValue),
                        borderColor: getBorderColor(radarValue),
                        borderWidth: '2px',
                        minHeight: '44px',
                      }}
                    >
                      <Icon
                        variant={category.icon as IconVariant}
                        className='aucctus-stroke-primary h-5 w-5 opacity-80 mix-blend-hard-light'
                      />
                      <span className='aucctus-text-primary aucctus-text-sm opacity-80 mix-blend-hard-light'>
                        {category.category}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {/* Second Row */}
              {secondRow.length > 0 && (
                <div className='grid grid-cols-3 gap-3'>
                  {secondRow.map((category) => {
                    const isSelected = selectedCategory.uuid === category.uuid;
                    const radarValue = getRadarValueFromCategory(category);

                    return (
                      <Button
                        key={category.uuid}
                        color='light'
                        size='md'
                        onClick={() => onCategorySelect(category)}
                        className={cn({
                          'aucctus-text-sm-semibold flex h-auto w-full items-center justify-center gap-2 px-4 py-3 transition-all':
                            true,
                          [getTabButtonStyle(category, isSelected)]: true,
                        })}
                        style={{
                          backgroundColor: getGradientColor(radarValue),
                          borderColor: getBorderColor(radarValue),
                          borderWidth: '2px',
                          minHeight: '44px',
                        }}
                      >
                        <Icon
                          variant={category.icon as IconVariant}
                          className='aucctus-stroke-primary h-5 w-5 opacity-80 mix-blend-hard-light'
                        />
                        <span className='aucctus-text-primary aucctus-text-sm opacity-80 mix-blend-hard-light'>
                          {category.category}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className='flex-1'>
              <div className='mb-3 flex items-center gap-3'>
                <Icon
                  variant={selectedCategory.icon as IconVariant}
                  className='aucctus-stroke-primary h-6 w-6'
                />
                <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
                  {selectedCategory.category}
                </h3>
                <Badge.Default
                  value={getCategoryText(selectedCategory)}
                  classNameBadge={cn({
                    'aucctus-border-error-subtle aucctus-bg-error-secondary aucctus-text-sm-semibold border':
                      getCategoryText(selectedCategory) === 'Mostly Headwinds',
                    'aucctus-border-success-subtle aucctus-bg-success-secondary border':
                      getCategoryText(selectedCategory) === 'Mostly Tailwinds',
                    'aucctus-border-warning-subtle aucctus-bg-warning-secondary border':
                      getCategoryText(selectedCategory) ===
                      'Headwinds & Tailwinds',
                  })}
                  classNameLabel={'mix-blend-color-burn text-primary-950'}
                />
              </div>

              <p className='aucctus-text-sm aucctus-text-secondary mb-4 leading-relaxed'>
                {selectedCategory.summary}
              </p>

              <div>
                <h4 className='aucctus-text-sm-semibold aucctus-text-tertiary mb-2'>
                  IMPACT
                </h4>
                <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                  {selectedCategory.impact}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketForcesRadar;
