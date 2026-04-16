import type { IJTBDJob, JTBDWidgetType } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Crosshair,
  HelpCircle,
  Lightbulb,
  Loader2,
  Map,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

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
}) => {
  const sortedWidgets = isSelected
    ? [...job.customWidgets].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  const marketSizingWidgets = sortedWidgets.filter(
    (w) => w.widgetType === 'market_sizing',
  );
  const evidenceWidgets = sortedWidgets.filter(
    (w) => w.widgetType !== 'market_sizing',
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
            onClick={() => onClick(job)}
          >
            <div
              className='liquid-glass-dark relative flex max-h-[90vh] w-full max-w-[75vw] flex-col overflow-hidden !rounded-2xl shadow-2xl'
              onClick={(e) => e.stopPropagation()}
            >
              {/* ===== FIXED HEADER ===== */}
              <div className='flex-shrink-0 border-b border-white/[0.08] px-6 pb-5 pt-4'>
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
                    <p className='text-sm text-white/50'>{job.summary}</p>

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
                  </div>

                  {/* Ideate Solutions CTA */}
                  {onIdeate && (
                    <div className='flex-shrink-0 self-start'>
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
                    </div>
                  )}
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
                          className='col-span-1 rounded-lg border border-white/[0.1] bg-white/[0.05] p-4'
                        >
                          <div className='mb-2 flex items-center gap-2'>
                            <Crosshair className='h-3.5 w-3.5 text-rose-400/70' />
                            <span className='text-[11px] font-semibold uppercase tracking-wider text-white/50'>
                              Root Constraint
                            </span>
                          </div>
                          <p className='text-[13px] leading-relaxed text-white/70'>
                            {job.rootConstraint}
                          </p>
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
                          className='col-span-1 rounded-lg border border-white/[0.1] bg-white/[0.05] p-4'
                        >
                          <div className='mb-2 flex items-center gap-2'>
                            <Map className='h-3.5 w-3.5 text-sky-400/70' />
                            <span className='text-[11px] font-semibold uppercase tracking-wider text-white/50'>
                              Solution Landscape
                            </span>
                          </div>
                          <p className='text-[13px] leading-relaxed text-white/70'>
                            {job.solutionLandscape}
                          </p>
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
                          <p className='text-[13px] leading-relaxed text-white/70'>
                            {job.capabilityFit}
                          </p>
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
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </div>

                    {/* Corroboration indicator */}
                    {job.corroborationLabel && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className='flex items-center gap-2 pb-1 pt-2'
                      >
                        <ShieldCheck className='h-3 w-3 text-white/30' />
                        <span className='text-[11px] text-white/40'>
                          {job.corroborationLabel}
                        </span>
                        {job.sourceTypeCount > 0 && (
                          <span className='text-[11px] text-white/30'>
                            ({job.sourceTypeCount} source{' '}
                            {job.sourceTypeCount === 1 ? 'type' : 'types'})
                          </span>
                        )}
                      </motion.div>
                    )}
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
                          <WidgetRenderer widget={widget} />
                        </motion.div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Evidence Widgets — everything except market_sizing */}
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
                          <WidgetRenderer widget={widget} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className='py-4 text-center text-xs text-white/30'>
                      No evidence widgets available for this job.
                    </p>
                  )}
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

          {/* JTBD title */}
          <h3 className='text-[15px] font-normal leading-snug tracking-[0.01em] text-white/60'>
            <ParsedTitle title={job.jtbdTitle} />
          </h3>

          {/* Video preview */}
          {job.videoUrl && <JTBDVideoPlayer src={job.videoUrl} />}

          {/* Bottom badges */}
          <div className='mt-auto flex items-center gap-5'>
            <div className='flex items-center gap-1.5'>
              <Trophy className='h-3.5 w-3.5 shrink-0 text-white/40' />
              <span className='text-[11px] leading-none text-white/40'>
                Opportunity
              </span>
              <span
                className='text-[11px] font-semibold leading-none'
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
                  <HelpCircle className='h-3 w-3 cursor-help text-white/30 transition-colors hover:text-white/50' />
                </ComponentTooltip>
              )}
            </div>
            <div className='flex items-center gap-1.5'>
              <ShieldCheck className='h-3.5 w-3.5 shrink-0 text-white/40' />
              <span className='text-[11px] leading-none text-white/40'>
                Evidence
              </span>
              <span className='text-[11px] font-semibold leading-none text-white/70'>
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
                  <HelpCircle className='h-3 w-3 cursor-help text-white/30 transition-colors hover:text-white/50' />
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
