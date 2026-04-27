import { OpportunityMap } from '@components/IdeaPlayground';
import AgentProgressBar from '@components/Progress/AgentProgressBar';
import {
  jtbdKeys,
  useIdeateFromJob,
  useJTBDActiveScan,
  useJTBDConfigs,
  useJTBDJobs,
  useJTBDScans,
  useJTBDScanSocketEvents,
  useTriggerJTBDScan,
} from '@hooks/query/jtbd.hook';
import type { IJTBDJob } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Puzzle, Radar, Search, Send, X } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from 'react-query';
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
import JTBDScanMultiSelect from '../JTBDScanMultiSelect';
import { useJTBDView } from '../JTBDViewContext';
import EmptyState from './EmptyState';
import JTBDCardsSection from './JTBDCardsSection';
import { ScanFailureBanner } from './ScanBanners';
import ScanInfoLine from './ScanInfoLine';

interface JTBDCanvasInnerProps {
  /** Whether the current user is an account admin (controls mutative actions). */
  isAdmin?: boolean;
}

const JTBDCanvasInner: React.FC<JTBDCanvasInnerProps> = ({
  isAdmin = false,
}) => {
  // Overseer dock right-offset: when Overseer is docked+open, reserve the
  // 412px right strip for the dock. The outer PrivateLayout skips its
  // pr-[412px] on the JTBD route so the playground bg can extend beneath
  // the dock; this applies the offset to inner content only.
  const isOverseerOpen = useStore((s) => s.overseer.isOpen);
  const isOverseerDocked = useStore((s) => s.overseer.isDocked);
  const isDockActive = isOverseerOpen && isOverseerDocked;

  // View context
  const {
    activeConfigUuid,
    setActiveConfigUuid,
    showCreateModal,
    setShowCreateModal,
    editConfigUuid,
    setEditConfigUuid,
    selectedJobUuid,
    setSelectedJobUuid,
  } = useJTBDView();

  // Zustand bridge: mirror view state so Overseer (rendered outside this
  // provider tree) can read the active config, selected scans, and selected job.
  const setActiveConfigInStore = useStore(
    (s) => s.jtbdActive.setActiveConfigUuid,
  );
  const setSelectedScanUuidsInStore = useStore(
    (s) => s.jtbdActive.setSelectedScanUuids,
  );
  const setSelectedJobInStore = useStore(
    (s) => s.jtbdActive.setSelectedJobUuid,
  );
  const resetJtbdActive = useStore((s) => s.jtbdActive.reset);

  const queryClient = useQueryClient();

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

  const { scans, isLoading: isLoadingScans } = useJTBDScans(configUuid);
  useJTBDScanSocketEvents(configUuid);

  const [searchParams, setSearchParams] = useSearchParams();

  const selectedScanUuids = useMemo(() => {
    const raw = searchParams.get('scans');
    if (!raw) return [] as string[];
    return raw.split(',').filter(Boolean);
  }, [searchParams]);

  const completedScanUuids = useMemo(
    () => scans.filter((s) => s.status === 'completed').map((s) => s.uuid),
    [scans],
  );

  const setSelectedScanUuids = useCallback(
    (next: string[]) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next.length === 0) {
            params.delete('scans');
          } else {
            params.set('scans', next.join(','));
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Track which config we've already auto-seeded for so explicit deselection
  // (user emptying the dropdown) is respected instead of being re-seeded.
  const autoSeededConfigRef = useRef<string | null>(null);
  useEffect(() => {
    if (!configUuid) return;
    if (completedScanUuids.length === 0) return;
    if (autoSeededConfigRef.current === configUuid) return;

    // Deep-link with ?scans=... — honor the URL and mark as seeded.
    if (searchParams.has('scans')) {
      autoSeededConfigRef.current = configUuid;
      return;
    }

    const current =
      scans.find((s) => s.isCurrent && s.status === 'completed')?.uuid ??
      completedScanUuids[0];
    if (current) {
      setSelectedScanUuids([current]);
    }
    autoSeededConfigRef.current = configUuid;
  }, [
    configUuid,
    completedScanUuids,
    scans,
    searchParams,
    setSelectedScanUuids,
  ]);

  const effectiveSelection = useMemo(
    () => selectedScanUuids.filter((uuid) => completedScanUuids.includes(uuid)),
    [selectedScanUuids, completedScanUuids],
  );

  // Bridge JTBD view state → Zustand so Overseer (rendered above this tree)
  // can attach pageMetadata to outbound WebSocket messages. Reset on unmount
  // so stale state doesn't leak across routes (e.g. navigating to Nucleus).
  useEffect(() => {
    setActiveConfigInStore(activeConfigUuid ?? null);
  }, [activeConfigUuid, setActiveConfigInStore]);

  useEffect(() => {
    setSelectedScanUuidsInStore(effectiveSelection);
  }, [effectiveSelection, setSelectedScanUuidsInStore]);

  useEffect(() => {
    setSelectedJobInStore(selectedJobUuid);
  }, [selectedJobUuid, setSelectedJobInStore]);

  useEffect(() => {
    return () => {
      resetJtbdActive();
    };
  }, [resetJtbdActive]);

  const { jobs, isLoading: isLoadingScan } = useJTBDJobs(
    configUuid,
    effectiveSelection,
  );

  // Fetch active scan for start time (page-refresh resilience)
  const isScanning = !!activeConfig?.isScanning;
  const { activeScan } = useJTBDActiveScan(configUuid, isScanning);

  // Derive scan start time as Unix timestamp for AgentProgressBar
  const scanStartTime = useMemo(() => {
    if (activeScan?.scannedAt) {
      return new Date(activeScan.scannedAt).getTime();
    }
    return undefined;
  }, [activeScan?.scannedAt]);

  const { triggerScan, isTriggering } = useTriggerJTBDScan();

  // Per-config set of jobs currently being edited by Ask Aucctus. Drives the
  // per-card "Editing…" pill and the rescan-button gate.
  const editingJobUuidsForConfigList = useStore(
    (s) => s.jtbdActive.editingJobUuidsByConfig[configUuid],
  );
  const editingJobUuidsForConfig = useMemo(
    () => new Set(editingJobUuidsForConfigList ?? []),
    [editingJobUuidsForConfigList],
  );
  const isAnyEditActive = editingJobUuidsForConfig.size > 0;

  const { ideateFromJobAsync } = useIdeateFromJob();
  const [ideatingJobUuid, setIdeatingJobUuid] = useState<string | null>(null);
  const ideationSeedUuid = searchParams.get('seed') || null;

  const handleIdeate = useCallback(
    async (job: IJTBDJob) => {
      if (ideatingJobUuid) return;
      setIdeatingJobUuid(job.uuid);
      try {
        const response = await ideateFromJobAsync({ jobUuid: job.uuid });
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          params.set('mode', 'jtbd');
          params.set('seed', response.seedUuid);
          return params;
        });
      } catch {
        // Error toast already shown by the hook
      } finally {
        setIdeatingJobUuid(null);
      }
    },
    [ideateFromJobAsync, setSearchParams, ideatingJobUuid],
  );

  const handleCloseOpportunityMap = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('mode', 'jtbd');
      params.delete('seed');
      return params;
    });
  }, [setSearchParams]);

  // UI state
  const [searchValue, setSearchValue] = useState('');
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

  // Reset filters when switching configs (NOT on every setSearchParams identity change)
  const prevConfigUuidRef = useRef<string | undefined>(activeConfigUuid);
  useEffect(() => {
    if (prevConfigUuidRef.current === activeConfigUuid) return;
    const isFirstAssignment = prevConfigUuidRef.current === undefined;
    prevConfigUuidRef.current = activeConfigUuid;

    setSearchValue('');
    // JTBDViewContext also clears selectedJobUuid when activeConfigUuid changes,
    // but call the setter explicitly so this effect's reset list is self-contained.
    setSelectedJobUuid(null);
    setFailureDismissed(false);
    setFilters({
      opportunitySize: 'ALL',
      evidenceStrength: 'ALL',
      audience: 'ALL',
    });
    // Preserve ?scans=... on first assignment (landing with a deep-link) and
    // only clear it when the user actually switches to a different config.
    if (!isFirstAssignment) {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.delete('scans');
          return params;
        },
        { replace: true },
      );
    }

    // Drop every cached jobs query so `keepPreviousData` on useJTBDJobs can't
    // leak the prior config's cards into the new config while it fetches
    // (or stays disabled because the new config has no scans yet).
    queryClient.removeQueries({ queryKey: [...jtbdKeys.all, 'jobs'] });
    if (activeConfigUuid) {
      queryClient.invalidateQueries({
        queryKey: [...jtbdKeys.all, 'jobs', activeConfigUuid],
      });
    }
  }, [activeConfigUuid, queryClient, setSearchParams, setSelectedJobUuid]);

  const showFailureBanner =
    !failureDismissed &&
    !isScanning &&
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

  const handleCardClick = useCallback(
    (job: IJTBDJob) => {
      setSelectedJobUuid((prev) => (prev === job.uuid ? null : job.uuid));
    },
    [setSelectedJobUuid],
  );

  const handleTriggerScan = useCallback(() => {
    if (configUuid && isAdmin) {
      triggerScan(configUuid);
    }
  }, [configUuid, triggerScan, isAdmin]);

  // Search bar handler: Enter key opens create modal with search text (admin only)
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' && searchValue.trim() && isAdmin) {
        setPendingDescription(searchValue.trim());
        setShowCreateModal(true);
        setSearchValue('');
      }
    },
    [searchValue, setShowCreateModal, isAdmin],
  );

  const handleSearchSubmit = useCallback((): void => {
    if (!searchValue.trim() || !isAdmin) return;
    setPendingDescription(searchValue.trim());
    setShowCreateModal(true);
    setSearchValue('');
  }, [searchValue, setShowCreateModal, isAdmin]);

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
            isAdmin={isAdmin}
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
      <div
        className={cn(
          'relative h-full w-full overflow-hidden transition-[padding] duration-300',
          isDockActive && 'pr-[412px]',
        )}
      >
        {/* Scrollable content with snap */}
        <div
          ref={scrollContainerRef}
          className='no-scrollbar h-full'
          style={{ scrollSnapType: 'y proximity' }}
        >
          {/* Landing hero section */}
          <div
            className='relative h-[calc(75vh-5rem)] overflow-hidden'
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
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
                {/* Config dropdown + scan multi-select + rescan */}
                <div className='flex items-center justify-center gap-3 pt-2'>
                  <JTBDConfigDropdown
                    isAdmin={isAdmin}
                    onNewArea={handleNewArea}
                  />
                  <JTBDScanMultiSelect
                    configUuid={configUuid}
                    scans={scans}
                    selectedScanUuids={effectiveSelection}
                    onChange={setSelectedScanUuids}
                    isAdmin={isAdmin}
                  />
                  <AnimatePresence>
                    {!isLoadingScans && isAdmin && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleTriggerScan}
                        disabled={isTriggering || isScanning || isAnyEditActive}
                        className='flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Radar className='h-3.5 w-3.5' />
                        {isTriggering
                          ? 'Starting...'
                          : isScanning
                            ? 'Scanning...'
                            : isAnyEditActive
                              ? 'Ask Aucctus editing — wait…'
                              : scans.length === 0
                                ? 'Run First Scan'
                                : 'Rescan'}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                {/* Scan info */}
                <div className='flex justify-center pt-1'>
                  <ScanInfoLine scans={scans} jobs={filteredJobs} />
                </div>

                {/* Inline scan progress bar */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      key='scan-progress-inline'
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className='w-full max-w-md pt-3'
                    >
                      <AgentProgressBar
                        agentName='JTBDScan'
                        fallbackEstimatedSeconds={600}
                        startTime={scanStartTime}
                        showPercentage
                        showTimeRemaining
                        theme='success'
                        size='sm'
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                        disabled={!isAdmin}
                        placeholder={
                          isAdmin
                            ? 'Search for jobs, pain, or customers'
                            : 'Only admins can create new discovery areas'
                        }
                        className='no-focus-ring h-9 flex-1 border-0 bg-transparent text-base text-white placeholder:text-white/30 disabled:cursor-not-allowed'
                      />
                      {searchValue && (
                        <button
                          onClick={() => setSearchValue('')}
                          className='rounded-md p-1 transition-colors hover:bg-white/10'
                        >
                          <X className='h-4 w-4 text-white/40' />
                        </button>
                      )}
                      {isAdmin && (
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
                      )}
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

          {/* Agent status message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className='flex items-center justify-center gap-2 py-4 text-white/40'
          >
            <Radar className='h-4 w-4 animate-pulse' />
            <span className='text-sm'>
              Agents are continuously searching for new jobs
            </span>
          </motion.div>

          {/* Cards section */}
          <div ref={cardsRef}>
            {effectiveSelection.length === 0 &&
            completedScanUuids.length > 0 ? (
              <div
                className='px-8 pb-24 pt-8'
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className='py-20 text-center text-lg text-white/40'>
                  Select one or more scans to view jobs
                </div>
              </div>
            ) : (
              <JTBDCardsSection
                jobs={filteredJobs}
                isLoading={isLoadingScan && filteredJobs.length === 0}
                hasScans={scans.length > 0}
                selectedJobUuid={selectedJobUuid}
                onCardClick={handleCardClick}
                onIdeate={handleIdeate}
                ideatingJobUuid={ideatingJobUuid}
                editingJobUuids={editingJobUuidsForConfig}
              />
            )}
          </div>
        </div>

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

      {/* Modals — only rendered for admins to preserve WebSocket listener lifecycle */}
      {isAdmin && (
        <CreateJTBDConfigModal
          open={showCreateModal}
          onOpenChange={(v) => {
            setShowCreateModal(v);
            if (!v) setPendingDescription('');
          }}
          onCreated={handleConfigCreated}
          initialDescription={pendingDescription}
        />
      )}
      {isAdmin && editConfigUuid && (
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
