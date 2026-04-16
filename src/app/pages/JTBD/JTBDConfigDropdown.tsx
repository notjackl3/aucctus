import {
  useCloneJTBDConfig,
  useDeleteJTBDConfig,
  useJTBDConfigs,
} from '@hooks/query/jtbd.hook';
import { cn } from '@libs/utils/react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Copy,
  Plus,
  Puzzle,
  Settings,
  Trash2,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { useJTBDView } from './JTBDViewContext';

interface JTBDConfigDropdownProps {
  /** Whether the current user is an admin (controls create/delete access). */
  isAdmin?: boolean;
  /** Called when user clicks "New Discovery Area" — typically focuses the search bar. */
  onNewArea?: () => void;
}

const JTBDConfigDropdown: React.FC<JTBDConfigDropdownProps> = ({
  isAdmin = false,
  onNewArea,
}) => {
  const { activeConfigUuid, setActiveConfigUuid, setEditConfigUuid } =
    useJTBDView();
  const { configs } = useJTBDConfigs();
  const { deleteConfigAsync } = useDeleteJTBDConfig();
  const { cloneConfigAsync, isCloning } = useCloneJTBDConfig();

  const [deleteTarget, setDeleteTarget] = useState<{
    uuid: string;
    name: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeConfig = configs.find((c) => c.uuid === activeConfigUuid);
  const activeViewName = activeConfig?.name ?? 'Select Config';

  const handleSwitchView = useCallback(
    (uuid: string) => {
      setActiveConfigUuid(uuid);
    },
    [setActiveConfigUuid],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, uuid: string, name: string) => {
      e.stopPropagation();
      e.preventDefault();
      setDeleteTarget({ uuid, name });
    },
    [],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { uuid } = deleteTarget;
    // Reset active config BEFORE delete so hooks don't refetch with a stale UUID
    if (activeConfigUuid === uuid) {
      const remaining = configs.filter((c) => c.uuid !== uuid);
      setActiveConfigUuid(remaining[0]?.uuid);
    }
    try {
      await deleteConfigAsync(uuid);
    } catch {
      // Error toast handled by hook
    }
    setDeleteTarget(null);
  }, [
    deleteTarget,
    deleteConfigAsync,
    activeConfigUuid,
    configs,
    setActiveConfigUuid,
  ]);

  const handleCloneClick = useCallback(
    async (e: React.MouseEvent, uuid: string) => {
      e.stopPropagation();
      e.preventDefault();
      setDropdownOpen(false);
      try {
        const cloned = await cloneConfigAsync(uuid);
        setActiveConfigUuid(cloned.uuid);
      } catch {
        // Error toast handled by hook
      }
    },
    [cloneConfigAsync, setActiveConfigUuid],
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, uuid: string) => {
      e.stopPropagation();
      e.preventDefault();
      setDropdownOpen(false);
      requestAnimationFrame(() => setEditConfigUuid(uuid));
    },
    [setEditConfigUuid],
  );

  // When no configs exist, show a prompt
  if (configs.length === 0) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          requestAnimationFrame(() => onNewArea?.());
        }}
        className={cn(
          'inline-flex select-none items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all duration-200',
          'border-emerald-500/30 bg-emerald-500/10 shadow-lg hover:bg-emerald-500/20',
        )}
      >
        <Plus size={12} className='text-emerald-400' />
        <span className='font-semibold text-emerald-400'>
          New Discovery Area
        </span>
      </motion.button>
    );
  }

  return (
    <>
      <DropdownMenu.Root
        modal={false}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      >
        <DropdownMenu.Trigger asChild>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'inline-flex select-none items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all duration-200',
              'border-white/40 bg-white/20 shadow-lg hover:bg-white/25',
            )}
          >
            <Puzzle size={12} className='text-white' />
            <span className='max-w-[150px] truncate font-semibold text-white'>
              {activeViewName}
            </span>
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={12} className='text-white/50' />
            </motion.div>
          </motion.button>
        </DropdownMenu.Trigger>

        <AnimatePresence>
          {dropdownOpen && (
            <DropdownMenu.Portal forceMount>
              <DropdownMenu.Content
                align='start'
                sideOffset={10}
                asChild
                forceMount
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className='z-50 w-72 rounded-lg border border-white/15 bg-black/95 p-1 shadow-2xl backdrop-blur-xl'
                >
                  {/* Config items */}
                  {configs.map((config, index) => (
                    <motion.div
                      key={config.uuid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.15,
                        delay: index * 0.03,
                        ease: 'easeOut',
                      }}
                    >
                      <DropdownMenu.Item
                        onSelect={(e) => {
                          if (
                            (e.target as HTMLElement).closest(
                              '[data-delete-button],[data-edit-button],[data-clone-button]',
                            )
                          ) {
                            e.preventDefault();
                            return;
                          }
                          handleSwitchView(config.uuid);
                        }}
                        className='group flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-white/90 outline-none hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white'
                      >
                        <div className='flex min-w-0 items-center gap-2'>
                          <span
                            className={cn(
                              'truncate text-xs',
                              activeConfigUuid === config.uuid &&
                                'font-semibold',
                            )}
                          >
                            {config.name}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          {activeConfigUuid === config.uuid && (
                            <Check size={12} className='text-white/60' />
                          )}
                          <button
                            data-clone-button
                            onClick={(e) => handleCloneClick(e, config.uuid)}
                            disabled={isCloning}
                            className='rounded p-0.5 text-white/30 opacity-0 transition-colors hover:text-white/60 disabled:opacity-30 group-hover:opacity-100'
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            data-edit-button
                            onClick={(e) => handleEditClick(e, config.uuid)}
                            className='rounded p-0.5 text-white/30 opacity-0 transition-colors hover:text-white/60 group-hover:opacity-100'
                          >
                            <Settings size={12} />
                          </button>
                          {isAdmin && configs.length > 1 && (
                            <button
                              data-delete-button
                              onClick={(e) =>
                                handleDeleteClick(e, config.uuid, config.name)
                              }
                              className='rounded p-0.5 text-white/30 opacity-0 transition-colors hover:text-red-400 group-hover:opacity-100'
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </DropdownMenu.Item>
                    </motion.div>
                  ))}
                </motion.div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          )}
        </AnimatePresence>
      </DropdownMenu.Root>

      {/* Delete confirmation AlertDialog */}
      <AlertDialog.Root
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className='fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm' />
          <AlertDialog.Content className='fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-black/95 p-6 shadow-2xl backdrop-blur-xl'>
            <AlertDialog.Title className='text-base font-semibold text-white'>
              Delete discovery area?
            </AlertDialog.Title>
            <AlertDialog.Description className='mt-2 text-sm text-white/50'>
              {deleteTarget
                ? `"${deleteTarget.name}" and all its scan data will be permanently removed. This cannot be undone.`
                : 'This discovery area will be permanently removed.'}
            </AlertDialog.Description>
            <div className='mt-5 flex justify-end gap-2'>
              <AlertDialog.Cancel asChild>
                <button className='rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white'>
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleConfirmDelete}
                  className='rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500'
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

export default JTBDConfigDropdown;
