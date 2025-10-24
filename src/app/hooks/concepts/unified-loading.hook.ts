import { useMemo } from 'react';
import { ConceptReportStatus, IConcept } from '@libs/api/types';
import { getSectionKeyForRoute } from '../../constants/conceptReportSections';

interface UseUnifiedLoadingOptions {
  /**
   * The current route/tab being displayed
   */
  currentRoute: string;

  /**
   * The concept object containing reportStatusBySection
   */
  concept?: IConcept;

  /**
   * Additional loading states from API calls or other operations
   */
  additionalLoadingStates?: boolean[];
}

interface UseUnifiedLoadingResult {
  /**
   * Whether downstream components should show skeleton placeholders
   */
  isSectionPending: boolean;

  /**
   * Whether supporting data is currently loading (initial fetch, refetch, etc.)
   */
  hasBlockingLoad: boolean;

  /**
   * The mapped section key for the current route, if applicable
   */
  sectionKey: string | null;

  /**
   * The current status reported by the backend for this section
   */
  sectionStatus?: ConceptReportStatus;

  /**
   * Details to help with debugging different loading scenarios
   */
  loadingReason: 'section-pending' | 'api-loading' | 'no-concept' | null;
}

/**
 * Hook to provide unified loading state for concept report tabs.
 *
 * This hook combines two loading conditions:
 * 1. If the concept report section status is 'pending' in reportStatusBySection
 * 2. If any additional loading states (API calls) are currently active
 *
 * @param options - Configuration options for the hook
 * @returns Loading state information
 */
export const useUnifiedLoading = (
  options: UseUnifiedLoadingOptions,
): UseUnifiedLoadingResult => {
  const { currentRoute, concept, additionalLoadingStates = [] } = options;

  return useMemo(() => {
    // If we don't have a concept yet, we're loading
    if (!concept) {
      return {
        isSectionPending: false,
        hasBlockingLoad: true,
        sectionKey: null,
        sectionStatus: undefined,
        loadingReason: 'no-concept',
      };
    }

    // Check if any additional loading states are active
    const hasApiLoading = additionalLoadingStates.some(
      (state) => state === true,
    );

    // Get the section key for the current route
    const sectionKey = getSectionKeyForRoute(currentRoute);

    // If this route doesn't have a corresponding section (like Settings or Testing),
    // we don't show loading based on reportStatusBySection
    if (!sectionKey) {
      return {
        isSectionPending: false,
        hasBlockingLoad: hasApiLoading,
        sectionKey,
        sectionStatus: undefined,
        loadingReason: null,
      };
    }

    // Check if the section status is 'pending' in reportStatusBySection
    const sectionStatus =
      concept.reportStatusBySection?.[sectionKey]?.status || undefined;
    const isSectionPending = sectionStatus === 'pending';

    return {
      isSectionPending,
      hasBlockingLoad: hasApiLoading,
      sectionKey,
      sectionStatus,
      loadingReason: hasApiLoading
        ? 'api-loading'
        : isSectionPending
          ? 'section-pending'
          : null,
    };
  }, [currentRoute, concept, additionalLoadingStates]);
};
