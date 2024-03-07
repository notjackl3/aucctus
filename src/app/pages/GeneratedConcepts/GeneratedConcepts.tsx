import React, { FunctionComponent, useMemo, useState } from 'react';
import styles from './styles/generatedConcepts.module.scss';
import igniteStyles from '../IgniteConcept/styles/igniteConcept.module.scss';
import Loading from '../../components/Loading';

import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import useGeneratedConcepts from './hooks/useGeneratedConcepts';
import { IConcept } from '../../../libs/api/typings';
import TableCheckBox from '../../components/TableCheckBox';
import Icon from '../../components/Icon';
import IgniteLoading from '../../components/IgniteLoading';

const columnHelper = createColumnHelper<IConcept>();

const defaultIconProps = {
  stroke: '',
  width: 20,
  height: 20,
};

const GeneratedConcepts: FunctionComponent = () => {
  const {
    isIgniteLoading,
    rowSelection,
    numberSelectedConcepts,
    generatedConceptData,
    goalString,
    generateConcepts,
    saveNewConcepts,
    setRowSelection,
  } = useGeneratedConcepts();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row?.uuid, {
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
          <div className={styles.details}>
            <span className={styles.title}>{data.row.original.title}</span>
            <span className={`${styles.summary} ${styles.cellDescription}`}>{data.row.original.description}</span>
          </div>
        ),
      }),
    ],
    [generatedConceptData]
  );

  const tableData = useMemo(() => generatedConceptData ?? [], [generatedConceptData]);

  const table = useReactTable({
    // getRowId: (row) => row.uuid,
    data: tableData,
    columns,
    enableRowSelection: true,
    state: {
      columnFilters,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 100, //enforced during column resizing
      maxSize: 1000, //enforced during column resizing
    },
  });

  return (
    <React.Fragment>
      {isIgniteLoading ? (
        <div className={igniteStyles.ignite}>
          <IgniteLoading title="Igniting Your Concept" subtitle="This process takes about 10 seconds, please wait." />
        </div>
      ) : (
        <div className={styles.generatedConcepts}>
          <div className={styles.headerSection}>
            <div className={styles.header}>
              <h1>Generated Concepts</h1>
              <span className={styles.supportingText}>
                From the list below, choose the top concepts that you want to keep and continue building on
              </span>
            </div>
            <div className={styles.actions}>
              <button className="btn btn-light" onClick={() => generateConcepts(goalString)}>
                <Icon variant="refresh" {...defaultIconProps} /> Generate more
              </button>
            </div>
          </div>
          <div className={styles.content}>
            <table>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {false ? (
                <div className={styles.tableMessageContainer}>
                  <Loading />
                </div>
              ) : (
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td style={{ width: cell.column.getSize() }} key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
            <div className={styles.footer}>
              <div className={styles.actions}>
                <button
                  className="btn btn-primary"
                  disabled={!numberSelectedConcepts}
                  onClick={saveNewConcepts}
                >{`Save ${numberSelectedConcepts} Concepts`}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default GeneratedConcepts;
