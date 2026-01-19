import { FunctionComponent } from 'react';
import TrendsAndDrivers from '../TrendsAndDrivers/TrendsAndDrivers';
import Ecosystem from '../ecosystem/Ecosystem';

/**
 * MarketScan V2 - renders TrendsAndDrivers and Ecosystem sections.
 * Each section handles its own loading state independently.
 */
const MarketScanV2: FunctionComponent = () => {
  return (
    <div className='flex h-full w-full flex-col gap-6'>
      <TrendsAndDrivers />
      <Ecosystem />
    </div>
  );
};

export default MarketScanV2;
