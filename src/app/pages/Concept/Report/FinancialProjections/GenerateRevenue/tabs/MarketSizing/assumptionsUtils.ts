/* eslint-disable no-console */
import { MarketMetrics } from '../../shared/types';
import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types';
import {
  buildExpression,
  evaluateExpression,
} from '../../../shared/expressionBuilder';

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

  // Calculate value for each group using the latest expression builder logic
  const calculateGroupValue = (
    groupAssumptions: IMarketSizingAssumptionEntryV2[],
  ): number => {
    // Sort assumptions by order to ensure proper calculation sequence
    const sortedAssumptions = [...groupAssumptions].sort(
      (a, b) => a.order - b.order,
    );

    if (sortedAssumptions.length === 0) return 0;

    // Use the shared expression builder for consistent, robust calculation
    const expression = buildExpression(sortedAssumptions);
    return evaluateExpression(expression, 'market sizing');
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
