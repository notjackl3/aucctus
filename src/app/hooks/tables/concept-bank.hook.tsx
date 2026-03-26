import { Badge, Button, ComponentTooltip, Table, Text } from '@components';
import { toast } from '@components/Notification/toast';
import PriorityCell from '@components/Tables/ConceptBank/PriorityCell';
import { UnseenChangesTooltip } from '@components/ToolTip/UnseenChangesTooltip';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useConceptPriorities } from '@hooks/query/concept-priority.hook';
import {
  doFullConceptInvalidation,
  useConceptReportGenerate,
  useConcepts,
  useRetryConceptReport,
} from '@hooks/query/concepts.hook';
import { usePropertyDefinitions } from '@hooks/query/properties.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { buildPropertyColumns } from '@hooks/tables/utils/buildPropertyColumns';
import {
  ConceptReportStatus,
  ConceptSortString,
  ConceptStatus,
  IConcept,
  IConceptPage,
  IPropertyFilter,
  IUser,
  SortableConceptProperties,
} from '@libs/api/types';
import { IConceptWorkflowMessage } from '@libs/api/types/socketMessages/inbound';
import telemetry from '@libs/telemetry';
import utils from '@libs/utils';
import { canOpenConceptWhilePending } from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';
import {
  getTablePreferences,
  saveColumnOrder,
  saveFilters,
} from '@libs/utils/table-preferences';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { useColumnVisibilityStore } from '@stores/table-columns.store';
import {
  ColumnDef,
  ColumnResizeMode,
  createColumnHelper,
  getCoreRowModel,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

/**
 * Represents a single sort configuration
 */
export interface ISortConfig {
  field: string; // Column ID (e.g., 'status', 'createdAt', or property key)
  direction: 'asc' | 'desc';
  isProperty: boolean; // True if sorting by custom property
}

export interface IConceptFilterOptions {
  status: Set<ConceptStatus>;
  createdBy?: Set<IUser>;
  lastModifiedBy?: Set<IUser>;
  search?: string;
  sort?: ConceptSortString; // Comma-separated sort string (e.g., "status,-createdAt,property:priority")
  sortConfigs?: ISortConfig[]; // Parsed sort configurations for UI state
  propertyFilters?: IPropertyFilter[];
}

const columnHelper = createColumnHelper<IConcept>();

const INITIAL_FILTER: IConceptFilterOptions = {
  status: new Set<ConceptStatus>(),
};

const PAGE_SIZE = 20;

function isSortableConceptProperty(
  value: string,
): value is SortableConceptProperties {
  const arr: SortableConceptProperties[] = [
    'created_at',
    'updated_at',
    'created_by__first_name',
    'created_by__last_name',
    'updated_by__first_name',
    'updated_by__last_name',
    'status',
    'title',
    'priority__overall_priority_score',
  ];
  return (arr as string[]).includes(value);
}

/**
 * Parse a sort string into an array of sort configurations
 * Examples:
 * - "status" → [{ field: 'status', direction: 'asc', isProperty: false }]
 * - "-createdAt" → [{ field: 'createdAt', direction: 'desc', isProperty: false }]
 * - "property:priority" → [{ field: 'priority', direction: 'asc', isProperty: true }]
 * - "status,-property:priority" → [{ field: 'status', direction: 'asc', isProperty: false }, { field: 'priority', direction: 'desc', isProperty: true }]
 */
function parseSortString(sortString?: string): ISortConfig[] {
  if (!sortString) return [];

  return sortString.split(',').map((sortField) => {
    const isDescending = sortField.startsWith('-');
    const fieldWithoutSign = isDescending ? sortField.slice(1) : sortField;
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
}

/**
 * Build a sort string from an array of sort configurations
 * Examples:
 * - [{ field: 'status', direction: 'asc', isProperty: false }] → "status"
 * - [{ field: 'createdAt', direction: 'desc', isProperty: false }] → "-createdAt"
 * - [{ field: 'priority', direction: 'asc', isProperty: true }] → "property:priority"
 * - [{ field: 'status', direction: 'asc', isProperty: false }, { field: 'priority', direction: 'desc', isProperty: true }] → "status,-property:priority"
 */
function buildSortString(sortConfigs: ISortConfig[]): string {
  return sortConfigs
    .map((config) => {
      const prefix = config.isProperty ? 'property:' : '';
      const sign = config.direction === 'desc' ? '-' : '';
      return `${sign}${prefix}${config.field}`;
    })
    .join(',');
}

/**
 * Interface defining the return type of the useConceptBank hook
 */
interface UseConceptBankResult {
  isLoading: boolean;
  numberOfPages: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  table: ReturnType<typeof useReactTable<IConcept>>;
  updateTableFiltering: (value: Partial<IConceptFilterOptions>) => void;
  resetFilter: () => void;
  filterOptions: IConceptFilterOptions;
  handleRowClick: (rowId: string) => void;
  handleRemoveSort: (field: string, isProperty: boolean) => void;
  isDebugModeEnabled: boolean;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  selectedConceptUuids: string[];
  isAllAcrossPagesSelected: boolean;
  totalCount: number;
  clearSelection: () => void;
}

export const useConceptBank = (
  externalFilterOptions?: IConceptFilterOptions,
  externalUpdateTableFiltering?: (
    value: Partial<IConceptFilterOptions>,
  ) => void,
): UseConceptBankResult => {
  const navigate = useNavigate();
  const { mutate: generateConceptReport } = useConceptReportGenerate();
  const { mutate: retryConceptReport } = useRetryConceptReport();
  const queryClient = useQueryClient();

  // Get account UUID from store
  const accountUuid = useStore((state) => state.auth.user?.account?.uuid);

  // Fetch property definitions from API
  const { data: propertyDefinitions } = usePropertyDefinitions(accountUuid);

  // Load saved preferences from localStorage
  const savedPreferences = React.useMemo(
    () => getTablePreferences('concept_bank', accountUuid),
    [accountUuid],
  );

  // Local state for column order (from localStorage)
  const [localColumnOrder, setLocalColumnOrder] = React.useState<
    string[] | null
  >(savedPreferences?.columnOrder || null);

  // Track if we've initialized the column order
  const hasInitializedColumnOrder = React.useRef(false);

  // Get visible column keys from store
  const {
    visiblePropertyColumns,
    knownPropertyKeys,
    wrappedColumns,
    setVisibleColumns,
    setKnownPropertyKeys,
    visibleStaticColumns,
  } = useColumnVisibilityStore();

  // Initialize all property columns as visible by default when first loaded
  React.useEffect(() => {
    if (!propertyDefinitions || propertyDefinitions.length === 0) return;

    const allPropertyKeys = propertyDefinitions.map((def) => def.key);

    // First time initialization (no known properties yet)
    if (knownPropertyKeys.size === 0) {
      // Make all properties visible and mark them as known
      setVisibleColumns(allPropertyKeys);
      setKnownPropertyKeys(allPropertyKeys);
      return;
    }

    // Check for truly new properties (not in known set)
    const newPropertyKeys = allPropertyKeys.filter(
      (key) => !knownPropertyKeys.has(key),
    );

    // If there are new properties, add them as visible and update known set
    if (newPropertyKeys.length > 0) {
      const updatedVisibleKeys = [
        ...Array.from(visiblePropertyColumns),
        ...newPropertyKeys,
      ];
      setVisibleColumns(updatedVisibleKeys);
      setKnownPropertyKeys(allPropertyKeys);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyDefinitions, setVisibleColumns, setKnownPropertyKeys]);

  // WebSocket listener for concept workflow status updates
  // Event name: 'concept.workflow.update.account'
  useSocketEvent<'concept.workflow.update.account', IConceptWorkflowMessage>(
    'concept.workflow.update.account',
    React.useCallback(
      (data: IConceptWorkflowMessage) => {
        const {
          conceptUuid,
          eventType,
          reportStatusBySection, // CRITICAL: Use complete section data
          aggregateStatus, // CRITICAL: Backend-calculated aggregate status
          progressPercentage,
          completedSections,
          totalSections,
          message,
          errorDetails,
        } = data;

        telemetry.log('concept.websocket.update.received', {
          conceptUuid,
          eventType,
          aggregateStatus,
          progressPercentage,
          completedSectionsCount: completedSections?.length || 0,
          totalSections,
          message,
          hasErrorDetails: !!errorDetails,
          hasSectionData: !!reportStatusBySection,
          hasAggregateStatus: !!aggregateStatus,
        });

        // Update all relevant concept queries in cache
        const conceptsQueries = queryClient.getQueriesData<IConceptPage>([
          AucctusQueryKeys.concepts,
        ]);

        let updateApplied = false;

        conceptsQueries.forEach(([queryKey, oldData]) => {
          if (!oldData?.results) return;

          const conceptIndex = oldData.results.findIndex(
            (concept) => concept.uuid === conceptUuid,
          );

          if (conceptIndex === -1) return;

          const updatedResults = [...oldData.results];
          const oldConcept = updatedResults[conceptIndex];
          const updatedConcept: IConcept = {
            ...oldConcept,
            // CRITICAL: Use backend-provided aggregate status when available, otherwise fall back to mapping
            reportStatusAggregate:
              (aggregateStatus as ConceptReportStatus) ||
              oldConcept.reportStatusAggregate,

            // CRITICAL: Update section-level data from WebSocket when available
            ...(reportStatusBySection && {
              reportStatusBySection: reportStatusBySection,
            }),

            // Update progress-related fields from WebSocket event
            ...(progressPercentage !== undefined && {
              progressPercentage: progressPercentage,
            }),
            ...(completedSections && {
              completedSections: completedSections,
            }),
            ...(totalSections !== undefined && {
              totalSections: totalSections,
            }),
          };

          updatedResults[conceptIndex] = updatedConcept;

          // Update this specific query
          queryClient.setQueryData<IConceptPage>(queryKey, {
            ...oldData,
            results: updatedResults,
          });

          if (!updateApplied) {
            telemetry.log('concept.websocket.update.applied', {
              conceptUuid,
              eventType,
              aggregateStatus,
              oldStatus: oldConcept.reportStatusAggregate,
              newStatus: updatedConcept.reportStatusAggregate,
              progressPercentage: updatedConcept.progressPercentage,
              completedSections: updatedConcept.completedSections?.length,
              totalSections: updatedConcept.totalSections,
              sectionsUpdated: Object.keys(reportStatusBySection || {}).length,
            });
            updateApplied = true;
          }
        });
      },
      [queryClient],
    ),
  );

  // Use global debug mode state
  const isDebugModeEnabled = useDebugMode();

  // Initialize filter options from localStorage or external props
  const initialFilterOptions = React.useMemo(() => {
    let options: IConceptFilterOptions;

    if (externalFilterOptions) {
      options = externalFilterOptions;
    } else if (savedPreferences?.filters) {
      options = savedPreferences.filters;
    } else {
      options = INITIAL_FILTER;
    }

    // Ensure status is always a Set (defensive programming)
    if (!options.status || !(options.status instanceof Set)) {
      options = {
        ...options,
        status: new Set(
          options.status ? Array.from(options.status as any) : [],
        ),
      };
    }

    return options;
  }, [externalFilterOptions, savedPreferences?.filters]);

  // Use refs for values that don't need to trigger re-renders when updated internally
  const filterOptionsRef =
    React.useRef<IConceptFilterOptions>(initialFilterOptions);
  const [filterOptions, setFilterOptions] =
    React.useState<IConceptFilterOptions>(initialFilterOptions);

  const [page, setPage] = React.useState<number>(1);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [isAllAcrossPagesSelected, setIsAllAcrossPagesSelected] =
    React.useState(false);

  // Refs for stable callback access (avoids recreating handleRowSelectionChange on every selection)
  const rowSelectionRef = React.useRef(rowSelection);
  rowSelectionRef.current = rowSelection;
  const isAllAcrossPagesSelectedRef = React.useRef(isAllAcrossPagesSelected);
  isAllAcrossPagesSelectedRef.current = isAllAcrossPagesSelected;

  // If we receive external filter options, use those instead
  React.useEffect(() => {
    if (externalFilterOptions) {
      const mergedOptions = { ...filterOptions, ...externalFilterOptions };

      // Ensure status is always a Set after merging
      if (!mergedOptions.status || !(mergedOptions.status instanceof Set)) {
        mergedOptions.status = new Set(
          mergedOptions.status ? Array.from(mergedOptions.status as any) : [],
        );
      }

      setFilterOptions(mergedOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFilterOptions]);

  // Memoize the query options to prevent unnecessary API calls
  const queryOptions = useMemo(
    () => ({
      status:
        filterOptions.status && filterOptions.status.size > 0
          ? Array.from(filterOptions.status).join(',')
          : undefined,
      createdBy:
        filterOptions.createdBy && filterOptions.createdBy.size > 0
          ? Array.from(filterOptions.createdBy)
              .map((user) => `${user.firstName} ${user.lastName}`)
              .join(',')
          : undefined,
      lastModifiedBy:
        filterOptions.lastModifiedBy && filterOptions.lastModifiedBy.size > 0
          ? Array.from(filterOptions.lastModifiedBy)
              .map((user) => `${user.firstName} ${user.lastName}`)
              .join(',')
          : undefined,
      search: filterOptions.search,
      page: page,
      sort: filterOptions.sort,
      // Support multiple concurrent property filters with AND logic
      properties:
        filterOptions.propertyFilters &&
        filterOptions.propertyFilters.length > 0
          ? JSON.stringify(
              filterOptions.propertyFilters.map((filter) => ({
                ...filter,
                // Convert boolean values to strings for API compatibility
                value:
                  typeof filter.value === 'boolean'
                    ? String(filter.value)
                    : filter.value,
              })),
            )
          : undefined,
    }),
    [
      filterOptions.status,
      filterOptions.createdBy,
      filterOptions.lastModifiedBy,
      filterOptions.search,
      filterOptions.sort,
      filterOptions.propertyFilters,
      page,
    ],
  );

  // Fetch concepts with memoized query options
  const { data, isLoading } = useConcepts(queryOptions);

  // Ref for stable access to current page results
  const dataResultsRef = React.useRef(data?.results);
  dataResultsRef.current = data?.results;

  // Auto-select all rows on current page when isAllAcrossPagesSelected and page data changes
  React.useEffect(() => {
    if (isAllAcrossPagesSelected && data?.results) {
      const allPageRows = Object.fromEntries(
        data.results.map((r) => [r.uuid, true]),
      );
      setRowSelection(allPageRows);
    }
  }, [isAllAcrossPagesSelected, data?.results]);

  // Custom row selection handler that clears isAllAcrossPagesSelected when a row is deselected
  // Uses refs to avoid recreating the callback on every selection change
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> =
    React.useCallback((updaterOrValue) => {
      const newSelection =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(rowSelectionRef.current)
          : updaterOrValue;

      if (isAllAcrossPagesSelectedRef.current) {
        const currentPageUuids =
          dataResultsRef.current?.map((r) => r.uuid) || [];
        const allCurrentPageSelected = currentPageUuids.every(
          (uuid) => newSelection[uuid],
        );
        if (!allCurrentPageSelected) {
          setIsAllAcrossPagesSelected(false);
        }
      }

      setRowSelection(newSelection);
    }, []);

  // Atomically clear both row selection and all-across-pages state
  const clearSelection = React.useCallback(() => {
    setRowSelection({});
    setIsAllAcrossPagesSelected(false);
  }, []);

  // Fetch concept priorities
  const { priorities } = useConceptPriorities();

  // Create a lookup map for priorities by concept UUID
  const priorityMap = React.useMemo(() => {
    const map = new Map();
    priorities.forEach((priority) => {
      // Use conceptUuid to map priorities to concepts
      map.set(priority.conceptUuid, priority);
    });
    return map;
  }, [priorities]);

  // Ref to access priorityMap inside column definitions without causing column re-creation.
  // This prevents PriorityCell from remounting (and losing sheet open state) when priorities update.
  const priorityMapRef = React.useRef(priorityMap);
  priorityMapRef.current = priorityMap;

  // Optimize the updateTableFiltering function
  const updateTableFiltering = React.useCallback(
    (value: Partial<IConceptFilterOptions>) => {
      setPage(1); // avoid pagination issues

      // Clear selection when filters change
      setRowSelection({});
      setIsAllAcrossPagesSelected(false);

      // Use external update function if provided, otherwise update local state
      if (externalUpdateTableFiltering) {
        externalUpdateTableFiltering(value);
      } else {
        // Update the ref first to ensure consistency
        filterOptionsRef.current = { ...filterOptionsRef.current, ...value };
        setFilterOptions(filterOptionsRef.current);

        // Persist filters to localStorage (scoped by account)
        saveFilters('concept_bank', filterOptionsRef.current, accountUuid);
      }
    },
    [externalUpdateTableFiltering, accountUuid],
  );

  // Reset the filter function
  const resetFilter = React.useCallback(() => {
    if (externalUpdateTableFiltering) {
      externalUpdateTableFiltering(INITIAL_FILTER);
    } else {
      filterOptionsRef.current = INITIAL_FILTER;
      setFilterOptions(INITIAL_FILTER);

      // Persist reset to localStorage
      saveFilters('concept_bank', INITIAL_FILTER, accountUuid);
    }
    setPage(1);
  }, [externalUpdateTableFiltering, accountUuid]);

  const handleGenerateConceptButton = React.useCallback(
    (row: Row<IConcept>) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const reportStatus = row.original.reportStatusAggregate;
        switch (reportStatus) {
          case 'notStarted':
            generateConceptReport(row.original.uuid, {
              onSuccess: () => {
                // Invalidate the concepts query to refresh initial data (WebSocket will handle subsequent updates)
                queryClient.invalidateQueries({
                  queryKey: [AucctusQueryKeys.concepts],
                });
              },
            });
            break;
          case 'error':
            retryConceptReport(row.original.uuid, {
              onSuccess: () => {
                // Trigger toast notification
                toast.warning(
                  'Report retry started',
                  'The system will now process your request. This may take a few minutes.',
                );
                // Invalidate the concepts query to refresh initial data (WebSocket will handle subsequent updates)
                queryClient.invalidateQueries({
                  queryKey: [AucctusQueryKeys.concepts],
                });
              },
            });
            break;
          case 'complete':
            doFullConceptInvalidation(queryClient, row.original.identifier);
            navigate(
              AppPath.ConceptOverview.replace(':id', row.original.identifier),
            );
            break;
          case 'pending':
            if (
              canOpenConceptWhilePending(
                row.original.reportStatusBySection,
                row.original.dateReportCompleted,
              )
            ) {
              doFullConceptInvalidation(queryClient, row.original.identifier);
              navigate(
                AppPath.ConceptOverview.replace(':id', row.original.identifier),
              );
            } else {
              e.stopPropagation();
            }
            break;
          default:
            e.stopPropagation();
        }
      },
    [navigate, retryConceptReport, generateConceptReport, queryClient],
  );

  // Handler for property filter changes
  const handlePropertyFilterChange = React.useCallback(
    (filter: IPropertyFilter) => {
      // Check if filter should be cleared
      // Note: false is a valid boolean value, so we need to check for null/undefined/empty string explicitly
      // IMPORTANT: For operators like 'is_null' and 'not_blank', they send value='true' to the backend
      const isOperatorWithoutUserInput =
        filter.operator === 'is_null' || filter.operator === 'not_blank';

      const shouldClearFilter =
        !isOperatorWithoutUserInput &&
        (filter.value === null ||
          filter.value === undefined ||
          filter.value === '');

      if (shouldClearFilter) {
        // Clear this specific filter by key
        const updatedFilters = (filterOptions.propertyFilters || []).filter(
          (f) => f.key !== filter.key,
        );
        updateTableFiltering({ propertyFilters: updatedFilters });
      } else {
        // Add or update filter for this property
        const existingFilters = filterOptions.propertyFilters || [];
        const existingIndex = existingFilters.findIndex(
          (f) => f.key === filter.key,
        );

        let updatedFilters: IPropertyFilter[];
        if (existingIndex >= 0) {
          // Update existing filter
          updatedFilters = [...existingFilters];
          updatedFilters[existingIndex] = filter;
        } else {
          // Add new filter
          updatedFilters = [...existingFilters, filter];
        }

        updateTableFiltering({ propertyFilters: updatedFilters });
      }
    },
    [updateTableFiltering, filterOptions.propertyFilters],
  );

  // Handler for property sort changes (always adds to existing sorts)
  const handlePropertySort = React.useCallback(
    (key: string, direction: 'asc' | 'desc') => {
      const currentSortConfigs = parseSortString(filterOptions.sort);

      // Always add or update this field in the sort chain (multi-sort behavior)
      const existingIndex = currentSortConfigs.findIndex(
        (config) => config.field === key && config.isProperty,
      );

      let newSortConfigs: ISortConfig[];
      if (existingIndex >= 0) {
        // Update existing sort direction
        newSortConfigs = [...currentSortConfigs];
        newSortConfigs[existingIndex] = {
          field: key,
          direction,
          isProperty: true,
        };
      } else {
        // Add new sort to the chain
        newSortConfigs = [
          ...currentSortConfigs,
          { field: key, direction, isProperty: true },
        ];
      }

      const sortString = buildSortString(newSortConfigs);
      updateTableFiltering({ sort: sortString, sortConfigs: newSortConfigs });
      setSorting([{ id: key, desc: direction === 'desc' }]);
    },
    [updateTableFiltering, filterOptions.sort],
  );

  // Handler for static column sort changes (always adds to existing sorts)
  const handleStaticColumnSort = React.useCallback(
    (columnId: string, direction: 'asc' | 'desc') => {
      if (isSortableConceptProperty(columnId)) {
        const currentSortConfigs = parseSortString(filterOptions.sort);

        // Always add or update this field in the sort chain (multi-sort behavior)
        const existingIndex = currentSortConfigs.findIndex(
          (config) => config.field === columnId && !config.isProperty,
        );

        let newSortConfigs: ISortConfig[];
        if (existingIndex >= 0) {
          // Update existing sort direction
          newSortConfigs = [...currentSortConfigs];
          newSortConfigs[existingIndex] = {
            field: columnId,
            direction,
            isProperty: false,
          };
        } else {
          // Add new sort to the chain
          newSortConfigs = [
            ...currentSortConfigs,
            { field: columnId, direction, isProperty: false },
          ];
        }

        const sortString = buildSortString(newSortConfigs);
        updateTableFiltering({ sort: sortString, sortConfigs: newSortConfigs });
        setSorting([{ id: columnId, desc: direction === 'desc' }]);
      }
    },
    [updateTableFiltering, filterOptions.sort],
  );

  // Handler to remove a specific sort from the chain
  const handleRemoveSort = React.useCallback(
    (field: string, isProperty: boolean) => {
      const currentSortConfigs = parseSortString(filterOptions.sort);
      const newSortConfigs = currentSortConfigs.filter(
        (config) =>
          !(config.field === field && config.isProperty === isProperty),
      );

      if (newSortConfigs.length === 0) {
        updateTableFiltering({ sort: undefined, sortConfigs: [] });
        setSorting([]);
      } else {
        const sortString = buildSortString(newSortConfigs);
        updateTableFiltering({ sort: sortString, sortConfigs: newSortConfigs });
      }
    },
    [updateTableFiltering, filterOptions.sort],
  );

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater;

      if (newSorting.length === 0) {
        updateTableFiltering({ sort: undefined });
      } else {
        const value = newSorting[0];
        if (value) {
          // Check if it's a property column (property keys from definitions)
          const isPropertyColumn = propertyDefinitions?.some(
            (def) => def.key === value.id,
          );

          if (isPropertyColumn) {
            // Use property:key syntax for backend
            const sortValue = value.desc
              ? `-property:${value.id}`
              : `property:${value.id}`;
            updateTableFiltering({ sort: sortValue });
          } else if (isSortableConceptProperty(value.id)) {
            // Regular concept property
            const sortValue = value.desc ? `-${value.id}` : value.id;
            updateTableFiltering({ sort: sortValue });
          }
        }
      }

      setSorting(newSorting);
    },
    [sorting, updateTableFiltering, propertyDefinitions],
  );

  const handleRowClick = React.useCallback(
    (rowId: string) => {
      // Get the row data from the table data using rowId
      const concept = data?.results.find((row) => row.uuid === rowId);

      if (concept) {
        // Navigate to the concept page
        navigate(AppPath.ConceptOverview.replace(':id', concept.uuid));
      }
    },
    [navigate, data?.results],
  );

  const handleDebugTitleClick = React.useCallback(
    (concept: IConcept) => {
      // In debug mode, allow navigation to any concept using the complete state logic
      doFullConceptInvalidation(queryClient, concept.identifier);
      navigate(AppPath.ConceptOverview.replace(':id', concept.identifier));
    },
    [navigate, queryClient],
  );

  // Handler for column reordering via drag and drop (ALL columns except actions/settings)
  const handleColumnReorder = React.useCallback(
    (draggedId: string, targetId: string) => {
      // Get current column order from state
      const currentOrder = localColumnOrder;

      // If we don't have a saved order yet, can't reorder
      if (!currentOrder || currentOrder.length === 0) {
        return;
      }

      // Prevent reordering action columns (they should always be last)
      const actionColumnIds = new Set(['actions', 'settings']);
      if (actionColumnIds.has(draggedId) || actionColumnIds.has(targetId)) {
        return;
      }

      // Prevent reordering pinned columns (select, title and priority are fixed at the start)
      const pinnedColumnIds = new Set(['select', 'title', 'priority']);
      if (pinnedColumnIds.has(draggedId) || pinnedColumnIds.has(targetId)) {
        return;
      }

      // Find indices
      const draggedIndex = currentOrder.indexOf(draggedId);
      const targetIndex = currentOrder.indexOf(targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      // Reorder the array
      const newOrder = [...currentOrder];
      const [removed] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, removed);

      // Update local state immediately for instant UI feedback
      setLocalColumnOrder(newOrder);

      // Persist to localStorage (scoped by account)
      saveColumnOrder('concept_bank', newOrder, accountUuid);
    },
    [localColumnOrder, accountUuid],
  );

  const columns = useMemo<ColumnDef<IConcept, any>[]>(() => {
    // Helper function to get current sort state for a column
    const getStaticColumnSort = (columnId: string): 'asc' | 'desc' | null => {
      if (!filterOptions.sort) return null;

      // Parse multi-sort string to find this column's sort
      const sortFields = filterOptions.sort.split(',');
      for (const sortField of sortFields) {
        const trimmed = sortField.trim();
        if (trimmed === columnId) return 'asc';
        if (trimmed === `-${columnId}`) return 'desc';
      }

      return null;
    };

    // Checkbox selection column
    const selectColumn: ColumnDef<IConcept, any> = {
      id: 'select',
      size: 40,
      minSize: 40,
      maxSize: 40,
      enableResizing: false,
      enableSorting: false,
      header: ({ table: tbl }) => {
        const isAllPageSelected = tbl.getIsAllPageRowsSelected();
        const isSomeSelected = tbl.getIsSomePageRowsSelected();
        const isChecked = isAllAcrossPagesSelected || isAllPageSelected;
        const isIndeterminate =
          !isAllAcrossPagesSelected && isSomeSelected && !isAllPageSelected;
        return (
          <div className='flex items-center justify-center'>
            <input
              type='checkbox'
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate;
              }}
              checked={isChecked}
              onChange={() => {
                if (isAllAcrossPagesSelected || isAllPageSelected) {
                  setRowSelection({});
                  setIsAllAcrossPagesSelected(false);
                } else {
                  tbl.toggleAllPageRowsSelected(true);
                  setIsAllAcrossPagesSelected(true);
                }
              }}
              className='ml-1 h-4 w-4 cursor-pointer rounded-md border border-gray-300 accent-primary-500'
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <div
          className='flex items-center justify-center'
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type='checkbox'
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className='ml-1 h-4 w-4 cursor-pointer rounded-md border border-gray-300 accent-primary-500'
          />
        </div>
      ),
    };

    // Static columns
    const staticColumns: ColumnDef<IConcept, any>[] = [
      columnHelper.accessor('title', {
        id: 'title',
        sortingFn: 'text',
        enableColumnFilter: false,
        enableSorting: false, // Disable click-to-sort
        size: 500,
        minSize: 180,
        maxSize: 800,
        enableResizing: true,
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Concept'
            columnId='title'
            onSort={(direction) => handleStaticColumnSort('title', direction)}
            currentSort={getStaticColumnSort('title')}
            onReorder={handleColumnReorder}
            leadingIcon='lightbulb'
          />
        ),
        cell: (info) => {
          const concept = info.row.original;
          const { hasSeenConceptChange, updatedAt } = concept;

          return (
            <div className='flex max-w-[700px] flex-col py-2'>
              <div className='flex items-start gap-2'>
                {/* Recent activity indicator dot - always reserves space */}
                <div
                  className='flex items-center justify-center pt-1'
                  style={{ width: '10px', minWidth: '10px' }}
                >
                  {!hasSeenConceptChange && (
                    <ComponentTooltip
                      tip={<UnseenChangesTooltip updatedAt={updatedAt} />}
                      hideDelay={0}
                    >
                      <div className='aucctus-bg-primary-solid mt-[3px] h-2.5 w-2.5 cursor-pointer rounded-full' />
                    </ComponentTooltip>
                  )}
                </div>

                <div
                  className={cn('flex-1', {
                    'cursor-pointer': isDebugModeEnabled,
                  })}
                  onClick={
                    isDebugModeEnabled
                      ? (e) => {
                          e.stopPropagation();
                          handleDebugTitleClick(concept);
                        }
                      : undefined
                  }
                  title={
                    isDebugModeEnabled
                      ? '🐛 Debug Mode: Click to navigate to concept'
                      : undefined
                  }
                >
                  <Text.Collapsible
                    title={info.getValue()}
                    maxDescriptionHeight={35}
                    description={concept.summary}
                  />
                </div>
              </div>

              {/* Debug Mode UUID Display */}
              {isDebugModeEnabled && (
                <div className='mt-1'>
                  <span className='aucctus-text-quaternary font-mono text-xs'>
                    {concept.uuid}
                  </span>
                </div>
              )}
            </div>
          );
        },
      }),
      // Created By column (user only)
      columnHelper.accessor((row) => row.createdBy, {
        id: 'createdBy',
        enableColumnFilter: false,
        enableSorting: false,
        size: 150,
        minSize: 140,
        maxSize: 300,
        enableResizing: true,
        cell: (info) => {
          const createdBy = info.row.original.createdBy;
          const initials = createdBy
            ? `${createdBy.firstName?.charAt(0) || ''}${createdBy.lastName?.charAt(0) || ''}`
            : '';
          const fullName = createdBy
            ? `${createdBy.firstName || ''} ${createdBy.lastName || ''}`
            : '';

          return (
            <span className='flex w-full flex-row items-center justify-start gap-2'>
              {createdBy && (
                <>
                  <div className='flex items-center'>
                    <div className='aucctus-bg-secondary aucctus-text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium'>
                      {initials}
                    </div>
                  </div>
                  <span className='aucctus-text-primary aucctus-text-sm ml-2 max-w-[160px] truncate'>
                    {fullName}
                  </span>
                </>
              )}
            </span>
          );
        },
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Created By'
            columnId='createdBy'
            leadingIcon='user-square'
            onSort={(direction) =>
              handleStaticColumnSort('created_by__first_name', direction)
            }
            currentSort={getStaticColumnSort('created_by__first_name')}
            onReorder={handleColumnReorder}
            hasFilter={
              !!(filterOptions.createdBy && filterOptions.createdBy.size > 0)
            }
            filterSubmenu={
              <Table.ConceptBank.CreatedByFilterSubmenu
                filterOptions={filterOptions}
                updateFilterOptions={updateTableFiltering}
              />
            }
          />
        ),
      }),
      // Created Date column (date only)
      columnHelper.accessor((row) => utils.time.dateFormatter(row.createdAt), {
        id: 'createdAt',
        enableColumnFilter: false,
        enableSorting: false, // Disable click-to-sort
        sortingFn: 'datetime',
        size: 140,
        minSize: 140,
        maxSize: 200,
        enableResizing: true,
        cell: (info) => {
          return (
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              {utils.time.formatDate(info.row.original.createdAt, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          );
        },
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Created Date'
            columnId='createdAt'
            onSort={(direction) =>
              handleStaticColumnSort('created_at', direction)
            }
            currentSort={getStaticColumnSort('created_at')}
            onReorder={handleColumnReorder}
            leadingIcon='calendar'
          />
        ),
      }),
      // Last Modified By column (user only)
      columnHelper.accessor((row) => row.lastModifiedBy, {
        id: 'lastModifiedBy',
        enableColumnFilter: false,
        enableSorting: false,
        size: 180,
        minSize: 180,
        maxSize: 300,
        enableResizing: true,
        cell: (info) => {
          const lastModifiedBy = info.row.original.lastModifiedBy;
          const initials = lastModifiedBy
            ? `${lastModifiedBy.firstName?.charAt(0) || ''}${lastModifiedBy.lastName?.charAt(0) || ''}`
            : '';
          const fullName = lastModifiedBy
            ? `${lastModifiedBy.firstName || ''} ${lastModifiedBy.lastName || ''}`
            : '';

          return (
            <span className='flex w-full flex-row items-center justify-start gap-2'>
              {lastModifiedBy && (
                <>
                  <div className='flex items-center'>
                    <div className='aucctus-bg-secondary aucctus-text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium'>
                      {initials}
                    </div>
                  </div>
                  <span className='aucctus-text-primary aucctus-text-sm ml-2 max-w-[160px] truncate'>
                    {fullName}
                  </span>
                </>
              )}
            </span>
          );
        },
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Last Modified By'
            columnId='lastModifiedBy'
            leadingIcon='users-edit'
            onSort={(direction) =>
              handleStaticColumnSort('updated_by__first_name', direction)
            }
            currentSort={getStaticColumnSort('updated_by__first_name')}
            onReorder={handleColumnReorder}
            hasFilter={
              !!(
                filterOptions.lastModifiedBy &&
                filterOptions.lastModifiedBy.size > 0
              )
            }
            filterSubmenu={
              <Table.ConceptBank.LastModifiedByFilterSubmenu
                filterOptions={filterOptions}
                updateFilterOptions={updateTableFiltering}
              />
            }
          />
        ),
      }),
      // Last Modified Date column (date only)
      columnHelper.accessor((row) => utils.time.dateFormatter(row.updatedAt), {
        id: 'updatedAt',
        enableColumnFilter: false,
        enableSorting: false, // Disable click-to-sort
        sortingFn: 'datetime',
        size: 180,
        minSize: 180,
        maxSize: 200,
        enableResizing: true,
        cell: (info) => {
          return (
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              {utils.time.formatDate(info.row.original.updatedAt, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          );
        },
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Last Modified Date'
            columnId='updatedAt'
            onSort={(direction) =>
              handleStaticColumnSort('updated_at', direction)
            }
            currentSort={getStaticColumnSort('updated_at')}
            onReorder={handleColumnReorder}
            leadingIcon='clock'
          />
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        sortingFn: 'text',
        enableSorting: false, // Disable click-to-sort
        size: 120,
        minSize: 120,
        maxSize: 150,
        enableResizing: true,
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Status'
            columnId='status'
            leadingIcon='activity'
            onSort={(direction) => handleStaticColumnSort('status', direction)}
            currentSort={getStaticColumnSort('status')}
            onReorder={handleColumnReorder}
            hasFilter={
              !!(filterOptions.status && filterOptions.status.size > 0)
            }
            filterSubmenu={
              <Table.ConceptBank.StatusFilterSubmenu
                filterOptions={filterOptions}
                updateFilterOptions={updateTableFiltering}
              />
            }
          />
        ),
        cell: (info) => (
          <Table.ConceptBank.EditableStatusCell
            value={info.getValue()}
            conceptIdentifier={info.row.original.identifier}
          />
        ),
        enableColumnFilter: false,
      }),
      // Living Persona column
      columnHelper.accessor((row) => row.livingPersonas, {
        id: 'livingPersona',
        enableColumnFilter: false,
        enableSorting: false,
        size: 160,
        minSize: 130,
        maxSize: 250,
        enableResizing: true,
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Persona'
            columnId='livingPersona'
            leadingIcon='user'
            onSort={undefined}
            onReorder={handleColumnReorder}
          />
        ),
        cell: (info) => {
          const personas = info.row.original.livingPersonas;
          if (!personas || personas.length === 0) return null;

          const tooltipText = personas
            .map((p) => `${p.name} (${p.segment})`)
            .join(', ');

          return (
            <span
              className='flex w-full flex-row items-center justify-start gap-2'
              title={tooltipText}
            >
              <div className='flex -space-x-2'>
                {personas.map((persona) => {
                  const initials = persona.segment
                    .split(' ')
                    .map((w: string) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  return persona.avatarUrl ? (
                    <img
                      key={persona.uuid}
                      src={persona.avatarUrl}
                      alt={persona.name}
                      className='h-7 w-7 shrink-0 rounded-full border-2 border-white object-cover dark:border-gray-800'
                    />
                  ) : (
                    <div
                      key={persona.uuid}
                      className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-800'
                      style={{
                        backgroundColor: persona.themeColor
                          ? `hsl(${persona.themeColor})`
                          : '#6366F1',
                      }}
                    >
                      {initials}
                    </div>
                  );
                })}
              </div>
              <span className='aucctus-text-primary aucctus-text-sm max-w-[120px] truncate'>
                {personas.length === 1
                  ? personas[0].name
                  : `${personas.length} personas`}
              </span>
            </span>
          );
        },
      }),
      columnHelper.accessor('uuid', {
        id: 'priority',
        enableSorting: true,
        size: 150,
        minSize: 130,
        maxSize: 180,
        enableResizing: true,
        header: () => (
          <Table.ConceptBank.StaticColumnMenu
            columnName='Score'
            columnId='priority'
            leadingIcon='trendup'
            onSort={(direction) =>
              handleStaticColumnSort(
                'priority__overall_priority_score',
                direction,
              )
            }
            currentSort={getStaticColumnSort(
              'priority__overall_priority_score',
            )}
            onReorder={handleColumnReorder}
            badge={<Badge.Beta size='xs' />}
          />
        ),
        cell: (info) => {
          const conceptUuid = info.getValue();
          const prioritySummary = priorityMapRef.current.get(conceptUuid);
          const conceptTitle = info.row.original.title;
          const conceptDescription = info.row.original.summary;
          const isConceptComplete =
            info.row.original.reportStatusAggregate === 'complete';
          return (
            <PriorityCell
              conceptUuid={conceptUuid}
              conceptTitle={conceptTitle}
              conceptDescription={conceptDescription}
              prioritySummary={prioritySummary}
              isConceptComplete={isConceptComplete}
            />
          );
        },
        enableColumnFilter: false,
      }),
    ];

    // Build dynamic property columns
    const propertyColumns = buildPropertyColumns(
      propertyDefinitions || [],
      visiblePropertyColumns,
      columnHelper,
      handlePropertyFilterChange,
      handlePropertySort,
      filterOptions.sort,
      filterOptions.propertyFilters,
      handleColumnReorder,
      wrappedColumns,
    );

    // Action columns (at the end)
    const actionColumns: ColumnDef<IConcept, any>[] = [
      columnHelper.accessor('uuid', {
        id: 'actions',
        enableColumnFilter: false,
        enableSorting: false,
        size: 200,
        minSize: 200,
        maxSize: 220,
        enableResizing: true,
        cell: ({ row }) => (
          <span className='m-auto flex h-full w-full min-w-[180px] max-w-[260px] items-center justify-center self-stretch'>
            <Button.ConceptGenerate
              variant={row.original.reportStatusAggregate}
              onClick={handleGenerateConceptButton(row)}
              reportStatusBySection={row.original.reportStatusBySection}
              dateReportStarted={row.original.dateReportStarted}
              dateReportCompleted={row.original.dateReportCompleted}
              conceptUuid={row.original.uuid}
            />
          </span>
        ),
        header: () => {},
      }),
      columnHelper.accessor('uuid', {
        id: 'settings',
        enableColumnFilter: false,
        enableSorting: false,
        size: 100,
        maxSize: 100,
        enableResizing: false,
        header: () => {},
        cell: (info) => (
          <div className='pr-4'>
            <Table.ConceptBank.ConceptActionMenuButton
              status={info.row.original.status}
              reportStatus={info.row.original.reportStatusAggregate}
              identifier={info.row.original.identifier}
              conceptUuid={info.row.original.uuid}
              seedUuid={info.row.original.seedUuid}
              seedType={info.row.original.seedType}
            />
          </div>
        ),
      }),
    ];

    // Filter static columns based on visibility
    const visibleStaticColumnsFiltered = staticColumns.filter((col) =>
      visibleStaticColumns.has(col.id || ''),
    );

    // Merge all columns: select + static + property + actions
    const allColumns = [
      selectColumn,
      ...visibleStaticColumnsFiltered,
      ...propertyColumns,
      ...actionColumns,
    ];

    // Apply saved column order from localStorage
    if (localColumnOrder && localColumnOrder.length > 0) {
      // Separate action columns (always last) and pinned columns (fixed position)
      const actionColumnIds = new Set(['actions', 'settings']);
      const pinnedColumnIds = new Set(['select', 'title', 'priority']); // These stay in fixed order at the start

      const reorderableColumns = allColumns.filter(
        (col) =>
          !actionColumnIds.has(col.id || '') &&
          !pinnedColumnIds.has(col.id || ''),
      );
      const actionColumnsToKeep = allColumns.filter((col) =>
        actionColumnIds.has(col.id || ''),
      );
      const pinnedColumns = allColumns.filter((col) =>
        pinnedColumnIds.has(col.id || ''),
      );

      // Sort pinned columns to ensure select is first, title second, priority third
      const pinnedOrder = ['select', 'title', 'priority'];
      const sortedPinnedColumns = pinnedColumns.sort((a, b) => {
        const aIdx = pinnedOrder.indexOf(a.id || '');
        const bIdx = pinnedOrder.indexOf(b.id || '');
        return aIdx - bIdx;
      });

      // Sort reorderable columns based on saved order
      const orderedReorderableColumns = [...reorderableColumns].sort((a, b) => {
        const aIndex = localColumnOrder.indexOf(a.id || '');
        const bIndex = localColumnOrder.indexOf(b.id || '');

        // Handle columns not in saved order (new columns) - put them at the end
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
      });

      // Pinned columns first, then reorderable, then action columns
      return [
        ...sortedPinnedColumns,
        ...orderedReorderableColumns,
        ...actionColumnsToKeep,
      ];
    }

    return allColumns;
  }, [
    handleGenerateConceptButton,
    isDebugModeEnabled,
    handleDebugTitleClick,
    propertyDefinitions,
    visiblePropertyColumns,
    visibleStaticColumns,
    handlePropertyFilterChange,
    handlePropertySort,
    handleStaticColumnSort,
    handleColumnReorder,
    filterOptions,
    updateTableFiltering,
    localColumnOrder,
    wrappedColumns,
    isAllAcrossPagesSelected,
  ]);

  // Initialize or update column order when columns change
  React.useEffect(() => {
    if (!columns.length || !accountUuid) return;

    const columnIds = columns.map((col) => col.id || '').filter(Boolean);
    const staticIds = new Set([
      'title',
      'priority',
      'createdBy',
      'createdAt',
      'lastModifiedBy',
      'updatedAt',
      'status',
      'livingPersona',
      'actions',
      'settings',
    ]);
    const actionIds = new Set(['actions', 'settings']);

    // If no saved order, initialize with default
    if (!hasInitializedColumnOrder.current && !localColumnOrder) {
      const propertyIds = columnIds.filter(
        (id) => !staticIds.has(id) && !actionIds.has(id),
      );

      const orderedIds = [
        'title',
        'priority',
        'createdBy',
        'createdAt',
        'lastModifiedBy',
        'updatedAt',
        'status',
        'livingPersona',
        ...propertyIds,
        'actions',
        'settings',
      ].filter((id) => columnIds.includes(id));

      setLocalColumnOrder(orderedIds);
      saveColumnOrder('concept_bank', orderedIds, accountUuid);
      hasInitializedColumnOrder.current = true;
      return;
    }

    // If we have a saved order, check for missing columns (new properties)
    if (localColumnOrder && localColumnOrder.length > 0) {
      const currentOrderSet = new Set(localColumnOrder);
      const missingColumns = columnIds.filter(
        (id) => !currentOrderSet.has(id) && !actionIds.has(id),
      );

      // If there are new columns, add them before the action columns
      if (missingColumns.length > 0) {
        const actionsIndex = localColumnOrder.indexOf('actions');
        const newOrder = [...localColumnOrder];

        // Insert missing columns before actions, or at the end if actions not found
        if (actionsIndex !== -1) {
          newOrder.splice(actionsIndex, 0, ...missingColumns);
        } else {
          // Remove action columns if they exist
          const withoutActions = newOrder.filter((id) => !actionIds.has(id));
          // Add missing columns, then action columns
          newOrder.length = 0;
          newOrder.push(...withoutActions, ...missingColumns);
          if (columnIds.includes('actions')) newOrder.push('actions');
          if (columnIds.includes('settings')) newOrder.push('settings');
        }

        setLocalColumnOrder(newOrder);
        saveColumnOrder('concept_bank', newOrder, accountUuid);
      }

      // Also remove columns that no longer exist (but keep hidden columns)
      // A column "no longer exists" if it's not in propertyDefinitions AND not a static/action column
      const staticAndActionIds = new Set([
        'title',
        'createdBy',
        'createdDate',
        'lastModifiedBy',
        'lastModifiedDate',
        'status',
        'livingPersona',
        'actions',
        'settings',
      ]);
      const allPropertyKeys = new Set(
        (propertyDefinitions || []).map((def) => def.key),
      );

      const validColumns = localColumnOrder.filter(
        (id) =>
          staticAndActionIds.has(id) || // Keep static/action columns
          allPropertyKeys.has(id) || // Keep property columns (even if hidden)
          columnIds.includes(id), // Keep any other columns that exist
      );

      if (validColumns.length !== localColumnOrder.length) {
        setLocalColumnOrder(validColumns);
        saveColumnOrder('concept_bank', validColumns, accountUuid);
      }
    }
  }, [columns, localColumnOrder, accountUuid, propertyDefinitions]);

  // Create table configuration outside of useMemo
  const tableOptions = {
    getRowId: (row: IConcept) => row.uuid,
    data: data?.results || [],
    columns,
    manualSorting: true,
    pageCount: data?.numberOfPages || 0,
    enableRowSelection: true,
    state: {
      pagination: {
        pageSize: PAGE_SIZE,
        pageIndex: page - 1,
      },
      sorting,
      rowSelection,
    },
    onRowSelectionChange: handleRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    enableColumnResizing: true,
    columnResizeMode: 'onChange' as ColumnResizeMode,
    meta: {
      onRowClick: handleRowClick,
    },
  };

  // Use useReactTable directly at the top level, not inside a callback
  const table = useReactTable(tableOptions);

  // Compute selected concept UUIDs from row selection state
  const selectedConceptUuids = React.useMemo(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]),
    [rowSelection],
  );

  // Return memoized values to prevent unnecessary re-renders
  return useMemo(
    () => ({
      isLoading,
      numberOfPages: data?.numberOfPages || 0,
      page,
      setPage,
      table,
      updateTableFiltering,
      resetFilter,
      filterOptions,
      handleRowClick,
      handleRemoveSort,
      isDebugModeEnabled,
      rowSelection,
      setRowSelection,
      selectedConceptUuids,
      isAllAcrossPagesSelected,
      totalCount: data?.count || 0,
      clearSelection,
    }),
    [
      isLoading,
      data?.numberOfPages,
      data?.count,
      page,
      setPage,
      table,
      updateTableFiltering,
      resetFilter,
      filterOptions,
      handleRowClick,
      handleRemoveSort,
      isDebugModeEnabled,
      rowSelection,
      setRowSelection,
      selectedConceptUuids,
      clearSelection,
      isAllAcrossPagesSelected,
    ],
  );
};
