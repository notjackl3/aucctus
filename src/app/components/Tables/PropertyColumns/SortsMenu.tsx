import { Icon } from '@components';
import { IPropertyDefinition } from '@libs/api/types';
import * as Popover from '@radix-ui/react-popover';
import React, { useState } from 'react';
import { getPropertyIcon } from '@libs/utils/propertyIcons';
import { IconVariant } from '@components/Icon/Icon/icons';

interface ISortsMenuProps {
  propertyDefinitions?: IPropertyDefinition[];
  currentSort?: string;
  onSort: (
    field: string,
    direction: 'asc' | 'desc',
    isProperty: boolean,
  ) => void;
  onRemoveSort?: (field: string, isProperty: boolean) => void;
}

// Define static columns with their metadata
const STATIC_COLUMNS = [
  { id: 'title', name: 'Concept', icon: 'lightbulb' as IconVariant },
  {
    id: 'createdBy',
    name: 'Created By',
    icon: 'user-square' as IconVariant,
    sortField: 'created_by__first_name',
  },
  {
    id: 'createdAt',
    name: 'Created Date',
    icon: 'calendar' as IconVariant,
    sortField: 'created_at',
  },
  {
    id: 'lastModifiedBy',
    name: 'Last Modified By',
    icon: 'users-edit' as IconVariant,
    sortField: 'updated_by__first_name',
  },
  {
    id: 'updatedAt',
    name: 'Last Modified Date',
    icon: 'clock' as IconVariant,
    sortField: 'updated_at',
  },
  { id: 'status', name: 'Status', icon: 'activity' as IconVariant },
];

interface ISortConfig {
  field: string;
  direction: 'asc' | 'desc';
  isProperty: boolean;
}

// Parse sort string into structured configs
const parseSortString = (sortString?: string): ISortConfig[] => {
  if (!sortString) return [];

  const sortFields = sortString.split(',');
  return sortFields.map((sortField) => {
    const trimmed = sortField.trim();
    const isDescending = trimmed.startsWith('-');
    const fieldWithoutSign = isDescending ? trimmed.slice(1) : trimmed;
    const isProperty = fieldWithoutSign.startsWith('property:');
    const field = isProperty
      ? fieldWithoutSign.replace('property:', '')
      : fieldWithoutSign;

    return {
      field,
      direction: isDescending ? 'desc' : 'asc',
      isProperty,
    };
  });
};

/**
 * Dropdown menu for managing table sorts
 * Shows all sortable columns with hover-activated sort direction submenu
 */
const SortsMenu: React.FC<ISortsMenuProps> = ({
  propertyDefinitions = [],
  currentSort,
  onSort,
  onRemoveSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<'right' | 'left'>(
    'right',
  );
  const submenuCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const columnRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  // Parse current sorts
  const sortConfigs = parseSortString(currentSort);

  // Helper to set submenu with immediate effect
  const setSubmenuImmediate = (column: string | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }
    setHoveredColumn(column);
  };

  // Helper to set submenu with delay (for mouse leave)
  const setSubmenuDelayed = (column: string | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
    }
    submenuCloseTimeoutRef.current = setTimeout(() => {
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

  // Check submenu position to avoid overflow
  const checkSubmenuPosition = (columnKey: string) => {
    const element = columnRefs.current.get(columnKey);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const submenuWidth = 200;
    const spaceOnRight = viewportWidth - rect.right;

    setSubmenuPosition(spaceOnRight < submenuWidth ? 'left' : 'right');
  };

  // Get current sort for a column
  const getCurrentSort = (
    field: string,
    isProperty: boolean,
  ): 'asc' | 'desc' | null => {
    const config = sortConfigs.find(
      (c) => c.field === field && c.isProperty === isProperty,
    );
    return config ? config.direction : null;
  };

  // Get sort order index (1-based for display)
  const getSortOrder = (field: string, isProperty: boolean): number | null => {
    const index = sortConfigs.findIndex(
      (c) => c.field === field && c.isProperty === isProperty,
    );
    return index >= 0 ? index + 1 : null;
  };

  // Combine static and property columns
  type ColumnItem =
    | { type: 'static'; column: (typeof STATIC_COLUMNS)[0]; sortField: string }
    | { type: 'property'; definition: IPropertyDefinition };

  const allColumns: ColumnItem[] = [
    ...STATIC_COLUMNS.map((col) => ({
      type: 'static' as const,
      column: col,
      sortField: col.sortField || col.id,
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
            variant='switch-vertical-01'
            height={16}
            width={16}
            className='aucctus-stroke-secondary'
          />
          <span className='aucctus-text-sm aucctus-text-secondary'>Sorts</span>
          {sortConfigs.length > 0 && (
            <span className='aucctus-bg-brand-solid aucctus-text-xs flex h-5 min-w-[20px] items-center justify-center rounded px-1.5 text-white'>
              {sortConfigs.length}
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
              variant='switch-vertical-01'
              className='aucctus-stroke-secondary h-4 w-4'
            />
            <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
              Sort columns
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
                const field =
                  item.type === 'static' ? item.sortField : item.definition.key;
                const isProperty = item.type === 'property';
                const currentSortDir = getCurrentSort(field, isProperty);
                const sortOrder = getSortOrder(field, isProperty);
                const icon =
                  item.type === 'static'
                    ? item.column.icon
                    : (getPropertyIcon(item.definition) as IconVariant);
                const name =
                  item.type === 'static'
                    ? item.column.name
                    : item.definition.name;

                return (
                  <Popover.Root
                    key={columnKey}
                    open={hoveredColumn === columnKey}
                    onOpenChange={(open) => {
                      if (!open) setHoveredColumn(null);
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
                        {currentSortDir && (
                          <>
                            {sortOrder && sortConfigs.length > 1 && (
                              <span className='aucctus-text-xs aucctus-text-quaternary'>
                                {sortOrder}
                              </span>
                            )}
                            <Icon
                              variant={
                                currentSortDir === 'asc'
                                  ? 'arrowup'
                                  : 'arrowdown'
                              }
                              className='aucctus-stroke-brand-primary h-4 w-4 flex-shrink-0'
                            />
                          </>
                        )}
                        <Icon
                          variant='chevron-right'
                          className='aucctus-stroke-quaternary h-3.5 w-3.5 flex-shrink-0'
                        />
                      </button>
                    </Popover.Anchor>

                    {/* Sort Submenu Flyout in Portal */}
                    <Popover.Portal>
                      <Popover.Content
                        side={submenuPosition === 'right' ? 'right' : 'left'}
                        align='center'
                        sideOffset={8}
                        onMouseEnter={() => setSubmenuImmediate(columnKey)}
                        onMouseLeave={() => setSubmenuDelayed(null)}
                        className='z-[10000]'
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <div className='aucctus-bg-primary aucctus-border-secondary w-[200px] rounded-lg border p-1 shadow-lg'>
                          <button
                            className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onSort(field, 'asc', isProperty);
                              setHoveredColumn(null);
                            }}
                          >
                            <Icon
                              variant='arrowup'
                              className='aucctus-stroke-secondary h-4 w-4'
                            />
                            <span className='aucctus-text-secondary'>
                              Ascending
                            </span>
                            {currentSortDir === 'asc' && (
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
                              onSort(field, 'desc', isProperty);
                              setHoveredColumn(null);
                            }}
                          >
                            <Icon
                              variant='arrowdown'
                              className='aucctus-stroke-secondary h-4 w-4'
                            />
                            <span className='aucctus-text-secondary'>
                              Descending
                            </span>
                            {currentSortDir === 'desc' && (
                              <Icon
                                variant='check'
                                className='aucctus-stroke-brand-primary ml-auto h-4 w-4'
                              />
                            )}
                          </button>

                          {currentSortDir && onRemoveSort && (
                            <>
                              <div className='aucctus-bg-secondary my-1 h-px' />
                              <button
                                className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onRemoveSort(field, isProperty);
                                  setHoveredColumn(null);
                                }}
                              >
                                <Icon
                                  variant='trash'
                                  className='aucctus-stroke-error-primary h-4 w-4'
                                />
                                <span className='aucctus-text-error-primary'>
                                  Remove sort
                                </span>
                              </button>
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

export default SortsMenu;
