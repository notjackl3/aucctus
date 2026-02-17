import { OverseerProvider } from '@context/OverseerProvider';
import { useRoutePattern } from '@hooks/router.hook';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
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
export const ROUTE_TO_PAGE_CONTEXT: Record<string, string> = {
  // Concept Report pages
  [AppPath.ConceptOverview]: 'overview',
  [AppPath.ConceptMarketScan]: 'ecosystem',
  [AppPath.ConceptFinancialProjection]: 'financial_projections',
  [AppPath.ConceptCustomerProfile]: 'customer_profiles',
  [AppPath.ConceptKeyAssumptions]: 'assumptions',
  [AppPath.ConceptTesting]: 'tests',
  [AppPath.ConceptSettings]: 'overview',
  // Nucleus pages (account-level)
  [AppPath.Nucleus]: 'nucleus',
  // Watchtower pages (account-level)
  [AppPath.Watchtower]: 'watchtower',
  // Portfolio pages (account-level)
  [AppPath.ConceptBankPortfolio]: 'portfolio',
};

/**
 * Wrapper component that provides Overseer functionality based on the current route.
 * Applies right padding when panel is docked.
 */
const OverseerWrapper: React.FC<OverseerWrapperProps> = ({
  children,
  pageContext: pageContextOverride,
}) => {
  const activeTab = useRoutePattern();
  const isDocked = useStore((state) => state.overseer.isDocked);
  const isOpen = useStore((state) => state.overseer.isOpen);

  // Determine page context from current route or use override
  const pageContext = useMemo(() => {
    if (pageContextOverride) return pageContextOverride;
    if (!activeTab) return 'overview';
    return ROUTE_TO_PAGE_CONTEXT[activeTab] || 'overview';
  }, [activeTab, pageContextOverride]);

  const isEnabled =
    typeof FEATURE_OVERSEER !== 'undefined' ? FEATURE_OVERSEER : false;

  const shouldApplyDockPadding = isEnabled && isOpen && isDocked;

  return (
    <OverseerProvider pageContext={pageContext} enabled={isEnabled}>
      <div
        className={
          shouldApplyDockPadding
            ? 'pr-[412px] transition-all duration-300'
            : 'transition-all duration-300'
        }
      >
        {children}
      </div>
    </OverseerProvider>
  );
};

export default OverseerWrapper;
