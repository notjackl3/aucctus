/**
 * Types, constants, and helpers for ConceptDocumentModal.
 * Mirrors the Living Personas DocumentUploadModal.types pattern.
 */

import {
  BarChart3,
  Briefcase,
  Target,
  BookOpen,
  TrendingUp,
  Shield,
  Lightbulb,
  FileText,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { IConceptEvidence } from '@libs/api/types/conceptTrainingDocument';
import type { IConcept } from '@libs/api/types';

// ============================================
// Types
// ============================================

export interface ConceptInsightItem {
  uuid: string;
  targetSection: string;
  targetField: string;
  targetWidget: string;
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
  'Matching to concept sections...',
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

export const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  customer_profiles: 'Customer Profiles',
  market_scan: 'Market Scan',
  ecosystem: 'Ecosystem',
  financial: 'Financial',
  assumptions: 'Assumptions',
  testing: 'Testing',
  executive_summaries: 'Executive Summaries',
};

export const WIDGET_ICON_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  overview: {
    icon: FileText,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  customer_profiles: {
    icon: Briefcase,
    color:
      'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  },
  market_scan: {
    icon: TrendingUp,
    color:
      'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  ecosystem: {
    icon: Activity,
    color:
      'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  },
  financial: {
    icon: BarChart3,
    color:
      'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  assumptions: {
    icon: Lightbulb,
    color:
      'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  },
  testing: {
    icon: Shield,
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
  executive_summaries: {
    icon: Target,
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

/** Delay before fetching evidence after processing completes */
export const POST_PROCESSING_FETCH_DELAY_MS = 500;

/** Allowed file extensions for concept training documents */
export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.docx',
  '.csv',
  '.xlsx',
  '.txt',
  '.pptx',
]);

// ============================================
// Helpers
// ============================================

export function formatTargetField(field?: string): string {
  if (!field) return 'General';
  // Remove section prefix (e.g., "overview.value_proposition" -> "value_proposition")
  const lastPart = field.includes('.') ? field.split('.').pop()! : field;
  return lastPart
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Structured fields whose suggestedUpdate is serialized as JSON */
const STRUCTURED_FIELDS = new Set([
  'market_scan.trends',
  'customer_profiles.key_facts',
  'customer_profiles.social_values',
  'customer_profiles.quotes',
  'customer_profiles.new',
  'assumptions.new',
  'testing.assumptions.new',
]);

/**
 * Parse JSON-serialized suggestedUpdate for structured fields into readable text.
 * Simple fields (jobs, pains, headwinds, etc.) are returned as-is.
 */
export function formatSuggestedUpdate(
  raw: string,
  targetField: string,
): string {
  if (!STRUCTURED_FIELDS.has(targetField)) return raw;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    switch (targetField) {
      case 'market_scan.trends':
        return parsed.description
          ? `${parsed.name}: ${parsed.description}`
          : String(parsed.name ?? raw);
      case 'customer_profiles.key_facts':
        return `${parsed.stat} \u2014 ${parsed.label}`;
      case 'customer_profiles.social_values':
        return parsed.description
          ? `${parsed.title}: ${parsed.description}`
          : String(parsed.title ?? raw);
      case 'customer_profiles.quotes':
        return parsed.context
          ? `\u201C${parsed.text}\u201D \u2014 ${parsed.context}`
          : `\u201C${parsed.text}\u201D`;
      case 'customer_profiles.new':
        return parsed.description
          ? `${parsed.segment ?? parsed.name}: ${parsed.description}`
          : String(parsed.segment ?? parsed.name ?? raw);
      case 'assumptions.new':
        return parsed.text
          ? `${parsed.name}: ${parsed.text}`
          : String(parsed.name ?? raw);
      case 'testing.assumptions.new':
        return String(parsed.statement ?? raw);
      default:
        return raw;
    }
  } catch {
    return raw;
  }
}

function resolveAction(
  evidence: IConceptEvidence,
): ConceptInsightItem['action'] {
  if (evidence.action === 'inform') return 'context';
  if (evidence.action === 'change') return 'change';
  return 'add';
}

/** Map backend snake_case target fields to camelCase IConcept keys */
const CONCEPT_FIELD_MAP: Record<string, keyof IConcept> = {
  'concept.title': 'title',
  'concept.summary': 'summary',
  'overview.overview': 'overview',
  'overview.value_proposition': 'valueProposition',
  'overview.problem_statement': 'problemStatement',
};

/**
 * Resolve the current value of a concept field for strikethrough display.
 * Mirrors the Living Personas resolveCurrentValue pattern.
 *
 * Uses two sources:
 * 1. Direct IConcept fields (title, summary, overview, valueProposition, problemStatement)
 * 2. A pre-built map of nested section values read from the React Query cache
 *    (financial, market scan, ecosystem, executive summaries, etc.)
 */
function resolveCurrentValue(
  concept: IConcept | undefined,
  targetField: string,
  cachedValues?: Record<string, string>,
): string | undefined {
  if (!concept && !cachedValues) return undefined;

  // Check direct IConcept fields first
  if (concept) {
    const conceptKey = CONCEPT_FIELD_MAP[targetField];
    if (conceptKey) {
      const val = concept[conceptKey];
      return typeof val === 'string' && val.length > 0 ? val : undefined;
    }
  }

  // Check cached nested section values
  if (cachedValues) {
    const cached = cachedValues[targetField];
    if (cached && cached.length > 0) return cached;
  }

  // List/array fields — no single "current value" to show
  return undefined;
}

export function mapEvidenceToInsights(
  evidence: IConceptEvidence[],
  preExistingUuids: Set<string>,
  concept?: IConcept,
  cachedSectionValues?: Record<string, string>,
): ConceptInsightItem[] {
  return evidence
    .filter((e) => !preExistingUuids.has(e.uuid))
    .map((e) => ({
      uuid: e.uuid,
      targetSection: e.targetSection,
      targetField: e.targetField,
      targetWidget: formatTargetField(e.targetField),
      extractedText: e.excerpt || e.title,
      proposedValue: e.suggestedUpdate
        ? formatSuggestedUpdate(e.suggestedUpdate, e.targetField)
        : undefined,
      currentValue: resolveCurrentValue(
        concept,
        e.targetField,
        cachedSectionValues,
      ),
      action: resolveAction(e),
      confidence: e.relevance,
      approved: null,
    }));
}
