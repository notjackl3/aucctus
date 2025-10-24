import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useGenerateMarketScan } from '@hooks/query/concepts.hook';
import MarketScanV2 from './v2/MarketScanV2';
import MarketScanV3 from './v3/MarketScanV3';
import { VersionUpgradeBanner } from '@components';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';

const MarketScanWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { mutate: generateMarketScan, isLoading } = useGenerateMarketScan();

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.marketScan || 'v2';
  const shouldRenderV3 = featureVersion === 'v3';

  const handleUpgrade = () => {
    generateMarketScan(concept.identifier);
  };

  const handleDebugModeGenerate = () => {
    generateMarketScan(concept.identifier, {
      onSuccess: () => {
        toast.successAnimated(
          'Market Scan Generated',
          '🔍 Market Scan generated successfully!',
        );
      },
      onError: () => {
        toast.errorAnimated(
          'Market Scan Failed',
          '❌ Failed to generate Market Scan',
        );
      },
    });
  };

  return (
    <>
      {/* Show upgrade banner if not v3 */}
      {!shouldRenderV3 && (
        <VersionUpgradeBanner
          onUpgrade={handleUpgrade}
          isLoading={isLoading}
          featureName='marketScan'
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

      {shouldRenderV3 ? <MarketScanV3 /> : <MarketScanV2 />}
    </>
  );
};

export default MarketScanWrapper;
