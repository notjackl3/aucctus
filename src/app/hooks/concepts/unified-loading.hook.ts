import { useMemo } from 'react';
import { IConcept } from '@libs/api/types';
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
   * Whether the section should show loading state
   */
  isLoading: boolean;

  /**
   * The reason for loading (for debugging purposes)
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
        isLoading: true,
        loadingReason: 'no-concept',
      };
    }

    // Check if any additional loading states are active
    const hasApiLoading = additionalLoadingStates.some(
      (state) => state === true,
    );
    if (hasApiLoading) {
      return {
        isLoading: true,
        loadingReason: 'api-loading',
      };
    }

    // Get the section key for the current route
    const sectionKey = getSectionKeyForRoute(currentRoute);

    // If this route doesn't have a corresponding section (like Settings or Testing),
    // we don't show loading based on reportStatusBySection
    if (!sectionKey) {
      return {
        isLoading: false,
        loadingReason: null,
      };
    }

    // Check if the section status is 'pending' in reportStatusBySection
    const sectionStatus = concept.reportStatusBySection?.[sectionKey]?.status;
    const isSectionPending = sectionStatus === 'pending';

    if (isSectionPending) {
      return {
        isLoading: true,
        loadingReason: 'section-pending',
      };
    }

    // No loading conditions met
    return {
      isLoading: false,
      loadingReason: null,
    };
  }, [currentRoute, concept, additionalLoadingStates]);
};
