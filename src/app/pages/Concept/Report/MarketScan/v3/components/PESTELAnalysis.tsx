import React from 'react';
import { Icon, Loading } from '@components';
import type { ITrendV3 } from '@libs/api/types/concept/marketScan';
import { useMarketScanTrendsV3 } from '@hooks/query/concepts.hook';
import TrendCard from './TrendCard';

interface PESTELAnalysisProps {
  conceptUuid: string;
  sections: ITrendV3[];
}

const PESTELAnalysis: React.FC<PESTELAnalysisProps> = ({
  conceptUuid,
  sections,
}) => {
  const { isLoading, error } = useMarketScanTrendsV3(conceptUuid);

  if (isLoading) {
    return (
      <div className='flex flex-col gap-6'>
        {/* Section Header */}
        <div className='mt-4'>
          <div className='mb-2 flex items-center gap-2'>
            <Icon
              variant='shield-dollar'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
              PESTEL Analysis
            </h2>
          </div>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Comprehensive analysis of external factors affecting your concept
          </p>
        </div>

        {/* Loading State */}
        <div className='flex h-64 items-center justify-center'>
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col gap-6'>
        {/* Section Header */}
        <div className='mt-4'>
          <div className='mb-2 flex items-center gap-2'>
            <Icon
              variant='shield-dollar'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
              PESTEL Analysis
            </h2>
          </div>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Comprehensive analysis of external factors affecting your concept
          </p>
        </div>

        {/* Error State */}
        <div className='flex h-64 items-center justify-center'>
          <p className='aucctus-text-error-primary'>
            Error loading trends data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Section Header */}
      <div className='mt-4'>
        <div className='mb-2 flex items-center gap-2'>
          <Icon
            variant='shield-dollar'
            className='aucctus-stroke-brand-primary h-5 w-5'
          />
          <h2 className='aucctus-text-xl-semibold aucctus-text-primary'>
            PESTEL Analysis
          </h2>
        </div>
        <p className='aucctus-text-sm aucctus-text-secondary'>
          Comprehensive analysis of external factors affecting your concept
        </p>
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {sections.map((section, index) => (
          <TrendCard
            key={section.uuid || index}
            section={section}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default PESTELAnalysis;
