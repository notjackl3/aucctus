import { Loading } from '@components';
import { useConceptMarketScan } from '@hooks/query/concepts.hook';
import { FunctionComponent } from 'react';
import TrendsAndDrivers from '../TrendsAndDrivers/TrendsAndDrivers';
import Ecosystem from '../ecosystem/Ecosystem';
import useStore from '@stores/store';

const MarketScanV2: FunctionComponent = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { data: marketScan, isLoading } =
    useConceptMarketScan(activeConceptUuid);
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
      <TrendsAndDrivers />
      <Ecosystem />
    </div>
  );
};

export default MarketScanV2;
