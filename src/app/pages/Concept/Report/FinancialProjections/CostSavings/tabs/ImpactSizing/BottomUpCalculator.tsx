import React from 'react';
import { IImpactSizingV2 } from '@libs/api/types/concept/financialProjectionV2';
import ImpactCalculator from './ImpactCalculator';
import ImpactSizingCalculator from './ImpactSizingCalculator';

interface BottomUpCalculatorProps {
  impactSizing: IImpactSizingV2;
  isCostSavingsPage?: boolean;
}

const BottomUpCalculator: React.FC<BottomUpCalculatorProps> = ({
  impactSizing,
  isCostSavingsPage = false,
}) => {
  return isCostSavingsPage ? (
    <ImpactCalculator impactSizing={impactSizing} />
  ) : (
    <ImpactSizingCalculator impactSizing={impactSizing} />
  );
};

export default BottomUpCalculator;
