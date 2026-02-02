/**
 * Competitor Assessment Page
 *
 * Multi-view tabbed dashboard for competitive intelligence:
 * - Overview: KPI cards, confidence chart, white space distribution, top opportunities
 * - Matrix: Enhanced comparison table with expandable cells and column highlights
 * - Competitors: Profile cards with confidence rings and detail panels
 * - White Spaces: Filtered/sorted opportunity grid with rich cards
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Badge, Icon, Loading, Tabs, TabsContent } from '@components';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';

import {
  useCompetitorAssessmentDashboard,
  useRefreshCompetitorAssessment,
  useCompetitorAssessmentSocketEvents,
} from '@hooks/query/competitorAssessment.hook';

import { CompetitorAssessmentInitiation } from './components';
import CompetitorOverview from './components/CompetitorOverview';
import CompetitorMatrix from './components/CompetitorMatrix';
import CompetitorProfiles from './components/CompetitorProfiles';
import WhiteSpaceGrid from './components/WhiteSpaceGrid';

type TabValue = 'overview' | 'matrix' | 'competitors' | 'white-spaces';

const tabConfig: { value: TabValue; label: string; icon: string }[] = [
  { value: 'overview', label: 'Overview', icon: 'barchart' },
  { value: 'matrix', label: 'Matrix', icon: 'columns' },
  { value: 'competitors', label: 'Competitors', icon: 'swords' },
  { value: 'white-spaces', label: 'White Spaces', icon: 'sparkles' },
];

const CompetitorAssessmentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  const { competitors, whiteSpaces, metrics, lastRefreshedAt, isLoading } =
    useCompetitorAssessmentDashboard();

  const { scanProgress, startScanning } = useCompetitorAssessmentSocketEvents();

  const { refresh: triggerRefresh, isRefreshing } =
    useRefreshCompetitorAssessment();

  const lastUpdated = useMemo(() => {
    if (lastRefreshedAt) return new Date(lastRefreshedAt);
    return null;
  }, [lastRefreshedAt]);

  const handleRefresh = useCallback(() => {
    startScanning();
    triggerRefresh();
  }, [startScanning, triggerRefresh]);

  const isScanningActive = isRefreshing || scanProgress.isScanning;
  const isFirstRun = !lastRefreshedAt && competitors.length === 0;

  // Loading state
  if (isLoading) {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loading />
          <p className='aucctus-text-secondary text-sm'>
            Loading Competitor Assessment data...
          </p>
        </div>
      </div>
    );
  }

  // First-run initiation
  if (isFirstRun && !isScanningActive) {
    return (
      <CompetitorAssessmentInitiation
        onInitialize={handleRefresh}
        isInitializing={isScanningActive}
      />
    );
  }

  // Scanning progress
  if (isFirstRun && isScanningActive) {
    return (
      <div className='aucctus-bg-primary flex min-h-screen flex-col items-center justify-center'>
        <div className='flex flex-col items-center gap-6'>
          <div className='relative'>
            <Loading />
          </div>
          <div className='text-center'>
            <h2 className='aucctus-text-primary mb-2 text-lg font-semibold'>
              {scanProgress.stage === 'discovering'
                ? 'Discovering Competitors'
                : scanProgress.stage === 'researching'
                  ? 'Researching Competitors'
                  : scanProgress.stage === 'analyzing'
                    ? 'Analyzing White Spaces'
                    : 'Initializing Assessment'}
            </h2>
            <p className='aucctus-text-secondary text-sm'>
              {scanProgress.message ||
                'This may take a few minutes. Please wait...'}
            </p>
            {scanProgress.currentCompetitor && (
              <p className='aucctus-text-tertiary mt-2 text-xs'>
                Currently researching: {scanProgress.currentCompetitor}
              </p>
            )}
          </div>
          <div className='h-2 w-64 overflow-hidden rounded-full bg-white/10'>
            <motion.div
              className='h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500'
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className='aucctus-text-tertiary text-xs'>
            {scanProgress.progress}% complete
          </span>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className='aucctus-bg-primary min-h-screen'>
      {/* Header */}
      <div className='aucctus-border-secondary border-b px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-secondary rounded-lg p-2'>
              <Icon
                variant='swords'
                height={24}
                width={24}
                className='aucctus-stroke-primary'
              />
            </div>
            <div>
              <h1 className='aucctus-text-primary flex items-center gap-2 text-xl font-bold'>
                Competitor Assessment
                <Badge.Beta size='xs' />
              </h1>
              <p className='aucctus-text-secondary text-sm'>
                Competitive Intelligence Dashboard
              </p>
            </div>
          </div>

          {/* Refresh control */}
          <div className='aucctus-bg-secondary aucctus-border-secondary flex items-center gap-2 rounded-lg border px-3 py-2'>
            <Icon
              variant='clock'
              height={14}
              width={14}
              className='aucctus-stroke-tertiary'
            />
            {isScanningActive ? (
              <span className='aucctus-text-secondary text-xs'>
                {scanProgress.message || 'Scanning...'}
                {scanProgress.progress > 0 && ` (${scanProgress.progress}%)`}
              </span>
            ) : lastUpdated ? (
              <span className='aucctus-text-secondary text-xs'>
                {lastUpdated.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            ) : (
              <span className='aucctus-text-tertiary text-xs'>Never</span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isScanningActive}
              className={cn(
                'rounded p-1 transition-colors',
                isScanningActive
                  ? 'cursor-not-allowed opacity-50'
                  : 'aucctus-bg-secondary-hover',
              )}
              title='Refresh assessment'
            >
              <Icon
                variant='refresh'
                height={14}
                width={14}
                className={cn(
                  'aucctus-stroke-secondary',
                  isScanningActive && 'animate-spin',
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <div className='aucctus-border-secondary border-b px-6 py-2'>
          <div className='flex items-center gap-1'>
            {tabConfig.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn('btn btn-sm', {
                    'bg-black text-white': isActive,
                    'btn-no-border aucctus-text-tertiary hover:aucctus-text-primary':
                      !isActive,
                  })}
                >
                  <Icon
                    variant={tab.icon as any}
                    height={14}
                    width={14}
                    className={cn({
                      'stroke-white': isActive,
                      'aucctus-stroke-tertiary': !isActive,
                    })}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className='p-6'>
          <TabsContent value='overview' className='mt-0'>
            <CompetitorOverview
              competitors={competitors}
              whiteSpaces={whiteSpaces}
              metrics={metrics}
              lastRefreshedAt={lastRefreshedAt}
              onViewWhiteSpaces={() => setActiveTab('white-spaces')}
            />
          </TabsContent>

          <TabsContent value='matrix' className='mt-0'>
            <CompetitorMatrix competitors={competitors} />
          </TabsContent>

          <TabsContent value='competitors' className='mt-0'>
            <CompetitorProfiles competitors={competitors} />
          </TabsContent>

          <TabsContent value='white-spaces' className='mt-0'>
            <WhiteSpaceGrid whiteSpaces={whiteSpaces} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CompetitorAssessmentPage;
