import { Icon } from '@components';
import { IPropertyDefinition } from '@libs/api/types';
import { useColumnVisibilityStore } from '@stores/table-columns.store';
import { cn } from '@libs/utils/react';
import * as Menubar from '@radix-ui/react-menubar';
import React, { useState } from 'react';
import { getPropertyIcon } from '@libs/utils/propertyIcons';

interface IColumnVisibilityMenuProps {
  propertyDefinitions?: IPropertyDefinition[];
}

// Define static columns with their metadata
const STATIC_COLUMNS = [
  { id: 'title', name: 'Concept', icon: 'lightbulb' as IconVariant },
  { id: 'priority', name: 'Score', icon: 'trendup' as IconVariant },
  { id: 'createdBy', name: 'Created By', icon: 'user-square' as IconVariant },
  { id: 'createdAt', name: 'Created Date', icon: 'calendar' as IconVariant },
  {
    id: 'lastModifiedBy',
    name: 'Last Modified By',
    icon: 'users-edit' as IconVariant,
  },
  { id: 'updatedAt', name: 'Last Modified Date', icon: 'clock' as IconVariant },
  { id: 'status', name: 'Status', icon: 'activity' as IconVariant },
];

/**
 * Dropdown menu for managing column visibility
 * Shows checkboxes for each property definition to toggle columns on/off
 */
const ColumnVisibilityMenu: React.FC<IColumnVisibilityMenuProps> = ({
  propertyDefinitions = [],
}) => {
  const {
    visiblePropertyColumns,
    toggleColumnVisibility,
    setVisibleColumns,
    visibleStaticColumns,
    toggleStaticColumnVisibility,
    setVisibleStaticColumns,
  } = useColumnVisibilityStore();
  const [searchQuery, setSearchQuery] = useState('');

  const menuItemClass =
    'group hover:outline-none transition-colors duration-300 aucctus-bg-primary-hover rounded-md focus-visible:outline-none focus:outline-none';

  // Handle "Show All" functionality
  const handleShowAll = () => {
    const allKeys = propertyDefinitions.map((def) => def.key);
    setVisibleColumns(allKeys);
    const allStaticIds = STATIC_COLUMNS.map((col) => col.id);
    setVisibleStaticColumns(allStaticIds);
  };

  // Handle "Hide All" functionality
  const handleHideAll = () => {
    setVisibleColumns([]);
    setVisibleStaticColumns([]);
  };

  // Filter static columns based on search query
  const filteredStaticColumns = STATIC_COLUMNS.filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter properties based on search query
  const filteredProperties = propertyDefinitions.filter((def) =>
    def.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Combine static and property columns for visibility
  type ColumnItem =
    | { type: 'static'; column: (typeof STATIC_COLUMNS)[0] }
    | { type: 'property'; definition: IPropertyDefinition };

  const visibleItems: ColumnItem[] = [
    ...filteredStaticColumns
      .filter((col) => visibleStaticColumns.has(col.id))
      .map((col) => ({ type: 'static' as const, column: col })),
    ...filteredProperties
      .filter((def) => visiblePropertyColumns.has(def.key))
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((def) => ({ type: 'property' as const, definition: def })),
  ];

  const hiddenItems: ColumnItem[] = [
    ...filteredStaticColumns
      .filter((col) => !visibleStaticColumns.has(col.id))
      .map((col) => ({ type: 'static' as const, column: col })),
    ...filteredProperties
      .filter((def) => !visiblePropertyColumns.has(def.key))
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((def) => ({ type: 'property' as const, definition: def })),
  ];

  return (
    <Menubar.Root className='flex flex-row'>
      <Menubar.Menu>
        <Menubar.Trigger className='aucctus-bg-secondary-hover flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200'>
          <Icon
            variant='eye'
            height={16}
            width={16}
            className='aucctus-stroke-secondary'
          />
        </Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content
            className='aucctus-bg-primary z-[9999] flex w-[280px] select-none flex-col rounded-md shadow-lg will-change-[transform,opacity] [animation-duration:_400ms] [animation-timing-function:_cubic-bezier(0.16,_1,_0.3,_1)]'
            align='end'
            side='bottom'
            sideOffset={8}
          >
            {/* Header with title and icon */}
            <div className='flex items-center gap-2 px-3 py-3'>
              <Icon
                variant='eye'
                className='aucctus-stroke-secondary h-4 w-4'
              />
              <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
                Property visibility
              </span>
            </div>

            {/* Search input */}
            <div className='p-2'>
              <div className='relative'>
                <Icon
                  variant='search-md'
                  className='aucctus-stroke-quaternary absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2'
                />
                <input
                  type='text'
                  placeholder='Search for a property...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='aucctus-bg-primary aucctus-text-secondary placeholder:aucctus-text-placeholder w-full rounded-md border border-gray-200 py-1.5 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Shown in table section */}
            <div className='flex flex-col p-2'>
              <div className='mb-2 flex items-center justify-between px-1'>
                <span className='aucctus-text-xs aucctus-text-tertiary'>
                  Shown in table
                </span>
                <button
                  onClick={handleHideAll}
                  className='aucctus-text-brand-primary hover:aucctus-text-brand-primary-hover aucctus-text-xs-semibold transition-colors'
                >
                  Hide all
                </button>
              </div>

              <div className='max-h-[300px] overflow-y-auto'>
                {visibleItems.map((item) => {
                  if (item.type === 'static') {
                    const { column } = item;
                    return (
                      <Menubar.Item
                        key={`static-${column.id}`}
                        className={cn(
                          menuItemClass,
                          'flex cursor-pointer items-center gap-2 px-2 py-1.5',
                        )}
                        onSelect={(e) => {
                          e.preventDefault();
                          toggleStaticColumnVisibility(column.id);
                        }}
                      >
                        <Icon
                          variant={column.icon}
                          className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                        />
                        <span className='aucctus-text-sm aucctus-text-secondary flex-1 truncate'>
                          {column.name}
                        </span>
                        <Icon
                          variant='eye'
                          className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                        />
                      </Menubar.Item>
                    );
                  } else {
                    const { definition } = item;
                    return (
                      <Menubar.Item
                        key={`property-${definition.uuid}`}
                        className={cn(
                          menuItemClass,
                          'flex cursor-pointer items-center gap-2 px-2 py-1.5',
                        )}
                        onSelect={(e) => {
                          e.preventDefault();
                          toggleColumnVisibility(definition.key);
                        }}
                      >
                        <Icon
                          variant={getPropertyIcon(definition) as IconVariant}
                          className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                        />
                        <span className='aucctus-text-sm aucctus-text-secondary flex-1 truncate'>
                          {definition.name}
                        </span>
                        <Icon
                          variant='eye'
                          className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                        />
                      </Menubar.Item>
                    );
                  }
                })}
              </div>

              {visibleItems.length === 0 && (
                <div className='aucctus-text-quaternary px-2 py-3 text-center text-xs'>
                  {searchQuery
                    ? 'No matching visible columns'
                    : 'No columns shown'}
                </div>
              )}
            </div>

            {/* Hidden in table section - Only show if there are hidden columns */}
            {hiddenItems.length > 0 && (
              <div className='aucctus-border-secondary flex flex-col border-t p-2'>
                <div className='mb-2 flex items-center justify-between px-1'>
                  <span className='aucctus-text-xs aucctus-text-tertiary'>
                    Hidden in table
                  </span>
                  <button
                    onClick={handleShowAll}
                    className='aucctus-text-brand-primary hover:aucctus-text-brand-primary-hover aucctus-text-xs-semibold transition-colors'
                  >
                    Show all
                  </button>
                </div>

                <div className='max-h-[300px] overflow-y-auto'>
                  {hiddenItems.map((item) => {
                    if (item.type === 'static') {
                      const { column } = item;
                      return (
                        <Menubar.Item
                          key={`static-${column.id}`}
                          className={cn(
                            menuItemClass,
                            'flex cursor-pointer items-center gap-2 px-2 py-1.5',
                          )}
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleStaticColumnVisibility(column.id);
                          }}
                        >
                          <Icon
                            variant={column.icon}
                            className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                          />
                          <span className='aucctus-text-sm aucctus-text-tertiary flex-1 truncate'>
                            {column.name}
                          </span>
                          <Icon
                            variant='eye-off'
                            className='aucctus-stroke-disabled h-4 w-4 flex-shrink-0'
                          />
                        </Menubar.Item>
                      );
                    } else {
                      const { definition } = item;
                      return (
                        <Menubar.Item
                          key={`property-${definition.uuid}`}
                          className={cn(
                            menuItemClass,
                            'flex cursor-pointer items-center gap-2 px-2 py-1.5',
                          )}
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleColumnVisibility(definition.key);
                          }}
                        >
                          <Icon
                            variant={getPropertyIcon(definition) as IconVariant}
                            className='aucctus-stroke-tertiary h-4 w-4 flex-shrink-0'
                          />
                          <span className='aucctus-text-sm aucctus-text-tertiary flex-1 truncate'>
                            {definition.name}
                          </span>
                          <Icon
                            variant='eye-off'
                            className='aucctus-stroke-disabled h-4 w-4 flex-shrink-0'
                          />
                        </Menubar.Item>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  );
};

export default ColumnVisibilityMenu;
