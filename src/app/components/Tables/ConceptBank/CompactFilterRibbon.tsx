import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import {
  IPropertyDefinition,
  IPropertyFilter,
  IUser,
  ConceptStatus,
} from '@libs/api/types';
import utils from '@libs/utils';
import { camelCaseToTitleCase } from '@libs/utils/string';
import { getPropertyIcon } from '@libs/utils/propertyIcons';
import React, { ReactNode, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import {
  StatusFilterContent,
  UserFilterContent,
  PropertyFilterContent,
} from '../Filters/SharedFilterComponents';
import {
  ChevronDown,
  ChevronRight,
  ListFilter,
  Loader2,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface ICompactFilterRibbonProps {
  filterOptions: IConceptFilterOptions;
  propertyDefinitions?: IPropertyDefinition[];
  onUpdateFilters: (updates: Partial<IConceptFilterOptions>) => void;
}

const dropdownMotionProps = {
  initial: { opacity: 0, scale: 0.95, y: -8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -8 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
};

/**
 * Compact filter ribbon that shows sorts first, then a divider, then filters
 * Each item shows: icon + name + value/direction
 */
const CompactFilterRibbon: React.FC<ICompactFilterRibbonProps> = ({
  filterOptions,
  propertyDefinitions,
  onUpdateFilters,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const submenuCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Helper to set submenu with immediate effect
  const setSubmenuImmediate = (submenu: string | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }
    setHoveredSubmenu(submenu);
  };

  // Helper to set submenu with delay (for mouse leave)
  const setSubmenuDelayed = (submenu: string | null) => {
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

  // Helper to get column icon
  const getColumnIcon = (columnId: string, isProperty: boolean): string => {
    if (isProperty) {
      const propDef = propertyDefinitions?.find((def) => def.key === columnId);
      return propDef?.icon || 'clipboard';
    }

    const iconMap: Record<string, string> = {
      title: 'lightbulb',
      status: 'loading-02',
      createdBy: 'user-group',
      created_at: 'calendar',
      created_by__first_name: 'user-square',
      created_by__last_name: 'user-square',
      lastModifiedBy: 'user-group',
      updated_at: 'clock',
      updated_by__first_name: 'users-edit',
      updated_by__last_name: 'users-edit',
      // Legacy support
      createdAt: 'calendar',
      updatedAt: 'clock',
    };
    return iconMap[columnId] || 'clipboard';
  };

  // Helper to get column name
  const getColumnName = (columnId: string, isProperty: boolean): string => {
    if (isProperty) {
      const propDef = propertyDefinitions?.find((def) => def.key === columnId);
      return propDef?.name || columnId;
    }

    const nameMap: Record<string, string> = {
      title: 'Concept',
      status: 'Status',
      created_at: 'Created Date',
      created_by__first_name: 'Created By',
      created_by__last_name: 'Created By (Last Name)',
      updated_at: 'Last Modified Date',
      updated_by__first_name: 'Last Modified By',
      updated_by__last_name: 'Last Modified By (Last Name)',
      // Legacy support
      createdBy: 'Created By',
      createdAt: 'Created Date',
      lastModifiedBy: 'Last Modified By',
      updatedAt: 'Last Modified Date',
    };
    return nameMap[columnId] || camelCaseToTitleCase(columnId);
  };

  const sortItems: ReactNode[] = [];
  const filterItems: ReactNode[] = [];

  // 1. COLLECT ALL SORTS
  if (filterOptions.sort) {
    const sortFields = filterOptions.sort.split(',');
    sortFields.forEach((sortField, index) => {
      const trimmed = sortField.trim();
      const isDescending = trimmed.startsWith('-');
      const fieldWithoutSign = isDescending ? trimmed.slice(1) : trimmed;
      const isProperty = fieldWithoutSign.startsWith('property:');
      const field = isProperty
        ? fieldWithoutSign.replace('property:', '')
        : fieldWithoutSign;

      const icon = getColumnIcon(field, isProperty);
      const name = getColumnName(field, isProperty);
      const directionIcon = isDescending ? 'arrowdown' : 'arrowup';

      const dropdownKey = `sort-${index}-${field}`;
      sortItems.push(
        <Popover.Root
          key={dropdownKey}
          open={openDropdown === dropdownKey}
          onOpenChange={(open) => setOpenDropdown(open ? dropdownKey : null)}
        >
          <Popover.Trigger asChild>
            <div className='aucctus-bg-secondary flex max-w-xs items-center gap-1.5 rounded-md px-2 py-1'>
              <DynamicIcon
                variant={icon as any}
                className='aucctus-stroke-tertiary h-3.5 w-3.5 flex-shrink-0'
              />
              <span className='aucctus-text-sm aucctus-text-secondary truncate'>
                {name}
              </span>
              <DynamicIcon
                variant={directionIcon as any}
                className='aucctus-stroke-brand-primary h-3.5 w-3.5 flex-shrink-0'
              />
              <button className='aucctus-bg-tertiary-hover ml-0.5 flex-shrink-0 rounded p-0.5'>
                <ChevronDown className='aucctus-stroke-tertiary h-3 w-3' />
              </button>
            </div>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content align='end' sideOffset={4} forceMount>
              <AnimatePresence>
                {openDropdown === dropdownKey && (
                  <motion.div
                    {...dropdownMotionProps}
                    className='aucctus-bg-primary aucctus-border-secondary z-[9999] w-[200px] rounded-md border p-1 shadow-lg'
                  >
                    {/* Toggle Sort Direction */}
                    <button
                      onClick={() => {
                        const newDirection = isDescending ? '' : '-';
                        const newField = isProperty
                          ? `${newDirection}property:${field}`
                          : `${newDirection}${field}`;
                        const newSorts = [...sortFields];
                        newSorts[index] = newField;
                        onUpdateFilters({ sort: newSorts.join(',') } as any);
                        setOpenDropdown(null);
                      }}
                      className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                    >
                      <DynamicIcon
                        variant={isDescending ? 'arrowup' : 'arrowdown'}
                        className='aucctus-stroke-secondary h-4 w-4'
                      />
                      <span className='aucctus-text-secondary'>
                        Sort {isDescending ? 'ascending' : 'descending'}
                      </span>
                    </button>

                    <div className='aucctus-bg-secondary my-1 h-px' />

                    {/* Remove Sort */}
                    <button
                      onClick={() => {
                        const remainingSorts = sortFields.filter(
                          (_, i) => i !== index,
                        );
                        if (remainingSorts.length === 0) {
                          onUpdateFilters({
                            sort: undefined,
                            sortConfigs: [],
                          } as any);
                        } else {
                          const newSortString = remainingSorts.join(',');
                          onUpdateFilters({ sort: newSortString } as any);
                        }
                        setOpenDropdown(null);
                      }}
                      className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                    >
                      <Trash2 className='aucctus-stroke-error-primary h-4 w-4' />
                      <span className='aucctus-text-error-primary'>
                        Remove sort
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>,
      );
    });
  }

  // 2. COLLECT ALL FILTERS

  // Property filters
  if (
    filterOptions.propertyFilters &&
    filterOptions.propertyFilters.length > 0
  ) {
    filterOptions.propertyFilters.forEach((filter: IPropertyFilter) => {
      const propDef = propertyDefinitions?.find(
        (def) => def.key === filter.key,
      );
      const icon = propDef ? getPropertyIcon(propDef) : 'clipboard';
      const name = propDef?.name || filter.key;

      // Format the filter value
      let formattedValue: string = String(filter.value);
      if (filter.operator === 'is_null') formattedValue = 'Is empty';
      else if (filter.operator === 'not_blank') formattedValue = 'Is not blank';
      else if (typeof filter.value === 'boolean')
        formattedValue = filter.value ? 'Checked' : 'Unchecked';
      else if (Array.isArray(filter.value))
        formattedValue = filter.value.join(', ');

      // Add operator prefix for numbers
      let operatorPrefix = '';
      if (
        filter.operator &&
        !['exact', 'contains', 'in', 'is_null', 'not_blank'].includes(
          filter.operator,
        )
      ) {
        const operatorMap: Record<string, string> = {
          gt: '>',
          gte: '≥',
          lt: '<',
          lte: '≤',
        };
        operatorPrefix = operatorMap[filter.operator]
          ? `${operatorMap[filter.operator]} `
          : '';
      }

      const dropdownKey = `property-filter-${filter.key}`;
      filterItems.push(
        <PropertyFilterDropdown
          key={dropdownKey}
          filter={filter}
          propDef={propDef}
          icon={icon}
          name={name}
          formattedValue={formattedValue}
          operatorPrefix={operatorPrefix}
          isOpen={openDropdown === dropdownKey}
          onOpenChange={(open) => setOpenDropdown(open ? dropdownKey : null)}
          onUpdateFilters={onUpdateFilters}
          filterOptions={filterOptions}
          hoveredSubmenu={hoveredSubmenu}
          setSubmenuImmediate={setSubmenuImmediate}
          setSubmenuDelayed={setSubmenuDelayed}
        />,
      );
    });
  }

  // Status filter
  if (filterOptions.status && filterOptions.status.size > 0) {
    const statusValues = Array.from(filterOptions.status)
      .map(camelCaseToTitleCase)
      .join(', ');
    const dropdownKey = 'status-filter';
    filterItems.push(
      <StatusFilterDropdown
        key={dropdownKey}
        statusValues={statusValues}
        isOpen={openDropdown === dropdownKey}
        onOpenChange={(open) => setOpenDropdown(open ? dropdownKey : null)}
        onUpdateFilters={onUpdateFilters}
        filterOptions={filterOptions}
        hoveredSubmenu={hoveredSubmenu}
        setSubmenuImmediate={setSubmenuImmediate}
        setSubmenuDelayed={setSubmenuDelayed}
      />,
    );
  }

  // Created By filter
  if (filterOptions.createdBy && filterOptions.createdBy.size > 0) {
    const userNames = Array.from(filterOptions.createdBy)
      .map((user: any) => utils.account.getUsersFullName(user))
      .join(', ');
    const dropdownKey = 'createdBy-filter';
    filterItems.push(
      <UserFilterDropdown
        key={dropdownKey}
        userNames={userNames}
        filterType='createdBy'
        isOpen={openDropdown === dropdownKey}
        onOpenChange={(open) => setOpenDropdown(open ? dropdownKey : null)}
        onUpdateFilters={onUpdateFilters}
        filterOptions={filterOptions}
        hoveredSubmenu={hoveredSubmenu}
        setSubmenuImmediate={setSubmenuImmediate}
        setSubmenuDelayed={setSubmenuDelayed}
      />,
    );
  }

  // Last Modified By filter
  if (filterOptions.lastModifiedBy && filterOptions.lastModifiedBy.size > 0) {
    const userNames = Array.from(filterOptions.lastModifiedBy)
      .map((user: any) => utils.account.getUsersFullName(user))
      .join(', ');
    const dropdownKey = 'lastModifiedBy-filter';
    filterItems.push(
      <UserFilterDropdown
        key={dropdownKey}
        userNames={userNames}
        filterType='lastModifiedBy'
        isOpen={openDropdown === dropdownKey}
        onOpenChange={(open) => setOpenDropdown(open ? dropdownKey : null)}
        onUpdateFilters={onUpdateFilters}
        filterOptions={filterOptions}
        hoveredSubmenu={hoveredSubmenu}
        setSubmenuImmediate={setSubmenuImmediate}
        setSubmenuDelayed={setSubmenuDelayed}
      />,
    );
  }

  // Search filter - simple chip with X button to clear
  if (filterOptions.search && filterOptions.search.trim()) {
    filterItems.push(
      <div
        key='search-filter'
        className='flex max-w-md items-center gap-1.5 rounded-md border border-blue-100 bg-blue-25 px-2 py-1 text-blue-800'
      >
        <Search className='h-3.5 w-3.5 flex-shrink-0 stroke-blue-800' />
        <span className='aucctus-text-sm flex-shrink-0 text-blue-800'>
          Search:
        </span>
        <span className='aucctus-text-sm truncate text-blue-800'>
          {filterOptions.search}
        </span>
        <button
          onClick={() => onUpdateFilters({ search: '' })}
          className='ml-0.5 flex-shrink-0 rounded p-0.5 hover:bg-blue-100'
          aria-label='Clear search'
        >
          <X className='h-3 w-3 stroke-blue-800' />
        </button>
      </div>,
    );
  }

  // 3. COMBINE: Sorts + Divider + Filters + Clear All
  const allItems: ReactNode[] = [];

  if (sortItems.length > 0) {
    allItems.push(...sortItems);
  }

  if (sortItems.length > 0 && filterItems.length > 0) {
    allItems.push(
      <div key='divider' className='aucctus-bg-brand-solid mx-1 h-6 w-px' />,
    );
  }

  if (filterItems.length > 0) {
    allItems.push(...filterItems);
  }

  if (allItems.length === 0) {
    return null;
  }

  // Add "Clear All" button at the end
  allItems.push(
    <button
      key='clear-all'
      onClick={() => {
        onUpdateFilters({
          sort: undefined,
          sortConfigs: [],
          propertyFilters: [],
          status: new Set(),
          createdBy: undefined,
          lastModifiedBy: undefined,
          search: '',
        } as any);
      }}
      className='aucctus-bg-error-subtle hover:aucctus-bg-error-secondary flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors'
    >
      <X className='aucctus-stroke-error-primary h-3.5 w-3.5 flex-shrink-0' />
      <span className='aucctus-text-sm aucctus-text-error-primary font-medium'>
        Clear All
      </span>
    </button>,
  );

  return <div className='flex flex-wrap items-center gap-1.5'>{allItems}</div>;
};

// ============================================================================
// Sub-components for filter dropdowns with hover submenus
// ============================================================================

interface IStatusFilterDropdownProps {
  statusValues: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateFilters: (updates: Partial<IConceptFilterOptions>) => void;
  filterOptions: IConceptFilterOptions;
  hoveredSubmenu: string | null;
  setSubmenuImmediate: (submenu: string | null) => void;
  setSubmenuDelayed: (submenu: string | null) => void;
}

const StatusFilterDropdown: React.FC<IStatusFilterDropdownProps> = ({
  statusValues,
  isOpen,
  onOpenChange,
  onUpdateFilters,
  filterOptions,
  hoveredSubmenu,
  setSubmenuImmediate,
  setSubmenuDelayed,
}) => {
  const [localSelection, setLocalSelection] = useState<Set<ConceptStatus>>(
    filterOptions.status,
  );
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);
  const hasSubmenuChangesRef = React.useRef(false);
  const prevHoveredSubmenuRef = React.useRef<string | null>(null);

  const submenuKey = 'status-filter-submenu';

  React.useEffect(() => {
    if (isOpen) {
      setLocalSelection(filterOptions.status);
      hasSubmenuChangesRef.current = false;
    }
  }, [isOpen, filterOptions.status]);

  // Apply filter when submenu closes (hover away)
  React.useEffect(() => {
    const wasOpen = prevHoveredSubmenuRef.current === submenuKey;
    const isNowClosed = hoveredSubmenu !== submenuKey;

    if (wasOpen && isNowClosed && hasSubmenuChangesRef.current) {
      onUpdateFilters({ status: localSelection });
      hasSubmenuChangesRef.current = false;
    }

    prevHoveredSubmenuRef.current = hoveredSubmenu;
  }, [hoveredSubmenu, localSelection, onUpdateFilters, submenuKey]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleToggle = (status: ConceptStatus) => {
    hasSubmenuChangesRef.current = true;
    setLocalSelection((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <div className='flex max-w-md items-center gap-1.5 rounded-md border border-blue-100 bg-blue-25 px-2 py-1 text-blue-800'>
          <Loader2 className='h-3.5 w-3.5 flex-shrink-0 stroke-blue-800' />
          <span className='aucctus-text-sm flex-shrink-0 text-blue-800'>
            Status:
          </span>
          <span className='aucctus-text-sm truncate text-blue-800'>
            {statusValues}
          </span>
          <button className='ml-0.5 flex-shrink-0 rounded p-0.5 hover:bg-blue-200'>
            <ChevronDown className='h-3 w-3 stroke-blue-800' />
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={4}
          forceMount
          onInteractOutside={(e) => {
            e.preventDefault();
            handleClose();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose();
          }}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                {...dropdownMotionProps}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] min-w-[200px] rounded-md border p-1 shadow-lg'
              >
                {/* Filter button with hover submenu */}
                <div className='relative'>
                  <button
                    ref={filterButtonRef}
                    className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                    onMouseEnter={() => setSubmenuImmediate(submenuKey)}
                    onMouseLeave={() => setSubmenuDelayed(null)}
                  >
                    <ListFilter className='aucctus-stroke-secondary h-4 w-4' />
                    <span className='aucctus-text-secondary'>Filter</span>
                    <ChevronRight className='aucctus-stroke-tertiary ml-auto h-4 w-4' />
                  </button>

                  {/* Filter Submenu Flyout */}
                  {hoveredSubmenu === submenuKey && (
                    <div
                      onMouseEnter={() => setSubmenuImmediate(submenuKey)}
                      onMouseLeave={() => setSubmenuDelayed(null)}
                      className='absolute left-full top-1/2 z-[10000] -ml-2 -translate-y-1/2'
                    >
                      {/* Invisible bridge */}
                      <div className='absolute bottom-0 right-full top-0 w-3' />
                      <div className='aucctus-bg-primary aucctus-border-secondary ml-3 w-[240px] rounded-lg border p-3 shadow-lg'>
                        <div className='mb-3 flex items-center gap-2'>
                          <ListFilter className='aucctus-stroke-secondary h-4 w-4' />
                          <span className='aucctus-text-secondary text-sm font-medium'>
                            Filter by Status
                          </span>
                        </div>

                        <StatusFilterContent
                          localSelection={localSelection}
                          onToggle={handleToggle}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className='aucctus-bg-secondary my-1 h-px' />

                <button
                  onClick={() => {
                    onUpdateFilters({ status: new Set() });
                    onOpenChange(false);
                  }}
                  className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                >
                  <Trash2 className='aucctus-stroke-error-primary h-4 w-4' />
                  <span className='aucctus-text-error-primary'>
                    Remove filter
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

interface IUserFilterDropdownProps {
  userNames: string;
  filterType: 'createdBy' | 'lastModifiedBy';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateFilters: (updates: Partial<IConceptFilterOptions>) => void;
  filterOptions: IConceptFilterOptions;
  hoveredSubmenu: string | null;
  setSubmenuImmediate: (submenu: string | null) => void;
  setSubmenuDelayed: (submenu: string | null) => void;
}

const UserFilterDropdown: React.FC<IUserFilterDropdownProps> = ({
  userNames,
  filterType,
  isOpen,
  onOpenChange,
  onUpdateFilters,
  filterOptions,
  hoveredSubmenu,
  setSubmenuImmediate,
  setSubmenuDelayed,
}) => {
  const [localSelection, setLocalSelection] = useState<Set<IUser> | undefined>(
    () => {
      const currentFilter =
        filterType === 'createdBy'
          ? filterOptions.createdBy
          : filterOptions.lastModifiedBy;
      if (!currentFilter) return undefined;
      return currentFilter instanceof Set
        ? currentFilter
        : new Set(Array.isArray(currentFilter) ? currentFilter : []);
    },
  );
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const currentFilter =
        filterType === 'createdBy'
          ? filterOptions.createdBy
          : filterOptions.lastModifiedBy;
      if (!currentFilter) {
        setLocalSelection(undefined);
      } else if (currentFilter instanceof Set) {
        setLocalSelection(currentFilter);
      } else {
        setLocalSelection(
          new Set(Array.isArray(currentFilter) ? currentFilter : []),
        );
      }
    }
  }, [isOpen, filterOptions, filterType]);

  const handleClose = () => {
    onOpenChange(false);
    const currentFilter =
      filterType === 'createdBy'
        ? filterOptions.createdBy
        : filterOptions.lastModifiedBy;
    if (localSelection !== currentFilter) {
      onUpdateFilters(
        filterType === 'createdBy'
          ? { createdBy: localSelection }
          : { lastModifiedBy: localSelection },
      );
    }
  };

  const handleUserToggle = (user: IUser) => {
    setLocalSelection((prevSelection) => {
      const currentSet = prevSelection
        ? new Set(prevSelection)
        : new Set<IUser>();
      const isSelected = Array.from(currentSet).some(
        (u) => u.uuid === user.uuid,
      );

      if (isSelected) {
        const newSet = new Set(
          Array.from(currentSet).filter((u) => u.uuid !== user.uuid),
        );
        return newSet.size > 0 ? newSet : undefined;
      } else {
        const newSet = new Set([...Array.from(currentSet), user]);
        return newSet;
      }
    });
  };

  const icon = filterType === 'createdBy' ? 'user-square' : 'users-edit';
  const label = filterType === 'createdBy' ? 'Created By' : 'Last Modified By';
  const submenuKey = `${filterType}-filter-submenu`;

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <div className='flex max-w-md items-center gap-1.5 rounded-md border border-blue-300 bg-blue-100 px-2 py-1 text-blue-700'>
          <DynamicIcon
            variant={icon as any}
            className='h-3.5 w-3.5 flex-shrink-0 stroke-blue-700'
          />
          <span className='aucctus-text-sm flex-shrink-0 text-blue-700'>
            {label}:
          </span>
          <span className='aucctus-text-sm truncate text-blue-700'>
            {userNames}
          </span>
          <button className='ml-0.5 flex-shrink-0 rounded p-0.5 hover:bg-blue-200'>
            <ChevronDown className='h-3 w-3 stroke-blue-700' />
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={4}
          forceMount
          onInteractOutside={(e) => {
            e.preventDefault();
            handleClose();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            handleClose();
          }}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                {...dropdownMotionProps}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] w-[200px] rounded-md border p-1 shadow-lg'
              >
                {/* Filter button with hover submenu */}
                <div className='relative'>
                  <button
                    ref={filterButtonRef}
                    className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                    onMouseEnter={() => setSubmenuImmediate(submenuKey)}
                    onMouseLeave={() => setSubmenuDelayed(null)}
                  >
                    <ListFilter className='aucctus-stroke-secondary h-4 w-4' />
                    <span className='aucctus-text-secondary'>Filter</span>
                    <ChevronRight className='aucctus-stroke-tertiary ml-auto h-4 w-4' />
                  </button>

                  {/* Filter Submenu Flyout */}
                  {hoveredSubmenu === submenuKey && (
                    <div
                      onMouseEnter={() => setSubmenuImmediate(submenuKey)}
                      onMouseLeave={() => setSubmenuDelayed(null)}
                      className='absolute left-full top-1/2 z-[10000] -ml-2 -translate-y-1/2'
                    >
                      {/* Invisible bridge */}
                      <div className='absolute bottom-0 right-full top-0 w-3' />
                      <div className='aucctus-bg-primary aucctus-border-secondary ml-3 w-[280px] rounded-lg border p-3 shadow-lg'>
                        <div className='mb-3 flex items-center gap-2'>
                          <ListFilter className='aucctus-stroke-secondary h-4 w-4' />
                          <span className='aucctus-text-secondary text-sm font-medium'>
                            Filter by {label}
                          </span>
                        </div>

                        <UserFilterContent
                          localSelection={localSelection}
                          onToggle={handleUserToggle}
                          filterType={filterType}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className='aucctus-bg-secondary my-1 h-px' />

                <button
                  onClick={() => {
                    onUpdateFilters(
                      filterType === 'createdBy'
                        ? { createdBy: undefined }
                        : { lastModifiedBy: undefined },
                    );
                    onOpenChange(false);
                  }}
                  className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                >
                  <Trash2 className='aucctus-stroke-error-primary h-4 w-4' />
                  <span className='aucctus-text-error-primary'>
                    Remove filter
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

interface IPropertyFilterDropdownProps {
  filter: IPropertyFilter;
  propDef: IPropertyDefinition | undefined;
  icon: string;
  name: string;
  formattedValue: string;
  operatorPrefix: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateFilters: (updates: Partial<IConceptFilterOptions>) => void;
  filterOptions: IConceptFilterOptions;
  hoveredSubmenu: string | null;
  setSubmenuImmediate: (submenu: string | null) => void;
  setSubmenuDelayed: (submenu: string | null) => void;
}

const PropertyFilterDropdown: React.FC<IPropertyFilterDropdownProps> = ({
  filter,
  propDef,
  icon,
  name,
  formattedValue,
  operatorPrefix,
  isOpen,
  onOpenChange,
  onUpdateFilters,
  filterOptions,
  hoveredSubmenu,
  setSubmenuImmediate,
  setSubmenuDelayed,
}) => {
  const [filterValue, setFilterValue] = useState(
    filter.value !== undefined && filter.value !== null ? filter.value : '',
  );
  const [filterOperator, setFilterOperator] = useState<
    IPropertyFilter['operator']
  >(filter.operator || 'exact');
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);

  // Ref to capture immediate filter value for synchronous access (checkbox case)
  const pendingFilterValueRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      setFilterValue(
        filter.value !== undefined && filter.value !== null ? filter.value : '',
      );
      setFilterOperator(filter.operator || 'exact');
    }
  }, [isOpen, filter]);

  const handleApplyFilter = () => {
    if (filterOperator === 'is_null' || filterOperator === 'not_blank') {
      const updatedFilters = (filterOptions.propertyFilters || []).map((f) =>
        f.key === filter.key
          ? { key: filter.key, value: 'true', operator: filterOperator }
          : f,
      );
      onUpdateFilters({ propertyFilters: updatedFilters });
      onOpenChange(false);
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

    if (
      valueToApply !== null &&
      valueToApply !== undefined &&
      valueToApply !== ''
    ) {
      const updatedFilters = (filterOptions.propertyFilters || []).map((f) =>
        f.key === filter.key
          ? { key: filter.key, value: valueToApply, operator: filterOperator }
          : f,
      );
      onUpdateFilters({ propertyFilters: updatedFilters });
    }
    onOpenChange(false);
  };

  const handleRemoveFilter = () => {
    const updatedFilters = filterOptions.propertyFilters?.filter(
      (f) => f.key !== filter.key,
    );
    onUpdateFilters({ propertyFilters: updatedFilters });
    onOpenChange(false);
  };

  const submenuKey = `property-${filter.key}-filter-submenu`;

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <div className='flex max-w-md items-center gap-1.5 rounded-md border border-blue-300 bg-blue-100 px-2 py-1 text-blue-700'>
          <DynamicIcon
            variant={icon as any}
            className='h-3.5 w-3.5 flex-shrink-0 stroke-blue-700'
          />
          <span className='aucctus-text-sm flex-shrink-0 text-blue-700'>
            {name}:
          </span>
          <span className='aucctus-text-sm truncate text-blue-700'>
            {operatorPrefix}
            {formattedValue}
          </span>
          <button className='ml-0.5 flex-shrink-0 rounded p-0.5 hover:bg-blue-200'>
            <ChevronDown className='h-3 w-3 stroke-blue-700' />
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={4}
          forceMount
          onInteractOutside={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            onOpenChange(false);
          }}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                {...dropdownMotionProps}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] rounded-md border shadow-lg'
              >
                {propDef && (
                  <div className='p-1'>
                    {/* Filter button with hover submenu */}
                    <div className='relative'>
                      <button
                        ref={filterButtonRef}
                        className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                        onMouseEnter={() => setSubmenuImmediate(submenuKey)}
                        onMouseLeave={() => setSubmenuDelayed(null)}
                      >
                        <ListFilter className='aucctus-stroke-secondary h-4 w-4' />
                        <span className='aucctus-text-secondary'>Filter</span>
                        <ChevronRight className='aucctus-stroke-tertiary ml-auto h-4 w-4' />
                      </button>

                      {/* Filter Submenu Flyout */}
                      {hoveredSubmenu === submenuKey && (
                        <div
                          onMouseEnter={() => setSubmenuImmediate(submenuKey)}
                          onMouseLeave={() => setSubmenuDelayed(null)}
                          className='absolute left-full top-1/2 z-[10000] -ml-2 -translate-y-1/2'
                        >
                          {/* Invisible bridge */}
                          <div className='absolute bottom-0 right-full top-0 w-3' />
                          <div className='aucctus-bg-primary aucctus-border-secondary ml-3 w-[280px] rounded-lg border p-3 shadow-lg'>
                            <div className='mb-3 flex items-center gap-2'>
                              <ListFilter className='aucctus-stroke-secondary h-4 w-4' />
                              <span className='aucctus-text-secondary text-sm font-medium'>
                                Filter by {name}
                              </span>
                            </div>

                            <PropertyFilterContent
                              propDef={propDef}
                              filterValue={filterValue}
                              filterOperator={filterOperator}
                              onFilterValueChange={(value) => {
                                // Store in ref for synchronous access (checkbox case)
                                pendingFilterValueRef.current = value;
                                setFilterValue(value);
                              }}
                              onFilterOperatorChange={setFilterOperator}
                              onApply={handleApplyFilter}
                              onCancel={() => setSubmenuImmediate(null)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='aucctus-bg-secondary my-1 h-px' />

                    <button
                      onClick={handleRemoveFilter}
                      className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                    >
                      <Trash2 className='aucctus-stroke-error-primary h-4 w-4' />
                      <span className='aucctus-text-error-primary'>
                        Remove filter
                      </span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default CompactFilterRibbon;
