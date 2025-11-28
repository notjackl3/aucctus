import { Icon } from '@components';
import {
  IPropertyDefinition,
  IPropertyFilter,
  ConceptStatus,
  IUser,
} from '@libs/api/types';
import * as Popover from '@radix-ui/react-popover';
import React, { useState } from 'react';
import { getPropertyIcon } from '@libs/utils/propertyIcons';
import { IconVariant } from '@components/Icon/Icon/icons';
import {
  StatusFilterContent,
  UserFilterContent,
  PropertyFilterContent,
} from '../Filters/SharedFilterComponents';

interface IFiltersMenuProps {
  propertyDefinitions?: IPropertyDefinition[];
  filterOptions: {
    status?: Set<ConceptStatus>;
    createdBy?: Set<IUser>;
    lastModifiedBy?: Set<IUser>;
    propertyFilters?: IPropertyFilter[];
  };
  onUpdateFilters: (updates: any) => void;
}

// Define static columns that support filtering
const STATIC_FILTER_COLUMNS = [
  {
    id: 'status',
    name: 'Status',
    icon: 'activity' as IconVariant,
    type: 'status',
  },
  {
    id: 'createdBy',
    name: 'Created By',
    icon: 'user-square' as IconVariant,
    type: 'user',
  },
  {
    id: 'lastModifiedBy',
    name: 'Last Modified By',
    icon: 'users-edit' as IconVariant,
    type: 'user',
  },
];

/**
 * Dropdown menu for managing table filters
 * Shows all filterable columns with hover-activated filter submenu
 */
const FiltersMenu: React.FC<IFiltersMenuProps> = ({
  propertyDefinitions = [],
  filterOptions,
  onUpdateFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>(
    'right',
  );
  const submenuCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const columnRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  // Local state for buffered filter updates
  const [localStatusSelection, setLocalStatusSelection] = useState<
    Set<ConceptStatus>
  >(filterOptions.status || new Set());
  const [localCreatedBySelection, setLocalCreatedBySelection] = useState<
    Set<IUser> | undefined
  >(filterOptions.createdBy);
  const [localLastModifiedBySelection, setLocalLastModifiedBySelection] =
    useState<Set<IUser> | undefined>(filterOptions.lastModifiedBy);

  // Local state for property filters (buffered)
  const [localPropertyFilters, setLocalPropertyFilters] = useState<
    Map<string, { value: any; operator: IPropertyFilter['operator'] }>
  >(new Map());

  // Ref to track the most recent filter value for synchronous apply (checkbox case)
  const pendingFilterValueRef = React.useRef<{
    key: string;
    value: any;
    operator: IPropertyFilter['operator'];
  } | null>(null);

  // Helper to set submenu with immediate effect
  const setSubmenuImmediate = (column: string | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }
    setHoveredColumn(column);
  };

  // Helper to set submenu with delay (for mouse leave)
  // Also applies buffered filters when closing a static column submenu
  const setSubmenuDelayed = (column: string | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
    }
    submenuCloseTimeoutRef.current = setTimeout(() => {
      // If closing (column is null) and we had a static column open, apply filters
      if (column === null && hoveredColumn) {
        const currentColumnKey = hoveredColumn;
        const staticColumn = STATIC_FILTER_COLUMNS.find(
          (col) => `static-${col.id}` === currentColumnKey,
        );
        if (staticColumn) {
          // Apply buffered filters for static columns
          if (staticColumn.type === 'status') {
            if (localStatusSelection !== filterOptions.status) {
              onUpdateFilters({ status: localStatusSelection });
            }
          } else if (staticColumn.type === 'user') {
            if (
              staticColumn.id === 'createdBy' &&
              localCreatedBySelection !== filterOptions.createdBy
            ) {
              onUpdateFilters({ createdBy: localCreatedBySelection });
            } else if (
              staticColumn.id === 'lastModifiedBy' &&
              localLastModifiedBySelection !== filterOptions.lastModifiedBy
            ) {
              onUpdateFilters({ lastModifiedBy: localLastModifiedBySelection });
            }
          }
        }
      }
      setHoveredColumn(column);
    }, 150);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (submenuCloseTimeoutRef.current) {
        clearTimeout(submenuCloseTimeoutRef.current);
      }
    };
  }, []);

  // Sync local state when menu opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalStatusSelection(filterOptions.status || new Set());
      setLocalCreatedBySelection(filterOptions.createdBy);
      setLocalLastModifiedBySelection(filterOptions.lastModifiedBy);

      // Initialize property filters from current state
      const propertyFilterMap = new Map();
      filterOptions.propertyFilters?.forEach((filter) => {
        propertyFilterMap.set(filter.key, {
          value: filter.value,
          operator: filter.operator,
        });
      });
      setLocalPropertyFilters(propertyFilterMap);
    }
  }, [
    isOpen,
    filterOptions.status,
    filterOptions.createdBy,
    filterOptions.lastModifiedBy,
    filterOptions.propertyFilters,
  ]);

  // Check submenu position to avoid overflow
  const checkSubmenuPosition = (columnKey: string) => {
    const element = columnRefs.current.get(columnKey);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const submenuWidth = 280;
    const spaceOnRight = viewportWidth - rect.right;

    setSubmenuPosition(spaceOnRight < submenuWidth ? 'left' : 'right');
  };

  // Check if a column has an active filter
  const hasActiveFilter = (columnId: string, type: string): boolean => {
    if (type === 'status') {
      return (filterOptions.status?.size || 0) > 0;
    }
    if (type === 'user') {
      if (columnId === 'createdBy') {
        return (filterOptions.createdBy?.size || 0) > 0;
      }
      if (columnId === 'lastModifiedBy') {
        return (filterOptions.lastModifiedBy?.size || 0) > 0;
      }
    }
    return false;
  };

  // Check if a property has an active filter
  const getPropertyFilter = (key: string): IPropertyFilter | undefined => {
    return filterOptions.propertyFilters?.find((f) => f.key === key);
  };

  // Get default operator for a property type
  const getDefaultOperator = (
    propertyType: IPropertyDefinition['propertyType'],
  ): IPropertyFilter['operator'] => {
    switch (propertyType) {
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
  };

  // Update local property filter state (buffered)
  const updateLocalPropertyFilter = (
    key: string,
    value: any,
    operator: IPropertyFilter['operator'],
  ) => {
    setLocalPropertyFilters((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, { value, operator });
      return newMap;
    });
  };

  // Apply property filter (called on Apply button or immediate for select/checkbox)
  const applyPropertyFilter = (
    key: string,
    value?: any,
    operator?: IPropertyFilter['operator'],
  ) => {
    // Use provided values or fall back to local state
    const filterValue =
      value !== undefined ? value : localPropertyFilters.get(key)?.value;
    const filterOperator =
      operator || localPropertyFilters.get(key)?.operator || 'exact';

    if (filterValue === undefined) return;

    // For is_null and not_blank operators, don't check if value is empty
    // These operators send 'true' as the value to the backend
    const isOperatorWithoutUserInput =
      filterOperator === 'is_null' || filterOperator === 'not_blank';

    const shouldClearFilter =
      !isOperatorWithoutUserInput &&
      (filterValue === null ||
        filterValue === undefined ||
        filterValue === '' ||
        (Array.isArray(filterValue) && filterValue.length === 0));

    if (shouldClearFilter) {
      const updatedFilters = (filterOptions.propertyFilters || []).filter(
        (f) => f.key !== key,
      );
      onUpdateFilters({ propertyFilters: updatedFilters });
    } else {
      const existingFilters = filterOptions.propertyFilters || [];
      const existingIndex = existingFilters.findIndex((f) => f.key === key);

      let updatedFilters: IPropertyFilter[];
      if (existingIndex >= 0) {
        updatedFilters = [...existingFilters];
        updatedFilters[existingIndex] = {
          key,
          value: filterValue,
          operator: filterOperator,
        };
      } else {
        updatedFilters = [
          ...existingFilters,
          {
            key,
            value: filterValue,
            operator: filterOperator,
          },
        ];
      }

      onUpdateFilters({ propertyFilters: updatedFilters });
    }
  };

  // Handle status filter toggle
  const handleStatusToggle = (status: ConceptStatus) => {
    setLocalStatusSelection((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  // Handle user filter toggle
  const handleUserToggle = (
    user: IUser,
    filterType: 'createdBy' | 'lastModifiedBy',
  ) => {
    if (filterType === 'createdBy') {
      setLocalCreatedBySelection((prev) => {
        const newSet = new Set(prev || []);
        const existing = Array.from(newSet).find((u) => u.uuid === user.uuid);
        if (existing) {
          newSet.delete(existing);
        } else {
          newSet.add(user);
        }
        return newSet;
      });
    } else {
      setLocalLastModifiedBySelection((prev) => {
        const newSet = new Set(prev || []);
        const existing = Array.from(newSet).find((u) => u.uuid === user.uuid);
        if (existing) {
          newSet.delete(existing);
        } else {
          newSet.add(user);
        }
        return newSet;
      });
    }
  };

  // Apply buffered filters when submenu closes
  const handleSubmenuClose = (columnId: string, type: string) => {
    if (type === 'status') {
      if (localStatusSelection !== filterOptions.status) {
        onUpdateFilters({ status: localStatusSelection });
      }
    } else if (type === 'user') {
      if (
        columnId === 'createdBy' &&
        localCreatedBySelection !== filterOptions.createdBy
      ) {
        onUpdateFilters({ createdBy: localCreatedBySelection });
      } else if (
        columnId === 'lastModifiedBy' &&
        localLastModifiedBySelection !== filterOptions.lastModifiedBy
      ) {
        onUpdateFilters({ lastModifiedBy: localLastModifiedBySelection });
      }
    }
    setHoveredColumn(null);
  };

  // Count total active filters
  const totalActiveFilters =
    (filterOptions.status?.size || 0) +
    (filterOptions.createdBy?.size || 0) +
    (filterOptions.lastModifiedBy?.size || 0) +
    (filterOptions.propertyFilters?.length || 0);

  // Combine static and property columns
  type ColumnItem =
    | { type: 'static'; column: (typeof STATIC_FILTER_COLUMNS)[0] }
    | { type: 'property'; definition: IPropertyDefinition };

  const allColumns: ColumnItem[] = [
    ...STATIC_FILTER_COLUMNS.map((col) => ({
      type: 'static' as const,
      column: col,
    })),
    ...propertyDefinitions.map((def) => ({
      type: 'property' as const,
      definition: def,
    })),
  ];

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button className='aucctus-bg-secondary-hover flex h-8 items-center gap-1.5 rounded-md px-2 transition-colors duration-200'>
          <Icon
            variant='filter-lines'
            height={16}
            width={16}
            className='aucctus-stroke-secondary'
          />
          <span className='aucctus-text-sm aucctus-text-secondary'>
            Filters
          </span>
          {totalActiveFilters > 0 && (
            <span className='aucctus-bg-brand-solid aucctus-text-xs flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 text-white'>
              {totalActiveFilters}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className='aucctus-bg-primary z-[9999] w-[280px] select-none rounded-md shadow-lg'
          align='end'
          side='bottom'
          sideOffset={8}
        >
          {/* Header with title and icon */}
          <div className='flex items-center gap-2 px-3 py-3'>
            <Icon
              variant='filter-lines'
              className='aucctus-stroke-secondary h-4 w-4'
            />
            <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
              Filter columns
            </span>
          </div>

          {/* Columns list */}
          <div className='flex flex-col p-2'>
            <div className='max-h-[400px] overflow-y-auto'>
              {allColumns.map((item) => {
                const columnKey =
                  item.type === 'static'
                    ? `static-${item.column.id}`
                    : `property-${item.definition.key}`;
                const icon =
                  item.type === 'static'
                    ? item.column.icon
                    : (getPropertyIcon(item.definition) as IconVariant);
                const name =
                  item.type === 'static'
                    ? item.column.name
                    : item.definition.name;
                const hasFilter =
                  item.type === 'static'
                    ? hasActiveFilter(item.column.id, item.column.type)
                    : !!getPropertyFilter(item.definition.key);

                return (
                  <Popover.Root
                    key={columnKey}
                    open={hoveredColumn === columnKey}
                    onOpenChange={(open) => {
                      if (!open) {
                        // Apply buffered filters when closing
                        if (item.type === 'static') {
                          handleSubmenuClose(item.column.id, item.column.type);
                        } else {
                          setHoveredColumn(null);
                        }
                      }
                    }}
                  >
                    <Popover.Anchor asChild>
                      <button
                        ref={(el) => {
                          if (el) columnRefs.current.set(columnKey, el);
                        }}
                        className='aucctus-bg-primary-hover flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors duration-300 hover:outline-none focus:outline-none focus-visible:outline-none'
                        onMouseEnter={() => {
                          checkSubmenuPosition(columnKey);
                          setSubmenuImmediate(columnKey);
                        }}
                        onMouseLeave={() => setSubmenuDelayed(null)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Icon
                          variant={icon}
                          className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                        />
                        <span className='aucctus-text-sm aucctus-text-secondary flex-1 truncate text-left'>
                          {name}
                        </span>
                        {hasFilter && (
                          <Icon
                            variant='filter-lines'
                            className='aucctus-stroke-brand-primary h-4 w-4 flex-shrink-0'
                          />
                        )}
                        <Icon
                          variant='chevron-right'
                          className='aucctus-stroke-quaternary h-3.5 w-3.5 flex-shrink-0'
                        />
                      </button>
                    </Popover.Anchor>

                    {/* Filter Submenu Flyout in Portal */}
                    <Popover.Portal>
                      <Popover.Content
                        side={submenuPosition === 'right' ? 'right' : 'left'}
                        align='center'
                        sideOffset={8}
                        onMouseEnter={() => setSubmenuImmediate(columnKey)}
                        onMouseLeave={() => setSubmenuDelayed(null)}
                        className='z-[10000]'
                        onOpenAutoFocus={(e) => e.preventDefault()}
                        onInteractOutside={(e) => {
                          // Prevent closing when clicking inside the submenu
                          const target = e.target as HTMLElement;
                          if (
                            target.closest(
                              '[data-radix-popper-content-wrapper]',
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onPointerDownOutside={(e) => {
                          // Prevent closing when clicking inside the submenu
                          const target = e.target as HTMLElement;
                          if (
                            target.closest(
                              '[data-radix-popper-content-wrapper]',
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div
                          className='aucctus-bg-primary aucctus-border-secondary w-[280px] rounded-lg border p-3 shadow-lg'
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {item.type === 'static' ? (
                            <>
                              {/* Static column filters */}
                              {item.column.type === 'status' && (
                                <>
                                  <div className='mb-3 flex items-center gap-2'>
                                    <Icon
                                      variant='filter-lines'
                                      className='aucctus-stroke-secondary h-4 w-4'
                                    />
                                    <span className='aucctus-text-secondary text-sm font-medium'>
                                      Filter by {item.column.name}
                                    </span>
                                  </div>
                                  <StatusFilterContent
                                    localSelection={localStatusSelection}
                                    onToggle={handleStatusToggle}
                                  />
                                  {/* Clear button for Status */}
                                  {localStatusSelection.size > 0 && (
                                    <div className='aucctus-border-secondary mt-3 flex items-center justify-end border-t pt-2'>
                                      <button
                                        onClick={() => {
                                          onUpdateFilters({
                                            status: undefined,
                                          });
                                          setLocalStatusSelection(new Set());
                                          setHoveredColumn(null);
                                        }}
                                        className='aucctus-text-sm aucctus-text-tertiary hover:aucctus-text-secondary rounded px-2 py-1 transition-colors'
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                              {item.column.type === 'user' && (
                                <>
                                  <div className='mb-3 flex items-center gap-2'>
                                    <Icon
                                      variant='filter-lines'
                                      className='aucctus-stroke-secondary h-4 w-4'
                                    />
                                    <span className='aucctus-text-secondary text-sm font-medium'>
                                      Filter by {item.column.name}
                                    </span>
                                  </div>
                                  <UserFilterContent
                                    localSelection={
                                      item.column.id === 'createdBy'
                                        ? localCreatedBySelection
                                        : localLastModifiedBySelection
                                    }
                                    onToggle={(user) =>
                                      handleUserToggle(
                                        user,
                                        item.column.id as
                                          | 'createdBy'
                                          | 'lastModifiedBy',
                                      )
                                    }
                                    filterType={
                                      item.column.id as
                                        | 'createdBy'
                                        | 'lastModifiedBy'
                                    }
                                  />
                                  {/* Clear button for User filters */}
                                  {((item.column.id === 'createdBy' &&
                                    localCreatedBySelection &&
                                    localCreatedBySelection.size > 0) ||
                                    (item.column.id === 'lastModifiedBy' &&
                                      localLastModifiedBySelection &&
                                      localLastModifiedBySelection.size >
                                        0)) && (
                                    <div className='aucctus-border-secondary mt-3 flex items-center justify-end border-t pt-2'>
                                      <button
                                        onClick={() => {
                                          if (item.column.id === 'createdBy') {
                                            onUpdateFilters({
                                              createdBy: undefined,
                                            });
                                            setLocalCreatedBySelection(
                                              undefined,
                                            );
                                          } else {
                                            onUpdateFilters({
                                              lastModifiedBy: undefined,
                                            });
                                            setLocalLastModifiedBySelection(
                                              undefined,
                                            );
                                          }
                                          setHoveredColumn(null);
                                        }}
                                        className='aucctus-text-sm aucctus-text-tertiary hover:aucctus-text-secondary rounded px-2 py-1 transition-colors'
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Property filters */}
                              <div className='mb-3 flex items-center gap-2'>
                                <Icon
                                  variant='filter-lines'
                                  className='aucctus-stroke-secondary h-4 w-4'
                                />
                                <span className='aucctus-text-secondary text-sm font-medium'>
                                  Filter by {item.definition.name}
                                </span>
                              </div>
                              <PropertyFilterContent
                                propDef={item.definition}
                                filterValue={(() => {
                                  const localValue = localPropertyFilters.get(
                                    item.definition.key,
                                  )?.value;
                                  if (
                                    localValue !== undefined &&
                                    localValue !== null
                                  )
                                    return localValue;
                                  const currentValue = getPropertyFilter(
                                    item.definition.key,
                                  )?.value;
                                  if (
                                    currentValue !== undefined &&
                                    currentValue !== null
                                  )
                                    return currentValue;
                                  return '';
                                })()}
                                filterOperator={
                                  localPropertyFilters.get(item.definition.key)
                                    ?.operator ||
                                  getPropertyFilter(item.definition.key)
                                    ?.operator ||
                                  getDefaultOperator(
                                    item.definition.propertyType,
                                  )
                                }
                                onFilterValueChange={(value) => {
                                  // Update local state only (buffered)
                                  const currentOperator =
                                    localPropertyFilters.get(
                                      item.definition.key,
                                    )?.operator ||
                                    getPropertyFilter(item.definition.key)
                                      ?.operator ||
                                    getDefaultOperator(
                                      item.definition.propertyType,
                                    );

                                  // Store in ref for synchronous access (checkbox case)
                                  pendingFilterValueRef.current = {
                                    key: item.definition.key,
                                    value,
                                    operator: currentOperator,
                                  };

                                  updateLocalPropertyFilter(
                                    item.definition.key,
                                    value,
                                    currentOperator,
                                  );
                                  // Note: For checkbox, the onApply will be called by SharedFilterComponents
                                  // For select/multi-select, wait for Apply button
                                }}
                                onFilterOperatorChange={(operator) => {
                                  // Update operator in local state
                                  let currentValue =
                                    localPropertyFilters.get(
                                      item.definition.key,
                                    )?.value ||
                                    getPropertyFilter(item.definition.key)
                                      ?.value ||
                                    '';

                                  // For is_null and not_blank operators, set value to 'true'
                                  if (
                                    operator === 'is_null' ||
                                    operator === 'not_blank'
                                  ) {
                                    currentValue = 'true';
                                  }

                                  updateLocalPropertyFilter(
                                    item.definition.key,
                                    currentValue,
                                    operator,
                                  );
                                }}
                                onApply={() => {
                                  // Apply buffered changes
                                  // For checkbox, use pending ref value if available (synchronous)
                                  if (
                                    pendingFilterValueRef.current &&
                                    pendingFilterValueRef.current.key ===
                                      item.definition.key
                                  ) {
                                    applyPropertyFilter(
                                      pendingFilterValueRef.current.key,
                                      pendingFilterValueRef.current.value,
                                      pendingFilterValueRef.current.operator,
                                    );
                                    pendingFilterValueRef.current = null;
                                  } else {
                                    // For other types, read from local state
                                    const localFilter =
                                      localPropertyFilters.get(
                                        item.definition.key,
                                      );
                                    if (localFilter) {
                                      applyPropertyFilter(
                                        item.definition.key,
                                        localFilter.value,
                                        localFilter.operator,
                                      );
                                    } else {
                                      applyPropertyFilter(item.definition.key);
                                    }
                                  }
                                  setHoveredColumn(null);
                                }}
                                onCancel={() => {
                                  // Reset local state and close
                                  const currentFilter = getPropertyFilter(
                                    item.definition.key,
                                  );
                                  if (currentFilter) {
                                    setLocalPropertyFilters((prev) => {
                                      const newMap = new Map(prev);
                                      newMap.set(item.definition.key, {
                                        value: currentFilter.value,
                                        operator: currentFilter.operator,
                                      });
                                      return newMap;
                                    });
                                  }
                                  setHoveredColumn(null);
                                }}
                              />

                              {/* Clear filter button - shown when filter is active */}
                              {getPropertyFilter(item.definition.key) && (
                                <button
                                  onClick={() => {
                                    // Clear the filter
                                    const updatedFilters = (
                                      filterOptions.propertyFilters || []
                                    ).filter(
                                      (f) => f.key !== item.definition.key,
                                    );
                                    onUpdateFilters({
                                      propertyFilters: updatedFilters,
                                    });
                                    // Clear local state
                                    setLocalPropertyFilters((prev) => {
                                      const newMap = new Map(prev);
                                      newMap.delete(item.definition.key);
                                      return newMap;
                                    });
                                    setHoveredColumn(null);
                                  }}
                                  className='aucctus-text-error-primary hover:aucctus-text-error-primary mt-3 w-full text-left text-sm transition-colors'
                                >
                                  Clear filter
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                );
              })}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default FiltersMenu;
