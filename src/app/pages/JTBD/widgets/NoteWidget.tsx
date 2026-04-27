import { useDeleteJTBDNote, useUpdateJTBDNote } from '@hooks/query/jtbd.hook';
import type { IJTBDCustomWidget, IJTBDNoteItem } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Loader2,
  StickyNote,
  Trash2,
  UserCircle2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { WidgetHeader } from './WidgetHeader';

interface NoteWidgetProps {
  widget: IJTBDCustomWidget;
  /**
   * Parent job UUID — required so note mutations can invalidate the right
   * job cache on success.
   */
  jobUuid: string;
}

/**
 * Human-friendly timestamp for a note. Falls back to a locale date string for
 * anything older than ~24h, and "just now"/"Xm ago"/"Xh ago" for recent edits.
 */
const formatNoteTimestamp = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Single editable note item. Extracted so each note manages its own dirty
 * state without the parent re-rendering every other note on a keystroke.
 */
interface NoteItemCardProps {
  item: IJTBDNoteItem;
  jobUuid: string;
  index: number;
  currentUserUuid: string | null;
}

const NoteItemCard: React.FC<NoteItemCardProps> = ({
  item,
  jobUuid,
  index,
  currentUserUuid,
}) => {
  const { updateNoteAsync, isUpdating } = useUpdateJTBDNote();
  const { deleteNoteAsync, isDeleting } = useDeleteJTBDNote();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.body);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Keep local draft in sync when the underlying note changes from the server
  // (e.g. after re-assessment completes and re-fetches the job).
  useEffect(() => {
    if (!isEditing) setDraft(item.body);
  }, [item.body, isEditing]);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [isEditing]);

  const isDirty = draft.trim() !== item.body.trim();
  const canSave = isDirty && draft.trim().length > 0 && !isUpdating;

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    try {
      await updateNoteAsync({
        itemUuid: item.uuid,
        jobUuid,
        data: { body: draft.trim() },
      });
      setIsEditing(false);
    } catch {
      // Toast surfaced by the mutation's onError.
    }
  }, [canSave, draft, updateNoteAsync, item.uuid, jobUuid]);

  const handleCancel = useCallback(() => {
    setDraft(item.body);
    setIsEditing(false);
  }, [item.body]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteNoteAsync({ itemUuid: item.uuid, jobUuid });
    } catch {
      // Toast surfaced by the mutation's onError.
      setConfirmDelete(false);
    }
  }, [deleteNoteAsync, item.uuid, jobUuid]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleCancel, handleSave],
  );

  const authorLabel =
    item.createdByUuid &&
    currentUserUuid &&
    item.createdByUuid === currentUserUuid
      ? 'You'
      : item.createdByName
        ? item.createdByName
        : item.createdByUuid
          ? 'Team member'
          : 'Unknown';

  return (
    <motion.div
      key={item.uuid}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className='rounded-lg border border-amber-400/20 bg-amber-500/[0.06] p-3'
    >
      {/* Author / timestamp row */}
      <div className='mb-2 flex items-center gap-2'>
        <UserCircle2 className='h-3.5 w-3.5 shrink-0 text-amber-300/70' />
        <span className='text-[11px] font-medium text-white/70'>
          {authorLabel}
        </span>
        <span className='text-[10px] text-white/30'>·</span>
        <span className='text-[10px] text-white/40'>
          {formatNoteTimestamp(item.updatedAt || item.createdAt)}
        </span>
        {item.updatedAt &&
          item.createdAt &&
          item.updatedAt !== item.createdAt && (
            <span
              className='text-[10px] italic text-white/25'
              title={`Created ${new Date(item.createdAt).toLocaleString()}`}
            >
              edited
            </span>
          )}

        {/* Action icons — delete only (edit = click on body) */}
        <div className='ml-auto flex items-center gap-1'>
          {!isEditing && !confirmDelete && (
            <motion.button
              type='button'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              className='rounded-full p-1 text-white/30 transition-colors hover:bg-white/[0.08] hover:text-red-300'
              aria-label='Delete note'
              title='Delete note'
            >
              <Trash2 className='h-3 w-3' />
            </motion.button>
          )}
        </div>
      </div>

      {/* Body — click to edit when not already editing */}
      {isEditing ? (
        <div className='space-y-2'>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            rows={3}
            placeholder='Write your note…'
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
                handleCancel();
              }}
              disabled={isUpdating}
              className='flex items-center gap-1 rounded-md border border-white/[0.08] px-2.5 py-1 text-[10px] font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <X className='h-3 w-3' />
              Cancel
            </button>
            <motion.button
              type='button'
              whileHover={canSave ? { scale: 1.03 } : undefined}
              whileTap={canSave ? { scale: 0.97 } : undefined}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={!canSave}
              className={cn(
                'flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-medium transition-colors',
                canSave
                  ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200/90 hover:bg-emerald-500/25 hover:text-emerald-100'
                  : 'cursor-not-allowed border-white/[0.06] bg-white/[0.03] text-white/25',
              )}
            >
              {isUpdating ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <Check className='h-3 w-3' />
              )}
              Save
            </motion.button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className='block w-full rounded-md px-1 py-0.5 text-left text-[12px] leading-relaxed text-white/75 transition-colors hover:bg-white/[0.04]'
          title='Click to edit'
        >
          {item.body || (
            <span className='italic text-white/30'>
              Empty note — click to edit
            </span>
          )}
        </button>
      )}

      {/* Inline confirm-delete row */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className='mt-2 overflow-hidden'
          >
            <div className='flex items-center justify-between gap-2 rounded-md border border-red-400/20 bg-red-500/10 px-2.5 py-1.5'>
              <span className='text-[10px] font-medium text-red-200/90'>
                Delete this note?
              </span>
              <div className='flex items-center gap-1.5'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                  disabled={isDeleting}
                  className='rounded-md border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  Keep
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className='flex items-center gap-1 rounded-md border border-red-400/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-200/90 transition-colors hover:bg-red-500/30 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  {isDeleting ? (
                    <Loader2 className='h-3 w-3 animate-spin' />
                  ) : (
                    <Trash2 className='h-3 w-3' />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Renders a user-authored `note` widget. A single widget typically carries one
 * note item but the component supports multiple items for safety. Notes are
 * NOT AI-authored, survive job re-assessment, and expose inline edit + delete
 * affordances directly on the card.
 */
export const NoteWidget: React.FC<NoteWidgetProps> = ({ widget, jobUuid }) => {
  const currentUserUuid = useStore((state) => state.auth.user?.uuid ?? null);

  const items = [...widget.noteItems].sort((a, b) => {
    // Fallback: older notes first by createdAt.
    const aTs = new Date(a.createdAt).getTime();
    const bTs = new Date(b.createdAt).getTime();
    return aTs - bTs;
  });

  if (items.length === 0) return null;

  return (
    <div>
      <WidgetHeader
        icon={<StickyNote className='h-3.5 w-3.5 text-amber-300/80' />}
        label={widget.title?.trim() || 'Note'}
        description={widget.description}
      />
      <div className='space-y-2'>
        {items.map((item, i) => (
          <NoteItemCard
            key={item.uuid}
            item={item}
            jobUuid={jobUuid}
            index={i}
            currentUserUuid={currentUserUuid}
          />
        ))}
      </div>
    </div>
  );
};
