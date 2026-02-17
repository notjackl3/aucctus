import { Icon } from '@components';

import { IPropertyDefinition, IPropertyFilter } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { getPropertyIcon } from '@libs/utils/propertyIcons';
import { useUpdatePropertyDefinition } from '@hooks/query/properties-mutations.hook';
import { useColumnVisibilityStore } from '@stores/table-columns.store';
import { PropertyFilterContent } from '../Filters/SharedFilterComponents';
import { PropertyNameEditor, SortSubmenu } from './MenuComponents';

interface INotionStyleColumnMenuProps {
  definition: IPropertyDefinition;
  onFilterChange: (filter: IPropertyFilter) => void;
  onEdit: (property: IPropertyDefinition) => void;
  onDelete: (property: IPropertyDefinition) => void;
  onSort?: (direction: 'asc' | 'desc') => void;
  currentFilter?: IPropertyFilter;
  currentSort?: 'asc' | 'desc' | null;
  onReorder?: (draggedId: string, targetId: string) => void;
}

/**
 * Notion-style column header menu
 * Provides filter, sort, edit, and delete actions in a dropdown
 */
const NotionStyleColumnMenu: React.FC<INotionStyleColumnMenuProps> = ({
  definition,
  onFilterChange,
  onEdit,
  onDelete,
  onSort,
  currentFilter,
  currentSort,
  onReorder,
}) => {
  const updateMutation = useUpdatePropertyDefinition();
  const { toggleColumnVisibility, toggleColumnWrap, isColumnWrapped } =
    useColumnVisibilityStore();

  const [dropIndicator, setDropIndicator] = useState<{
    position: 'left' | 'right';
  } | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Menu state
  const [hoveredSubmenu, setHoveredSubmenu] = useState<
    'filter' | 'sort' | null
  >(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [propertyName, setPropertyName] = useState(definition.name);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>(
    'right',
  );

  // Refs for submenu positioning
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);
  const sortButtonRef = React.useRef<HTMLButtonElement>(null);
  const popoverContentRef = React.useRef<HTMLDivElement>(null);
  const submenuCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

  // Sync property name when definition changes
  React.useEffect(() => {
    setPropertyName(definition.name);
  }, [definition.name]);

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

  const getDefaultOperator =
    React.useCallback((): IPropertyFilter['operator'] => {
      switch (definition.propertyType) {
        case 'text':
          return 'contains';
        case 'number':
          return 'exact';
        case 'select':
        case 'multi_select':
          return 'in';
        case 'checkbox':
        default:
          return 'exact';
      }
    }, [definition.propertyType]);

  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(
    currentFilter?.value !== undefined && currentFilter?.value !== null
      ? currentFilter.value
      : '',
  );
  const [filterOperator, setFilterOperator] = useState<
    IPropertyFilter['operator']
  >(currentFilter?.operator || getDefaultOperator());

  // Ref to capture immediate filter value for synchronous access (checkbox case)
  const pendingFilterValueRef = React.useRef<any>(null);

  // Sync local state with currentFilter when it changes
  useEffect(() => {
    setFilterValue(
      currentFilter?.value !== undefined && currentFilter?.value !== null
        ? currentFilter.value
        : '',
    );
    setFilterOperator(currentFilter?.operator || getDefaultOperator());
  }, [currentFilter, getDefaultOperator]);

  const handleApplyFilter = () => {
    // For 'is_null' and 'not_blank' operators, send 'true' as the value
    if (filterOperator === 'is_null' || filterOperator === 'not_blank') {
      onFilterChange({
        key: definition.key,
        value: 'true', // Backend expects 'true' for is_null/not_blank operators
        operator: filterOperator,
      });
      setIsOpen(false);
      return;
    }

    // For checkbox, use pending ref value if available (synchronous)
    // This ensures we capture the actual boolean value (true/false/null) immediately
    const valueToApply =
      pendingFilterValueRef.current !== null
        ? pendingFilterValueRef.current
        : filterValue;

    // Clear the ref after reading
    pendingFilterValueRef.current = null;

    // For other operators, require a value (but false is valid for checkboxes)
    if (
      valueToApply !== null &&
      valueToApply !== undefined &&
      valueToApply !== ''
    ) {
      onFilterChange({
        key: definition.key,
        value: valueToApply,
        operator: filterOperator || getDefaultOperator(),
      });
    }
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setFilterValue('');
    onFilterChange({
      key: definition.key,
      value: '',
      operator: 'exact',
    });
    setIsOpen(false);
  };

  const handleSort = (direction: 'asc' | 'desc') => {
    if (onSort) {
      onSort(direction);
    }
    setIsOpen(false);
  };

  const handleIconSelect = (icon: string) => {
    updateMutation.mutate({
      propertyUuid: definition.uuid,
      icon,
    });
  };

  const handleNameChange = () => {
    const trimmedName = propertyName.trim();

    // If name hasn't changed or is empty, just exit edit mode
    if (!trimmedName || trimmedName === definition.name) {
      setPropertyName(definition.name);
      setIsEditingName(false);
      return;
    }

    // Show loading state and exit edit mode
    setIsUpdatingName(true);
    setIsEditingName(false);

    // Optimistically update the name
    updateMutation.mutate(
      {
        propertyUuid: definition.uuid,
        name: trimmedName,
      },
      {
        onSuccess: () => {
          setIsUpdatingName(false);
        },
        onError: () => {
          // Revert to original name on error
          setPropertyName(definition.name);
          setIsUpdatingName(false);
        },
      },
    );
  };

  const handleHideColumn = () => {
    toggleColumnVisibility(definition.key);
    setIsOpen(false);
  };

  // Check if submenu should open on left or right
  const checkSubmenuPosition = (
    buttonRef: React.RefObject<HTMLButtonElement>,
    submenuType: 'filter' | 'sort' = 'sort',
  ) => {
    if (!buttonRef.current || !popoverContentRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const submenuWidth = submenuType === 'filter' ? 280 : 200; // Filter submenus are wider
    const spaceOnRight = window.innerWidth - buttonRect.right;

    // If not enough space on right (less than submenu width + some padding)
    if (spaceOnRight < submenuWidth + 20) {
      setSubmenuPosition('left');
    } else {
      setSubmenuPosition('right');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!onReorder) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', definition.key);
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
    if (draggedId && draggedId !== definition.key) {
      onReorder(draggedId, definition.key);
    }
  };

  // Wrapper to handle the onApply callback for PropertyFilterContent
  const handleApplyFilterWrapper = () => {
    handleApplyFilter();
    setHoveredSubmenu(null);
  };

  // Check if filter is active - for operators like 'is_null', 'not_blank',
  // the value is empty but the filter is still active
  const hasActiveFilter =
    currentFilter &&
    (currentFilter.value ||
      currentFilter.operator === 'is_null' ||
      currentFilter.operator === 'not_blank');

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
      <Popover.Root open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'aucctus-text-tertiary hover:aucctus-text-primary font-inter flex w-full items-center justify-between py-1 text-sm normal-case transition-colors',
              {
                'aucctus-text-brand-primary': hasActiveFilter || currentSort,
              },
            )}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <span className='flex items-center gap-1.5'>
              <Icon
                variant={getPropertyIcon(definition) as IconVariant}
                className='aucctus-stroke-tertiary h-4 w-4'
              />
              {definition.name}
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

        <Popover.Portal forceMount>
          <Popover.Content
            forceMount
            className='z-[9999]'
            align='start'
            sideOffset={5}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  ref={popoverContentRef}
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className='relative'
                >
                  <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border shadow-lg'>
                    {/* Main Menu */}
                    <div className='w-[280px]'>
                      {/* Property Name Section */}
                      <PropertyNameEditor
                        definition={definition}
                        propertyName={propertyName}
                        isEditingName={isEditingName}
                        isUpdatingName={isUpdatingName}
                        onPropertyNameChange={setPropertyName}
                        onStartEditing={() => setIsEditingName(true)}
                        onSaveName={handleNameChange}
                        onCancelEdit={() => {
                          setPropertyName(definition.name);
                          setIsEditingName(false);
                        }}
                        onIconSelect={handleIconSelect}
                      />

                      <div className='p-1'>
                        {/* Filter Section with Hover Submenu */}
                        <div className='relative'>
                          <button
                            ref={filterButtonRef}
                            className='aucctus-bg-primary-hover flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors'
                            onMouseEnter={() => {
                              checkSubmenuPosition(filterButtonRef, 'filter');
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
                              onMouseEnter={() => setSubmenuImmediate('filter')}
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
                                  submenuPosition === 'right' ? 'ml-3' : 'mr-3'
                                }
                              >
                                <div className='aucctus-bg-primary aucctus-border-secondary w-[280px] rounded-lg border p-3 shadow-lg'>
                                  <div className='mb-3 flex items-center gap-2'>
                                    <Icon
                                      variant='filter-lines'
                                      className='aucctus-stroke-secondary h-4 w-4'
                                    />
                                    <span className='aucctus-text-secondary text-sm font-medium'>
                                      Filter by {definition.name}
                                    </span>
                                  </div>

                                  <PropertyFilterContent
                                    propDef={definition}
                                    filterValue={filterValue}
                                    filterOperator={filterOperator}
                                    onFilterValueChange={(value) => {
                                      // Store in ref for synchronous access (checkbox case)
                                      pendingFilterValueRef.current = value;
                                      setFilterValue(value);
                                    }}
                                    onFilterOperatorChange={setFilterOperator}
                                    onApply={handleApplyFilterWrapper}
                                    onCancel={() => setHoveredSubmenu(null)}
                                  />

                                  {hasActiveFilter && (
                                    <button
                                      onClick={handleClearFilter}
                                      className='aucctus-text-error-primary hover:aucctus-text-error-primary mt-3 w-full text-left text-sm transition-colors'
                                    >
                                      Clear filter
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Sort Section with Hover Submenu */}
                        {onSort && (
                          <div className='relative'>
                            <button
                              ref={sortButtonRef}
                              className='aucctus-bg-primary-hover flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors'
                              onMouseEnter={() => {
                                checkSubmenuPosition(sortButtonRef, 'sort');
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
                                  className={
                                    submenuPosition === 'right'
                                      ? 'ml-3'
                                      : 'mr-3'
                                  }
                                >
                                  <SortSubmenu
                                    currentSort={currentSort}
                                    onSort={handleSort}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className='aucctus-bg-secondary my-1 h-px' />

                        {/* Edit Property - Direct Action */}
                        <button
                          className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEdit(definition);
                            setIsOpen(false);
                          }}
                        >
                          <Icon
                            variant='gear'
                            className='aucctus-stroke-secondary h-4 w-4'
                          />
                          <span className='aucctus-text-secondary'>
                            Edit property
                          </span>
                        </button>

                        <div className='aucctus-bg-secondary my-1 h-px' />

                        {/* Toggle Wrap */}
                        <button
                          className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleColumnWrap(definition.key);
                          }}
                        >
                          <Icon
                            variant={
                              isColumnWrapped(definition.key)
                                ? 'minus'
                                : 'expand-06'
                            }
                            className='aucctus-stroke-secondary h-4 w-4'
                          />
                          <span className='aucctus-text-secondary'>
                            {isColumnWrapped(definition.key)
                              ? 'Unwrap content'
                              : 'Wrap content'}
                          </span>
                        </button>

                        {/* Hide Column */}
                        <button
                          className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleHideColumn();
                          }}
                        >
                          <Icon
                            variant='eye-off'
                            className='aucctus-stroke-secondary h-4 w-4'
                          />
                          <span className='aucctus-text-secondary'>
                            Hide in view
                          </span>
                        </button>

                        <div className='aucctus-bg-secondary my-1 h-px' />

                        {/* Delete Property */}
                        <button
                          className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(definition);
                            setIsOpen(false);
                          }}
                        >
                          <Icon
                            variant='trash'
                            className='aucctus-stroke-error-primary h-4 w-4'
                          />
                          <span className='aucctus-text-error-primary'>
                            Delete property
                          </span>
                        </button>
                      </div>
                    </div>
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

export default NotionStyleColumnMenu;
