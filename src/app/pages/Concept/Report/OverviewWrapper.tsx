import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  useConceptOverview,
  useGenerateConceptOverview,
} from '@hooks/query/concepts.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import OverviewDetails from './OverviewDetails';
import { ConceptOverview } from '@components';
import { VersionUpgradeBanner, toast } from '@components';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { AppPath } from '@routes/routes';

const OverviewWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { mutate: generateOverview, isLoading } = useGenerateConceptOverview();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Check if v2 ConceptOverview data exists (for actual rendering)
  useConceptOverview(concept?.uuid);

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
      {shouldRenderBanner && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
          featureName='overview'
        />
      )}

      {/* Show debug mode banner if debug mode is enabled */}
      {isDebugModeEnabled && (
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
