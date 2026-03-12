import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useConceptOverview,
  useGenerateConceptOverview,
} from '@hooks/query/concepts.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import OverviewDetails from './OverviewDetails';
import { ConceptOverview } from '@components';
import { VersionUpgradeBanner, toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { AppPath } from '@routes/routes';
import { useConceptReportContext } from './ConceptReport/ConceptReportContext';

const OverviewWrapper: React.FC = () => {
  const { concept, isReadOnly } = useConceptReportContext();
  const { mutate: generateOverview, isLoading } = useGenerateConceptOverview();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasTriggeredGeneration = useRef(false);

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Check if v2 ConceptOverview data exists (for actual rendering)
  useConceptOverview(concept?.uuid);

  // Handle ?generateReport=true query param (from Idea Submission "Generate Report" button)
  useEffect(() => {
    const shouldGenerate = searchParams.get('generateReport') === 'true';
    if (
      shouldGenerate &&
      concept?.identifier &&
      !hasTriggeredGeneration.current &&
      !isLoading
    ) {
      hasTriggeredGeneration.current = true;
      // Remove the query param to prevent re-triggering
      searchParams.delete('generateReport');
      setSearchParams(searchParams, { replace: true });
      // Trigger report generation
      generateOverview(concept.identifier, {
        onError: () => {
          toast.error(
            'Report Generation Failed',
            'Failed to start report generation. Please try again.',
          );
        },
        onSuccess: () => {
          toast.success(
            'Report Generation Started',
            'Your concept report is being generated.',
          );
        },
      });
    }
  }, [
    searchParams,
    setSearchParams,
    concept?.identifier,
    generateOverview,
    isLoading,
  ]);

  // Check if overview section is pending (for hiding banner during updates)
  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptOverview,
    concept,
    additionalLoadingStates: [isLoading],
  });

  // Use concept's featureVersions to determine which version to render
  // Note: Backend uses snake_case 'concept_overview', frontend uses camelCase 'conceptOverview'
  const featureVersion =
    (concept.featureVersions as any)?.concept_overview ||
    concept.featureVersions?.conceptOverview ||
    'v1';
  const shouldRenderV2 = featureVersion !== 'v1';

  // Hide banner during any loading state (pending section OR API loading)
  // This prevents the flash of old content with banner during version upgrades
  const shouldRenderBanner =
    featureVersion !== 'v3' &&
    !isSectionPending &&
    !hasBlockingLoad &&
    !isLoading;

  const handleUpgrade = () => {
    generateOverview(concept.identifier, {
      onError: () => {
        toast.error(
          'Overview Generation Failed',
          'Failed to start overview generation. Please try again. If the problem persists, contact support.',
        );
      },
    });
  };

  const handleDebugModeGenerate = () => {
    generateOverview(concept.identifier, {
      onError: () => {
        toast.error(
          'Overview Generation Failed',
          '❌ Failed to generate Overview',
        );
      },
    });
  };

  return (
    <>
      {/* Show upgrade banner if not v2 */}
      {!isReadOnly && shouldRenderBanner && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
          featureName='overview'
        />
      )}

      {/* Show debug mode banner if debug mode is enabled */}
      {!isReadOnly && isDebugModeEnabled && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isLoading}
          buttonText='Generate Section'
          debugMode={true}
        />
      )}

      {/* Conditionally render v1 or v2 component */}
      {shouldRenderV2 ? (
        <ConceptOverview.ExecutiveDashboard
          conceptUuid={concept?.uuid}
          conceptId={concept?.identifier}
          concept={concept}
        />
      ) : (
        <OverviewDetails />
      )}
    </>
  );
};

export default OverviewWrapper;
