import { useMemo, useState, useRef, useCallback } from 'react';
import type { Company } from '../hooks/useEcosystem';
import CompanyTooltip from './CompanyTooltip';

interface BubbleChartProps {
  data: Company[];
}

interface PlacedBubble {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  radius: number; // pixels
  company: Company;
}

/**
 * Calculate the overlap area between two circles
 * Returns the overlap area as a percentage of the smaller circle's area
 */
const calculateOverlapPercentage = (
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  containerWidth: number,
  containerHeight: number,
): number => {
  // Convert percentage positions to pixels for accurate calculation
  const px1 = (x1 / 100) * containerWidth;
  const py1 = (y1 / 100) * containerHeight;
  const px2 = (x2 / 100) * containerWidth;
  const py2 = (y2 / 100) * containerHeight;

  // Calculate distance between centers
  const d = Math.sqrt(Math.pow(px2 - px1, 2) + Math.pow(py2 - py1, 2));

  // No overlap if circles are far apart
  if (d >= r1 + r2) return 0;

  // Complete overlap if one circle is inside the other
  if (d <= Math.abs(r1 - r2)) {
    return 100; // 100% overlap
  }

  // Partial overlap - calculate intersection area using circle intersection formula
  const r1Sq = r1 * r1;
  const r2Sq = r2 * r2;
  const dSq = d * d;

  // Area of intersection
  const area1 = r1Sq * Math.acos((dSq + r1Sq - r2Sq) / (2 * d * r1));
  const area2 = r2Sq * Math.acos((dSq + r2Sq - r1Sq) / (2 * d * r2));
  const area3 =
    0.5 *
    Math.sqrt((r1 + r2 - d) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));

  const overlapArea = area1 + area2 - area3;

  // Calculate as percentage of the smaller circle's area
  const smallerArea = Math.PI * Math.pow(Math.min(r1, r2), 2);
  const overlapPercentage = (overlapArea / smallerArea) * 100;

  return overlapPercentage;
};

/**
 * Check if a position is valid (has < 30% overlap with all placed bubbles)
 */
const isValidPosition = (
  x: number,
  y: number,
  radius: number,
  placedBubbles: PlacedBubble[],
  containerWidth: number,
  containerHeight: number,
  maxOverlapPercent: number = 30,
): boolean => {
  for (const placed of placedBubbles) {
    const overlapPercent = calculateOverlapPercentage(
      x,
      y,
      radius,
      placed.x,
      placed.y,
      placed.radius,
      containerWidth,
      containerHeight,
    );

    if (overlapPercent > maxOverlapPercent) {
      return false;
    }
  }
  return true;
};

/**
 * Find the closest valid position using spiral search from semantic position
 */
const findSafePosition = (
  semanticX: number,
  semanticY: number,
  radius: number,
  placedBubbles: PlacedBubble[],
  containerWidth: number,
  containerHeight: number,
  minPercent: number,
  maxPercent: number,
): { x: number; y: number } => {
  // First check if semantic position is already valid
  if (
    isValidPosition(
      semanticX,
      semanticY,
      radius,
      placedBubbles,
      containerWidth,
      containerHeight,
    )
  ) {
    return { x: semanticX, y: semanticY };
  }

  // Spiral search parameters
  const maxSearchDistance = 30; // Maximum distance in percentage points to search
  const angleSteps = 16; // Number of angles to check per distance ring
  const distanceSteps = 20; // Number of distance rings to check

  for (let distStep = 1; distStep <= distanceSteps; distStep++) {
    const distance = (distStep / distanceSteps) * maxSearchDistance;

    for (let angleStep = 0; angleStep < angleSteps; angleStep++) {
      const angle = (angleStep / angleSteps) * 2 * Math.PI;

      // Calculate candidate position
      const candidateX = semanticX + distance * Math.cos(angle);
      const candidateY = semanticY + distance * Math.sin(angle);

      // Ensure candidate is within bounds
      const clampedX = Math.max(minPercent, Math.min(maxPercent, candidateX));
      const clampedY = Math.max(minPercent, Math.min(maxPercent, candidateY));

      // Check if this position is valid
      if (
        isValidPosition(
          clampedX,
          clampedY,
          radius,
          placedBubbles,
          containerWidth,
          containerHeight,
        )
      ) {
        return { x: clampedX, y: clampedY };
      }
    }
  }

  // If no valid position found, return semantic position (fallback)
  // This means the chart is too crowded
  return { x: semanticX, y: semanticY };
};

const BubbleChart = ({ data }: BubbleChartProps) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const memoizedData = useMemo(() => data, [data]);

  // Clear any pending hide timeout
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Handle mouse entering bubble
  const handleBubbleEnter = useCallback(
    (companyKey: string) => {
      clearHideTimeout();
      setHoveredBubble(companyKey);
    },
    [clearHideTimeout],
  );

  // Handle mouse leaving bubble
  const handleBubbleLeave = useCallback(() => {
    clearHideTimeout();
    // Start 300ms grace period
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredBubble(null);
    }, 300);
  }, [clearHideTimeout]);

  // Handle mouse entering tooltip
  const handleTooltipEnter = useCallback(() => {
    clearHideTimeout();
  }, [clearHideTimeout]);

  // Handle mouse leaving tooltip
  const handleTooltipLeave = useCallback(() => {
    setHoveredBubble(null);
  }, []);

  // Calculate dynamic bubble sizes based on revenue and employees
  const companySizes = useMemo(() => {
    if (memoizedData.length === 0) return new Map<string, number>();

    // Get all valid revenue and employee values
    const revenues = memoizedData
      .map((c) => c.revenue)
      .filter((r): r is number => r !== null && r !== undefined && r > 0);
    const employees = memoizedData
      .map((c) => c.employees)
      .filter((e): e is number => e !== null && e !== undefined && e > 0);

    // Calculate min/max for normalization
    const minRevenue = revenues.length > 0 ? Math.min(...revenues) : 0;
    const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 1;
    const minEmployees = employees.length > 0 ? Math.min(...employees) : 0;
    const maxEmployees = employees.length > 0 ? Math.max(...employees) : 1;

    // Calculate size score for each company (0-100 scale)
    const sizeMap = new Map<string, number>();

    memoizedData.forEach((company) => {
      const companyKey = `${company.id}-${company.name}`;

      // Normalize revenue (0-100)
      const revenueScore =
        company.revenue && company.revenue > 0 && maxRevenue > minRevenue
          ? ((company.revenue - minRevenue) / (maxRevenue - minRevenue)) * 100
          : 0;

      // Normalize employees (0-100)
      const employeeScore =
        company.employees &&
        company.employees > 0 &&
        maxEmployees > minEmployees
          ? ((company.employees - minEmployees) /
              (maxEmployees - minEmployees)) *
            100
          : 0;

      // Combine scores (weighted average: 60% revenue, 40% employees)
      // If only one metric is available, use that one
      let combinedScore = 0;
      if (revenueScore > 0 && employeeScore > 0) {
        combinedScore = revenueScore * 0.6 + employeeScore * 0.4;
      } else if (revenueScore > 0) {
        combinedScore = revenueScore;
      } else if (employeeScore > 0) {
        combinedScore = employeeScore;
      } else {
        // Fallback to companySizeScore if no metrics available
        combinedScore = company.companySizeScore;
      }

      sizeMap.set(companyKey, combinedScore);
    });

    return sizeMap;
  }, [memoizedData]);

  const handleImageError = (companyId: number, companyName: string) => {
    const key = `${companyId}-${companyName}`;
    setBrokenImages((prev) => new Set(prev).add(key));
  };

  // Pre-calculate all bubble positions with collision avoidance
  const bubblePositions = useMemo(() => {
    const minPercent = 10;
    const maxPercent = 90;
    const minSize = 40;
    const maxSize = 120;

    // Container dimensions (estimated for calculation purposes)
    // These are approximate since the actual container is percentage-based
    const containerWidth = 1000; // pixels (approximate)
    const containerHeight = 500; // pixels (approximate)

    const placedBubbles: PlacedBubble[] = [];
    const positions = new Map<
      string,
      {
        x: number;
        y: number;
        size: number;
        wasJittered: boolean;
        zIndex: number;
      }
    >();

    // Sort companies alphabetically by name for consistent placement order
    const sortedData = [...memoizedData].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    sortedData.forEach((company) => {
      const companyKey = `${company.id}-${company.name}`;

      // Get bubble size
      const sizeScore =
        companySizes.get(companyKey) ??
        (company.type === 'incumbent' ? 20 : 10);
      const bubbleSize = minSize + (sizeScore / 100) * (maxSize - minSize);

      // Get semantic position
      const rawX = (company.competitorScore / 100) * 100;
      const rawY = (company.establishedScore / 100) * 100;
      const semanticX = Math.max(minPercent, Math.min(maxPercent, rawX));
      const semanticY = Math.max(minPercent, Math.min(maxPercent, rawY));

      // Find safe position
      const safePos = findSafePosition(
        semanticX,
        semanticY,
        bubbleSize / 2, // radius is half the diameter
        placedBubbles,
        containerWidth,
        containerHeight,
        minPercent,
        maxPercent,
      );

      const wasJittered = safePos.x !== semanticX || safePos.y !== semanticY;

      // Store position (z-index will be calculated after all positions are known)
      positions.set(companyKey, {
        x: safePos.x,
        y: safePos.y,
        size: bubbleSize,
        wasJittered,
        zIndex: 0, // Temporary, will be updated
      });

      // Add to placed bubbles for next iteration
      placedBubbles.push({
        x: safePos.x,
        y: safePos.y,
        radius: bubbleSize / 2,
        company,
      });
    });

    // Calculate z-index: smaller bubbles on top, tiebreaker by y position (top first)
    // Sort by size (ascending) then by y (ascending)
    const sortedEntries = Array.from(positions.entries()).sort((a, b) => {
      const [, posA] = a;
      const [, posB] = b;

      // Primary sort: smaller size = higher z-index
      if (posA.size !== posB.size) {
        return posA.size - posB.size;
      }

      // Tiebreaker: lower y (closer to top) = higher z-index
      return posA.y - posB.y;
    });

    // Assign z-index based on sort order
    sortedEntries.forEach(([key, pos], index) => {
      positions.set(key, { ...pos, zIndex: index + 1 });
    });

    return positions;
  }, [memoizedData, companySizes]);

  return (
    <div className='aucctus-bg-primary rounded-lg border'>
      <div className='px-2 py-4'>
        {/* Bubble Chart */}
        <div className='aucctus-bg-primary relative h-[500px] w-full rounded-lg pl-16'>
          {/* Y-axis labels with badges */}
          <div className='absolute left-1/2 top-2 -translate-x-1/2'>
            <div className='aucctus-text-xs aucctus-text-secondary aucctus-bg-secondary-subtle rounded px-2 py-1 font-medium'>
              Established / Mature
            </div>
          </div>
          <div className='absolute bottom-2 left-1/2 -translate-x-1/2'>
            <div className='aucctus-text-xs aucctus-text-secondary aucctus-bg-secondary-subtle rounded px-2 py-1 font-medium'>
              Nascent / New Entrants
            </div>
          </div>

          {/* X-axis labels with badges */}
          <div className='absolute left-2 top-1/2 -translate-y-1/2 -rotate-90'>
            <div className='aucctus-text-xs aucctus-text-secondary aucctus-bg-secondary-subtle rounded px-2 py-1 font-medium'>
              Adjacent / Distant
            </div>
          </div>
          <div className='absolute right-2 top-1/2 -translate-y-1/2 rotate-90'>
            <div className='aucctus-text-xs aucctus-text-secondary aucctus-bg-secondary-subtle rounded px-2 py-1 font-medium'>
              Direct Competitor
            </div>
          </div>

          {/* Grid Lines */}
          <svg
            className='pointer-events-none absolute inset-0 h-full w-full'
            style={{
              paddingLeft: '100px',
              paddingRight: '100px',
              paddingTop: '60px',
              paddingBottom: '60px',
            }}
          >
            <line
              x1='0'
              y1='50%'
              x2='100%'
              y2='50%'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeDasharray='6,4'
              opacity='0.3'
              className='aucctus-stroke-secondary'
            />
            <line
              x1='50%'
              y1='0'
              x2='50%'
              y2='100%'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeDasharray='6,4'
              opacity='0.3'
              className='aucctus-stroke-secondary'
            />
          </svg>
          {/* Bubbles */}
          <div
            className='absolute inset-0'
            style={{
              paddingLeft: '100px',
              paddingRight: '100px',
              paddingTop: '0px',
              paddingBottom: '0px',
            }}
          >
            {memoizedData.map((company, index) => {
              const companyKey = `${company.id}-${company.name}`;

              // Get pre-calculated position and size
              const position = bubblePositions.get(companyKey);
              if (!position) return null; // Safety check

              const { x, y, size: bubbleSize, wasJittered, zIndex } = position;

              const isImageBroken = brokenImages.has(companyKey);
              const shouldShowImage =
                company.logoType === 'image' &&
                company.logoUrl &&
                !isImageBroken;

              return (
                <div
                  key={`${company.type}-${company.id}-${company.name}-${index}`}
                  className='absolute'
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: hoveredBubble === companyKey ? 9999 : zIndex,
                  }}
                  onMouseEnter={() => handleBubbleEnter(companyKey)}
                  onMouseLeave={handleBubbleLeave}
                >
                  <div
                    className='flex cursor-pointer items-center justify-center overflow-hidden font-bold shadow-lg transition-all duration-300'
                    style={{
                      width: `${bubbleSize}px`,
                      height: `${bubbleSize}px`,
                      transform:
                        hoveredBubble === companyKey
                          ? 'scale(1.1)'
                          : 'scale(1)',
                      backgroundColor: shouldShowImage
                        ? 'white'
                        : company.brandColor,
                      boxShadow:
                        hoveredBubble === companyKey
                          ? '0 8px 30px rgba(0,0,0,0.25)'
                          : '0 4px 15px rgba(0,0,0,0.15)',
                      border: wasJittered
                        ? '2px dashed rgba(100,100,100,0.5)'
                        : '2px solid rgba(100,100,100,0.3)',
                      borderRadius: '50%',
                    }}
                  >
                    {shouldShowImage ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className='h-full w-full object-contain'
                        onError={() =>
                          handleImageError(company.id, company.name)
                        }
                      />
                    ) : (
                      <span
                        className='font-extrabold text-white drop-shadow-lg'
                        style={{
                          fontSize: `${bubbleSize / 3.5}px`,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        }}
                      >
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Tooltip */}
                  <CompanyTooltip
                    company={company}
                    isVisible={hoveredBubble === companyKey}
                    onMouseEnter={handleTooltipEnter}
                    onMouseLeave={handleTooltipLeave}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BubbleChart;
