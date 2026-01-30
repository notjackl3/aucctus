import { OverseerProvider } from '@context/OverseerProvider';
import { useRoutePattern } from '@hooks/router.hook';
import { AppPath } from '@routes/routes';
import React, { useMemo } from 'react';

interface OverseerWrapperProps {
  children: React.ReactNode;
  /**
   * Override the page context (useful for account-level pages like Nucleus/Watchtower)
   */
  pageContext?: string;
}

/**
 * Maps route patterns to page context identifiers for Overseer
 */
const ROUTE_TO_PAGE_CONTEXT: Record<string, string> = {
  // Concept Report pages
  [AppPath.ConceptOverview]: 'overview',
  [AppPath.ConceptMarketScan]: 'ecosystem',
  [AppPath.ConceptFinancialProjection]: 'financial_projections',
  [AppPath.ConceptCustomerProfile]: 'customer_profiles',
  [AppPath.ConceptKeyAssumptions]: 'assumptions',
  [AppPath.ConceptTesting]: 'tests',
  [AppPath.ConceptSettings]: 'overview', // Context page uses overview context
  // Nucleus pages (account-level)
  [AppPath.Nucleus]: 'nucleus',
  // Watchtower pages (account-level)
  [AppPath.Watchtower]: 'watchtower',
  // Portfolio pages (account-level)
  [AppPath.ConceptBankPortfolio]: 'portfolio',
};

/**
 * Wrapper component that provides Overseer functionality based on the current route.
 *
 * This component:
 * - Determines the page context from the current route (or uses override)
 * - Wraps children with OverseerProvider
 * - Supports both concept-level and account-level pages
 *
 * Usage:
 * ```tsx
 * // Auto-detect from route (concept pages)
 * <OverseerWrapper>
 *   <ConceptReportContent />
 * </OverseerWrapper>
 *
 * // Explicit page context (account pages)
 * <OverseerWrapper pageContext="nucleus">
 *   <NucleusPage />
 * </OverseerWrapper>
 * ```
 */
const OverseerWrapper: React.FC<OverseerWrapperProps> = ({
  children,
  pageContext: pageContextOverride,
}) => {
  const activeTab = useRoutePattern();

  // Determine page context from current route or use override
  const pageContext = useMemo(() => {
    if (pageContextOverride) return pageContextOverride;
    if (!activeTab) return 'overview';
    return ROUTE_TO_PAGE_CONTEXT[activeTab] || 'overview';
  }, [activeTab, pageContextOverride]);

  // Disable Overseer on certain pages (initialization pages are handled at a higher level)
  const isEnabled = FEATURE_OVERSEER;

  return (
    <OverseerProvider pageContext={pageContext} enabled={isEnabled}>
      {children}
    </OverseerProvider>
  );
};

export default OverseerWrapper;
