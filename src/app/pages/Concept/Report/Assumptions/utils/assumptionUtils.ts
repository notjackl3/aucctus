import {
  IAssumptionV2,
  AssumptionStatusV2,
  AssumptionCategory,
} from '@libs/api/types';
import { CategoryMetric } from '@hooks/query/assumptions.hook';

/**
 * Calculates the validation percentage for a set of assumptions
 *
 * @param assumptions - List of assumptions to calculate validation for
 * @returns The percentage of validation from 0-100
 */
export const calculateValidationPercentage = (
  assumptions: IAssumptionV2[],
): number => {
  if (!assumptions.length) return 0;

  // Different statuses have different weights
  const statusWeights: Record<AssumptionStatusV2, number> = {
    validated: 100,
    unvalidated: 0,
    partially_validated: 50,
    invalidated: 0,
    untested: 0,
  };

  // Calculate the weighted sum
  const validationSum = assumptions.reduce((sum, assumption) => {
    return sum + statusWeights[assumption.status || 'untested'];
  }, 0);

  // Return percentage
  return validationSum / assumptions.length;
};

/**
 * Gets a description of the validation status for display purposes
 *
 * @param status - The status value
 * @returns Human-readable description of the status
 */
export const getValidationStatusDescription = (
  status: AssumptionStatusV2,
): string => {
  switch (status) {
    case 'validated':
      return 'Validated';
    case 'partially_validated':
      return 'Partially Validated';
    case 'invalidated':
      return 'Invalidated';
    case 'untested':
      return 'Untested';
    default:
      return 'Unknown';
  }
};

/**
 * Calculates the overall confidence score based on all assumptions
 *
 * @param assumptions - List of assumptions to calculate confidence for
 * @returns The confidence score from 0-100
 */
export const calculateConfidenceScore = (
  assumptions: IAssumptionV2[],
): number => {
  if (!assumptions.length) return 0;

  // For confidence, we consider both validation status and the importance of each assumption
  const weightedSum = assumptions.reduce((sum, assumption) => {
    const confidence = assumption.confidence || assumption.certainty || 0;
    const importance = assumption.importance || 0;
    const status = assumption.status || 'untested';

    // Invalidated assumptions severely reduce confidence, regardless of importance
    if (status === 'invalidated') {
      return sum + (confidence * 0.2 * importance) / 100;
    }

    // Untested high-importance assumptions also significantly reduce confidence
    if (status === 'untested' && importance > 75) {
      return sum + (confidence * 0.4 * importance) / 100;
    }

    // Otherwise, use the assumption's confidence weighted by importance
    return sum + (confidence * importance) / 100;
  }, 0);

  // Calculate weighted average based on importance
  const totalImportance = assumptions.reduce(
    (sum, a) => sum + (a.importance || 0),
    0,
  );

  return Math.round((weightedSum / totalImportance) * 100);
};

/**
 * Gets the CSS class for a status badge
 */
export const getStatusBadgeClass = (status: AssumptionStatusV2): string => {
  switch (status) {
    case 'validated':
      return 'aucctus-bg-success-secondary aucctus-text-success-primary';
    case 'partially_validated':
      return 'aucctus-bg-warning-secondary aucctus-text-warning-primary';
    case 'invalidated':
      return 'aucctus-bg-error-secondary aucctus-text-error-primary';
    case 'untested':
      return 'aucctus-bg-secondary aucctus-text-secondary';
    default:
      return 'aucctus-bg-secondary aucctus-text-secondary';
  }
};

/**
 * Gets the CSS class for a risk indicator
 */
export const getRiskClass = (risk: number): string => {
  if (risk <= 30) {
    return 'aucctus-bg-success-solid';
  } else if (risk <= 60) {
    return 'aucctus-bg-warning-solid';
  } else {
    return 'aucctus-bg-error-solid';
  }
};

/**
 * Gets the icon to use for a given category
 */
export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'desirability':
      return 'heart';
    case 'viability':
      return 'currency-dollar';
    case 'feasibility':
      return 'gear';
    case 'adaptability':
      return 'waves';
    default:
      return 'help-circle';
  }
};

// Category configuration for DVFA (Desirability, Viability, Feasibility, Adaptability)
export const CATEGORY_CONFIG = [
  {
    category: 'desirability' as AssumptionCategory,
    title: 'Desirability',
    description: 'Do customers want this product?',
  },
  {
    category: 'viability' as AssumptionCategory,
    title: 'Viability',
    description: 'Can we make a profit on this product?',
  },
  {
    category: 'feasibility' as AssumptionCategory,
    title: 'Feasibility',
    description: 'Can we actually create this product?',
  },
  {
    category: 'adaptability' as AssumptionCategory,
    title: 'Adaptability',
    description: 'Will this product remain relevant?',
  },
] as const;

/**
 * Gets validation status directly from category metrics
 *
 * @param category - The assumption category
 * @param categoryMetrics - The category metrics from API
 * @returns The validation status
 */
export const getValidationStatusFromMetrics = (
  category: AssumptionCategory,
  categoryMetrics?: Record<AssumptionCategory, CategoryMetric>,
): AssumptionStatusV2 => {
  if (categoryMetrics?.[category]) {
    const metric = categoryMetrics[category];

    // Map API validation status to our internal status
    if (metric.validationStatus === 'validated') return 'validated';
    if (metric.validationStatus === 'partially_validated')
      return 'partially_validated';
    if (metric.validationStatus === 'invalidated') return 'invalidated';
    if (metric.validationStatus === 'unvalidated') return 'unvalidated';
  }

  return 'untested'; // Default fallback
};

/**
 * Calculates validation percentage from category metrics
 * @deprecated Use getValidationStatusFromMetrics instead for new code
 *
 * @param category - The assumption category
 * @param categoryMetrics - The category metrics from API
 * @returns The validation percentage (0-100)
 */
export const getValidationPercentageFromMetrics = (
  category: AssumptionCategory,
  categoryMetrics?: Record<AssumptionCategory, CategoryMetric>,
): number => {
  if (categoryMetrics?.[category]) {
    const metric = categoryMetrics[category];

    // Use the validationPercentage from API if available (0-1 range, convert to 0-100)
    if (metric.validationPercentage !== undefined) {
      return Math.round(metric.validationPercentage * 100);
    }

    // Fallback: create a synthetic percentage based on validationStatus
    if (metric.validationStatus === 'validated') {
      return 100;
    } else if (metric.validationStatus === 'partially_validated') {
      return 50; // Partially validated = 50%
    } else if (metric.validationStatus === 'invalidated') {
      return 0;
    } else if (
      metric.validationStatus === 'unvalidated' ||
      metric.validationStatus === 'untested'
    ) {
      return 0;
    }
  }

  return 0;
};

/**
 * Gets AI insights based on category and validation status
 *
 * @param category - The assumption category
 * @param status - The validation status
 * @returns AI insight text for the category
 */
export const getCategoryInsightByStatus = (
  category: AssumptionCategory,
  status: AssumptionStatusV2,
): string => {
  switch (category) {
    case 'desirability':
      if (status === 'untested' || status === 'unvalidated')
        return 'Your desirability assumptions need validation. Focus on gathering customer feedback to verify if your target audience actually wants this product.';
      if (status === 'partially_validated')
        return "You've started validating customer desire for your product, but key questions about market fit remain. Consider additional user interviews and prototype testing.";
      if (status === 'validated')
        return 'You have strong validation that customers want your product. Keep refining your understanding of specific user needs and preferences.';
      return 'Your desirability assumptions have been invalidated. Re-examine your target market and value proposition.';
    case 'viability':
      if (status === 'untested' || status === 'unvalidated')
        return 'Your business model assumptions require validation. Start with financial modeling and market sizing to establish a clearer path to profitability.';
      if (status === 'partially_validated')
        return "You've made progress on validating your business model, but important questions about pricing and margins remain. Consider pricing experiments and cost analysis.";
      if (status === 'validated')
        return 'Your business model appears sound based on current validation. Monitor customer acquisition costs and lifetime value to refine your understanding.';
      return 'Your business model assumptions have been invalidated. Re-evaluate your pricing strategy and cost structure.';
    case 'feasibility':
      if (status === 'untested' || status === 'unvalidated')
        return 'Technical feasibility requires validation. Create technical prototypes to verify your ability to deliver on product promises.';
      if (status === 'partially_validated')
        return "You've validated some technical aspects, but challenges remain. Identify your highest technical risks and prioritize validating those assumptions.";
      if (status === 'validated')
        return 'Technical feasibility appears strong. Continue refining your production process and consider scalability challenges.';
      return 'Technical feasibility assumptions have been invalidated. Consider alternative technical approaches or simplifying your product.';
    case 'adaptability':
      if (status === 'untested' || status === 'unvalidated')
        return "You need validation around your product's ability to adapt to market changes. Research upcoming trends and regulatory shifts in your industry.";
      if (status === 'partially_validated')
        return "You've considered adaptability, but uncertainties remain about how resilient your concept is to market shifts. Develop contingency plans for key risks.";
      if (status === 'validated')
        return 'Your concept shows good adaptability to potential market changes. Continue monitoring industry trends and competitor moves.';
      return 'Your adaptability assumptions have been invalidated. Consider pivoting your approach to better handle market changes.';
    default:
      return 'Select a category to see AI insights about your assumptions.';
  }
};

/**
 * Gets insight titles based on category and validation status
 *
 * @param category - The assumption category
 * @param status - The validation status
 * @returns Insight title for the category
 */
export const getCategoryInsightTitleByStatus = (
  category: AssumptionCategory,
  status: AssumptionStatusV2,
): string => {
  const statusText =
    status === 'untested' || status === 'unvalidated'
      ? 'Validation Needed'
      : status === 'partially_validated'
        ? 'Partial Validation'
        : status === 'validated'
          ? 'Strong Validation'
          : 'Invalidated';

  switch (category) {
    case 'desirability':
      return `Customer ${statusText}`;
    case 'viability':
      return `Business Model ${statusText}`;
    case 'feasibility':
      return `Technical ${statusText}`;
    case 'adaptability':
      return `Adaptability ${statusText}`;
    default:
      return 'Validation Status';
  }
};

/**
 * Gets AI insights based on category and validation percentage
 * @deprecated Use getCategoryInsightByStatus instead for new code
 *
 * @param category - The assumption category
 * @param progress - The validation progress percentage (0-100)
 * @returns AI insight text for the category
 */
export const getCategoryInsight = (
  category: AssumptionCategory,
  progress: number,
): string => {
  // Convert percentage to status for backward compatibility
  const status: AssumptionStatusV2 =
    progress === 0
      ? 'untested'
      : progress < 100
        ? 'partially_validated'
        : 'validated';
  return getCategoryInsightByStatus(category, status);
};

/**
 * Gets insight titles based on category and validation percentage
 * @deprecated Use getCategoryInsightTitleByStatus instead for new code
 *
 * @param category - The assumption category
 * @param progress - The validation progress percentage (0-100)
 * @returns Insight title for the category
 */
export const getCategoryInsightTitle = (
  category: AssumptionCategory,
  progress: number,
): string => {
  // Convert percentage to status for backward compatibility
  const status: AssumptionStatusV2 =
    progress === 0
      ? 'untested'
      : progress < 100
        ? 'partially_validated'
        : 'validated';
  return getCategoryInsightTitleByStatus(category, status);
};
