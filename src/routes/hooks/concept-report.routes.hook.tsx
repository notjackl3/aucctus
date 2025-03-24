import Page from '@pages';
import { AppPath, ConceptPath } from '@routes/routes';
import { Route } from 'react-router-dom';

const useConceptReportRoutes = () => {
  return (
    <Route path={AppPath.ConceptOverview} element={<Page.Concept.Report />}>
      <Route index element={<Page.Concept.Report.Overview />} />
      <Route
        path={ConceptPath.MarketScan}
        element={<Page.Concept.Report.MarketScan />}
      />
      <Route
        path={ConceptPath.FinancialProjection}
        element={<Page.Concept.Report.FinancialProjection />}
      />
      <Route
        path={ConceptPath.CustomerProfile}
        element={<Page.Concept.Report.CustomerProfile />}
      />
      <Route
        path={ConceptPath.Assumptions}
        element={<Page.Concept.Report.Assumptions />}
      />
    </Route>
  );
};

export default useConceptReportRoutes;
