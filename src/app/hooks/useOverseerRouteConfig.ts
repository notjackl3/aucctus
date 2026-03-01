import {
  OVERSEER_ROUTE_REGISTRY,
  type OverseerRouteConfig,
} from '@components/Overseer/overseerRouteConfig';
import { useRoutePattern } from '@hooks/router.hook';
import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { AppPath } from '@routes/routes';

interface UseOverseerRouteConfigResult {
  /** Whether Overseer is enabled for the current route */
  isEnabled: boolean;
  /** The resolved page context string */
  pageContext: string;
  /** The full route config, if found */
  config: OverseerRouteConfig | undefined;
}

/**
 * Hook that resolves the current route against the Overseer registry.
 * Re-evaluates on every navigation and search param change.
 */
export function useOverseerRouteConfig(): UseOverseerRouteConfigResult {
  const routePattern = useRoutePattern();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    if (!routePattern) {
      return { isEnabled: false, pageContext: '', config: undefined };
    }

    const config = OVERSEER_ROUTE_REGISTRY[routePattern as AppPath];
    if (!config) {
      return { isEnabled: false, pageContext: '', config: undefined };
    }

    // If a dynamic resolver exists, use it to get the actual page context
    const pageContext = config.resolvePageContext
      ? config.resolvePageContext(location.pathname, searchParams)
      : config.pageContext;

    return { isEnabled: true, pageContext, config };
  }, [routePattern, location.pathname, searchParams]);
}

export default useOverseerRouteConfig;
