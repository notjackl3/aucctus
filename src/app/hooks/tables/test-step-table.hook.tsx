import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Table } from '@components';
import { ITestStep } from '@libs/api/types';

const columnHelper = createColumnHelper<ITestStep>();

export const useTestStepTable = (steps: ITestStep[] = []) => {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('title', {
        id: 'title',
        enableColumnFilter: false,
        header: () => 'Step',
        cell: (info) => (
          <Table.Column.Text
            className='flex w-full'
            value={info.getValue() || '--'}
          />
        ),
      }),
      columnHelper.accessor('description', {
        id: 'description',
        enableColumnFilter: false,
        header: () => 'Description',
        cell: (info) => (
          <Table.Column.Text
            className='flex w-full'
            value={info.getValue() || '--'}
          />
        ),
      }),
      columnHelper.accessor('suggestedOutputAndConsiderations', {
        id: 'suggestedOutputAndConsiderations',
        enableColumnFilter: false,
        header: () => 'Suggested Output and Considerations',
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
    data: steps,
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
