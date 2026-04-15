import { OpportunityMap } from '@components/IdeaPlayground';
import {
  useIdeateFromJob,
  useJTBDActiveScan,
  useJTBDConfigs,
  useJTBDCurrentScan,
  useJTBDScans,
  useJTBDScanSocketEvents,
  useTriggerJTBDScan,
  type JTBDScanProgress,
} from '@hooks/query/jtbd.hook';
import type { IJTBDJob } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Puzzle, Radar, Search, Send, X } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import CreateJTBDConfigModal from '../CreateJTBDConfigModal';
import EditJTBDConfigModal from '../EditJTBDConfigModal';
import JTBDConfigDropdown from '../JTBDConfigDropdown';
import {
  matchesAudience,
  matchesEvidenceStrength,
  matchesOpportunitySize,
  type JTBDFilters,
} from '../JTBDFilterBar';
import { useJTBDView } from '../JTBDViewContext';
import EmptyState from './EmptyState';
import JTBDCardsSection from './JTBDCardsSection';
import { ScanFailureBanner, ScanProgressBanner } from './ScanBanners';
import ScanInfoLine from './ScanInfoLine';

const JTBDCanvasInner: React.FC = () => {
  // View context
  const {
    activeConfigUuid,
    setActiveConfigUuid,
    showCreateModal,
    setShowCreateModal,
    editConfigUuid,
    setEditConfigUuid,
  } = useJTBDView();

  // Data hooks
  const { configs, isLoading: isLoadingConfigs } = useJTBDConfigs();

  // Auto-select first config when configs load
  useEffect(() => {
    if (!activeConfigUuid && configs.length > 0) {
      setActiveConfigUuid(configs[0].uuid);
    }
  }, [configs, activeConfigUuid, setActiveConfigUuid]);

  const configUuid = activeConfigUuid ?? configs[0]?.uuid ?? '';
  const activeConfig = configs.find((c) => c.uuid === configUuid) ?? null;

  const { jobs, isLoading: isLoadingScan } = useJTBDCurrentScan(configUuid);
  const { scans, isLoading: isLoadingScans } = useJTBDScans(configUuid);
  const { scanProgress, startScanning } = useJTBDScanSocketEvents(configUuid);

  // Recover scan progress on page refresh
  const { activeScan } = useJTBDActiveScan(
    configUuid,
    !!activeConfig?.isScanning && !scanProgress.isScanning,
  );

  // Derive effective progress — WS > REST active scan > config flag
  const effectiveProgress: JTBDScanProgress = scanProgress.isScanning
    ? scanProgress
    : activeScan
      ? {
          isScanning: true,
          stage: activeScan.stage ?? 'started',
          progress: activeScan.progress ?? 0,
          message: activeScan.message ?? 'Scan in progress...',
        }
      : activeConfig?.isScanning
        ? {
            isScanning: true,
            stage: 'started',
            progress: 0,
            message: 'Scan in progress...',
          }
        : scanProgress;

  const { triggerScan, isTriggering } = useTriggerJTBDScan(startScanning);

  const { ideateFromJobAsync } = useIdeateFromJob();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ideatingJobUuid, setIdeatingJobUuid] = useState<string | null>(null);
  const ideationSeedUuid = searchParams.get('seed') || null;

  const handleIdeate = useCallback(
    async (job: IJTBDJob) => {
      if (ideatingJobUuid) return;
      setIdeatingJobUuid(job.uuid);
      try {
        const response = await ideateFromJobAsync(job.uuid);
        setSearchParams({ mode: 'jtbd', seed: response.seedUuid });
      } catch {
        // Error toast already shown by the hook
      } finally {
        setIdeatingJobUuid(null);
      }
    },
    [ideateFromJobAsync, setSearchParams, ideatingJobUuid],
  );

  const handleCloseOpportunityMap = useCallback(() => {
    setSearchParams({ mode: 'jtbd' });
  }, [setSearchParams]);

  // UI state
  const [searchValue, setSearchValue] = useState('');
  const [selectedJobUuid, setSelectedJobUuid] = useState<string | null>(null);
  const [filters, setFilters] = useState<JTBDFilters>({
    opportunitySize: 'ALL',
    evidenceStrength: 'ALL',
    audience: 'ALL',
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [failureDismissed, setFailureDismissed] = useState(false);
  const [pendingDescription, setPendingDescription] = useState('');

  const isInitialLoad = isLoadingConfigs && configs.length === 0;

  // Reset filters when switching configs
  useEffect(() => {
    setSearchValue('');
    setSelectedJobUuid(null);
    setFailureDismissed(false);
    setFilters({
      opportunitySize: 'ALL',
      evidenceStrength: 'ALL',
      audience: 'ALL',
    });
  }, [activeConfigUuid]);

  const showFailureBanner =
    !failureDismissed &&
    !effectiveProgress.isScanning &&
    activeConfig?.lastScanStatus === 'failed';

  // Filter jobs (no text search — only filter bar)
  const filteredJobs = useMemo(() => {
    let items = [...jobs];
    items = items.filter(
      (j) =>
        matchesOpportunitySize(j.opportunityScore, filters.opportunitySize) &&
        matchesEvidenceStrength(j.evidenceStrength, filters.evidenceStrength) &&
        matchesAudience(j.segment, filters.audience),
    );
    items.sort((a, b) => b.opportunityScore - a.opportunityScore);
    return items;
  }, [jobs, filters]);

  const handleCardClick = useCallback((job: IJTBDJob) => {
    setSelectedJobUuid((prev) => (prev === job.uuid ? null : job.uuid));
  }, []);

  const handleTriggerScan = useCallback(() => {
    if (configUuid) {
      triggerScan(configUuid);
    }
  }, [configUuid, triggerScan]);

  // Search bar handler: Enter key opens create modal with search text
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' && searchValue.trim()) {
        setPendingDescription(searchValue.trim());
        setShowCreateModal(true);
        setSearchValue('');
      }
    },
    [searchValue, setShowCreateModal],
  );

  const handleSearchSubmit = useCallback((): void => {
    if (!searchValue.trim()) return;
    setPendingDescription(searchValue.trim());
    setShowCreateModal(true);
    setSearchValue('');
  }, [searchValue, setShowCreateModal]);

  const handleNewArea = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => searchInputRef.current?.focus(), 300);
  }, []);

  const handleConfigCreated = useCallback(
    (uuid: string) => {
      setActiveConfigUuid(uuid);
    },
    [setActiveConfigUuid],
  );

  const isEmptyState = !isLoadingConfigs && !activeConfig;

  // Determine which content to render
  const renderContent = (): React.ReactNode => {
    // Initial load — no configs cached yet, render minimal container
    if (isInitialLoad) {
      return <div className='relative h-full w-full' />;
    }

    // Empty state — no config exists yet
    if (isEmptyState) {
      return (
        <div className='relative h-full w-full overflow-auto'>
          <EmptyState
            hasConfig={false}
            onConfigure={handleNewArea}
            onTriggerScan={handleTriggerScan}
            isTriggering={isTriggering}
            onSearch={(description) => {
              setPendingDescription(description);
              setShowCreateModal(true);
            }}
          />
        </div>
      );
    }

    // Show OpportunityMap when a seed is in the URL
    if (ideationSeedUuid) {
      return (
        <div className='relative h-full w-full'>
          <OpportunityMap
            seedUuid={ideationSeedUuid}
            onClose={handleCloseOpportunityMap}
          />
        </div>
      );
    }

    return (
      <div className='relative h-full w-full overflow-hidden'>
        {/* Scrollable content with snap */}
        <div
          ref={scrollContainerRef}
          className='h-full overflow-auto'
          style={{ scrollSnapType: 'y proximity' }}
        >
          {/* Landing hero section */}
          <div
            className='relative h-[calc(90vh-5rem)] overflow-hidden'
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8'>
              <motion.div
                style={{ pointerEvents: 'auto' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className='space-y-3 text-center'
              >
                <div className='mb-2 flex items-center justify-center gap-3'>
                  <Puzzle className='h-12 w-12 text-white/70' />
                </div>
                <h1 className='text-5xl font-bold text-white'>
                  Jobs to Be Done
                </h1>
                {scans.length > 0 && (
                  <p className='mx-auto max-w-lg text-xl text-white/60'>
                    {filteredJobs.length} unmet need
                    {filteredJobs.length !== 1 ? 's' : ''} discovered
                  </p>
                )}
                {/* Config dropdown + rescan */}
                <div className='flex items-center justify-center gap-3 pt-2'>
                  <JTBDConfigDropdown isAdmin onNewArea={handleNewArea} />
                  <AnimatePresence>
                    {!isLoadingScans && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleTriggerScan}
                        disabled={isTriggering || effectiveProgress.isScanning}
                        className='flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Radar className='h-3.5 w-3.5' />
                        {isTriggering
                          ? 'Starting...'
                          : effectiveProgress.isScanning
                            ? 'Scanning...'
                            : scans.length === 0
                              ? 'Run First Scan'
                              : 'Rescan'}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                {/* Scan info */}
                <div className='flex justify-center pt-1'>
                  <ScanInfoLine scans={scans} jobCount={filteredJobs.length} />
                </div>
              </motion.div>

              {/* Landing search bar — opens create modal on Enter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className='mt-8 w-full max-w-lg px-6'
                style={{ pointerEvents: 'auto' }}
              >
                <div className='liquid-glass-search-shell'>
                  <div aria-hidden='true' className='liquid-glass-search-rim' />
                  <div className='liquid-glass-search-surface'>
                    <div className='flex items-center gap-2 px-4 py-3'>
                      <Search className='h-5 w-5 shrink-0 text-white/40' />
                      <input
                        ref={searchInputRef}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder='Search for jobs, pain, or customers'
                        className='no-focus-ring h-9 flex-1 border-0 bg-transparent text-base text-white placeholder:text-white/30'
                      />
                      {searchValue && (
                        <button
                          onClick={() => setSearchValue('')}
                          className='rounded-md p-1 transition-colors hover:bg-white/10'
                        >
                          <X className='h-4 w-4 text-white/40' />
                        </button>
                      )}
                      <button
                        onClick={handleSearchSubmit}
                        disabled={!searchValue.trim()}
                        className={cn(
                          'rounded-lg p-2 transition-all',
                          searchValue.trim()
                            ? 'text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                            : 'text-white/20',
                        )}
                        aria-label='Submit'
                      >
                        <Send className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
                <div className='mx-auto mt-4 flex items-center justify-center gap-1.5 text-white/30'>
                  <ChevronDown className='h-3.5 w-3.5 animate-bounce' />
                  <span className='text-xs'>Scroll to See JTBD</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Cards section */}
          <div ref={cardsRef}>
            <JTBDCardsSection
              jobs={filteredJobs}
              isLoading={isLoadingScan && filteredJobs.length === 0}
              hasScans={scans.length > 0}
              selectedJobUuid={selectedJobUuid}
              onCardClick={handleCardClick}
              onIdeate={handleIdeate}
              ideatingJobUuid={ideatingJobUuid}
            />
          </div>
        </div>

        {/* Scan progress banner */}
        <AnimatePresence>
          {effectiveProgress.isScanning && (
            <div className='pointer-events-none absolute bottom-6 left-0 right-0 z-30 flex justify-center'>
              <div className='pointer-events-auto w-full max-w-md px-4'>
                <ScanProgressBanner
                  stage={effectiveProgress.stage}
                  progress={effectiveProgress.progress}
                  message={effectiveProgress.message}
                  currentJob={effectiveProgress.currentJob}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Scan failure banner */}
        <AnimatePresence>
          {showFailureBanner && (
            <div className='pointer-events-none absolute bottom-6 left-0 right-0 z-30 flex justify-center'>
              <div className='pointer-events-auto w-full max-w-md px-4'>
                <ScanFailureBanner
                  errorMessage={activeConfig?.lastScanError}
                  onRetry={handleTriggerScan}
                  isRetrying={isTriggering}
                  onDismiss={() => setFailureDismissed(true)}
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Modals — always rendered to preserve WebSocket listener lifecycle */}
      <CreateJTBDConfigModal
        open={showCreateModal}
        onOpenChange={(v) => {
          setShowCreateModal(v);
          if (!v) setPendingDescription('');
        }}
        onCreated={handleConfigCreated}
        initialDescription={pendingDescription}
      />
      {editConfigUuid && (
        <EditJTBDConfigModal
          configUuid={editConfigUuid}
          open={!!editConfigUuid}
          onOpenChange={(open) => {
            if (!open) setEditConfigUuid(undefined);
          }}
        />
      )}
    </>
  );
};

export default JTBDCanvasInner;
