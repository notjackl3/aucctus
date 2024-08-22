import Context from './components/ConceptSettings';
import CustomerProfile from './components/CustomerProfile';
import FinancialProjection from './components/FinancialDetails';
import KeyAssumptions from './components/HypothesisDetails';
import MarketScan from './components/MarketDetails';
import Overview from './components/OverviewDetails';
import Default from './ConceptReport';

(Default as any).Overview = Overview;
(Default as any).MarketScan = MarketScan;
(Default as any).CustomerProfile = CustomerProfile;
(Default as any).FinancialProjection = FinancialProjection;
(Default as any).KeyAssumptions = KeyAssumptions;
(Default as any).Context = Context;

const Report = Default as typeof Default & {
  Overview: typeof Overview;
  MarketScan: typeof MarketScan;
  CustomerProfile: typeof CustomerProfile;
  FinancialProjection: typeof FinancialProjection;
  KeyAssumptions: typeof KeyAssumptions;
  Context: typeof Context;
};

export default Report;
