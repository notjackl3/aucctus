/**
 * TypeScript types for concept portfolio prioritization.
 */

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
  updatedAt: string;
}

export interface IConceptPrioritySummary {
  uuid: string;
  conceptUuid: string;
  strategicAlignmentScore: number;
  financialOpportunityScore: number;
  innovationRiskScore: number;
  overallPriorityScore: number;
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
