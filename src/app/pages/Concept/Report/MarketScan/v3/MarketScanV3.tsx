import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ConceptReportSkeletons,
  VersionUpgradeBanner,
  toast,
} from '@components';
import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import MarketForcesRadar from './components/MarketForcesRadar';
import PriorityInsights from './components/PriorityInsights';
import PESTELAnalysis from './components/PESTELAnalysis';
import Ecosystem from '../ecosystem/Ecosystem';
import useStore from '@stores/store';
import {
  useMarketScanTrendsV3,
  useMarketScanPriorityInsightsV3,
  useMarketScanMarketForcesV3,
  useConceptExecutiveSummaries,
  useGenerateTrendsAndDrivers,
  useGenerateEcosystemV2,
} from '@hooks/query/concepts.hook';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useSearchParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { IMarketForceV3 } from '@libs/api/types/concept/marketScan';
import { IConceptReportContext } from '../../ConceptReport/ConceptReport';
import { Globe, TrendingUp } from 'lucide-react';

const { ExecutiveSummarySkeleton, MarketScanSkeleton, EcosystemV2Skeleton } =
  ConceptReportSkeletons;

const MarketScanV3: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const { concept } = useOutletContext<IConceptReportContext>();
  const [searchParams] = useSearchParams();
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

  // Debug mode generation hooks
  const { mutate: generateTrendsAndDrivers, isLoading: isGeneratingTrends } =
    useGenerateTrendsAndDrivers();
  const { mutate: generateEcosystem, isLoading: isGeneratingEcosystem } =
    useGenerateEcosystemV2();

  const { trends = [] } = trendsQuery;
  const { priorityInsights = [] } = priorityInsightsQuery;
  const { marketForces = [] } = marketForcesQuery;
  const { executiveSummaries } = executiveSummariesQuery;

  // Check section-specific pending status from backend
  const isTrendsSectionPending =
    concept?.reportStatusBySection?.trends?.status === 'pending';
  const isEcosystemSectionPending =
    concept?.reportStatusBySection?.ecosystem?.status === 'pending';

  // Only show skeleton during initial load (no data yet), not during background refetches
  const isTrendsInitialLoading =
    (trendsQuery.isLoading && trends.length === 0) ||
    (priorityInsightsQuery.isLoading && priorityInsights.length === 0) ||
    (marketForcesQuery.isLoading && marketForces.length === 0);

  // Separate loading states for each tab
  const showTrendsSkeletons = isTrendsSectionPending || isTrendsInitialLoading;
  const showEcosystemSkeletons = isEcosystemSectionPending;
  const showExecutiveSummarySkeleton =
    executiveSummariesQuery.isLoading && !executiveSummaries;

  const [selectedRadarCategory, setSelectedRadarCategory] =
    useState<IMarketForceV3 | null>(null);
  const highlightedSectionId = useStore(
    (state) => state.overseer.highlightedSectionId,
  );
  const [activeTab, setActiveTab] = useState<string>('trends-drivers');

  // Handle URL query parameter for tab selection
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['trends-drivers', 'ecosystem'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Switch to the correct sub-tab when a section is highlighted via AI editing
  useEffect(() => {
    if (!highlightedSectionId) return;
    if (highlightedSectionId.startsWith('ecosystem_v2')) {
      setActiveTab('ecosystem');
    } else if (highlightedSectionId.startsWith('trends')) {
      setActiveTab('trends-drivers');
    }
  }, [highlightedSectionId]);

  // Update selected categories when data is loaded
  useEffect(() => {
    if (marketForces && marketForces.length > 0 && !selectedRadarCategory) {
      setSelectedRadarCategory(marketForces[0]);
    }
  }, [marketForces, selectedRadarCategory]);

  // Debug mode generation handler - only regenerates the active section
  const handleDebugModeGenerate = useCallback(() => {
    if (activeTab === 'trends-drivers') {
      generateTrendsAndDrivers(concept.identifier, {
        onError: () => {
          toast.error(
            'Trends & Drivers Failed',
            'Failed to generate Trends & Drivers',
          );
        },
      });
    } else if (activeTab === 'ecosystem') {
      generateEcosystem(concept.identifier, {
        onError: () => {
          toast.error('Ecosystem Failed', 'Failed to generate Ecosystem');
        },
      });
    }
  }, [
    activeTab,
    concept.identifier,
    generateTrendsAndDrivers,
    generateEcosystem,
  ]);

  const isDebugGenerating = isGeneratingTrends || isGeneratingEcosystem;

  const marketScanTabs = useMemo(() => {
    return [
      {
        label: (
          <div className='flex items-center gap-2'>
            <TrendingUp className='aucctus-stroke-brand-primary h-4 w-4' />
            <span>Trends & Drivers</span>
          </div>
        ),
        value: 'trends-drivers',
      },
      {
        label: (
          <div className='flex items-center gap-2'>
            <Globe className='aucctus-stroke-brand-primary h-4 w-4' />
            <span>Ecosystem</span>
          </div>
        ),
        value: 'ecosystem',
      },
    ] as TabElement[];
  }, []);

  const onTabSelect = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab],
  );

  const renderTrendsAndDriversContent = () => {
    if (!activeConceptUuid) {
      return (
        <div className='flex h-64 items-center justify-center'>
          <p className='aucctus-text-secondary'>No concept selected</p>
        </div>
      );
    }

    // Show unified skeleton when loading
    if (showTrendsSkeletons) {
      return <MarketScanSkeleton showEcosystem={false} />;
    }

    return (
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        {/* Executive Summary - separate loading state */}
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

        {/* Market Forces Radar */}
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

        {/* Priority Insights */}
        {priorityInsights.length > 0 && (
          <div data-section-id='trends_priority_insights'>
            <PriorityInsights
              conceptUuid={activeConceptUuid}
              insights={priorityInsights}
            />
          </div>
        )}

        {/* PESTEL Analysis */}
        {trends.length > 0 && (
          <div data-section-id='trends_analysis'>
            <PESTELAnalysis conceptUuid={activeConceptUuid} sections={trends} />
          </div>
        )}
      </div>
    );
  };

  const renderEcosystemContent = () => {
    if (!activeConceptUuid) {
      return (
        <div className='flex h-64 items-center justify-center'>
          <p className='aucctus-text-secondary'>No concept selected</p>
        </div>
      );
    }

    // Show skeleton when ecosystem section is pending
    if (showEcosystemSkeletons) {
      return (
        <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
          <ExecutiveSummarySkeleton />
          <EcosystemV2Skeleton />
        </div>
      );
    }

    return (
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        {/* Executive Summary - separate loading state */}
        <div className='w-full'>
          {showExecutiveSummarySkeleton ? (
            <ExecutiveSummarySkeleton />
          ) : (
            <ExecutiveSummaryBanner
              summary={executiveSummaries?.marketScanEcosystem}
              isLoading={false}
            />
          )}
        </div>

        {/* Ecosystem handles its own loading state internally */}
        <Ecosystem />
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trends-drivers':
        return renderTrendsAndDriversContent();
      case 'ecosystem':
        return renderEcosystemContent();
      default:
        return renderTrendsAndDriversContent();
    }
  };

  return (
    <div data-section-id='market_scan' className='flex flex-1 flex-col gap-4'>
      {/* Debug mode banner - regenerates only the active section */}
      {isDebugModeEnabled && (
        <VersionUpgradeBanner
          onUpgrade={handleDebugModeGenerate}
          isLoading={isDebugGenerating}
          buttonText={`Generate ${activeTab === 'trends-drivers' ? 'Trends & Drivers' : 'Ecosystem'}`}
          debugMode={true}
        />
      )}
      <TabView
        tabs={marketScanTabs}
        tabGroupClassName='pointer-events-auto flex flex-1'
        tabContainerClassName='flex flex-1 items-center justify-center'
        tabClassName='flex flex-1 aucctus-bg-primary-hover items-center justify-center'
        className='flex h-full w-full items-start justify-center'
        variant='button'
        onTabSelect={onTabSelect}
        activeTab={activeTab}
      >
        {renderTabContent()}
      </TabView>
    </div>
  );
};

export default MarketScanV3;
