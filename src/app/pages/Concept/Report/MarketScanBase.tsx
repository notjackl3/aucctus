import { FunctionComponent } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import MarketScan from './MarketScan/MarketScan';
import MarketScanV1 from './MarketScanV1/MarketScanV1';

// Define the context type
interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept: {
    marketScanVersion: 'v1' | 'v2'; // Define the possible versions explicitly
    title: string;
    [key: string]: any; // Include other potential concept keys
  };
}

const MarketScanBase: FunctionComponent = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  console.log(concept);
  return (
    <div>
      {concept.marketScanVersion === 'v2' ? <MarketScan /> : <MarketScanV1 />}
    </div>
  );
};

export default MarketScanBase;
