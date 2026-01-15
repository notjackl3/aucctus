/**
 * Default scoring categories and configuration
 * These will be replaced with backend data when API is integrated
 */

import { ScoringCategory, ImportanceConfig, Importance } from './types';

export const DEFAULT_SCORING_CATEGORIES: ScoringCategory[] = [
  {
    id: 'strategic-fit',
    name: 'Strategic Fit',
    icon: 'target',
    questions: [
      {
        id: 'q1-strategic',
        text: 'Does this concept align with our strategic priorities?',
        importance: 'high',
      },
      {
        id: 'q2-strategic',
        text: 'Does this reinforce our brand identity and values?',
        importance: 'medium',
      },
      {
        id: 'q3-strategic',
        text: 'Is this consistent with our market positioning?',
        importance: 'medium',
      },
    ],
  },
  {
    id: 'market-opportunity',
    name: 'Market Opportunity',
    icon: 'trending-up',
    questions: [
      {
        id: 'q1-market',
        text: 'Is there a clear and sizeable market opportunity?',
        importance: 'high',
      },
      {
        id: 'q2-market',
        text: 'Are market trends favorable for this concept?',
        importance: 'medium',
      },
      {
        id: 'q3-market',
        text: 'Is the competitive landscape favorable?',
        importance: 'medium',
      },
    ],
  },
  {
    id: 'customer-value',
    name: 'Customer Value',
    icon: 'users-02',
    questions: [
      {
        id: 'q1-customer',
        text: 'Does this solve a real customer pain point?',
        importance: 'high',
      },
      {
        id: 'q2-customer',
        text: 'Is the value proposition clearly differentiated?',
        importance: 'high',
      },
      {
        id: 'q3-customer',
        text: 'Would customers pay a premium for this?',
        importance: 'medium',
      },
    ],
  },
  {
    id: 'feasibility',
    name: 'Feasibility',
    icon: 'zap',
    questions: [
      {
        id: 'q1-feasibility',
        text: 'Do we have the technical capabilities to execute?',
        importance: 'high',
      },
      {
        id: 'q2-feasibility',
        text: 'Can this be delivered within budget constraints?',
        importance: 'medium',
      },
      {
        id: 'q3-feasibility',
        text: 'Is the timeline realistic?',
        importance: 'medium',
      },
    ],
  },
  {
    id: 'risk-profile',
    name: 'Risk Profile',
    icon: 'shield-dollar',
    questions: [
      {
        id: 'q1-risk',
        text: 'Are regulatory risks manageable?',
        importance: 'high',
      },
      {
        id: 'q2-risk',
        text: 'Are there significant operational risks?',
        importance: 'medium',
      },
      {
        id: 'q3-risk',
        text: 'Is the financial risk acceptable?',
        importance: 'medium',
      },
    ],
  },
];

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
