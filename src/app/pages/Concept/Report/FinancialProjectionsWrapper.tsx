import React from 'react';
import { useGenerateFinancialProjection } from '@hooks/query/financialProjections.hook';
import FinancialProjectionsV2 from './FinancialProjections/FinancialProjectionsV2';
import FinancialProjectionsV1 from './FinancialProjectionsV1';
import { VersionUpgradeBanner } from '@components';
import { toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useConceptReportContext } from './ConceptReport/ConceptReportContext';

const FinancialProjectionsWrapper: React.FC = () => {
  const { concept, isReadOnly } = useConceptReportContext();
  const { mutate: generateFinancialProjection, isLoading } =
    useGenerateFinancialProjection();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.financialProjection || 'v1';
  const shouldRenderV2 = featureVersion === 'v2';

  const handleUpgrade = () => {
    generateFinancialProjection(concept.identifier);
  };

  const handleDebugModeGenerate = () => {
    generateFinancialProjection(concept.identifier, {
      onError: () => {
        toast.error(
          'Financial Projections Failed',
          '❌ Failed to generate Financial Projections',
        );
      },
    });
  };

  return (
    <>
      {/* Show upgrade banner if not v2 */}
      {!isReadOnly && !shouldRenderV2 && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
          featureName='financialProjection'
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

      {shouldRenderV2 ? <FinancialProjectionsV2 /> : <FinancialProjectionsV1 />}
    </>
  );
};

export default FinancialProjectionsWrapper;
