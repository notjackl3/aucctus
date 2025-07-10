import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import type {
  IconVariant,
  IMarketForceV3,
} from '@libs/api/types/concept/marketScan';

interface HexagonChartProps {
  trendCategories: IMarketForceV3[];
  selectedCategory: IMarketForceV3;
  onCategorySelect: (category: IMarketForceV3) => void;
}

// Helper function to create hexagon path
const createHexagonPath = (
  centerX: number,
  centerY: number,
  radius: number,
) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * 2 * Math.PI - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
};

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

// Helper function to create radar path
const createRadarPath = (
  categories: IMarketForceV3[],
  centerX: number,
  centerY: number,
  maxRadius: number,
) => {
  const points = categories.map((category, index) => {
    const angle = (index / categories.length) * 2 * Math.PI - Math.PI / 2; // Start from top, same as hexagon
    // Invert the radar value calculation: 10 - radarValue to flip positioning
    const radarValue = getRadarValueFromCategory(category);
    const invertedRadarValue = 10 - radarValue;
    const radius = (invertedRadarValue / 10) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  });

  const pathData =
    points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ') + ' Z';

  return pathData;
};

const HexagonChart: React.FC<HexagonChartProps> = ({
  trendCategories,
  selectedCategory,
  onCategorySelect,
}) => {
  const centerX = 200;
  const centerY = 200;
  const outerRadius = 160;
  const middleRadius = 110;
  const innerRadius = 55;

  return (
    <svg
      width='475'
      height='475'
      viewBox='0 0 400 400'
      className='max-h-full max-w-full'
    >
      {/* Define gradient from center (red) to middle (yellow) to edges (green) */}
      <defs>
        <radialGradient id='radarGradient' cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='#EF4444' stopOpacity='0.9' />
          <stop offset='50%' stopColor='#FCD34D' stopOpacity='0.9' />
          <stop offset='100%' stopColor='#10B981' stopOpacity='0.9' />
        </radialGradient>
      </defs>

      {/* Gradient background hexagon */}
      <path
        d={createHexagonPath(centerX, centerY, outerRadius)}
        fill='url(#radarGradient)'
        stroke='#6b7280'
        strokeWidth='2'
        strokeOpacity='0.3'
      />

      {/* Middle hexagon dividing line - for perspective */}
      <path
        d={createHexagonPath(centerX, centerY, middleRadius)}
        fill='none'
        stroke='#6b7280'
        strokeWidth='1'
        strokeOpacity='0.5'
      />

      {/* Inner hexagon border - just for visual structure */}
      <path
        d={createHexagonPath(centerX, centerY, innerRadius)}
        fill='none'
        stroke='#6b7280'
        strokeWidth='1'
        strokeOpacity='0.4'
      />

      {/* Grid lines from center to each hexagon vertex */}
      {trendCategories.map((category, index) => {
        const angle =
          (index / trendCategories.length) * 2 * Math.PI - Math.PI / 2;
        const endX = centerX + outerRadius * Math.cos(angle);
        const endY = centerY + outerRadius * Math.sin(angle);
        return (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={endX}
            y2={endY}
            stroke='#6b7280'
            strokeWidth='1'
            strokeOpacity='0.4'
          />
        );
      })}

      {/* Data polygon */}
      <path
        d={createRadarPath(trendCategories, centerX, centerY, outerRadius)}
        fill='#3b82f6'
        fillOpacity='0.15'
        stroke='#3b82f6'
        strokeWidth='2'
      />

      {/* Category icons - positioned just outside each hexagon vertex */}
      {trendCategories.map((category, index) => {
        const angle =
          (index / trendCategories.length) * 2 * Math.PI - Math.PI / 2;
        const iconRadius = outerRadius + 14; // Slightly further away
        const iconX = centerX + iconRadius * Math.cos(angle);
        const iconY = centerY + iconRadius * Math.sin(angle);

        return (
          <g key={`icon-${index}`}>
            {/* Icon */}
            <foreignObject
              x={iconX - 10}
              y={iconY - 10}
              width={20}
              height={20}
              className='pointer-events-none'
            >
              <Icon
                variant={category.icon as IconVariant}
                className='aucctus-stroke-secondary h-5 w-5'
                style={{ display: 'block', margin: 'auto' }}
              />
            </foreignObject>
          </g>
        );
      })}

      {/* Data points with icons - using inverted radar values */}
      {trendCategories.map((category, index) => {
        const angle =
          (index / trendCategories.length) * 2 * Math.PI - Math.PI / 2;
        // Invert the radar value calculation: 10 - radarValue to flip positioning
        const radarValue = getRadarValueFromCategory(category);
        const invertedRadarValue = 10 - radarValue;
        const radius = (invertedRadarValue / 10) * outerRadius;
        const dataX = centerX + radius * Math.cos(angle);
        const dataY = centerY + radius * Math.sin(angle);
        const isSelected = selectedCategory.uuid === category.uuid;
        const dotRadius = isSelected ? 14 : 12;
        const strokeWidth = isSelected ? 3 : 2;
        const iconSize = isSelected ? 16 : 14;

        return (
          <g key={index}>
            {/* Clickable background circle */}
            <circle
              cx={dataX}
              cy={dataY}
              r={dotRadius}
              fill={isSelected ? '#1d4ed8' : '#3b82f6'}
              stroke='white'
              strokeWidth={strokeWidth}
              className='cursor-pointer transition-all hover:fill-blue-600'
              onClick={() => onCategorySelect(category)}
            />

            {/* Icon inside the dot */}
            <foreignObject
              x={dataX - iconSize / 2}
              y={dataY - iconSize / 2}
              width={iconSize}
              height={iconSize}
              className='pointer-events-none cursor-pointer'
            >
              <Icon
                variant={category.icon as IconVariant}
                className={cn({
                  'h-4 w-4': iconSize === 16,
                  'h-3.5 w-3.5': iconSize !== 16,
                  'aucctus-stroke-white': true,
                })}
                style={{ display: 'block', margin: 'auto' }}
              />
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
};

export default HexagonChart;
