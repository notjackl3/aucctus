import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import { useDeleteJTBDScan } from '@hooks/query/jtbd.hook';
import type { IJTBDScan } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Check,
  ChevronDown,
  Layers,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { formatScanDate } from './JTBDCanvas/ScanInfoLine';

interface JTBDScanMultiSelectProps {
  configUuid: string;
  scans: IJTBDScan[];
  selectedScanUuids: string[];
  onChange: (scanUuids: string[]) => void;
  isAdmin?: boolean;
}

interface MenuPosition {
  top: number;
  left: number;
}

const JTBDScanMultiSelect: React.FC<JTBDScanMultiSelectProps> = ({
  configUuid,
  scans,
  selectedScanUuids,
  onChange,
  isAdmin = false,
}) => {
  const [open, setOpen] = useState(false);
  const [confirmingUuid, setConfirmingUuid] = useState<string | null>(null);
  const [pendingDeleteUuid, setPendingDeleteUuid] = useState<string | null>(
    null,
  );
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteScanAsync } = useDeleteJTBDScan();

  const completedScans = useMemo(
    () => scans.filter((s) => s.status === 'completed'),
    [scans],
  );

  const selectedSet = useMemo(
    () => new Set(selectedScanUuids),
    [selectedScanUuids],
  );

  const allSelected =
    completedScans.length > 0 &&
    completedScans.every((s) => selectedSet.has(s.uuid));

  const toggleScan = useCallback(
    (uuid: string) => {
      if (selectedSet.has(uuid)) {
        onChange(selectedScanUuids.filter((id) => id !== uuid));
      } else {
        onChange([...selectedScanUuids, uuid]);
      }
    },
    [onChange, selectedScanUuids, selectedSet],
  );

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(completedScans.map((s) => s.uuid));
    }
  }, [allSelected, completedScans, onChange]);

  const handleConfirmDelete = useCallback(
    async (scanUuid: string) => {
      if (pendingDeleteUuid) return;
      setPendingDeleteUuid(scanUuid);
      try {
        await deleteScanAsync({ configUuid, scanUuid });
        if (selectedSet.has(scanUuid)) {
          onChange(selectedScanUuids.filter((id) => id !== scanUuid));
        }
        setConfirmingUuid(null);
      } catch {
        // Toast already shown by the hook
      } finally {
        setPendingDeleteUuid(null);
      }
    },
    [
      configUuid,
      deleteScanAsync,
      onChange,
      pendingDeleteUuid,
      selectedScanUuids,
      selectedSet,
    ],
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 10,
      left: rect.left,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setConfirmingUuid(null);
        triggerRef.current?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
        setConfirmingUuid(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const hasScans = completedScans.length > 0;

  if (!hasScans) {
    return (
      <ComponentTooltip
        preferredPosition='above'
        tip={
          <div className='max-w-[320px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
            Run a scan before selection is available.
          </div>
        }
      >
        <button
          type='button'
          disabled
          className='inline-flex cursor-not-allowed select-none items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40 shadow-lg backdrop-blur-md'
          aria-label='No scans available'
        >
          <Layers size={12} className='text-white/40' />
          <span className='max-w-[150px] truncate font-semibold'>No scans</span>
          <ChevronDown size={12} className='text-white/30' />
        </button>
      </ComponentTooltip>
    );
  }

  const label =
    selectedScanUuids.length === 0
      ? '0 scans'
      : allSelected
        ? 'All scans'
        : selectedScanUuids.length === 1
          ? '1 scan'
          : `${selectedScanUuids.length} scans`;

  const menu =
    open && menuPosition
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key='jtbd-scan-multiselect-menu'
              ref={menuRef}
              role='menu'
              aria-label='Select scans'
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
              }}
              className='z-[60] w-72 rounded-lg border border-white/15 bg-black/95 p-1 shadow-2xl backdrop-blur-xl'
            >
              <button
                type='button'
                role='menuitem'
                onClick={toggleAll}
                className='flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-white/90 outline-none hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white'
              >
                <span className='font-semibold'>
                  {allSelected ? 'Deselect all' : 'Select all scans'}
                </span>
                {allSelected && <Check size={12} className='text-white/60' />}
              </button>
              <div className='my-1 h-px bg-white/10' />
              {completedScans.map((scan, index) => {
                const isSelected = selectedSet.has(scan.uuid);
                const count = scan.jobCount ?? scan.jobsDiscovered;
                const isConfirming = confirmingUuid === scan.uuid;
                const isPendingDelete = pendingDeleteUuid === scan.uuid;
                const canDelete =
                  isAdmin && !scan.isCurrent && scan.status === 'completed';
                return (
                  <motion.div
                    key={scan.uuid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.15,
                      delay: index * 0.03,
                      ease: 'easeOut',
                    }}
                    className='group flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-white/90 focus-within:bg-white/10 hover:bg-white/10'
                  >
                    <button
                      type='button'
                      role='menuitemcheckbox'
                      aria-checked={isSelected}
                      onClick={() => {
                        if (isConfirming || isPendingDelete) return;
                        toggleScan(scan.uuid);
                      }}
                      className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left outline-none'
                    >
                      <div
                        className={cn(
                          'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors',
                          isSelected
                            ? 'border-emerald-400/70 bg-emerald-500/30'
                            : 'border-white/30',
                        )}
                      >
                        {isSelected && (
                          <Check size={10} className='text-emerald-300' />
                        )}
                      </div>
                      <Calendar size={12} className='shrink-0 text-white/40' />
                      <span className='truncate text-xs'>
                        Scan - {formatScanDate(scan.scannedAt)}
                      </span>
                      {scan.isCurrent && (
                        <span className='shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300'>
                          current
                        </span>
                      )}
                    </button>
                    <div className='flex shrink-0 items-center gap-1.5'>
                      {isConfirming ? (
                        <>
                          <span className='text-[11px] text-white/60'>
                            Delete?
                          </span>
                          <button
                            type='button'
                            onClick={() => {
                              void handleConfirmDelete(scan.uuid);
                            }}
                            disabled={isPendingDelete}
                            className='rounded p-1 text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-60'
                            aria-label='Confirm delete'
                          >
                            {isPendingDelete ? (
                              <Loader2 size={12} className='animate-spin' />
                            ) : (
                              <Check size={12} />
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={() => {
                              setConfirmingUuid(null);
                            }}
                            disabled={isPendingDelete}
                            className='rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:opacity-60'
                            aria-label='Cancel delete'
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className='text-[11px] text-white/40'>
                            {count} {count === 1 ? 'job' : 'jobs'}
                          </span>
                          {canDelete && (
                            <button
                              type='button'
                              onClick={() => {
                                setConfirmingUuid(scan.uuid);
                              }}
                              className='rounded p-1 text-white/30 opacity-0 transition-all hover:bg-rose-500/20 hover:text-rose-300 focus:opacity-100 group-hover:opacity-100'
                              aria-label='Delete scan'
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <motion.button
        ref={triggerRef}
        type='button'
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup='menu'
        aria-expanded={open}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex select-none items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all duration-200',
          'border-white/40 bg-white/20 shadow-lg hover:bg-white/25',
        )}
      >
        <Layers size={12} className='text-white' />
        <span className='max-w-[150px] truncate font-semibold text-white'>
          {label}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} className='text-white/50' />
        </motion.div>
      </motion.button>
      {menu}
    </>
  );
};

export default JTBDScanMultiSelect;
