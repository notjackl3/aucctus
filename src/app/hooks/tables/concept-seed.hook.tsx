import { Badge, Button, Icon, Table, Text } from '@components';
import { ConceptStage } from '@components/Badges/StageBadge';
import { useSeeds } from '@hooks/query/concepts.hook';
import {
  IConceptSeed,
  IUser,
  SeedSort,
  SeedStatus,
  SortableSeedProperties,
} from '@libs/api/types';
import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Shared interfaces and constants
export interface ISeedFilterOptions {
  status: Set<SeedStatus>;
  createdBy?: IUser;
  search?: string;
  sort?: SeedSort;
}

const INITIAL_FILTER: ISeedFilterOptions = {
  status: new Set<SeedStatus>(),
};

const PAGE_SIZE = 20;

export const areFilterOptionsSet = (
  filterOptions: ISeedFilterOptions,
): boolean => {
  const { status, createdBy, search, sort } = filterOptions;

  return (
    (status && status.size > 0) || // Check if 'status' set is not empty
    !!createdBy || // Check if 'createdBy' is set
    !!search || // Check if 'search' is set
    !!sort
  );
};

function isSortableSeedProperty(
  value: string,
): value is SortableSeedProperties {
  const arr: SortableSeedProperties[] = [
    'createdAt',
    'updatedAt',
    'status',
    'type',
  ];
  return (arr as string[]).includes(value);
}

export const useSeedsBank = (
  externalFilterOptions?: ISeedFilterOptions,
  externalUpdateTableFiltering?: (value: Partial<ISeedFilterOptions>) => void,
) => {
  const navigate = useNavigate();
  const resetIncubationState = useStore(
    (state) => state.incubation.resetQuestionnaire,
  );

  // Use useRef for values that don't need to trigger re-renders when updated internally
  const filterOptionsRef = React.useRef<ISeedFilterOptions>({
    ...INITIAL_FILTER,
    status: new Set<SeedStatus>(['draft']), // Default to only show 'draft' seeds
  });

  const [filterOptions, setFilterOptions] = React.useState<ISeedFilterOptions>(
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

  // Fetch seeds with memoized query options
  const { data, isLoading } = useSeeds(queryOptions);

  // Optimize the updateTableFiltering function
  const updateTableFiltering = React.useCallback(
    (value: Partial<ISeedFilterOptions>) => {
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

  const resetFilter = React.useCallback(() => {
    const defaultFilter = {
      ...INITIAL_FILTER,
    };

    filterOptionsRef.current = defaultFilter;
    setFilterOptions(defaultFilter);
    setSorting([]);
  }, []);

  // Helper functions memoized to prevent recreation on each render
  const extractConceptDescription = useCallback(
    (seed: IConceptSeed): string => {
      if (!seed.answers || seed.answers.length === 0) {
        return 'New Draft Concept';
      }

      // First look for answers with specific identifiers
      const describeAnswer = seed.answers.find(
        (a) =>
          a.question.identifier === 'describe' ||
          a.question.identifier === 'problemStatement',
      );

      if (
        describeAnswer &&
        describeAnswer.answer &&
        describeAnswer.answer.length > 0
      ) {
        return describeAnswer.answer[0];
      }

      // If no description found by identifier, take first answer with content
      const firstAnswer = seed.answers.find(
        (a) => a.answer && a.answer.length > 0,
      );
      if (firstAnswer) {
        return firstAnswer.answer[0];
      }

      return 'Draft Concept';
    },
    [],
  );

  // Helper to get the number of answered questions
  const getAnsweredQuestionsCount = useCallback(
    (seed: IConceptSeed): number => {
      if (!seed.answers) return 0;
      return seed.answers.filter((a) => a.answer && a.answer.length > 0).length;
    },
    [],
  );

  // Helper to determine the current stage of a concept seed
  const determineConceptStage = useCallback(
    (seed: IConceptSeed): ConceptStage => {
      if (!seed.answers || seed.answers.length === 0) {
        return 'questions';
      }

      const answeredCount = getAnsweredQuestionsCount(seed);
      const totalQuestions = seed.answers.length;

      // If all questions are answered, show "generate"
      if (answeredCount === totalQuestions && totalQuestions > 0) {
        return 'generate';
      }

      // If some but not all questions are answered, show "questions"
      return 'questions';
    },
    [getAnsweredQuestionsCount],
  );

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater;

      if (newSorting.length === 0) {
        updateTableFiltering({ sort: undefined });
      } else {
        const value = newSorting[0];
        if (value && isSortableSeedProperty(value.id)) {
          const sortValue = (
            value.desc ? `-${value.id}` : value.id
          ) as SeedSort;
          updateTableFiltering({ sort: sortValue });
        }
      }

      setSorting(newSorting);
    },
    [sorting, updateTableFiltering],
  );

  const columnHelper = createColumnHelper<IConceptSeed>();

  const columns = useMemo<ColumnDef<IConceptSeed, any>[]>(() => {
    return [
      columnHelper.accessor((row) => extractConceptDescription(row), {
        id: 'type',
        sortingFn: 'text',
        enableColumnFilter: false,
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Concept
          </div>
        ),
        size: 400,
        minSize: 400,
        cell: (info) => {
          const answeredCount = getAnsweredQuestionsCount(info.row.original);

          const title =
            info.row.original.title ||
            `${answeredCount} question${answeredCount !== 1 ? 's' : ''} answered`;
          const description = info.row.original.description || info.getValue();

          return (
            <div className='flex items-center'>
              <div className='mr-3 flex items-center justify-center rounded-lg border border-gray-100 bg-white p-3 shadow-sm'>
                <Icon
                  variant={
                    info.row.original.type === 'EXPAND_AN_EXISTING_IDEA'
                      ? 'lightbulb'
                      : 'telescope'
                  }
                />
              </div>
              <div className='ml-2 flex flex-col items-center justify-center'>
                <Text.Collapsible
                  title={title}
                  description={description}
                  truncationClassName='line-clamp-1'
                />
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => utils.time.dateFormatter(row.createdAt), {
        id: 'createdAt',
        enableColumnFilter: false,
        sortingFn: 'datetime',
        size: 230, // Increased width for Created By column
        maxSize: 230, // Increased max width as well
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
              <div className='flex flex-col'>
                {createdBy && (
                  <span className='mr-1 max-w-[160px] truncate text-sm font-medium'>
                    {fullName}
                  </span>
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
      columnHelper.accessor((row) => determineConceptStage(row), {
        id: 'stage',
        enableColumnFilter: false,
        enableSorting: false,
        size: 120,
        maxSize: 120,
        enableResizing: false,
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Stage
          </div>
        ),
        cell: (info) => (
          <span className='flex w-full items-center justify-start'>
            <Badge.Stage stage={info.getValue()} />
          </span>
        ),
      }),
      columnHelper.accessor('uuid', {
        id: 'actions',
        enableColumnFilter: false,
        enableSorting: false,
        size: 150,
        maxSize: 150,
        enableResizing: false,
        header: () => {},
        cell: (info) => {
          const showButton = info.row.original.status === 'draft';

          return (
            <span className='m-auto flex h-full w-[124px] items-center justify-end self-stretch align-middle'>
              {showButton && (
                <Button.ConceptGenerate
                  variant='draft'
                  onClick={() => {
                    resetIncubationState();
                    navigate(
                      `${AppPath.IncubateConcept}?seed=${info.getValue()}`,
                    );
                  }}
                />
              )}
            </span>
          );
        },
      }),

      // Add settings menu button column
      columnHelper.accessor('uuid', {
        id: 'settings',
        enableColumnFilter: false,
        enableSorting: false,
        size: 42,
        maxSize: 42,
        enableResizing: false,
        header: () => {},
        cell: (info) => (
          <Table.SeedBank.SeedActionMenuButton
            uuid={info.getValue()}
            status={info.row.original.status}
          />
        ),
      }),
    ];
  }, [
    columnHelper,
    extractConceptDescription,
    getAnsweredQuestionsCount,
    determineConceptStage,
    resetIncubationState,
    navigate,
  ]);

  // Create table configuration outside of useMemo
  const tableOptions = {
    getRowId: (row: IConceptSeed) => row.uuid,
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
      columns,
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
      columns,
      updateTableFiltering,
      resetFilter,
      filterOptions,
    ],
  );
};
