import { Text } from '@components';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import { useOverseerDockOffset } from '@hooks/useOverseerDockOffset';
import type {
  IJTBDCustomWidget,
  IJTBDJob,
  JTBDWidgetType,
} from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Check,
  Crosshair,
  GitMerge,
  HelpCircle,
  Lightbulb,
  Loader2,
  Map,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Trophy,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

import { useCreateJTBDNote } from '@hooks/query/jtbd.hook';
import { formatScanDate } from './JTBDCanvas/ScanInfoLine';
import {
  CollapsibleSection,
  ParsedTitle,
  evidenceLabel,
  opportunityDollars,
  segmentColors,
  tierColors,
  tierLabels,
} from './jtbd-utils';
import { SourcePill, WidgetRenderer } from './widgets';

const COL_SPAN: Record<JTBDWidgetType, string> = {
  sparkline_stat: 'col-span-1',
  social_post: 'col-span-2',
  survey: 'col-span-2',
  card_list: 'col-span-2',
  metric_chart: 'col-span-2',
  trend_chart: 'col-span-2',
  stat_list: 'col-span-1',
  market_sizing: 'col-span-2',
  note: 'col-span-3',
};

/** Map each widget type to the items array that drives its content. */
const WIDGET_ITEMS_KEY: Record<JTBDWidgetType, keyof IJTBDCustomWidget> = {
  metric_chart: 'metricChartItems',
  trend_chart: 'trendChartItems',
  card_list: 'cardListItems',
  stat_list: 'statListItems',
  social_post: 'socialPostItems',
  survey: 'surveyItems',
  sparkline_stat: 'sparklineStatItems',
  market_sizing: 'marketSizingItems',
  note: 'noteItems',
};

/** Returns true when the widget's primary items array is non-empty. */
const hasItems = (w: IJTBDCustomWidget): boolean => {
  const key = WIDGET_ITEMS_KEY[w.widgetType];
  const items = key ? w[key] : undefined;
  return Array.isArray(items) && items.length > 0;
};

// ============================================
// Click-to-play Video Player (16:9)
// Only one video plays at a time across all instances.
// ============================================

interface IActiveVideoStore {
  activeVideo: HTMLVideoElement | null;
  setActiveVideo: (video: HTMLVideoElement | null) => void;
  clearIfCurrent: (video: HTMLVideoElement) => void;
}

const useActiveVideoStore = create<IActiveVideoStore>()((set, get) => ({
  activeVideo: null,
  setActiveVideo: (video: HTMLVideoElement | null) =>
    set({ activeVideo: video }),
  clearIfCurrent: (video: HTMLVideoElement) => {
    if (get().activeVideo === video) set({ activeVideo: null });
  },
}));

const JTBDVideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { activeVideo, setActiveVideo, clearIfCurrent } = useActiveVideoStore();

  // Pause this video when the browser tab loses focus
  useEffect(() => {
    const handleBlur = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
        setIsPlaying(false);
        clearIfCurrent(video);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [clearIfCurrent]);

  // Sync state if the video is paused externally (e.g. another instance took over)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPause = () => setIsPlaying(false);
    video.addEventListener('pause', onPause);
    return () => video.removeEventListener('pause', onPause);
  }, []);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying) {
        video.pause();
        clearIfCurrent(video);
      } else {
        // Pause whichever video is currently playing
        if (activeVideo && activeVideo !== video) {
          activeVideo.pause();
        }
        video.play();
        setActiveVideo(video);
      }
      setIsPlaying(!isPlaying);
    },
    [isPlaying, activeVideo, setActiveVideo, clearIfCurrent],
  );

  return (
    <div
      className='relative cursor-pointer overflow-hidden rounded-lg'
      style={{ aspectRatio: '16 / 9' }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        className='absolute inset-0 h-full w-full rounded-lg object-cover'
      >
        <source src={src} type='video/mp4' />
      </video>
      {/* Play / Pause overlay */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center rounded-lg transition-opacity',
          isPlaying
            ? 'bg-black/0 opacity-0 hover:bg-black/30 hover:opacity-100'
            : 'bg-black/40',
        )}
      >
        {isPlaying ? (
          <Pause className='h-8 w-8 text-white/80' />
        ) : (
          <Play className='h-8 w-8 text-white/80' />
        )}
      </div>
    </div>
  );
};

// ============================================
// JTBDCard Props
// ============================================

interface JTBDCardProps {
  job: IJTBDJob;
  index: number;
  isSelected: boolean;
  isOther: boolean;
  onClick: (job: IJTBDJob) => void;
  onIdeate?: (job: IJTBDJob) => void;
  isIdeating?: boolean;
  /**
   * True while Ask Aucctus has an edit in flight for this specific job.
   * Drives a small "Editing…" pill on the collapsed card and a dim/banner
   * treatment on the expanded overlay. Independent from `isIdeating`.
   */
  isEditing?: boolean;
}

// ============================================
// JTBDCard Component
// ============================================

export const JTBDCard: React.FC<JTBDCardProps> = ({
  job,
  index,
  isSelected,
  isOther,
  onClick,
  onIdeate,
  isIdeating,
  isEditing,
}) => {
  const openWithPrefill = useStore((state) => state.overseer.openWithPrefill);
  // Offset the expanded-card overlay when Overseer is docked+open so the
  // full card respects the 412px dock strip on the right.
  const overlayRightOffset = useOverseerDockOffset();

  const handleReassessJob = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openWithPrefill({
        message: 'Re-assess this opportunity: ',
        pageContext: 'jtbd',
        mention: {
          id: job.uuid,
          name: job.jtbdTitle,
          type: 'jtbd_job',
        },
      });
    },
    [openWithPrefill, job.uuid, job.jtbdTitle],
  );

  // Sparkle-button handler for constraint-analysis blocks (root_constraint /
  // solution_landscape). Mirrors the per-widget refine UX in WidgetRenderer:
  // prefills the Overseer chat with a refine message and a `jtbd_widget`
  // mention. The backend chat agent disambiguates from the message text and
  // emits a `jtbd_job_edit` suggestion with `scope.kind === 'constraint_field'`.
  const handleRefineConstraintField = useCallback(
    (e: React.MouseEvent, field: 'root_constraint' | 'solution_landscape') => {
      e.stopPropagation();
      const fieldLabel =
        field === 'root_constraint' ? 'Root Constraint' : 'Solution Landscape';
      const messagePrefix =
        field === 'root_constraint'
          ? 'Refine the root constraint: '
          : 'Refine the solution landscape: ';
      openWithPrefill({
        message: messagePrefix,
        pageContext: 'jtbd',
        mention: {
          id: job.uuid,
          name: fieldLabel,
          type: 'jtbd_widget',
        },
      });
    },
    [openWithPrefill, job.uuid],
  );

  const sortedWidgets = isSelected
    ? [...job.customWidgets].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  const marketSizingWidgets = sortedWidgets.filter(
    (w) => w.widgetType === 'market_sizing' && hasItems(w),
  );
  const noteWidgets = sortedWidgets.filter(
    (w) => w.widgetType === 'note' && hasItems(w),
  );
  const evidenceWidgets = sortedWidgets.filter(
    (w) =>
      w.widgetType !== 'market_sizing' &&
      w.widgetType !== 'note' &&
      hasItems(w),
  );

  // Inline "Add note" form state — local to the expanded card. Renders at the
  // bottom of the Notes section, above any existing note widgets.
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { createNoteAsync, isCreating: isCreatingNote } = useCreateJTBDNote(
    job.uuid,
  );

  useEffect(() => {
    if (isAddingNote) {
      noteTextareaRef.current?.focus();
    }
  }, [isAddingNote]);

  const handleSubmitNote = useCallback(async () => {
    const body = noteDraft.trim();
    if (!body) return;
    try {
      await createNoteAsync({ body });
      setNoteDraft('');
      setIsAddingNote(false);
    } catch {
      // Toast surfaced by the mutation's onError.
    }
  }, [noteDraft, createNoteAsync]);

  const handleCancelAddNote = useCallback(() => {
    setNoteDraft('');
    setIsAddingNote(false);
  }, []);

  const handleAddNoteKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelAddNote();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitNote();
      }
    },
    [handleCancelAddNote, handleSubmitNote],
  );

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelected) {
        onClick(job);
      }
    },
    [isSelected, onClick, job],
  );

  useEffect(() => {
    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, handleKeyDown]);

  // Render expanded overlay via portal to escape masonry/float context
  const expandedOverlay = isSelected
    ? createPortal(
        <AnimatePresence>
          {/* Backdrop */}
          <motion.div
            key='jtbd-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-[60] bg-black/60 backdrop-blur-md'
            style={{ right: overlayRightOffset }}
            onClick={() => onClick(job)}
          />

          {/* Expanded card */}
          <motion.div
            key='jtbd-expanded'
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className='fixed inset-0 z-[60] flex items-center justify-center p-8'
            style={{ right: overlayRightOffset }}
            onClick={() => onClick(job)}
          >
            <div
              className='liquid-glass-dark relative flex max-h-[90vh] w-full max-w-[75vw] flex-col overflow-hidden !rounded-2xl shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              {/* ===== FIXED HEADER ===== */}
              <div className='group/header flex-shrink-0 border-b border-white/[0.08] px-6 pb-5 pt-4'>
                {/* Close row */}
                <div className='mb-3 flex justify-end'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(job);
                    }}
                    className='rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>

                <div className='flex items-center gap-5'>
                  {/* Video thumbnail in header */}
                  {job.videoUrl && (
                    <div className='w-[240px] flex-shrink-0'>
                      <JTBDVideoPlayer src={job.videoUrl} />
                    </div>
                  )}

                  {/* Content */}
                  <div className='flex min-w-0 flex-1 flex-col gap-2.5'>
                    <h3 className='text-2xl font-normal leading-tight text-white/90'>
                      <ParsedTitle title={job.jtbdTitle} expanded />
                    </h3>
                    {job.summary && (
                      <Text.Collapsible
                        title=''
                        titleClassName='hidden'
                        description={job.summary}
                        descriptionClassName='text-sm text-white/50'
                        truncationClassName='line-clamp-3'
                      />
                    )}

                    {/* Metadata row */}
                    <div className='flex items-center gap-5 pt-1'>
                      <div className='flex items-center gap-1.5'>
                        <Trophy className='h-3.5 w-3.5 text-white/40' />
                        <span className='text-xs text-white/40'>
                          Opportunity
                        </span>
                        <span
                          className='text-xs font-bold'
                          style={{ color: 'hsl(153 79% 40%)' }}
                        >
                          {opportunityDollars(job.opportunityScore)}
                        </span>
                        {job.opportunityReasoning && (
                          <ComponentTooltip
                            preferredPosition='above'
                            tip={
                              <div className='max-w-[400px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
                                {job.opportunityReasoning}
                              </div>
                            }
                          >
                            <HelpCircle className='h-3.5 w-3.5 cursor-help text-white/30 transition-colors hover:text-white/50' />
                          </ComponentTooltip>
                        )}
                      </div>
                      <div className='flex items-center gap-1.5'>
                        <ShieldCheck className='h-3.5 w-3.5 text-white/40' />
                        <span className='text-xs text-white/40'>Evidence</span>
                        <span className='text-xs font-semibold text-white/70'>
                          {evidenceLabel(job.evidenceStrength)}
                        </span>
                        {job.evidenceStrengthReasoning && (
                          <ComponentTooltip
                            preferredPosition='above'
                            tip={
                              <div className='max-w-[400px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
                                {job.evidenceStrengthReasoning}
                              </div>
                            }
                          >
                            <HelpCircle className='h-3.5 w-3.5 cursor-help text-white/30 transition-colors hover:text-white/50' />
                          </ComponentTooltip>
                        )}
                      </div>
                      {job.mergedFromScanUuid && (
                        <div className='flex items-center gap-1.5'>
                          <GitMerge className='h-3.5 w-3.5 text-white/40' />
                          <span className='text-xs text-white/40'>
                            Refreshed
                          </span>
                          <span className='text-xs font-semibold text-white/70'>
                            {job.agentLastUpdated
                              ? formatScanDate(job.agentLastUpdated)
                              : 'from prior scan'}
                          </span>
                          <ComponentTooltip
                            preferredPosition='above'
                            tip={
                              <div className='max-w-[360px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
                                {job.mergeRationale ??
                                  'Carried over and re-scored from a prior scan. Sources were unioned and the core need was preserved; scoring reflects combined evidence.'}
                              </div>
                            }
                          >
                            <HelpCircle className='h-3.5 w-3.5 cursor-help text-white/30 transition-colors hover:text-white/50' />
                          </ComponentTooltip>
                        </div>
                      )}
                    </div>

                    {/* Tags row */}
                    <div className='flex flex-wrap items-center gap-2'>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                          tierColors[job.opportunityTier],
                        )}
                      >
                        {tierLabels[job.opportunityTier]}
                      </span>
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                          segmentColors[job.segment] ?? segmentColors.b2c,
                        )}
                      >
                        {job.segment === 'b2c' ? 'B2C' : 'B2B'}
                      </span>
                    </div>

                    {/* Editing-in-progress banner — sits in the header under
                        the opportunity tier + segment badges so it's visible
                        immediately, not gated by scrolling the body. */}
                    <AnimatePresence initial={false}>
                      {isEditing && (
                        <motion.div
                          key='jtbd-editing-banner'
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className='overflow-hidden'
                        >
                          <div className='flex items-center gap-2 rounded-lg border border-sky-400/25 bg-sky-500/[0.08] px-3 py-2 text-[12px] text-sky-100/90'>
                            <Loader2 className='h-3.5 w-3.5 animate-spin text-sky-300/90' />
                            <span>
                              Ask Aucctus is editing this opportunity. The
                              refreshed evidence and scoring will replace the
                              current view when it completes.
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action CTAs */}
                  <div className='flex flex-shrink-0 flex-col gap-2 self-start'>
                    {onIdeate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onIdeate(job);
                        }}
                        disabled={isIdeating}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all',
                          'bg-white/10 text-white hover:bg-white/20',
                          'border border-white/20 hover:border-white/40',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                      >
                        {isIdeating ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Lightbulb className='h-4 w-4' />
                        )}
                        {isIdeating
                          ? 'Starting Ideation...'
                          : 'Ideate Solutions'}
                      </button>
                    )}

                    <motion.button
                      type='button'
                      onClick={handleReassessJob}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium',
                        'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] hover:text-white',
                        'border border-white/[0.12] hover:border-white/30',
                        // Hidden by default; fades in only when the header is hovered.
                        'opacity-0 transition-opacity duration-200 ease-out group-hover/header:opacity-100',
                      )}
                      title='Re-assess this opportunity with Overseer'
                    >
                      <Sparkles className='h-4 w-4' />
                      Re-assess opportunity
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ===== SCROLLABLE BODY ===== */}
              <div className='min-h-0 flex-1 overflow-auto px-6 py-4'>
                {/* Constraint Analysis — rootConstraint, solutionLandscape, capabilityFit */}
                {(job.rootConstraint ||
                  job.solutionLandscape ||
                  job.capabilityFit) && (
                  <CollapsibleSection
                    title='Constraint Analysis'
                    icon={<Crosshair className='h-3.5 w-3.5 text-white/40' />}
                  >
                    <div className='grid grid-cols-3 gap-3 py-2'>
                      {job.rootConstraint && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0 }}
                          className='group relative col-span-1 rounded-lg border border-white/[0.1] bg-white/[0.05] p-4'
                        >
                          <motion.button
                            type='button'
                            onClick={(e) =>
                              handleRefineConstraintField(e, 'root_constraint')
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full',
                              'border border-white/[0.1] bg-[#1a1a1c]/95 text-white/60 backdrop-blur-sm',
                              'opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100',
                              'hover:border-white/30 hover:bg-white/[0.15] hover:text-white',
                            )}
                            title='Refine the root constraint with Aucctus'
                            aria-label='Refine the root constraint with Aucctus'
                          >
                            <Sparkles className='h-3 w-3' />
                          </motion.button>
                          <div className='mb-2 flex items-center gap-2'>
                            <Crosshair className='h-3.5 w-3.5 text-rose-400/70' />
                            <span className='text-[11px] font-semibold uppercase tracking-wider text-white/50'>
                              Root Constraint
                            </span>
                          </div>
                          <Text.Collapsible
                            title=''
                            titleClassName='hidden'
                            description={job.rootConstraint}
                            descriptionClassName='text-[13px] leading-relaxed text-white/70'
                            truncationClassName='line-clamp-4'
                            containerClassName='flex flex-col items-start gap-2 text-start'
                            disableTruncationGradient
                          />
                          {(() => {
                            const sources =
                              job.constraintSources?.filter(
                                (s) => s.field === 'root_constraint',
                              ) ?? [];
                            if (sources.length === 0) return null;
                            return (
                              <div className='mt-2 flex flex-wrap gap-1.5'>
                                {sources.map((src, i) => (
                                  <SourcePill
                                    key={i}
                                    source={src.sourceLabel}
                                    url={src.sourceUrl || undefined}
                                    sourceType={src.sourceType}
                                    snippet={src.snippet}
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}

                      {job.solutionLandscape && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className='group relative col-span-1 rounded-lg border border-white/[0.1] bg-white/[0.05] p-4'
                        >
                          <motion.button
                            type='button'
                            onClick={(e) =>
                              handleRefineConstraintField(
                                e,
                                'solution_landscape',
                              )
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              'absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full',
                              'border border-white/[0.1] bg-[#1a1a1c]/95 text-white/60 backdrop-blur-sm',
                              'opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100',
                              'hover:border-white/30 hover:bg-white/[0.15] hover:text-white',
                            )}
                            title='Refine the solution landscape with Aucctus'
                            aria-label='Refine the solution landscape with Aucctus'
                          >
                            <Sparkles className='h-3 w-3' />
                          </motion.button>
                          <div className='mb-2 flex items-center gap-2'>
                            <Map className='h-3.5 w-3.5 text-sky-400/70' />
                            <span className='text-[11px] font-semibold uppercase tracking-wider text-white/50'>
                              Solution Landscape
                            </span>
                          </div>
                          <Text.Collapsible
                            title=''
                            titleClassName='hidden'
                            description={job.solutionLandscape}
                            descriptionClassName='text-[13px] leading-relaxed text-white/70'
                            truncationClassName='line-clamp-4'
                            containerClassName='flex flex-col items-start gap-2 text-start'
                            disableTruncationGradient
                          />
                          {(() => {
                            const sources =
                              job.constraintSources?.filter(
                                (s) => s.field === 'solution_landscape',
                              ) ?? [];
                            if (sources.length === 0) return null;
                            return (
                              <div className='mt-2 flex flex-wrap gap-1.5'>
                                {sources.map((src, i) => (
                                  <SourcePill
                                    key={i}
                                    source={src.sourceLabel}
                                    url={src.sourceUrl || undefined}
                                    sourceType={src.sourceType}
                                    snippet={src.snippet}
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}

                      {job.capabilityFit && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className='col-span-1 rounded-lg border border-white/[0.1] bg-white/[0.05] p-4'
                        >
                          <div className='mb-2 flex items-center gap-2'>
                            <Sparkles className='h-3.5 w-3.5 text-emerald-400/70' />
                            <span className='text-[11px] font-semibold uppercase tracking-wider text-white/50'>
                              Capability Fit
                            </span>
                          </div>
                          <Text.Collapsible
                            title=''
                            titleClassName='hidden'
                            description={job.capabilityFit}
                            descriptionClassName='text-[13px] leading-relaxed text-white/70'
                            truncationClassName='line-clamp-4'
                            containerClassName='flex flex-col items-start gap-2 text-start'
                            disableTruncationGradient
                          />
                          {(() => {
                            const sources =
                              job.constraintSources?.filter(
                                (s) => s.field === 'capability_fit',
                              ) ?? [];
                            if (sources.length === 0) return null;
                            return (
                              <div className='mt-2 flex flex-wrap gap-1.5'>
                                {sources.map((src, i) => (
                                  <SourcePill
                                    key={i}
                                    source={src.sourceLabel}
                                    url={src.sourceUrl || undefined}
                                    sourceType={src.sourceType}
                                    snippet={src.snippet}
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Opportunity Size — market_sizing widgets only */}
                {marketSizingWidgets.length > 0 && (
                  <CollapsibleSection
                    title='Opportunity Size'
                    icon={<BarChart3 className='h-3.5 w-3.5 text-white/40' />}
                  >
                    <div className='py-2'>
                      {marketSizingWidgets.map((widget, i) => (
                        <motion.div
                          key={widget.uuid}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: i * 0.05,
                          }}
                          className='rounded-lg border border-white/[0.1] bg-white/[0.05] p-3'
                        >
                          <WidgetRenderer widget={widget} jobUuid={job.uuid} />
                        </motion.div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Evidence Widgets — everything except market_sizing + notes */}
                <CollapsibleSection
                  title='Evidence'
                  icon={<ShieldCheck className='h-3.5 w-3.5 text-white/40' />}
                >
                  {evidenceWidgets.length > 0 ? (
                    <div className='grid grid-cols-3 gap-3 py-2'>
                      {evidenceWidgets.map((widget, i) => (
                        <motion.div
                          key={widget.uuid}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: i * 0.05,
                          }}
                          className={cn(
                            'rounded-lg border border-white/[0.1] bg-white/[0.05] p-3',
                            COL_SPAN[widget.widgetType] ?? 'col-span-2',
                          )}
                        >
                          <WidgetRenderer widget={widget} jobUuid={job.uuid} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className='py-4 text-center text-xs text-white/30'>
                      No evidence widgets available for this job.
                    </p>
                  )}
                </CollapsibleSection>

                {/* Notes — user-authored; survives re-assessment */}
                <CollapsibleSection
                  title='Notes'
                  icon={
                    <StickyNote className='h-3.5 w-3.5 text-amber-300/80' />
                  }
                >
                  <div className='space-y-2 py-2'>
                    {noteWidgets.map((widget, i) => (
                      <motion.div
                        key={widget.uuid}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className='rounded-lg border border-white/[0.1] bg-white/[0.05] p-3'
                      >
                        <WidgetRenderer widget={widget} jobUuid={job.uuid} />
                      </motion.div>
                    ))}

                    {/* Inline add-note form (a) — preferred over add-then-edit */}
                    <AnimatePresence initial={false} mode='wait'>
                      {isAddingNote ? (
                        <motion.div
                          key='add-note-form'
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className='overflow-hidden'
                        >
                          <div className='space-y-2 rounded-lg border border-amber-400/25 bg-amber-500/[0.06] p-3'>
                            <textarea
                              ref={noteTextareaRef}
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              onKeyDown={handleAddNoteKeyDown}
                              onClick={(e) => e.stopPropagation()}
                              rows={3}
                              placeholder='Add a note to this opportunity…'
                              className={cn(
                                'w-full resize-y rounded-md border border-white/[0.12] bg-black/40 px-3 py-2',
                                'text-[12px] leading-relaxed text-white/80 placeholder:text-white/25',
                                'focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/30',
                              )}
                            />
                            <div className='flex items-center justify-end gap-2'>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelAddNote();
                                }}
                                disabled={isCreatingNote}
                                className='flex items-center gap-1 rounded-md border border-white/[0.08] px-2.5 py-1 text-[10px] font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-40'
                              >
                                <X className='h-3 w-3' />
                                Cancel
                              </button>
                              <motion.button
                                type='button'
                                whileHover={
                                  noteDraft.trim().length > 0 && !isCreatingNote
                                    ? { scale: 1.03 }
                                    : undefined
                                }
                                whileTap={
                                  noteDraft.trim().length > 0 && !isCreatingNote
                                    ? { scale: 0.97 }
                                    : undefined
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubmitNote();
                                }}
                                disabled={
                                  noteDraft.trim().length === 0 ||
                                  isCreatingNote
                                }
                                className={cn(
                                  'flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors',
                                  noteDraft.trim().length > 0 && !isCreatingNote
                                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200/90 hover:bg-emerald-500/25 hover:text-emerald-100'
                                    : 'cursor-not-allowed border-white/[0.06] bg-white/[0.03] text-white/25',
                                )}
                              >
                                {isCreatingNote ? (
                                  <Loader2 className='h-3 w-3 animate-spin' />
                                ) : (
                                  <Check className='h-3 w-3' />
                                )}
                                Save note
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key='add-note-button'
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingNote(true);
                          }}
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          className={cn(
                            'flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2.5',
                            'text-[11px] font-medium text-white/40 transition-colors hover:border-amber-400/30 hover:bg-amber-500/[0.05] hover:text-amber-200/80',
                          )}
                        >
                          <Plus className='h-3.5 w-3.5' />
                          Add note
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {noteWidgets.length === 0 && !isAddingNote && (
                      <p className='pb-2 pt-1 text-center text-[11px] italic text-white/25'>
                        No notes yet — capture context, decisions, or
                        follow-ups.
                      </p>
                    )}
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <>
      {expandedOverlay}
      <motion.div
        onClick={() => onClick(job)}
        className='group cursor-pointer'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 260,
          opacity: { duration: 0.3, delay: index * 0.05 },
          y: { duration: 0.3, delay: index * 0.05 },
        }}
      >
        <div
          className={cn(
            'liquid-glass-dark relative flex w-full flex-col gap-2.5 overflow-hidden !rounded-xl p-4 pt-5 shadow-lg transition-all duration-300',
            isOther && 'opacity-30 blur-[1px]',
          )}
        >
          {/* Glassmorphic hover glow */}
          <div
            className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-75 group-hover:opacity-100'
            style={{
              background:
                'linear-gradient(-45deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 40%, transparent 60%)',
            }}
          />

          {/* Editing-in-progress pill (collapsed card).
              Owns its own row above the title/badge clusters so it never
              wraps inline with the Merged badge / segment / tier badges
              and never overlaps the title. Animates height so toggling
              `isEditing` reflows cleanly without popping. */}
          <AnimatePresence initial={false}>
            {isEditing && (
              <motion.div
                key='jtbd-editing-pill'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className='overflow-hidden'
              >
                <div className='inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-200/90 shadow-sm backdrop-blur-sm'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Editing…
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* JTBD title */}
          <h3 className='text-sm font-normal leading-snug tracking-[0.01em] text-white/60'>
            <ParsedTitle title={job.jtbdTitle} />
          </h3>

          {/* Description — short summary, hard-truncated to 2 lines via CSS.
              No inline expand affordance: clicking the card opens the full
              overlay (which renders the same summary inside `Text.Collapsible`
              for in-place expand/collapse). */}
          {job.summary && (
            <p className='line-clamp-3 text-[12px] leading-relaxed text-white/45'>
              {job.summary}
            </p>
          )}

          {/* Video preview */}
          {job.videoUrl && <JTBDVideoPlayer src={job.videoUrl} />}

          {/* Bottom badges */}
          <div className='mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pb-2'>
            <div className='flex items-center gap-1'>
              <Trophy className='h-3 w-3 shrink-0 text-white/40' />
              <span className='text-[10px] leading-none text-white/40'>
                Opportunity
              </span>
              <span
                className='text-[10px] font-semibold leading-none'
                style={{ color: 'hsl(153 79% 40%)' }}
              >
                {opportunityDollars(job.opportunityScore)}
              </span>
              {job.opportunityReasoning && (
                <ComponentTooltip
                  preferredPosition='above'
                  tip={
                    <div className='max-w-[400px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
                      {job.opportunityReasoning}
                    </div>
                  }
                >
                  <HelpCircle className='h-2.5 w-2.5 cursor-help text-white/30 transition-colors hover:text-white/50' />
                </ComponentTooltip>
              )}
            </div>
            <div className='flex items-center gap-1'>
              <ShieldCheck className='h-3 w-3 shrink-0 text-white/40' />
              <span className='text-[10px] leading-none text-white/40'>
                Evidence
              </span>
              <span className='text-[10px] font-semibold leading-none text-white/70'>
                {evidenceLabel(job.evidenceStrength)}
              </span>
              {job.evidenceStrengthReasoning && (
                <ComponentTooltip
                  preferredPosition='above'
                  tip={
                    <div className='max-w-[400px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
                      {job.evidenceStrengthReasoning}
                    </div>
                  }
                >
                  <HelpCircle className='h-2.5 w-2.5 cursor-help text-white/30 transition-colors hover:text-white/50' />
                </ComponentTooltip>
              )}
            </div>
          </div>

          {/* Segment row */}
          <div className='flex items-center gap-2'>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                segmentColors[job.segment] ?? segmentColors.b2c,
              )}
            >
              {job.segment === 'b2c' ? 'B2C' : 'B2B'}
            </span>
            {job.mergedFromScanUuid && (
              <ComponentTooltip
                preferredPosition='above'
                tip={
                  <div className='max-w-[320px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
                    {job.mergeRationale ??
                      'Merged from a prior scan — sources unioned, scoring refreshed, core need preserved.'}
                  </div>
                }
              >
                <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60'>
                  <GitMerge className='h-2.5 w-2.5' />
                  Merged
                </span>
              </ComponentTooltip>
            )}
          </div>

          {/* Opportunity tier badge */}
          <span
            className={cn(
              'inline-block w-fit rounded-full border px-2 py-0.5 text-[10px]',
              tierColors[job.opportunityTier],
            )}
          >
            {tierLabels[job.opportunityTier]}
          </span>
        </div>
      </motion.div>
    </>
  );
};
