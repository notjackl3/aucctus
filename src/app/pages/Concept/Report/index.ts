import Assumptions from './Assumptions';
import ConceptReport, {
  IConceptReportContext,
} from './ConceptReport/ConceptReport';
import ConceptReportSocketWrapper from './ConceptReport/ConceptReportSocketWrapper';
import ConceptSettings from './ConceptSettings/ConceptSettings';
import CustomerProfile from './CustomerProfile/CustomerProfile';
import FinancialDetails from './FinancialDetails';
import MarketScan from './MarketScan/MarketScan';
import OverviewDetails from './OverviewDetails';
import Testing from './Testing/Testing';
import FinancialProjectionsWrapper from './FinancialProjectionsWrapper';

// Regular exports
export {
  Assumptions,
  ConceptReport,
  ConceptReportSocketWrapper,
  ConceptSettings,
  CustomerProfile,
  FinancialDetails,
  FinancialProjectionsWrapper,
  MarketScan,
  OverviewDetails,
  Testing,
};

// Type exports
export type { IConceptReportContext };

// Add properties to ConceptReport using type assertion
const ReportWithTabs = ConceptReport as unknown as typeof ConceptReport & {
  Overview: typeof OverviewDetails;
  MarketScan: typeof MarketScan;
  CustomerProfile: typeof CustomerProfile;
  FinancialProjection: typeof FinancialDetails;
  Assumptions: typeof Assumptions;
  ConceptSettings: typeof ConceptSettings;
  Testing: typeof Testing;
};

// Assign components as properties
ReportWithTabs.Overview = OverviewDetails;
ReportWithTabs.MarketScan = MarketScan;
ReportWithTabs.CustomerProfile = CustomerProfile;
ReportWithTabs.FinancialProjection = FinancialDetails;
ReportWithTabs.Assumptions = Assumptions;
ReportWithTabs.ConceptSettings = ConceptSettings;
ReportWithTabs.Testing = Testing;

export default ReportWithTabs;
