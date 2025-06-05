import Assumptions from './Assumptions';
import Default from './ConceptReport/ConceptReport';
import ConceptSettings from './ConceptSettings/ConceptSettings';
import CustomerProfile from './CustomerProfile';
import FinancialProjectionsWrapper from './FinancialProjectionsWrapper';
import MarketScanBase from './MarketScanBase';
import Overview from './OverviewDetails';

(Default as any).Overview = Overview;
(Default as any).MarketScan = MarketScanBase;
(Default as any).CustomerProfile = CustomerProfile;
(Default as any).FinancialProjectionWrapper = FinancialProjectionsWrapper;
(Default as any).Assumptions = Assumptions;
(Default as any).ConceptSettings = ConceptSettings;

const Report = Default as typeof Default & {
  Overview: typeof Overview;
  MarketScan: typeof MarketScanBase;
  CustomerProfile: typeof CustomerProfile;
  FinancialProjectionWrapper: typeof FinancialProjectionsWrapper;
  Assumptions: typeof Assumptions;
  ConceptSettings: typeof ConceptSettings;
};

export default Report;
