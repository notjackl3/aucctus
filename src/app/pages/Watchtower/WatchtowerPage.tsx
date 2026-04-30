import images from '@assets/img';
import { ConceptReportSkeletons, Loading } from '@components';
import { useAccountLogo } from '@hooks/query/admin.hook';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  WatchtowerFeatureHighlight,
  WatchtowerInitiationBadge,
} from './components';
import {
  ConceptOpportunitiesWidget,
  CreateWatchtowerModal,
  FutureDomainsWidget,
  FuturePredictionsWidget,
  RadarSweep,
  SignalCarouselWidget,
  SignalTrendsWidget,
  WatchtowerInitiation,
  WatchtowerViewDropdown,
} from './components';
import SignalHistoryPopover from './components/SignalHistoryPopover';
import {
  WatchtowerViewProvider,
  useWatchtowerView,
} from './WatchtowerViewContext';
import { useWatchtowerUrlSync } from './hooks/useWatchtowerUrlSync';

import {
  useAddWatchtowerConfigRule,
  useCreateMonitoringRule,
  useDeleteMonitoringRule,
  useDeleteWatchtowerConfigRule,
  useRefreshWatchtower,
  useToggleSignalTracking,
  useWatchtowerConfigs,
  useWatchtowerDashboard,
  useWatchtowerSocketEvents,
} from '@hooks/query/watchtower.hook';
import type { IWatchtowerSignal } from '@libs/api/types/watchtower';
import { DynamicIcon } from '@libs/utils/iconMap';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Layers,
  Lightbulb,
  Plus,
  Settings,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Signal, SignalCategory, SignalType } from './types';
import { signalCategoryConfig, signalTypeConfig } from './types';

/**
 * Transform API signal to local Signal type
 */
const transformSignal = (apiSignal: IWatchtowerSignal): Signal => ({
  id: apiSignal.id,
  title: apiSignal.title,
  type: apiSignal.type,
  category: apiSignal.category,
  confidence: apiSignal.confidence,
  timeHorizon: apiSignal.timeHorizon,
  timeHorizonLabel: apiSignal.timeHorizonLabel,
  radarDistance: apiSignal.radarDistance,
  radarAngle: apiSignal.radarAngle,
  recommendedAction: apiSignal.recommendedAction,
  whatChanged: apiSignal.whatChanged,
  whyItMatters: apiSignal.whyItMatters,
  likelyImpact: apiSignal.likelyImpact,
  isNew: apiSignal.isNew,
  isTracked: apiSignal.isTracked,
  dateAdded: apiSignal.dateAdded,
  evidence: apiSignal.evidence,
  sources: apiSignal.sources,
  conceptImpacts: apiSignal.conceptImpacts,
  conceptImpactEvaluatedAt: apiSignal.conceptImpactEvaluatedAt,
});

/**
 * Half-radius radar component with center hub
 */
const SignalRadar: React.FC<{
  signals: Signal[];
  selectedSignal: Signal | null;
  onSelectSignal: (signal: Signal) => void;
  filter: 'all' | SignalType;
  categoryFilter: 'all' | SignalCategory;
  height?: number;
  introComplete?: boolean;
  companyLogoUrl?: string;
}> = ({
  signals,
  selectedSignal,
  onSelectSignal,
  filter,
  categoryFilter,
  height: containerHeight = 480,
  introComplete = true,
  companyLogoUrl,
}) => {
  const [staggerComplete, setStaggerComplete] = useState(false);

  // After intro stagger finishes, disable delays so select/deselect is instant
  useEffect(() => {
    if (introComplete && !staggerComplete) {
      const maxStaggerDelay = 0.6 + signals.length * 0.08;
      const timer = setTimeout(
        () => setStaggerComplete(true),
        maxStaggerDelay * 1000 + 300,
      );
      return () => clearTimeout(timer);
    }
  }, [introComplete, staggerComplete, signals.length]);

  let filteredSignals =
    filter === 'all' ? signals : signals.filter((s) => s.type === filter);
  if (categoryFilter !== 'all') {
    filteredSignals = filteredSignals.filter(
      (s) => s.category === categoryFilter,
    );
  }

  // SVG dimensions
  const width = 1600;
  const height = containerHeight;

  const centerX = width / 2;
  const topPadding = 60;
  const bottomPadding = 30;
  const centerY = height - bottomPadding;

  // Radar dimensions - more circular for head-on view
  const maxRadiusY = Math.max(centerY - topPadding, 100);
  const maxRadiusX = Math.min(width / 2 - 60, maxRadiusY * 1.15);

  // Center hub radius (for logo) - larger for better logo visibility
  const hubRadius = maxRadiusY * 0.22;

  // Create arc paths for the radar rings (elliptical)
  const createArcPath = (rx: number, ry: number) => {
    const startX = centerX - rx;
    const startY = centerY;
    const endX = centerX + rx;
    const endY = centerY;
    return `M ${startX} ${startY} A ${rx} ${ry} 0 0 1 ${endX} ${endY}`;
  };

  // Convert signal position to SVG coordinates (elliptical polar mapping)
  const getSignalPosition = (signal: Signal) => {
    const minRadius = 0.18;
    const radiusX =
      maxRadiusX * (minRadius + signal.radarDistance * (1 - minRadius));
    const radiusY =
      maxRadiusY * (minRadius + signal.radarDistance * (1 - minRadius));
    const radians = (signal.radarAngle * Math.PI) / 180;

    return {
      x: centerX + radiusX * Math.cos(Math.PI - radians),
      y: centerY - radiusY * Math.sin(Math.PI - radians),
    };
  };

  // Number of concentric rings for visual effect
  const ringCount = 6;

  return (
    <div className='relative h-full w-full'>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className='h-full w-full'
        preserveAspectRatio='xMidYMid slice'
      >
        <defs>
          {/* Gradient for center hub - dark background behind logo */}
          <radialGradient
            id='hubGradient'
            cx='50%'
            cy='50%'
            r='50%'
            fx='50%'
            fy='50%'
          >
            <stop offset='0%' stopColor='rgba(15, 10, 10, 1)' />
            <stop offset='70%' stopColor='rgba(20, 14, 12, 1)' />
            <stop offset='100%' stopColor='rgba(28, 18, 15, 0.95)' />
          </radialGradient>

          {/* Outer urgency glow ring - brand red, larger radius */}
          <radialGradient
            id='urgencyGlow'
            cx='50%'
            cy='100%'
            r='100%'
            fx='50%'
            fy='100%'
          >
            <stop offset='0%' stopColor='hsla(0, 84%, 60%, 0.35)' />
            <stop offset='20%' stopColor='hsla(0, 84%, 55%, 0.2)' />
            <stop offset='50%' stopColor='hsla(0, 84%, 50%, 0.08)' />
            <stop offset='100%' stopColor='hsla(0, 84%, 50%, 0)' />
          </radialGradient>

          {/* Inner hub glow for urgency - brand red, subtle */}
          <radialGradient
            id='hubUrgencyGlow'
            cx='50%'
            cy='50%'
            r='50%'
            fx='50%'
            fy='30%'
          >
            <stop offset='0%' stopColor='hsla(0, 84%, 65%, 0.4)' />
            <stop offset='40%' stopColor='hsla(0, 84%, 60%, 0.2)' />
            <stop offset='100%' stopColor='hsla(0, 84%, 55%, 0)' />
          </radialGradient>

          {/* Glow filter for new signals */}
          <filter id='newGlow' x='-100%' y='-100%' width='300%' height='300%'>
            <feGaussianBlur stdDeviation='6' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>

          {/* Glow filter for selected signal */}
          <filter
            id='selectedGlow'
            x='-50%'
            y='-50%'
            width='200%'
            height='200%'
          >
            <feGaussianBlur stdDeviation='4' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>

          {/* Very subtle pulse animation - barely noticeable */}
          <style>
            {`
              @keyframes subtlePulse {
                0%, 100% { opacity: 0.85; }
                50% { opacity: 0.75; }
              }
            `}
          </style>
        </defs>

        {/* Radar sweep using framer-motion for smooth ellipse-following animation */}
        <RadarSweep
          centerX={centerX}
          centerY={centerY}
          maxRadiusX={maxRadiusX}
          maxRadiusY={maxRadiusY}
        />

        {/* Multiple concentric rings for depth effect - animated draw-in */}
        {Array.from({ length: ringCount }, (_, i) => {
          const ratio = (i + 1) / ringCount;
          const opacity = 0.08 + i * 0.03;
          const pathD = createArcPath(maxRadiusX * ratio, maxRadiusY * ratio);
          return (
            <motion.path
              key={i}
              d={pathD}
              fill='none'
              stroke={`rgba(148, 163, 184, ${opacity})`}
              strokeWidth='1'
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                introComplete
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                pathLength: { duration: 0.8, delay: i * 0.1, ease: 'easeOut' },
                opacity: { duration: 0.3, delay: i * 0.1 },
              }}
            />
          );
        })}

        {/* Subtle radial spokes - animated draw-in */}
        {[0, 30, 60, 90, 120, 150, 180].map((angle, index) => {
          const radians = (angle * Math.PI) / 180;
          const innerX =
            centerX + hubRadius * 1.2 * Math.cos(Math.PI - radians);
          const innerY =
            centerY - hubRadius * 1.2 * Math.sin(Math.PI - radians);
          const outerX = centerX + maxRadiusX * Math.cos(Math.PI - radians);
          const outerY = centerY - maxRadiusY * Math.sin(Math.PI - radians);
          return (
            <motion.line
              key={angle}
              x1={innerX}
              y1={innerY}
              x2={outerX}
              y2={outerY}
              stroke='rgba(148, 163, 184, 0.08)'
              strokeWidth='1'
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                introComplete
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                pathLength: {
                  duration: 0.5,
                  delay: 0.3 + index * 0.05,
                  ease: 'easeOut',
                },
                opacity: { duration: 0.2, delay: 0.3 + index * 0.05 },
              }}
            />
          );
        })}

        {/* Subtle urgency glow behind center - larger radius extending into radar */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={maxRadiusX * 0.65}
          ry={maxRadiusY * 0.65}
          fill='url(#urgencyGlow)'
          opacity='0.9'
        />

        {/* Pulsing glow ring around hub - very subtle, barely noticeable */}
        <circle
          cx={centerX}
          cy={centerY}
          r={hubRadius * 2.2}
          fill='url(#hubUrgencyGlow)'
          style={{
            animation: 'subtlePulse 10s ease-in-out infinite',
          }}
        />

        {/* Center hub - clean circle without stroke */}
        <circle
          cx={centerX}
          cy={centerY}
          r={hubRadius}
          fill='url(#hubGradient)'
        />

        {/* Company logo centered in the hub */}
        <foreignObject
          x={centerX - hubRadius * 0.7}
          y={centerY - hubRadius * 0.85}
          width={hubRadius * 1.4}
          height={hubRadius * 0.8}
        >
          <div
            className='flex h-full w-full items-center justify-center'
            style={{ backgroundColor: 'transparent' }}
          >
            {companyLogoUrl && (
              <img
                src={companyLogoUrl}
                alt='Client Logo'
                className='h-full w-auto max-w-full object-contain'
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </foreignObject>

        {/* Signal dots with category icons */}
        {filteredSignals.map((signal, index) => {
          const pos = getSignalPosition(signal);
          const config = signalTypeConfig[signal.type];
          const isSelected = selectedSignal?.id === signal.id;
          const isNew = signal.isNew;
          const dotSize = isSelected ? 16 : 12;
          const iconSize = dotSize * 1.2;

          return (
            <g
              key={signal.id}
              onClick={() => onSelectSignal(signal)}
              className='cursor-pointer'
              filter={
                isNew
                  ? 'url(#newGlow)'
                  : isSelected
                    ? 'url(#selectedGlow)'
                    : undefined
              }
            >
              {/* Main signal dot with bubble animation */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={dotSize}
                fill={config.color}
                stroke='rgba(255,255,255,0.3)'
                strokeWidth='1.5'
                initial={{ r: 0, opacity: 0 }}
                animate={
                  introComplete
                    ? { r: dotSize, opacity: 1 }
                    : { r: 0, opacity: 0 }
                }
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 12,
                  delay: staggerComplete ? 0.3 : 0.6 + index * 0.08,
                  cx: { duration: 0 },
                  cy: { duration: 0 },
                }}
              />
              {/* Selection ring */}
              {isSelected && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  fill='none'
                  stroke='rgba(255,255,255,0.6)'
                  strokeWidth='2'
                  initial={{ r: 0, opacity: 0 }}
                  animate={
                    introComplete
                      ? { r: dotSize + 8, opacity: 1 }
                      : { r: 0, opacity: 0 }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 12,
                    cx: { duration: 0 },
                    cy: { duration: 0 },
                  }}
                />
              )}

              {/* Category icon inside dot */}
              <motion.foreignObject
                x={pos.x - iconSize / 2}
                y={pos.y - iconSize / 2}
                width={iconSize}
                height={iconSize}
                className='pointer-events-none'
                initial={{ opacity: 0 }}
                animate={introComplete ? { opacity: 1 } : { opacity: 0 }}
                transition={{
                  delay: staggerComplete ? 0 : 0.6 + index * 0.08 + 0.1,
                }}
              >
                <div className='flex h-full w-full items-center justify-center'>
                  <DynamicIcon
                    variant={
                      signalCategoryConfig[signal.category].iconVariant as any
                    }
                    height={iconSize * 0.65}
                    width={iconSize * 0.65}
                    className='stroke-white'
                  />
                </div>
              </motion.foreignObject>

              {/* Small blue dot indicator for new signals - rendered last to be on top */}
              {isNew && !isSelected && (
                <motion.circle
                  cx={pos.x + dotSize * 0.8}
                  cy={pos.y - dotSize * 0.8}
                  r={3.6}
                  fill='#1570EF'
                  initial={{ r: 0, opacity: 0 }}
                  animate={
                    introComplete
                      ? { r: 3.6, opacity: 1 }
                      : { r: 0, opacity: 0 }
                  }
                  transition={{
                    delay: staggerComplete ? 0 : 0.6 + index * 0.08 + 0.15,
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Time horizon labels - ACT NOW (inner) and MONITOR (outer) */}
        <text
          x={centerX}
          y={centerY - maxRadiusY * 0.25}
          textAnchor='middle'
          className='text-[11px] font-medium tracking-wider'
          fill='rgba(255,255,255,0.35)'
        >
          ACT NOW
        </text>
        <text
          x={centerX}
          y={centerY - maxRadiusY + 30}
          textAnchor='middle'
          className='text-[11px] font-medium tracking-wider'
          fill='rgba(255,255,255,0.35)'
        >
          MONITOR
        </text>
      </svg>
    </div>
  );
};

/**
 * Main Watchtower Page Component (internal)
 */
const WatchtowerPageContent: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeWatchtowerConfigUuid,
    setActiveWatchtowerConfigUuid,
    selectedScanUuid,
    setSelectedScanUuid,
    showCreateModal,
    setShowCreateModal,
  } = useWatchtowerView();

  // Bind aucctus:// internal-citation deep-link params (`?scan=`, `?signal=`,
  // `?pattern=`). The hook syncs `?scan=` into WatchtowerViewContext on
  // mount; signal/pattern are plumbed for downstream UI.
  const {
    signalUuid: _deepLinkedSignalUuid,
    patternUuid: _deepLinkedPatternUuid,
  } = useWatchtowerUrlSync();
  void _deepLinkedSignalUuid;
  void _deepLinkedPatternUuid;

  // Check if current user is admin
  const { user } = useStore((state: any) => state.auth);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Get account logo from dedicated API endpoint
  const { logoUrl } = useAccountLogo();
  const companyLogoUrl = logoUrl || undefined;

  // Fetch watchtower configs for the account
  const { watchtowerConfigs } = useWatchtowerConfigs();

  // Fetch dashboard data from API with concept impacts, scoped by custom watchtower
  const {
    signals: apiSignals,
    monitoringRules,
    lastRefreshedAt,
    activeScan,
    isLoading,
  } = useWatchtowerDashboard(selectedScanUuid, activeWatchtowerConfigUuid);

  // WebSocket events for real-time updates (activeScan seeds progress on page load)
  const { getScanProgress, startScanning, removeTowerProgress } =
    useWatchtowerSocketEvents(activeScan, activeWatchtowerConfigUuid);
  const scanProgress = getScanProgress(activeWatchtowerConfigUuid);

  // Mutations for refresh and rules
  const { refresh: triggerRefresh, isRefreshing } = useRefreshWatchtower(
    activeWatchtowerConfigUuid,
  );
  const { createRule, isCreating: isCreatingRule } = useCreateMonitoringRule();
  const { addConfigRuleAsync, isCreating: isCreatingConfigRule } =
    useAddWatchtowerConfigRule();
  const { deleteRule, isDeleting: isDeletingRule } = useDeleteMonitoringRule();
  const { deleteConfigRuleAsync, isDeleting: isDeletingConfigRule } =
    useDeleteWatchtowerConfigRule();
  const { toggleTracking } = useToggleSignalTracking();

  // Transform API signals to local Signal type
  const signals = useMemo(() => apiSignals.map(transformSignal), [apiSignals]);

  // Derive pinned signal IDs from API data (isTracked field)
  const pinnedSignalIds = useMemo(
    () => signals.filter((s) => s.isTracked).map((s) => s.id),
    [signals],
  );

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [filter, setFilter] = useState<'all' | SignalType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SignalCategory>(
    'all',
  );
  const [openPinnedSignal, setOpenPinnedSignal] = useState<Signal | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [newRule, setNewRule] = useState('');
  // Category dropdown state managed by Radix DropdownMenu
  const [scanStartTime, setScanStartTime] = useState<number | undefined>(
    undefined,
  );

  // Reset filters when switching towers so "All Towers" doesn't
  // carry over a stale type/category filter from a specific tower.
  useEffect(() => {
    setFilter('all');
    setCategoryFilter('all');
    setSelectedSignal(null);
  }, [activeWatchtowerConfigUuid]);

  // Set selected signal to first signal when data loads
  useEffect(() => {
    if (signals.length > 0 && !selectedSignal) {
      setSelectedSignal(signals[0]);
    }
  }, [signals, selectedSignal]);

  // Parse lastRefreshedAt from API
  const lastUpdated = useMemo(() => {
    if (lastRefreshedAt) {
      return new Date(lastRefreshedAt);
    }
    return new Date();
  }, [lastRefreshedAt]);

  const handleRefresh = useCallback(() => {
    startScanning(activeWatchtowerConfigUuid); // Start showing progress immediately
    triggerRefresh(activeWatchtowerConfigUuid);
  }, [triggerRefresh, startScanning, activeWatchtowerConfigUuid]);

  // Determine if we're in a scanning state (either from mutation or WebSocket)
  const isScanningActive = isRefreshing || scanProgress.isScanning;

  const handlePinSignal = useCallback(
    (signal: Signal) => {
      // Toggle the tracking status via API
      const newIsTracked = !signal.isTracked;
      toggleTracking({ signalId: signal.id, isTracked: newIsTracked });
    },
    [toggleTracking],
  );

  const pinnedSignals = useMemo(() => {
    return signals.filter((s) => s.isTracked);
  }, [signals]);

  const filteredSignals = useMemo(() => {
    let result =
      filter === 'all' ? signals : signals.filter((s) => s.type === filter);
    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter);
    }
    return result;
  }, [signals, filter, categoryFilter]);

  const counts = useMemo(
    () => ({
      all: signals.length,
      threat: signals.filter((s) => s.type === 'threat').length,
      opportunity: signals.filter((s) => s.type === 'opportunity').length,
      watch: signals.filter((s) => s.type === 'watch').length,
    }),
    [signals],
  );

  const categoryCounts = useMemo(
    () => ({
      all: signals.length,
      competition: signals.filter((s) => s.category === 'competition').length,
      market: signals.filter((s) => s.category === 'market').length,
      technology: signals.filter((s) => s.category === 'technology').length,
      regulatory: signals.filter((s) => s.category === 'regulatory').length,
      capital: signals.filter((s) => s.category === 'capital').length,
    }),
    [signals],
  );

  const handleAddRule = useCallback(async () => {
    if (newRule.trim()) {
      try {
        if (activeWatchtowerConfigUuid) {
          await addConfigRuleAsync({
            configUuid: activeWatchtowerConfigUuid,
            ruleText: newRule.trim(),
          });
        } else {
          await createRule(newRule.trim());
        }
        setNewRule('');
      } catch {
        // Error toast handled by hook's onError
      }
    }
  }, [newRule, createRule, addConfigRuleAsync, activeWatchtowerConfigUuid]);

  const handleRemoveRule = useCallback(
    async (ruleUuid: string) => {
      if (activeWatchtowerConfigUuid) {
        await deleteConfigRuleAsync({
          configUuid: activeWatchtowerConfigUuid,
          ruleUuid,
        });
      } else {
        await deleteRule(ruleUuid);
      }
    },
    [deleteRule, deleteConfigRuleAsync, activeWatchtowerConfigUuid],
  );

  // Resizable radar section
  const [radarHeight, setRadarHeight] = useState(
    Math.round(window.innerHeight * 0.8),
  );
  const isResizing = useRef(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true;
      resizeStartY.current = e.clientY;
      resizeStartHeight.current = radarHeight;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [radarHeight],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientY - resizeStartY.current;
      const newHeight = Math.max(
        200,
        Math.min(window.innerHeight * 0.9, resizeStartHeight.current + delta),
      );
      setRadarHeight(newHeight);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSelectSignal = (signal: Signal) => {
    setSelectedSignal(signal);
  };

  // Determine if this is the first run (no scan has ever been done)
  const isFirstRun = !lastRefreshedAt && apiSignals.length === 0;

  // Feature initiation configuration for first-run experience
  const watchtowerFeatures: WatchtowerFeatureHighlight[] = [
    {
      icon: 'search-refraction',
      title: 'See Disruption Early',
      description: 'Scan and surface external',
      subDescription: 'signals in real time',
    },
    {
      icon: 'trending-up',
      title: 'Predict Impact of Change',
      description: 'Connect signals to your',
      subDescription: 'innovation portfolio',
    },
    {
      icon: 'rocket',
      title: 'Move Before Others',
      description: 'Respond first and plan ahead',
      subDescription: "for what's next",
    },
  ];

  const watchtowerBadges: WatchtowerInitiationBadge[] = [
    {
      icon: 'star-01',
      text: 'Premium Add-On',
      variant: 'premium',
    },
    {
      text: 'Available Now',
      variant: 'status',
      statusColor: 'green',
    },
  ];

  // Handle first-run initialization
  const handleFirstRunInitialize = useCallback(() => {
    // Auto-select the first available config so the user lands on it
    const defaultConfig = watchtowerConfigs[0];
    const configUuid = defaultConfig?.uuid;
    if (configUuid) {
      setActiveWatchtowerConfigUuid(configUuid);
    }

    // Set scan start time for progress bar
    setScanStartTime(Date.now());
    // Trigger the scan, passing configUuid directly to bypass stale closure
    startScanning(configUuid);
    triggerRefresh(configUuid);
  }, [
    startScanning,
    triggerRefresh,
    watchtowerConfigs,
    setActiveWatchtowerConfigUuid,
  ]);

  // Determine which content to render based on current state.
  // The modal is rendered unconditionally below all branches.
  let content: React.ReactNode;

  // Show loading state while fetching data
  if (isLoading) {
    content = (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loading />
          <p className='aucctus-text-secondary text-sm'>
            Loading Watchtower data...
          </p>
        </div>
      </div>
    );
  } else if (isFirstRun && !isScanningActive && !activeWatchtowerConfigUuid) {
    // Show first-run initiation screen if user has never run a scan (default tower only)
    content = (
      <WatchtowerInitiation
        icon='signal-02'
        title='Watchtower'
        subtitle='Signal Intelligence System'
        features={watchtowerFeatures}
        badges={watchtowerBadges}
        ctaText='Initialize Watchtower'
        ctaLoadingText='Initializing...'
        helpText='First-time initialization will scan and index available market signals. This process can take up to 10 minutes.'
        onInitialize={handleFirstRunInitialize}
        isInitializing={isScanningActive}
        isAdmin={isAdmin}
      />
    );
  } else if (isFirstRun && isScanningActive) {
    // Show skeleton during first-run initialization scanning
    content = (
      <div className='aucctus-bg-primary min-h-screen'>
        {/* Radar section with animated intro during first scan */}
        <div className='relative overflow-hidden border-b border-white/10'>
          {/* Brand gradient background image */}
          <div
            className='absolute inset-0 bg-cover bg-center bg-no-repeat'
            style={{
              backgroundImage: `url(${images.nucleusBrandGradient})`,
              filter: 'blur(2px)',
            }}
          />
          {/* Dark overlay */}
          <div
            className='absolute inset-0'
            style={{
              backgroundColor: 'rgba(20, 10, 10, 0.55)',
              mixBlendMode: 'multiply',
            }}
          />
          {/* Subtle radial glow effect */}
          <div className='bg-gradient-radial from-primary/10 absolute inset-0 via-transparent to-transparent opacity-50' />

          {/* Tower switcher dropdown overlaid on radar */}
          <motion.div
            className='absolute left-6 top-6 z-10 flex items-center gap-1.5'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
            <WatchtowerViewDropdown
              onDeleted={removeTowerProgress}
              isAdmin={isAdmin}
            />
          </motion.div>

          {/* Radar visualization during first scan */}
          <div className='relative flex' style={{ height: radarHeight }}>
            <div className='flex-1 overflow-hidden'>
              <SignalRadar
                signals={[]}
                selectedSignal={null}
                onSelectSignal={() => {}}
                filter='all'
                categoryFilter='all'
                height={radarHeight}
                companyLogoUrl={companyLogoUrl}
              />
            </div>
          </div>
        </div>

        {/* Skeleton widgets below the radar */}
        <ConceptReportSkeletons.WatchtowerSkeleton
          progressMessage={scanProgress.message || 'Discovering signals...'}
          progressPercent={scanProgress.progress}
          startTime={scanStartTime}
        />
      </div>
    );
  } else {
    content = (
      <div className='aucctus-bg-primary min-h-screen overflow-clip'>
        {/* Edge-to-edge resizable radar section with brand gradient background */}
        <div className='relative overflow-hidden border-b border-white/10'>
          {/* Brand gradient background image */}
          <div
            className='absolute inset-0 bg-cover bg-center bg-no-repeat'
            style={{
              backgroundImage: `url(${images.nucleusBrandGradient})`,
              filter: 'blur(2px)',
            }}
          />
          {/* Dark overlay */}
          <div
            className='absolute inset-0'
            style={{
              backgroundColor: 'rgba(20, 10, 10, 0.55)',
              mixBlendMode: 'multiply',
            }}
          />
          {/* Subtle radial glow effect */}
          <div className='bg-gradient-radial from-primary/10 absolute inset-0 via-transparent to-transparent opacity-50' />

          {/* Filter pills overlaid on radar - glassmorphic style */}
          <motion.div
            className='absolute left-6 top-6 z-10 flex items-center gap-1.5'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Watchtower view switcher dropdown */}
            <WatchtowerViewDropdown
              onDeleted={removeTowerProgress}
              isAdmin={isAdmin}
            />

            {/* Separator */}
            <div className='h-5 w-px bg-white/20' />

            {/* Signal type filter dropdown */}
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  className={cn(
                    'inline-flex select-none items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all duration-200',
                    filter !== 'all'
                      ? filter === 'threat'
                        ? 'border-red-400/40 bg-red-500/25 shadow-lg hover:bg-red-500/35'
                        : filter === 'opportunity'
                          ? 'border-green-400/40 bg-green-500/25 shadow-lg hover:bg-green-500/35'
                          : 'border-white/30 bg-white/15 shadow-lg hover:bg-white/20'
                      : 'border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15',
                  )}
                >
                  {filter === 'all' && (
                    <Eye size={12} className='text-white/60' />
                  )}
                  {filter === 'threat' && (
                    <AlertTriangle size={12} className='text-red-400' />
                  )}
                  {filter === 'opportunity' && (
                    <Sparkles size={12} className='text-green-400' />
                  )}
                  {filter === 'watch' && (
                    <Eye size={12} className='text-white/70' />
                  )}
                  <span className='text-white/90'>
                    {filter === 'all'
                      ? 'All Types'
                      : signalTypeConfig[filter].label}
                  </span>
                  <ChevronDown size={12} className='text-white/40' />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align='start'
                  sideOffset={10}
                  className='z-50 w-44 rounded-lg border border-white/15 bg-black/95 p-1 shadow-2xl backdrop-blur-xl'
                >
                  {(
                    [
                      ['all', 'All Types', Eye, null],
                      ['threat', 'Threats', AlertTriangle, 'text-red-400'],
                      [
                        'opportunity',
                        'Opportunities',
                        Sparkles,
                        'text-green-400',
                      ],
                      ['watch', 'Neutral', Eye, null],
                    ] as const
                  ).map(([key, label, Icon, iconColor]) => (
                    <DropdownMenu.Item
                      key={key}
                      onSelect={() => setFilter(key as 'all' | SignalType)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-white/90 outline-none hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white',
                        filter === key && 'bg-white/10',
                      )}
                    >
                      <div className='flex items-center gap-2'>
                        <Icon
                          className={cn(
                            'h-3.5 w-3.5',
                            iconColor || 'text-white/50',
                          )}
                        />
                        <span className='text-xs'>{label}</span>
                        <span className='text-[10px] text-white/40'>
                          {counts[key as keyof typeof counts]}
                        </span>
                      </div>
                      {filter === key && (
                        <Check size={12} className='text-white/50' />
                      )}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Category filter dropdown */}
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  className={cn(
                    'inline-flex select-none items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all duration-200',
                    categoryFilter !== 'all'
                      ? 'border-white/40 bg-white/20 shadow-lg hover:bg-white/25'
                      : 'border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15',
                  )}
                >
                  <Layers size={12} className='text-white/60' />
                  <span className='text-white/90'>
                    {categoryFilter === 'all'
                      ? 'All Categories'
                      : signalCategoryConfig[categoryFilter].label}
                  </span>
                  <ChevronDown size={12} className='text-white/40' />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align='start'
                  sideOffset={10}
                  className='z-50 w-48 rounded-lg border border-white/15 bg-black/95 p-1 shadow-2xl backdrop-blur-xl'
                >
                  <DropdownMenu.Item
                    onSelect={() => setCategoryFilter('all')}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-white/90 outline-none hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white',
                      categoryFilter === 'all' && 'bg-white/10',
                    )}
                  >
                    <span className='text-xs'>All Categories</span>
                    {categoryFilter === 'all' && (
                      <Check size={12} className='text-white/50' />
                    )}
                  </DropdownMenu.Item>
                  {(
                    Object.entries(signalCategoryConfig) as [
                      SignalCategory,
                      { label: string; iconVariant: string },
                    ][]
                  ).map(([key, config]) => (
                    <DropdownMenu.Item
                      key={key}
                      onSelect={() => setCategoryFilter(key)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-white/90 outline-none hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white',
                        categoryFilter === key && 'bg-white/10',
                      )}
                    >
                      <div className='flex items-center gap-2'>
                        <DynamicIcon
                          variant={config.iconVariant as any}
                          height={14}
                          width={14}
                          className='text-white/40'
                        />
                        <span className='text-xs'>{config.label}</span>
                        <span className='text-[10px] text-white/30'>
                          {categoryCounts[key]}
                        </span>
                      </div>
                      {categoryFilter === key && (
                        <Check size={12} className='text-white/50' />
                      )}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </motion.div>

          <div className='relative flex' style={{ height: radarHeight }}>
            {/* Radar section - full width now */}
            <div className='flex-1 overflow-hidden'>
              <SignalRadar
                signals={signals}
                selectedSignal={selectedSignal}
                onSelectSignal={handleSelectSignal}
                filter={filter}
                categoryFilter={categoryFilter}
                height={radarHeight}
                companyLogoUrl={companyLogoUrl}
              />
            </div>

            {/* Overlaid carousel widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            >
              <SignalCarouselWidget
                signals={filteredSignals}
                selectedSignal={selectedSignal}
                onSelectSignal={handleSelectSignal}
                pinnedSignalIds={pinnedSignalIds}
                onPinSignal={handlePinSignal}
              />
            </motion.div>
          </div>

          {/* Signal History / Last Updated badge - bottom left */}
          {!showCustomize && (
            <SignalHistoryPopover
              lastUpdated={lastUpdated}
              isScanningActive={isScanningActive}
              scanProgress={scanProgress}
              onRefresh={handleRefresh}
              selectedScanUuid={selectedScanUuid}
              onSelectScan={setSelectedScanUuid}
              watchtowerConfigUuid={activeWatchtowerConfigUuid}
              isAdmin={isAdmin}
            />
          )}

          {/* Customize button - bottom right (admin only) */}
          {!showCustomize && isAdmin && (
            <motion.button
              onClick={() => setShowCustomize(true)}
              className='absolute bottom-6 right-6 z-10 inline-flex select-none items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/15'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
            >
              <Settings size={14} className='stroke-white' />
              <span className='text-white'>Customize</span>
            </motion.button>
          )}

          {/* Customize panel */}
          <AnimatePresence>
            {showCustomize && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className='overflow-hidden border-t border-white/10'
              >
                <div className='relative bg-black/40 p-6 backdrop-blur-sm'>
                  {/* Close button - top right */}
                  <button
                    onClick={() => setShowCustomize(false)}
                    className='absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-1.5 transition-colors hover:border-white/30 hover:bg-white/20'
                  >
                    <X size={16} className='stroke-white' />
                  </button>
                  <div className='max-w-2xl'>
                    <h4 className='mb-1 text-sm font-semibold text-white'>
                      Custom Monitoring Rules
                    </h4>
                    <p className='mb-4 text-xs text-white/60'>
                      Add rules that will be applied when the radar is updated.
                      These help focus on specific competitors, trends, or
                      topics.
                    </p>

                    {/* Add new rule */}
                    <div className='mb-4 flex gap-2'>
                      <input
                        type='text'
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                        placeholder='e.g., Always check what Saputo is doing'
                        className='flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-colors placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:outline-none'
                      />
                      <button
                        onClick={handleAddRule}
                        disabled={
                          !newRule.trim() ||
                          isCreatingRule ||
                          isCreatingConfigRule
                        }
                        className='flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30 disabled:opacity-40 disabled:hover:bg-white/20'
                      >
                        <Plus size={16} className='stroke-current' />
                        {isCreatingRule || isCreatingConfigRule
                          ? 'Adding...'
                          : 'Add Rule'}
                      </button>
                    </div>

                    {/* Existing rules */}
                    {monitoringRules.length > 0 ? (
                      <div className='space-y-2'>
                        {monitoringRules.map((rule) => (
                          <div
                            key={rule.uuid}
                            className='group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2'
                          >
                            <span className='text-sm text-white/80'>
                              {rule.ruleText}
                            </span>
                            <button
                              onClick={() => handleRemoveRule(rule.uuid)}
                              disabled={isDeletingRule || isDeletingConfigRule}
                              className='rounded p-1 text-white/40 opacity-0 transition-colors hover:bg-red-500/20 hover:text-red-400 disabled:opacity-30 group-hover:opacity-100'
                            >
                              <Trash2 size={14} className='stroke-current' />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-xs italic text-white/40'>
                        No custom rules added yet.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draggable resize handle */}
          <div
            onMouseDown={handleResizeStart}
            className='absolute bottom-0 left-0 right-0 flex h-3 cursor-ns-resize items-center justify-center transition-colors hover:bg-white/10'
            style={{ bottom: showCustomize ? 'auto' : 0 }}
          >
            <div className='flex items-center gap-1 opacity-40 transition-opacity group-hover:opacity-100'>
              <EllipsisVertical
                size={16}
                className='rotate-90 stroke-white/60'
              />
            </div>
          </div>
        </div>

        {/* Future Predictions and Signal Trends widgets - side by side */}
        <motion.div
          className='p-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
        >
          <div className='mb-6 grid grid-cols-2 gap-6'>
            <FuturePredictionsWidget />
            <SignalTrendsWidget />
          </div>

          {/* Future Domains and Concept Opportunities widgets - side by side */}
          <div className='grid grid-cols-2 gap-6'>
            <FutureDomainsWidget />
            <ConceptOpportunitiesWidget />
          </div>
        </motion.div>

        {/* Pinned Signals Section */}
        {pinnedSignals.length > 0 && (
          <motion.div
            className='px-6 pb-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: 'easeOut' }}
          >
            <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'>
              <div className='mb-4 flex items-center gap-2'>
                <Star size={20} className='stroke-amber-500' />
                <h3 className='aucctus-text-primary aucctus-text-lg-semibold'>
                  Pinned Signals
                </h3>
                <span className='rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600'>
                  {pinnedSignals.length}
                </span>
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {pinnedSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className='aucctus-bg-secondary aucctus-border-secondary group cursor-pointer rounded-lg border p-4 transition-colors hover:bg-opacity-80'
                    onClick={() => setOpenPinnedSignal(signal)}
                  >
                    <div className='mb-2 flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-1.5'>
                        <div
                          className={cn(
                            'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
                            signal.type === 'threat' &&
                              'bg-red-100 text-red-700',
                            signal.type === 'opportunity' &&
                              'bg-green-100 text-green-700',
                            signal.type === 'watch' &&
                              'aucctus-bg-secondary aucctus-text-secondary',
                          )}
                        >
                          <DynamicIcon
                            variant={
                              signal.type === 'threat'
                                ? 'alert-triangle'
                                : signal.type === 'opportunity'
                                  ? 'sparkles'
                                  : 'eye'
                            }
                            height={12}
                            width={12}
                            className='stroke-current'
                          />
                          {signalTypeConfig[signal.type].label}
                        </div>
                        <div className='aucctus-bg-secondary aucctus-text-secondary flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]'>
                          <DynamicIcon
                            variant={
                              signalCategoryConfig[signal.category]
                                .iconVariant as any
                            }
                            height={12}
                            width={12}
                            className='stroke-current'
                          />
                          {signalCategoryConfig[signal.category].label}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinSignal(signal);
                        }}
                        className='rounded p-1 text-amber-500 transition-colors hover:bg-amber-500/10 hover:text-amber-600'
                        title='Unpin signal'
                      >
                        <X size={14} className='stroke-current' />
                      </button>
                    </div>
                    <h4 className='aucctus-text-primary aucctus-text-sm-medium line-clamp-2 leading-snug transition-colors group-hover:text-opacity-80'>
                      {signal.title}
                    </h4>
                    <p className='aucctus-text-secondary mt-2 line-clamp-2 text-xs'>
                      {signal.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Pinned Signal Side Panel */}
        <AnimatePresence>
          {openPinnedSignal && (
            <>
              {/* Backdrop */}
              <motion.div
                className='fixed inset-0 z-40 bg-black/50'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenPinnedSignal(null)}
              />

              {/* Side Panel */}
              <motion.div
                className='aucctus-bg-primary aucctus-border-secondary fixed bottom-0 right-0 top-0 z-50 w-[480px] border-l shadow-2xl'
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                {/* Header */}
                <div className='aucctus-border-secondary flex items-center justify-between border-b px-6 py-4'>
                  <div className='flex items-center gap-2'>
                    <Star size={16} className='stroke-amber-500' />
                    <span className='aucctus-text-primary font-semibold'>
                      Pinned Signal
                    </span>
                  </div>
                  <button
                    onClick={() => setOpenPinnedSignal(null)}
                    className='aucctus-bg-secondary-hover rounded-lg p-2 transition-colors'
                  >
                    <X size={16} className='aucctus-stroke-secondary' />
                  </button>
                </div>

                {/* Content */}
                <div className='h-[calc(100%-65px)] overflow-y-auto'>
                  <div className='space-y-5 p-6'>
                    {/* Type badges row */}
                    <div className='flex flex-wrap items-center gap-2'>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium',
                          openPinnedSignal.type === 'threat' &&
                            'border-red-500/25 bg-red-500/15 text-red-400',
                          openPinnedSignal.type === 'opportunity' &&
                            'border-green-500/25 bg-green-500/15 text-green-400',
                          openPinnedSignal.type === 'watch' &&
                            'aucctus-border-secondary aucctus-bg-secondary aucctus-text-secondary',
                        )}
                      >
                        <DynamicIcon
                          variant={
                            openPinnedSignal.type === 'threat'
                              ? 'alert-triangle'
                              : openPinnedSignal.type === 'opportunity'
                                ? 'sparkles'
                                : 'eye'
                          }
                          height={12}
                          width={12}
                          className='stroke-current'
                        />
                        {signalTypeConfig[openPinnedSignal.type].label}
                      </div>
                      <div className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-secondary flex items-center gap-1.5 rounded border px-2 py-1 text-xs'>
                        <DynamicIcon
                          variant={
                            signalCategoryConfig[openPinnedSignal.category]
                              .iconVariant as any
                          }
                          height={12}
                          width={12}
                          className='stroke-current'
                        />
                        {signalCategoryConfig[openPinnedSignal.category].label}
                      </div>
                      {openPinnedSignal.isNew && (
                        <div
                          className='h-2.5 w-2.5 flex-shrink-0 rounded-full'
                          style={{ backgroundColor: '#1570EF' }}
                        />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className='aucctus-text-primary text-lg font-semibold leading-snug'>
                      {openPinnedSignal.title}
                    </h3>

                    {/* Source pills under title */}
                    {openPinnedSignal.sources &&
                      openPinnedSignal.sources.length > 0 && (
                        <div className='-mt-2 flex flex-wrap items-center gap-1.5'>
                          {openPinnedSignal.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className='aucctus-bg-secondary flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-opacity-80'
                            >
                              <div
                                className={cn(
                                  'flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-medium text-white',
                                  source.type === 'News' && 'bg-blue-500',
                                  source.type === 'Report' && 'bg-purple-500',
                                  source.type === 'Filing' && 'bg-amber-500',
                                  source.type === 'Internal' && 'bg-slate-500',
                                  ![
                                    'News',
                                    'Report',
                                    'Filing',
                                    'Internal',
                                  ].includes(source.type) && 'bg-slate-500',
                                )}
                              >
                                {source.title
                                  .split(' ')
                                  .slice(0, 2)
                                  .map((w) => w[0])
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <span className='aucctus-text-secondary max-w-[120px] truncate text-[10px]'>
                                {source.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Meta row */}
                    <div className='aucctus-text-tertiary flex items-center gap-3 text-[11px]'>
                      <div className='flex items-center gap-1.5'>
                        <Clock size={12} className='stroke-current' />
                        <span>
                          {(() => {
                            const date = new Date(openPinnedSignal.dateAdded);
                            const now = new Date();
                            const diffMs = now.getTime() - date.getTime();
                            const diffHours = Math.floor(
                              diffMs / (1000 * 60 * 60),
                            );
                            const diffDays = Math.floor(
                              diffMs / (1000 * 60 * 60 * 24),
                            );
                            if (diffHours < 24) return `${diffHours}h ago`;
                            if (diffDays < 7) return `${diffDays}d ago`;
                            return date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            });
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Recommended Action - HIGHLIGHTED */}
                    <div
                      className={cn(
                        'rounded-lg border p-4',
                        openPinnedSignal.type === 'threat' &&
                          'border-red-500/20 bg-red-500/10',
                        openPinnedSignal.type === 'opportunity' &&
                          'border-green-500/20 bg-green-500/10',
                        openPinnedSignal.type === 'watch' &&
                          'aucctus-border-secondary aucctus-bg-secondary',
                      )}
                    >
                      <div className='mb-2 flex items-center gap-1.5'>
                        <Lightbulb
                          size={14}
                          className={cn(
                            'stroke-current',
                            openPinnedSignal.type === 'threat' &&
                              'text-red-500',
                            openPinnedSignal.type === 'opportunity' &&
                              'text-green-500',
                            openPinnedSignal.type === 'watch' &&
                              'aucctus-text-secondary',
                          )}
                        />
                        <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                          Recommended Action
                        </span>
                      </div>
                      <p className='aucctus-text-primary text-sm leading-relaxed'>
                        {openPinnedSignal.recommendedAction}
                      </p>
                    </div>

                    {/* Content sections with consistent hierarchy */}
                    <div className='space-y-4'>
                      {/* What Changed */}
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5'>
                          <TrendingUp
                            size={12}
                            className='aucctus-stroke-tertiary'
                          />
                          <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                            What Changed
                          </span>
                        </div>
                        <p className='aucctus-text-secondary pl-4 text-sm leading-relaxed'>
                          {openPinnedSignal.whatChanged}
                        </p>
                      </div>

                      {/* Why It Matters */}
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5'>
                          <Target
                            size={12}
                            className='aucctus-stroke-tertiary'
                          />
                          <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                            Why It Matters
                          </span>
                        </div>
                        <p className='aucctus-text-secondary pl-4 text-sm leading-relaxed'>
                          {openPinnedSignal.whyItMatters}
                        </p>
                      </div>

                      {/* Likely Impact */}
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5'>
                          <TrendingUp
                            size={12}
                            className='aucctus-stroke-tertiary'
                          />
                          <span className='aucctus-text-secondary text-[10px] font-semibold uppercase tracking-wider'>
                            Likely Impact
                          </span>
                        </div>
                        <p className='aucctus-text-secondary pl-4 text-sm leading-relaxed'>
                          {openPinnedSignal.likelyImpact}
                        </p>
                      </div>
                    </div>

                    {/* Concept Impacts Section */}
                    {(() => {
                      const conceptImpacts =
                        openPinnedSignal.conceptImpacts || [];
                      const materialImpacts = conceptImpacts.filter(
                        (impact) => impact.isMaterial,
                      );
                      const hasBeenEvaluated =
                        !!openPinnedSignal.conceptImpactEvaluatedAt;
                      const noMaterialImpact =
                        hasBeenEvaluated && materialImpacts.length === 0;

                      return (
                        <div className='aucctus-border-secondary space-y-3 border-t pt-4'>
                          <div className='flex items-center gap-1.5'>
                            <Lightbulb
                              size={14}
                              className='stroke-amber-500/70'
                            />
                            <span className='aucctus-text-secondary text-xs font-semibold uppercase tracking-wider'>
                              Concept Impacts
                            </span>
                            {materialImpacts.length > 0 && (
                              <span className='rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-600'>
                                {materialImpacts.length}
                              </span>
                            )}
                          </div>

                          {materialImpacts.length > 0 ? (
                            <div className='space-y-3'>
                              {materialImpacts.map((impact) => (
                                <div
                                  key={impact.uuid}
                                  className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-3'
                                >
                                  <div className='space-y-2'>
                                    <div className='flex items-center gap-2'>
                                      <h5 className='aucctus-text-primary text-sm font-semibold leading-snug'>
                                        {impact.conceptName}
                                      </h5>
                                      <span
                                        className={cn(
                                          'rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                                          impact.impactType === 'acceleration'
                                            ? 'bg-green-500/15 text-green-600'
                                            : 'bg-red-500/15 text-red-600',
                                        )}
                                      >
                                        {impact.impactType}
                                      </span>
                                    </div>

                                    <div className='flex items-start gap-1.5'>
                                      <AlertCircle
                                        size={12}
                                        className={cn(
                                          'mt-0.5 flex-shrink-0',
                                          impact.impactType === 'acceleration'
                                            ? 'stroke-green-500/70'
                                            : 'stroke-red-500/70',
                                        )}
                                      />
                                      <p className='aucctus-text-secondary text-xs leading-relaxed'>
                                        {impact.impactStatement}
                                      </p>
                                    </div>

                                    <div className='flex items-center gap-2 pt-1'>
                                      <button
                                        onClick={() =>
                                          navigate(
                                            AppPath.ConceptOverview.replace(
                                              ':id',
                                              impact.conceptIdentifier,
                                            ),
                                          )
                                        }
                                        className='aucctus-bg-secondary-hover aucctus-border-secondary aucctus-text-primary flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors'
                                      >
                                        <ExternalLink
                                          size={12}
                                          className='stroke-current'
                                        />
                                        View Concept
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : noMaterialImpact ? (
                            <div className='rounded-lg border border-green-500/20 bg-green-500/10 p-3'>
                              <p className='text-xs text-green-600'>
                                <Check
                                  size={12}
                                  className='mr-1.5 inline stroke-current'
                                />
                                No material impact on active or near-term
                                concepts identified.
                              </p>
                            </div>
                          ) : (
                            <p className='aucctus-text-tertiary text-xs italic'>
                              Concept impact assessment not yet available for
                              this signal.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      {content}

      {/* Create Watchtower Modal -- rendered once, unconditionally */}
      <CreateWatchtowerModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={(uuid) => {
          setActiveWatchtowerConfigUuid(uuid);
        }}
      />
    </>
  );
};

/**
 * Main Watchtower Page Component with Overseer support
 */
const WatchtowerPage: React.FC = () => {
  return (
    <WatchtowerViewProvider>
      <WatchtowerPageContent />
    </WatchtowerViewProvider>
  );
};

export default WatchtowerPage;
