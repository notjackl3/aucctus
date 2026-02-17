/**
 * EvidenceFoundWidget - Horizontal carousel of evidence cards
 *
 * This component renders ONLY the evidence carousel.
 * The compact indicator (count + View/Hide button) is in PersonaMetricsCard.
 * This widget is shown when the user clicks "View" in the metrics row.
 *
 * Design: Single-row horizontal scroll carousel with fixed-width cards.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ClipboardList,
  BarChart3,
  MessageCircle,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { cn } from '@libs/utils/react';

/** Evidence type for display */
export type EvidenceType = 'document' | 'survey' | 'analytics' | 'interview';

/** Evidence item structure */
export interface EvidenceItem {
  uuid: string;
  type: EvidenceType;
  title: string;
  source?: string;
  sourceTag?: string;
  excerpt?: string;
  suggestedUpdate?: string;
  targetField?: string;
  relevance: 'high' | 'medium' | 'low';
}

/** Props for the EvidenceFoundWidget component */
export interface EvidenceFoundWidgetProps {
  /** List of pending evidence items */
  pendingEvidence: EvidenceItem[];
  /** Callback when evidence is accepted */
  onAccept?: (uuid: string) => void;
  /** Callback when evidence is ignored */
  onIgnore?: (uuid: string) => void;
  /** Callback to close/hide the carousel */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/** Configuration for evidence type badges */
const evidenceTypeConfig: Record<
  EvidenceType,
  { label: string; icon: LucideIcon; colorClass: string; badgeClass: string }
> = {
  document: {
    label: 'Document',
    icon: FileText,
    colorClass: 'text-blue-600 dark:text-blue-400',
    badgeClass:
      'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  },
  survey: {
    label: 'Survey',
    icon: ClipboardList,
    colorClass: 'text-purple-600 dark:text-purple-400',
    badgeClass:
      'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
  },
  analytics: {
    label: 'Analytics',
    icon: BarChart3,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass:
      'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
  },
  interview: {
    label: 'Interview',
    icon: MessageCircle,
    colorClass: 'text-amber-600 dark:text-amber-400',
    badgeClass:
      'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  },
};

/**
 * Evidence Card Component - Fixed-width card for horizontal carousel
 */
interface EvidenceCardProps {
  evidence: EvidenceItem;
  onAccept?: () => void;
  onIgnore?: () => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = React.memo(
  function EvidenceCard({ evidence, onAccept, onIgnore }: EvidenceCardProps) {
    const typeConfig = evidenceTypeConfig[evidence.type];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className='aucctus-bg-primary aucctus-border-primary flex w-72 flex-shrink-0 flex-col rounded-xl border p-3 shadow-sm'
      >
        {/* Title */}
        <h4 className='aucctus-text-sm-medium aucctus-text-primary mb-2 line-clamp-1 leading-tight'>
          {evidence.title}
        </h4>

        {/* Source badges */}
        <div className='mb-3 flex flex-wrap gap-1'>
          <span
            className={cn(
              'inline-flex h-5 items-center rounded border px-1.5 py-0 text-[10px]',
              typeConfig.badgeClass,
            )}
          >
            <typeConfig.icon
              className={cn('mr-1 h-3 w-3', typeConfig.colorClass)}
            />
            {typeConfig.label}
          </span>
          {evidence.source && (
            <span className='aucctus-bg-secondary aucctus-border-secondary inline-flex h-5 items-center rounded border px-1.5 py-0 text-[10px]'>
              {evidence.source}
            </span>
          )}
          {evidence.sourceTag && (
            <span className='aucctus-bg-secondary aucctus-border-secondary inline-flex h-5 items-center rounded border px-1.5 py-0 text-[10px] font-medium'>
              {evidence.sourceTag}
            </span>
          )}
        </div>

        {/* Suggested update */}
        <div className='mb-3 flex-1 rounded-lg border border-[#F79009]/20 bg-[#F79009]/5 p-2'>
          <span className='mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-[#F79009]'>
            Suggested Update
          </span>
          <p className='aucctus-text-secondary text-xs leading-snug'>
            Update &ldquo;
            {evidence.targetField
              ? evidence.targetField
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
              : 'Context'}
            &rdquo; widget
          </p>
        </div>

        {/* Actions */}
        <div className='mt-auto flex gap-2'>
          <button
            onClick={onAccept}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700'
          >
            <Check className='h-3.5 w-3.5' />
            Accept
          </button>
          <button
            onClick={onIgnore}
            className='aucctus-border-secondary aucctus-text-secondary hover:aucctus-bg-tertiary flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-transparent px-3 py-2 text-xs font-medium transition-colors'
          >
            <X className='h-3.5 w-3.5' />
            Ignore
          </button>
        </div>
      </motion.div>
    );
  },
);

/**
 * EvidenceFoundWidget Component
 *
 * Renders a horizontal scrolling carousel of evidence cards.
 * Should be rendered below PersonaMetricsCard when evidence is visible.
 */
const EvidenceFoundWidget: React.FC<EvidenceFoundWidgetProps> = ({
  pendingEvidence,
  onAccept,
  onIgnore,
  onClose,
  className,
}) => {
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  const remainingEvidence = pendingEvidence.filter(
    (e) => !processedIds.has(e.uuid),
  );
  const pendingCount = remainingEvidence.length;

  const handleAccept = useCallback(
    (uuid: string) => {
      setProcessedIds((prev) => new Set([...prev, uuid]));
      onAccept?.(uuid);
    },
    [onAccept],
  );

  const handleIgnore = useCallback(
    (uuid: string) => {
      setProcessedIds((prev) => new Set([...prev, uuid]));
      onIgnore?.(uuid);
    },
    [onIgnore],
  );

  // Show "all caught up" state when all evidence has been processed
  if (remainingEvidence.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          'aucctus-bg-secondary aucctus-border-secondary rounded-xl border p-6 text-center',
          className,
        )}
      >
        <div className='flex flex-col items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30'>
            <Check className='h-6 w-6 text-emerald-600 dark:text-emerald-400' />
          </div>
          <div>
            <h4 className='aucctus-text-sm-medium aucctus-text-primary'>
              All caught up!
            </h4>
            <p className='aucctus-text-tertiary mt-1 text-sm'>
              No new evidence to review
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className='btn btn-outline btn-sm mt-2'>
              Close
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Sparkles className='h-4 w-4 text-[#F79009]' />
          <span className='aucctus-text-sm-medium aucctus-text-primary'>
            New Training Evidence
          </span>
          <span className='aucctus-border-secondary aucctus-text-tertiary inline-flex items-center rounded border px-2 py-0.5 text-[10px]'>
            {pendingCount} to review
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className='aucctus-text-tertiary hover:aucctus-text-primary flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      {/* Horizontal carousel */}
      <div className='-mx-1 overflow-x-auto px-1 pb-2'>
        <div className='flex gap-3'>
          <AnimatePresence>
            {remainingEvidence.map((evidence) => (
              <EvidenceCard
                key={evidence.uuid}
                evidence={evidence}
                onAccept={() => handleAccept(evidence.uuid)}
                onIgnore={() => handleIgnore(evidence.uuid)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EvidenceFoundWidget;
