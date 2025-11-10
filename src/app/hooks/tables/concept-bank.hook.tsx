import { Button, Table, Text } from '@components';
import { toast } from '@components/Notification/toast';
import { ComponentTooltip } from '@components';
import {
  doFullConceptInvalidation,
  useConceptReportGenerate,
  useConcepts,
  useRetryConceptReport,
} from '@hooks/query/concepts.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  ConceptReportStatus,
  ConceptSort,
  ConceptStatus,
  IConcept,
  IConceptPage,
  IUser,
  SortableConceptProperties,
} from '@libs/api/types';
import utils from '@libs/utils';
import { canOpenConceptWhilePending } from '@libs/utils/concepts';
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
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { UnseenChangesTooltip } from '@components/ToolTip/UnseenChangesTooltip';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { IConceptWorkflowMessage } from '@libs/api/types/socketMessages/inbound';
import telemetry from '@libs/telemetry';

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
  isDebugModeEnabled: boolean;
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

  const columns = useMemo<ColumnDef<IConcept, any>[]>(() => {
    return [
      columnHelper.accessor('uuid', {
        id: 'recentActivity',
        enableColumnFilter: false,
        enableSorting: false,
        size: 30,
        minSize: 30,
        maxSize: 30,
        enableResizing: false,
        header: () => null,
        cell: (info) => {
          const { hasSeenConceptChange, updatedAt } = info.row.original;

          // Only show indicator when user hasn't seen the changes (hasSeenConceptChange is false)
          if (hasSeenConceptChange) return null;

          return (
            <ComponentTooltip
              tip={<UnseenChangesTooltip updatedAt={updatedAt} />}
              hideDelay={0}
            >
              <div className='flex h-full w-full min-w-[30px] items-center justify-center'>
                <div className='aucctus-bg-primary-solid h-2.5 w-2.5 cursor-pointer rounded-full' />
              </div>
            </ComponentTooltip>
          );
        },
      }),
      columnHelper.accessor('title', {
        id: 'title',
        sortingFn: 'text',
        enableColumnFilter: false,
        size: 500,
        minSize: 500,
        maxSize: 500,
        enableResizing: true,
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Concept
          </div>
        ),
        cell: (info) => {
          const concept = info.row.original;

          return (
            <div className='flex max-w-[700px] flex-col py-2'>
              <div
                className={isDebugModeEnabled ? 'cursor-pointer' : ''}
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
      columnHelper.accessor((row) => utils.time.dateFormatter(row.createdAt), {
        id: 'createdAt',
        enableColumnFilter: false,
        sortingFn: 'datetime',
        size: 150,
        minSize: 150,
        maxSize: 150,
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
                  {utils.time.formatDate(info.row.original.createdAt, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
      columnHelper.accessor((row) => utils.time.dateFormatter(row.updatedAt), {
        id: 'updatedAt',
        enableColumnFilter: false,
        sortingFn: 'datetime',
        size: 150,
        minSize: 150,
        maxSize: 150,
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
                  <div className='ml-2 flex flex-col'>
                    <span className='aucctus-text-primary max-w-[160px] truncate text-sm font-medium'>
                      {fullName}
                    </span>
                    <span className='aucctus-text-tertiary text-xs'>
                      {utils.time.formatDate(info.row.original.updatedAt, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </>
              )}
            </span>
          );
        },
        header: () => (
          <div className='font-inter aucctus-text-tertiary text-xs font-semibold normal-case'>
            Last Modified
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
        size: 120,
        minSize: 120,
        maxSize: 120,
        enableResizing: true,
        cell: ({ row }) => (
          <span className='m-auto flex h-full w-full items-end justify-end self-stretch'>
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
        size: 60,
        maxSize: 60,
        enableResizing: false,
        header: () => {},
        cell: (info) => (
          <Table.ConceptBank.ConceptActionMenuButton
            status={info.row.original.status}
            reportStatus={info.row.original.reportStatusAggregate}
            identifier={info.row.original.identifier}
            seedUuid={info.row.original.seedUuid}
          />
        ),
      }),
    ];
  }, [handleGenerateConceptButton, isDebugModeEnabled, handleDebugTitleClick]);

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
    meta: {
      onRowClick: handleRowClick,
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
      updateTableFiltering,
      resetFilter,
      filterOptions,
      handleRowClick,
      isDebugModeEnabled,
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
      handleRowClick,
      isDebugModeEnabled,
    ],
  );
};
