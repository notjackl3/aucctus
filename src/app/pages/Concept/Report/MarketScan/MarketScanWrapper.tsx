import React from 'react';
import { useGenerateMarketScan } from '@hooks/query/concepts.hook';
import MarketScanV2 from './v2/MarketScanV2';
import MarketScanV3 from './v3/MarketScanV3';
import { VersionUpgradeBanner } from '@components';
import { toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { useConceptReportContext } from '../ConceptReport/ConceptReportContext';

const MarketScanWrapper: React.FC = () => {
  const { concept, isReadOnly } = useConceptReportContext();

  // Track page time for analytics
  const { mutate: generateMarketScan, isLoading } = useGenerateMarketScan();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Use unified loading state to detect pending section
  const { isSectionPending } = useUnifiedLoading({
    currentRoute: AppPath.ConceptMarketScan,
    concept,
    additionalLoadingStates: [isLoading],
  });

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.marketScan || 'v2';
  const shouldRenderV3 = featureVersion === 'v3';

  const handleUpgrade = () => {
    generateMarketScan(concept.identifier);
  };

  const handleDebugModeGenerate = () => {
    generateMarketScan(concept.identifier, {
      onError: () => {
        toast.error('Market Scan Failed', '❌ Failed to generate Market Scan');
      },
    });
  };

  return (
    <>
      {/* Show upgrade banner if not v3 and not currently upgrading */}
      {!isReadOnly && !shouldRenderV3 && !isLoading && !isSectionPending && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
          featureName='marketScan'
        />
      )}

      {/* Show debug mode banner for v2 only - v3 handles its own debug mode with tab awareness */}
      {!isReadOnly && isDebugModeEnabled && !shouldRenderV3 && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isLoading}
          buttonText='Generate Section'
          debugMode={true}
        />
      )}

      {shouldRenderV3 ? <MarketScanV3 /> : <MarketScanV2 />}
    </>
  );
};

export default MarketScanWrapper;
