/**
 * TypeScript types for concept portfolio prioritization.
 */

export type InnovationHorizon = 'core' | 'adjacent' | 'disruptive';

export type ScoringStatus = 'pending' | 'scoring' | 'complete' | 'error';

export interface IConceptPriority {
  uuid: string;
  conceptUuid: string;
  strategicAlignmentScore: number;
  financialOpportunityScore: number;
  innovationRiskScore: number;
  overallPriorityScore: number;
  strategicAlignmentReasoning: string;
  financialOpportunityReasoning: string;
  innovationRiskReasoning: string;
  // Dynamic scoring fields
  /** Current status of AI scoring: pending, scoring, complete, error */
  scoringStatus?: ScoringStatus | null;
  innovationHorizon?: InnovationHorizon | null;
  innovationHorizonReasoning?: string;
  updatedAt: string;
}

export interface IConceptPrioritySummary {
  uuid: string;
  conceptUuid: string;
  strategicAlignmentScore: number;
  financialOpportunityScore: number;
  innovationRiskScore: number;
  overallPriorityScore: number;
  /** Current status of AI scoring: pending, scoring, complete, error */
  scoringStatus?: ScoringStatus | null;
  innovationHorizon?: InnovationHorizon | null;
  updatedAt: string;
}

export interface IGeneratePrioritiesResponse {
  taskId: string;
  message: string;
  conceptsQueued: number;
}

export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Helper function to determine priority level from score
 */
export function getPriorityLevel(score: number): PriorityLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Helper function to get priority color class
 */
export function getPriorityColorClass(level: PriorityLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (level) {
    case 'high':
      return {
        bg: 'aucctus-bg-success-subtle',
        text: 'aucctus-text-success-primary',
        border: 'aucctus-border-success',
      };
    case 'medium':
      return {
        bg: 'aucctus-bg-warning-subtle',
        text: 'aucctus-text-warning-primary',
        border: 'aucctus-border-warning',
      };
    case 'low':
      return {
        bg: 'aucctus-bg-error-subtle',
        text: 'aucctus-text-error-primary',
        border: 'aucctus-border-error',
      };
  }
}

/**
 * Get display label for innovation horizon
 */
export function getHorizonLabel(
  horizon: InnovationHorizon | null | undefined,
): string {
  switch (horizon) {
    case 'core':
      return 'Core (H1)';
    case 'adjacent':
      return 'Adjacent (H2)';
    case 'disruptive':
      return 'Disruptive (H3)';
    default:
      return 'Unknown';
  }
}

/**
 * Get color classes for innovation horizon
 */
export function getHorizonColorClass(
  horizon: InnovationHorizon | null | undefined,
): {
  bg: string;
  text: string;
  border: string;
} {
  switch (horizon) {
    case 'core':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-700',
      };
    case 'adjacent':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-300 dark:border-blue-700',
      };
    case 'disruptive':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-300 dark:border-purple-700',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-700',
      };
  }
}
