import { Loading } from '@components';
import Icon from '@components/Icon/Icon/Icon';
import AddMarketScanElement from '@components/Modal/MarketScanElement/AddMarketScanElement';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useModal } from '@context/ModalContextProvider';
import { useEditMarketScan } from '@hooks/concepts/editable.hook';
import {
  useConceptMarketScan,
  useTrendAndDriverCreate,
} from '@hooks/query/concepts.hook';
import { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import IncumbentsList from './Components/IncumbentList/IncumbentList';
import StartupList from './Components/StartupList/StartupList';
import TrendAndDriverCard from './Components/TrendAndDriverCard';

const MarketScan: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const { data: marketScan, isLoading } = useConceptMarketScan(conceptId || '');
  const { trendsAndDriversDescription, ecosystemDescription } =
    useEditMarketScan();
  const { mutate: addTrendAndDriver } = useTrendAndDriverCreate(
    conceptId || '',
  );
  const { openModal } = useModal();

  if (isLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
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
            <button
              className='aucctus-bg-primary-hover rounded-md p-2 shadow hover:shadow-lg'
              onClick={() => {
                openModal(AddMarketScanElement, { addItem: addTrendAndDriver });
              }}
            >
              <Icon variant='plus' />
            </button>
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
