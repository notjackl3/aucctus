import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Badge, Icon, Table } from '@components';
import { IAssumptionsToTest } from '@libs/api/types';

const columnHelper = createColumnHelper<IAssumptionsToTest>();

export const useAssumptionsToTestTable = (
  assumptions: IAssumptionsToTest[] = [],
) => {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        enableColumnFilter: false,
        header: () => 'Assumptions',
        cell: (info) => (
          <span className='flex items-center gap-1.5 text-wrap'>
            <Icon.AssumptionCategory category={info.row.original.category} />
            <Table.Column.Text
              className='flex text-wrap'
              value={info.row.original.name}
            />
          </span>
        ),
      }),
      columnHelper.accessor('goal', {
        id: 'goal',
        enableColumnFilter: false,
        header: () => 'Testing Goal',
        cell: (info) => (
          <Table.Column.Text
            className='flex'
            value={info.getValue() || '--'}
          />
        ),
      }),
      columnHelper.accessor('findings', {
        id: 'findings',
        enableColumnFilter: false,
        header: () => 'Findings',
        cell: (info) => (
          <Table.Column.Text
            className='flex'
            value={info.getValue() || '--'}
          />
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        enableColumnFilter: false,
        header: () => 'Validation Status',
        cell: (info) => (
          <Badge.ValidationStatus status={info.row.original.status} />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    getRowId: (row) => row.testDetailsUuid,
    data: assumptions,
    columns,
    enableRowSelection: true,

    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    table,
    columns,
  };
};
