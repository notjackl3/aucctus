import React, { FunctionComponent, useCallback, useMemo } from 'react';
import styles from './styles/generatedConcepts.module.scss';
import Loading from '../../components/Loading';

import { flexRender, getFilteredRowModel, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import useGeneratedConcepts from './generated-concepts.hook';

import IgniteLoading from '../../components/IgniteLoading';
import { useGeneratedConceptsColumns } from './table.hook';
import { useConceptIgnition, useSaveGeneratedConcepts } from '../../hooks/query/concepts.hook';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import Icon from '../../components/Icons/Icon/Icon';

const GeneratedConcepts: FunctionComponent = () => {
  const navigate = useNavigate();

  const { mutate: igniteConcept, isLoading: isGenerateLoading } = useConceptIgnition();
  const { mutate: saveConcepts, isLoading: isSaveLoading } = useSaveGeneratedConcepts();

  const {
    rowSelection,
    numberOfSelectedConcepts,
    seed,
    hasSelectedConcepts,
    concepts,
    selectedConcepts,
    setRowSelection,
  } = useGeneratedConcepts();
  const { columns, columnFilters, setColumnFilters } = useGeneratedConceptsColumns();

  const handleSaveConcepts = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      saveConcepts(
        {
          concepts: selectedConcepts,
          seed: {
            attributes: seed.attributes || [],
            type: seed.type || 'UNKNOWN',
          },
        },
        {
          onSuccess: () => {
            navigate(`${AppPath.ConceptCategory}?category=draft`);
          },
        },
      );
    },
    [navigate, saveConcepts, seed.attributes, seed.type, selectedConcepts],
  );

  const handleGenerateConcepts = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      igniteConcept(
        { attributes: seed.attributes || [], numberOfConcepts: 10, type: seed.type || 'UNKNOWN' },
        {
          onSuccess: (response) => {
            navigate(AppPath.GeneratedConcepts, {
              state: {
                concepts: [...concepts, ...response.concepts],
                seed: {
                  ...seed,
                  attributes: response.seed || seed.attributes,
                },
              },
            });
          },
        },
      );
    },
    [concepts, igniteConcept, navigate, seed],
  );

  const tableData = useMemo(() => concepts ?? [], [concepts]);

  const table = useReactTable({
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
      {isGenerateLoading ? (
        <IgniteLoading title='Generating A New Concept' subtitle='This process takes about 10 seconds, please wait.' />
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
              <button className='btn btn-light' onClick={handleGenerateConcepts}>
                <Icon variant='refresh' /> Generate more
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
                <span className={styles.tableMessageContainer}>
                  <Loading />
                </span>
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
              <button
                className='btn btn-primary disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600'
                disabled={!hasSelectedConcepts || isSaveLoading}
                onClick={handleSaveConcepts}
              >
                {isSaveLoading ? <Loading isSmall /> : `Save ${numberOfSelectedConcepts} Concepts`}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default GeneratedConcepts;
