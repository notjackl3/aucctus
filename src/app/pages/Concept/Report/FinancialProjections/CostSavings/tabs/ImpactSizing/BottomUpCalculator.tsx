import React from 'react';
import { IImpactSizingV2 } from '@libs/api/types/concept/financialProjectionV2';
import ImpactSizingCalculator from './ImpactSizingCalculator';

interface BottomUpCalculatorProps {
  impactSizing: IImpactSizingV2;
}

const BottomUpCalculator: React.FC<BottomUpCalculatorProps> = ({
  impactSizing,
}) => {
  return <ImpactSizingCalculator impactSizing={impactSizing} />;
};

export default BottomUpCalculator;
