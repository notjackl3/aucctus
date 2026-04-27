import { useJobEdit } from '@hooks/query/jtbd.hook';
import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
import useStore from '@stores/store';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { CardListWidget } from './CardListWidget';
import { MarketSizingWidget } from './MarketSizingWidget';
import { MetricChartWidget } from './MetricChartWidget';
import { NoteWidget } from './NoteWidget';
import { SocialPostWidget } from './SocialPostWidget';
import { SparklineStatWidget } from './SparklineStatWidget';
import { StatListWidget } from './StatListWidget';
import { SurveyWidget } from './SurveyWidget';
import { TrendChartWidget } from './TrendChartWidget';
import { WidgetHeaderActionsContext } from './WidgetHeader';

/**
 * Human-readable labels for each widget type — used by the refine prompt.
 */
const WIDGET_LABEL: Record<IJTBDCustomWidget['widgetType'], string> = {
  metric_chart: 'metric chart',
  trend_chart: 'trend chart',
  card_list: 'findings',
  stat_list: 'stat list',
  social_post: 'social posts',
  survey: 'survey',
  sparkline_stat: 'sparkline stat',
  market_sizing: 'market sizing',
  note: 'note',
};

interface WidgetRendererProps {
  widget: IJTBDCustomWidget;
  /**
   * Parent job UUID — required for the per-widget "Refine" sparkle and the
   * "Delete" trash button to resolve which job owns this widget when the
   * user initiates a mutation. When omitted, both actions are hidden (e.g.
   * preview contexts).
   */
  jobUuid?: string;
}

/**
 * Native confirm modal rendered via React portal — no Radix. Follows the
 * `JTBDCard` / `JTBDScanMultiSelect` pattern: outside-click dismissal,
 * Escape-to-close, `role="dialog"` + `aria-modal`, and Framer Motion
 * enter/exit animation.
 */
interface ConfirmDeleteModalProps {
  open: boolean;
  widgetLabel: string;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  widgetLabel,
  isBusy,
  onConfirm,
  onCancel,
}) => {
  // Escape-to-close — registered only while the modal is open so we don't
  // leak listeners when it's dismissed.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isBusy, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key='widget-delete-backdrop'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className='fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm'
          onMouseDown={(e) => {
            // Outside click on the backdrop dismisses (button clicks bubble
            // from the inner content which stops propagation below).
            if (e.target === e.currentTarget && !isBusy) {
              onCancel();
            }
          }}
          role='dialog'
          aria-modal='true'
          aria-labelledby='widget-delete-title'
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className='w-[360px] max-w-[90vw] rounded-xl border border-white/[0.08] bg-[#1a1a1c] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]'
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              id='widget-delete-title'
              className='text-[14px] font-semibold text-white/90'
            >
              Delete this widget?
            </div>
            <p className='mt-2 text-[12px] font-light leading-relaxed text-white/60'>
              This will remove the {widgetLabel} widget from this job.
            </p>
            <div className='mt-4 flex items-center justify-end gap-2'>
              <button
                type='button'
                onClick={onCancel}
                disabled={isBusy}
                className='rounded-lg border border-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/85 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={onConfirm}
                disabled={isBusy}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  isBusy
                    ? 'cursor-not-allowed border-red-400/30 bg-red-500/10 text-red-200/70'
                    : 'border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30',
                )}
              >
                {isBusy && (
                  <Loader2 className='h-3 w-3 animate-spin stroke-current' />
                )}
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  jobUuid,
}) => {
  const openWithPrefill = useStore((state) => state.overseer.openWithPrefill);
  const { editJobAsync, isEditing } = useJobEdit();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleRefine = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!jobUuid) return;
      const label = WIDGET_LABEL[widget.widgetType] ?? 'widget';
      const widgetName = widget.title?.trim() || label;
      openWithPrefill({
        message: `Refine the ${widgetName} widget: `,
        pageContext: 'jtbd',
        mention: {
          id: widget.uuid,
          name: widgetName,
          type: 'jtbd_widget',
        },
      });
    },
    [jobUuid, widget.widgetType, widget.title, widget.uuid, openWithPrefill],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!jobUuid) return;
      setIsConfirmingDelete(true);
    },
    [jobUuid],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!jobUuid) return;
    try {
      // Route through the unified JTBD edit pipeline. The agent side resolves
      // the widget-scoped instruction into the `delete_widget` tool call;
      // success is surfaced by the existing `jtbd.job.edited.account`
      // WebSocket listener, so we don't need a local toast here.
      await editJobAsync({
        jobUuid,
        body: {
          userMessage: 'Delete this widget',
          agentImplementationInstructions: 'Delete this widget.',
          scope: { kind: 'widget', widgetUuid: widget.uuid },
        },
      });
      setIsConfirmingDelete(false);
    } catch {
      // `useJobEdit` surfaces errors via its own toast; keep the modal open
      // so the user can retry or cancel.
    }
  }, [jobUuid, editJobAsync, widget.uuid]);

  const handleCancelDelete = useCallback(() => {
    if (isEditing) return;
    setIsConfirmingDelete(false);
  }, [isEditing]);

  let widgetNode: React.ReactNode = null;
  switch (widget.widgetType) {
    case 'metric_chart':
      widgetNode = <MetricChartWidget widget={widget} />;
      break;
    case 'trend_chart':
      widgetNode = <TrendChartWidget widget={widget} />;
      break;
    case 'card_list':
      widgetNode = <CardListWidget widget={widget} />;
      break;
    case 'stat_list':
      widgetNode = <StatListWidget widget={widget} />;
      break;
    case 'social_post':
      widgetNode = <SocialPostWidget widget={widget} />;
      break;
    case 'survey':
      widgetNode = <SurveyWidget widget={widget} />;
      break;
    case 'sparkline_stat':
      widgetNode = <SparklineStatWidget widget={widget} />;
      break;
    case 'market_sizing':
      widgetNode = <MarketSizingWidget widget={widget} />;
      break;
    case 'note':
      // Note widgets are user-authored — `jobUuid` is required to wire
      // edit/delete mutations. When missing (preview contexts) we skip render.
      if (!jobUuid) return null;
      widgetNode = <NoteWidget widget={widget} jobUuid={jobUuid} />;
      break;
    default:
      return null;
  }

  // Note widgets are user-authored — both sparkle (AI refine) and trash
  // (AI delete via the editor agent) are hidden. Notes have their own
  // inline delete control on `NoteWidget`.
  const showActions = !!jobUuid && widget.widgetType !== 'note';
  const widgetLabel = WIDGET_LABEL[widget.widgetType] ?? 'widget';
  // `trend_chart` is the only widget type that does not render `WidgetHeader`,
  // so the in-header action slot will not appear for it. Fall back to the
  // legacy absolute-positioned cluster for that single case to preserve
  // refine/delete affordances without re-introducing the WidgetHeader-pagination
  // overlap that motivated this refactor.
  const useHeaderSlot = widget.widgetType !== 'trend_chart';

  // Sparkle + delete cluster — fades in on parent hover. When `useHeaderSlot`
  // is true these are injected into the widget's `WidgetHeader` after the
  // pagination chevrons via `WidgetHeaderActionsContext`. Otherwise they fall
  // back to an absolute-positioned cluster above the widget body.
  const headerActionsNode = showActions ? (
    <div
      className={cn(
        'flex items-center gap-1 opacity-0 transition-opacity duration-200',
        'focus-within:opacity-100 group-hover:opacity-100',
      )}
    >
      <motion.button
        type='button'
        onClick={handleRefine}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full',
          'border border-white/[0.1] bg-[#1a1a1c]/95 text-white/60 backdrop-blur-sm',
          'hover:border-white/30 hover:bg-white/[0.15] hover:text-white',
        )}
        title='Refine this widget with Overseer'
        aria-label='Refine this widget with Overseer'
      >
        <Sparkles className='h-3 w-3' />
      </motion.button>
      <motion.button
        type='button'
        onClick={handleDeleteClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        disabled={isEditing}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full',
          'border border-white/[0.1] bg-[#1a1a1c]/95 text-white/60 backdrop-blur-sm',
          'hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-200',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
        title='Delete this widget'
        aria-label='Delete this widget'
      >
        {isEditing ? (
          <Loader2 className='h-3 w-3 animate-spin stroke-current' />
        ) : (
          <Trash2 className='h-3 w-3' />
        )}
      </motion.button>
    </div>
  ) : null;

  return (
    <div className='group relative'>
      {/* Fallback absolute cluster — only used for widget types that don't
          render `WidgetHeader` (currently just `trend_chart`). For all other
          widget types the cluster is injected directly into `WidgetHeader`
          via `WidgetHeaderActionsContext` (Option A), which removes the
          overlap with pagination chevrons that the prior absolute-positioned
          cluster suffered from. */}
      {showActions && !useHeaderSlot && (
        <div
          className={cn(
            'pointer-events-none absolute -right-2 -top-2 z-20 flex items-center gap-1',
          )}
        >
          <div className='pointer-events-auto'>{headerActionsNode}</div>
        </div>
      )}

      <WidgetHeaderActionsContext.Provider
        value={useHeaderSlot ? headerActionsNode : null}
      >
        <div>{widgetNode}</div>
      </WidgetHeaderActionsContext.Provider>

      <ConfirmDeleteModal
        open={isConfirmingDelete}
        widgetLabel={widgetLabel}
        isBusy={isEditing}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
