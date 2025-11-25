import {
  IConcept,
  IPropertyDefinition,
  IPropertyFilter,
  ConceptSortString,
} from '@libs/api/types';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React from 'react';
import PropertyColumnHeader from '@components/Tables/PropertyColumns/PropertyColumnHeader';
import EditablePropertyCell from '@components/Tables/PropertyColumns/EditablePropertyCell';
import { toCamelCase } from '@libs/utils/string';

/**
 * Get property value from customProperties, handling both snake_case and camelCase keys
 */
const getPropertyValue = (
  customProperties: Record<string, any> | undefined,
  key: string,
): any => {
  if (!customProperties) return undefined;

  // Try the key as-is first
  if (key in customProperties) {
    return customProperties[key];
  }

  // Try camelCase version
  const camelKey = toCamelCase(key);
  if (camelKey in customProperties) {
    return customProperties[camelKey];
  }

  return undefined;
};

/**
 * Build dynamic column definitions from property definitions
 * @param propertyDefinitions - Array of property definitions from the backend
 * @param visibleColumnKeys - Set of property keys that should be visible
 * @param columnHelper - TanStack Table column helper for IConcept type
 * @param onFilterChange - Callback when a filter is applied to a property column
 * @param onSort - Callback when sort is changed from column menu
 * @param currentSort - Current sort configuration
 * @param currentFilters - Current property filters applied
 * @param onReorder - Callback when columns are reordered via drag and drop
 * @param wrappedColumns - Set of column keys that should wrap text
 * @returns Array of column definitions for TanStack Table
 */
export const buildPropertyColumns = (
  propertyDefinitions: IPropertyDefinition[],
  visibleColumnKeys: Set<string>,
  columnHelper: ReturnType<typeof createColumnHelper<IConcept>>,
  onFilterChange: (filter: IPropertyFilter) => void,
  onSort: (key: string, direction: 'asc' | 'desc') => void,
  currentSort?: ConceptSortString,
  currentFilters?: IPropertyFilter[],
  onReorder?: (draggedKey: string, targetKey: string) => void,
  wrappedColumns?: Set<string>,
): ColumnDef<IConcept, any>[] => {
  // Filter to only visible properties - only check visibility set, not is_active
  const visibleProperties = propertyDefinitions
    .filter((def) => visibleColumnKeys.has(def.key))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return visibleProperties.map((propDef) => {
    // Determine current sort state for this column
    const getCurrentSort = (): 'asc' | 'desc' | null => {
      if (!currentSort) return null;

      // Parse multi-sort string to find this property's sort
      const sortFields = currentSort.split(',');
      for (const sortField of sortFields) {
        const trimmed = sortField.trim();
        if (trimmed === `property:${propDef.key}`) return 'asc';
        if (trimmed === `-property:${propDef.key}`) return 'desc';
      }

      return null;
    };

    // Find current filter for this property
    const getCurrentFilter = (): IPropertyFilter | undefined => {
      return currentFilters?.find((filter) => filter.key === propDef.key);
    };

    return columnHelper.accessor(
      (row) => getPropertyValue(row.customProperties, propDef.key),
      {
        id: propDef.key,
        size: 150,
        minSize: 130,
        maxSize: 300,
        enableSorting: false, // Disable TanStack's built-in sorting since we handle it via menu
        enableResizing: true,
        header: () => {
          return (
            <PropertyColumnHeader
              definition={propDef}
              onFilterChange={onFilterChange}
              onSort={(direction) => onSort(propDef.key, direction)}
              currentSort={getCurrentSort()}
              currentFilter={getCurrentFilter()}
              onReorder={onReorder}
            />
          );
        },
        cell: (info) => {
          const value = info.getValue();
          const concept = info.row.original;
          const isEvenRow = info.row.index % 2 === 1; // index is 0-based, so odd index = even row
          const shouldWrap = wrappedColumns?.has(propDef.key) || false;

          return (
            <EditablePropertyCell
              value={value}
              definition={propDef}
              conceptIdentifier={concept.identifier}
              isEvenRow={isEvenRow}
              shouldWrap={shouldWrap}
            />
          );
        },
        // Store the property definition in meta for use in sorting/filtering and drag/drop
        meta: {
          propertyDefinition: propDef,
          onFilterChange,
          onReorder,
          isPropertyColumn: true,
        },
      },
    );
  });
};
