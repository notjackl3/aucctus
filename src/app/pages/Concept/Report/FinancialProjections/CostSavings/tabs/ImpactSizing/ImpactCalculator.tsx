import React from 'react';
import { BaseCalculatorProps, CalculatorLayout } from './CalculatorLayout';

const ImpactCalculator: React.FC<BaseCalculatorProps> = ({ impactSizing }) => {
  return (
    <CalculatorLayout
      impactSizing={impactSizing}
      title='How Bottom-Up Impact Sizing Works'
      description='Start with key operational metrics like process improvements, efficiency gains, and cost reduction opportunities to build your impact estimate from the ground up.'
      resultsTitle='Impact Analysis'
      resultValueTitle='Annual Impact Potential'
      resultValueDescription='Based on operational optimization assumptions'
    />
  );
};

export default ImpactCalculator;
