import React from 'react';
import MarketScan from './components/MarketDetails';
import Overview from './components/OverviewDetails';
import CustomerProfile from './components/CustomerProfile';
import FinancialProjection from './components/FinancialDetails/FinancialDetails';
import KeyAssumptions from './components/HypothesisDetails';

const ConceptReport = React.lazy(() => import('./ConceptReport'));

const ConceptPages = {
  ConceptReport,
  Overview,
  MarketScan,
  CustomerProfile,
  FinancialProjection,
  KeyAssumptions,
};
export default ConceptPages;
