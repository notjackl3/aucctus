import { Button, Table, Text } from '@components';
import {
  useConcepts,
  useConceptUpdate,
  useRetryConceptReport,
} from '@hooks/query/concepts.hook';
import {
  ConceptSort,
  ConceptStatus,
  IConcept,
  IUser,
  SortableConceptProperties,
} from '@libs/api/types';
import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import {
  ColumnDef,
  ColumnResizeMode,
  createColumnHelper,
  getCoreRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export interface IConceptFilterOptions {
  status: Set<ConceptStatus>;
  createdBy?: IUser;
  search?: string;
  sort?: ConceptSort;
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
      setFilterOptions({ ...filterOptions, ...externalFilterOptions });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFilterOptions]);

  // Memoize the query options to prevent unnecessary API calls
  const queryOptions = useMemo(
    () => ({
      status: Array.from(filterOptions.status).join(',') || undefined,
      createdBy: filterOptions.createdBy
        ? `${filterOptions.createdBy.firstName} ${filterOptions.createdBy.lastName}`
        : undefined,
      search: filterOptions.search,
      page: page,
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
        size: 600,
        minSize: 600,
        maxSize: 600,
        enableResizing: true,
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Concept
          </div>
        ),
        cell: (info) => (
          <div className='flex max-w-[700px] items-center p-2'>
            <Text.Collapsible
              title={info.getValue()}
              maxDescriptionHeight={35}
              description={info.row.original.description}
            />
          </div>
        ),
      }),
      columnHelper.accessor((row) => utils.time.dateFormatter(row.createdAt), {
        id: 'createdAt',
        enableColumnFilter: false,
        sortingFn: 'datetime',
        size: 130,
        minSize: 130,
        maxSize: 130,
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
                <div className='flex items-center'>
                  <div className='aucctus-bg-secondary aucctus-text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium'>
                    {initials}
                  </div>
                </div>
              )}
              <div className='ml-2 flex flex-col'>
                {createdBy && (
                  <span className='aucctus-text-primary max-w-[160px] truncate text-sm font-medium'>
                    {fullName}
                  </span>
                )}
                <span className='aucctus-text-tertiary text-xs'>
                  {info.getValue()}
                </span>
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
        size: 90,
        minSize: 90,
        maxSize: 90,
        enableResizing: true,
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Status
          </div>
        ),
        cell: (info) => <Table.ConceptBank.Status value={info.getValue()} />,
        enableColumnFilter: false,
      }),

      columnHelper.accessor('uuid', {
        id: 'actions',
        enableColumnFilter: false,
        enableSorting: false,
        size: 90,
        minSize: 90,
        maxSize: 90,
        enableResizing: true,
        cell: ({ row }) => (
          <span className='m-auto flex h-full w-full items-center justify-end self-stretch align-middle'>
            <Button.ConceptGenerate
              variant={row.original.reportStatus}
              onClick={handleGenerateConceptButton(row)}
            />
          </span>
        ),
        header: () => {},
      }),
      columnHelper.accessor('uuid', {
        id: 'settings',
        enableColumnFilter: false,
        enableSorting: false,
        size: 60,
        maxSize: 60,
        enableResizing: false,
        header: () => {},
        cell: (info) => (
          <Table.ConceptBank.ConceptActionMenuButton
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
    enableColumnResizing: true,
    columnResizeMode: 'onChange' as ColumnResizeMode,
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
