import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Table } from '@components';
import { ITestFindings } from '@libs/api/types';

const columnHelper = createColumnHelper<ITestFindings>();

export const useFindingsAndResultsTable = (findings: ITestFindings[] = []) => {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('content', {
        id: 'content',
        enableColumnFilter: false,
        header: () => 'Findings',
        cell: (info) => (
          <Table.Column.Text
            className='flex w-full'
            value={info.getValue() || '--'}
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    getRowId: (row) => row.uuid,
    data: findings,
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
