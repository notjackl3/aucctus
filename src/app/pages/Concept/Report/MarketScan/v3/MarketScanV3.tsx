import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Icon, ConceptReportSkeletons } from '@components';
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
} from '@hooks/query/concepts.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { useSearchParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { IMarketForceV3 } from '@libs/api/types/concept/marketScan';
import { IConceptReportContext } from '../../ConceptReport/ConceptReport';

const {
  ExecutiveSummarySkeleton,
  PriorityInsightsSkeleton,
  PESTELSkeleton,
  SkeletonBlock,
} = ConceptReportSkeletons;

const MarketScanV3: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const { concept } = useOutletContext<IConceptReportContext>();
  const [searchParams] = useSearchParams();

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

  const { trends = [] } = trendsQuery;
  const { priorityInsights = [] } = priorityInsightsQuery;
  const { marketForces = [] } = marketForcesQuery;
  const { executiveSummaries } = executiveSummariesQuery;

  // Section-specific loading and regeneration status
  const { isSectionPending, hasBlockingLoad } = useUnifiedLoading({
    currentRoute: AppPath.ConceptMarketScan,
    concept,
    additionalLoadingStates: [
      trendsQuery.isLoading || trendsQuery.isFetching,
      priorityInsightsQuery.isLoading || priorityInsightsQuery.isFetching,
      marketForcesQuery.isLoading || marketForcesQuery.isFetching,
      executiveSummariesQuery.isLoading || executiveSummariesQuery.isFetching,
    ],
  });
  const showSkeletons = isSectionPending || hasBlockingLoad;

  const [selectedRadarCategory, setSelectedRadarCategory] =
    useState<IMarketForceV3 | null>(null);
  const [activeTab, setActiveTab] = useState<string>('trends-drivers');

  // Handle URL query parameter for tab selection
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['trends-drivers', 'ecosystem'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update selected categories when data is loaded
  useEffect(() => {
    if (marketForces && marketForces.length > 0 && !selectedRadarCategory) {
      setSelectedRadarCategory(marketForces[0]);
    }
  }, [marketForces, selectedRadarCategory]);

  const marketScanTabs = useMemo(() => {
    // Show skeleton placeholders for tab labels during loading
    if (showSkeletons) {
      return [
        {
          label: (
            <div className='flex items-center gap-2'>
              <SkeletonBlock className='h-4 w-4 rounded' />
              <SkeletonBlock className='h-4 w-32' />
            </div>
          ),
          value: 'trends-drivers',
        },
        {
          label: (
            <div className='flex items-center gap-2'>
              <SkeletonBlock className='h-4 w-4 rounded' />
              <SkeletonBlock className='h-4 w-24' />
            </div>
          ),
          value: 'ecosystem',
        },
      ] as TabElement[];
    }

    // Normal tab labels when not loading
    return [
      {
        label: (
          <div className='flex items-center gap-2'>
            <Icon
              variant='trendup'
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
            <span>Trends & Drivers</span>
          </div>
        ),
        value: 'trends-drivers',
      },
      {
        label: (
          <div className='flex items-center gap-2'>
            <Icon
              variant='globe'
              className='aucctus-stroke-brand-primary h-4 w-4'
            />
            <span>Ecosystem</span>
          </div>
        ),
        value: 'ecosystem',
      },
    ] as TabElement[];
  }, [showSkeletons]);

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

    return (
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        <div className='w-full'>
          {showSkeletons ? (
            <ExecutiveSummarySkeleton />
          ) : (
            <ExecutiveSummaryBanner
              summary={executiveSummaries?.marketScanTrendsDrivers}
              isLoading={false}
            />
          )}
        </div>

        <div>
          {showSkeletons ? (
            <div className='aucctus-bg-primary aucctus-border-secondary flex h-[420px] w-full flex-col gap-4 rounded-lg border p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <SkeletonBlock className='h-4 w-48' />
                <div className='flex gap-2'>
                  <SkeletonBlock className='h-8 w-8 rounded-full' />
                  <SkeletonBlock className='h-8 w-8 rounded-full' />
                </div>
              </div>
              <SkeletonBlock className='h-full w-full rounded-xl' />
            </div>
          ) : (
            marketForces.length > 0 &&
            selectedRadarCategory && (
              <MarketForcesRadar
                conceptUuid={activeConceptUuid}
                trendCategories={marketForces}
                selectedCategory={selectedRadarCategory}
                onCategorySelect={setSelectedRadarCategory}
              />
            )
          )}
        </div>

        <div>
          {showSkeletons ? (
            <PriorityInsightsSkeleton />
          ) : (
            priorityInsights.length > 0 && (
              <PriorityInsights
                conceptUuid={activeConceptUuid}
                insights={priorityInsights}
              />
            )
          )}
        </div>

        <div>
          {showSkeletons ? (
            <PESTELSkeleton count={Math.max(3, trends.length)} />
          ) : (
            trends.length > 0 && (
              <PESTELAnalysis
                conceptUuid={activeConceptUuid}
                sections={trends}
              />
            )
          )}
        </div>
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

    return (
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        <div className='w-full'>
          {showSkeletons ? (
            <ExecutiveSummarySkeleton />
          ) : (
            <ExecutiveSummaryBanner
              summary={executiveSummaries?.marketScanEcosystem}
              isLoading={false}
            />
          )}
        </div>
        {showSkeletons ? (
          <div className='aucctus-bg-primary aucctus-border-secondary flex h-[560px] w-full flex-col gap-4 rounded-lg border p-6 shadow-sm'>
            <SkeletonBlock className='h-4 w-40' />
            <SkeletonBlock className='h-4 w-28' />
            <SkeletonBlock className='h-full w-full rounded-xl' />
          </div>
        ) : (
          <Ecosystem />
        )}
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
    <div className='flex flex-1 flex-col gap-4'>
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
