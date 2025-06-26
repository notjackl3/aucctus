import telemetry from '@libs/telemetry';
import React from 'react';

// Shared utility for building mathematical expressions from assumptions
// with support for nested parenthetical operations

// Generic interface for assumption entries that the expression builder can work with
export interface IAssumptionEntry {
  order: number;
  scalar: number;
  unit: string;
  operator?: string;
  title: string;
}

// Internal helper types for parenthetical group processing
interface IParentheticalGroup {
  assumptions: IAssumptionEntry[];
  nextIndex: number;
  isGroup: boolean;
}

/**
 * Helper function to detect and extract parenthetical groups from assumptions
 * Reduces code duplication between buildExpression and buildCalculationBreakdown
 */
const processParentheticalGroup = <T extends IAssumptionEntry>(
  assumptions: T[],
  startIndex: number,
): IParentheticalGroup => {
  const assumption = assumptions[startIndex];

  // Check if this starts a parenthetical group
  if (assumption.operator === '(+)' || assumption.operator === '(-)') {
    // Find all assumptions in this parenthetical group
    const groupAssumptions = [assumption];
    let j = startIndex + 1;

    // Collect assumptions until we find one without a parenthetical operator or reach the end
    while (j < assumptions.length) {
      groupAssumptions.push(assumptions[j]);

      // If the current assumption doesn't have a parenthetical operator,
      // or it's the last assumption, this group is complete
      if (
        !assumptions[j].operator ||
        (assumptions[j].operator !== '(+)' && assumptions[j].operator !== '(-)')
      ) {
        break;
      }
      j++;
    }

    return {
      assumptions: groupAssumptions,
      nextIndex: j + 1,
      isGroup: groupAssumptions.length >= 2,
    };
  }

  // Not a parenthetical group, return single assumption
  return {
    assumptions: [assumption],
    nextIndex: startIndex + 1,
    isGroup: false,
  };
};

/**
 * Helper function to determine the operation for a specific position within a parenthetical group
 * Handles the complex logic of nested operations within groups
 */
const getGroupOperation = (
  groupAssumptions: IAssumptionEntry[],
  position: number,
): string => {
  if (position === 0) return ''; // First item has no preceding operation

  let op = '+'; // default
  if (position === 1) {
    // Use the operator from the first assumption in the group
    op = groupAssumptions[0].operator === '(+)' ? '+' : '-';
  } else {
    // For nested operations, use the previous assumption's operator
    const prevOp = groupAssumptions[position - 1].operator;
    if (prevOp === '(+)') op = '+';
    else if (prevOp === '(-)') op = '-';
    else if (prevOp === '*') op = '*';
    else if (prevOp === '/') op = '/';
  }
  return op;
};

/**
 * Builds a mathematical expression string from sorted assumptions
 * Handles nested parenthetical operations like (A + B - C) * (D + E) * F
 */
export const buildExpression = <T extends IAssumptionEntry>(
  assumptions: T[],
): string => {
  let expression = '';
  let i = 0;

  while (i < assumptions.length) {
    const group = processParentheticalGroup(assumptions, i);

    if (group.isGroup) {
      // Handle parenthetical group
      expression += '(';

      for (let k = 0; k < group.assumptions.length; k++) {
        const groupAssumption = group.assumptions[k];
        const groupValue =
          groupAssumption.unit === '%'
            ? groupAssumption.scalar / 100
            : groupAssumption.scalar;

        const op = getGroupOperation(group.assumptions, k);
        if (op) {
          expression += ` ${op} `;
        }
        expression += groupValue.toString();
      }

      expression += ')';

      // Add the operator for the next part of the expression if it exists
      const lastAssumption = group.assumptions[group.assumptions.length - 1];
      if (
        group.nextIndex < assumptions.length &&
        lastAssumption.operator &&
        lastAssumption.operator !== '(+)' &&
        lastAssumption.operator !== '(-)'
      ) {
        expression += ` ${lastAssumption.operator} `;
      }
    } else {
      // Handle single assumption
      const assumption = group.assumptions[0];
      const value =
        assumption.unit === '%' ? assumption.scalar / 100 : assumption.scalar;

      expression += value.toString();

      if (assumption.operator && group.nextIndex < assumptions.length) {
        expression += ` ${assumption.operator} `;
      }
    }

    i = group.nextIndex;
  }

  return expression;
};

/**
 * Safely evaluates a mathematical expression and returns the result
 * Returns 0 if the expression is invalid or results in NaN/Infinity
 */
export const evaluateExpression = (
  expression: string,
  errorContext: 'market sizing' | 'impact sizing' = 'market sizing',
): number => {
  try {
    const result = new Function(`return ${expression}`)();
    return typeof result === 'number' && !isNaN(result) && isFinite(result)
      ? result
      : 0;
  } catch (error) {
    telemetry.error(
      `Error evaluating ${errorContext} expression:`,
      expression,
      error,
    );
    return 0;
  }
};

/**
 * Builds calculation breakdown JSX elements for display
 * Handles nested parenthetical groups with proper visual formatting
 */
export const buildCalculationBreakdown = <T extends IAssumptionEntry>(
  assumptions: T[],
): JSX.Element[] => {
  const breakdownElements: JSX.Element[] = [];
  let i = 0;

  while (i < assumptions.length) {
    const group = processParentheticalGroup(assumptions, i);

    if (group.isGroup) {
      // Handle parenthetical group display
      let groupDisplay = '(';
      let groupValues = '(';

      for (let k = 0; k < group.assumptions.length; k++) {
        const groupAssumption = group.assumptions[k];
        const op = getGroupOperation(group.assumptions, k);

        if (k === 0) {
          groupDisplay += groupAssumption.title;
          groupValues += `${groupAssumption.unit === '$' ? '$' : ''}${groupAssumption.scalar.toLocaleString()}${groupAssumption.unit === '%' ? '%' : ''}`;
        } else {
          groupDisplay += ` ${op} ${groupAssumption.title}`;
          groupValues += ` ${op} ${groupAssumption.unit === '$' ? '$' : ''}${groupAssumption.scalar.toLocaleString()}${groupAssumption.unit === '%' ? '%' : ''}`;
        }
      }

      groupDisplay += ')';
      groupValues += ')';

      breakdownElements.push(
        <div
          key={`group-${group.assumptions.map((a) => (a as any).uuid || a.title).join('-')}`}
          className='aucctus-text-xs aucctus-text-secondary flex items-center gap-2'
        >
          <span className='flex-1'>{groupDisplay}:</span>
          <span className='aucctus-text-primary font-mono'>{groupValues}</span>
          {(() => {
            const lastAssumption =
              group.assumptions[group.assumptions.length - 1];
            return lastAssumption.operator &&
              lastAssumption.operator !== '(+)' &&
              lastAssumption.operator !== '(-)' &&
              group.nextIndex < assumptions.length ? (
              <span className='aucctus-text-brand-primary font-mono'>
                {lastAssumption.operator}
              </span>
            ) : null;
          })()}
        </div>,
      );
    } else {
      // Handle single assumption display
      const assumption = group.assumptions[0];
      breakdownElements.push(
        <div
          key={(assumption as any).uuid || assumption.title}
          className='aucctus-text-xs aucctus-text-secondary flex items-center gap-2'
        >
          <span>{assumption.title}:</span>
          <span className='aucctus-text-primary font-mono'>
            {assumption.unit === '$' && '$'}
            {assumption.scalar.toLocaleString()}
            {assumption.unit === '%' && '%'}
          </span>
          {assumption.operator && group.nextIndex < assumptions.length && (
            <span className='aucctus-text-brand-primary font-mono'>
              {assumption.operator}
            </span>
          )}
        </div>,
      );
    }

    i = group.nextIndex;
  }

  return breakdownElements;
};
