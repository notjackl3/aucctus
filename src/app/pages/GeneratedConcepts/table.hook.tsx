import React, { useMemo, useState } from 'react';
import styles from './styles/generatedConcepts.module.scss';

import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table';

import { IGeneratedConcept } from '../../../libs/api/types';
import TableCheckBox from '../../components/Tables/TableCheckBox';

const columnHelper = createColumnHelper<IGeneratedConcept>();

export const useGeneratedConceptsColumns = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        id: 'select',
        size: 100,
        header: ({ table }) => (
          <TableCheckBox
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
            <TableCheckBox
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
        header: () => <span className={styles.details}>Concept Name</span>,
        size: 1000,
        cell: (data) => (
          <span className={styles.details}>
            <span className={styles.title}>{data.row.original.title}</span>
            <span className={`${styles.summary} ${styles.cellEllipsis}`}>{data.row.original.description}</span>
          </span>
        ),
      }),
    ],
    [],
  );

  return {
    columns,
    columnFilters,
    setColumnFilters,
  };
};
