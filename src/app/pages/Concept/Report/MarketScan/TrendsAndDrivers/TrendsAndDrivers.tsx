import React from 'react';
import { useOutletContext } from 'react-router-dom';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { SkeletonBlock } from '@components/Skeleton/ConceptReport';
import { useEditMarketScan } from '@hooks/concepts/editable.hook';
import { useConceptMarketScan } from '@hooks/query/concepts.hook';
import TrendAndDriverCard from '../components/TrendAndDriverCard';
import useStore from '@stores/store';
import { IConceptReportContext } from '../../ConceptReport/ConceptReport';

/**
 * Skeleton for TrendsAndDrivers section
 */
const TrendsAndDriversSkeleton: React.FC = () => (
  <div className='flex h-full w-full flex-col gap-6'>
    <div className='flex flex-wrap justify-between gap-8'>
      <div className='flex w-full flex-col gap-4'>
        <SkeletonBlock className='h-6 w-48' />
        <SkeletonBlock className='h-16 w-full' />
      </div>
    </div>
    <div className='grid grid-cols-2 gap-4'>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className='aucctus-bg-primary aucctus-border-secondary flex flex-col gap-3 rounded-lg border p-4'
        >
          <SkeletonBlock className='h-5 w-3/4' />
          <SkeletonBlock className='h-20 w-full' />
          <div className='flex gap-2'>
            <SkeletonBlock className='h-6 w-20' />
            <SkeletonBlock className='h-6 w-16' />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TrendsAndDrivers: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { data: marketScan, isLoading } =
    useConceptMarketScan(activeConceptUuid);
  const { trendsAndDriversDescription } = useEditMarketScan();

  // Check if trends section is pending from backend status
  const isTrendsSectionPending =
    concept?.reportStatusBySection?.trends?.status === 'pending';

  // Show skeleton while loading or when section is pending
  if (isLoading || isTrendsSectionPending) {
    return <TrendsAndDriversSkeleton />;
  }

  // Don't render if no market scan data
  if (!marketScan) {
    return null;
  }

  return (
    <div className='flex h-full w-full flex-col gap-6'>
      <div className='flex flex-wrap justify-between gap-8'>
        <div className='flex w-full flex-col gap-4'>
          <div className='flex items-end justify-between'>
            <h2 className='aucctus-text-brand-primary aucctus-text-md-bold'>
              Trends and Drivers
            </h2>
          </div>
          <EditModeSwitcher
            value={trendsAndDriversDescription.value}
            pClassName='aucctus-text-secondary aucctus-text-md-medium'
            name='trendsAndDriversDescription'
            maxLength={trendsAndDriversDescription.validation.maxLength}
            onChange={trendsAndDriversDescription.handleChange}
            handleSave={trendsAndDriversDescription.handleSave}
            handleCancel={trendsAndDriversDescription.handleCancel}
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        {marketScan?.trendsAndDrivers.map(
          (
            trend: any, // todo fix typing here
          ) => (
            <TrendAndDriverCard
              cardClassName='w-full'
              trendAndDriver={trend}
              key={trend.uuid}
            />
          ),
        )}
      </div>
    </div>
  );
};

export default TrendsAndDrivers;
