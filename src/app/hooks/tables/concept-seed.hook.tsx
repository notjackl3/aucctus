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

import {
  ColumnDef,
  ColumnResizeMode,
  createColumnHelper,
  getCoreRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';

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
  const { resetQuestionnaire, setIsNewSeed } = useConceptIncubationStore();

  // Use useRef for values that don't need to trigger re-renders when updated internally
  const filterOptionsRef = React.useRef<ISeedFilterOptions>({
    ...INITIAL_FILTER,
    status: new Set<SeedStatus>(['draft']), // Default to only show 'draft' seeds
  });

  // Initialize with defensive check for status Set
  const initialOptions = React.useMemo(() => {
    const options = externalFilterOptions || filterOptionsRef.current;

    // Ensure status is always a Set
    if (!options.status || !(options.status instanceof Set)) {
      return {
        ...options,
        status: new Set<SeedStatus>(
          options.status ? Array.from(options.status as any) : [],
        ),
      };
    }

    return options;
  }, [externalFilterOptions]);

  const [filterOptions, setFilterOptions] =
    React.useState<ISeedFilterOptions>(initialOptions);

  const [page, setPage] = React.useState<number>(1);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

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
        size: 600,
        minSize: 600,
        maxSize: 600,
        enableResizing: false,
        cell: (info) => {
          const answeredCount = getAnsweredQuestionsCount(info.row.original);

          const title =
            info.row.original.title ||
            info.row.original?.anchorThought?.thought ||
            `${answeredCount} question${answeredCount !== 1 ? 's' : ''} answered`;
          const description =
            info.row.original.description ||
            info.row.original?.type === 'IDEA_PLAYGROUND'
              ? 'Idea playground'
              : info.getValue();

          return (
            <div className='flex max-w-[700px] items-center p-3'>
              <div className='aucctus-border-primary aucctus-bg-primary mr-3 flex items-center justify-center rounded-lg p-3 shadow-sm'>
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
                  maxDescriptionHeight={35}
                  description={description}
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
        size: 130,
        minSize: 130,
        maxSize: 130,
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
            <span className='flex flex-row items-center justify-start gap-2'>
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
      columnHelper.accessor((row) => determineConceptStage(row), {
        id: 'stage',
        enableColumnFilter: false,
        enableSorting: false,
        size: 90,
        minSize: 90,
        maxSize: 90,
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
        size: 90,
        minSize: 90,
        maxSize: 90,
        enableResizing: false,
        header: () => {},
        cell: (info) => {
          const showButton = info.row.original.status === 'draft';
          const seedType = info.row.original.type;
          const seedUuid = info.getValue();

          return (
            <span className='m-auto flex h-full w-full items-center justify-end self-stretch'>
              {showButton && (
                <Button.ConceptGenerate
                  variant='draft'
                  onClick={() => {
                    // Navigate to Idea Playground for IDEA_PLAYGROUND type seeds
                    if (seedType === 'IDEA_PLAYGROUND') {
                      navigate(`${AppPath.IdeaPlayground}?seed=${seedUuid}`);
                    } else {
                      // Default behavior for concept incubation seeds
                      resetQuestionnaire();
                      setIsNewSeed(false);
                      navigate(`${AppPath.IncubateConcept}?seed=${seedUuid}`);
                    }
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
        size: 60,
        maxSize: 60,
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
    resetQuestionnaire,
    setIsNewSeed,
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
