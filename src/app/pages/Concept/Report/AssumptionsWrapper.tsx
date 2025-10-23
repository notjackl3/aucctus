import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useGenerateKeyAssumptions } from '@hooks/query/concepts.hook';
import AssumptionsV1 from './Assumptions/AssumptionsV1';
import AssumptionsV2 from './Assumptions/AssumptionsV2';
import { VersionUpgradeBanner } from '@components';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import { AppPath } from '@routes/routes';
import { toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';

const AssumptionsWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const navigate = useNavigate();
  const { mutate: generateKeyAssumptions, isLoading } =
    useGenerateKeyAssumptions();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.assumptions || 'v1';
  const shouldRenderV2 = featureVersion === 'v2';

  const handleUpgrade = () => {
    generateKeyAssumptions(concept.identifier, {
      onSuccess: () => {
        // Navigate to concept bank after starting generation
        navigate(AppPath.ConceptBank, {
          replace: true,
        });
      },
    });
  };

  const handleDebugModeGenerate = () => {
    generateKeyAssumptions(concept.identifier, {
      onSuccess: () => {
        toast.successAnimated(
          'Key Assumptions Generated',
          '🎯 Key Assumptions generated successfully!',
        );
      },
      onError: () => {
        toast.errorAnimated(
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

      {shouldRenderV2 ? <AssumptionsV2 /> : <AssumptionsV1 />}
    </>
  );
};

export default AssumptionsWrapper;
