import Assumptions from './Assumptions';
import Default from './ConceptReport';
import CustomerProfile from './CustomerProfile';
import FinancialProjection from './FinancialDetails';
import MarketScanBase from './MarketScanBase';
import Overview from './OverviewDetails';

(Default as any).Overview = Overview;
(Default as any).MarketScan = MarketScanBase;
(Default as any).CustomerProfile = CustomerProfile;
(Default as any).FinancialProjection = FinancialProjection;
(Default as any).Assumptions = Assumptions;

const Report = Default as typeof Default & {
  Overview: typeof Overview;
  MarketScan: typeof MarketScanBase;
  CustomerProfile: typeof CustomerProfile;
  FinancialProjection: typeof FinancialProjection;
  Assumptions: typeof Assumptions;
};

export default Report;
