import { AppPath } from '@routes/routes';

/**
 * Maps concept report tab routes to their corresponding section names in reportStatusBySection
 */
export const CONCEPT_REPORT_SECTION_MAPPING: Record<string, string> = {
  [AppPath.ConceptOverview]: 'overview',
  [AppPath.ConceptMarketScan]: 'marketScan',
  [AppPath.ConceptCustomerProfile]: 'customerProfiles',
  [AppPath.ConceptFinancialProjection]: 'financialProjection',
  [AppPath.ConceptKeyAssumptions]: 'assumptions',
  [AppPath.ConceptTesting]: 'assumptions',
  // Note: Settings tab doesn't have a corresponding reportStatusBySection entry
  // as it is not part of the AI-generated report
};

/**
 * Gets the reportStatusBySection key for a given tab route
 */
export const getSectionKeyForRoute = (route: string): string | null => {
  return CONCEPT_REPORT_SECTION_MAPPING[route] || null;
};
