import { Button, Table, Text } from '@components';
import { useSeeds } from '@hooks/query/concepts.hook';
import {
  ConceptSeedStatus,
  ConceptSort,
  ConceptStatus,
  IUser,
} from '@libs/api/types';
import { IConceptSeed } from '@libs/api/concepts';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useMemo, useCallback, useEffect } from 'react';
import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';
import { Icon, Badge } from '@components';
import { SeedActionMenuButton } from '@components/Tables/ConceptBank/ActionsMenuButton';
import { ConceptStage } from '@components/Badges/StageBadge';

// Shared interfaces and constants
export interface IConceptFilterOptions {
  status: Set<ConceptStatus>;
  createdBy?: IUser;
  search?: string;
  sort?: ConceptSort;
}

const INITIAL_FILTER: IConceptFilterOptions = {
  status: new Set<ConceptStatus>(),
};

const PAGE_SIZE = 20;

export const areFilterOptionsSet = (
  filterOptions: IConceptFilterOptions,
): boolean => {
  const { status, createdBy, search, sort } = filterOptions;

  return (
    (status && status.size > 0) || // Check if 'status' set is not empty
    !!createdBy || // Check if 'createdBy' is set
    !!search || // Check if 'search' is set
    !!sort
  );
};

export const useSeedsBank = (
  externalFilterOptions?: IConceptFilterOptions,
  externalUpdateTableFiltering?: (
    value: Partial<IConceptFilterOptions>,
  ) => void,
) => {
  const navigate = useNavigate();

  // Use useRef for values that don't need to trigger re-renders when updated internally
  const filterOptionsRef = React.useRef<IConceptFilterOptions>({
    ...INITIAL_FILTER,
    status: new Set(['draft'] as unknown as ConceptStatus[]), // Default to only show 'draft' seeds
  });

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

  // Fetch seeds with memoized query options
  const { data, isLoading } = useSeeds(queryOptions);

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

  const resetFilter = React.useCallback(() => {
    const defaultFilter = {
      ...INITIAL_FILTER,
      status: new Set(['draft'] as unknown as ConceptStatus[]), // Reset to default 'draft' filter
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
          a.identifier === 'describe' || a.identifier === 'problemStatement',
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
                  title={info.getValue()}
                  description={`${answeredCount} question${answeredCount !== 1 ? 's' : ''} answered`}
                  maxDescriptionHeight={35}
                  titleClassName='leading-tight'
                  descriptionClassName='leading-tight'
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
          // Check if current seed is archived
          const isArchived = info.row.original.status === 'archived';

          // By default, show continue button for non-archived seeds
          let showButton = !isArchived;

          // If we're filtering by multiple statuses, only show button for draft seeds that aren't archived
          if (filterOptions.status.size > 1 && !isArchived) {
            // Extract values from the row for type checking
            const statusValue = Array.from(filterOptions.status).includes(
              'draft' as ConceptStatus,
            );
            showButton = statusValue;
          }

          return (
            <span className='m-auto flex h-full w-[124px] items-center justify-end self-stretch align-middle'>
              {showButton && (
                <Button.ConceptGenerate
                  variant='draft'
                  onClick={() =>
                    navigate(`/concept/ignite/${String(info.getValue())}`)
                  }
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
          <SeedActionMenuButton
            uuid={info.getValue()}
            status={info.row.original.status as ConceptSeedStatus}
          />
        ),
      }),
    ];
  }, [
    navigate,
    filterOptions,
    extractConceptDescription,
    getAnsweredQuestionsCount,
    determineConceptStage,
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
    onSortingChange: (
      updater: SortingState | ((old: SortingState) => SortingState),
    ) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
    },
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
