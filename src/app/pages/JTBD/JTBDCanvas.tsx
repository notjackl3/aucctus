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
import type { IJTBDJob, IJTBDScan } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Crosshair,
  Puzzle,
  Radar,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import CreateJTBDConfigModal from './CreateJTBDConfigModal';
import EditJTBDConfigModal from './EditJTBDConfigModal';
import JTBDConfigDropdown from './JTBDConfigDropdown';
import {
  matchesAudience,
  matchesEvidenceStrength,
  matchesOpportunitySize,
  type JTBDFilters,
} from './JTBDFilterBar';
import { JTBDMasonryColumns } from './JTBDMasonryColumns';
import { JTBDViewProvider, useJTBDView } from './JTBDViewContext';

// ============================================
// Skeleton Loading Cards
// ============================================

const SkeletonCards: React.FC = () => (
  <div className='grid grid-cols-1 gap-6 px-8 pt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
        className='space-y-3 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 backdrop-blur-xl'
      >
        <div className='flex items-center justify-between'>
          <div className='h-5 w-12 animate-pulse rounded-full bg-white/[0.08]' />
          <div className='h-4 w-8 animate-pulse rounded bg-white/[0.08]' />
        </div>
        <div className='h-5 w-full animate-pulse rounded bg-white/[0.08]' />
        <div className='h-4 w-3/4 animate-pulse rounded bg-white/[0.08]' />
        <div className='h-4 w-1/2 animate-pulse rounded bg-white/[0.08]' />
      </motion.div>
    ))}
  </div>
);

// ============================================
// Scan Progress Banner
// ============================================

const ScanProgressBanner: React.FC<{
  stage: string;
  progress: number;
  message: string;
  currentJob?: string;
}> = ({ progress, message, currentJob }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className='mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-white/[0.08] bg-black/60 px-4 py-2 backdrop-blur-xl'
  >
    <Radar className='h-4 w-4 shrink-0 animate-pulse text-emerald-400' />
    <div className='min-w-0 flex-1'>
      <div className='flex items-center gap-2'>
        <span className='truncate text-xs font-medium text-white/80'>
          {currentJob ? `Analyzing: ${currentJob}` : message}
        </span>
        <span className='shrink-0 text-[10px] tabular-nums text-white/40'>
          {Math.round(progress)}%
        </span>
      </div>
      <div className='mt-1 h-1 w-full rounded-full bg-white/[0.08]'>
        <motion.div
          className='h-1 rounded-full bg-emerald-400'
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  </motion.div>
);

// ============================================
// Scan Failure Banner
// ============================================

const ScanFailureBanner: React.FC<{
  errorMessage?: string;
  onRetry: () => void;
  isRetrying: boolean;
  onDismiss: () => void;
}> = ({ errorMessage, onRetry, isRetrying, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className='mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-red-500/15 bg-black/60 px-4 py-2 backdrop-blur-xl'
  >
    <AlertTriangle className='h-4 w-4 shrink-0 text-red-400' />
    <span className='min-w-0 truncate text-xs font-medium text-red-300'>
      {errorMessage || 'Last scan failed'}
    </span>
    <div className='ml-auto flex shrink-0 items-center gap-1.5'>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className='flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
      >
        <RefreshCw className={cn('h-3 w-3', isRetrying && 'animate-spin')} />
        {isRetrying ? '...' : 'Retry'}
      </button>
      <button
        onClick={onDismiss}
        className='rounded-full p-1 text-red-300/40 transition-colors hover:text-red-300/60'
      >
        <X className='h-3.5 w-3.5' />
      </button>
    </div>
  </motion.div>
);

// ============================================
// JTBD Animated Background
// ============================================

const JTBDBackground: React.FC = () => {
  const dots = [
    { x: 20, y: 25, delay: 0 },
    { x: 65, y: 20, delay: 0.4 },
    { x: 40, y: 55, delay: 0.8 },
    { x: 78, y: 50, delay: 1.2 },
    { x: 28, y: 72, delay: 1.6 },
    { x: 55, y: 35, delay: 2.0 },
    { x: 85, y: 68, delay: 2.4 },
  ];

  const colors = ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24'];

  return (
    <div className='absolute inset-0 overflow-hidden'>
      {/* Radial glow */}
      <div
        className='absolute inset-0 opacity-30'
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.15), transparent 70%)',
        }}
      />

      {/* Grid lines */}
      <svg
        className='absolute inset-0 h-full w-full opacity-20'
        style={{ filter: 'blur(1px)' }}
        preserveAspectRatio='xMidYMid slice'
      >
        {/* Concentric rings */}
        <ellipse
          cx='50%'
          cy='50%'
          rx='40%'
          ry='35%'
          fill='none'
          stroke='white'
          strokeOpacity='0.3'
          strokeWidth='1'
          strokeDasharray='6 4'
        />
        <ellipse
          cx='50%'
          cy='50%'
          rx='25%'
          ry='22%'
          fill='none'
          stroke='white'
          strokeOpacity='0.2'
          strokeWidth='1'
          strokeDasharray='6 4'
        />
        {/* Cross lines */}
        <line
          x1='50%'
          y1='15%'
          x2='50%'
          y2='85%'
          stroke='white'
          strokeOpacity='0.1'
          strokeWidth='1'
        />
        <line
          x1='10%'
          y1='50%'
          x2='90%'
          y2='50%'
          stroke='white'
          strokeOpacity='0.1'
          strokeWidth='1'
        />
      </svg>

      {/* Animated signal dots */}
      <div className='absolute inset-0' style={{ filter: 'blur(2px)' }}>
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className='absolute h-3 w-3 rounded-full'
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              background: colors[i % colors.length],
              boxShadow: `0 0 20px ${colors[i % colors.length]}`,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.7, 1.2, 0.7],
            }}
            transition={{
              duration: 3,
              delay: dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Sweep line */}
      <motion.div
        className='absolute left-1/2 top-1/2 h-px w-[40%] origin-left'
        style={{
          background:
            'linear-gradient(90deg, rgba(52,211,153,0.3) 0%, transparent 100%)',
          filter: 'blur(2px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

// ============================================
// Feature highlights for initiation
// ============================================

const JTBD_FEATURES = [
  {
    icon: Target,
    title: 'Discover Unmet Needs',
    description:
      'AI-powered analysis of market signals and customer pain points',
  },
  {
    icon: Crosshair,
    title: 'Opportunity Scoring',
    description: 'Rank jobs by frequency, intensity, and willingness to pay',
  },
  {
    icon: Sparkles,
    title: 'Evidence Widgets',
    description: 'Rich visualizations backing every discovered opportunity',
  },
];

// ============================================
// Empty State (Cinematic Initiation)
// ============================================

const EmptyState: React.FC<{
  hasConfig: boolean;
  onConfigure: () => void;
  onTriggerScan: () => void;
  isTriggering: boolean;
}> = ({ hasConfig, onConfigure, onTriggerScan, isTriggering }) => (
  <div className='relative flex h-full w-full items-center justify-center overflow-hidden'>
    {/* Animated background */}
    <JTBDBackground />

    {/* Content */}
    <div className='relative z-10 flex flex-col items-center px-6'>
      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className='mb-8 flex items-center gap-3'
      >
        <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm'>
          <Puzzle className='h-3.5 w-3.5 text-white/70' />
          <span className='text-xs font-medium text-white/90'>
            Jobs to Be Done
          </span>
        </div>
        <div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm'>
          <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-400' />
          <span className='text-xs font-medium text-white/90'>AI-Powered</span>
        </div>
      </motion.div>

      {/* Title with icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className='mb-4 flex items-center gap-5'
      >
        <div className='relative'>
          <div className='absolute inset-0 scale-150 rounded-xl bg-white/15 blur-xl' />
          <div className='relative rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-md'>
            <Puzzle className='h-10 w-10 text-white' strokeWidth={1.5} />
          </div>
        </div>
        <h1 className='text-4xl font-bold tracking-tight text-white md:text-5xl'>
          {hasConfig ? 'Ready to Scan' : 'Jobs to Be Done'}
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className='mb-10 text-center text-base tracking-wide text-white/50'
      >
        {hasConfig
          ? 'Run your first scan to discover unmet needs and high-value opportunities.'
          : 'Discover high-value customer needs hiding in plain sight.'}
      </motion.p>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className='mb-10 grid w-full max-w-3xl grid-cols-3 gap-4'
      >
        {JTBD_FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
              className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm'
            >
              <div className='shrink-0 rounded-lg bg-white/10 p-2.5'>
                <Icon className='h-4 w-4 text-white/80' />
              </div>
              <div className='text-left'>
                <div className='text-sm font-medium text-white/90'>
                  {feature.title}
                </div>
                <div className='text-[11px] leading-tight text-white/40'>
                  {feature.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        onClick={hasConfig ? onTriggerScan : onConfigure}
        disabled={isTriggering}
        className={cn(
          'group relative overflow-hidden rounded-full px-8 py-4 font-semibold transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50',
          hasConfig
            ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
            : 'bg-white text-slate-950 hover:bg-white/95',
        )}
      >
        {/* Animated border trace */}
        <span className='absolute inset-0 rounded-full'>
          <span
            className='absolute inset-[-2px] rounded-full'
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg 300deg, rgba(255,255,255,0.8) 360deg)',
              animation: 'jtbd-spin 2s linear infinite',
            }}
          />
          <span
            className={cn(
              'absolute inset-[1px] rounded-full',
              hasConfig ? 'bg-emerald-400' : 'bg-white',
            )}
          />
        </span>

        {/* Button content */}
        <span className='relative flex items-center gap-3'>
          {hasConfig ? (
            <>
              <Radar
                className={cn('h-5 w-5', isTriggering && 'animate-spin')}
              />
              <span>
                {isTriggering ? 'Starting Scan...' : 'Run First Scan'}
              </span>
            </>
          ) : (
            <>
              <Zap className='h-5 w-5' />
              <span>Configure JTBD Area</span>
            </>
          )}
        </span>

        {/* Glow effect */}
        <div
          className='absolute -inset-4 -z-10 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-100'
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.button>

      {/* Help text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className='mt-6 max-w-md text-center text-xs text-white/30'
      >
        {hasConfig
          ? 'Scanning will analyze market signals and discover unmet customer needs. This can take a few minutes.'
          : 'Set up a monitoring area with rules to define which customer segments and markets to analyze.'}
      </motion.p>
    </div>

    {/* Spin animation for button border */}
    <style>{`
      @keyframes jtbd-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ============================================
// Scan Info Line
// ============================================

const formatScanDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ScanInfoLine: React.FC<{
  scans: IJTBDScan[];
  jobCount: number;
}> = ({ scans, jobCount }) => {
  const currentScan = scans.find((s) => s.isCurrent);
  if (!currentScan) return null;

  const pastScansCount = scans.filter(
    (s) => s.status === 'completed' && !s.isCurrent,
  ).length;

  return (
    <div className='flex items-center gap-3 text-[11px] text-white/40'>
      <div className='flex items-center gap-1.5'>
        <Calendar className='h-3 w-3' />
        <span>Scanned {formatScanDate(currentScan.scannedAt)}</span>
      </div>
      <span className='text-white/20'>·</span>
      <span>
        {jobCount} job{jobCount !== 1 ? 's' : ''} discovered
      </span>
      {pastScansCount > 0 && (
        <>
          <span className='text-white/20'>·</span>
          <span>
            {pastScansCount} prior scan{pastScansCount !== 1 ? 's' : ''}
          </span>
        </>
      )}
    </div>
  );
};

// ============================================
// Inner Canvas (uses view context)
// ============================================

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
  const { scans } = useJTBDScans(configUuid);
  const { scanProgress, startScanning } = useJTBDScanSocketEvents(configUuid);

  // Recover scan progress on page refresh
  const { activeScan } = useJTBDActiveScan(
    configUuid,
    !!activeConfig?.isScanning && !scanProgress.isScanning,
  );

  // Derive effective progress
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
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedJobUuid, setSelectedJobUuid] = useState<string | null>(null);
  const [filters, setFilters] = useState<JTBDFilters>({
    opportunitySize: 'ALL',
    evidenceStrength: 'ALL',
    audience: 'ALL',
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [failureDismissed, setFailureDismissed] = useState(false);
  const [pendingDescription, setPendingDescription] = useState('');

  const isLoading = isLoadingConfigs || (!!configUuid && isLoadingScan);

  // Show sticky bar when hero search bar is nearly scrolled out of view.
  // The search bar sits ~60% down the hero section (which is 100vh - 5rem).
  // Trigger when the search bar is close to the top — roughly when we've
  // scrolled past 50% of the visible height.
  const hasJobs = jobs.length > 0;
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = (): void => {
      const threshold = container.clientHeight * 0.5;
      setHasScrolled(container.scrollTop > threshold);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasJobs, effectiveProgress.isScanning]);

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

  const isEmptyState =
    !activeConfig ||
    (jobs.length === 0 &&
      !effectiveProgress.isScanning &&
      !activeConfig?.isScanning);

  // Determine which content to render
  const renderContent = (): React.ReactNode => {
    // Loading state
    if (isLoading) {
      return (
        <div className='relative h-full w-full overflow-auto'>
          <SkeletonCards />
        </div>
      );
    }

    // Empty states
    if (isEmptyState) {
      return (
        <div className='relative h-full w-full overflow-auto'>
          <EmptyState
            hasConfig={!!activeConfig}
            onConfigure={handleNewArea}
            onTriggerScan={handleTriggerScan}
            isTriggering={isTriggering}
          />
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
            className='relative h-[calc(100vh-5rem)] overflow-hidden'
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-32'>
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
                <p className='mx-auto max-w-lg text-xl text-white/60'>
                  {filteredJobs.length} unmet need
                  {filteredJobs.length !== 1 ? 's' : ''} discovered
                </p>
                {/* Config dropdown + rescan */}
                <div className='flex items-center justify-center gap-3 pt-2'>
                  <JTBDConfigDropdown isAdmin onNewArea={handleNewArea} />
                  <button
                    onClick={handleTriggerScan}
                    disabled={isTriggering || effectiveProgress.isScanning}
                    className='flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <Radar className='h-3.5 w-3.5' />
                    {isTriggering
                      ? 'Starting...'
                      : effectiveProgress.isScanning
                        ? 'Scanning...'
                        : 'Rescan'}
                  </button>
                </div>
                {/* Scan info */}
                <div className='flex justify-center pt-1'>
                  <ScanInfoLine scans={scans} jobCount={filteredJobs.length} />
                </div>
              </motion.div>

              {/* Landing search bar — opens create modal on Enter */}
              <motion.div
                ref={heroSearchRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className='mt-8 w-full max-w-lg px-6'
                style={{ pointerEvents: 'auto' }}
              >
                <div className='rounded-2xl border border-white/[0.1] bg-white/[0.05] backdrop-blur-xl'>
                  <div className='flex items-center gap-2 px-4 py-3'>
                    <Search className='h-5 w-5 shrink-0 text-white/40' />
                    <input
                      ref={searchInputRef}
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder='Describe a market to explore...'
                      className='h-9 flex-1 border-0 bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none'
                    />
                    {searchValue && (
                      <button
                        onClick={() => setSearchValue('')}
                        className='rounded-md p-1 transition-colors hover:bg-white/10'
                      >
                        <X className='h-4 w-4 text-white/40' />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    cardsRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className='mx-auto mt-4 flex cursor-pointer items-center justify-center gap-1.5 text-white/30 transition-colors hover:text-white/50'
                >
                  <ChevronDown className='h-3.5 w-3.5 animate-bounce' />
                  <span className='text-xs'>Scroll to See JTBD</span>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Cards section */}
          <div
            ref={cardsRef}
            className='min-h-screen px-8 pb-24 pt-8'
            style={{ scrollSnapAlign: 'start' }}
          >
            <JTBDMasonryColumns
              jobs={filteredJobs}
              selectedJobUuid={selectedJobUuid}
              onCardClick={handleCardClick}
              onIdeate={handleIdeate}
              ideatingJobUuid={ideatingJobUuid}
            />

            {filteredJobs.length === 0 && (
              <div className='py-20 text-center text-lg text-white/40'>
                No jobs match your current filters
              </div>
            )}
          </div>
        </div>

        {/* Sticky header — compact search bar + config dropdown */}
        <AnimatePresence>
          {hasScrolled && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.2 }}
              className='absolute right-4 top-3 z-40 flex w-full max-w-md items-center gap-2 rounded-full border border-white/[0.1] bg-black/60 px-3 py-1.5 backdrop-blur-xl'
            >
              <JTBDConfigDropdown isAdmin onNewArea={handleNewArea} />
              <div className='mx-1 h-4 w-px bg-white/10' />
              <Search className='h-3.5 w-3.5 shrink-0 text-white/40' />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder='Explore...'
                className='h-7 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none'
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className='rounded-md p-0.5 transition-colors hover:bg-white/10'
                >
                  <X className='h-3.5 w-3.5 text-white/40' />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

// ============================================
// Main JTBDCanvas (wraps with provider)
// ============================================

const JTBDCanvas: React.FC = () => (
  <JTBDViewProvider>
    <JTBDCanvasInner />
  </JTBDViewProvider>
);

export default JTBDCanvas;
