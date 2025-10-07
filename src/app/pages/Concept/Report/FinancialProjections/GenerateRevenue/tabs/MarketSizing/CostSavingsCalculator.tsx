import React from 'react';
import { BaseCalculatorProps, CalculatorLayout } from './CalculatorLayout';

const CostSavingsCalculator: React.FC<BaseCalculatorProps> = ({
  marketSizing,
}) => {
  return (
    <CalculatorLayout
      marketSizing={marketSizing}
      title='How Bottom-Up Cost Savings Works'
      description='Start with key operational metrics like production lines, hours, and efficiency improvements to build your cost savings estimate from the ground up.'
      resultsTitle='Cost Savings Analysis'
      resultValueTitle='Annual Cost Savings Potential'
      resultValueDescription='Based on manufacturing line optimization'
    />
  );
};

export default CostSavingsCalculator;
