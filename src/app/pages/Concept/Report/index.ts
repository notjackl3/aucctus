import Assumptions from './Assumptions';
import Default from './ConceptReport';
import Context from './ConceptSettings';
import CustomerProfile from './CustomerProfile';
import FinancialProjection from './FinancialDetails';
import MarketScan from './MarketDetails';
import Overview from './OverviewDetails';

(Default as any).Overview = Overview;
(Default as any).MarketScan = MarketScan;
(Default as any).CustomerProfile = CustomerProfile;
(Default as any).FinancialProjection = FinancialProjection;
(Default as any).Assumptions = Assumptions;
(Default as any).Context = Context;

const Report = Default as typeof Default & {
  Overview: typeof Overview;
  MarketScan: typeof MarketScan;
  CustomerProfile: typeof CustomerProfile;
  FinancialProjection: typeof FinancialProjection;
  Assumptions: typeof Assumptions;
  Context: typeof Context;
};

export default Report;
