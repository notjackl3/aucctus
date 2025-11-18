import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useGenerateKeyAssumptions } from '@hooks/query/concepts.hook';
import AssumptionsV1 from './Assumptions/AssumptionsV1';
import AssumptionsV2 from './Assumptions/AssumptionsV2';
import { VersionUpgradeBanner, ConceptReportSkeletons } from '@components';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import { toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';

const AssumptionsWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { mutate: generateKeyAssumptions, isLoading } =
    useGenerateKeyAssumptions();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Use unified loading state
  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptKeyAssumptions,
    concept,
    additionalLoadingStates: [isLoading],
  });
  const shouldShowSkeletons = isSectionPending || hasBlockingLoad;

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.assumptions || 'v1';
  const shouldRenderV2 = featureVersion === 'v2';

  const handleUpgrade = () => {
    generateKeyAssumptions(concept.identifier);
  };

  const handleDebugModeGenerate = () => {
    generateKeyAssumptions(concept.identifier, {
      onError: () => {
        toast.error(
          'Key Assumptions Failed',
          '❌ Failed to generate Key Assumptions',
        );
      },
    });
  };

  return (
    <>
      {/* Show upgrade banner if not v2 */}
      {!shouldRenderV2 && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
          featureName='assumptions'
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

      {/* Show skeleton loading state */}
      {shouldShowSkeletons ? (
        <ConceptReportSkeletons.AssumptionsSkeleton />
      ) : shouldRenderV2 ? (
        <AssumptionsV2 />
      ) : (
        <AssumptionsV1 />
      )}
    </>
  );
};

export default AssumptionsWrapper;
