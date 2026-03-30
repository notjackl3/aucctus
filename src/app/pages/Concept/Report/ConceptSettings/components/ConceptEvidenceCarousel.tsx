/**
 * ConceptEvidenceCarousel — Horizontal carousel of evidence cards.
 * Mirrors the Living Personas EvidenceFoundWidget pattern.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, X, Sparkles } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@libs/utils/react';
import type { IConceptEvidence } from '@libs/api/types/conceptTrainingDocument';
import {
  SECTION_LABELS,
  formatSuggestedUpdate,
} from './ConceptDocumentModal.types';

export interface ConceptEvidenceCarouselProps {
  pendingEvidence: IConceptEvidence[];
  onAccept?: (uuid: string) => void;
  onIgnore?: (uuid: string) => void;
  onClose?: () => void;
  className?: string;
}

interface EvidenceCardProps {
  evidence: IConceptEvidence;
  onAccept?: () => void;
  onIgnore?: () => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = React.memo(
  function EvidenceCard({ evidence, onAccept, onIgnore }: EvidenceCardProps) {
    const formattedValue = useMemo(
      () =>
        evidence.suggestedUpdate
          ? formatSuggestedUpdate(
              evidence.suggestedUpdate,
              evidence.targetField,
            )
          : undefined,
      [evidence.suggestedUpdate, evidence.targetField],
    );

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className='aucctus-bg-primary aucctus-border-primary flex w-72 flex-shrink-0 flex-col rounded-xl border p-3 shadow-sm'
      >
        {/* Title — 2 lines instead of 1 */}
        <h4 className='aucctus-text-sm-medium aucctus-text-primary mb-2 line-clamp-2 leading-tight'>
          {evidence.title}
        </h4>

        {/* Source badges */}
        <div className='mb-3 flex flex-wrap gap-1'>
          <span className='inline-flex h-5 items-center rounded border border-blue-200 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
            <FileText className='mr-1 h-3 w-3 text-blue-600 dark:text-blue-400' />
            Document
          </span>
          {evidence.sourceTag && (
            <span className='aucctus-bg-secondary aucctus-border-secondary inline-flex h-5 items-center rounded border px-1.5 py-0 text-[10px] font-medium'>
              {evidence.sourceTag}
            </span>
          )}
          <span className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-tertiary inline-flex h-5 items-center rounded border px-1.5 py-0 text-[10px]'>
            {SECTION_LABELS[evidence.targetSection] || evidence.targetSection}
          </span>
        </div>

        {/* Suggested update — show actual proposed value instead of field name */}
        <div className='mb-3 flex-1 rounded-lg border border-[#F79009]/20 bg-[#F79009]/5 p-2'>
          <span className='mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-[#F79009]'>
            Suggested Update
          </span>
          <p className='aucctus-text-secondary line-clamp-3 text-xs leading-snug'>
            {formattedValue || evidence.suggestedUpdate}
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

const ConceptEvidenceCarousel: React.FC<ConceptEvidenceCarouselProps> = ({
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

export default ConceptEvidenceCarousel;
