import { AppPath } from '@routes/routes';

export type OverseerContextLevel = 'concept' | 'account';

export interface OverseerRouteConfig {
  /** The page context string sent to the backend */
  pageContext: string;
  /** Whether this is a concept-level or account-level page */
  contextLevel: OverseerContextLevel;
  /**
   * Optional function to dynamically resolve pageContext from URL state.
   * Useful for pages with tabs that change context (e.g., Nucleus with Living Personas tab).
   */
  resolvePageContext?: (
    pathname: string,
    searchParams: URLSearchParams,
  ) => string;
  /**
   * All possible context strings returned by resolvePageContext.
   * Used to build the full set of account-level page contexts.
   */
  resolvedContexts?: string[];
  /** Whether AI editing is available on this page */
  editingEnabled?: boolean;
}

/**
 * Central registry mapping route patterns to Overseer configuration.
 * Single source of truth for which pages have Overseer and how they behave.
 */
export const OVERSEER_ROUTE_REGISTRY: Partial<
  Record<AppPath, OverseerRouteConfig>
> = {
  // Concept Report pages
  [AppPath.ConceptOverview]: {
    pageContext: 'overview',
    contextLevel: 'concept',
    editingEnabled: true,
  },
  [AppPath.ConceptMarketScan]: {
    pageContext: 'ecosystem',
    contextLevel: 'concept',
    editingEnabled: true,
  },
  [AppPath.ConceptTrends]: {
    pageContext: 'trends',
    contextLevel: 'concept',
    editingEnabled: true,
  },
  [AppPath.ConceptEcosystem]: {
    pageContext: 'ecosystem',
    contextLevel: 'concept',
    editingEnabled: true,
  },
  [AppPath.ConceptFinancialProjection]: {
    pageContext: 'financial_projections',
    contextLevel: 'concept',
    editingEnabled: true,
  },
  [AppPath.ConceptCustomerProfile]: {
    pageContext: 'customer_profiles',
    contextLevel: 'concept',
    editingEnabled: true,
  },
  [AppPath.ConceptKeyAssumptions]: {
    pageContext: 'assumptions',
    contextLevel: 'concept',
    editingEnabled: true,
  },
  [AppPath.ConceptTesting]: {
    pageContext: 'tests',
    contextLevel: 'concept',
  },
  [AppPath.ConceptSettings]: {
    pageContext: 'overview',
    contextLevel: 'concept',
  },

  // Account-level pages
  [AppPath.Home]: {
    pageContext: 'concept_bank',
    contextLevel: 'account',
  },
  [AppPath.Nucleus]: {
    pageContext: 'nucleus',
    contextLevel: 'account',
    resolvePageContext: (_pathname, searchParams) => {
      const tab = searchParams.get('tab');
      if (tab === 'living-personas') return 'living_personas';
      return 'nucleus';
    },
    resolvedContexts: ['living_personas'],
  },
  [AppPath.Watchtower]: {
    pageContext: 'watchtower',
    contextLevel: 'account',
  },
  [AppPath.ConceptBankPortfolio]: {
    pageContext: 'portfolio',
    contextLevel: 'account',
  },
  [AppPath.ConceptBank]: {
    pageContext: 'concept_bank',
    contextLevel: 'account',
  },
  [AppPath.ConceptBankSubmissions]: {
    pageContext: 'submissions',
    contextLevel: 'account',
  },
  [AppPath.ConceptBankSubmissionDetail]: {
    pageContext: 'submissions',
    contextLevel: 'account',
  },
};

/**
 * Derived set of account-level page context strings.
 * Used by the store to determine context type (concept vs account).
 */
export const ACCOUNT_LEVEL_PAGE_CONTEXTS = new Set(
  Object.values(OVERSEER_ROUTE_REGISTRY)
    .filter((config) => config.contextLevel === 'account')
    .flatMap((config) => [
      config.pageContext,
      ...(config.resolvedContexts ?? []),
    ]),
);
