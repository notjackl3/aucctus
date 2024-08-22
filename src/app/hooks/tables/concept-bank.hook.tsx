import { Button, Table } from '@components';
import { useConcepts } from '@hooks/query/concepts.hook';
import { ConceptSort, ConceptStatus, IConcept, IUser, SortableConceptProperties } from '@libs/api/types';
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

import { useConceptUpdate, useRetryConceptReport } from '@hooks/query/concepts.hook';
import utils from '@libs/utils';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<IConcept>();

export interface IConceptFilterOptions {
  // id?: string;
  status: Set<ConceptStatus>;
  createdBy?: IUser;
  search?: string;
  sort?: ConceptSort;
}

const INITIAL_FILTER: IConceptFilterOptions = {
  status: new Set<ConceptStatus>(),
};

const PAGE_SIZE = 20;

export const areFilterOptionsSet = (filterOptions: IConceptFilterOptions): boolean => {
  const { status, createdBy, search, sort } = filterOptions;

  return (
    (status && status.size > 0) || // Check if 'status' set is not empty
    !!createdBy || // Check if 'createdBy' is set
    !!search || // Check if 'search' is set
    !!sort
  );
};

function isSortableConceptProperty(value: string): value is SortableConceptProperties {
  const arr: SortableConceptProperties[] = ['createdAt', 'updatedAt', 'status', 'title'];
  return (arr as string[]).includes(value);
}

export const useConceptBank = () => {
  const navigate = useNavigate();
  const { mutate: updateConcept } = useConceptUpdate();
  const { mutate: retryConceptReport } = useRetryConceptReport();
  const [filterOptions, setFilterOptions] = React.useState<IConceptFilterOptions>(INITIAL_FILTER);
  const [page, setPage] = React.useState<number>(1);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Fetch concepts based on the search parameters
  const { data, isLoading } = useConcepts({
    // category,
    // Convert the array of visible statuses to a query string (ie ideating,new)
    status: Array.from(filterOptions.status).join(',') || undefined,
    createdBy: filterOptions.createdBy
      ? `${filterOptions.createdBy.firstName} ${filterOptions.createdBy.lastName}`
      : undefined,
    search: filterOptions.search,
    page,
    sort: filterOptions.sort,
  });

  const updateTableFiltering = React.useCallback(
    (value: Partial<IConceptFilterOptions>) => {
      setFilterOptions({ ...filterOptions, ...value });
    },
    [filterOptions],
  );

  const resetFilter = React.useCallback(() => {
    setFilterOptions(INITIAL_FILTER);
    setSorting([]);
  }, []);

  const handleGenerateConceptButton = React.useCallback(
    (row: Row<IConcept>) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;

      if (newSorting.length === 0) {
        updateTableFiltering({ sort: undefined });
      }
      const value = newSorting[0];
      if (value) {
        if (isSortableConceptProperty(value.id)) {
          const sortValue = (value.desc ? `-${value.id}` : value.id) as ConceptSort;
          updateTableFiltering({ sort: sortValue });
        }
      }

      setSorting(newSorting);
    },
    [sorting, updateTableFiltering],
  );

  const columns = useMemo<ColumnDef<IConcept, any>[]>(() => {
    return [
      // columnHelper.accessor('uuid', {
      //   id: 'select',
      //   enableColumnFilter: false,
      //   enableSorting: false,
      //   header: ({ table }) => (
      //     <Input.CheckBox
      //       {...{
      //         checked: table.getIsAllRowsSelected(),
      //         indeterminate: table.getIsSomeRowsSelected(),
      //         onChange: (event) => {
      //           table.getToggleAllPageRowsSelectedHandler()(event);
      //         },
      //       }}
      //     />
      //   ),
      //   cell: ({ row }) => {
      //     return (
      //       <Input.CheckBox
      //         {...{
      //           checked: row.getIsSelected(),
      //           disabled: !row.getCanSelect(),
      //           indeterminate: row.getIsSomeSelected(),
      //           onChange: (e) => {
      //             e.stopPropagation();
      //             row.getToggleSelectedHandler()(e);
      //           },
      //           onClick: (e) => {
      //             e.stopPropagation();
      //           },
      //         }}
      //       />
      //     );
      //   },
      // }),
      columnHelper.accessor('title', {
        id: 'title',
        sortingFn: 'text',
        enableColumnFilter: false,
        header: () => 'Concept',
        cell: (info) => (
          <Table.ConceptBank.TitleDescription title={info.getValue()} description={info.row.original.description} />
        ),
      }),
      columnHelper.accessor((row) => utils.time.dateFormatter(row.createdAt), {
        id: 'createdAt',
        enableColumnFilter: false,
        sortingFn: 'datetime',
        size: 167,
        maxSize: 167,
        enableResizing: false,
        cell: (info) => (
          <span className='flex w-[167px] flex-row items-center justify-center gap-2'>
            <Table.ConceptBank.CreatedBy user={info.row.original.createdBy} />
            <Table.ConceptBank.Text className='text-nowrap' value={info.getValue()} />
          </span>
        ),
        header: () => 'Created',
      }),
      columnHelper.accessor('status', {
        id: 'status',
        sortingFn: 'text',
        size: 175,
        maxSize: 175,
        header: () => 'Status',
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
            <Button.ConceptGenerate variant={row.original.reportStatus} onClick={handleGenerateConceptButton(row)} />
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
        cell: (info) => <Table.ConceptBank.MenuButton status={info.row.original.status} uuid={info.getValue()} />,
      }),
    ];
  }, [handleGenerateConceptButton]);

  const table = useReactTable({
    getRowId: (row) => row.uuid,
    data: data?.results || [],
    columns,
    enableRowSelection: true,
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
  });

  return {
    isLoading,
    numberOfPages: data?.numberOfPages || 0,
    page,
    setPage,
    table,
    columns,
    updateTableFiltering,
    resetFilter,
    filterOptions,
  };
};
