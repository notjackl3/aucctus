import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { animated, useTransition } from 'react-spring';
import React, { useState } from 'react';
import { IconVariant } from '@components/Icon/Icon/icons';
import { useColumnVisibilityStore } from '@stores/table-columns.store';

interface IStaticColumnMenuProps {
  columnName: string;
  columnId: string;
  leadingIcon?: IconVariant;
  onSort?: (direction: 'asc' | 'desc') => void;
  currentSort?: 'asc' | 'desc' | null;
  onReorder?: (draggedId: string, targetId: string) => void;
  hasFilter?: boolean;
  filterSubmenu?: React.ReactNode; // Custom filter submenu component
}

/**
 * Unified menu for static (non-property) columns
 * Provides hover-activated submenus for filter and sort
 */
const StaticColumnMenu: React.FC<IStaticColumnMenuProps> = ({
  columnName,
  columnId,
  leadingIcon,
  onSort,
  currentSort,
  onReorder,
  hasFilter = false,
  filterSubmenu,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<
    'filter' | 'sort' | null
  >(null);
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>(
    'right',
  );
  const [dropIndicator, setDropIndicator] = useState<{
    position: 'left' | 'right';
  } | null>(null);

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const popoverContentRef = React.useRef<HTMLDivElement>(null);
  const submenuCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { toggleStaticColumnVisibility, isStaticColumnVisible } =
    useColumnVisibilityStore();
  const isVisible = isStaticColumnVisible(columnId);

  // Helper to set submenu with immediate effect
  const setSubmenuImmediate = (submenu: 'filter' | 'sort' | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }
    setHoveredSubmenu(submenu);
  };

  // Helper to set submenu with delay (for mouse leave)
  const setSubmenuDelayed = (submenu: 'filter' | 'sort' | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
    }
    submenuCloseTimeoutRef.current = setTimeout(() => {
      setHoveredSubmenu(submenu);
    }, 150); // 150ms delay before closing
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (submenuCloseTimeoutRef.current) {
        clearTimeout(submenuCloseTimeoutRef.current);
      }
    };
  }, []);

  // Apply border classes to parent <th> element for drag-and-drop
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

  // Check if submenu should open on left or right
  const checkSubmenuPosition = (
    buttonRef: React.RefObject<HTMLButtonElement>,
  ) => {
    if (!buttonRef.current || !popoverContentRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const submenuWidth = 280; // Width of submenu (wider for filter menus)
    const spaceOnRight = window.innerWidth - buttonRect.right;

    // If not enough space on right (less than submenu width + some padding)
    if (spaceOnRight < submenuWidth + 20) {
      setSubmenuPosition('left');
    } else {
      setSubmenuPosition('right');
    }
  };

  const handleSort = (direction: 'asc' | 'desc') => {
    if (onSort) {
      onSort(direction);
    }
    setIsOpen(false);
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

  // Smooth animation for menu appearance
  const menuTransition = useTransition(isOpen, {
    from: {
      opacity: 0,
      transform: 'scale(0.95) translateY(-8px)',
    },
    enter: {
      opacity: 1,
      transform: 'scale(1) translateY(0px)',
    },
    leave: {
      opacity: 0,
      transform: 'scale(0.95) translateY(-8px)',
    },
    config: {
      tension: 300,
      friction: 25,
    },
  });

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
            <span className='flex items-center gap-2'>
              {leadingIcon && (
                <Icon
                  variant={leadingIcon}
                  className='aucctus-stroke-tertiary h-4 w-4'
                />
              )}
              {columnName}
            </span>
            <span className='ml-2 flex items-center gap-1'>
              {hasFilter && (
                <Icon
                  variant='filter-lines'
                  className='aucctus-stroke-brand-primary h-4 w-4'
                />
              )}
              {currentSort && (
                <Icon
                  variant={currentSort === 'asc' ? 'arrowup' : 'arrowdown'}
                  className='aucctus-stroke-brand-primary h-4 w-4'
                />
              )}
              <Icon variant='chevrondown' className='ml-0.5 h-4 w-4' />
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          {menuTransition(
            (styles, item) =>
              item && (
                <Popover.Content
                  asChild
                  className='aucctus-bg-primary aucctus-border-secondary z-[9999] min-w-[200px] rounded-lg border shadow-lg'
                  align='start'
                  sideOffset={5}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <animated.div
                    ref={popoverContentRef}
                    style={styles}
                    className='relative'
                  >
                    <div className='w-[280px] p-1'>
                      {/* Filter Section - Only show if filterSubmenu is provided */}
                      {filterSubmenu && (
                        <>
                          <div className='relative'>
                            <button
                              ref={filterButtonRef}
                              className='aucctus-bg-primary-hover flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors'
                              onMouseEnter={() => {
                                checkSubmenuPosition(filterButtonRef);
                                setSubmenuImmediate('filter');
                              }}
                              onMouseLeave={() => setSubmenuDelayed(null)}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <div className='flex items-center gap-2'>
                                <Icon
                                  variant='filter-lines'
                                  className='aucctus-stroke-secondary h-4 w-4'
                                />
                                <span className='aucctus-text-secondary'>
                                  Filter
                                </span>
                              </div>
                              <Icon
                                variant='chevron-right'
                                className='aucctus-stroke-tertiary h-4 w-4'
                              />
                            </button>

                            {/* Filter Submenu Flyout */}
                            {hoveredSubmenu === 'filter' && (
                              <div
                                onMouseEnter={() =>
                                  setSubmenuImmediate('filter')
                                }
                                onMouseLeave={() => setSubmenuDelayed(null)}
                                className={cn(
                                  'absolute top-1/2 z-[10000] -translate-y-1/2',
                                  submenuPosition === 'right'
                                    ? 'left-full -ml-2'
                                    : 'right-full -mr-2',
                                )}
                              >
                                {/* Invisible bridge to extend hitbox */}
                                <div
                                  className={cn(
                                    'absolute bottom-0 top-0 w-3',
                                    submenuPosition === 'right'
                                      ? 'right-full'
                                      : 'left-full',
                                  )}
                                />
                                <div
                                  className={
                                    submenuPosition === 'right'
                                      ? 'ml-3'
                                      : 'mr-3'
                                  }
                                >
                                  {filterSubmenu}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Sort Section - Only show if onSort is provided */}
                      {onSort && (
                        <>
                          {filterSubmenu && (
                            <div className='aucctus-bg-secondary my-1 h-px' />
                          )}
                          <div className='relative'>
                            <button
                              ref={sortButtonRef}
                              className='aucctus-bg-primary-hover flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors'
                              onMouseEnter={() => {
                                checkSubmenuPosition(sortButtonRef);
                                setSubmenuImmediate('sort');
                              }}
                              onMouseLeave={() => setSubmenuDelayed(null)}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <div className='flex items-center gap-2'>
                                <Icon
                                  variant='switch-vertical-01'
                                  className='aucctus-stroke-secondary h-4 w-4'
                                />
                                <span className='aucctus-text-secondary'>
                                  Sort
                                </span>
                              </div>
                              <Icon
                                variant='chevron-right'
                                className='aucctus-stroke-tertiary h-4 w-4'
                              />
                            </button>

                            {/* Sort Submenu Flyout */}
                            {hoveredSubmenu === 'sort' && (
                              <div
                                onMouseEnter={() => setSubmenuImmediate('sort')}
                                onMouseLeave={() => setSubmenuDelayed(null)}
                                className={cn(
                                  'absolute top-1/2 z-[10000] -translate-y-1/2',
                                  submenuPosition === 'right'
                                    ? 'left-full -ml-2'
                                    : 'right-full -mr-2',
                                )}
                              >
                                {/* Invisible bridge to extend hitbox */}
                                <div
                                  className={cn(
                                    'absolute bottom-0 top-0 w-3',
                                    submenuPosition === 'right'
                                      ? 'right-full'
                                      : 'left-full',
                                  )}
                                />
                                <div
                                  className={cn(
                                    'aucctus-bg-primary aucctus-border-secondary w-[200px] rounded-lg border p-1 shadow-lg',
                                    submenuPosition === 'right'
                                      ? 'ml-3'
                                      : 'mr-3',
                                  )}
                                >
                                  <button
                                    className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSort('asc');
                                    }}
                                  >
                                    <Icon
                                      variant='arrowup'
                                      className='aucctus-stroke-secondary h-4 w-4'
                                    />
                                    <span className='aucctus-text-secondary'>
                                      Ascending
                                    </span>
                                    {currentSort === 'asc' && (
                                      <Icon
                                        variant='check'
                                        className='aucctus-stroke-brand-primary ml-auto h-4 w-4'
                                      />
                                    )}
                                  </button>

                                  <button
                                    className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSort('desc');
                                    }}
                                  >
                                    <Icon
                                      variant='arrowdown'
                                      className='aucctus-stroke-secondary h-4 w-4'
                                    />
                                    <span className='aucctus-text-secondary'>
                                      Descending
                                    </span>
                                    {currentSort === 'desc' && (
                                      <Icon
                                        variant='check'
                                        className='aucctus-stroke-brand-primary ml-auto h-4 w-4'
                                      />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Visibility Toggle Section */}
                      {(filterSubmenu || onSort) && (
                        <div className='aucctus-bg-secondary my-1 h-px' />
                      )}
                      <button
                        className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleStaticColumnVisibility(columnId);
                          setIsOpen(false);
                        }}
                      >
                        <Icon
                          variant={isVisible ? 'eye' : 'eye-off'}
                          className={cn(
                            'h-4 w-4',
                            isVisible
                              ? 'aucctus-stroke-secondary'
                              : 'aucctus-stroke-disabled',
                          )}
                        />
                        <span className='aucctus-text-secondary'>
                          {isVisible ? 'Hide column' : 'Show column'}
                        </span>
                      </button>
                    </div>
                  </animated.div>
                </Popover.Content>
              ),
          )}
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default StaticColumnMenu;
