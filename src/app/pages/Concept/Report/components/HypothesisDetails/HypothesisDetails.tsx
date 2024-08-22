import QuadrantChart, { ChartPoint } from '@components/Charts/QuadrantChart/QuadrantChart';
import Icon from '@components/Icons/Icon/Icon';
import Loading from '@components/Loading';
import AddKeyAssumptionModal from '@components/Modal/KeyAssumtionModal/AddKeyAssumptionModal';
import TablePagination from '@components/Tables/TablePagination';
import { useModal } from '@context/ModalContextProvider';
import { useKeyAssumptions } from '@hooks/query/concepts.hook';
import { getAssumptionActiveHexColor, getAssumptionHexColor } from '@libs/utils/concepts';
import {
  PaginationState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FunctionComponent, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssumptionsColumns } from './columns.hook';
import styles from './styles/hypothesisDetails.module.scss';

const HypothesisDetails: FunctionComponent = () => {
  const { columns } = useAssumptionsColumns();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { openModal } = useModal();

  const { id: conceptId = '' } = useParams();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });

  const selectedRowId = Object.keys(rowSelection)[0];

  const { data, assumptions, isLoading } = useKeyAssumptions(conceptId || '');

  const chartCoordinates: ChartPoint[] = useMemo(() => {
    if (!assumptions) {
      return [];
    }
    return assumptions.map((assumption) => {
      return {
        xCoord: assumption.impactLevel,
        yCoord: -assumption.difficultyLevel,
        id: assumption.uuid,
        color: getAssumptionHexColor(assumption.assumptionsType),
        activeColor: getAssumptionActiveHexColor(assumption.assumptionsType),
      };
    });
  }, [assumptions]);

  const table = useReactTable({
    getRowId: (row) => row.uuid,
    data: assumptions,
    columns,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    state: {
      rowSelection,
      pagination,
    },
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 100, //enforced during column resizing
      maxSize: 400, //enforced during column resizing
    },
  });
  return (
    <div className={styles.hypothesisDetails}>
      <div className={styles.header}>
        <div className={styles.supportingText}>
          <span className={styles.headerText}>Key Assumptions</span>
          <div className={styles.badge}>{data?.count}</div>
        </div>
        <button
          className='btn btn-light'
          onClick={() => {
            openModal(AddKeyAssumptionModal, { conceptUuid: conceptId });
          }}
        >
          <Icon variant='plus' />
        </button>
      </div>
      <div className={styles.tableChartContainer}>
        <div className={styles.tableContainer}>
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
            {isLoading ? (
              <span className={styles.tableMessageContainer}>
                <Loading />
              </span>
            ) : (
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={rowSelection?.hasOwnProperty(row.id) ? styles.selected : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      row.getToggleSelectedHandler()(e);
                    }}
                  >
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
            <TablePagination
              variant='client'
              totalPages={table.getPageCount()}
              page={table.getState().pagination.pageIndex + 1}
              setPage={table.setPageIndex}
              nextPageClient={() => table.nextPage()}
              previousPageClient={() => table.previousPage()}
              isNextPageDisabled={!table.getCanNextPage()}
              isPreviousPageDisabled={!table.getCanPreviousPage()}
            />
          </div>
        </div>
        <div className={styles.quadrantChartContainer}>
          <QuadrantChart
            yTopLabel='High Difficulty'
            yBottomLabel='Low Difficulty'
            xRightLabel='High Impact'
            xLeftLabel='Low Impact'
            chartCoordinates={chartCoordinates}
            selectedCoordinate={selectedRowId}
          />
        </div>
      </div>
    </div>
  );
};

export default HypothesisDetails;
