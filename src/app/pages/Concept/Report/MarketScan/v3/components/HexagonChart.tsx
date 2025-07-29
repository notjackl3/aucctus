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

// Helper function to group overlapping categories
const groupOverlappingCategories = (
  categories: IMarketForceV3[],
  centerX: number,
  centerY: number,
  maxRadius: number,
  threshold: number = 20, // Distance threshold for considering items as overlapping
) => {
  const groups: Array<{
    categories: IMarketForceV3[];
    x: number;
    y: number;
    angle: number;
  }> = [];

  categories.forEach((category, index) => {
    const angle = (index / categories.length) * 2 * Math.PI - Math.PI / 2;
    const radarValue = getRadarValueFromCategory(category);
    const invertedRadarValue = 10 - radarValue;
    const radius = (invertedRadarValue / 10) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Find existing group within threshold distance
    const existingGroup = groups.find((group) => {
      const distance = Math.sqrt(
        Math.pow(group.x - x, 2) + Math.pow(group.y - y, 2),
      );
      return distance <= threshold;
    });

    if (existingGroup) {
      existingGroup.categories.push(category);
    } else {
      groups.push({
        categories: [category],
        x,
        y,
        angle,
      });
    }
  });

  return groups;
};

// Helper function to calculate stacked positions for overlapping icons
const calculateStackedPositions = (
  groupCategories: IMarketForceV3[],
  baseX: number,
  baseY: number,
  selectedCategory: IMarketForceV3,
) => {
  const stackOffset = 8; // Offset distance for stacking
  const positions: Array<{
    category: IMarketForceV3;
    x: number;
    y: number;
    zIndex: number;
    scale: number;
  }> = [];

  // Sort categories to put selected one on top
  const sortedCategories = [...groupCategories].sort((a, b) => {
    if (a.uuid === selectedCategory.uuid) return 1; // Selected goes last (on top)
    if (b.uuid === selectedCategory.uuid) return -1;
    return 0;
  });

  sortedCategories.forEach((category, index) => {
    const isSelected = category.uuid === selectedCategory.uuid;
    const stackIndex = index;

    // Calculate stacked position in a small arc pattern
    const angle =
      ((stackIndex / Math.max(1, sortedCategories.length - 1)) * Math.PI) / 3 -
      Math.PI / 6;
    const offsetX =
      stackIndex > 0 ? stackOffset * Math.cos(angle) * stackIndex * 0.7 : 0;
    const offsetY =
      stackIndex > 0 ? stackOffset * Math.sin(angle) * stackIndex * 0.7 : 0;

    positions.push({
      category,
      x: baseX + offsetX,
      y: baseY + offsetY,
      zIndex: isSelected ? 100 : 10 + stackIndex,
      scale: isSelected ? 1.1 : Math.max(0.8, 1 - stackIndex * 0.1),
    });
  });

  return positions;
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

  // Group overlapping categories
  const overlappingGroups = groupOverlappingCategories(
    trendCategories,
    centerX,
    centerY,
    outerRadius,
  );

  // Calculate all icon positions with stacking
  const allIconPositions = overlappingGroups.flatMap((group) =>
    calculateStackedPositions(
      group.categories,
      group.x,
      group.y,
      selectedCategory,
    ),
  );

  // Sort positions by zIndex for proper rendering order
  const sortedPositions = [...allIconPositions].sort(
    (a, b) => a.zIndex - b.zIndex,
  );

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

        {/* Drop shadow filter for selected items */}
        <filter
          id='selectedShadow'
          x='-50%'
          y='-50%'
          width='200%'
          height='200%'
        >
          <feDropShadow
            dx='0'
            dy='2'
            stdDeviation='3'
            floodColor='#1d4ed8'
            floodOpacity='0.3'
          />
        </filter>

        {/* Glow effect for selected items */}
        <filter id='selectedGlow' x='-50%' y='-50%' width='200%' height='200%'>
          <feGaussianBlur stdDeviation='2' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
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

        // Calculate the data point position for this category
        const radarValue = getRadarValueFromCategory(category);
        const invertedRadarValue = 10 - radarValue;
        const dataRadius = (invertedRadarValue / 10) * outerRadius;

        // Hide the category icon if the data point is too close to the edge (> 85% of max radius)
        const shouldHideIcon = dataRadius > outerRadius * 0.85;

        if (shouldHideIcon) {
          return null; // Don't render the icon when data point is at the edge
        }

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

      {/* Overlapping group indicators - show count when multiple items at same position */}
      {overlappingGroups.map((group, groupIndex) => {
        if (group.categories.length <= 1) return null;

        return (
          <g key={`group-indicator-${groupIndex}`}>
            {/* Background circle for count */}
            <circle
              cx={group.x + 12}
              cy={group.y - 12}
              r={8}
              fill='#ef4444'
              stroke='white'
              strokeWidth='2'
              className='opacity-90'
            />
            {/* Count text */}
            <text
              x={group.x + 12}
              y={group.y - 12}
              textAnchor='middle'
              dominantBaseline='central'
              className='fill-white text-xs font-bold'
              fontSize='10'
            >
              {group.categories.length}
            </text>
          </g>
        );
      })}

      {/* Data points with icons - rendered in z-index order */}
      {sortedPositions.map((position, index) => {
        const { category, x, y, zIndex, scale } = position;
        const isSelected = category.uuid === selectedCategory.uuid;
        const dotRadius = (isSelected ? 14 : 12) * scale;
        const strokeWidth = isSelected ? 3 : 2;
        const iconSize = (isSelected ? 16 : 14) * scale;

        return (
          <g
            key={`${category.uuid}-${index}`}
            style={{ zIndex }}
            filter={isSelected ? 'url(#selectedShadow)' : undefined}
          >
            {/* Selection ring for selected item */}
            {isSelected && (
              <circle
                cx={x}
                cy={y}
                r={dotRadius + 4}
                fill='none'
                stroke='#1d4ed8'
                strokeWidth='2'
                strokeOpacity='0.6'
                className='animate-pulse'
              />
            )}

            {/* Clickable background circle */}
            <circle
              cx={x}
              cy={y}
              r={dotRadius}
              fill={isSelected ? '#1d4ed8' : '#3b82f6'}
              stroke='white'
              strokeWidth={strokeWidth}
              className={cn({
                'cursor-pointer transition-all duration-200': true,
                'hover:fill-blue-600': !isSelected,
                'opacity-90': !isSelected && scale < 1,
                'opacity-100': isSelected || scale >= 1,
              })}
              onClick={() => onCategorySelect(category)}
              style={{
                filter: isSelected ? 'url(#selectedGlow)' : undefined,
              }}
            />

            {/* Icon inside the dot */}
            <foreignObject
              x={x - iconSize / 2}
              y={y - iconSize / 2}
              width={iconSize}
              height={iconSize}
              className='pointer-events-none cursor-pointer'
            >
              <Icon
                variant={category.icon as IconVariant}
                className={cn({
                  'aucctus-stroke-white transition-all duration-200': true,
                  'opacity-90': !isSelected && scale < 1,
                  'opacity-100': isSelected || scale >= 1,
                })}
                style={{
                  display: 'block',
                  margin: 'auto',
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                }}
              />
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
};

export default HexagonChart;
