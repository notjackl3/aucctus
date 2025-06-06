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
      return 'lifebuoy';
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
 * Calculates validation percentage from category metrics
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
    if (metric.count === 0) return 0;

    // Use average certainty as validation percentage (convert from 0-1 to 0-100)
    const averageCertainty = metric.cumulativeCertainty / metric.count;
    return Math.round(averageCertainty * 100);
  }

  return 0;
};

/**
 * Gets AI insights based on category and validation percentage
 *
 * @param category - The assumption category
 * @param progress - The validation progress percentage (0-100)
 * @returns AI insight text for the category
 */
export const getCategoryInsight = (
  category: AssumptionCategory,
  progress: number,
): string => {
  switch (category) {
    case 'desirability':
      if (progress < 30)
        return 'Your desirability assumptions need significant validation. Focus on gathering more customer feedback to verify if your target audience actually wants this product.';
      if (progress < 70)
        return "You've started validating customer desire for your product, but there are still key questions about market fit. Consider additional user interviews and prototype testing.";
      return 'You have strong validation that customers want your product. Keep refining your understanding of specific user needs and preferences.';
    case 'viability':
      if (progress < 30)
        return 'Your business model assumptions require validation. Start with financial modeling and market sizing to establish a clearer path to profitability.';
      if (progress < 70)
        return "You've made progress on validating your business model, but important questions about pricing and margins remain. Consider pricing experiments and cost analysis.";
      return 'Your business model appears sound based on current validation. Monitor customer acquisition costs and lifetime value to refine your understanding.';
    case 'feasibility':
      if (progress < 30)
        return 'Technical feasibility requires further validation. Create technical prototypes to verify your ability to deliver on product promises.';
      if (progress < 70)
        return "You've validated some technical aspects, but challenges remain. Identify your highest technical risks and prioritize validating those assumptions.";
      return 'Technical feasibility appears strong. Continue refining your production process and consider scalability challenges.';
    case 'adaptability':
      if (progress < 30)
        return "You need more validation around your product's ability to adapt to market changes. Research upcoming trends and regulatory shifts in your industry.";
      if (progress < 70)
        return "You've considered adaptability, but uncertainties remain about how resilient your concept is to market shifts. Develop contingency plans for key risks.";
      return 'Your concept shows good adaptability to potential market changes. Continue monitoring industry trends and competitor moves.';
    default:
      return 'Select a category to see AI insights about your assumptions.';
  }
};

/**
 * Gets insight titles based on category and validation percentage
 *
 * @param category - The assumption category
 * @param progress - The validation progress percentage (0-100)
 * @returns Insight title for the category
 */
export const getCategoryInsightTitle = (
  category: AssumptionCategory,
  progress: number,
): string => {
  switch (category) {
    case 'desirability':
      if (progress < 30) return 'Customer Validation Needed';
      if (progress < 70) return 'Moderate Customer Validation';
      return 'Strong Customer Validation';
    case 'viability':
      if (progress < 30) return 'Business Model Validation Needed';
      if (progress < 70) return 'Partial Business Model Validation';
      return 'Strong Business Model Validation';
    case 'feasibility':
      if (progress < 30) return 'Technical Validation Needed';
      if (progress < 70) return 'Partial Technical Validation';
      return 'Strong Technical Validation';
    case 'adaptability':
      if (progress < 30) return 'Adaptability Validation Needed';
      if (progress < 70) return 'Partial Adaptability Validation';
      return 'Strong Adaptability Validation';
    default:
      return 'Validation Status';
  }
};
