/**
 * InsightCard — 4-column card for displaying and acting on extracted evidence.
 *
 * Columns: extracted text | action pill | target widget | approve/reject buttons
 */

import { motion } from 'framer-motion';
import React from 'react';
import { X, CheckCircle2, XCircle, Check, Undo2 } from 'lucide-react';
import { cn } from '@libs/utils/react';
import type { InsightItem } from './DocumentUploadModal.types';
import {
  ACTION_CONFIG,
  WIDGET_ICON_CONFIG,
  DEFAULT_WIDGET_ICON,
} from './DocumentUploadModal.types';

export interface InsightCardProps {
  insight: InsightItem;
  onApprove: (uuid: string) => void;
  onReject: (uuid: string) => void;
  onUndo: (uuid: string) => void;
  isContext?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = React.memo(
  function InsightCard({
    insight,
    onApprove,
    onReject,
    onUndo,
    isContext = false,
  }: InsightCardProps) {
    const isApproved = insight.approved === true;
    const isRejected = insight.approved === false;
    const isPending = insight.approved === null;
    const action = ACTION_CONFIG[insight.action] ?? ACTION_CONFIG.add;

    const widgetCfg =
      WIDGET_ICON_CONFIG[insight.targetFieldRaw] ?? DEFAULT_WIDGET_ICON;
    const WidgetIcon = widgetCfg.icon;

    return (
      <motion.div
        layout
        className={cn(
          'relative overflow-hidden rounded-xl border transition-all',
          isApproved &&
            'border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-700/40 dark:bg-emerald-900/10',
          isRejected &&
            'aucctus-border-secondary aucctus-bg-secondary opacity-40',
          isPending && 'aucctus-border-secondary aucctus-bg-primary',
        )}
      >
        <div className='flex items-stretch'>
          {/* Column 1: What was extracted */}
          <div className='flex-1 bg-black/[0.03] p-4 dark:bg-white/[0.03]'>
            <p className='aucctus-text-tertiary mb-2 text-[10px] font-medium uppercase tracking-wide'>
              Extracted
            </p>
            <p className='aucctus-text-sm-medium aucctus-text-primary leading-snug'>
              {insight.extractedText}
            </p>
          </div>

          {/* Column 2: Action pill */}
          <div className='flex w-28 flex-shrink-0 flex-col items-center justify-center p-4'>
            <p className='aucctus-text-tertiary mb-2 text-[10px] font-medium uppercase tracking-wide'>
              Action
            </p>
            <span
              className={cn(
                'inline-flex items-center rounded border px-2.5 py-1 text-xs font-medium',
                action.color,
              )}
            >
              {action.label}
            </span>
          </div>

          {/* Column 3: Target section / proposed value */}
          <div className='flex-1 p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-md',
                  widgetCfg.color,
                )}
              >
                <WidgetIcon className='h-3.5 w-3.5' />
              </div>
              <span className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wide'>
                {insight.targetWidget}
              </span>
            </div>

            {isContext ? (
              <p className='aucctus-text-tertiary text-xs italic'>
                Saved as context for AI agents
              </p>
            ) : (
              <>
                {insight.currentValue && (
                  <p className='aucctus-text-tertiary text-sm leading-snug line-through'>
                    {insight.currentValue}
                  </p>
                )}
                <p className='aucctus-text-sm aucctus-text-primary leading-snug'>
                  {insight.proposedValue}
                </p>
              </>
            )}
          </div>

          {/* Column 4: Action buttons */}
          <div className='flex w-20 flex-shrink-0 flex-col items-center justify-center gap-1.5 p-2'>
            {isPending ? (
              <>
                <button
                  type='button'
                  onClick={() => onApprove(insight.uuid)}
                  aria-label='Accept insight'
                  className='flex h-8 w-full items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                >
                  <Check className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => onReject(insight.uuid)}
                  aria-label='Reject insight'
                  className='aucctus-border-secondary aucctus-text-secondary flex h-8 w-full items-center justify-center rounded-lg border bg-black/[0.03] transition-colors hover:bg-black/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                >
                  <X className='h-4 w-4' />
                </button>
              </>
            ) : (
              <div className='flex flex-col items-center gap-1.5'>
                <div
                  className={
                    isApproved
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'aucctus-text-tertiary'
                  }
                >
                  {isApproved ? (
                    <CheckCircle2 className='h-5 w-5' />
                  ) : (
                    <XCircle className='h-5 w-5' />
                  )}
                </div>
                <button
                  type='button'
                  onClick={() => onUndo(insight.uuid)}
                  aria-label='Undo decision'
                  className='aucctus-text-tertiary rounded-md p-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5'
                  title='Undo'
                >
                  <Undo2 className='h-3.5 w-3.5' />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
);

export default InsightCard;
