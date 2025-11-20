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
              paddingLeft: '80px',
              paddingRight: '80px',
              paddingTop: '40px',
              paddingBottom: '40px',
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
              paddingLeft: '80px',
              paddingRight: '80px',
              paddingTop: '40px',
              paddingBottom: '40px',
            }}
          >
            {memoizedData.map((company, index) => {
              const x = (company.competitorScore / 100) * 100;
              const y = (company.establishedScore / 100) * 100;
              const companyKey = `${company.id}-${company.name}`;
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
                      width: `${Math.max(company.companySizeScore, 40)}px`,
                      height: `${Math.max(company.companySizeScore, 40)}px`,
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
                          fontSize: `${Math.max(company.companySizeScore, 40) / 3.5}px`,
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
