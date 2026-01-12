import { FunctionComponent, useState, useMemo } from 'react';
import { cn } from '@libs/utils/react';
import type { IRadarPoint, RadarCategory, SignalImpact } from '@libs/api/types';

interface InnovationRadarProps {
  points: IRadarPoint[];
  onPointClick?: (point: IRadarPoint) => void;
  className?: string;
}

// Category configuration with colors and angles
const CATEGORY_CONFIG: Record<
  RadarCategory,
  { label: string; startAngle: number; endAngle: number; color: string }
> = {
  technology: {
    label: 'Technology',
    startAngle: 0,
    endAngle: 72,
    color: '#6366f1', // brand/indigo
  },
  operations: {
    label: 'Operations',
    startAngle: 72,
    endAngle: 144,
    color: '#f59e0b', // warning/amber
  },
  sustainability: {
    label: 'Sustainability',
    startAngle: 144,
    endAngle: 216,
    color: '#22c55e', // success/green
  },
  product: {
    label: 'Product',
    startAngle: 216,
    endAngle: 288,
    color: '#ec4899', // pink
  },
  market: {
    label: 'Market',
    startAngle: 288,
    endAngle: 360,
    color: '#3b82f6', // blue
  },
};

// Time horizon rings
const TIME_HORIZONS = [
  { radius: 0.3, label: 'Now', description: '0-6 months' },
  { radius: 0.55, label: 'Next', description: '6-18 months' },
  { radius: 0.8, label: 'Later', description: '18+ months' },
];

// Impact colors
const IMPACT_COLORS: Record<SignalImpact, string> = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#9ca3af',
};

// Convert polar to cartesian coordinates
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
): { x: number; y: number } => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Create arc path for category segments
const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
};

// Radar point component
interface RadarPointProps {
  point: IRadarPoint;
  cx: number;
  cy: number;
  maxRadius: number;
  onHover: (point: IRadarPoint | null) => void;
  onClick?: (point: IRadarPoint) => void;
  isHovered: boolean;
}

const RadarPointDot: FunctionComponent<RadarPointProps> = ({
  point,
  cx,
  cy,
  maxRadius,
  onHover,
  onClick,
  isHovered,
}) => {
  const categoryConfig = CATEGORY_CONFIG[point.category];
  const angleCenter = (categoryConfig.startAngle + categoryConfig.endAngle) / 2;
  // Add some variance to the angle within the category
  const angleVariance =
    (categoryConfig.endAngle - categoryConfig.startAngle) * 0.3;
  const angle =
    angleCenter + ((point.angularPosition % 100) - 50) * (angleVariance / 50);

  const radius = point.radialPosition * maxRadius;
  const position = polarToCartesian(cx, cy, radius, angle);

  const dotSize =
    point.impact === 'high' ? 10 : point.impact === 'medium' ? 8 : 6;

  return (
    <g
      className='cursor-pointer transition-all duration-200'
      onMouseEnter={() => onHover(point)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick?.(point)}
    >
      {/* Outer glow on hover */}
      {isHovered && (
        <circle
          cx={position.x}
          cy={position.y}
          r={dotSize + 6}
          fill={IMPACT_COLORS[point.impact]}
          opacity={0.2}
          className='animate-pulse'
        />
      )}
      {/* Main dot */}
      <circle
        cx={position.x}
        cy={position.y}
        r={isHovered ? dotSize + 2 : dotSize}
        fill={IMPACT_COLORS[point.impact]}
        stroke='white'
        strokeWidth={2}
        className='transition-all duration-200'
      />
      {/* Label on hover */}
      {isHovered && (
        <g>
          <rect
            x={position.x + 15}
            y={position.y - 12}
            width={point.label.length * 7 + 16}
            height={24}
            rx={4}
            fill='rgba(0,0,0,0.85)'
          />
          <text
            x={position.x + 23}
            y={position.y + 4}
            fill='white'
            fontSize={12}
            fontWeight={500}
          >
            {point.label}
          </text>
        </g>
      )}
    </g>
  );
};

const InnovationRadar: FunctionComponent<InnovationRadarProps> = ({
  points,
  onPointClick,
  className,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<IRadarPoint | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<RadarCategory | null>(null);

  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 40;

  // Filter points by selected category
  const filteredPoints = useMemo(() => {
    if (!selectedCategory) return points;
    return points.filter((p) => p.category === selectedCategory);
  }, [points, selectedCategory]);

  // Group points by category for legend counts
  const pointsByCategory = useMemo(() => {
    const grouped: Record<RadarCategory, number> = {
      technology: 0,
      operations: 0,
      sustainability: 0,
      product: 0,
      market: 0,
    };
    points.forEach((p) => {
      grouped[p.category]++;
    });
    return grouped;
  }, [points]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Radar SVG */}
      <div className='relative'>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className='mx-auto w-full max-w-[400px]'
        >
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={maxRadius}
            fill='none'
            stroke='currentColor'
            strokeWidth={1}
            className='text-gray-200 dark:text-gray-700'
          />

          {/* Category segments (faint background) */}
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const category = key as RadarCategory;
            const isSelected = selectedCategory === category;
            const isFiltered = selectedCategory && !isSelected;

            return (
              <g key={key}>
                {/* Segment arc */}
                <path
                  d={`
                    M ${cx} ${cy}
                    L ${polarToCartesian(cx, cy, maxRadius, config.startAngle).x} ${polarToCartesian(cx, cy, maxRadius, config.startAngle).y}
                    ${describeArc(cx, cy, maxRadius, config.startAngle, config.endAngle)}
                    L ${cx} ${cy}
                    Z
                  `}
                  fill={config.color}
                  opacity={isFiltered ? 0.03 : isSelected ? 0.15 : 0.08}
                  className='transition-opacity duration-200'
                />
                {/* Segment divider line */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={polarToCartesian(cx, cy, maxRadius, config.startAngle).x}
                  y2={polarToCartesian(cx, cy, maxRadius, config.startAngle).y}
                  stroke='currentColor'
                  strokeWidth={1}
                  className='text-gray-200 dark:text-gray-700'
                />
                {/* Category label */}
                {(() => {
                  const labelAngle = (config.startAngle + config.endAngle) / 2;
                  const labelPos = polarToCartesian(
                    cx,
                    cy,
                    maxRadius + 20,
                    labelAngle,
                  );
                  return (
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor='middle'
                      dominantBaseline='middle'
                      fontSize={11}
                      fontWeight={500}
                      fill={isFiltered ? 'currentColor' : config.color}
                      opacity={isFiltered ? 0.4 : 1}
                      className='select-none transition-opacity duration-200'
                    >
                      {config.label}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Time horizon rings */}
          {TIME_HORIZONS.map((horizon, index) => (
            <g key={horizon.label}>
              <circle
                cx={cx}
                cy={cy}
                r={horizon.radius * maxRadius}
                fill='none'
                stroke='currentColor'
                strokeWidth={1}
                strokeDasharray={index === 0 ? 'none' : '4 4'}
                className='text-gray-200 dark:text-gray-700'
              />
            </g>
          ))}

          {/* Center dot */}
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill='currentColor'
            className='text-gray-400'
          />

          {/* Data points */}
          {filteredPoints.map((point) => (
            <RadarPointDot
              key={point.uuid}
              point={point}
              cx={cx}
              cy={cy}
              maxRadius={maxRadius}
              onHover={setHoveredPoint}
              onClick={onPointClick}
              isHovered={hoveredPoint?.uuid === point.uuid}
            />
          ))}
        </svg>

        {/* Time horizon labels (positioned absolutely) */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='relative aspect-square w-full max-w-[400px]'>
            {TIME_HORIZONS.map((horizon) => (
              <div
                key={horizon.label}
                className='absolute left-1/2 flex -translate-x-1/2 flex-col items-center'
                style={{
                  top: `${50 - horizon.radius * 40}%`,
                }}
              >
                <span className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wide'>
                  {horizon.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
        {/* Category filters */}
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const category = key as RadarCategory;
          const isSelected = selectedCategory === category;
          const count = pointsByCategory[category];

          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(isSelected ? null : category)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                isSelected
                  ? 'ring-2 ring-offset-1'
                  : 'opacity-80 hover:opacity-100',
              )}
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
                ...(isSelected && { ringColor: config.color }),
              }}
            >
              <span
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: config.color }}
              />
              {config.label}
              <span className='opacity-60'>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Impact legend */}
      <div className='mt-4 flex items-center justify-center gap-4 text-xs'>
        <span className='aucctus-text-tertiary'>Impact:</span>
        {Object.entries(IMPACT_COLORS).map(([impact, color]) => (
          <div key={impact} className='flex items-center gap-1.5'>
            <span
              className='h-2.5 w-2.5 rounded-full'
              style={{ backgroundColor: color }}
            />
            <span className='aucctus-text-secondary capitalize'>{impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InnovationRadar;
