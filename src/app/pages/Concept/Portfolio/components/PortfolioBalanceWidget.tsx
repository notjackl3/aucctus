/**
 * Portfolio Balance Widget
 *
 * Displays a donut chart showing Core/Adjacent/Disruptive portfolio balance
 * with interactive legend and hover states. Also shows AI-generated portfolio
 * insights from bulk priority calculation.
 */

import { IPortfolioSummaryResponse } from '@libs/api/types/concept/concept_priority';
import React, { useCallback, useMemo, useState } from 'react';
import { HorizonData } from '../types';
import PortfolioInsightsCarousel from './PortfolioInsightsCarousel';
import { PieChart } from 'lucide-react';

interface PortfolioBalanceWidgetProps {
  horizonData: HorizonData[];
  totalIdeas: number;
  portfolioSummary?: IPortfolioSummaryResponse | null;
}

/**
 * Donut chart SVG component
 *
 * Uses stroke-based arcs to create a seamless donut ring.
 * All segments share the same center and radius for a smooth appearance.
 */
const DonutChart: React.FC<{
  horizonData: HorizonData[];
  totalIdeas: number;
  hoveredHorizon: string | null;
  onHorizonHover: (horizon: string | null) => void;
}> = ({ horizonData, totalIdeas, hoveredHorizon, onHorizonHover }) => {
  // Chart dimensions - all segments share these exact values
  const centerX = 160;
  const centerY = 160;
  const radius = 105;
  const strokeWidth = 35;

  // Small gap between segments (in degrees) - set to 0 for seamless ring
  const gapAngle = 2;

  const polarToCartesian = useCallback(
    (angle: number, r: number) => ({
      x: centerX + r * Math.cos((angle * Math.PI) / 180),
      y: centerY + r * Math.sin((angle * Math.PI) / 180),
    }),
    [],
  );

  // Build segments - filter out 0% segments first, then calculate angles
  const segments = useMemo(() => {
    const labels = ['CORE', 'ADJACENT', 'DISRUPTIVE'];

    // Filter to only segments with > 0%
    const activeSegments = horizonData
      .map((horizon, index) => ({ horizon, label: labels[index], index }))
      .filter(({ horizon }) => horizon.percentage > 0);

    // Only apply gaps when there are 2+ segments
    // Single segment should be a continuous circle with no gap
    const effectiveGap = activeSegments.length > 1 ? gapAngle : 0;

    // Calculate total gap space needed (gaps between segments, not after the last one)
    const totalGapAngle = effectiveGap * activeSegments.length;
    // Available angle for actual segments
    const availableAngle = 360 - totalGapAngle;

    let currentAngle = -90; // Start at top of circle

    return activeSegments.map(({ horizon, label, index }) => {
      // Calculate segment angle proportional to its percentage
      let segmentAngle = (horizon.percentage / 100) * availableAngle;
      const startAngle = currentAngle;

      // SVG arcs can't render a full 360° circle (start and end points are the same)
      // Cap at 359.9° to ensure the arc renders
      const isFullCircle = segmentAngle >= 359.9;
      if (isFullCircle) {
        segmentAngle = 359.9;
      }

      const endAngle = currentAngle + segmentAngle;

      // Calculate arc path
      const start = polarToCartesian(startAngle, radius);
      const end = polarToCartesian(endAngle, radius);
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;

      const pathData = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;

      // Move to next segment start (add gap only if multiple segments)
      currentAngle = endAngle + effectiveGap;

      return {
        horizon,
        pathData,
        label,
        index,
        segmentAngle,
        isFullCircle,
      };
    });
  }, [horizonData, polarToCartesian]);

  return (
    <svg width='340' height='340' viewBox='0 0 320 320' className='-my-8'>
      <defs>
        {horizonData.map((horizon) => (
          <React.Fragment key={`defs-${horizon.horizon}`}>
            <linearGradient
              id={`gradient-${horizon.horizon}`}
              gradientUnits='userSpaceOnUse'
            >
              <stop offset='0%' stopColor={horizon.color} stopOpacity='1' />
              <stop offset='50%' stopColor={horizon.color} stopOpacity='0.9' />
              <stop
                offset='100%'
                stopColor={horizon.color}
                stopOpacity='0.75'
              />
            </linearGradient>
            <filter
              id={`shadow-${horizon.horizon}`}
              x='-50%'
              y='-50%'
              width='200%'
              height='200%'
            >
              <feDropShadow
                dx='0'
                dy='4'
                stdDeviation='8'
                floodColor={horizon.color}
                floodOpacity='0.3'
              />
            </filter>
          </React.Fragment>
        ))}
      </defs>

      {/* Donut ring segments - segments already filtered to > 0% */}
      {segments.map(({ horizon, pathData, label }) => {
        const isHovered = hoveredHorizon === horizon.horizon;
        return (
          <g key={horizon.horizon}>
            {/* Main arc segment - using butt linecap for clean edges */}
            <path
              d={pathData}
              fill='none'
              stroke={`url(#gradient-${horizon.horizon})`}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              strokeLinecap='butt'
              className='cursor-pointer transition-all duration-200'
              style={{
                filter: isHovered
                  ? `url(#shadow-${horizon.horizon})`
                  : undefined,
              }}
              onMouseEnter={() => onHorizonHover(horizon.horizon)}
              onMouseLeave={() => onHorizonHover(null)}
            />

            {/* Invisible path for text to follow */}
            <path
              id={`textPath-${horizon.horizon}`}
              d={pathData}
              fill='none'
              stroke='none'
            />

            {/* Curved text label - only show on segments >= 15% to avoid warping */}
            {horizon.percentage >= 15 && (
              <text
                className='cursor-pointer transition-opacity duration-200'
                style={{ opacity: isHovered ? 1 : 0.9 }}
                onMouseEnter={() => onHorizonHover(horizon.horizon)}
                onMouseLeave={() => onHorizonHover(null)}
              >
                <textPath
                  href={`#textPath-${horizon.horizon}`}
                  startOffset='50%'
                  textAnchor='middle'
                  dominantBaseline='central'
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    fill: 'white',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </textPath>
              </text>
            )}
          </g>
        );
      })}

      {/* Center text */}
      <g>
        <text
          x='160'
          y='152'
          textAnchor='middle'
          dominantBaseline='middle'
          className='aucctus-text-primary fill-current font-bold'
          style={{ fontSize: '56px' }}
        >
          {totalIdeas}
        </text>
        <text
          x='160'
          y='190'
          textAnchor='middle'
          dominantBaseline='middle'
          className='aucctus-text-secondary fill-current'
          style={{ fontSize: '15px', fontWeight: 500 }}
        >
          Ideas
        </text>
      </g>
    </svg>
  );
};

/**
 * Legend item component
 */
const LegendItem: React.FC<{
  horizon: HorizonData;
  isHovered: boolean;
  onHover: (horizon: string | null) => void;
}> = ({ horizon, onHover }) => {
  // Parse HSL color for background
  const hslMatch = horizon.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  const bgColor = hslMatch
    ? `hsla(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%, 0.08)`
    : horizon.color;
  const borderColor = hslMatch
    ? `hsla(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%, 0.2)`
    : horizon.color;

  return (
    <div
      className='cursor-pointer rounded-lg p-2.5 transition-all duration-300 hover:scale-[1.02]'
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
      }}
      onMouseEnter={() => onHover(horizon.horizon)}
      onMouseLeave={() => onHover(null)}
    >
      <div className='mb-1 flex items-center gap-2'>
        <div
          className='h-2.5 w-2.5 shrink-0 rounded-full'
          style={{ backgroundColor: horizon.color }}
        />
        <p className='aucctus-text-primary aucctus-text-xs font-medium uppercase tracking-wide'>
          {horizon.label}
        </p>
      </div>
      <div className='flex items-baseline gap-1.5'>
        <p className='aucctus-text-primary aucctus-text-xl font-bold'>
          {horizon.percentage}%
        </p>
        <span className='aucctus-text-tertiary aucctus-text-xs'>
          {horizon.count} {horizon.count === 1 ? 'concept' : 'concepts'}
        </span>
      </div>
    </div>
  );
};

/**
 * Hover tooltip component
 */
const HoverTooltip: React.FC<{
  horizon: HorizonData | null;
}> = ({ horizon }) => {
  if (!horizon) return null;

  return (
    <div
      className='aucctus-bg-primary aucctus-border-secondary pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border p-4 shadow-lg backdrop-blur-sm'
      style={{ minWidth: '200px' }}
    >
      <p className='aucctus-text-primary aucctus-text-sm mb-2 font-medium'>
        {horizon.horizon} - {horizon.label}
      </p>
      <div className='aucctus-text-secondary aucctus-text-xs space-y-1'>
        <div className='flex justify-between gap-4'>
          <span>Percentage:</span>
          <span className='font-medium'>{horizon.percentage}%</span>
        </div>
        <div className='flex justify-between gap-4'>
          <span>Concepts:</span>
          <span className='font-medium'>{horizon.count}</span>
        </div>
        <p className='aucctus-text-tertiary mt-2 text-[10px]'>
          {horizon.description}
        </p>
      </div>
    </div>
  );
};

/**
 * Empty state for Portfolio Balance when no horizon data exists
 */
const PortfolioBalanceEmptyState: React.FC = () => (
  <div className='flex flex-1 flex-col items-center justify-center text-center'>
    <PieChart size={48} className='aucctus-stroke-tertiary mb-4 opacity-50' />
    <p className='aucctus-text-secondary aucctus-text-md mb-1'>
      No horizon data available
    </p>
    <p className='aucctus-text-tertiary aucctus-text-sm'>
      Calculate priorities to see your portfolio balance across Core, Adjacent,
      and Disruptive horizons
    </p>
  </div>
);

const PortfolioBalanceWidget: React.FC<PortfolioBalanceWidgetProps> = ({
  horizonData,
  totalIdeas,
}) => {
  const [hoveredHorizon, setHoveredHorizon] = useState<string | null>(null);

  const hoveredData = useMemo(
    () => horizonData.find((h) => h.horizon === hoveredHorizon) || null,
    [horizonData, hoveredHorizon],
  );

  // Check if we have horizon data to display
  const hasHorizonData = horizonData.length > 0;

  return (
    <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-2'>
      {/* Portfolio Balance Card */}
      <div className='aucctus-bg-primary aucctus-border-secondary flex h-[360px] flex-col rounded-lg border p-4 shadow-sm'>
        <div className='mb-2 flex items-center gap-2'>
          <PieChart size={20} className='aucctus-stroke-brand-primary' />
          <h2 className='aucctus-text-primary aucctus-text-xl font-semibold'>
            Portfolio Balance
          </h2>
        </div>

        {hasHorizonData ? (
          /* Donut and Legend side by side */
          <div className='flex flex-1 items-center justify-center gap-4 overflow-hidden px-2 xl:gap-12'>
            {/* Circular Gauge - scales down on smaller screens, negative margins reclaim layout space */}
            <div className='relative -mx-[60px] flex shrink-0 origin-center scale-[0.65] items-center xl:mx-0 xl:scale-100'>
              <DonutChart
                horizonData={horizonData}
                totalIdeas={totalIdeas}
                hoveredHorizon={hoveredHorizon}
                onHorizonHover={setHoveredHorizon}
              />

              {/* Hover tooltip */}
              <HoverTooltip horizon={hoveredData} />
            </div>

            {/* Legend - Vertical stack to the right */}
            <div className='flex w-40 flex-col gap-2'>
              {horizonData.map((horizon) => (
                <LegendItem
                  key={horizon.horizon}
                  horizon={horizon}
                  isHovered={hoveredHorizon === horizon.horizon}
                  onHover={setHoveredHorizon}
                />
              ))}
            </div>
          </div>
        ) : (
          <PortfolioBalanceEmptyState />
        )}
      </div>

      {/* Portfolio Insights Carousel - Uses Portfolio Insights API */}
      <PortfolioInsightsCarousel />
    </div>
  );
};

export default React.memo(PortfolioBalanceWidget);
