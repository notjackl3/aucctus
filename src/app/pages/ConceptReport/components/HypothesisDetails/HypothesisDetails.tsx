import { FunctionComponent, useMemo, useState } from 'react';
import styles from './styles/hypothesisDetails.module.scss';
import { IAssumption } from '../../../../../libs/api/typings';
import {
  createColumnHelper,
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  PaginationState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import Loading from '../../../../components/Loading';
import TablePagination from '../../../../components/TablePagination';
import { useQuery } from 'react-query';
import api from '../../../../../libs/api';
import AssumptionBadge from '../../../../components/AssumptionBadge';
import { useParams } from 'react-router-dom';
import QuadrantChart from '../../../../components/QuadrantChart';
import { getAssumptionActiveHexColor, getAssumptionHexColor } from '../../../../../libs/concepts';
import GeneralBadge from '../../../../components/GeneralBadge';
import { ChartPoint } from '../../../../components/QuadrantChart/QuadrantChart';

const columnHelper = createColumnHelper<IAssumption>();

const HypothesisDetails: FunctionComponent = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { id: conceptId } = useParams();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });

  const selectedRowId = Object.keys(rowSelection)[0];

  const { data, isLoading: isAssumptionsLoading } = useQuery({
    queryKey: ['concepts/key-assumptions'],
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      return api.concept.getConceptKeyAssumptions(conceptId || '');
    },
  });

  const chartCoordinates: ChartPoint[] = useMemo(() => {
    if (!data || !data.results) {
      return [];
    }
    return data.results.map((assumption) => {
      return {
        xCoord: assumption.impactLevel,
        yCoord: -assumption.difficultyLevel,
        id: assumption.uuid,
        color: getAssumptionHexColor(assumption.assumptionsType),
        activeColor: getAssumptionActiveHexColor(assumption.assumptionsType),
      };
    });
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row?.uuid, {
        id: 'uuid',
        header: () => <span className={styles.details}>Title</span>,
        minSize: 300,
        size: 300,
        cell: (info) => (
          <div className={styles.assumption}>
            <span className={styles.assumptionTitle}>{info?.row?.original?.name}</span>
            <span className={`${styles.assumptionDescription} ${styles.cellDescription}`}>
              {info?.row?.original?.hypothesis}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.riskCategory, {
        id: 'riskCategory',
        cell: (info) => (
          <div className={styles.riskCategory}>
            <GeneralBadge variant={`${info.getValue()}Risk`} badgeText={info.getValue()} />
          </div>
        ),
        minSize: 125,
        size: 125,
        header: () => <span>Risk</span>,
      }),
      columnHelper.accessor((row) => row.assumptionsType, {
        id: 'assumptionsType',
        minSize: 150,
        size: 150,
        header: () => <span>Type</span>,
        cell: (info) => (
          <div className={styles.reviewConceptLink}>
            <AssumptionBadge assumptionType={info.getValue()} />
          </div>
        ),
      }),
    ],
    []
  );

  const tableData = useMemo(() => data?.results ?? [], [data]);
  const table = useReactTable({
    getRowId: (row) => row.uuid,
    data: tableData,
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
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.headerText}>Key Assumptions</span>
          <div className={styles.badge}>{data?.count}</div>
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
              {isAssumptionsLoading ? (
                <div className={styles.tableMessageContainer}>
                  <Loading />
                </div>
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
                variant="client"
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
              yTopLabel="High Difficulty"
              yBottomLabel="Low Difficulty"
              xRightLabel="High Impact"
              xLeftLabel="Low Impact"
              chartCoordinates={chartCoordinates}
              selectedCoordinate={selectedRowId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HypothesisDetails;
