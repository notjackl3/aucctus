/**
 * Configuration constants for Concept Scoring
 *
 * Note: Default scoring categories are no longer defined here.
 * Scoring criteria are now generated dynamically by AI when Nucleus
 * processing completes. The AI analyzes company context from Nucleus
 * data to create customized evaluation questions.
 *
 * For existing accounts without criteria:
 * - Admins can trigger generation via Django admin action
 * - "Generate scoring criteria" action on Account admin
 */

import { Importance, ImportanceConfig } from './types';

/**
 * Visual configuration for importance levels in dropdowns and badges
 */
export const IMPORTANCE_CONFIG: Record<Importance, ImportanceConfig> = {
  low: {
    label: 'Low',
    bgClass: 'aucctus-bg-secondary-subtle',
    textClass: 'aucctus-text-secondary',
    borderClass: 'aucctus-border-secondary',
    dotClass: 'bg-slate-400',
    weight: 1,
  },
  medium: {
    label: 'Medium',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-700',
    dotClass: 'bg-amber-500',
    weight: 2,
  },
  high: {
    label: 'High',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-700',
    dotClass: 'bg-emerald-500',
    weight: 3,
  },
};
