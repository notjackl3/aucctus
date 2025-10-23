import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useGenerateFinancialProjection } from '@hooks/query/financialProjections.hook';
import FinancialProjectionsV2 from './FinancialProjections/FinancialProjectionsV2';
import FinancialProjectionsV1 from './FinancialProjectionsV1';
import { VersionUpgradeBanner } from '@components';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import { AppPath } from '@routes/routes';
import { toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';

const FinancialProjectionsWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const navigate = useNavigate();
  const { mutate: generateFinancialProjection, isLoading } =
    useGenerateFinancialProjection();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.financialProjection || 'v1';
  const shouldRenderV2 = featureVersion === 'v2';

  const handleUpgrade = () => {
    generateFinancialProjection(concept.identifier, {
      onSuccess: () => {
        // Navigate to concept bank after starting generation
        navigate(AppPath.ConceptBank, {
          replace: true,
        });
      },
    });
  };

  const handleDebugModeGenerate = () => {
    generateFinancialProjection(concept.identifier, {
      onSuccess: () => {
        toast.successAnimated(
          'Financial Projections Generated',
          '✨ Financial Projections generated successfully!',
        );
      },
      onError: () => {
        toast.errorAnimated(
          'Financial Projections Failed',
          '❌ Failed to generate Financial Projections',
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
          featureName='financialProjection'
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

      {shouldRenderV2 ? <FinancialProjectionsV2 /> : <FinancialProjectionsV1 />}
    </>
  );
};

export default FinancialProjectionsWrapper;
