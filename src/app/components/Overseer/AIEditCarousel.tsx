import { IAiEditingSuggestion } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface AIEditCarouselProps {
  edits: IAiEditingSuggestion[];
  reply?: string;
  onConfirm?: (selectedEdits: IAiEditingSuggestion[]) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  onActiveEditChange?: (edit: IAiEditingSuggestion) => void;
  readOnly?: boolean;
}

type EditStatus = 'pending' | 'accepted' | 'rejected';

const AIEditCarousel: React.FC<AIEditCarouselProps> = ({
  edits,
  reply,
  onConfirm,
  onCancel,
  isLoading,
  onActiveEditChange,
  readOnly,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<number, EditStatus>>(() =>
    Object.fromEntries(edits.map((_, i) => [i, 'pending' as EditStatus])),
  );

  const current = edits[currentIndex];

  // Notify parent when active edit changes (on mount and carousel navigation)
  useEffect(() => {
    if (current && onActiveEditChange) {
      onActiveEditChange(current);
    }
  }, [currentIndex, current, onActiveEditChange]);

  const acceptedEdits = edits.filter((_, i) => statuses[i] === 'accepted');
  const decidedCount = Object.values(statuses).filter(
    (s) => s !== 'pending',
  ).length;
  const allDecided = decidedCount === edits.length;

  const goTo = (i: number) => {
    setCurrentIndex(Math.max(0, Math.min(i, edits.length - 1)));
  };

  const handleStatusChange = (index: number, status: EditStatus) => {
    setStatuses((prev) => ({ ...prev, [index]: status }));

    // Auto-proceed for single-edit carousels
    if (edits.length === 1 && status === 'accepted') {
      onConfirm?.([edits[0]]);
      return;
    }

    if (index < edits.length - 1) {
      goTo(index + 1);
    }
  };

  const handleAcceptAll = () => {
    setStatuses(
      Object.fromEntries(edits.map((_, i) => [i, 'accepted' as EditStatus])),
    );
  };

  const handleContinue = () => {
    onConfirm?.(acceptedEdits);
  };

  if (!current) return null;

  const currentStatus = statuses[currentIndex];

  return (
    <div className='space-y-2'>
      {/* Reply text if present */}
      {reply && (
        <p className='text-[11px] font-light leading-relaxed text-white/60'>
          {reply}
        </p>
      )}

      {/* Card */}
      <div className='overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.06] backdrop-blur-xl'>
        {/* Header with nav */}
        <div className='flex items-center justify-between border-b border-white/[0.08] bg-white/[0.12] px-3 py-2 backdrop-blur-xl'>
          <div className='flex items-center gap-2'>
            <Pencil size={12} className='stroke-white/70' />
            <span className='text-[11px] font-medium text-white/90'>
              Proposed Changes · {currentIndex + 1}/{edits.length}
            </span>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className='rounded p-1 text-white/30 transition-colors hover:text-white/70 disabled:opacity-30'
            >
              <ChevronLeft size={14} className='stroke-current' />
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === edits.length - 1}
              className='rounded p-1 text-white/30 transition-colors hover:text-white/70 disabled:opacity-30'
            >
              <ChevronRight size={14} className='stroke-current' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='space-y-2 px-3 py-2.5'>
          <div className='text-[12px] font-medium text-white/80'>
            {current.title}
          </div>
          <div className='text-[11px] font-light leading-relaxed text-white/50'>
            {current.description}
          </div>
          <div className='rounded-md border border-white/[0.05] bg-white/[0.04] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/40'>
            {current.reason}
          </div>

          {/* Status badge */}
          {currentStatus !== 'pending' && (
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                currentStatus === 'accepted'
                  ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-300'
                  : 'border-red-400/30 bg-red-500/20 text-red-300',
              )}
            >
              <DynamicIcon
                variant={currentStatus === 'accepted' ? 'check' : 'closeX'}
                width={10}
                height={10}
                className='stroke-current'
              />
              {currentStatus === 'accepted' ? 'Accepted' : 'Rejected'}
            </div>
          )}
        </div>

        {/* Actions row */}
        <div className='flex items-center justify-between px-3 pb-2.5'>
          {/* Dot indicators */}
          <div className='flex items-center gap-1'>
            {edits.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === currentIndex
                    ? 'w-3 bg-white/70'
                    : statuses[i] === 'accepted'
                      ? 'w-1.5 bg-emerald-400/60'
                      : statuses[i] === 'rejected'
                        ? 'w-1.5 bg-red-400/60'
                        : 'w-1.5 bg-white/20',
                )}
              />
            ))}
          </div>

          {/* Per-card actions */}
          {!readOnly && currentStatus === 'pending' && (
            <div className='flex items-center gap-1.5'>
              <button
                onClick={() => handleStatusChange(currentIndex, 'rejected')}
                className='flex items-center gap-1 rounded-lg border border-red-400/20 px-2.5 py-1 text-[10px] font-medium text-red-300/70 transition-colors hover:bg-red-500/15 hover:text-red-300'
              >
                <X size={12} className='stroke-current' />
                Reject
              </button>
              <button
                onClick={() => handleStatusChange(currentIndex, 'accepted')}
                className='flex items-center gap-1 rounded-lg border border-emerald-400/20 px-2.5 py-1 text-[10px] font-medium text-emerald-300/70 transition-colors hover:bg-emerald-500/15 hover:text-emerald-300'
              >
                <Check size={12} className='stroke-current' />
                Accept
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global actions */}
      {!readOnly && (
        <div className='flex items-center gap-1.5'>
          <button
            onClick={handleAcceptAll}
            disabled={isLoading}
            className='flex items-center gap-1 rounded-full border border-white/[0.05] bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white/45 backdrop-blur-sm transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <CheckCircle2 size={12} className='stroke-current' />
            Accept all
          </button>
          {(acceptedEdits.length > 0 || allDecided) && (
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.10] px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm transition-colors',
                isLoading
                  ? 'cursor-not-allowed text-white/30'
                  : 'text-white/60 hover:text-white/90',
              )}
            >
              <DynamicIcon
                variant={isLoading ? 'loading-02' : 'arrowright'}
                width={12}
                height={12}
                className={cn('stroke-current', isLoading && 'animate-spin')}
              />
              {isLoading ? 'Applying...' : 'Continue'}
              {!isLoading && acceptedEdits.length > 0
                ? ` (${acceptedEdits.length})`
                : ''}
            </button>
          )}
          <button
            onClick={onCancel}
            disabled={isLoading}
            className='flex items-center gap-1 rounded-full border border-white/[0.05] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-white/35 transition-colors hover:text-white/55 disabled:cursor-not-allowed disabled:opacity-40'
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default AIEditCarousel;
