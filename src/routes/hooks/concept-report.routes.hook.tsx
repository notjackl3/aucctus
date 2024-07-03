import React from 'react';
import { Route } from 'react-router-dom';
import Page from '@pages';
import { AppPath, ConceptPath } from '@routes/routes';

const useConceptReportRoutes = () => {
  return (
    <Route path={AppPath.ConceptOverview} element={<Page.ConceptPages.ConceptReport />}>
      <Route index element={<Page.ConceptPages.Overview />} />
      <Route path={ConceptPath.MarketScan} element={<Page.ConceptPages.MarketScan />} />
      <Route path={ConceptPath.FinancialProjection} element={<Page.ConceptPages.FinancialProjection />} />
      <Route path={ConceptPath.CustomerProfile} element={<Page.ConceptPages.CustomerProfile />} />
      <Route path={ConceptPath.KeyAssumptions} element={<Page.ConceptPages.KeyAssumptions />} />
      <Route path={ConceptPath.ConceptSettings} element={<Page.ConceptPages.ConceptSettings />} />
    </Route>
  );
};

export default useConceptReportRoutes;
