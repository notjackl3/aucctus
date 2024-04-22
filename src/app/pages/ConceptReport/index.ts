import React from 'react';

const ConceptReport = React.lazy(() => import('./ConceptReport'));
const MarketDetails = React.lazy(() => import('./components/MarketDetails'));
const OverviewDetails = React.lazy(() => import('./components/OverviewDetails'));
const CustomerProfile = React.lazy(() => import('./components/CustomerProfile'));
const FinancialDetails = React.lazy(() => import('./components/FinancialDetails'));
const HypothesisDetails = React.lazy(() => import('./components/HypothesisDetails'));

const ConceptPages = {
  ConceptReport,
  OverviewDetails,
  MarketDetails,
  CustomerProfile,
  FinancialDetails,
  HypothesisDetails,
};
export default ConceptPages;
