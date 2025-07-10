import React from 'react';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditMarketScan } from '@hooks/concepts/editable.hook';
import { useConceptMarketScan } from '@hooks/query/concepts.hook';
import IncumbentsList from '../components/Incumbent-list/IncumbentList';
import StartupList from '../components/startup-list/StartupList';
import useStore from '@stores/store';
import { Loading } from '@components';

const Ecosystem: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { data: marketScan, isLoading: isMarketScanLoading } =
    useConceptMarketScan(activeConceptUuid);
  const { ecosystemDescription } = useEditMarketScan();

  if (isMarketScanLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col gap-6'>
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

export default Ecosystem;
