import { Button, Table, Text } from '@components';
import { useConcepts } from '@hooks/query/concepts.hook';
import {
  ConceptSort,
  ConceptStatus,
  IConcept,
  SortableConceptProperties,
} from '@libs/api/types';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { ConceptActionMenuButton } from '@components/Tables/ConceptBank/ActionsMenuButton';
import {
  useConceptUpdate,
  useRetryConceptReport,
} from '@hooks/query/concepts.hook';
import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';
import { IConceptFilterOptions } from './concept-seed.hook';

const columnHelper = createColumnHelper<IConcept>();

const INITIAL_FILTER: IConceptFilterOptions = {
  status: new Set<ConceptStatus>(),
};

const PAGE_SIZE = 20;

function isSortableConceptProperty(
  value: string,
): value is SortableConceptProperties {
  const arr: SortableConceptProperties[] = [
    'createdAt',
    'updatedAt',
    'status',
    'title',
  ];
  return (arr as string[]).includes(value);
}

export const useConceptBank = (
  externalFilterOptions?: IConceptFilterOptions,
  externalUpdateTableFiltering?: (
    value: Partial<IConceptFilterOptions>,
  ) => void,
) => {
  const navigate = useNavigate();
  const { mutate: updateConcept } = useConceptUpdate();
  const { mutate: retryConceptReport } = useRetryConceptReport();

  // Use refs for values that don't need to trigger re-renders when updated internally
  const filterOptionsRef = React.useRef<IConceptFilterOptions>(INITIAL_FILTER);
  const [filterOptions, setFilterOptions] =
    React.useState<IConceptFilterOptions>(
      externalFilterOptions || filterOptionsRef.current,
    );

  const [page, setPage] = React.useState<number>(1);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  // If we receive external filter options, use those instead
  React.useEffect(() => {
    if (externalFilterOptions) {
      setFilterOptions(externalFilterOptions);
    }
  }, [externalFilterOptions]);

  // Memoize the query options to prevent unnecessary API calls
  const queryOptions = useMemo(
    () => ({
      status: Array.from(filterOptions.status).join(',') || undefined,
      createdBy: filterOptions.createdBy
        ? `${filterOptions.createdBy.firstName} ${filterOptions.createdBy.lastName}`
        : undefined,
      search: filterOptions.search,
      page,
      sort: filterOptions.sort,
    }),
    [
      filterOptions.status,
      filterOptions.createdBy,
      filterOptions.search,
      filterOptions.sort,
      page,
    ],
  );

  // Fetch concepts with memoized query options
  const { data, isLoading } = useConcepts(queryOptions);

  // Optimize the updateTableFiltering function
  const updateTableFiltering = React.useCallback(
    (value: Partial<IConceptFilterOptions>) => {
      setPage(1); // avoid pagination issues

      // Use external update function if provided, otherwise update local state
      if (externalUpdateTableFiltering) {
        externalUpdateTableFiltering(value);
      } else {
        // Update the ref first to ensure consistency
        filterOptionsRef.current = { ...filterOptionsRef.current, ...value };
        setFilterOptions(filterOptionsRef.current);
      }
    },
    [externalUpdateTableFiltering],
  );

  // Reset the filter function
  const resetFilter = React.useCallback(() => {
    if (externalUpdateTableFiltering) {
      externalUpdateTableFiltering(INITIAL_FILTER);
    } else {
      filterOptionsRef.current = INITIAL_FILTER;
      setFilterOptions(INITIAL_FILTER);
    }
    setPage(1);
  }, [externalUpdateTableFiltering]);

  const handleGenerateConceptButton = React.useCallback(
    (row: Row<IConcept>) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const reportStatus = row.original.reportStatus;
        switch (reportStatus) {
          case 'notStarted':
            updateConcept({
              uuid: row.original.uuid,
              status: 'ideating',
            });
            break;
          case 'error':
            retryConceptReport(row.original.uuid);
            break;
          case 'complete':
            navigate(AppPath.ConceptOverview.replace(':id', row.original.uuid));
            break;
          default:
            e.stopPropagation();
        }
      },
    [navigate, retryConceptReport, updateConcept],
  );

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater;

      if (newSorting.length === 0) {
        updateTableFiltering({ sort: undefined });
      } else {
        const value = newSorting[0];
        if (value && isSortableConceptProperty(value.id)) {
          const sortValue = (
            value.desc ? `-${value.id}` : value.id
          ) as ConceptSort;
          updateTableFiltering({ sort: sortValue });
        }
      }

      setSorting(newSorting);
    },
    [sorting, updateTableFiltering],
  );

  const columns = useMemo<ColumnDef<IConcept, any>[]>(() => {
    return [
      columnHelper.accessor('title', {
        id: 'title',
        sortingFn: 'text',
        enableColumnFilter: false,
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Concept
          </div>
        ),
        size: 600,
        minSize: 400,
        cell: (info) => (
          <Text.Collapsible
            title={info.getValue()}
            description={info.row.original.description}
          />
        ),
      }),
      columnHelper.accessor((row) => utils.time.dateFormatter(row.createdAt), {
        id: 'createdAt',
        enableColumnFilter: false,
        sortingFn: 'datetime',
        size: 150,
        maxSize: 150,
        enableResizing: false,
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
                <div className='mr-2 flex items-center'>
                  <div className='aucctus-text-primary flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F3F3] text-xs font-medium'>
                    {initials}
                  </div>
                </div>
              )}
              <div className='flex flex-row items-center'>
                {createdBy && (
                  <span className='mr-1 text-sm font-medium'>{fullName}</span>
                )}
                <Table.ConceptBank.Text
                  className='aucctus-text-tertiary text-nowrap'
                  value={info.getValue()}
                />
              </div>
            </span>
          );
        },
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Created
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        sortingFn: 'text',
        size: 150,
        maxSize: 150,
        enableResizing: false,
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Status
          </div>
        ),
        cell: (info) => <Table.ConceptBank.Status value={info.getValue()} />,
        enableColumnFilter: false,
      }),

      columnHelper.accessor('reportStatus', {
        id: 'reportStatus',
        enableColumnFilter: false,
        enableSorting: false,
        size: 124,
        maxSize: 124,
        enableResizing: false,
        cell: ({ row }) => (
          <span className='m-auto flex h-full w-[124px] items-center justify-end self-stretch align-middle'>
            <Button.ConceptGenerate
              variant={row.original.reportStatus}
              onClick={handleGenerateConceptButton(row)}
            />
          </span>
        ),
        header: () => {},
      }),
      columnHelper.accessor('uuid', {
        id: 'uuid',
        enableColumnFilter: false,
        enableSorting: false,
        size: 42,
        maxSize: 42,
        header: () => {},
        cell: (info) => (
          <ConceptActionMenuButton
            status={info.row.original.status}
            uuid={info.getValue()}
          />
        ),
      }),
    ];
  }, [handleGenerateConceptButton]);

  // Create table configuration outside of useMemo
  const tableOptions = {
    getRowId: (row: IConcept) => row.uuid,
    data: data?.results || [],
    columns,
    manualSorting: true,
    pageCount: data?.numberOfPages || 0,
    state: {
      pagination: {
        pageSize: PAGE_SIZE,
        pageIndex: page - 1,
      },
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
  };

  // Use useReactTable directly at the top level, not inside a callback
  const table = useReactTable(tableOptions);

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
    }),
    [
      isLoading,
      data?.numberOfPages,
      page,
      setPage,
      table,
      updateTableFiltering,
      resetFilter,
      filterOptions,
    ],
  );
};

// Export areFilterOptionsSet as a function
export { areFilterOptionsSet } from './concept-seed.hook';

// Export the interface for use in other files using 'export type'
export type { IConceptFilterOptions } from './concept-seed.hook';

// Re-export the useSeedsBank hook to fix the import error in Bank.tsx
export { useSeedsBank } from './concept-seed.hook';
