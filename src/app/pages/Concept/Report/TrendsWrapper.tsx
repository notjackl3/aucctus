import React, { useState, useEffect } from 'react';
import {
  ConceptReportSkeletons,
  VersionUpgradeBanner,
  toast,
} from '@components';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import MarketForcesRadar from './MarketScan/v3/components/MarketForcesRadar';
import PriorityInsights from './MarketScan/v3/components/PriorityInsights';
import PESTELAnalysis from './MarketScan/v3/components/PESTELAnalysis';
import useStore from '@stores/store';
import {
  useMarketScanTrendsV3,
  useMarketScanPriorityInsightsV3,
  useMarketScanMarketForcesV3,
  useConceptExecutiveSummaries,
  useGenerateTrendsAndDrivers,
} from '@hooks/query/concepts.hook';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { IMarketForceV3 } from '@libs/api/types/concept/marketScan';
import { useConceptReportContext } from './ConceptReport/ConceptReportContext';

const { ExecutiveSummarySkeleton, MarketScanSkeleton } = ConceptReportSkeletons;

const TrendsWrapper: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const { concept, isReadOnly } = useConceptReportContext();
  const isDebugModeEnabled = useDebugMode();

  const trendsQuery = useMarketScanTrendsV3(activeConceptUuid || '');
  const priorityInsightsQuery = useMarketScanPriorityInsightsV3(
    activeConceptUuid || '',
  );
  const marketForcesQuery = useMarketScanMarketForcesV3(
    activeConceptUuid || '',
  );
  const executiveSummariesQuery = useConceptExecutiveSummaries(
    activeConceptUuid || '',
  );

  const { mutate: generateTrendsAndDrivers, isLoading: isGeneratingTrends } =
    useGenerateTrendsAndDrivers();

  const { trends = [] } = trendsQuery;
  const { priorityInsights = [] } = priorityInsightsQuery;
  const { marketForces = [] } = marketForcesQuery;
  const { executiveSummaries } = executiveSummariesQuery;

  const isTrendsSectionPending =
    concept?.reportStatusBySection?.trends?.status === 'pending';

  const isTrendsInitialLoading =
    (trendsQuery.isLoading && trends.length === 0) ||
    (priorityInsightsQuery.isLoading && priorityInsights.length === 0) ||
    (marketForcesQuery.isLoading && marketForces.length === 0);

  const showTrendsSkeletons = isTrendsSectionPending || isTrendsInitialLoading;
  const showExecutiveSummarySkeleton =
    executiveSummariesQuery.isLoading && !executiveSummaries;

  const [selectedRadarCategory, setSelectedRadarCategory] =
    useState<IMarketForceV3 | null>(null);

  useEffect(() => {
    if (marketForces && marketForces.length > 0 && !selectedRadarCategory) {
      setSelectedRadarCategory(marketForces[0]);
    }
  }, [marketForces, selectedRadarCategory]);

  const handleDebugModeGenerate = () => {
    generateTrendsAndDrivers(concept.identifier, {
      onError: () => {
        toast.error(
          'Trends & Drivers Failed',
          'Failed to generate Trends & Drivers',
        );
      },
    });
  };

  if (!activeConceptUuid) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='aucctus-text-secondary'>No concept selected</p>
      </div>
    );
  }

  if (showTrendsSkeletons) {
    return <MarketScanSkeleton showEcosystem={false} />;
  }

  return (
    <div
      data-section-id='market_scan_trends'
      className='flex flex-1 flex-col gap-4'
    >
      {!isReadOnly && isDebugModeEnabled && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isGeneratingTrends}
          buttonText='Generate Trends & Drivers'
          debugMode={true}
        />
      )}
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        <div className='w-full'>
          {showExecutiveSummarySkeleton ? (
            <ExecutiveSummarySkeleton />
          ) : (
            <ExecutiveSummaryBanner
              summary={executiveSummaries?.marketScanTrendsDrivers}
              isLoading={false}
            />
          )}
        </div>

        {marketForces.length > 0 && selectedRadarCategory && (
          <div data-section-id='trends_market_forces'>
            <MarketForcesRadar
              conceptUuid={activeConceptUuid}
              trendCategories={marketForces}
              selectedCategory={selectedRadarCategory}
              onCategorySelect={setSelectedRadarCategory}
            />
          </div>
        )}

        {priorityInsights.length > 0 && (
          <div data-section-id='trends_priority_insights'>
            <PriorityInsights
              conceptUuid={activeConceptUuid}
              insights={priorityInsights}
            />
          </div>
        )}

        {trends.length > 0 && (
          <div data-section-id='trends_analysis'>
            <PESTELAnalysis conceptUuid={activeConceptUuid} sections={trends} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsWrapper;
