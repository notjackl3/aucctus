import {
  ActiveConceptStatus,
  ArchivedConceptStatus,
  AssumptionCategory,
  ConceptStatus,
  DraftConceptStatus,
  MarketMetricType,
  TestingValidationStatus,
} from '../api/types';

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
  { bg: string; bullet: string; text: string; stroke: string }
> = {
  blue: {
    bg: 'bg-[#f8f9fc]',
    bullet: 'bg-[#4e5ba6]',
    text: 'text-[#4e5ba6]',
    stroke: 'stroke-[#4e5ba6]',
  },
  green: {
    bg: 'bg-success-50',
    bullet: 'bg-success-500',
    text: 'text-success-500',
    stroke: 'stroke-success-500',
  },
  purple: {
    bg: 'bg-primary-50',
    bullet: 'bg-primary-500',
    text: 'text-primary-500',
    stroke: 'stroke-primary-500',
  },
  pink: {
    bg: 'bg-[#fdf2fa]',
    bullet: 'bg-[#ee46bc]',
    text: 'text-[#ee46bc]',
    stroke: 'stroke-[#ee46bc]',
  },
  red: {
    bg: 'bg-error-50',
    bullet: 'bg-error-500',
    text: 'text-error-500',
    stroke: 'stroke-error-500',
  },
};

export const VALIDATION_STATUS: TestingValidationStatus[] = [
  'inProgress',
  'notStarted',
  'partiallyValidated',
  'validated',
];

export const TESTING_STATUS_STYLE_MAP: Record<
  TestingValidationStatus,
  { icon: IconVariant; bg: string; stroke: string; svg: string; text: string }
> = {
  notStarted: {
    icon: 'play-square',
    bg: 'bg-[#f8f9fc]',
    svg: '[&>svg]:stroke-[#667085]',
    stroke: 'stroke-[#667085]',
    text: 'text-[#667085]',
  },
  inProgress: {
    icon: 'clock-fast-forward',
    bg: 'bg-[#f8f9fc]',
    svg: '[&>svg]:stroke-[#667085]',
    stroke: 'stroke-[#667085]',
    text: 'text-[#667085]',
  },
  partiallyValidated: {
    icon: 'loading-02',
    bg: 'bg-[#fcf7e9]',
    svg: '[&>svg]:stroke-[#b55121]',
    stroke: 'stroke-[#b55121]',
    text: 'text-[#b55121]',
  },
  validated: {
    icon: 'check',
    bg: 'bg-[#e9fbf2]',
    svg: '[&>svg]:stroke-[#117246]',
    stroke: 'stroke-[#117246]',
    text: 'text-[#117246]',
  },
};

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

type AssumptionHexColor = '#7839EE' | '#0E9384' | '#088AB2' | '#155EEF';

/**
 * Returns the active color associated with a given assumption type.
 *
 * @param assumption - The assumption type.
 * @returns The color associated with the active assumption type.
 */
export function getAssumptionActiveHexColor(
  assumption: AssumptionCategory,
): AssumptionHexColor {
  const assumptionColorObj: Record<AssumptionCategory, AssumptionHexColor> = {
    desirability: '#7839EE',
    viability: '#0E9384',
    feasibility: '#088AB2',
    adaptability: '#155EEF',
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
  const conceptStatusIconObj: Record<ActiveConceptStatus, IconVariant> = {
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
