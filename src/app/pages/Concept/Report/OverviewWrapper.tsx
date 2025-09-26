import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  useConceptOverview,
  useGenerateConceptOverview,
} from '@hooks/query/concepts.hook';
import OverviewDetails from './OverviewDetails';
import { ConceptOverview } from '@components';
import { VersionUpgradeBanner, toast } from '@components';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import { AppPath } from '@routes/routes';
import { useDebugMode } from '@hooks/debug-mode.hook';

const OverviewWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const navigate = useNavigate();
  const { mutate: generateOverview, isLoading } = useGenerateConceptOverview();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Check if v2 ConceptOverview data exists (for actual rendering)
  useConceptOverview(concept?.uuid);

  // Use concept's featureVersions to determine which version to render
  // Note: Backend uses snake_case 'concept_overview', frontend uses camelCase 'conceptOverview'
  const featureVersion =
    (concept.featureVersions as any)?.concept_overview ||
    concept.featureVersions?.conceptOverview ||
    'v1';
  const shouldRenderV2 = featureVersion !== 'v1';
  const shouldRenderBanner = featureVersion !== 'v3';

  const handleUpgrade = () => {
    generateOverview(concept.identifier, {
      onSuccess: () => {
        // Note: The hook already shows a toast, so we don't need another one here

        // Redirect to concept bank so user can see "Generating..." status
        navigate(AppPath.ConceptBank);
      },
      onError: () => {
        toast.error(
          'Failed to start overview generation',
          'Please try again. If the problem persists, contact support.',
          { autoClose: 5000 },
        );
      },
    });
  };

  const handleDebugModeGenerate = () => {
    generateOverview(concept.identifier, {
      onSuccess: () => {
        toast.success('📊 Overview generated successfully!', undefined, {
          autoClose: 2000,
        });
      },
      onError: () => {
        toast.error('❌ Failed to generate Overview', undefined, {
          autoClose: 2000,
        });
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
        />
      ) : (
        <OverviewDetails />
      )}
    </>
  );
};

export default OverviewWrapper;
