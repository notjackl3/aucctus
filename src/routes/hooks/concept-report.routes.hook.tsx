import {
  FinancialProjectionsWrapper,
  AssumptionsWrapper,
  OverviewWrapper,
} from '@pages/Concept/Report';
import ConceptReport from '@pages/Concept/Report/ConceptReport/ConceptReport';
import ConceptSettings from '@pages/Concept/Report/ConceptSettings/ConceptSettings';
import CustomerProfile from '@pages/Concept/Report/CustomerProfile';
import MarketScanBase from '@pages/Concept/Report/MarketScanBase';
import TrendsWrapper from '@pages/Concept/Report/TrendsWrapper';
import EcosystemWrapper from '@pages/Concept/Report/EcosystemWrapper';
import Testing from '@pages/Concept/Report/Testing/Testing';
import Workshop from '@pages/Concept/Report/Workshop/Workshop';
import { AppPath, ConceptPath } from '@routes/routes';
import { Route } from 'react-router-dom';

const useConceptReportRoutes = () => {
  return (
    <Route path={AppPath.ConceptOverview} element={<ConceptReport />}>
      <Route index element={<OverviewWrapper />} />
      <Route path={ConceptPath.MarketScan} element={<MarketScanBase />} />
      <Route path={ConceptPath.Trends} element={<TrendsWrapper />} />
      <Route path={ConceptPath.Ecosystem} element={<EcosystemWrapper />} />
      <Route
        path={ConceptPath.FinancialProjection}
        element={<FinancialProjectionsWrapper />}
      />
      <Route path={ConceptPath.CustomerProfile} element={<CustomerProfile />} />
      <Route path={ConceptPath.Assumptions} element={<AssumptionsWrapper />} />
      <Route path={ConceptPath.Workshop} element={<Workshop />} />
      <Route path={ConceptPath.Testing} element={<Testing />} />
      <Route path={ConceptPath.Settings} element={<ConceptSettings />} />
    </Route>
  );
};

export default useConceptReportRoutes;
