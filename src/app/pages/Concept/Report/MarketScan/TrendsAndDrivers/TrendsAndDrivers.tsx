import React from 'react';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditMarketScan } from '@hooks/concepts/editable.hook';
import { useConceptMarketScan } from '@hooks/query/concepts.hook';
import TrendAndDriverCard from '../components/TrendAndDriverCard';
import useStore from '@stores/store';

const TrendsAndDrivers: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { data: marketScan } = useConceptMarketScan(activeConceptUuid);
  const { trendsAndDriversDescription } = useEditMarketScan();

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
