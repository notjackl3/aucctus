import { Loading } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditMarketScan } from '@hooks/concepts/editable.hook';
import { useConceptMarketScan } from '@hooks/query/concepts.hook';
import { FunctionComponent } from 'react';
import IncumbentsList from './Components/IncumbentList/IncumbentList';
import StartupList from './Components/StartupList/StartupList';
import TrendAndDriverCard from './Components/TrendAndDriverCard';
import useStore from '@stores/store';
const MarketScan: FunctionComponent = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { data: marketScan, isLoading } =
    useConceptMarketScan(activeConceptUuid);
  const { trendsAndDriversDescription, ecosystemDescription } =
    useEditMarketScan();

  if (isLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
      </div>
    );
  }

  // Handle case where loading is finished but no market scan data exists
  if (!isLoading && !marketScan) {
    // Can refine this check if needed (e.g., check specific arrays)
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        Market scan data is not available for this concept.
      </div>
    );
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
      <div className='flex w-full flex-col gap-4'>
        <h2 className='font-bold leading-[30px] text-[#0C111D]'>Ecosystem</h2>
        <EditModeSwitcher
          value={ecosystemDescription.value}
          label=''
          name='ecosystemDescription'
          maxLength={ecosystemDescription.validation.maxLength}
          onChange={ecosystemDescription.handleChange}
          handleSave={ecosystemDescription.handleSave}
          handleCancel={ecosystemDescription.handleCancel}
        />
      </div>
      <div className='flex w-full flex-col gap-4'>
        <StartupList startups={marketScan?.startups || []} />
      </div>
      <div className='flex w-full flex-col gap-4'>
        <IncumbentsList incumbents={marketScan?.incumbents || []} />
      </div>
    </div>
  );
};

export default MarketScan;
