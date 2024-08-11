import { Button, Input, Table } from '@components';
import { useConcepts } from '@hooks/query/concepts.hook';
import { ConceptCategory, ConceptStatus, IConcept, IUser } from '@libs/api/types';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  PaginationState,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { useConceptUpdate, useRetryConceptReport } from '@hooks/query/concepts.hook';
import { dateFormatter } from '@libs/utils';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<IConcept>();

export const useConceptTable = () => {
  const navigate = useNavigate();
  const { mutate: updateConcept } = useConceptUpdate();
  const { mutate: retryConceptReport } = useRetryConceptReport();
  const [visibleStatuses, setVisibleStatuses] = React.useState<Set<ConceptStatus>>(new Set());
  const [category, setCategory] = React.useState<ConceptCategory | undefined>(undefined);
  const [searchParam, setSearchParam] = React.useState<string | undefined>(undefined);

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  // Fetch concepts based on the search parameters
  const { data, isLoading } = useConcepts({
    category,
    status: Array.from(visibleStatuses).join(',') || undefined,
    page: pagination.pageIndex + 1,
    search: searchParam,
  });

  const setPage = React.useCallback(
    (page: number) => {
      setPagination({
        ...pagination,
        pageIndex: page,
      });
    },
    [pagination],
  );

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

  const columns = useMemo<ColumnDef<IConcept, any>[]>(() => {
    return [
      columnHelper.accessor('uuid', {
        id: 'select',
        enableColumnFilter: false,
        enableSorting: false,
        header: ({ table }) => (
          <Input.CheckBox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: (event) => {
                table.getToggleAllPageRowsSelectedHandler()(event);
              },
            }}
          />
        ),
        cell: ({ row }) => {
          return (
            <Input.CheckBox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: (e) => {
                  e.stopPropagation();
                  row.getToggleSelectedHandler()(e);
                },
                onClick: (e) => {
                  e.stopPropagation();
                },
              }}
            />
          );
        },
      }),
      columnHelper.accessor('title', {
        id: 'title',
        sortingFn: 'text',
        enableColumnFilter: false,
        header: () => 'Concept',
        cell: (info) => (
          <span className='flex flex-col justify-start gap-2'>
            <Table.ConceptBank.Title title={info.getValue()} />
            <Table.ConceptBank.Text value={info.row.original.description} />
          </span>
        ),
      }),

      columnHelper.accessor('status', {
        id: 'status',
        sortingFn: 'text',
        header: () => 'Status',
        cell: (info) => <Table.ConceptBank.Status value={info.getValue()} />,
        enableColumnFilter: false,
      }),

      columnHelper.accessor((row) => dateFormatter(row.createdAt), {
        id: 'createdAt',
        enableColumnFilter: false,
        sortingFn: 'datetime',
        cell: (info) => (
          <span className='flex flex-row items-center justify-center gap-2'>
            <Table.ConceptBank.CreatedBy user={info.row.original.createdBy} />
            <Table.ConceptBank.Text className='text-nowrap' value={info.getValue()} />
          </span>
        ),
        header: () => 'Created',
      }),
      columnHelper.accessor('reportStatus', {
        id: 'reportStatus',
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <span className='m-auto flex h-full w-full items-center justify-end self-stretch align-middle'>
            <Button.ConceptGenerate variant={row.original.reportStatus} onClick={handleGenerateConceptButton(row)} />
          </span>
        ),
        header: () => {},
      }),
      columnHelper.accessor('uuid', {
        id: 'uuid',
        enableColumnFilter: false,
        enableSorting: false,
        header: () => {},
        cell: (info) => {
          const uuid = info.getValue();
          const { reportStatus, status } = info.row.original;

          return <Table.ConceptBank.MenuButton />;
        },
      }),
    ];
  }, [handleGenerateConceptButton]);

  const table = useReactTable({
    getRowId: (row) => row.uuid,
    data: data?.results || [],
    columns,
    enableRowSelection: true,
    pageCount: data?.numberOfPages || 0,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  return {
    isLoading,
    numberOfPages: data?.numberOfPages || 0,
    page: pagination.pageIndex,
    setPage,
    visibleStatuses,
    setVisibleStatuses,
    table,
    columns,
    searchParam,
    setSearchParam,
  };
};

const userSort = (rowA: Row<IConcept>, rowB: Row<IConcept>, columnId: string): number => {
  const userA: IUser = rowA.original[columnId as keyof IConcept];
  const userB: IUser = rowB.original[columnId as keyof IConcept];

  const fullNameA = `${userA.firstName} ${userA.lastName}`;
  const fullNameB = `${userB.firstName} ${userB.lastName}`;

  return fullNameA.localeCompare(fullNameB);
};
