import {
  ActiveConceptStatus,
  ArchivedConceptStatus,
  AssumptionType,
  ConceptStatus,
  DraftConceptStatus,
  MarketMetricType,
} from './api/types';

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
export const DRAFT_CONCEPT_STATUS_LIST: DraftConceptStatus[] = ['new', 'ideating', 'inReview'];
export const ACTIVE_CONCEPT_STATUS_LIST: ActiveConceptStatus[] = [
  'prototyping',
  'proofOfConcept',
  'minimumViableProduct',
  'commercialized',
];
export const ARCHIVE_CONCEPT_STATUS_LIST: ArchivedConceptStatus[] = ['archived'];

type StatusColor = 'blue' | 'green' | 'purple' | 'pink' | 'red';

/**
 * Returns the color associated with a given concept status.
 *
 * @param status - The concept status.
 * @returns The color associated with the concept status.
 */
export function getConceptStatusColor(status: ConceptStatus): StatusColor {
  const statusColorObj: Record<ConceptStatus, StatusColor> = {
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

type AssumptionHexColor = '#7839EE' | '#0E9384' | '#088AB2' | '#155EEF';

/**
 * Returns the active color associated with a given assumption type.
 *
 * @param assumption - The assumption type.
 * @returns The color associated with the active assumption type.
 */
export function getAssumptionActiveHexColor(assumption: AssumptionType): AssumptionHexColor {
  const assumptionColorObj: Record<AssumptionType, AssumptionHexColor> = {
    desirability: '#7839EE',
    viability: '#0E9384',
    feasibility: '#088AB2',
    adaptability: '#155EEF',
  };

  return assumptionColorObj[assumption];
}

type AssumptionBackgroundHexColor = '#ECE9FE' | '#CCFBEF' | '#CFF9FE' | '#D1E0FF';

/**
 * Returns the color associated with a given assumption type.
 *
 * @param assumption - The assumption type.
 * @returns The color associated with the assumption type.
 */
export function getAssumptionHexColor(assumption: AssumptionType): AssumptionBackgroundHexColor {
  const assumptionColorObj: Record<AssumptionType, AssumptionBackgroundHexColor> = {
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

export function getDashboardConceptStatusIconColor(status: ActiveConceptStatus) {
  const conceptStatusColorObj: Record<ActiveConceptStatus, ConceptStatusIconColor> = {
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

export type MarketMetricColorType = 'purple' | 'darkPurple' | 'blue';

export function getMarketMetricColor(metricType: MarketMetricType) {
  const marketMetricTitleColorObj: Record<MarketMetricType, MarketMetricColorType> = {
    TAM: 'purple',
    SAM: 'darkPurple',
    SOM: 'blue',
  };
  return marketMetricTitleColorObj[metricType];
}
