import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon, toast } from '@components';
import { cn } from '@libs/utils/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Signal } from '../types';
import { signalTypeConfig, signalCategoryConfig } from '../types';

// Source type colors for avatars
const sourceTypeColors: Record<string, string> = {
  News: 'bg-blue-500',
  Report: 'bg-purple-500',
  Analysis: 'bg-amber-500',
  Internal: 'bg-slate-500',
  Filing: 'bg-amber-500',
};

// Get initials from source title (first letter of first two words)
const getSourceInitials = (title: string): string => {
  const words = title.split(' ').filter((w) => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return title.substring(0, 2).toUpperCase();
};

const getSourceColor = (type: string): string => {
  return sourceTypeColors[type] || 'bg-slate-500';
};

// Helper function to format relative dates
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks === 1) return 'Last week';
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface SignalCarouselWidgetProps {
  signals: Signal[];
  selectedSignal: Signal | null;
  onSelectSignal: (signal: Signal) => void;
  pinnedSignalIds?: string[];
  onPinSignal?: (signal: Signal) => void;
}

const SignalCarouselWidget: React.FC<SignalCarouselWidgetProps> = ({
  signals,
  selectedSignal,
  onSelectSignal,
  pinnedSignalIds = [],
  onPinSignal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const isInternalSelection = useRef(false);

  // Auto-cycle through signals
  useEffect(() => {
    if (!isPlaying || isExpanded || signals.length === 0) return;

    const interval = setInterval(() => {
      isInternalSelection.current = true;
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % signals.length;
        // Also update radar selection during auto-cycle
        onSelectSignal(signals[newIndex]);
        return newIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, isExpanded, signals.length, signals, onSelectSignal]);

  // Update current index when selected signal changes externally
  useEffect(() => {
    if (selectedSignal) {
      const idx = signals.findIndex((s) => s.id === selectedSignal.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
        // Pause auto-play when selection comes from outside (e.g., radar click)
        if (!isInternalSelection.current) {
          setIsPlaying(false);
        }
        isInternalSelection.current = false;
      }
    }
  }, [selectedSignal, signals]);

  const currentSignal = signals[currentIndex];

  const goNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % signals.length;
    isInternalSelection.current = true;
    setCurrentIndex(newIndex);
    onSelectSignal(signals[newIndex]);
  }, [currentIndex, signals, onSelectSignal]);

  const goPrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + signals.length) % signals.length;
    isInternalSelection.current = true;
    setCurrentIndex(newIndex);
    onSelectSignal(signals[newIndex]);
  }, [currentIndex, signals, onSelectSignal]);

  const handleExpand = () => {
    setIsExpanded(true);
    setIsPlaying(false);
    if (currentSignal) {
      onSelectSignal(currentSignal);
    }
  };

  if (signals.length === 0) return null;

  return (
    <>
      {/* Collapsed mini widget */}
      <div
        className={cn(
          'absolute right-6 top-6 z-20 transition-all duration-300 ease-in-out',
          isExpanded ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        <div className='w-72 overflow-hidden rounded-xl border border-white/15 bg-black/40 shadow-2xl backdrop-blur-xl'>
          {/* Header with source badges and expand button */}
          <div className='flex items-center justify-between border-b border-white/10 px-3 py-2'>
            <div className='flex items-center gap-2'>
              {/* Source badges in header */}
              {currentSignal?.sources && currentSignal.sources.length > 0 ? (
                <div className='inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/20 bg-white/5 px-1.5 py-0.5'>
                  <div className='flex -space-x-1.5'>
                    {currentSignal.sources.slice(0, 3).map((src, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-medium text-white ring-1 ring-white/30',
                          getSourceColor(src.type),
                        )}
                        style={{ zIndex: 3 - idx }}
                      >
                        {getSourceInitials(src.title)}
                      </div>
                    ))}
                  </div>
                  <span className='text-[9px] text-white/60'>
                    {currentSignal.sources.length}
                  </span>
                </div>
              ) : (
                <span className='text-[10px] font-medium uppercase tracking-wider text-white/50'>
                  Signals
                </span>
              )}
              {/* New indicator dot */}
              {currentSignal?.isNew && (
                <div
                  className='h-2 w-2 flex-shrink-0 rounded-full'
                  style={{ backgroundColor: '#1570EF' }}
                />
              )}
              {/* Concept impact indicator */}
              {currentSignal?.conceptImpacts &&
                currentSignal.conceptImpacts.some(
                  (impact) => impact.isMaterial,
                ) && (
                  <div className='flex items-center gap-1 rounded-full bg-amber-500/20 px-1.5 py-0.5'>
                    <Icon
                      variant='lightbulb'
                      height={10}
                      width={10}
                      className='stroke-amber-400'
                    />
                    <span className='text-[9px] text-amber-300'>
                      {
                        currentSignal.conceptImpacts.filter(
                          (impact) => impact.isMaterial,
                        ).length
                      }
                    </span>
                  </div>
                )}
            </div>
            <div className='flex items-center gap-1'>
              {/* Pin button */}
              {currentSignal && onPinSignal && (
                <button
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded transition-colors',
                    pinnedSignalIds.includes(currentSignal.id)
                      ? 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/40'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinSignal(currentSignal);
                  }}
                  title={
                    pinnedSignalIds.includes(currentSignal.id)
                      ? 'Unpin signal'
                      : 'Pin signal'
                  }
                >
                  <Icon
                    variant='star-01'
                    height={12}
                    width={12}
                    className='fill-current stroke-current'
                  />
                </button>
              )}
              <button
                className='flex h-6 items-center gap-1 rounded bg-white/10 px-2 text-[10px] text-white/80 hover:bg-white/20 hover:text-white'
                onClick={handleExpand}
              >
                <Icon
                  variant='expand-06'
                  height={12}
                  width={12}
                  className='stroke-current'
                />
                Expand
              </button>
            </div>
          </div>

          {/* Signal card content */}
          {currentSignal && (
            <div className='p-3'>
              {/* Type/category badges and time horizon */}
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-1.5'>
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium',
                      currentSignal.type === 'threat' &&
                        'border-red-500/30 bg-red-500/20 text-red-300',
                      currentSignal.type === 'opportunity' &&
                        'border-green-500/30 bg-green-500/20 text-green-300',
                      currentSignal.type === 'watch' &&
                        'border-slate-400/30 bg-slate-500/20 text-slate-300',
                    )}
                  >
                    <Icon
                      variant={
                        currentSignal.type === 'threat'
                          ? 'alert-triangle'
                          : currentSignal.type === 'opportunity'
                            ? 'sparkles'
                            : 'eye'
                      }
                      height={10}
                      width={10}
                      className='stroke-current'
                    />
                    {signalTypeConfig[currentSignal.type].label}
                  </div>
                  <div className='flex items-center gap-1 rounded border border-white/20 bg-white/15 px-1.5 py-0.5 text-[10px] text-white/80'>
                    <Icon
                      variant={
                        signalCategoryConfig[currentSignal.category]
                          .iconVariant as any
                      }
                      height={10}
                      width={10}
                      className='stroke-current'
                    />
                    {signalCategoryConfig[currentSignal.category].label}
                  </div>
                </div>
                <div className='flex items-center gap-1 text-[10px] text-white/50'>
                  <Icon
                    variant='clock'
                    height={10}
                    width={10}
                    className='stroke-current'
                  />
                  {formatRelativeDate(currentSignal.dateAdded)}
                </div>
              </div>

              {/* Title */}
              <h4 className='mb-1.5 line-clamp-2 text-sm font-medium leading-snug text-white'>
                {currentSignal.title}
              </h4>

              {/* Description preview - use whatChanged as the summary */}
              <p className='line-clamp-2 text-[11px] leading-relaxed text-white/50'>
                {currentSignal.whatChanged}
              </p>
            </div>
          )}

          {/* Footer with navigation controls and progress dots */}
          <div className='flex items-center justify-between border-t border-white/10 px-3 py-2'>
            <div className='flex items-center gap-1'>
              {(() => {
                const maxDots = 8;
                const totalSignals = signals.length;

                // Page-based pagination: show signals 0-7, 8-15, 16-23, etc.
                const currentPage = Math.floor(currentIndex / maxDots);
                const startIdx = currentPage * maxDots;
                const endIdx = Math.min(startIdx + maxDots, totalSignals);

                const visibleSignals = signals.slice(startIdx, endIdx);
                const beforeCount = startIdx;
                const afterCount = totalSignals - endIdx;

                return (
                  <>
                    {beforeCount > 0 && (
                      <span className='mr-1 text-[8px] text-white/30'>
                        {beforeCount}+
                      </span>
                    )}
                    {visibleSignals.map((signal, idx) => {
                      const actualIdx = startIdx + idx;
                      return (
                        <button
                          key={signal.id}
                          onClick={() => {
                            isInternalSelection.current = true;
                            setCurrentIndex(actualIdx);
                            onSelectSignal(signals[actualIdx]);
                          }}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-200',
                            actualIdx === currentIndex
                              ? 'w-3 bg-white'
                              : 'w-1.5 bg-white/30 hover:bg-white/50',
                          )}
                        />
                      );
                    })}
                    {afterCount > 0 && (
                      <span className='ml-1 text-[8px] text-white/30'>
                        +{afterCount}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>

            <div className='flex items-center gap-1'>
              <button
                className='flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white/80 transition-colors hover:bg-white/25 hover:text-white'
                onClick={goPrev}
              >
                <Icon
                  variant='chevronleft'
                  height={20}
                  width={20}
                  className='stroke-current'
                />
              </button>
              <button
                className='flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white/80 transition-colors hover:bg-white/25 hover:text-white'
                onClick={goNext}
              >
                <Icon
                  variant='chevronright'
                  height={20}
                  width={20}
                  className='stroke-current'
                />
              </button>
              <button
                className='flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white/80 transition-colors hover:bg-white/25 hover:text-white'
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Icon
                  variant={isPlaying ? 'clock-stopwatch' : 'play'}
                  height={16}
                  width={16}
                  className='stroke-current'
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded overlay panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className='absolute bottom-0 right-0 top-0 z-30'
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className='h-full w-[420px] border-l border-white/15 bg-black/60 backdrop-blur-xl'>
              {/* Header */}
              <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold text-white'>
                    Signal Details
                  </span>
                  <span className='text-xs text-white/40'>
                    {currentIndex + 1} of {signals.length}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    className='flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white'
                    onClick={goPrev}
                  >
                    <Icon
                      variant='chevronleft'
                      height={16}
                      width={16}
                      className='stroke-current'
                    />
                  </button>
                  <button
                    className='flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white'
                    onClick={goNext}
                  >
                    <Icon
                      variant='chevronright'
                      height={16}
                      width={16}
                      className='stroke-current'
                    />
                  </button>
                  {currentSignal && onPinSignal && (
                    <button
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded transition-colors',
                        pinnedSignalIds.includes(currentSignal.id)
                          ? 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/40'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
                      )}
                      onClick={() => onPinSignal(currentSignal)}
                      title={
                        pinnedSignalIds.includes(currentSignal.id)
                          ? 'Unpin signal'
                          : 'Pin signal'
                      }
                    >
                      <Icon
                        variant='star-01'
                        height={16}
                        width={16}
                        className='fill-current stroke-current'
                      />
                    </button>
                  )}
                  <button
                    className='flex h-7 w-7 items-center justify-center rounded bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white'
                    onClick={() => setIsExpanded(false)}
                  >
                    <Icon
                      variant='closeX'
                      height={16}
                      width={16}
                      className='stroke-current'
                    />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className='h-[calc(100%-53px)] overflow-y-auto'>
                {currentSignal && (
                  <div className='space-y-5 p-4'>
                    {/* Type badges row */}
                    <div className='flex flex-wrap items-center gap-2'>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium',
                          currentSignal.type === 'threat' &&
                            'border-red-500/25 bg-red-500/15 text-red-300',
                          currentSignal.type === 'opportunity' &&
                            'border-green-500/25 bg-green-500/15 text-green-300',
                          currentSignal.type === 'watch' &&
                            'border-white/20 bg-white/10 text-white/70',
                        )}
                      >
                        <Icon
                          variant={
                            currentSignal.type === 'threat'
                              ? 'alert-triangle'
                              : currentSignal.type === 'opportunity'
                                ? 'sparkles'
                                : 'eye'
                          }
                          height={12}
                          width={12}
                          className='stroke-current'
                        />
                        {signalTypeConfig[currentSignal.type].label}
                      </div>
                      <div className='flex items-center gap-1.5 rounded border border-white/15 bg-white/10 px-2 py-1 text-xs text-white/60'>
                        <Icon
                          variant={
                            signalCategoryConfig[currentSignal.category]
                              .iconVariant as any
                          }
                          height={12}
                          width={12}
                          className='stroke-current'
                        />
                        {signalCategoryConfig[currentSignal.category].label}
                      </div>
                      {currentSignal.isNew && (
                        <div
                          className='h-2.5 w-2.5 flex-shrink-0 rounded-full'
                          style={{ backgroundColor: '#1570EF' }}
                        />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className='text-lg font-semibold leading-snug text-white'>
                      {currentSignal.title}
                    </h3>

                    {/* Source pills under title */}
                    {currentSignal.sources &&
                      currentSignal.sources.length > 0 && (
                        <div className='-mt-2 flex flex-wrap items-center gap-1.5'>
                          {currentSignal.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className='flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-1 transition-colors hover:bg-white/20'
                            >
                              <div
                                className={cn(
                                  'flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-medium text-white',
                                  getSourceColor(source.type),
                                )}
                              >
                                {getSourceInitials(source.title)}
                              </div>
                              <span className='max-w-[120px] truncate text-[10px] text-white/70'>
                                {source.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Meta row */}
                    <div className='flex items-center gap-3 text-[11px] text-white/50'>
                      <div className='flex items-center gap-1.5'>
                        <Icon
                          variant='clock'
                          height={12}
                          width={12}
                          className='stroke-current'
                        />
                        <span className='text-white/70'>
                          {formatRelativeDate(currentSignal.dateAdded)}
                        </span>
                      </div>
                    </div>

                    {/* Recommended Action - HIGHLIGHTED */}
                    <div
                      className={cn(
                        'rounded-lg border p-3',
                        currentSignal.type === 'threat' &&
                          'border-red-500/20 bg-red-500/10',
                        currentSignal.type === 'opportunity' &&
                          'border-green-500/20 bg-green-500/10',
                        currentSignal.type === 'watch' &&
                          'border-white/15 bg-white/5',
                      )}
                    >
                      <div className='mb-2 flex items-center gap-1.5'>
                        <Icon
                          variant='lightbulb'
                          height={14}
                          width={14}
                          className={cn(
                            'stroke-current',
                            currentSignal.type === 'threat' && 'text-red-400',
                            currentSignal.type === 'opportunity' &&
                              'text-green-400',
                            currentSignal.type === 'watch' && 'text-white/60',
                          )}
                        />
                        <span className='text-[10px] font-semibold uppercase tracking-wider text-white/50'>
                          Recommended Action
                        </span>
                      </div>
                      <p className='text-sm leading-relaxed text-white/90'>
                        {currentSignal.recommendedAction}
                      </p>
                    </div>

                    {/* Content sections with consistent hierarchy */}
                    <div className='space-y-4'>
                      {/* What Changed */}
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5'>
                          <Icon
                            variant='trendup'
                            height={12}
                            width={12}
                            className='stroke-white/40'
                          />
                          <span className='text-[10px] font-semibold uppercase tracking-wider text-white/40'>
                            What Changed
                          </span>
                        </div>
                        <p className='pl-4 text-sm leading-relaxed text-white/75'>
                          {currentSignal.whatChanged}
                        </p>
                      </div>

                      {/* Why It Matters */}
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5'>
                          <Icon
                            variant='alert-circle'
                            height={12}
                            width={12}
                            className='stroke-white/40'
                          />
                          <span className='text-[10px] font-semibold uppercase tracking-wider text-white/40'>
                            Why It Matters
                          </span>
                        </div>
                        <p className='pl-4 text-sm leading-relaxed text-white/75'>
                          {currentSignal.whyItMatters}
                        </p>
                      </div>

                      {/* Likely Impact */}
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-1.5'>
                          <Icon
                            variant='trending-up'
                            height={12}
                            width={12}
                            className='stroke-white/40'
                          />
                          <span className='text-[10px] font-semibold uppercase tracking-wider text-white/40'>
                            Likely Impact
                          </span>
                        </div>
                        <p className='pl-4 text-sm leading-relaxed text-white/75'>
                          {currentSignal.likelyImpact}
                        </p>
                      </div>
                    </div>

                    {/* Impacted Concepts Section */}
                    {(() => {
                      const conceptImpacts = currentSignal.conceptImpacts || [];
                      const materialImpacts = conceptImpacts.filter(
                        (impact) => impact.isMaterial,
                      );
                      const noMaterialImpact =
                        conceptImpacts.length > 0 &&
                        materialImpacts.length === 0;

                      return (
                        <div className='space-y-3 border-t border-white/10 pt-4'>
                          <div className='flex items-center gap-1.5'>
                            <Icon
                              variant='lightbulb'
                              height={14}
                              width={14}
                              className='stroke-amber-400/70'
                            />
                            <span className='text-xs font-semibold uppercase tracking-wider text-white/60'>
                              Concept Impacts
                            </span>
                            {materialImpacts.length > 0 && (
                              <span className='rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300'>
                                {materialImpacts.length}
                              </span>
                            )}
                          </div>

                          {materialImpacts.length > 0 ? (
                            <>
                              <p className='-mt-1 text-xs text-white/50'>
                                This signal may cause major disruption or
                                acceleration to concepts in your bank.
                              </p>

                              {/* Vertical list of impact cards */}
                              <div className='space-y-3'>
                                {materialImpacts.map((impact) => (
                                  <motion.div
                                    key={impact.uuid}
                                    className='rounded-lg border border-white/10 bg-white/5 p-3'
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <div className='space-y-2'>
                                      <h5 className='text-sm font-semibold leading-snug text-white'>
                                        {impact.conceptName}
                                      </h5>

                                      <div className='flex items-start gap-1.5'>
                                        <Icon
                                          variant='alert-circle'
                                          height={12}
                                          width={12}
                                          className='mt-0.5 flex-shrink-0 stroke-red-400/70'
                                        />
                                        <p className='text-xs leading-relaxed text-white/70'>
                                          {impact.impactStatement}
                                        </p>
                                      </div>

                                      <div className='flex items-center gap-2 pt-1'>
                                        <button
                                          onClick={() => {
                                            toast.info(
                                              `Opening "${impact.conceptName}"`,
                                              'Navigating to concept details...',
                                            );
                                          }}
                                          className='flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/20'
                                        >
                                          <Icon
                                            variant='link-external'
                                            height={12}
                                            width={12}
                                            className='stroke-current'
                                          />
                                          View Concept
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </>
                          ) : noMaterialImpact ? (
                            <div className='rounded-lg border border-green-500/20 bg-green-500/10 p-3'>
                              <p className='text-xs text-green-300/80'>
                                <Icon
                                  variant='check'
                                  height={12}
                                  width={12}
                                  className='mr-1.5 inline stroke-current'
                                />
                                No material impact on active or near-term
                                concepts identified.
                              </p>
                            </div>
                          ) : (
                            <p className='text-xs italic text-white/40'>
                              Concept impact assessment not yet available for
                              this signal.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(SignalCarouselWidget);
