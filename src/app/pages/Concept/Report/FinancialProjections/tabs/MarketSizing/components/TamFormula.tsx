import React from 'react';
import { MarketMetrics } from '../../../shared/types';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import { formatCurrency } from '../assumptionsUtils';

interface TamFormulaProps {
  assumptions: IMarketSizingAssumptionEntryV2[];
  marketMetrics: MarketMetrics;
}

const TamFormula: React.FC<TamFormulaProps> = ({
  assumptions,
  marketMetrics,
}) => {
  // Filter TAM assumptions and sort by order
  const tamAssumptions = assumptions
    .filter((a) => a.group?.toUpperCase() === 'TAM')
    .sort((a, b) => a.order - b.order);

  if (tamAssumptions.length === 0) {
    return (
      <div className='aucctus-text-sm aucctus-text-tertiary'>
        <p>TAM is calculated from market assumptions</p>
        <p>No TAM assumptions data available</p>
      </div>
    );
  }

  // Build the formula display
  const buildFormulaDisplay = () => {
    let formulaElements: React.ReactNode[] = [];

    tamAssumptions.forEach((assumption, index) => {
      // Format the value based on unit
      let valueDisplay = '';
      if (assumption.unit === '$') {
        valueDisplay = `$${assumption.scalar.toLocaleString()}`;
      } else if (assumption.unit === '%') {
        valueDisplay = `${assumption.scalar}%`;
      } else {
        valueDisplay =
          assumption.scalar >= 1000000
            ? `${(assumption.scalar / 1000000).toFixed(0)}M`
            : assumption.scalar.toLocaleString();
      }

      // Add the value to formula
      formulaElements.push(
        <span key={`value-${index}`} className='font-medium'>
          {valueDisplay}
        </span>,
      );

      // Add operator if there's a next element
      if (index < tamAssumptions.length - 1) {
        const operator = assumption.operator || '×';
        formulaElements.push(
          <span key={`operator-${index}`} className='mx-1'>
            {operator}
          </span>,
        );
      }
    });

    return formulaElements;
  };

  // Format the TAM value for display
  const tamFormatted =
    marketMetrics.tam >= 1000000000
      ? `$${(marketMetrics.tam / 1000000000).toFixed(1)}B`
      : formatCurrency(marketMetrics.tam);

  return (
    <div className='aucctus-bg-primary min-w-[240px] max-w-[300px] rounded-md p-3 shadow-md'>
      <h4 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
        TAM
      </h4>
      <div className='aucctus-text-sm aucctus-text-secondary mb-2 text-center'>
        {buildFormulaDisplay()} = <strong>{tamFormatted}</strong>
      </div>
      <div className='aucctus-text-xs aucctus-text-tertiary space-y-1'>
        <p>
          Total Addressable Market represents the total potential market size.
        </p>
        {tamAssumptions.length > 0 && (
          <div>
            <p className='mb-1 font-medium'>Based on:</p>
            {tamAssumptions.map((assumption) => (
              <p key={assumption.uuid} className='text-xs'>
                • {assumption.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TamFormula;
