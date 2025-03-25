import Assumptions from './Assumptions';
import Default from './ConceptReport';
import ConceptSettings from './ConceptSettings/ConceptSettings';
import CustomerProfile from './CustomerProfile';
import FinancialProjection from './FinancialDetails';
import MarketScanBase from './MarketScanBase';
import Overview from './OverviewDetails';

(Default as any).Overview = Overview;
(Default as any).MarketScan = MarketScanBase;
(Default as any).CustomerProfile = CustomerProfile;
(Default as any).FinancialProjection = FinancialProjection;
(Default as any).Assumptions = Assumptions;
(Default as any).ConceptSettings = ConceptSettings;

const Report = Default as typeof Default & {
  Overview: typeof Overview;
  MarketScan: typeof MarketScanBase;
  CustomerProfile: typeof CustomerProfile;
  FinancialProjection: typeof FinancialProjection;
  Assumptions: typeof Assumptions;
  ConceptSettings: typeof ConceptSettings;
};

export default Report;
