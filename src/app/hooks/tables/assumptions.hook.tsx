import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Table, Text } from '@components';
import {
  useAssumptions,
  useFilteredAssumptions,
} from '@hooks/query/assumptions.hook';
import { IAssumptionV1, IAssumptionV2 } from '@libs/api/types';

const columnHelperV1 = createColumnHelper<IAssumptionV1>();
const columnHelperV2 = createColumnHelper<IAssumptionV2>();

/**
 * TODO: DEPRECATE - Original table hook for V1 assumptions - used by AssumptionsV1.tsx
 * Remove this hook once AssumptionsV1.tsx is deprecated and all users migrate to V2
 */
export const useAssumptionsTable = (conceptUuid: string) => {
  const { data, assumptions, isLoading } = useAssumptions(conceptUuid);
  const [selectedRowId, setSelectedRowId] = React.useState<string | undefined>(
    assumptions.length > 0 ? assumptions[0].uuid : undefined,
  );

  const columns = React.useMemo(
    () => [
      columnHelperV1.accessor('name', {
        id: 'name',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <Text.Collapsible
            title={info.getValue()}
            description={info.row.original.text}
            maxDescriptionHeight={72}
          />
        ),
      }),
      columnHelperV1.accessor('category', {
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
      columnHelperV1.accessor('testProgress', {
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

/**
 * New table hook for V2 filtered assumptions with category filtering support - used by AssumptionsV2.tsx
 */
export const useFilteredAssumptionsTableV2 = (
  rootIdentifier: string,
  initialCategory: string = 'desirability',
) => {
  const [selectedCategory, setSelectedCategory] =
    React.useState<string>(initialCategory);
  const [selectedRowId, setSelectedRowId] = React.useState<
    string | undefined
  >();
  const [page, setPage] = React.useState<number>(1);

  const filters = React.useMemo(
    () => ({
      category: selectedCategory,
      page,
      page_size: 10,
    }),
    [selectedCategory, page],
  );

  const { data, assumptions, isLoading, count, numberOfPages, pageSize } =
    useFilteredAssumptions(rootIdentifier, filters);

  // Set first row as selected when data changes
  React.useEffect(() => {
    if (assumptions.length > 0 && !selectedRowId) {
      setSelectedRowId(assumptions[0].uuid);
    } else if (assumptions.length === 0) {
      setSelectedRowId(undefined);
    }
  }, [assumptions, selectedRowId]);

  const columns = React.useMemo(
    () => [
      columnHelperV2.accessor('statement', {
        id: 'statement',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <Text.Collapsible
            title={info.getValue()}
            description={info.getValue()}
            maxDescriptionHeight={72}
          />
        ),
      }),
      columnHelperV2.accessor('category', {
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
      columnHelperV2.accessor('certainty', {
        id: 'certainty',
        enableColumnFilter: false,
        header: () => null,
        cell: (info) => (
          <div className='text-sm'>
            Certainty: {Math.round(info.getValue() * 100)}%
          </div>
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
    state: {
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page when category changes
    setSelectedRowId(undefined); // Clear selection when category changes
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    table,
    columns,
    isLoading,
    assumptions,
    data,
    count,
    numberOfPages,
    pageSize,
    currentPage: page,
    selectedCategory,
    selectedAssumptionUuid: selectedRowId,
    handleRowClick,
    handleCategoryChange,
    handlePageChange,
  };
};
