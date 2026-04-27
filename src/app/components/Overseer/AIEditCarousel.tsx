import { jtbdKeys } from '@hooks/query/jtbd.hook';
import { usePersonas } from '@hooks/query/persona.hook';
import {
  IAiEditingSuggestion,
  IJTBDConfigClonePayload,
  IJTBDConfigDeletePayload,
  IJTBDConfigEditPayload,
  IJTBDConfigPersonasPayload,
  IJTBDIdeatePayload,
  IJTBDJobDeletePayload,
  IJTBDJobEditPayload,
  IJTBDJobMergePayload,
  IJTBDNoteAddPayload,
  IJTBDNoteDeletePayload,
  IJTBDNoteUpdatePayload,
  IJTBDRuleEditPayload,
  IJTBDScanDeletePayload,
  IJTBDScanTriggerPayload,
} from '@libs/api/types';
import type {
  IJTBDConfigDetail,
  IJTBDConfigList,
  IJTBDCustomWidget,
  IJTBDJob,
  IJTBDScan,
} from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';

interface AIEditCarouselProps {
  edits: IAiEditingSuggestion[];
  reply?: string;
  onConfirm?: (selectedEdits: IAiEditingSuggestion[]) => void;
  onCancel?: (editStatuses?: Record<number, EditStatus>) => void;
  isLoading?: boolean;
  onActiveEditChange?: (edit: IAiEditingSuggestion) => void;
  onEditStatusChange?: (index: number, status: EditStatus) => void;
  readOnly?: boolean;
  resolutionStatus?: 'applied' | 'declined';
  editResolutions?: Record<number, 'accepted' | 'rejected'>;
}

type EditStatus = 'pending' | 'accepted' | 'rejected';

const AIEditCarousel: React.FC<AIEditCarouselProps> = ({
  edits,
  reply,
  onConfirm,
  onCancel,
  isLoading,
  onActiveEditChange,
  onEditStatusChange,
  readOnly,
  resolutionStatus,
  editResolutions,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<number, EditStatus>>(() =>
    Object.fromEntries(
      edits.map((_, i) => [
        i,
        (editResolutions?.[i] as EditStatus) ?? ('pending' as EditStatus),
      ]),
    ),
  );

  const current = edits[currentIndex];
  const queryClient = useQueryClient();

  // Resolve the active card's JTBD config name (if applicable) from the
  // already-cached configs list. No new request is fired — if the cache
  // is cold we simply fall back to a short UUID preview.
  const activeConfigName = useMemo((): string | null => {
    if (!current) return null;
    // Kinds that carry a top-level `configUuid` in their payload and should
    // render a resolved config-name label near the badge. Keep this list in
    // sync with payload shapes so new config-scoped kinds show context.
    const CONFIG_SCOPED_KINDS = new Set([
      'jtbd_rule',
      'jtbd_scan',
      'jtbd_scan_delete',
      'jtbd_config_edit',
      'jtbd_config_clone',
      'jtbd_config_delete',
      'jtbd_config_personas',
    ]);
    if (!CONFIG_SCOPED_KINDS.has(current.kind ?? '')) {
      return null;
    }
    const configUuid = (current.payload as { configUuid?: string } | undefined)
      ?.configUuid;
    if (!configUuid) return null;

    const configsList = queryClient.getQueryData<IJTBDConfigList[]>(
      jtbdKeys.configs(),
    );
    const listed = configsList?.find((c) => c.uuid === configUuid);
    if (listed?.name) return listed.name;

    const detail = queryClient.getQueryData<IJTBDConfigDetail>(
      jtbdKeys.config(configUuid),
    );
    if (detail?.name) return detail.name;

    return `Config ${configUuid.slice(0, 8)}`;
  }, [current, queryClient]);

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
    onEditStatusChange?.(index, status);

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
  const showResolutionBadge = readOnly && resolutionStatus;

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
            {showResolutionBadge && (
              <div
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]',
                  resolutionStatus === 'applied'
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200/80'
                    : 'border-red-400/20 bg-red-500/10 text-red-200/80',
                )}
              >
                <DynamicIcon
                  variant={resolutionStatus === 'applied' ? 'check' : 'closeX'}
                  width={9}
                  height={9}
                  className='stroke-current'
                />
                {resolutionStatus}
              </div>
            )}
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

          {/* Kind-specific body — JTBD variants render an extra context block */}
          {current.kind === 'jtbd_rule' && (
            <JTBDRuleBody
              payload={current.payload}
              configName={activeConfigName}
            />
          )}
          {current.kind === 'jtbd_scan' && (
            <JTBDScanBody
              payload={current.payload}
              configName={activeConfigName}
            />
          )}
          {current.kind === 'jtbd_note_add' && (
            <JTBDNoteAddBody payload={current.payload} />
          )}
          {current.kind === 'jtbd_job_edit' && (
            <JTBDJobEditBody payload={current.payload} />
          )}
          {current.kind === 'jtbd_job_merge' && (
            <JTBDJobMergeBody payload={current.payload} />
          )}
          {current.kind === 'jtbd_ideate' && (
            <JTBDIdeateBody payload={current.payload} />
          )}
          {current.kind === 'jtbd_scan_delete' && (
            <JTBDScanDeleteBody
              payload={current.payload}
              configName={activeConfigName}
            />
          )}
          {current.kind === 'jtbd_config_edit' && (
            <JTBDConfigEditBody
              payload={current.payload}
              configName={activeConfigName}
            />
          )}
          {current.kind === 'jtbd_config_clone' && (
            <JTBDConfigCloneBody
              payload={current.payload}
              configName={activeConfigName}
            />
          )}
          {current.kind === 'jtbd_config_delete' && (
            <JTBDConfigDeleteBody
              payload={current.payload}
              configName={activeConfigName}
            />
          )}
          {current.kind === 'jtbd_config_personas' && (
            <JTBDConfigPersonasBody
              payload={current.payload}
              configName={activeConfigName}
            />
          )}
          {current.kind === 'jtbd_note_update' && (
            <JTBDNoteUpdateBody payload={current.payload} />
          )}
          {current.kind === 'jtbd_note_delete' && (
            <JTBDNoteDeleteBody payload={current.payload} />
          )}
          {current.kind === 'jtbd_job_delete' && (
            <JTBDJobDeleteBody payload={current.payload} />
          )}

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
        <div className='flex items-center gap-2'>
          {(acceptedEdits.length > 0 || allDecided) && (
            <button
              onClick={handleContinue}
              disabled={isLoading || acceptedEdits.length === 0}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11px] font-semibold transition-all',
                isLoading
                  ? 'cursor-not-allowed bg-emerald-500/20 text-emerald-300/50'
                  : acceptedEdits.length === 0
                    ? 'cursor-not-allowed bg-white/[0.06] text-white/30'
                    : 'bg-emerald-500/90 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:bg-emerald-500 hover:shadow-[0_0_16px_rgba(16,185,129,0.35)]',
              )}
            >
              <DynamicIcon
                variant={isLoading ? 'loading-02' : 'arrowright'}
                width={13}
                height={13}
                className={cn('stroke-current', isLoading && 'animate-spin')}
              />
              {isLoading
                ? 'Applying...'
                : `Apply ${acceptedEdits.length} edit${acceptedEdits.length !== 1 ? 's' : ''}`}
            </button>
          )}
          <button
            onClick={handleAcceptAll}
            disabled={isLoading || allDecided}
            className='flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.06] px-2.5 py-1.5 text-[10px] font-medium text-white/50 backdrop-blur-sm transition-colors hover:bg-white/[0.10] hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-30'
          >
            <CheckCircle2 size={12} className='stroke-current' />
            Accept all
          </button>
          <button
            onClick={() => onCancel?.(statuses)}
            disabled={isLoading}
            className='flex items-center gap-1 rounded-lg border border-white/[0.05] bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-white/35 transition-colors hover:text-white/55 disabled:cursor-not-allowed disabled:opacity-30'
          >
            Dismiss
          </button>
        </div>
      )}
      {readOnly && resolutionStatus === 'declined' && (
        <p className='text-[11px] text-white/70'>
          What should Aucctus do instead?
        </p>
      )}
    </div>
  );
};

/**
 * Render body for a JTBD rule edit suggestion (add / update / delete / toggle).
 * Shows the action label, config name context, and proposed rule text when
 * applicable.
 */
interface JTBDRuleBodyProps {
  payload?: IJTBDRuleEditPayload;
  configName: string | null;
}

const ACTION_LABELS: Record<IJTBDRuleEditPayload['action'], string> = {
  add: 'Add rule',
  update: 'Update rule',
  delete: 'Delete rule',
  toggle: 'Toggle rule',
};

const ACTION_BADGE_CLASSES: Record<IJTBDRuleEditPayload['action'], string> = {
  add: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200/90',
  update: 'border-sky-400/30 bg-sky-500/15 text-sky-200/90',
  delete: 'border-red-400/30 bg-red-500/15 text-red-200/90',
  toggle: 'border-amber-400/30 bg-amber-500/15 text-amber-200/90',
};

const JTBDRuleBody: React.FC<JTBDRuleBodyProps> = ({ payload, configName }) => {
  if (!payload) return null;

  const actionLabel = ACTION_LABELS[payload.action];
  const badgeClass = ACTION_BADGE_CLASSES[payload.action];

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]',
            badgeClass,
          )}
        >
          {actionLabel}
        </span>
        {configName && (
          <span className='text-[10px] font-light text-white/50'>
            in <span className='text-white/70'>{configName}</span>
          </span>
        )}
        {payload.action === 'toggle' &&
          typeof payload.isActive === 'boolean' && (
            <span className='text-[10px] font-light text-white/50'>
              →{' '}
              <span className='text-white/70'>
                {payload.isActive ? 'active' : 'paused'}
              </span>
            </span>
          )}
      </div>
      {payload.ruleText && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          {payload.ruleText}
        </div>
      )}
    </div>
  );
};

/**
 * Render body for a JTBD scan-trigger edit suggestion.
 */
interface JTBDScanBodyProps {
  payload?: IJTBDScanTriggerPayload;
  configName: string | null;
}

const JTBDScanBody: React.FC<JTBDScanBodyProps> = ({ payload, configName }) => {
  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-violet-200/90'>
          Trigger scan
        </span>
        {configName && (
          <span className='text-[10px] font-light text-white/50'>
            for <span className='text-white/70'>{configName}</span>
          </span>
        )}
      </div>
      {payload.reason && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          {payload.reason}
        </div>
      )}
    </div>
  );
};

/**
 * Render body for the unified `jtbd_job_edit` suggestion. Shows a scope pill
 * ("Edit widget" / "Edit entire job" / "Add widget"), the target job title,
 * the resolved widget title when scoped to a specific widget, and the
 * proposed instructions. Notes that Aucctus will research fresh evidence.
 */
interface JTBDJobEditBodyProps {
  payload?: IJTBDJobEditPayload;
}

const CONSTRAINT_FIELD_LABELS: Record<
  Extract<IJTBDJobEditPayload['scope'], { kind: 'constraint_field' }>['field'],
  string
> = {
  root_constraint: 'Edit root constraint',
  solution_landscape: 'Edit solution landscape',
};

const SCOPE_LABELS: Record<IJTBDJobEditPayload['scope']['kind'], string> = {
  widget: 'Edit widget',
  job: 'Edit entire job',
  widget_add: 'Add widget',
  constraint_field: 'Edit constraint field',
};

const SCOPE_BADGE_CLASSES: Record<
  IJTBDJobEditPayload['scope']['kind'],
  string
> = {
  widget: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-200/90',
  job: 'border-indigo-400/30 bg-indigo-500/15 text-indigo-200/90',
  widget_add: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200/90',
  constraint_field: 'border-rose-400/30 bg-rose-500/15 text-rose-200/90',
};

const JTBDJobEditBody: React.FC<JTBDJobEditBodyProps> = ({ payload }) => {
  const queryClient = useQueryClient();

  const { jobTitle, widgetTitle } = useMemo((): {
    jobTitle: string | null;
    widgetTitle: string | null;
  } => {
    if (!payload?.jobUuid) return { jobTitle: null, widgetTitle: null };

    const findJob = (): IJTBDJob | null => {
      const single = queryClient.getQueryData<IJTBDJob>(
        jtbdKeys.job(payload.jobUuid),
      );
      if (single) return single;

      const jobsQueries = queryClient.getQueriesData<IJTBDJob[]>({
        queryKey: ['jtbd', 'jobs'],
      });
      for (const [, jobs] of jobsQueries) {
        const match = jobs?.find((j) => j.uuid === payload.jobUuid);
        if (match) return match;
      }
      return null;
    };

    const job = findJob();
    const resolvedJobTitle =
      job?.jtbdTitle ?? `Opportunity ${payload.jobUuid.slice(0, 8)}`;

    let resolvedWidgetTitle: string | null = null;
    if (payload.scope.kind === 'widget') {
      const targetWidgetUuid = payload.scope.widgetUuid;
      const match: IJTBDCustomWidget | undefined = job?.customWidgets.find(
        (w) => w.uuid === targetWidgetUuid,
      );
      resolvedWidgetTitle =
        match?.title ?? `Widget ${targetWidgetUuid.slice(0, 8)}`;
    }

    return { jobTitle: resolvedJobTitle, widgetTitle: resolvedWidgetTitle };
  }, [payload, queryClient]);

  if (!payload) return null;

  const scopeLabel =
    payload.scope.kind === 'constraint_field'
      ? CONSTRAINT_FIELD_LABELS[payload.scope.field]
      : SCOPE_LABELS[payload.scope.kind];
  const badgeClass = SCOPE_BADGE_CLASSES[payload.scope.kind];

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em]',
            badgeClass,
          )}
        >
          {scopeLabel}
        </span>
        {jobTitle && (
          <span className='text-[10px] font-light text-white/50'>
            on <span className='text-white/70'>{jobTitle}</span>
          </span>
        )}
        {widgetTitle && (
          <span className='text-[10px] font-light text-white/50'>
            · <span className='text-white/70'>{widgetTitle}</span>
          </span>
        )}
      </div>
      {payload.instructions && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          {payload.instructions}
        </div>
      )}
      <div className='text-[10px] font-light italic text-white/35'>
        Aucctus will research fresh evidence before making changes.
      </div>
    </div>
  );
};

/**
 * Render body for a user-initiated `jtbd_job_merge` suggestion. Shows the
 * primary job title and a bulleted list of secondary job titles (all
 * resolved via the React Query cache), the agent's merge rationale, optional
 * merge instructions, and a warning about the secondary deletions. Falls
 * back to UUID labels + a hint when the cache is cold.
 */
interface JTBDJobMergeBodyProps {
  payload?: IJTBDJobMergePayload;
}

const JTBDJobMergeBody: React.FC<JTBDJobMergeBodyProps> = ({ payload }) => {
  const queryClient = useQueryClient();

  const resolveJobTitle = useCallback(
    (uuid: string): string | null => {
      const single = queryClient.getQueryData<IJTBDJob>(jtbdKeys.job(uuid));
      if (single?.jtbdTitle) return single.jtbdTitle;

      const jobsQueries = queryClient.getQueriesData<IJTBDJob[]>({
        queryKey: ['jtbd', 'jobs'],
      });
      for (const [, jobs] of jobsQueries) {
        const match = jobs?.find((j) => j.uuid === uuid);
        if (match?.jtbdTitle) return match.jtbdTitle;
      }
      return null;
    },
    [queryClient],
  );

  const { primaryTitle, secondaryEntries, anyMissing } = useMemo((): {
    primaryTitle: string | null;
    secondaryEntries: Array<{ uuid: string; title: string | null }>;
    anyMissing: boolean;
  } => {
    if (!payload?.primaryJobUuid || !payload.secondaryJobUuids?.length) {
      return { primaryTitle: null, secondaryEntries: [], anyMissing: true };
    }
    const primary = resolveJobTitle(payload.primaryJobUuid);
    const entries = payload.secondaryJobUuids.map((uuid) => ({
      uuid,
      title: resolveJobTitle(uuid),
    }));
    const missing = !primary || entries.some((e) => !e.title);
    return {
      primaryTitle: primary,
      secondaryEntries: entries,
      anyMissing: missing,
    };
  }, [payload, resolveJobTitle]);

  if (!payload) return null;

  const primaryLabel =
    primaryTitle ?? `Job ${payload.primaryJobUuid.slice(0, 8)}`;
  const secondaryCount = payload.secondaryJobUuids.length;

  return (
    <div className={cn('space-y-1.5', anyMissing && 'opacity-60')}>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-orange-400/30 bg-orange-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-orange-200/90'>
          Merge {secondaryCount + 1} jobs
        </span>
      </div>

      <div className='space-y-1 rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2'>
        <div className='text-[10px] font-light text-white/50'>
          Primary (kept)
        </div>
        <div
          className='text-[11px] font-medium text-white/80'
          title={payload.primaryJobUuid}
        >
          {primaryLabel}
        </div>
        <div className='pt-1 text-[10px] font-light text-white/50'>
          Secondary (deleted)
        </div>
        <ul className='list-disc pl-4'>
          {secondaryEntries.map((entry) => (
            <li
              key={entry.uuid}
              className='text-[11px] font-medium text-white/70 line-through decoration-white/30'
              title={entry.uuid}
            >
              {entry.title ?? `Job ${entry.uuid.slice(0, 8)}`}
            </li>
          ))}
        </ul>
      </div>

      <RationaleBlock rationale={payload.rationale} />

      {payload.mergeInstructions && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          <span className='text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>
            Merge instructions
          </span>
          <div className='pt-1'>{payload.mergeInstructions}</div>
        </div>
      )}

      <div className='text-[10px] font-light italic text-amber-200/70'>
        The {secondaryCount} secondary job{secondaryCount !== 1 ? 's' : ''} will
        be deleted and their notes migrated to the primary.
      </div>

      {anyMissing && (
        <div className='text-[10px] font-light italic text-white/40'>
          Select the originating scan to preview all jobs.
        </div>
      )}
    </div>
  );
};

/**
 * Render body for a JTBD note-add edit suggestion. Shows which opportunity the
 * note attaches to (pulled from the React Query cache) and a preview of the
 * body. Falls back to a short UUID label when the cache is cold.
 */
interface JTBDNoteAddBodyProps {
  payload?: IJTBDNoteAddPayload;
}

const JTBDNoteAddBody: React.FC<JTBDNoteAddBodyProps> = ({ payload }) => {
  const queryClient = useQueryClient();

  const jobTitle = useMemo((): string | null => {
    if (!payload?.jobUuid) return null;

    // 1. Single-job cache
    const single = queryClient.getQueryData<IJTBDJob>(
      jtbdKeys.job(payload.jobUuid),
    );
    if (single?.jtbdTitle) return single.jtbdTitle;

    // 2. Any cached jobs list across configs
    const jobsQueries = queryClient.getQueriesData<IJTBDJob[]>({
      queryKey: ['jtbd', 'jobs'],
    });
    for (const [, jobs] of jobsQueries) {
      const match = jobs?.find((j) => j.uuid === payload.jobUuid);
      if (match?.jtbdTitle) return match.jtbdTitle;
    }

    return `Opportunity ${payload.jobUuid.slice(0, 8)}`;
  }, [payload, queryClient]);

  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-amber-200/90'>
          Add note
        </span>
        {jobTitle && (
          <span className='text-[10px] font-light text-white/50'>
            to <span className='text-white/70'>{jobTitle}</span>
          </span>
        )}
      </div>
      {payload.body && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          {payload.body}
        </div>
      )}
    </div>
  );
};

/**
 * Render body for a JTBD ideate-from-chat suggestion. Shows the target
 * opportunity title plus any free-form generation instructions from the user.
 */
interface JTBDIdeateBodyProps {
  payload?: IJTBDIdeatePayload;
}

const JTBDIdeateBody: React.FC<JTBDIdeateBodyProps> = ({ payload }) => {
  const queryClient = useQueryClient();

  const jobTitle = useMemo((): string | null => {
    if (!payload?.jobUuid) return null;

    const single = queryClient.getQueryData<IJTBDJob>(
      jtbdKeys.job(payload.jobUuid),
    );
    if (single?.jtbdTitle) return single.jtbdTitle;

    const jobsQueries = queryClient.getQueriesData<IJTBDJob[]>({
      queryKey: ['jtbd', 'jobs'],
    });
    for (const [, jobs] of jobsQueries) {
      const match = jobs?.find((j) => j.uuid === payload.jobUuid);
      if (match?.jtbdTitle) return match.jtbdTitle;
    }

    return `Opportunity ${payload.jobUuid.slice(0, 8)}`;
  }, [payload, queryClient]);

  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-fuchsia-200/90'>
          Ideate concepts
        </span>
        {jobTitle && (
          <span className='text-[10px] font-light text-white/50'>
            from <span className='text-white/70'>{jobTitle}</span>
          </span>
        )}
      </div>
      {payload.generationInstructions && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          {payload.generationInstructions}
        </div>
      )}
    </div>
  );
};

/**
 * Shared rationale block — every new config/scan/note suggestion kind
 * carries a required `rationale` string. Kept DRY so the 7 new body
 * components render it consistently.
 */
interface RationaleBlockProps {
  rationale?: string | null;
}

const RationaleBlock: React.FC<RationaleBlockProps> = ({ rationale }) => {
  if (!rationale) return null;
  return (
    <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
      <span className='text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>
        Rationale
      </span>
      <div className='pt-1'>{rationale}</div>
    </div>
  );
};

/**
 * Render body for a `jtbd_scan_delete` suggestion. Resolves the scan's date
 * from the cached scans list for the target config so the user can recognize
 * which scan is being removed.
 */
interface JTBDScanDeleteBodyProps {
  payload?: IJTBDScanDeletePayload;
  configName: string | null;
}

const JTBDScanDeleteBody: React.FC<JTBDScanDeleteBodyProps> = ({
  payload,
  configName,
}) => {
  const queryClient = useQueryClient();

  const scanLabel = useMemo((): string | null => {
    if (!payload?.configUuid || !payload.scanUuid) return null;
    const scans = queryClient.getQueryData<IJTBDScan[]>(
      jtbdKeys.scans(payload.configUuid),
    );
    const match = scans?.find((s) => s.uuid === payload.scanUuid);
    if (!match) return `Scan ${payload.scanUuid.slice(0, 8)}`;
    try {
      return new Date(match.scannedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return `Scan ${payload.scanUuid.slice(0, 8)}`;
    }
  }, [payload, queryClient]);

  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-red-200/90'>
          Delete scan
        </span>
        {configName && (
          <span className='text-[10px] font-light text-white/50'>
            in <span className='text-white/70'>{configName}</span>
          </span>
        )}
      </div>
      {scanLabel && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          <span className='text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>
            Scan
          </span>
          <div className='pt-1 line-through decoration-white/30'>
            {scanLabel}
          </div>
        </div>
      )}
      <RationaleBlock rationale={payload.rationale} />
      <div className='text-[10px] font-light italic text-amber-200/70'>
        The scan and its jobs will be permanently removed.
      </div>
    </div>
  );
};

/**
 * Render body for a `jtbd_config_edit` suggestion — shows the proposed
 * name/description changes alongside the current values (pulled from the
 * cached config detail/list).
 */
interface JTBDConfigEditBodyProps {
  payload?: IJTBDConfigEditPayload;
  configName: string | null;
}

const JTBDConfigEditBody: React.FC<JTBDConfigEditBodyProps> = ({
  payload,
  configName,
}) => {
  const queryClient = useQueryClient();

  const currentDescription = useMemo((): string | null => {
    if (!payload?.configUuid) return null;
    const detail = queryClient.getQueryData<IJTBDConfigDetail>(
      jtbdKeys.config(payload.configUuid),
    );
    return detail?.description ?? null;
  }, [payload, queryClient]);

  if (!payload) return null;

  const hasNameChange =
    payload.name !== undefined && payload.name !== null && payload.name !== '';
  const hasDescriptionChange =
    payload.description !== undefined &&
    payload.description !== null &&
    payload.description !== '';

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-sky-200/90'>
          Edit config
        </span>
        {configName && (
          <span className='text-[10px] font-light text-white/50'>
            <span className='text-white/70'>{configName}</span>
          </span>
        )}
      </div>
      {hasNameChange && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          <span className='text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>
            New name
          </span>
          <div className='pt-1'>{payload.name}</div>
        </div>
      )}
      {hasDescriptionChange && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          <span className='text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>
            New description
          </span>
          {currentDescription && (
            <div className='pt-1 text-[10px] text-white/40 line-through decoration-white/30'>
              {currentDescription}
            </div>
          )}
          <div className='pt-1'>{payload.description}</div>
        </div>
      )}
      <RationaleBlock rationale={payload.rationale} />
    </div>
  );
};

/**
 * Render body for a `jtbd_config_clone` suggestion — shows the source config
 * and the proposed new name (or a hint that the default will be used).
 */
interface JTBDConfigCloneBodyProps {
  payload?: IJTBDConfigClonePayload;
  configName: string | null;
}

const JTBDConfigCloneBody: React.FC<JTBDConfigCloneBodyProps> = ({
  payload,
  configName,
}) => {
  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-emerald-200/90'>
          Clone config
        </span>
        {configName && (
          <span className='text-[10px] font-light text-white/50'>
            from <span className='text-white/70'>{configName}</span>
          </span>
        )}
      </div>
      <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
        <span className='text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>
          New name
        </span>
        <div className='pt-1'>
          {payload.newName?.trim() ? (
            payload.newName
          ) : (
            <span className='italic text-white/40'>
              Default ({configName ? `${configName} (copy)` : 'copy'})
            </span>
          )}
        </div>
      </div>
      <RationaleBlock rationale={payload.rationale} />
    </div>
  );
};

/**
 * Render body for a `jtbd_config_delete` suggestion — destructive: names the
 * config being removed and warns about the cascade.
 */
interface JTBDConfigDeleteBodyProps {
  payload?: IJTBDConfigDeletePayload;
  configName: string | null;
}

const JTBDConfigDeleteBody: React.FC<JTBDConfigDeleteBodyProps> = ({
  payload,
  configName,
}) => {
  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-red-200/90'>
          Delete config
        </span>
      </div>
      <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
        <div className='text-[10px] font-light text-white/50'>Config</div>
        <div
          className='pt-1 text-[11px] font-medium text-white/80 line-through decoration-white/30'
          title={payload.configUuid}
        >
          {configName ?? `Config ${payload.configUuid.slice(0, 8)}`}
        </div>
      </div>
      <RationaleBlock rationale={payload.rationale} />
      <div className='text-[10px] font-light italic text-amber-200/70'>
        Rules, documents, scans, and jobs on this config will be removed.
      </div>
    </div>
  );
};

/**
 * Render body for a `jtbd_config_personas` suggestion — resolves persona
 * names from the personas list React Query cache and renders the current +
 * add/remove diff inline. Falls back to a UUID prefix when a persona is not
 * cached (never fires a new network request from within the carousel).
 */
interface JTBDConfigPersonasBodyProps {
  payload?: IJTBDConfigPersonasPayload;
  configName: string | null;
}

const JTBDConfigPersonasBody: React.FC<JTBDConfigPersonasBodyProps> = ({
  payload,
  configName,
}) => {
  const queryClient = useQueryClient();
  // Reading personas via the hook keeps the list fresh for the preview but
  // never forces a fetch — `usePersonas` is configured with a standard
  // staleTime and will reuse any cached data.
  const { personas } = usePersonas();

  const resolveName = useCallback(
    (uuid: string): string => {
      const hit = personas.find((p) => p.uuid === uuid);
      return hit?.name ?? `Persona ${uuid.slice(0, 8)}`;
    },
    [personas],
  );

  const currentPersonaUuids = useMemo((): string[] => {
    if (!payload?.configUuid) return [];
    const detail = queryClient.getQueryData<IJTBDConfigDetail>(
      jtbdKeys.config(payload.configUuid),
    );
    if (detail?.personaUuids) return detail.personaUuids;
    const list = queryClient.getQueryData<IJTBDConfigList[]>(
      jtbdKeys.configs(),
    );
    const match = list?.find((c) => c.uuid === payload.configUuid);
    return match?.personaUuids ?? [];
  }, [payload, queryClient]);

  if (!payload) return null;

  const addUuids = payload.addPersonaUuids ?? [];
  const removeUuids = payload.removePersonaUuids ?? [];

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-indigo-200/90'>
          Update personas
        </span>
        {configName && (
          <span className='text-[10px] font-light text-white/50'>
            on <span className='text-white/70'>{configName}</span>
          </span>
        )}
      </div>
      {currentPersonaUuids.length > 0 && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2'>
          <div className='text-[10px] font-light text-white/50'>Current</div>
          <div className='mt-1 flex flex-wrap gap-1'>
            {currentPersonaUuids.map((uuid) => (
              <span
                key={uuid}
                className='rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/70'
                title={uuid}
              >
                {resolveName(uuid)}
              </span>
            ))}
          </div>
        </div>
      )}
      {addUuids.length > 0 && (
        <div className='rounded-md border border-emerald-400/15 bg-emerald-500/5 px-2.5 py-2'>
          <div className='text-[10px] font-light text-emerald-200/80'>Add</div>
          <div className='mt-1 flex flex-wrap gap-1'>
            {addUuids.map((uuid) => (
              <span
                key={uuid}
                className='rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200/90'
                title={uuid}
              >
                + {resolveName(uuid)}
              </span>
            ))}
          </div>
        </div>
      )}
      {removeUuids.length > 0 && (
        <div className='rounded-md border border-red-400/15 bg-red-500/5 px-2.5 py-2'>
          <div className='text-[10px] font-light text-red-200/80'>Remove</div>
          <div className='mt-1 flex flex-wrap gap-1'>
            {removeUuids.map((uuid) => (
              <span
                key={uuid}
                className='rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-[10px] text-red-200/90 line-through decoration-red-300/40'
                title={uuid}
              >
                − {resolveName(uuid)}
              </span>
            ))}
          </div>
        </div>
      )}
      <RationaleBlock rationale={payload.rationale} />
    </div>
  );
};

/**
 * Render body for a `jtbd_note_update` suggestion — shows the proposed
 * new note body. Cannot resolve the parent job without extra lookup, so it
 * leads with the note UUID prefix.
 */
interface JTBDNoteUpdateBodyProps {
  payload?: IJTBDNoteUpdatePayload;
}

const JTBDNoteUpdateBody: React.FC<JTBDNoteUpdateBodyProps> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-sky-200/90'>
          Update note
        </span>
        <span
          className='text-[10px] font-light text-white/50'
          title={payload.noteUuid}
        >
          Note {payload.noteUuid.slice(0, 8)}
        </span>
      </div>
      {payload.body && (
        <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
          <span className='text-[9px] font-medium uppercase tracking-[0.08em] text-white/45'>
            New body
          </span>
          <div className='pt-1'>{payload.body}</div>
        </div>
      )}
      <RationaleBlock rationale={payload.rationale} />
    </div>
  );
};

/**
 * Render body for a `jtbd_note_delete` suggestion — destructive variant.
 */
interface JTBDNoteDeleteBodyProps {
  payload?: IJTBDNoteDeletePayload;
}

const JTBDNoteDeleteBody: React.FC<JTBDNoteDeleteBodyProps> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-red-200/90'>
          Delete note
        </span>
        <span
          className='text-[10px] font-light text-white/50 line-through decoration-white/30'
          title={payload.noteUuid}
        >
          Note {payload.noteUuid.slice(0, 8)}
        </span>
      </div>
      <RationaleBlock rationale={payload.rationale} />
    </div>
  );
};

/**
 * Render body for a `jtbd_job_delete` suggestion — destructive: resolves the
 * job title from the React Query cache (single-job, config-scoped jobs list,
 * or current-scan detail), renders a prominent warning that the job and all
 * of its widgets will be permanently removed, and shows the agent's rationale.
 * Falls back to a UUID prefix when the cache is cold.
 */
interface JTBDJobDeleteBodyProps {
  payload?: IJTBDJobDeletePayload;
}

const JTBDJobDeleteBody: React.FC<JTBDJobDeleteBodyProps> = ({ payload }) => {
  const queryClient = useQueryClient();

  const jobTitle = useMemo((): string | null => {
    if (!payload?.jobUuid) return null;

    // 1. Single-job cache
    const single = queryClient.getQueryData<IJTBDJob>(
      jtbdKeys.job(payload.jobUuid),
    );
    if (single?.jtbdTitle) return single.jtbdTitle;

    // 2. Any cached jobs list across configs
    const jobsQueries = queryClient.getQueriesData<IJTBDJob[]>({
      queryKey: ['jtbd', 'jobs'],
    });
    for (const [, jobs] of jobsQueries) {
      const match = jobs?.find((j) => j.uuid === payload.jobUuid);
      if (match?.jtbdTitle) return match.jtbdTitle;
    }

    return null;
  }, [payload, queryClient]);

  if (!payload) return null;

  const label = jobTitle ?? `Job ${payload.jobUuid.slice(0, 8)}`;

  return (
    <div className='space-y-1.5'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='inline-flex items-center rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-red-200/90'>
          Delete job
        </span>
      </div>
      <div className='rounded-md border border-white/[0.05] bg-white/[0.03] px-2.5 py-2 text-[11px] font-light leading-relaxed text-white/70'>
        <div className='text-[10px] font-light text-white/50'>Job</div>
        <div
          className='pt-1 text-[11px] font-medium text-white/80 line-through decoration-white/30'
          title={payload.jobUuid}
        >
          {label}
        </div>
      </div>
      <RationaleBlock rationale={payload.rationale} />
      <div className='text-[10px] font-light italic text-red-200/80'>
        This will permanently delete the job and all of its widgets. This cannot
        be undone.
      </div>
    </div>
  );
};

export default AIEditCarousel;
