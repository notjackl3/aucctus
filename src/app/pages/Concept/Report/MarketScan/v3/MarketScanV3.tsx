import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Icon, UnifiedLoadingState } from '@components';
import TabView from '@components/Container/TabView';
import { TabElement } from '@components/Container/TabView/TabView';
import MarketForcesRadar from './components/MarketForcesRadar';
import PriorityInsights from './components/PriorityInsights';
import PESTELAnalysis from './components/PESTELAnalysis';
import Ecosystem from '../ecosystem/Ecosystem';
import useStore from '@stores/store';
import {
  useMarketScanTrendsV3,
  useMarketScanPriorityInsightsV3,
  useMarketScanMarketForcesV3,
} from '@hooks/query/concepts.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { AppPath } from '@routes/routes';
import { useOutletContext } from 'react-router-dom';
import { IMarketForceV3 } from '@libs/api/types/concept/marketScan';
import { IConceptReportContext } from '../../ConceptReport/ConceptReport';

const MarketScanV3: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );
  const { concept } = useOutletContext<IConceptReportContext>();

  const { trends = [], isLoading: isTrendsLoading } = useMarketScanTrendsV3(
    activeConceptUuid || '',
  );
  const { priorityInsights = [], isLoading: isPriorityInsightsLoading } =
    useMarketScanPriorityInsightsV3(activeConceptUuid || '');
  const { marketForces = [], isLoading: isMarketForcesLoading } =
    useMarketScanMarketForcesV3(activeConceptUuid || '');

  // Use unified loading state
  const { isLoading } = useUnifiedLoading({
    currentRoute: AppPath.ConceptMarketScan,
    concept,
    additionalLoadingStates: [
      isTrendsLoading,
      isPriorityInsightsLoading,
      isMarketForcesLoading,
    ],
  });

  const [selectedRadarCategory, setSelectedRadarCategory] =
    useState<IMarketForceV3 | null>(null);
  const [activeTab, setActiveTab] = useState<string>('trends-drivers');

  // Update selected categories when data is loaded
  useEffect(() => {
    if (marketForces && marketForces.length > 0 && !selectedRadarCategory) {
      setSelectedRadarCategory(marketForces[0]);
    }
  }, [marketForces, selectedRadarCategory]);

  const marketScanTabs = useMemo(() => {
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

    return (
      <div className='mx-auto flex max-w-[1600px] flex-col gap-8 p-4'>
        {/* Header */}
        <div>
          <h1 className='aucctus-text-brand-primary aucctus-header-sm-medium'>
            Trends & Drivers
          </h1>
          <p className='aucctus-text-secondary aucctus-text-sm'>
            Analyze market forces and external factors that could impact your
            concept
          </p>
        </div>

        {/* Market Forces Radar Chart */}
        {marketForces.length > 0 && selectedRadarCategory && (
          <div>
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
          <div>
            <PriorityInsights
              conceptUuid={activeConceptUuid}
              insights={priorityInsights}
            />
          </div>
        )}

        {/* PESTEL Analysis */}
        {trends.length > 0 && (
          <div>
            <PESTELAnalysis conceptUuid={activeConceptUuid} sections={trends} />
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trends-drivers':
        return renderTrendsAndDriversContent();
      case 'ecosystem':
        return <Ecosystem />;
      default:
        return renderTrendsAndDriversContent();
    }
  };

  // Show unified loading state
  if (isLoading) {
    return <UnifiedLoadingState />;
  }

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
