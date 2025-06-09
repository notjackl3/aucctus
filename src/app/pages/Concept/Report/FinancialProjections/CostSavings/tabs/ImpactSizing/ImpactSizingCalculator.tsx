import React from 'react';
import { CalculatorLayout } from './CalculatorLayout';
import { IImpactSizingV2 } from '@libs/api/types/concept/financialProjectionV2';

interface ImpactSizingCalculatorProps {
  impactSizing: IImpactSizingV2;
}

const ImpactSizingCalculator: React.FC<ImpactSizingCalculatorProps> = ({
  impactSizing,
}) => {
  return (
    <CalculatorLayout
      impactSizing={impactSizing}
      title='How Bottom-Up Cost Savings Calculation Works'
      description='Start with key operational metrics like efficiency improvements, process optimization, and cost reduction opportunities to build your cost savings from the ground up.'
      assumptionsTitle='Determined cost saving assumptions'
      resultsTitle='Cost Savings Analysis'
      resultsSubtitle='Annual cost reduction potential'
      resultValueTitle='Annual Cost Savings Potential'
      resultValueDescription='Based on associated savings assumptions'
    />
  );
};

export default ImpactSizingCalculator;
