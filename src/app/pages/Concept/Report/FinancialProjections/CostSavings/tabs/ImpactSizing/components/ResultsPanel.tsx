/* eslint-disable no-console */
import React, { useMemo } from 'react';
import { IImpactSizingAssumptionEntryV2 } from '@libs/api/types/concept/financialProjectionV2';
import { formatCurrency } from '../../../../GenerateRevenue/tabs/MarketSizing/assumptionsUtils';

export interface ResultsPanelProps {
  resultsTitle: string;
  resultsSubtitle: string;
  resultValueTitle: string;
  resultValueDescription: string;
  assumptions: IImpactSizingAssumptionEntryV2[];
  resultsRef: React.RefObject<HTMLDivElement>;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  resultsTitle,
  resultsSubtitle,
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

    // Build the mathematical expression string
    let expression = '';

    for (let i = 0; i < sortedAssumptions.length; i++) {
      const assumption = sortedAssumptions[i];

      // Apply factor for percentage units (convert to decimal)
      const value =
        assumption.unit === '%' ? assumption.scalar / 100 : assumption.scalar;

      // Add the current assumption's value
      expression += value.toString();

      // Handle different operator types
      if (assumption.operator && i < sortedAssumptions.length - 1) {
        const nextAssumption = sortedAssumptions[i + 1];
        const nextValue =
          nextAssumption.unit === '%'
            ? nextAssumption.scalar / 100
            : nextAssumption.scalar;

        if (assumption.operator === '(+)' || assumption.operator === '(-)') {
          // Handle parenthetical operations
          const operation = assumption.operator === '(+)' ? '+' : '-';

          // Wrap current and next value in parentheses
          // Remove the current value from expression and rebuild with parentheses
          expression = expression.substring(
            0,
            expression.lastIndexOf(value.toString()),
          );
          expression += `(${value} ${operation} ${nextValue})`;

          // Skip the next iteration since we've already processed the next value
          i++;

          // If there's another assumption after the next one, add its operator
          if (
            i < sortedAssumptions.length - 1 &&
            sortedAssumptions[i].operator
          ) {
            expression += ` ${sortedAssumptions[i].operator} `;
          }
          // If no operator on the consumed assumption, we're done
          else if (!sortedAssumptions[i].operator) {
            break;
          }
        } else {
          // Handle regular operations
          expression += ` ${assumption.operator} `;
        }
      }
      // If no operator is present, we're done with this group
      else if (!assumption.operator) {
        break;
      }
    }

    // Safely evaluate the mathematical expression using Function constructor
    // This is safer than eval() and still allows proper BEDMAS evaluation
    try {
      const result = new Function(`return ${expression}`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch (error) {
      console.error(
        'Error evaluating market sizing expression:',
        expression,
        error,
      );
      return 0;
    }
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

    const breakdownElements: JSX.Element[] = [];

    for (let i = 0; i < sortedAssumptions.length; i++) {
      const assumption = sortedAssumptions[i];

      // Stop processing if previous assumption had no operator
      if (i > 0 && !sortedAssumptions[i - 1].operator) {
        break;
      }

      if (assumption.operator === '(+)' || assumption.operator === '(-)') {
        // Handle parenthetical operations - show both current and next assumption together
        const nextAssumption = sortedAssumptions[i + 1];
        if (nextAssumption) {
          const operation = assumption.operator === '(+)' ? '+' : '-';

          breakdownElements.push(
            <div
              key={`${assumption.uuid}-${nextAssumption.uuid}`}
              className='aucctus-text-xs aucctus-text-secondary flex items-center gap-2'
            >
              <span>
                ({assumption.title} {operation} {nextAssumption.title}):
              </span>
              <span className='aucctus-text-primary font-mono'>
                ({assumption.unit === '$' && '$'}
                {assumption.scalar.toLocaleString()}
                {assumption.unit === '%' && '%'} {operation}{' '}
                {nextAssumption.unit === '$' && '$'}
                {nextAssumption.scalar.toLocaleString()}
                {nextAssumption.unit === '%' && '%'})
              </span>
              {nextAssumption.operator &&
                i + 1 < sortedAssumptions.length - 1 && (
                  <span className='aucctus-text-brand-primary font-mono'>
                    {nextAssumption.operator}
                  </span>
                )}
            </div>,
          );

          // Skip the next iteration since we've processed it
          i++;
        }
      } else {
        // Handle regular operations
        breakdownElements.push(
          <div
            key={assumption.uuid}
            className='aucctus-text-xs aucctus-text-secondary flex items-center gap-2'
          >
            <span>{assumption.title}:</span>
            <span className='aucctus-text-primary font-mono'>
              {assumption.unit === '$' && '$'}
              {assumption.scalar.toLocaleString()}
              {assumption.unit === '%' && '%'}
            </span>
            {assumption.operator && i < sortedAssumptions.length - 1 && (
              <span className='aucctus-text-brand-primary font-mono'>
                {assumption.operator}
              </span>
            )}
          </div>,
        );
      }
    }

    return <div className='space-y-1'>{breakdownElements}</div>;
  }, [assumptions]);

  return (
    <div ref={resultsRef} className='h-fit p-6'>
      <div className='mb-4'>
        <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
          {resultsTitle}
        </h3>
        <p className='aucctus-text-xs aucctus-text-tertiary'>
          {resultsSubtitle}
        </p>
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
