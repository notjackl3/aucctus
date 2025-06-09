import React from 'react';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import { formatCurrency } from '../assumptionsUtils';
import { MarketMetrics } from '../../../shared/types';

interface SamFormulaProps {
  assumptions: IMarketSizingAssumptionEntryV2[];
  marketMetrics: MarketMetrics;
}

const SamFormula: React.FC<SamFormulaProps> = ({
  assumptions,
  marketMetrics,
}) => {
  // Filter SAM assumptions and sort by order
  const samAssumptions = assumptions
    .filter((a) => a.group?.toUpperCase() === 'SAM')
    .sort((a, b) => a.order - b.order);

  if (samAssumptions.length === 0) {
    return (
      <div className='aucctus-text-sm aucctus-text-tertiary'>
        <p>
          SAM is calculated as a percentage of TAM based on serviceable market
          factors
        </p>
        <p>No SAM assumptions data available</p>
      </div>
    );
  }

  // Build the formula display
  const buildFormulaDisplay = () => {
    let formulaElements: React.ReactNode[] = [];

    // Start with TAM
    const tamFormatted =
      marketMetrics.tam >= 1000000000
        ? `$${(marketMetrics.tam / 1000000000).toFixed(1)}B`
        : formatCurrency(marketMetrics.tam);

    formulaElements.push(
      <span key='tam' className='font-medium'>
        {tamFormatted}
      </span>,
    );

    // Add SAM-specific multipliers
    samAssumptions.forEach((assumption, index) => {
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

      const operator = assumption.operator || '×';
      formulaElements.push(
        <span key={`operator-${index}`} className='mx-1'>
          {operator}
        </span>,
      );

      formulaElements.push(
        <span key={`value-${index}`} className='font-medium'>
          {valueDisplay}
        </span>,
      );
    });

    return formulaElements;
  };

  // Format SAM for display
  const samFormatted =
    marketMetrics.sam >= 1000000000
      ? `$${(marketMetrics.sam / 1000000000).toFixed(1)}B`
      : `$${(marketMetrics.sam / 1000000).toFixed(1)}M`;

  return (
    <div className='aucctus-bg-primary min-w-[240px] max-w-[300px] rounded-md p-3 shadow-md'>
      <h4 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
        SAM
      </h4>
      <div className='aucctus-text-sm aucctus-text-secondary mb-2 text-center'>
        {buildFormulaDisplay()} = <strong>{samFormatted}</strong>
      </div>
      <div className='aucctus-text-xs aucctus-text-tertiary space-y-1'>
        <p>
          Serviceable Available Market is the segment of TAM targeted by your
          products and services.
        </p>
        {samAssumptions.length > 0 && (
          <div>
            <p className='mb-1 font-medium'>Based on:</p>
            {samAssumptions.map((assumption) => (
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

export default SamFormula;
