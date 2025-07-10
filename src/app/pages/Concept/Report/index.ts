import AssumptionsWrapper from './AssumptionsWrapper';
import ConceptReport, {
  IConceptReportContext,
} from './ConceptReport/ConceptReport';
import ConceptReportSocketWrapper from './ConceptReport/ConceptReportSocketWrapper';
import ConceptSettings from './ConceptSettings/ConceptSettings';
import CustomerProfile from './CustomerProfile/CustomerProfile';
import FinancialProjectionsWrapper from './FinancialProjectionsWrapper';
import MarketScan from './MarketScanBase';
import OverviewDetails from './OverviewDetails';
import Testing from './Testing/Testing';

// Regular exports
export {
  AssumptionsWrapper,
  ConceptReport,
  ConceptReportSocketWrapper,
  ConceptSettings,
  CustomerProfile,
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
  FinancialProjection: typeof FinancialProjectionsWrapper;
  Assumptions: typeof AssumptionsWrapper;
  ConceptSettings: typeof ConceptSettings;
  Testing: typeof Testing;
};

// Assign components as properties
ReportWithTabs.Overview = OverviewDetails;
ReportWithTabs.MarketScan = MarketScan;
ReportWithTabs.CustomerProfile = CustomerProfile;
ReportWithTabs.FinancialProjection = FinancialProjectionsWrapper;
ReportWithTabs.Assumptions = AssumptionsWrapper;
ReportWithTabs.ConceptSettings = ConceptSettings;
ReportWithTabs.Testing = Testing;

export default ReportWithTabs;
