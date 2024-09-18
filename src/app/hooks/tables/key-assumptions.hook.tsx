import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Table } from '@components';
import { useKeyAssumptions } from '@hooks/query/concepts.hook';
import { IAssumption } from '@libs/api/types';

const columnHelper = createColumnHelper<IAssumption>();

export const useKeyAssumptionsTable = (conceptUuid: string) => {
  const { assumptions } = useKeyAssumptions(conceptUuid);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <Table.Column.TitleDescription
            title={info.getValue()}
            description={info.row.original.text}
          />
        ),
      }),
      columnHelper.accessor('category', {
        id: 'category',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <Table.Assumptions.RiskAndCategory
            category={info.row.original.category}
            riskLevel='high'
          />
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <Table.Assumptions.StatusAndTestProgress
            status={info.row.original.status}
          />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    getRowId: (row) => row.uuid,
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
