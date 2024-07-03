import React from 'react';

import Detail from './DetailCard';

const Kanban = React.lazy(() => import('./Kanban/ConceptCard'));
const MarketSizeProjections = React.lazy(() => import('./MarketSizeProjectionsCard/MarketSizeProjectionsCard'));
const KeyAssumptions = React.lazy(() => import('./KeyAssumptionsCard'));
const FinancialProjects = React.lazy(() => import('./FinancialProjectsCard'));
const CustomerProfiles = React.lazy(() => import('./CustomerProfilesCard'));
const Ignition = React.lazy(() => import('./IgnitionCard'));

const Card = {
  Detail,
  Kanban,
  MarketSizeProjections,
  KeyAssumptions,
  FinancialProjects,
  CustomerProfiles,
  Ignition,
};

export default Card;
