import type {
  AssumptionCategory,
  AssumptionTestStatus,
} from '@libs/api/types/concept/assumptions';
import type {
  ActiveConceptStatus,
  ArchivedConceptStatus,
  ConceptReportStatusBySection,
  ConceptStatus,
  DraftConceptStatus,
  MarketMetricType,
  SeedStatus,
} from '../api/types';

export const CONCEPT_REPORT_SECTION_KEY_MAP: Record<string, string> = {
  overview: 'overview',
  market_scan: 'ecosystem',
  ecosystem: 'ecosystem',
  customer_profiles: 'customerProfiles',
  financial_projection: 'financialProjection',
  assumptions: 'assumptions',
  trends: 'trends',
  concept: 'overview',
  concept_title: 'overview',
  concept_overview: 'overview',
  concept_value_proposition: 'overview',
  concept_problem_statement: 'overview',
  what_is_this: 'overview',
  should_we_do_this: 'overview',
  regenerate_image: 'overview',
  business_model: 'financialProjection',
  pricing: 'financialProjection',
  distribution_channels: 'financialProjection',
  cost_drivers: 'financialProjection',
  top_down_market_sizing: 'financialProjection',
  bottom_up_market_sizing: 'financialProjection',
  savings_method: 'financialProjection',
  savings: 'financialProjection',
  target_savings_areas: 'financialProjection',
  cost_interferences: 'financialProjection',
  impact_sizing: 'financialProjection',
  customer_jobs: 'customerProfiles',
  customer_pains: 'customerProfiles',
  customer_alternatives: 'customerProfiles',
  customer_journey_steps: 'customerProfiles',
  customer_real_world_signals: 'customerProfiles',
  market_scan_ecosystem: 'ecosystem',
  market_scan_startups: 'ecosystem',
  market_scan_incumbents: 'ecosystem',
  ecosystem_v2_competitive_forces: 'ecosystem',
  ecosystem_v2_full: 'ecosystem',
  ecosystem_v2_startups: 'ecosystem',
  ecosystem_v2_incumbents: 'ecosystem',
  ecosystem_v2_crowdedness: 'ecosystem',
  ecosystem_v2_future_predictions: 'ecosystem',
  differentiators: 'overview',
  rights_to_win: 'overview',
  trends_analysis: 'trends',
  trends_full: 'trends',
  trends_key_findings: 'trends',
  trends_priority_insights: 'trends',
  trends_market_forces: 'trends',
  tests: 'assumptions',
};

export const mapBackendSectionToReportKey = (
  section: string,
): keyof ConceptReportStatusBySection | undefined => {
  const key = CONCEPT_REPORT_SECTION_KEY_MAP[section];
  if (!key) {
    return undefined;
  }
  return key as keyof ConceptReportStatusBySection;
};

const CONCEPT_REPORT_SECTION_ALIASES: Record<string, string> = {
  ecosystem: 'ecosystem',
  customerProfiles: 'customerProfiles',
  financialProjection: 'financialProjection',
  assumptions: 'assumptions',
  overview: 'overview',
  trends: 'trends',
  marketScan: 'ecosystem',
  marketscan: 'ecosystem',
  market_scan: 'ecosystem',
  customer_profiles: 'customerProfiles',
  financial_projection: 'financialProjection',
};

export const normalizeReportSectionKey = (section: string): string => {
  if (!section) return section;
  const mapped =
    CONCEPT_REPORT_SECTION_KEY_MAP[section] ||
    CONCEPT_REPORT_SECTION_ALIASES[section] ||
    section;
  return mapped;
};

export const SEED_STATUS_LIST: SeedStatus[] = [
  'draft',
  'published',
  'archived',
];

export const CONCEPT_STATUS_LIST: ConceptStatus[] = [
  'new',
  'ideating',
  'inReview',
  'prototyping',
  'proofOfConcept',
  'minimumViableProduct',
  'commercialized',
  'archived',
];
export const DRAFT_CONCEPT_STATUS_LIST: DraftConceptStatus[] = [
  'new',
  'ideating',
  'inReview',
];
export const ACTIVE_CONCEPT_STATUS_LIST: ActiveConceptStatus[] = [
  'prototyping',
  'proofOfConcept',
  'minimumViableProduct',
  'commercialized',
];
export const ARCHIVE_CONCEPT_STATUS_LIST: ArchivedConceptStatus[] = [
  'archived',
];
export const ASSUMPTIONS_CATEGORIES: AssumptionCategory[] = [
  'desirability',
  'feasibility',
  'viability',
  'adaptability',
];

export type ConceptStatusColor = 'blue' | 'green' | 'purple' | 'pink' | 'red';

export const CONCEPT_STATUS_STYLE_MAP: Record<
  ConceptStatusColor,
  { bg: string; bullet: string; text: string; stroke: string; border: string }
> = {
  blue: {
    bg: 'bg-blue-25',
    bullet: 'bg-blue-800',
    text: 'text-blue-800',
    stroke: 'stroke-blue-800',
    border: 'border-2 border-blue-50',
  },
  green: {
    bg: 'bg-success-25',
    bullet: 'bg-success-700',
    text: 'text-success-700',
    stroke: 'stroke-success-700',
    border: 'border-2 border-success-50',
  },
  purple: {
    bg: 'bg-indigo-25',
    bullet: 'bg-indigo-800',
    text: 'text-indigo-800',
    stroke: 'stroke-indigo-800',
    border: 'border-2 border-indigo-50',
  },
  pink: {
    bg: 'bg-purple-25',
    bullet: 'bg-purple-800',
    text: 'text-purple-800',
    stroke: 'stroke-purple-800',
    border: 'border-2 border-purple-50',
  },
  red: {
    bg: 'bg-error-25',
    bullet: 'bg-error-800',
    text: 'text-error-800',
    stroke: 'stroke-error-800',
    border: 'border-2 border-error-50',
  },
};

export const VALIDATION_STATUS: AssumptionTestStatus[] = [
  'inProgress',
  'notStarted',
  'partiallyValidated',
  'validated',
];

/**
 * Returns the color associated with a given concept status.
 *
 * @param status - The concept status.
 * @returns The color associated with the concept status.
 */
export function getConceptStatusColor(
  status: ConceptStatus,
): ConceptStatusColor {
  const statusColorObj: Record<ConceptStatus, ConceptStatusColor> = {
    new: 'blue',
    ideating: 'blue',
    inReview: 'blue',
    commercialized: 'green',
    prototyping: 'purple',
    proofOfConcept: 'purple',
    minimumViableProduct: 'pink',
    archived: 'red',
  };

  return statusColorObj[status];
}

export function getConceptStatusStyles(status: ConceptStatus) {
  const color = getConceptStatusColor(status);
  return CONCEPT_STATUS_STYLE_MAP[color];
}

/**
 * Returns the active color associated with a given assumption type.
 *
 * @param assumption - The assumption type.
 * @returns The color associated with the active assumption type.
 */
export function getAssumptionActiveColorClass(
  assumption: AssumptionCategory,
): string {
  const assumptionColorObj: Record<AssumptionCategory, string> = {
    desirability: 'bg-purple-100',
    viability: 'bg-success-100',
    feasibility: 'bg-indigo-100',
    adaptability: 'bg-blue-100',
  };

  return assumptionColorObj[assumption];
}

type AssumptionBackgroundHexColor =
  | '#ECE9FE'
  | '#CCFBEF'
  | '#CFF9FE'
  | '#D1E0FF';

/**
 * Returns the color associated with a given assumption type.
 *
 * @param assumption - The assumption type.
 * @returns The color associated with the assumption type.
 */
export function getAssumptionHexColor(
  assumption: AssumptionCategory,
): AssumptionBackgroundHexColor {
  const assumptionColorObj: Record<
    AssumptionCategory,
    AssumptionBackgroundHexColor
  > = {
    desirability: '#ECE9FE',
    viability: '#CCFBEF',
    feasibility: '#CFF9FE',
    adaptability: '#D1E0FF',
  };

  return assumptionColorObj[assumption];
}

export function getDashboardConceptStatusIcon(status: ActiveConceptStatus) {
  const conceptStatusIconObj: Record<ActiveConceptStatus, string> = {
    prototyping: 'lightbulb',
    proofOfConcept: 'paper-airplane',
    minimumViableProduct: 'rocket',
    commercialized: 'shield-dollar',
  };

  return conceptStatusIconObj[status];
}

export type ConceptStatusIconColor = 'lightBlue' | 'blue' | 'purple';

export function getDashboardConceptStatusIconColor(
  status: ActiveConceptStatus,
) {
  const conceptStatusColorObj: Record<
    ActiveConceptStatus,
    ConceptStatusIconColor
  > = {
    prototyping: 'lightBlue',
    proofOfConcept: 'blue',
    minimumViableProduct: 'blue',
    commercialized: 'purple',
  };

  return conceptStatusColorObj[status];
}

export function getMarketMetricTitle(metricType: MarketMetricType) {
  const marketMetricTitleObj: Record<MarketMetricType, string> = {
    TAM: 'Total Addressable Market',
    SAM: 'Serviceable Addressable Market',
    SOM: 'Serviceable Obtainable Market',
  };
  return marketMetricTitleObj[metricType];
}

/**
 * Returns a readable display name for a concept status
 *
 * @param status - The concept status
 * @returns The formatted display name for the status
 */
export function getConceptStatusDisplayName(status: ConceptStatus): string {
  const statusDisplayNameMap: Record<ConceptStatus, string> = {
    new: 'New',
    ideating: 'Ideating',
    inReview: 'In Review',
    prototyping: 'Prototyping',
    proofOfConcept: 'POC',
    minimumViableProduct: 'MVP',
    commercialized: 'Commercialized',
    archived: 'Archived',
  };

  return statusDisplayNameMap[status];
}

/**
 * Determines whether a concept can be opened while its aggregate status is still pending.
 * We allow opening when the concept has previously completed at least once or
 * when at least one section has already finished regenerating.
 */
export function canOpenConceptWhilePending(
  reportStatusBySection?: ConceptReportStatusBySection,
  dateReportCompleted?: string | null,
): boolean {
  if (dateReportCompleted) {
    return true;
  } else if (dateReportCompleted === null) {
    return false;
  }

  if (!reportStatusBySection) {
    return false;
  }

  return Object.values(reportStatusBySection).some((section) => {
    if (!section) {
      return false;
    }

    const sectionStatus =
      typeof section === 'string' ? section : section.status;

    return sectionStatus === 'complete';
  });
}
