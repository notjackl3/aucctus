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
  ArrowRight,
  Calendar,
  ChevronDown,
  Crosshair,
  Puzzle,
  Radar,
  RefreshCw,
  Search,
  Settings,
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
import { OpportunityMap } from '@components/IdeaPlayground';

import { JTBDConfigPage } from './JTBDConfigPage';
import {
  type JTBDFilters,
  JTBDFilterBar,
  matchesAudience,
  matchesEvidenceStrength,
  matchesOpportunitySize,
} from './JTBDFilterBar';
import { JTBDMasonryColumns } from './JTBDMasonryColumns';

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
}> = ({ stage, progress, message, currentJob }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className='mx-8 mt-6 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 backdrop-blur-xl'
  >
    <div className='mb-3 flex items-center gap-3'>
      <Radar className='h-5 w-5 animate-pulse text-emerald-400' />
      <span className='text-sm font-semibold text-white/90'>
        Scanning for Jobs to Be Done
      </span>
      <span className='text-xs capitalize text-white/40'>{stage}</span>
    </div>
    <div className='mb-2 h-1.5 w-full rounded-full bg-white/[0.1]'>
      <motion.div
        className='h-1.5 rounded-full bg-emerald-400'
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
    <p className='text-xs text-white/50'>{message}</p>
    {currentJob && (
      <p className='mt-1 text-xs italic text-white/40'>
        Analyzing: {currentJob}
      </p>
    )}
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
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className='mx-8 mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.08] p-5 backdrop-blur-xl'
  >
    <div className='flex items-start justify-between'>
      <div className='flex items-start gap-3'>
        <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-red-400' />
        <div>
          <p className='text-sm font-semibold text-red-300'>Last scan failed</p>
          {errorMessage && (
            <p className='mt-1 text-xs text-red-300/60'>{errorMessage}</p>
          )}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className='flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', isRetrying && 'animate-spin')}
          />
          {isRetrying ? 'Starting...' : 'Retry Scan'}
        </button>
        <button
          onClick={onDismiss}
          className='rounded-md p-1 text-red-300/40 transition-colors hover:bg-red-500/10 hover:text-red-300/60'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
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
// Config Selector Dropdown
// ============================================

const ConfigSelector: React.FC<{
  configs: { uuid: string; name: string; rulesCount: number }[];
  activeUuid: string;
  onSelect: (uuid: string) => void;
  onEdit: (uuid: string) => void;
}> = ({ configs, activeUuid, onSelect, onEdit }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const active = configs.find((c) => c.uuid === activeUuid);
  if (configs.length <= 1) {
    // Single config — show as label with edit button
    return (
      <div className='flex items-center gap-2'>
        <Puzzle className='h-5 w-5 text-white/70' />
        <h1 className='text-xl font-bold text-white'>
          {active?.name ?? 'Jobs to Be Done'}
        </h1>
        {active && (
          <button
            onClick={() => onEdit(active.uuid)}
            className='rounded-md p-1 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/50'
            title='Edit config'
          >
            <Settings className='h-3.5 w-3.5' />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/[0.08]'
      >
        <Puzzle className='h-5 w-5 text-white/70' />
        <h1 className='text-xl font-bold text-white'>
          {active?.name ?? 'Jobs to Be Done'}
        </h1>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/40 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className='absolute left-0 top-full z-30 mt-1 min-w-[260px] overflow-hidden rounded-xl border border-white/15 bg-black/80 py-1 shadow-xl backdrop-blur-xl'
        >
          {configs.map((config) => {
            const isActive = config.uuid === activeUuid;
            return (
              <div
                key={config.uuid}
                className={cn(
                  'group/row flex w-full items-center gap-3 px-4 py-2.5 transition-colors',
                  isActive ? 'bg-white/10' : 'hover:bg-white/5',
                )}
              >
                <button
                  onClick={() => {
                    onSelect(config.uuid);
                    setOpen(false);
                  }}
                  className='flex flex-1 items-center gap-3 text-left'
                >
                  <div
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      isActive ? 'bg-emerald-400' : 'bg-white/20',
                    )}
                  />
                  <div className='flex-1'>
                    <div className='text-sm font-medium text-white/90'>
                      {config.name}
                    </div>
                  </div>
                  <span className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/40'>
                    {config.rulesCount} rules
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    onEdit(config.uuid);
                  }}
                  className='shrink-0 rounded-md p-1 text-white/20 opacity-0 transition-all hover:bg-white/10 hover:text-white/50 group-hover/row:opacity-100'
                  title='Edit config'
                >
                  <Settings className='h-3.5 w-3.5' />
                </button>
              </div>
            );
          })}
          {/* New config button */}
          <div className='border-t border-white/[0.08] px-4 pt-1'>
            <button
              onClick={() => {
                setOpen(false);
                onEdit('');
              }}
              className='flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white/60'
            >
              <span className='text-sm'>+</span>
              New Config
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

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
// Main JTBDCanvas (embeddable)
// ============================================

const JTBDCanvas: React.FC = () => {
  // Data hooks
  const { configs, isLoading: isLoadingConfigs } = useJTBDConfigs();

  // Config selection — default to first config
  const [selectedConfigUuid, setSelectedConfigUuid] = useState<string | null>(
    null,
  );
  const configUuid = selectedConfigUuid ?? configs[0]?.uuid ?? '';
  const activeConfig = configs.find((c) => c.uuid === configUuid) ?? null;

  // Auto-select first config when configs load
  useEffect(() => {
    if (!selectedConfigUuid && configs.length > 0) {
      setSelectedConfigUuid(configs[0].uuid);
    }
  }, [configs, selectedConfigUuid]);

  const { jobs, isLoading: isLoadingScan } = useJTBDCurrentScan(configUuid);
  const { scans } = useJTBDScans(configUuid);
  const { scanProgress, startScanning } = useJTBDScanSocketEvents(configUuid);

  // Recover scan progress on page refresh — fetch active scan when config says scanning
  const { activeScan } = useJTBDActiveScan(
    configUuid,
    !!activeConfig?.isScanning && !scanProgress.isScanning,
  );

  // Derive effective progress: prefer WS (real-time) > REST active scan > config.isScanning fallback
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

  // UI state — editConfigUuid: null = canvas, string = config page with that config pre-selected
  const [editConfigUuid, setEditConfigUuid] = useState<string | null>(null);
  const showConfig = editConfigUuid !== null;
  const [searchValue, setSearchValue] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedJobUuid, setSelectedJobUuid] = useState<string | null>(null);
  const [filters, setFilters] = useState<JTBDFilters>({
    opportunitySize: 'ALL',
    evidenceStrength: 'ALL',
    audience: 'ALL',
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [failureDismissed, setFailureDismissed] = useState(false);

  const isLoading = isLoadingConfigs || (!!configUuid && isLoadingScan);

  // Scroll detection — re-run when the scroll container mounts
  // (it doesn't exist during loading/empty early-return paths)
  const hasJobs = jobs.length > 0;
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = (): void => {
      setHasScrolled(container.scrollTop > 10);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasJobs, effectiveProgress.isScanning]);

  // Reset search/filters when switching configs
  const handleConfigSelect = useCallback((uuid: string) => {
    setSelectedConfigUuid(uuid);
    setSearchValue('');
    setCommittedQuery('');
    setSelectedJobUuid(null);
    setFailureDismissed(false);
    setFilters({
      opportunitySize: 'ALL',
      evidenceStrength: 'ALL',
      audience: 'ALL',
    });
  }, []);

  const showFailureBanner =
    !failureDismissed &&
    !effectiveProgress.isScanning &&
    activeConfig?.lastScanStatus === 'failed';

  // Search handlers
  const handleSearchSubmit = useCallback(() => {
    if (searchValue.trim()) {
      setCommittedQuery(searchValue.trim());
      cardsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchValue]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter') handleSearchSubmit();
    },
    [handleSearchSubmit],
  );

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    setCommittedQuery('');
  }, []);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let items = [...jobs];

    // Text search
    if (committedQuery) {
      const q = committedQuery.toLowerCase();
      items = items.filter(
        (j) =>
          j.jtbdTitle.toLowerCase().includes(q) ||
          j.persona.toLowerCase().includes(q) ||
          j.desire.toLowerCase().includes(q) ||
          j.summary.toLowerCase().includes(q),
      );
    }

    // Filter bar filters
    items = items.filter(
      (j) =>
        matchesOpportunitySize(j.opportunityScore, filters.opportunitySize) &&
        matchesEvidenceStrength(j.evidenceStrength, filters.evidenceStrength) &&
        matchesAudience(j.segment, filters.audience),
    );

    // Sort by opportunity score descending
    items.sort((a, b) => b.opportunityScore - a.opportunityScore);
    return items;
  }, [jobs, committedQuery, filters]);

  const handleCardClick = useCallback((job: IJTBDJob) => {
    setSelectedJobUuid((prev) => (prev === job.uuid ? null : job.uuid));
  }, []);

  const handleTriggerScan = useCallback(() => {
    if (configUuid) {
      triggerScan(configUuid);
    }
  }, [configUuid, triggerScan]);

  // Config view
  if (showConfig) {
    return (
      <div className='relative h-full w-full'>
        <JTBDConfigPage
          onBack={() => setEditConfigUuid(null)}
          initialConfigUuid={editConfigUuid || undefined}
        />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='relative h-full w-full overflow-auto'>
        <SkeletonCards />
      </div>
    );
  }

  // Empty states
  if (
    !activeConfig ||
    (jobs.length === 0 &&
      !effectiveProgress.isScanning &&
      !activeConfig?.isScanning)
  ) {
    return (
      <div className='relative h-full w-full overflow-auto'>
        <EmptyState
          hasConfig={!!activeConfig}
          onConfigure={() => setEditConfigUuid('')}
          onTriggerScan={handleTriggerScan}
          isTriggering={isTriggering}
        />
        <AnimatePresence>
          {effectiveProgress.isScanning && (
            <ScanProgressBanner
              stage={effectiveProgress.stage}
              progress={effectiveProgress.progress}
              message={effectiveProgress.message}
              currentJob={effectiveProgress.currentJob}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showFailureBanner && (
            <ScanFailureBanner
              errorMessage={activeConfig?.lastScanError}
              onRetry={handleTriggerScan}
              isRetrying={isTriggering}
              onDismiss={() => setFailureDismissed(true)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Show OpportunityMap when a seed is in the URL (from JTBD concept ideation)
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
        {/* Landing hero section — full viewport snap point */}
        <div
          className='relative h-[calc(100vh-5rem)] overflow-hidden'
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* Centered hero content */}
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
              <h1 className='text-5xl font-bold text-white'>Jobs to Be Done</h1>
              <p className='mx-auto max-w-lg text-xl text-white/60'>
                {filteredJobs.length} unmet need
                {filteredJobs.length !== 1 ? 's' : ''} discovered
              </p>
              {/* Config selector + rescan */}
              <div className='flex items-center justify-center gap-3 pt-2'>
                {configs.length > 1 && (
                  <ConfigSelector
                    configs={configs}
                    activeUuid={configUuid}
                    onSelect={handleConfigSelect}
                    onEdit={(uuid) => setEditConfigUuid(uuid)}
                  />
                )}
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

            {/* Landing search bar */}
            <motion.div
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
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder='Search for jobs, pain, or customers'
                    className='h-9 flex-1 border-0 bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none'
                  />
                  {searchValue && (
                    <>
                      <button
                        onClick={handleClearSearch}
                        className='rounded-md p-1 transition-colors hover:bg-white/10'
                      >
                        <X className='h-4 w-4 text-white/40' />
                      </button>
                      <button
                        onClick={handleSearchSubmit}
                        className='flex shrink-0 items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/25'
                      >
                        Search <ArrowRight className='h-3 w-3' />
                      </button>
                    </>
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

        {/* Cards section — snaps to top */}
        <div
          ref={cardsRef}
          className='min-h-screen px-8 pb-24 pt-8'
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* Masonry grid of job cards */}
          <JTBDMasonryColumns
            jobs={filteredJobs}
            selectedJobUuid={selectedJobUuid}
            onCardClick={handleCardClick}
            onIdeate={handleIdeate}
            ideatingJobUuid={ideatingJobUuid}
          />

          {filteredJobs.length === 0 && (
            <div className='py-20 text-center text-lg text-white/40'>
              No jobs match your current search
            </div>
          )}
        </div>
      </div>

      {/* Sticky header — slides down when scrolled, absolute over content */}
      <AnimatePresence>
        {hasScrolled && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.25 }}
            className='absolute left-4 right-4 top-3 z-40 rounded-xl bg-black/60 px-6 py-4 backdrop-blur-xl'
          >
            <div className='mb-1 flex items-center gap-4'>
              <ConfigSelector
                configs={configs}
                activeUuid={configUuid}
                onSelect={handleConfigSelect}
                onEdit={(uuid) => setEditConfigUuid(uuid)}
              />
              <div className='flex-1' />
              <ScanInfoLine scans={scans} jobCount={filteredJobs.length} />
              <button
                onClick={() => setEditConfigUuid(configUuid)}
                className='rounded-lg p-2 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/60'
              >
                <Settings className='h-4 w-4' />
              </button>
              <button
                onClick={handleTriggerScan}
                disabled={isTriggering || effectiveProgress.isScanning}
                className='flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Radar className='h-3.5 w-3.5' />
                {isTriggering ? 'Starting...' : 'Scan'}
              </button>
            </div>
            <JTBDFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={jobs.length}
              filteredCount={filteredJobs.length}
              instanceId='sticky'
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan progress banner — absolute overlay */}
      <AnimatePresence>
        {effectiveProgress.isScanning && (
          <div
            className={cn(
              'absolute left-0 right-0 z-30',
              hasScrolled ? 'top-24' : 'top-4',
            )}
          >
            <ScanProgressBanner
              stage={effectiveProgress.stage}
              progress={effectiveProgress.progress}
              message={effectiveProgress.message}
              currentJob={effectiveProgress.currentJob}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Scan failure banner — absolute overlay */}
      <AnimatePresence>
        {showFailureBanner && (
          <div
            className={cn(
              'absolute left-0 right-0 z-30',
              hasScrolled ? 'top-24' : 'top-4',
            )}
          >
            <ScanFailureBanner
              errorMessage={activeConfig?.lastScanError}
              onRetry={handleTriggerScan}
              isRetrying={isTriggering}
              onDismiss={() => setFailureDismissed(true)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Floating search bar — visible in scrolled state */}
      <AnimatePresence>
        {hasScrolled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className='pointer-events-none absolute bottom-6 left-0 right-0 z-50 flex justify-center'
          >
            <div className='pointer-events-auto'>
              <div className='rounded-2xl border border-white/[0.1] bg-black/60 backdrop-blur-xl'>
                <div className='flex items-center gap-2 px-4 py-2'>
                  <Search className='h-4 w-4 shrink-0 text-white/40' />
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder='Search for jobs, pain, or customers'
                    className='h-7 w-[280px] border-0 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none'
                  />
                  {searchValue && (
                    <>
                      <button
                        onClick={handleClearSearch}
                        className='rounded-md p-1 transition-colors hover:bg-white/10'
                      >
                        <X className='h-3.5 w-3.5 text-white/40' />
                      </button>
                      <button
                        onClick={() => {
                          if (searchValue.trim())
                            setCommittedQuery(searchValue.trim());
                        }}
                        className='flex shrink-0 items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white transition-all hover:bg-white/25'
                      >
                        Search <ArrowRight className='h-3 w-3' />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JTBDCanvas;
