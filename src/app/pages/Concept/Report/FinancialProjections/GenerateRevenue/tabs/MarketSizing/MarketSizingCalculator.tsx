import React from 'react';
import { CalculatorLayout } from './CalculatorLayout';
import { IMarketSizingV2 } from '@libs/api/types/concept/financialProjectionV2';

interface MarketSizingCalculatorProps {
  marketSizing: IMarketSizingV2;
}

const MarketSizingCalculator: React.FC<MarketSizingCalculatorProps> = ({
  marketSizing,
}) => {
  return (
    <CalculatorLayout
      marketSizing={marketSizing}
      title='How Bottom-Up Market Sizing Works'
      description='Start with key operational metrics like distribution points, units sold, and pricing to build your market size from the ground up.'
      resultsTitle='Market Size Analysis'
      resultValueTitle='Annual Revenue Potential'
      resultValueDescription='Based on associated market sizing assumptions'
    />
  );
};

export default MarketSizingCalculator;
