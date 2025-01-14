// Tailwind CSS equivalent of the components
import Icon from '@components/Icon/Icon/Icon';
import AddMarketScanElement from '@components/Modal/MarketScanElement/AddMarketScanElement';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useModal } from '@context/ModalContextProvider';
import { useEditMarketScan } from '@hooks/concepts/editable.hook';
import {
  useConceptMarketScan,
  useTrendAndDriverCreate,
} from '@hooks/query/concepts.hook';
import { IMarketScan } from '@libs/api/types';
import { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import TrendAndDriverCard from './Components/TrendAndDriverCard';

import { Container } from '@components';
import InvestorList from './Components/InvestorList';
import IncumbentsList from './Components/IncumbentList';

const MarketScan: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const { data: marketScan } = useConceptMarketScan(conceptId || '', 'v2');
  const { trendsAndDriversDescription, ecosystemDescription } =
    useEditMarketScan();
  const { mutate: addTrendAndDriver } = useTrendAndDriverCreate(
    conceptId || '',
  );
  const { openModal } = useModal();

  return (
    <div className='flex h-full w-full flex-col gap-6'>
      <div className='flex flex-wrap justify-between gap-8'>
        <div className='flex w-full flex-col gap-4'>
          <div className='flex items-end justify-between'>
            <h2 className='font-bold leading-[30px] text-[#0C111D]'>
              Trends and Drivers
            </h2>
            <button
              className='bg-light rounded-md p-2 shadow hover:shadow-lg'
              onClick={() => {
                openModal(AddMarketScanElement, { addItem: addTrendAndDriver });
              }}
            >
              <Icon variant='plus' />
            </button>
          </div>
          <EditModeSwitcher
            value={trendsAndDriversDescription.value}
            name='trendsAndDriversDescription'
            maxLength={trendsAndDriversDescription.validation.maxLength}
            onChange={trendsAndDriversDescription.handleChange}
            handleSave={trendsAndDriversDescription.handleSave}
            handleCancel={trendsAndDriversDescription.handleCancel}
          />
        </div>
      </div>
      <div className='flex flex-wrap gap-4'>
        {marketScan?.trendsAndDrivers.map(
          (
            trend: any, // todo fix typing here
          ) => <TrendAndDriverCard trendAndDriver={trend} key={trend.uuid} />,
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
        <Container.StartupList
          startups={(marketScan as unknown as IMarketScan)?.startups || []}
        />
      </div>
      <div className='flex w-full flex-col gap-4'>
        <IncumbentsList
          incumbents={(marketScan as unknown as IMarketScan)?.incumbents || []}
        />
      </div>
    </div>
  );
};

export default MarketScan;
