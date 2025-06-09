/* eslint-disable no-console */
import { MarketMetrics } from '../../shared/types';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';

export const calculateMarketMetrics = (
  assumptions: IMarketSizingAssumptionEntryV2[],
): MarketMetrics => {
  // Group assumptions by their group (TAM, SAM, SOM)
  const groupedAssumptions = assumptions.reduce(
    (acc, assumption) => {
      const group = assumption.group?.toUpperCase() || 'TAM';
      if (!acc[group]) acc[group] = [];
      acc[group].push(assumption);
      return acc;
    },
    {} as Record<string, IMarketSizingAssumptionEntryV2[]>,
  );

  // Calculate value for each group using the correct operator logic
  const calculateGroupValue = (
    groupAssumptions: IMarketSizingAssumptionEntryV2[],
  ): number => {
    // Sort assumptions by order to ensure proper calculation sequence
    const sortedAssumptions = [...groupAssumptions].sort(
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
    // This ensures proper BEDMAS/PEMDAS evaluation
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
  };

  const tam = calculateGroupValue(groupedAssumptions.TAM || []);
  const sam = calculateGroupValue(groupedAssumptions.SAM || []) * tam;
  const som = calculateGroupValue(groupedAssumptions.SOM || []) * sam;

  return {
    tam,
    sam,
    som,
  };
};

// Get assumptions filtered by group
export const getAssumptionsByGroup = (
  assumptions: IMarketSizingAssumptionEntryV2[],
  group: 'tam' | 'sam' | 'som',
): IMarketSizingAssumptionEntryV2[] => {
  return assumptions
    .filter(
      (assumption) => assumption.group?.toLowerCase() === group.toLowerCase(),
    )
    .sort((a, b) => a.order - b.order);
};

// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    notation: value >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short',
  }).format(value);
};

// Update a specific assumption and recalculate metrics
export const updateAssumption = (
  assumptions: IMarketSizingAssumptionEntryV2[],
  assumptionUuid: string,
  newScalar: number,
): {
  updatedAssumptions: IMarketSizingAssumptionEntryV2[];
  marketMetrics: MarketMetrics;
} => {
  const updatedAssumptions = assumptions.map((assumption) =>
    assumption.uuid === assumptionUuid
      ? { ...assumption, scalar: newScalar }
      : assumption,
  );

  const marketMetrics = calculateMarketMetrics(updatedAssumptions);

  return { updatedAssumptions, marketMetrics };
};

// Update assumption group and recalculate metrics
export const updateAssumptionGroup = (
  assumptions: IMarketSizingAssumptionEntryV2[],
  assumptionId: string,
  newGroup: 'tam' | 'sam' | 'som',
): {
  updatedAssumptions: IMarketSizingAssumptionEntryV2[];
  marketMetrics: MarketMetrics;
} => {
  const updatedAssumptions = assumptions.map((assumption) =>
    assumption.uuid === assumptionId
      ? { ...assumption, group: newGroup.toUpperCase() }
      : assumption,
  );

  const marketMetrics = calculateMarketMetrics(updatedAssumptions);

  return { updatedAssumptions, marketMetrics };
};
