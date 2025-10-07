/* eslint-disable no-console */
import React, { useMemo } from 'react';
import { IImpactSizingAssumptionEntryV2 } from '@libs/api/types/concept/financialProjectionV2';
import { formatCurrency } from '../../../../GenerateRevenue/tabs/MarketSizing/assumptionsUtils';
import {
  buildExpression,
  evaluateExpression,
  buildCalculationBreakdown,
} from '../../../../shared/expressionBuilder';

export interface ResultsPanelProps {
  resultsTitle: string;
  resultValueTitle: string;
  resultValueDescription: string;
  assumptions: IImpactSizingAssumptionEntryV2[];
  resultsRef: React.RefObject<HTMLDivElement>;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  resultsTitle,
  resultValueTitle,
  resultValueDescription,
  assumptions,
  resultsRef,
}) => {
  const calculatedValue = useMemo(() => {
    // Sort assumptions by order to ensure proper calculation sequence
    const sortedAssumptions = [...assumptions].sort(
      (a, b) => a.order - b.order,
    );

    if (sortedAssumptions.length === 0) return 0;

    const expression = buildExpression(sortedAssumptions);
    return evaluateExpression(expression, 'impact sizing');
  }, [assumptions]);

  const calculationBreakdown = useMemo(() => {
    // Sort assumptions by order to show the calculation steps
    const sortedAssumptions = [...assumptions].sort(
      (a, b) => a.order - b.order,
    );

    if (sortedAssumptions.length === 0) {
      return (
        <span className='aucctus-text-xs aucctus-text-tertiary'>
          No assumptions available
        </span>
      );
    }

    const breakdownElements = buildCalculationBreakdown(sortedAssumptions);
    return <div className='space-y-1'>{breakdownElements}</div>;
  }, [assumptions]);

  return (
    <div ref={resultsRef} className='h-fit p-6'>
      <div className='mb-4'>
        <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
          {resultsTitle}
        </h3>
      </div>

      <div className='aucctus-bg-tertiary aucctus-border-primary rounded-lg border p-6'>
        <div className='mb-4'>
          <h3 className='aucctus-text-md aucctus-text-primary'>
            {resultValueTitle}
          </h3>
        </div>

        <div className='aucctus-header-sm-bold aucctus-text-brand-primary mb-4'>
          {formatCurrency(calculatedValue)}
        </div>

        <p className='aucctus-text-sm aucctus-text-tertiary mb-4'>
          {resultValueDescription}
        </p>

        {/* Calculation Breakdown */}
        <div className='aucctus-bg-secondary-subtle rounded-lg p-3'>
          <h4 className='aucctus-text-xs aucctus-text-secondary mb-2'>
            Calculation Breakdown:
          </h4>
          {calculationBreakdown}
        </div>
      </div>
    </div>
  );
};
