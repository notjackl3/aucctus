/**
 * Types, constants, and pure helpers for DocumentUploadModal.
 * No React dependency — only data structures and transformation functions.
 */

import {
  BarChart3,
  Frown,
  Smile,
  Briefcase,
  Activity,
  Target,
  Quote,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { IEvidence, IPersona } from '@libs/api/types/persona';

// ============================================
// Types
// ============================================

export interface InsightItem {
  uuid: string;
  type: IEvidence['type'];
  targetWidget: string;
  targetFieldRaw: string;
  extractedText: string;
  proposedValue?: string;
  currentValue?: string;
  action: 'add' | 'change' | 'context';
  confidence: 'high' | 'medium' | 'low';
  approved: boolean | null;
}

// ============================================
// Constants
// ============================================

export const PROCESSING_STAGE_LABELS = [
  'Reading document structure...',
  'Extracting key insights...',
  'Matching to persona attributes...',
  'Preparing suggestions...',
];

export const STAGE_INDEX_MAP: Record<string, number> = {
  pending: 0,
  started: 0,
  processing: 0,
  extracting: 1,
  analyzing: 2,
  creating_evidence: 3,
};

export const WIDGET_ICON_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  key_facts: {
    icon: BarChart3,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  pains: {
    icon: Frown,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
  gains: {
    icon: Smile,
    color:
      'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  jobs_to_be_done: {
    icon: Briefcase,
    color:
      'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  },
  behaviours: {
    icon: Activity,
    color:
      'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  },
  motivations: {
    icon: Target,
    color:
      'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  },
  quotes: {
    icon: Quote,
    color:
      'text-slate-600 bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400',
  },
};

export const DEFAULT_WIDGET_ICON = {
  icon: BookOpen,
  color: 'aucctus-text-secondary aucctus-bg-secondary',
};

export const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  add: {
    label: 'Add',
    color:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
  },
  change: {
    label: 'Change',
    color:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  },
  context: {
    label: 'Inform',
    color:
      'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700',
  },
};

/** Processing timeout in ms (2.5 minutes) */
export const PROCESSING_TIMEOUT_MS = 150_000;

/** Delay before fetching evidence after processing completes (allows backend to finish writing) */
export const POST_PROCESSING_FETCH_DELAY_MS = 500;

/** Allowed file extensions for training documents */
export const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.csv', '.xlsx']);

// ============================================
// Helpers
// ============================================

export function formatTargetField(field?: string): string {
  if (!field) return 'General Context';
  return field
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Structured fields whose suggestedUpdate is serialized as JSON */
const STRUCTURED_FIELDS = new Set([
  'key_facts',
  'social_values',
  'quotes',
  'workday_steps',
]);

/**
 * Parse JSON-serialized suggestedUpdate for structured fields into readable text.
 * Simple fields (jobs_to_be_done, pains, etc.) are returned as-is.
 */
function formatSuggestedUpdate(raw: string, targetField: string): string {
  if (!STRUCTURED_FIELDS.has(targetField)) return raw;

  try {
    const parsed = JSON.parse(raw) as Record<string, string | boolean>;
    switch (targetField) {
      case 'key_facts':
        return `${parsed.stat} \u2014 ${parsed.label}`;
      case 'social_values':
        return parsed.description
          ? `${parsed.title}: ${parsed.description}`
          : String(parsed.title);
      case 'quotes':
        return parsed.context
          ? `\u201C${parsed.text}\u201D \u2014 ${parsed.context}`
          : `\u201C${parsed.text}\u201D`;
      case 'workday_steps':
        return `${parsed.time} ${parsed.title}${parsed.description ? ` \u2014 ${parsed.description}` : ''}`;
      default:
        return raw;
    }
  } catch {
    return raw;
  }
}

/** Map backend action to insight action type */
function resolveAction(evidence: IEvidence): InsightItem['action'] {
  if (evidence.action === 'inform') return 'context';
  if (evidence.action === 'change') return 'change';
  if (evidence.action === 'add') return 'add';
  // Fallback: guess from suggestedUpdate presence
  return evidence.suggestedUpdate ? 'add' : 'context';
}

/** Snake_case demographics keys → camelCase IPersonaDemographics keys */
const DEMOGRAPHICS_KEY_MAP: Record<string, string> = {
  geography: 'geography',
  age_range: 'ageRange',
  family_size: 'familySize',
  income: 'income',
  education: 'education',
  occupation: 'occupation',
};

const SIMPLE_FIELDS = new Set(['name', 'segment', 'overview']);

/** Resolve the current persona field value for a given targetField. */
export function resolveCurrentValue(
  persona: IPersona | undefined,
  targetField: string,
): string | undefined {
  if (!persona || !targetField) return undefined;

  // Simple fields
  if (SIMPLE_FIELDS.has(targetField)) {
    const val = persona[targetField as keyof IPersona];
    return typeof val === 'string' && val ? val : undefined;
  }

  // Demographics fields (e.g. "demographics.age_range")
  if (targetField.startsWith('demographics.')) {
    const backendKey = targetField.split('.')[1];
    const frontendKey = DEMOGRAPHICS_KEY_MAP[backendKey];
    if (!frontendKey || !persona.demographics) return undefined;
    const val =
      persona.demographics[frontendKey as keyof typeof persona.demographics];
    return typeof val === 'string' && val ? val : undefined;
  }

  // List fields — no single "current value" to show
  return undefined;
}

export function mapEvidenceToInsights(
  evidence: IEvidence[],
  preExistingUuids: Set<string>,
  persona?: IPersona,
): InsightItem[] {
  return evidence
    .filter((e) => !preExistingUuids.has(e.uuid))
    .map((e) => {
      const action = resolveAction(e);
      const targetField = e.targetField ?? '';
      return {
        uuid: e.uuid,
        type: e.type,
        targetWidget: formatTargetField(e.targetField),
        targetFieldRaw: targetField,
        extractedText: e.excerpt || e.title,
        proposedValue: e.suggestedUpdate
          ? formatSuggestedUpdate(e.suggestedUpdate, targetField)
          : undefined,
        currentValue: resolveCurrentValue(persona, targetField),
        action,
        confidence: e.relevance,
        approved: null,
      };
    });
}
