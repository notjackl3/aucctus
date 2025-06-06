import { FinancialProjectionsWrapper } from '@pages/Concept/Report';
import Assumptions from '@pages/Concept/Report/Assumptions';
import ConceptReport from '@pages/Concept/Report/ConceptReport/ConceptReport';
import ConceptSettings from '@pages/Concept/Report/ConceptSettings/ConceptSettings';
import CustomerProfile from '@pages/Concept/Report/CustomerProfile';
import MarketScanBase from '@pages/Concept/Report/MarketScanBase';
import Overview from '@pages/Concept/Report/OverviewDetails';
import Testing from '@pages/Concept/Report/Testing/Testing';
import { AppPath, ConceptPath } from '@routes/routes';
import { Route } from 'react-router-dom';

// Declare feature flag
declare const FEATURE_ASSUMPTIONS_V2: boolean;

const useConceptReportRoutes = () => {
  return (
    <Route path={AppPath.ConceptOverview} element={<ConceptReport />}>
      <Route index element={<Overview />} />
      <Route path={ConceptPath.MarketScan} element={<MarketScanBase />} />
      <Route
        path={ConceptPath.FinancialProjection}
        element={<FinancialProjectionsWrapper />}
      />
      <Route path={ConceptPath.CustomerProfile} element={<CustomerProfile />} />
      <Route path={ConceptPath.Assumptions} element={<Assumptions />} />
      {FEATURE_ASSUMPTIONS_V2 && (
        <Route path={ConceptPath.Testing} element={<Testing />} />
      )}
      <Route path={ConceptPath.Settings} element={<ConceptSettings />} />
    </Route>
  );
};

export default useConceptReportRoutes;
