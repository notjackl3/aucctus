import { FunctionComponent, useMemo, useState } from 'react';
import styles from './styles/hypothesisDetails.module.scss';
import { IConcept } from '../../../../../libs/api/typings';
import {
  createColumnHelper,
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import Loading from '../../../../components/Loading';
import TablePagination from '../../../../components/TablePagination';
import { useQuery } from 'react-query';
import { IConceptQueryOptions } from '../../../../../libs/api/endpoints';
import api from '../../../../../libs/api';
import AssumptionBadge from '../../../../components/AssumptionBadge';
import { AssumptionType } from '../../../../components/AssumptionBadge/AssumptionBadge';

const columnHelper = createColumnHelper<IConcept>();

export interface HypothesisDetailsProps {
  conceptData?: IConcept;
}

const HypothesisDetails: FunctionComponent<HypothesisDetailsProps> = () => {
  const [activePage, setActivePage] = useState(1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // TODO remove placeholder data and fetch assumption data
  const placehodlerAssumptionType = AssumptionType.feasibility;
  const { data, isLoading: isAssumptionsLoading } = useQuery({
    queryKey: ['concepts/key-assumptions', activePage],
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      const queryOptionsObj: IConceptQueryOptions = {
        ...(activePage && { page: activePage }),
      };
      return api.concept.getConcepts(queryOptionsObj);
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        id: 'title',
        header: () => <span className={styles.details}>Title</span>,
        size: 400,
        cell: (info) => (
          <div className={styles.assumption}>
            <span className={styles.assumptionTitle}>{info?.row?.original?.title}</span>
            <span className={`${styles.assumptionDescription} ${styles.cellDescription}`}>
              {info?.row?.original?.description}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row?.status, {
        id: 'risk',
        cell: () => <span className={styles.cellDescription}>{'Medium'}</span>,
        size: 300,
        header: () => <span>Risk</span>,
      }),
      columnHelper.accessor((row) => row?.status, {
        id: 'assumptionsType',
        size: 300,
        header: () => <span>Type</span>,
        cell: () => (
          <div className={styles.reviewConceptLink}>
            <AssumptionBadge assumptionType={placehodlerAssumptionType} />
          </div>
        ),
      }),
    ],
    [activePage]
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
    },
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 200, //enforced during column resizing
      maxSize: 200, //enforced during column resizing
    },
  });
  return (
    <div className={styles.hypothesisDetails}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.headerText}>Key Assumptions</span>
          <div className={styles.badge}>10</div>
        </div>
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
          <TablePagination totalPages={1} page={activePage} setPage={setActivePage} />
        </div>
      </div>
    </div>
  );
};

export default HypothesisDetails;
