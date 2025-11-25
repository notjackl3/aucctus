import { Avatar, Icon, Input } from '@components';
import { useAllUsers } from '@hooks/query/account.hook';
import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import { IUser } from '@libs/api/types';
import utils from '@libs/utils';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { animated, useTransition } from 'react-spring';
import React, { useState } from 'react';

export interface ICreatedByFilterMenuProps {
  filterOptions: IConceptFilterOptions;
  updateFilterOptions: (value: Partial<IConceptFilterOptions>) => void;
  columnId?: string;
  onReorder?: (draggedId: string, targetId: string) => void;
  onSort?: (direction: 'asc' | 'desc') => void;
  currentSort?: 'asc' | 'desc' | null;
}

/**
 * Created By filter menu for table header
 * Provides searchable multi-select user selection for filtering by creators (OR logic)
 */
const CreatedByFilterMenu: React.FC<ICreatedByFilterMenuProps> = ({
  filterOptions,
  updateFilterOptions,
  columnId = 'createdBy',
  onReorder,
  onSort,
  currentSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilterView, setShowFilterView] = useState(true);
  const [search, setSearch] = useState<string>('');
  const { users } = useAllUsers({ search });
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
  const [localSelection, setLocalSelection] = useState<Set<IUser> | undefined>(
    () => {
      // Ensure we have a proper Set or undefined
      if (!filterOptions.createdBy) return undefined;
      // If it's already a Set, use it; otherwise convert it
      return filterOptions.createdBy instanceof Set
        ? filterOptions.createdBy
        : new Set(
            Array.isArray(filterOptions.createdBy)
              ? filterOptions.createdBy
              : [],
          );
    },
  );

  // Sync local state when menu opens
  React.useEffect(() => {
    if (isOpen) {
      // Ensure we have a proper Set or undefined
      if (!filterOptions.createdBy) {
        setLocalSelection(undefined);
      } else if (filterOptions.createdBy instanceof Set) {
        setLocalSelection(filterOptions.createdBy);
      } else {
        // Convert to Set if it's not already
        setLocalSelection(
          new Set(
            Array.isArray(filterOptions.createdBy)
              ? filterOptions.createdBy
              : [],
          ),
        );
      }
      setShowFilterView(true); // Always start with filter view
    }
  }, [isOpen, filterOptions.createdBy]);

  // Apply changes when menu closes
  const handleClose = () => {
    setIsOpen(false);
    // Only update if selection changed
    if (localSelection !== filterOptions.createdBy) {
      updateFilterOptions({ createdBy: localSelection });
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

  // Use local selection for UI display
  const hasActiveFilter = localSelection && localSelection.size > 0;
  const selectedCount = localSelection?.size || 0;

  const handleUserToggle = (user: IUser) => {
    setLocalSelection((prevSelection) => {
      const currentSet = prevSelection
        ? new Set(prevSelection)
        : new Set<IUser>();

      // Check if user is already selected by UUID
      const isSelected = Array.from(currentSet).some(
        (u) => u.uuid === user.uuid,
      );

      if (isSelected) {
        // Remove user - create completely new Set
        const newSet = new Set(
          Array.from(currentSet).filter((u) => u.uuid !== user.uuid),
        );
        return newSet.size > 0 ? newSet : undefined;
      } else {
        // Add user - create completely new Set
        const newSet = new Set([...Array.from(currentSet), user]);
        return newSet;
      }
    });
  };

  const handleClearFilter = () => {
    setLocalSelection(undefined);
    updateFilterOptions({ createdBy: undefined });
    handleClose();
  };

  const handleSort = (direction: 'asc' | 'desc') => {
    if (onSort) {
      onSort(direction);
    }
    setIsOpen(false);
  };

  const isUserSelected = (user: IUser): boolean => {
    if (!localSelection) return false;
    return Array.from(localSelection).some((u) => u.uuid === user.uuid);
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
            // Check if this is a legitimate close action
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
              <Icon
                variant='user-square'
                className='aucctus-stroke-tertiary h-4 w-4'
              />
              Created By
              {hasActiveFilter && (
                <span className='aucctus-bg-brand-solid ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white'>
                  {selectedCount}
                </span>
              )}
            </span>
            <span className='ml-2 flex items-center gap-1'>
              {hasActiveFilter && (
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
          {isOpen && (
            <Popover.Content
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
            >
              {menuTransition(
                (styles, item) =>
                  item && (
                    <animated.div
                      style={styles}
                      className='aucctus-bg-primary aucctus-border-secondary w-[280px] rounded-lg border shadow-lg'
                    >
                      {showFilterView ? (
                        // Filter View
                        <div className='p-3'>
                          {/* Search input */}
                          <div className='mb-2'>
                            <Input.Search
                              value={search}
                              debounce={500}
                              onChange={(e) => {
                                setSearch(e.target.value);
                              }}
                              placeholder='Search users...'
                            />
                          </div>

                          {/* User list with checkboxes */}
                          <div className='max-h-80 min-h-[240px] overflow-y-auto'>
                            {users.length > 0 ? (
                              users.map((user) => {
                                const isSelected = isUserSelected(user);

                                return (
                                  <div
                                    key={`user-${user.uuid}`}
                                    className='aucctus-bg-primary-hover flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors'
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleUserToggle(user);
                                    }}
                                  >
                                    <Input.CheckBox
                                      key={`checkbox-${user.uuid}-${isSelected}`}
                                      id={`filter-createdBy-${user.uuid}`}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        // handleUserToggle is called by parent div onClick
                                      }}
                                    />
                                    <div className='flex flex-1 items-center gap-2'>
                                      <Avatar
                                        firstName={user.firstName}
                                        lastName={user.lastName}
                                        src={user.profileImage}
                                      />
                                      <span className='aucctus-text-secondary truncate text-sm font-medium'>
                                        {utils.account.getUsersFullName(user)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className='aucctus-text-quaternary flex h-full items-center justify-center text-sm'>
                                No users found
                              </div>
                            )}
                          </div>

                          {/* Clear filter button */}
                          {hasActiveFilter && (
                            <>
                              <div className='aucctus-bg-secondary my-2 h-px' />
                              <button
                                className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
                                onClick={(e: React.MouseEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleClearFilter();
                                }}
                              >
                                <Icon
                                  variant='closeX'
                                  className='aucctus-stroke-secondary h-4 w-4'
                                />
                                <span className='aucctus-text-secondary'>
                                  Clear filter
                                </span>
                              </button>
                            </>
                          )}

                          {/* Sort button */}
                          {onSort && (
                            <>
                              <div className='aucctus-bg-secondary my-2 h-px' />
                              <button
                                className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm outline-none transition-colors'
                                onClick={(e: React.MouseEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowFilterView(false);
                                }}
                              >
                                <Icon
                                  variant='switch-vertical-01'
                                  className='aucctus-stroke-secondary h-4 w-4'
                                />
                                <span className='aucctus-text-secondary'>
                                  Sort
                                </span>
                                <Icon
                                  variant='chevron-right'
                                  className='aucctus-stroke-tertiary ml-auto h-4 w-4'
                                />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        // Sort View
                        <div className='p-3'>
                          <div className='mb-2 flex items-center gap-2'>
                            <button
                              onClick={() => setShowFilterView(true)}
                              className='aucctus-bg-primary-hover rounded p-1 transition-colors'
                            >
                              <Icon
                                variant='chevronleft'
                                className='aucctus-stroke-secondary h-4 w-4'
                              />
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
                            <Icon
                              variant='arrowup'
                              className='aucctus-stroke-secondary h-4 w-4'
                            />
                            <span className='aucctus-text-secondary'>
                              Sort ascending
                            </span>
                            {currentSort === 'asc' && (
                              <Icon
                                variant='check'
                                className='aucctus-stroke-brand-primary ml-auto h-4 w-4'
                              />
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
                            <Icon
                              variant='arrowdown'
                              className='aucctus-stroke-secondary h-4 w-4'
                            />
                            <span className='aucctus-text-secondary'>
                              Sort descending
                            </span>
                            {currentSort === 'desc' && (
                              <Icon
                                variant='check'
                                className='aucctus-stroke-brand-primary ml-auto h-4 w-4'
                              />
                            )}
                          </button>
                        </div>
                      )}
                    </animated.div>
                  ),
              )}
            </Popover.Content>
          )}
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default CreatedByFilterMenu;
