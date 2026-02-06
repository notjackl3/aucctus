/**
 * Portfolio Executive Summary Socket Wrapper
 *
 * Handles WebSocket events for portfolio executive summary generation.
 * Listens for progress, completion, and error events and updates the React Query cache.
 */

import { usePortfolioExecutiveSummarySocketEvents } from '@hooks/query/portfolio.hook';
import React from 'react';

const PortfolioExecutiveSummaryWrapper: React.FC = () => {
  // Subscribe to all WebSocket events
  usePortfolioExecutiveSummarySocketEvents();

  // This is just a listener component - render nothing
  return <></>;
};

export default PortfolioExecutiveSummaryWrapper;
