import { FunctionComponent, useState, useMemo, useRef } from 'react';
import { cn } from '@libs/utils/react';
import { Scale, Building2, TrendingUp, Rocket } from 'lucide-react';
import { ComponentTooltip } from '@components';
import type {
  IRadarBlip,
  InsightClassification,
  TimeHorizon,
} from '@libs/api/types/strategicForesight';
import styles from '../../signal-scanning.module.scss';

interface ConstellationRadarProps {
  blips: IRadarBlip[];
  inactiveBlips?: IRadarBlip[];
  selectedBlipUuid?: string | null;
  onBlipSelect?: (blip: IRadarBlip) => void;
  filterClassification?: InsightClassification | 'all';
  className?: string;
}

// Time horizon rings with executive language
const TIME_HORIZONS: Array<{
  id: TimeHorizon;
  radius: number;
  label: string;
  description: string;
}> = [
  { id: 'immediate', radius: 0.3, label: 'IMMEDIATE', description: '0-6 mo' },
  { id: 'near_term', radius: 0.6, label: 'STRATEGIC', description: '6-18 mo' },
  { id: 'long_term', radius: 0.9, label: 'HORIZON', description: '18+ mo' },
];

// Quadrant configuration for signal themes
// Angular positions: 0° = top, 90° = right, 180° = bottom, 270° = left
const QUADRANT_CONFIG: Array<{
  theme: string;
  label: string;
  angle: number; // Center angle of quadrant
  Icon: typeof Scale;
}> = [
  { theme: 'regulatory_change', label: 'Regulation', angle: 0, Icon: Scale },
  {
    theme: 'competitor_announcement',
    label: 'Competitor',
    angle: 90,
    Icon: Building2,
  },
  {
    theme: 'investment_activity',
    label: 'Investment',
    angle: 180,
    Icon: TrendingUp,
  },
  { theme: 'startup_launch', label: 'Startup', angle: 270, Icon: Rocket },
];

// Classification colors - using CSS custom properties for theme support
const CLASSIFICATION_CONFIG: Record<
  InsightClassification,
  {
    solidClass: string;
    textClass: string;
    glowClass: string;
    color: string;
    label: string;
  }
> = {
  threat: {
    solidClass: 'aucctus-bg-error-solid',
    textClass: 'aucctus-text-error-primary',
    glowClass: 'shadow-[0_0_12px_rgba(220,38,38,0.5)]',
    color: 'var(--color-error-500, #ef4444)',
    label: 'Threat',
  },
  opportunity: {
    solidClass: 'aucctus-bg-success-solid',
    textClass: 'aucctus-text-success-primary',
    glowClass: 'shadow-[0_0_12px_rgba(22,163,74,0.5)]',
    color: 'var(--color-success-500, #22c55e)',
    label: 'Opportunity',
  },
  watch: {
    solidClass: 'aucctus-bg-warning-solid',
    textClass: 'aucctus-text-warning-primary',
    glowClass: 'shadow-[0_0_12px_rgba(234,88,12,0.5)]',
    color: 'var(--color-warning-500, #f59e0b)',
    label: 'Watch',
  },
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

// Get radius position based on time horizon
const getRadiusForTimeHorizon = (timeHorizon: TimeHorizon): number => {
  const horizon = TIME_HORIZONS.find((h) => h.id === timeHorizon);
  return horizon?.radius ?? 0.5;
};

// Radar blip component
interface RadarBlipProps {
  blip: IRadarBlip;
  cx: number;
  cy: number;
  maxRadius: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (blip: IRadarBlip | null) => void;
  onClick: (blip: IRadarBlip) => void;
  inactive?: boolean;
}

const RadarBlipDot: FunctionComponent<RadarBlipProps> = ({
  blip,
  cx,
  cy,
  maxRadius,
  isHovered,
  isSelected,
  onHover,
  onClick,
  inactive = false,
}) => {
  const config = CLASSIFICATION_CONFIG[blip.classification];
  const radius = getRadiusForTimeHorizon(blip.timeHorizon) * maxRadius;
  const position = polarToCartesian(cx, cy, radius, blip.angularPosition);

  // Size based on impact (smaller for inactive)
  const baseDotSize =
    blip.impact === 'high' ? 10 : blip.impact === 'medium' ? 8 : 6;
  const dotSize = inactive ? baseDotSize * 0.7 : baseDotSize;
  const isActive = (isHovered || isSelected) && !inactive;

  // Color for inactive blips
  const blipColor = inactive ? 'var(--color-gray-400, #9ca3af)' : config.color;
  const blipOpacity = inactive ? 0.4 : 1;

  return (
    <g
      className={styles.radarBlip}
      onMouseEnter={() => onHover(blip)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(blip)}
      style={{ opacity: blipOpacity }}
    >
      {/* Glow filter */}
      <defs>
        <filter
          id={`blip-glow-${blip.uuid}`}
          x='-100%'
          y='-100%'
          width='300%'
          height='300%'
        >
          <feGaussianBlur
            stdDeviation={isActive ? 4 : inactive ? 1 : 2}
            result='coloredBlur'
          />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {/* Ping animation for active blips - multiple rings for ripple effect */}
      {isActive && !inactive && (
        <>
          <circle
            cx={position.x}
            cy={position.y}
            r={dotSize + 4}
            fill='none'
            stroke={blipColor}
            strokeWidth={2}
            opacity={0.5}
            className={styles.blipPing}
          />
          <circle
            cx={position.x}
            cy={position.y}
            r={dotSize + 8}
            fill='none'
            stroke={blipColor}
            strokeWidth={1.5}
            opacity={0.3}
            className={styles.blipPing}
            style={{ animationDelay: '0.3s' }}
          />
        </>
      )}

      {/* Selection ring */}
      {isSelected && !inactive && (
        <circle
          cx={position.x}
          cy={position.y}
          r={dotSize + 4}
          fill='none'
          stroke={blipColor}
          strokeWidth={2}
          opacity={0.8}
        />
      )}

      {/* Main blip dot */}
      <circle
        cx={position.x}
        cy={position.y}
        r={isActive ? dotSize + 1.5 : dotSize}
        fill={blipColor}
        filter={inactive ? undefined : `url(#blip-glow-${blip.uuid})`}
        className='transition-all duration-200'
      />

      {/* Inner highlight for 3D effect (only for active blips) */}
      {!inactive && (
        <circle
          cx={position.x - dotSize * 0.15}
          cy={position.y - dotSize * 0.15}
          r={dotSize * 0.35}
          fill='white'
          opacity={0.35}
        />
      )}
    </g>
  );
};

const ConstellationRadar: FunctionComponent<ConstellationRadarProps> = ({
  blips,
  inactiveBlips = [],
  selectedBlipUuid,
  onBlipSelect,
  filterClassification = 'all',
  className,
}) => {
  const [hoveredBlip, setHoveredBlip] = useState<IRadarBlip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 40;

  // Filter blips by classification
  const filteredBlips = useMemo(() => {
    if (filterClassification === 'all') return blips;
    return blips.filter((b) => b.classification === filterClassification);
  }, [blips, filterClassification]);

  // Filter inactive blips by classification
  const filteredInactiveBlips = useMemo(() => {
    if (filterClassification === 'all') return inactiveBlips;
    return inactiveBlips.filter(
      (b) => b.classification === filterClassification,
    );
  }, [inactiveBlips, filterClassification]);

  // Count by classification for legend (active only)
  const blipCounts = useMemo(() => {
    return {
      threat: blips.filter((b) => b.classification === 'threat').length,
      opportunity: blips.filter((b) => b.classification === 'opportunity')
        .length,
      watch: blips.filter((b) => b.classification === 'watch').length,
    };
  }, [blips]);

  // Get tooltip position - raised higher above the blip
  const getTooltipPosition = (blip: IRadarBlip): { x: number; y: number } => {
    const radius = getRadiusForTimeHorizon(blip.timeHorizon) * maxRadius;
    const pos = polarToCartesian(cx, cy, radius, blip.angularPosition);
    const containerWidth = containerRef.current?.offsetWidth ?? size;
    const scale = containerWidth / size;
    return {
      x: pos.x * scale,
      y: pos.y * scale - 24,
    };
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Radar Container */}
      <div ref={containerRef} className={styles.strategicRadar}>
        <div
          className={cn(
            styles.radarContainer,
            'aucctus-bg-secondary aucctus-border-primary rounded-xl border',
          )}
        >
          <svg viewBox={`0 0 ${size} ${size}`} className={styles.radarSvg}>
            {/* Background gradient - theme aware */}
            <defs>
              <radialGradient id='radar-bg-gradient' cx='50%' cy='50%' r='50%'>
                <stop
                  offset='0%'
                  className='[stop-color:var(--color-gray-50)] dark:[stop-color:var(--color-gray-900)]'
                />
                <stop
                  offset='100%'
                  className='[stop-color:var(--color-gray-100)] dark:[stop-color:var(--color-gray-950)]'
                />
              </radialGradient>

              {/* Glow filter for needle */}
              <filter
                id='sweep-glow'
                x='-50%'
                y='-50%'
                width='200%'
                height='200%'
              >
                <feGaussianBlur stdDeviation='2' result='blur' />
                <feMerge>
                  <feMergeNode in='blur' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
            </defs>

            {/* Background circle - uses theme colors */}
            <circle
              cx={cx}
              cy={cy}
              r={maxRadius + 20}
              className='fill-gray-light-50 dark:fill-gray-light-900'
            />

            {/* Grid lines (8 directions) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const end = polarToCartesian(cx, cy, maxRadius + 10, angle);
              return (
                <line
                  key={angle}
                  x1={cx}
                  y1={cy}
                  x2={end.x}
                  y2={end.y}
                  className='stroke-gray-light-200 dark:stroke-gray-light-700'
                  strokeWidth={0.5}
                  opacity={0.6}
                />
              );
            })}

            {/* Time horizon rings */}
            {TIME_HORIZONS.map((horizon, index) => (
              <circle
                key={horizon.id}
                cx={cx}
                cy={cy}
                r={horizon.radius * maxRadius}
                fill='none'
                className='stroke-gray-light-300 dark:stroke-gray-light-600'
                strokeWidth={index === 0 ? 1.5 : 1}
                strokeDasharray={index === 0 ? 'none' : '6 4'}
                opacity={0.7}
                style={
                  index === 2
                    ? { animation: 'ringPulseAnimation 3s ease-out infinite' }
                    : undefined
                }
              />
            ))}

            {/* Scanning needle - line thin with CSS rotation */}
            <g className={styles.radarSweep}>
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - maxRadius - 10}
                className={cn('stroke-primary-400', styles.radarNeedle)}
                strokeWidth={2}
                strokeLinecap='round'
              />
            </g>

            {/* Center point */}
            <circle
              cx={cx}
              cy={cy}
              r={6}
              className='fill-primary-500'
              opacity={0.9}
            />
            <circle
              cx={cx}
              cy={cy}
              r={3}
              fill='white'
              opacity={0.8}
              className={styles.radarCenterPulse}
            />

            {/* Quadrant divider lines */}
            {[45, 135, 225, 315].map((angle) => {
              const end = polarToCartesian(cx, cy, maxRadius + 15, angle);
              return (
                <line
                  key={`divider-${angle}`}
                  x1={cx}
                  y1={cy}
                  x2={end.x}
                  y2={end.y}
                  className='stroke-gray-light-300 dark:stroke-gray-light-600'
                  strokeWidth={1}
                  strokeDasharray='4 4'
                  opacity={0.5}
                />
              );
            })}

            {/* Time horizon labels */}
            {TIME_HORIZONS.map((horizon) => {
              const labelPos = polarToCartesian(
                cx,
                cy,
                horizon.radius * maxRadius,
                315,
              );
              return (
                <text
                  key={`label-${horizon.id}`}
                  x={labelPos.x + 6}
                  y={labelPos.y - 4}
                  className='fill-gray-light-500 dark:fill-gray-light-400'
                  fontSize={8}
                  fontWeight={600}
                  letterSpacing={0.5}
                >
                  {horizon.label}
                </text>
              );
            })}

            {/* Inactive blips (rendered first, so active blips appear on top) */}
            {filteredInactiveBlips.map((blip) => (
              <RadarBlipDot
                key={`inactive-${blip.uuid}`}
                blip={blip}
                cx={cx}
                cy={cy}
                maxRadius={maxRadius}
                isHovered={hoveredBlip?.uuid === blip.uuid}
                isSelected={selectedBlipUuid === blip.uuid}
                onHover={setHoveredBlip}
                onClick={(b) => onBlipSelect?.(b)}
                inactive
              />
            ))}

            {/* Active blips */}
            {filteredBlips.map((blip) => (
              <RadarBlipDot
                key={blip.uuid}
                blip={blip}
                cx={cx}
                cy={cy}
                maxRadius={maxRadius}
                isHovered={hoveredBlip?.uuid === blip.uuid}
                isSelected={selectedBlipUuid === blip.uuid}
                onHover={setHoveredBlip}
                onClick={(b) => onBlipSelect?.(b)}
              />
            ))}
          </svg>

          {/* Hover tooltip (positioned outside SVG for better styling) */}
          {hoveredBlip && (
            <div
              className={cn(
                styles.radarTooltip,
                'aucctus-bg-primary aucctus-text-primary aucctus-border-primary border shadow-lg',
              )}
              style={{
                left: getTooltipPosition(hoveredBlip).x,
                top: getTooltipPosition(hoveredBlip).y,
              }}
            >
              <span
                className={cn(
                  'mr-2 inline-block h-2 w-2 rounded-full',
                  CLASSIFICATION_CONFIG[hoveredBlip.classification].solidClass,
                )}
              />
              {hoveredBlip.label.length > 35
                ? hoveredBlip.label.substring(0, 35) + '...'
                : hoveredBlip.label}
            </div>
          )}

          {/* Quadrant icons - positioned outside the circle */}
          {QUADRANT_CONFIG.map((quadrant) => {
            const QuadrantIcon = quadrant.Icon;
            // Position icons at the edge of the container
            const positionStyles: React.CSSProperties =
              quadrant.angle === 0
                ? { top: 0, left: '50%', transform: 'translate(-50%, -50%)' }
                : quadrant.angle === 90
                  ? { top: '50%', right: 0, transform: 'translate(50%, -50%)' }
                  : quadrant.angle === 180
                    ? {
                        bottom: 0,
                        left: '50%',
                        transform: 'translate(-50%, 50%)',
                      }
                    : {
                        top: '50%',
                        left: 0,
                        transform: 'translate(-50%, -50%)',
                      };

            return (
              <div
                key={`quadrant-icon-${quadrant.theme}`}
                className='absolute z-10'
                style={positionStyles}
              >
                <ComponentTooltip
                  tip={
                    <div className='aucctus-bg-primary-solid aucctus-text-light rounded px-2 py-1 text-xs font-medium shadow-lg'>
                      {quadrant.label}
                    </div>
                  }
                  preferredPosition={quadrant.angle === 180 ? 'below' : 'above'}
                >
                  <div className='aucctus-bg-secondary aucctus-border-primary flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-shadow hover:shadow-md'>
                    <QuadrantIcon className='aucctus-text-secondary h-4 w-4' />
                  </div>
                </ComponentTooltip>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.radarLegend}>
        {Object.entries(CLASSIFICATION_CONFIG).map(([key, config]) => {
          const classification = key as InsightClassification;
          const count = blipCounts[classification];
          const isFiltered =
            filterClassification !== 'all' &&
            filterClassification !== classification;

          return (
            <div
              key={key}
              className={cn(
                styles.radarLegendItem,
                isFiltered && styles.filtered,
              )}
            >
              <span
                className={cn(
                  styles.radarLegendDot,
                  config.solidClass,
                  config.glowClass,
                )}
              />
              <span className='aucctus-text-secondary'>
                {config.label} ({count})
              </span>
            </div>
          );
        })}
      </div>

      {/* Time horizon legend */}
      <div className={styles.radarTimeHorizons}>
        {TIME_HORIZONS.map((horizon) => (
          <span key={horizon.id} className='aucctus-text-tertiary'>
            {horizon.label}: {horizon.description}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ConstellationRadar;
