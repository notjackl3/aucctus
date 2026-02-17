/**
 * PersonaMetricsCard - Stats bar with individual metric sub-cards and action buttons
 *
 * Layout: Individual bordered sub-cards for each metric, integrated evidence section
 * with View/Hide pill, and icon-only action buttons stacked vertically.
 */

import { GlassSurface } from '@components';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import {
  Check,
  FileText,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import React, { useMemo } from 'react';

/** Confidence level type */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/** Props for the PersonaMetricsCard component */
export interface PersonaMetricsCardProps {
  /** Number of concepts using this persona */
  conceptCount: number;
  /** Confidence level */
  confidence: ConfidenceLevel;
  /** Number of training documents */
  documentCount: number;
  /** ISO date string of last engagement */
  lastEngagedAt?: string;
  /** Number of pending evidence items */
  pendingEvidenceCount?: number;
  /** Callback to add a new widget */
  onAddWidget?: () => void;
  /** Callback to toggle edit/configure mode */
  onToggleEditMode?: () => void;
  /** Whether edit mode is active */
  isEditMode?: boolean;
  /** Callback to toggle evidence visibility */
  onToggleEvidence?: () => void;
  /** Whether evidence panel is visible */
  isEvidenceVisible?: boolean;
  /** Callback to delete persona */
  onDelete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formats a date as relative time with detail for "Today" case
 */
const formatRelativeTime = (
  dateStr?: string,
): { primary: string; detail?: string } => {
  if (!dateStr) return { primary: 'Never' };

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const detail = diffHours > 0 ? `${diffHours}h ago` : 'just now';
    return { primary: 'Today', detail };
  }
  if (diffDays === 1) return { primary: 'Yesterday' };
  if (diffDays < 7) return { primary: `${diffDays} days ago` };
  if (diffDays < 30)
    return { primary: `${Math.floor(diffDays / 7)} weeks ago` };
  if (diffDays < 365)
    return { primary: `${Math.floor(diffDays / 30)} months ago` };
  return { primary: `${Math.floor(diffDays / 365)} years ago` };
};

/**
 * Configuration for confidence levels
 */
const confidenceConfig: Record<
  ConfidenceLevel,
  {
    label: string;
    description: string;
    colorClass: string;
    barColorClass: string;
    percentage: number;
  }
> = {
  high: {
    label: 'High',
    description: 'Well-defined with strong data',
    colorClass: 'aucctus-text-success-primary',
    barColorClass: 'bg-emerald-500',
    percentage: 100,
  },
  medium: {
    label: 'Medium',
    description: 'Needs more training data',
    colorClass: 'aucctus-text-warning-primary',
    barColorClass: 'bg-amber-500',
    percentage: 60,
  },
  low: {
    label: 'Low',
    description: 'Requires significant refinement',
    colorClass: 'aucctus-text-error-primary',
    barColorClass: 'bg-red-500',
    percentage: 25,
  },
};

/**
 * Icon-only action button
 */
interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  variant?: 'default' | 'danger';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  isActive = false,
  variant = 'default',
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      'rounded-lg p-2 transition-colors',
      variant === 'danger'
        ? 'aucctus-text-error-primary hover:aucctus-bg-error-secondary'
        : isActive
          ? 'bg-black text-white'
          : 'aucctus-text-secondary hover:aucctus-bg-secondary',
    )}
    title={label}
  >
    {icon}
  </motion.button>
);

/**
 * PersonaMetricsCard Component
 */
const PersonaMetricsCard: React.FC<PersonaMetricsCardProps> = ({
  conceptCount,
  confidence,
  documentCount,
  lastEngagedAt,
  pendingEvidenceCount = 0,
  onAddWidget,
  onToggleEditMode,
  isEditMode = false,
  onToggleEvidence,
  isEvidenceVisible = false,
  onDelete,
  className,
}) => {
  const confidenceInfo = confidenceConfig[confidence];
  const relativeTime = useMemo(
    () => formatRelativeTime(lastEngagedAt),
    [lastEngagedAt],
  );
  const hasEvidence = pendingEvidenceCount > 0;
  const isToday = relativeTime.primary === 'Today';

  return (
    <GlassSurface className={cn('px-3 py-3', className)}>
      <div className='flex items-stretch gap-3'>
        {/* Metric Sub-Cards */}
        <div className='flex min-w-0 flex-1 items-stretch gap-3 overflow-x-auto'>
          {/* Used In */}
          <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary flex flex-col justify-center rounded-lg border px-4 py-2'>
            <span className='aucctus-text-tertiary mb-0.5 text-[10px] font-medium uppercase tracking-wider'>
              Used In
            </span>
            <div className='flex items-baseline gap-1.5'>
              <span className='aucctus-text-primary text-2xl font-bold leading-none'>
                {conceptCount}
              </span>
              <span className='aucctus-text-tertiary text-xs'>concepts</span>
            </div>
          </div>

          {/* Confidence */}
          <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary flex w-[220px] shrink-0 flex-col justify-center rounded-lg border px-4 py-2'>
            <div className='mb-1 flex items-center gap-1.5'>
              <ShieldCheck
                className={cn('h-3.5 w-3.5', confidenceInfo.colorClass)}
              />
              <span className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wider'>
                Confidence
              </span>
            </div>
            <div className='mb-1 flex items-center gap-2'>
              <span
                className={cn(
                  'text-sm font-semibold',
                  confidenceInfo.colorClass,
                )}
              >
                {confidenceInfo.label}
              </span>
              <div className='h-1.5 w-16 overflow-hidden rounded-full bg-white/10'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    confidenceInfo.barColorClass,
                  )}
                  style={{ width: `${confidenceInfo.percentage}%` }}
                />
              </div>
            </div>
            <span className='aucctus-text-tertiary text-[10px] leading-tight'>
              {confidenceInfo.description}
            </span>
          </div>

          {/* Training Data */}
          <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary flex flex-col justify-center rounded-lg border px-4 py-2'>
            <span className='aucctus-text-tertiary mb-0.5 text-[10px] font-medium uppercase tracking-wider'>
              Training Data
            </span>
            <div className='flex items-center gap-1.5'>
              <FileText className='aucctus-text-tertiary h-4 w-4' />
              <span className='aucctus-text-primary text-2xl font-bold leading-none'>
                {documentCount}
              </span>
              <span className='aucctus-text-tertiary text-xs'>documents</span>
            </div>
          </div>

          {/* Last Engaged */}
          <div className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary flex flex-col justify-center rounded-lg border px-4 py-2'>
            <span className='aucctus-text-tertiary mb-0.5 text-[10px] font-medium uppercase tracking-wider'>
              Last Engaged
            </span>
            <div className='flex items-center gap-1.5'>
              {isToday && (
                <span className='relative flex h-2 w-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
                </span>
              )}
              <span className='aucctus-text-primary text-sm font-bold'>
                {relativeTime.primary}
              </span>
              {relativeTime.detail && (
                <span className='aucctus-text-tertiary text-xs'>
                  · {relativeTime.detail}
                </span>
              )}
            </div>
          </div>

          {/* Evidence Section - flex-1 to fill remaining space */}
          {hasEvidence ? (
            <div className='flex min-w-0 flex-1 flex-col justify-center rounded-lg border border-[#F79009]/30 bg-[#F79009]/5 px-4 py-2'>
              <div className='mb-0.5 flex items-center gap-1.5'>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Sparkles className='h-3.5 w-3.5 text-[#F79009]' />
                </motion.div>
                <span className='text-[10px] font-medium uppercase tracking-wider text-[#F79009]'>
                  New Evidence Found
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-2xl font-bold leading-none text-[#F79009]'>
                  {pendingEvidenceCount}
                </span>
                <span className='aucctus-text-secondary text-xs'>
                  pending review
                </span>
                {onToggleEvidence && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleEvidence}
                    className='ml-auto rounded-full bg-[#F79009]/20 px-3 py-0.5 text-xs font-medium text-[#F79009] transition-colors hover:bg-[#F79009]/30'
                  >
                    {isEvidenceVisible ? 'Hide' : 'View'}
                  </motion.button>
                )}
              </div>
            </div>
          ) : (
            <div className='flex min-w-0 flex-1 flex-col justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2'>
              <div className='mb-0.5 flex items-center gap-1.5'>
                <Check className='h-3.5 w-3.5 text-emerald-500' />
                <span className='text-[10px] font-medium uppercase tracking-wider text-emerald-500'>
                  Up to Date
                </span>
              </div>
              <span className='aucctus-text-tertiary text-xs'>
                No new evidence
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Vertical Stack */}
        <div className='flex flex-col items-center gap-1'>
          {onAddWidget && (
            <ActionButton
              icon={<Plus className='h-4 w-4' />}
              label='Add Widget'
              onClick={onAddWidget}
            />
          )}
          {onToggleEditMode && (
            <ActionButton
              icon={
                isEditMode ? (
                  <Settings className='h-4 w-4' />
                ) : (
                  <Settings className='h-4 w-4' />
                )
              }
              label={isEditMode ? 'Done' : 'Configure'}
              onClick={onToggleEditMode}
              isActive={isEditMode}
            />
          )}
          {onDelete && (
            <ActionButton
              icon={<Trash2 className='h-4 w-4' />}
              label='Delete'
              onClick={onDelete}
              variant='danger'
            />
          )}
        </div>
      </div>
    </GlassSurface>
  );
};

export default PersonaMetricsCard;
