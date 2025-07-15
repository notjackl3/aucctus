import { UnifiedLoadingState } from '@components';
import { useConceptMarketScan } from '@hooks/query/concepts.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { FunctionComponent } from 'react';
import { useOutletContext } from 'react-router-dom';
import TrendsAndDrivers from '../TrendsAndDrivers/TrendsAndDrivers';
import Ecosystem from '../ecosystem/Ecosystem';
import useStore from '@stores/store';
import { IConceptReportContext } from '../../ConceptReport/ConceptReport';

const MarketScanV2: FunctionComponent = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { concept } = useOutletContext<IConceptReportContext>();
  const { data: marketScan, isLoading: isMarketScanLoading } =
    useConceptMarketScan(activeConceptUuid);

  // Use unified loading state
  const { isLoading } = useUnifiedLoading({
    currentRoute: AppPath.ConceptMarketScan,
    concept,
    additionalLoadingStates: [isMarketScanLoading],
  });

  // Show unified loading state
  if (isLoading) {
    return <UnifiedLoadingState />;
  }

  // Handle case where loading is finished but no market scan data exists
  if (!marketScan) {
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
