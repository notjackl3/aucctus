import {
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { Input, Table } from '@components';
import { IGeneratedConcept } from '@libs/api/types';
import { useConceptGenerationStore } from '@stores/concept-generation.store';

const columnHelper = createColumnHelper<IGeneratedConcept>();

export const useGeneratedConcepts = () => {
  const { generatedConcepts: concepts } = useConceptGenerationStore();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectedConcepts = React.useMemo((): IGeneratedConcept[] => {
    return concepts.reduce((acc: IGeneratedConcept[], concept) => {
      if (rowSelection[concept.uuid]) {
        acc.push(concept);
      }
      return acc;
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts, rowSelection]);

  const hasSelectedConcepts = selectedConcepts.length > 0;

  const columns = React.useMemo(
    () => [
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
                  row.getToggleSelectedHandler()(e);
                },
              }}
            />
          );
        },
      }),
      columnHelper.accessor('title', {
        id: 'title',
        enableColumnFilter: false,
        enableSorting: false,
        header: () => 'Concept',
        cell: (info) => (
          <Table.ConceptBank.TitleDescription title={info.getValue()} description={info.row.original.description} />
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    getRowId: (row) => row.uuid,
    data: concepts,
    columns,
    enableRowSelection: true,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return {
    selectedConcepts,
    hasSelectedConcepts,
    table,
    columns,
    columnFilters,
    setColumnFilters,
  };
};
