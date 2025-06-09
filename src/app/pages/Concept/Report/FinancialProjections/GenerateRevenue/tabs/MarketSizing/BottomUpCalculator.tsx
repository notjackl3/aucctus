import React from 'react';
import { IMarketSizingV2 } from '@libs/api/types/concept/financialProjectionV2';
import CostSavingsCalculator from './CostSavingsCalculator';
import MarketSizingCalculator from './MarketSizingCalculator';

interface BottomUpCalculatorProps {
  marketSizing: IMarketSizingV2;
  isCostSavingsPage?: boolean;
}

const BottomUpCalculator: React.FC<BottomUpCalculatorProps> = ({
  marketSizing,
  isCostSavingsPage = false,
}) => {
  return isCostSavingsPage ? (
    <CostSavingsCalculator marketSizing={marketSizing} />
  ) : (
    <MarketSizingCalculator marketSizing={marketSizing} />
  );
};

export default BottomUpCalculator;
