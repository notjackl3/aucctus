import { useMemo, useState } from 'react';
import type { Company } from '../hooks/useEcosystem';
import CompanyTooltip from './CompanyTooltip';

interface BubbleChartProps {
  data: Company[];
}

const BubbleChart = ({ data }: BubbleChartProps) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const memoizedData = useMemo(() => data, [data]);

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

              // Get dynamic size score (0-100) and map to pixel size (40-120px)
              const sizeScore = companySizes.get(companyKey) || 50;
              const minSize = 40;
              const maxSize = 120;
              const bubbleSize =
                minSize + (sizeScore / 100) * (maxSize - minSize);

              // Calculate the percentage of the container that the bubble radius represents
              // We need to keep bubbles within bounds by clamping their position
              const minPercent = 10; // 5% margin from edges
              const maxPercent = 90; // 95% margin from edges

              // Clamp the position to keep bubbles within bounds
              const rawX = (company.competitorScore / 100) * 100;
              const rawY = (company.establishedScore / 100) * 100;
              const x = Math.max(minPercent, Math.min(maxPercent, rawX));
              const y = Math.max(minPercent, Math.min(maxPercent, rawY));

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
                    zIndex: hoveredBubble === companyKey ? 20 : 1,
                  }}
                  onMouseEnter={() => setHoveredBubble(companyKey)}
                  onMouseLeave={() => setHoveredBubble(null)}
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
                      border: '2px solid rgba(100,100,100,0.3)',
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
