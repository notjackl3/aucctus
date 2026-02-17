import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ListFilter,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface IStaticColumnMenuProps {
  columnName: string;
  columnId: string;
  onSort: (direction: 'asc' | 'desc') => void;
  currentSort?: 'asc' | 'desc' | null;
  onReorder?: (draggedId: string, targetId: string) => void;
  leadingIcon?: string; // Icon variant for the column type
  hasFilter?: boolean; // Whether this column has an active filter
}

/**
 * Notion-style menu for static (non-property) columns
 * Provides sort options and drag-and-drop reordering
 */
const StaticColumnMenu: React.FC<IStaticColumnMenuProps> = ({
  columnName,
  columnId,
  onSort,
  currentSort,
  onReorder,
  leadingIcon,
  hasFilter = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSort = (direction: 'asc' | 'desc') => {
    onSort(direction);
    setIsOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Determine drop position based on mouse position
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
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'aucctus-text-tertiary hover:aucctus-text-primary font-inter flex w-full items-center justify-between py-1 text-sm normal-case transition-colors',
              {
                'aucctus-text-brand-primary': currentSort || hasFilter,
              },
            )}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <span className='flex items-center gap-1.5'>
              {leadingIcon && (
                <DynamicIcon
                  variant={leadingIcon as any}
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
              )}
              {columnName}
            </span>
            <span className='ml-2 flex items-center gap-1'>
              {hasFilter && (
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

        <Popover.Portal>
          <Popover.Content
            className='aucctus-bg-primary aucctus-border-secondary z-[9999] min-w-[200px] rounded-lg border shadow-lg'
            align='start'
            sideOffset={5}
            forceMount
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className='p-1'>
                    {/* Sort Section */}
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
                </motion.div>
              )}
            </AnimatePresence>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default StaticColumnMenu;
