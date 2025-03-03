import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Table, Text } from '@components';
import { useAssumptions } from '@hooks/query/assumptions.hook';
import { IAssumption } from '@libs/api/types';

const columnHelper = createColumnHelper<IAssumption>();

export const useAssumptionsTable = (conceptUuid: string) => {
  const { data, assumptions, isLoading } = useAssumptions(conceptUuid);
  const [selectedRowId, setSelectedRowId] = React.useState<string | undefined>(
    assumptions.length > 0 ? assumptions[0].uuid : undefined,
  );

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <Text.Collapsible
            title={info.getValue()}
            description={info.row.original.text}
            maxDescriptionHeight={40}
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
            riskCategory={info.row.original.riskCategory}
          />
        ),
      }),
      columnHelper.accessor('testProgress', {
        id: 'testingProgress',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <Table.Assumptions.StatusAndTestProgress
            status={info.row.original.status}
            testProgress={info.row.original.testProgress}
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
    initialState: {
      rowSelection: selectedRowId ? { [selectedRowId]: true } : {},
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (newSelectedRowIds) => {
      // Ensure only one row is selected at a time
      if (Object.keys(newSelectedRowIds).length > 1) {
        const firstSelectedRowId = Object.keys(newSelectedRowIds)[0];
        table.setRowSelection({ [firstSelectedRowId]: true });
      }
    },
  });

  const handleRowClick = (rowId: string) => {
    setSelectedRowId(rowId);
    table.setRowSelection({ [rowId]: true });
  };

  React.useEffect(() => {
    if (selectedRowId) {
      table.setRowSelection({ [selectedRowId]: true });
    } else if (!selectedRowId && assumptions.length > 1) {
      setSelectedRowId(assumptions[0].uuid);
    }
  }, [assumptions, selectedRowId, table]);

  return {
    table,
    columns,
    isLoading,
    assumptions,
    data,
    selectedAssumptionUuid: selectedRowId,
    handleRowClick,
  };
};
