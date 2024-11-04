import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Icon, Table } from '@components';
import { useUpdateConceptTestStep } from '@hooks/query/assumptions.hook';
import { ITestStep } from '@libs/api/types';
import { cn } from '@libs/utils/react';

const columnHelper = createColumnHelper<ITestStep>();

export const useTestStepTable = (testUuid: string, steps: ITestStep[] = []) => {
  const { mutate: updateConceptTestStep } = useUpdateConceptTestStep(testUuid);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('isCompleted', {
        id: 'isCompleted',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <button
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 p-1',
              info.getValue() ? 'bg-green-100' : 'bg-white',
            )}
            onClick={() =>
              updateConceptTestStep({
                uuid: info.row.original.uuid,
                isCompleted: !info.getValue(),
              })
            }
          >
            {info.getValue() ? (
              <Icon variant='check' className='text-green-500' />
            ) : null}
          </button>
        ),
      }),

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
        header: () => 'Suggested Output & Considerations',
        cell: (info) => (
          <Table.Column.Text
            className='flex w-full'
            value={info.getValue() || '--'}
          />
        ),
      }),
    ],
    [updateConceptTestStep],
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
