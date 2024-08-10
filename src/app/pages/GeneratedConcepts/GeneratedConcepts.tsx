import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IGeneratedConcept } from '../../../libs/api/types';
import { AppPath } from '../../../routes/routes';
import Icon from '../../components/Icons/Icon/Icon';
import IgniteLoading from '../../components/IgniteLoading';
import Loading from '../../components/Loading';
import { useConceptIgnition, useSaveGeneratedConcepts } from '../../hooks/query/concepts.hook';
import { useConceptGenerationStore } from '../../stores/concept-generation.store';
import styles from './styles/generatedConcepts.module.scss';
import { useGeneratedConceptsColumns } from './table.hook';

const GeneratedConcepts: FunctionComponent = () => {
  const navigate = useNavigate();
  const { mutate: igniteConcept, isLoading: isGenerateLoading } = useConceptIgnition();
  const { mutate: saveConcepts, isLoading: isSaveLoading } = useSaveGeneratedConcepts();
  const { generatedConcepts: concepts, seed, clear, setGeneratedConcepts } = useConceptGenerationStore();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectedConcepts = useMemo((): IGeneratedConcept[] => {
    return concepts.reduce((acc: IGeneratedConcept[], concept) => {
      if (rowSelection[concept.uuid]) {
        acc.push(concept);
      }
      return acc;
    }, []);
  }, [concepts, rowSelection]);

  const hasSelectedConcepts = selectedConcepts.length > 0;

  const { columns, columnFilters, setColumnFilters } = useGeneratedConceptsColumns();

  const handleSaveConcepts = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      saveConcepts(
        {
          concepts: selectedConcepts,
          seed: seed,
        },
        {
          onSuccess: () => {
            // TODO: Add navigation state to navigate to list of new concepts
            navigate(AppPath.ConceptCategory);
            clear();
          },
        },
      );
    },
    [clear, selectedConcepts, navigate, saveConcepts, seed],
  );

  const handleGenerateConcepts = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      igniteConcept(
        { attributes: seed.attributes || [], numberOfConcepts: 10, type: seed.type || 'UNKNOWN' },
        {
          onSuccess: (response) => {
            setGeneratedConcepts([...response.concepts, ...concepts]);
          },
        },
      );
    },
    [concepts, igniteConcept, seed.attributes, seed.type, setGeneratedConcepts],
  );

  const tableData = useMemo(() => concepts ?? [], [concepts]);

  const table = useReactTable({
    getRowId: (row) => row.uuid,
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
      <div className={`${styles.generatedConcepts} flex min-h-screen flex-col`}>
        {isGenerateLoading ? (
          <IgniteLoading
            title='Generating A New Concept'
            subtitle='This process takes about 10 seconds, please wait.'
          />
        ) : (
          <>
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
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                  {isSaveLoading ? <Loading isSmall /> : `Save ${selectedConcepts.length} Concepts`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default GeneratedConcepts;
