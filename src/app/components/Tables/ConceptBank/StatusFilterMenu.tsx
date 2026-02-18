import { Input } from '@components';

import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import { ConceptStatus } from '@libs/api/types';
import utils from '@libs/utils';
import { CONCEPT_STATUS_LIST } from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

export interface IStatusFilterMenuProps {
  filterOptions: IConceptFilterOptions;
  updateFilterOptions: (value: Partial<IConceptFilterOptions>) => void;
  statusOptions?: Array<{ value: string; label: string }>;
  columnId?: string;
  onReorder?: (draggedId: string, targetId: string) => void;
  onSort?: (direction: 'asc' | 'desc') => void;
  currentSort?: 'asc' | 'desc' | null;
}

/**
 * Status filter menu for table header
 * Provides multi-select checkboxes for status filtering
 */
const StatusFilterMenu: React.FC<IStatusFilterMenuProps> = ({
  filterOptions,
  updateFilterOptions,
  statusOptions,
  columnId = 'status',
  onReorder,
  onSort,
  currentSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilterView, setShowFilterView] = useState(true);
  const [dropIndicator, setDropIndicator] = useState<{
    position: 'left' | 'right';
  } | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Apply border classes to parent <th> element
  React.useEffect(() => {
    const thElement = wrapperRef.current?.closest('th');
    if (!thElement) return;

    if (dropIndicator?.position === 'left') {
      thElement.classList.add('!border-l-4', '!aucctus-border-brand');
      thElement.classList.remove('!border-r-4');
    } else if (dropIndicator?.position === 'right') {
      thElement.classList.add('!border-r-4', '!aucctus-border-brand');
      thElement.classList.remove('!border-l-4');
    } else {
      thElement.classList.remove(
        '!border-l-4',
        '!border-r-4',
        '!aucctus-border-brand',
      );
    }

    return () => {
      thElement.classList.remove(
        '!border-l-4',
        '!border-r-4',
        '!aucctus-border-brand',
      );
    };
  }, [dropIndicator]);

  // Local state to buffer changes until menu closes
  const [localSelection, setLocalSelection] = useState<Set<ConceptStatus>>(
    filterOptions.status,
  );

  // Sync local state when menu opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalSelection(filterOptions.status);
      setShowFilterView(true); // Always start with filter view
    }
  }, [isOpen, filterOptions.status]);

  // Apply changes when menu closes
  const handleClose = () => {
    setIsOpen(false);
    // Only update if selection changed
    if (localSelection !== filterOptions.status) {
      updateFilterOptions({ status: localSelection });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!onReorder) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midPoint = rect.left + rect.width / 2;
    const position = e.clientX < midPoint ? 'left' : 'right';

    setDropIndicator({ position });
  };

  const handleDragLeave = () => {
    setDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!onReorder) return;
    e.preventDefault();
    setDropIndicator(null);

    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== columnId) {
      onReorder(draggedId, columnId);
    }
  };

  // Use local selection for UI display
  const hasActiveFilter = localSelection && localSelection.size > 0;

  const createStatusCheckItem = (value: ConceptStatus) => (
    <div
      key={value}
      className='flex cursor-pointer items-center px-3 py-2'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setLocalSelection((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(value)) {
            newSet.delete(value);
          } else {
            newSet.add(value);
          }
          return newSet;
        });
      }}
    >
      <Input.CheckBox
        key={`checkbox-${value}-${localSelection.has(value)}`}
        id={`filter-status-${value}`}
        checked={localSelection.has(value)}
        onChange={(e) => {
          e.stopPropagation();
          // Toggle is handled by parent div onClick
        }}
      />
      <span className='aucctus-text-secondary ml-2 text-sm font-medium'>
        {utils.string.camelCaseToTitleCase(value)}
      </span>
    </div>
  );

  const createCustomStatusCheckItem = (option: {
    value: string;
    label: string;
  }) => (
    <div
      key={option.value}
      className='flex cursor-pointer items-center px-3 py-2'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        setLocalSelection((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(option.value as ConceptStatus)) {
            newSet.delete(option.value as ConceptStatus);
          } else {
            newSet.add(option.value as ConceptStatus);
          }
          return newSet;
        });
      }}
    >
      <Input.CheckBox
        key={`checkbox-${option.value}-${localSelection.has(option.value as ConceptStatus)}`}
        id={`filter-status-${option.value}`}
        checked={localSelection.has(option.value as ConceptStatus)}
        onChange={(e) => {
          e.stopPropagation();
          // Toggle is handled by parent div onClick
        }}
      />
      <span className='aucctus-text-secondary ml-2 text-sm font-medium'>
        {option.label}
      </span>
    </div>
  );

  const handleClearFilter = () => {
    setLocalSelection(new Set());
    updateFilterOptions({ status: new Set() });
    handleClose();
  };

  const handleSort = (direction: 'asc' | 'desc') => {
    if (onSort) {
      onSort(direction);
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className='relative'
      draggable={!!onReorder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          // Only allow closing via explicit user action (clicking outside)
          // Don't let Radix auto-close on internal interactions
          if (!open) {
            setIsOpen(false);
          } else {
            setIsOpen(true);
          }
        }}
        modal={false}
      >
        <Popover.Trigger asChild>
          <button
            className={cn(
              'aucctus-text-tertiary hover:aucctus-text-primary font-inter flex w-full items-center justify-between py-1 text-sm normal-case transition-colors',
              {
                'aucctus-text-brand-primary': hasActiveFilter,
              },
            )}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <span className='flex items-center gap-1.5'>
              <Activity className='aucctus-stroke-tertiary h-4 w-4' />
              Status
              {hasActiveFilter && (
                <span className='aucctus-bg-brand-solid ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white'>
                  {localSelection.size}
                </span>
              )}
            </span>
            <span className='ml-2 flex items-center gap-1'>
              {hasActiveFilter && (
                <ListFilter className='aucctus-stroke-brand-primary h-4 w-4' />
              )}
              {currentSort && (
                <DynamicIcon
                  variant={currentSort === 'asc' ? 'arrowup' : 'arrowdown'}
                  className='aucctus-stroke-brand-primary h-4 w-4'
                />
              )}
              <ChevronDown className='ml-0.5 h-4 w-4' />
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal forceMount>
          <Popover.Content
            forceMount
            className='z-[9999]'
            align='start'
            sideOffset={5}
            onInteractOutside={(e) => {
              e.preventDefault();
              handleClose();
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              handleClose();
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className='aucctus-bg-primary aucctus-border-secondary min-w-[200px] rounded-lg border shadow-lg'>
                    {showFilterView ? (
                      // Filter View
                      <div className='p-1'>
                        <div className='max-h-80 overflow-y-auto'>
                          {statusOptions
                            ? statusOptions.map((option) =>
                                createCustomStatusCheckItem(option),
                              )
                            : CONCEPT_STATUS_LIST.map((status) =>
                                createStatusCheckItem(status),
                              )}
                        </div>

                        {hasActiveFilter && (
                          <>
                            <div className='aucctus-bg-secondary my-1 h-px' />
                            <button
                              className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClearFilter();
                              }}
                            >
                              <X className='aucctus-stroke-secondary h-4 w-4' />
                              <span className='aucctus-text-secondary'>
                                Clear filter
                              </span>
                            </button>
                          </>
                        )}

                        {onSort && (
                          <>
                            <div className='aucctus-bg-secondary my-1 h-px' />
                            <button
                              className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowFilterView(false);
                              }}
                            >
                              <ArrowUpDown className='aucctus-stroke-secondary h-4 w-4' />
                              <span className='aucctus-text-secondary'>
                                Sort
                              </span>
                              <ChevronRight className='aucctus-stroke-tertiary ml-auto h-4 w-4' />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      // Sort View
                      <div className='p-1'>
                        <div className='mb-2 flex items-center gap-2 px-3 py-2'>
                          <button
                            onClick={() => setShowFilterView(true)}
                            className='aucctus-bg-primary-hover rounded p-1 transition-colors'
                          >
                            <ChevronLeft className='aucctus-stroke-secondary h-4 w-4' />
                          </button>
                          <span className='aucctus-text-secondary text-sm font-medium'>
                            Sort
                          </span>
                        </div>

                        <button
                          className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSort('asc');
                          }}
                        >
                          <ArrowUp className='aucctus-stroke-secondary h-4 w-4' />
                          <span className='aucctus-text-secondary'>
                            Sort ascending
                          </span>
                          {currentSort === 'asc' && (
                            <Check className='aucctus-stroke-brand-primary ml-auto h-4 w-4' />
                          )}
                        </button>

                        <button
                          className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSort('desc');
                          }}
                        >
                          <ArrowDown className='aucctus-stroke-secondary h-4 w-4' />
                          <span className='aucctus-text-secondary'>
                            Sort descending
                          </span>
                          {currentSort === 'desc' && (
                            <Check className='aucctus-stroke-brand-primary ml-auto h-4 w-4' />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default StatusFilterMenu;
