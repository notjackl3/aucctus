import { FunctionComponent, useMemo, useState } from 'react';
import {
  ColumnFiltersState,
  FilterFn,
  createColumnHelper,
  flexRender,
  RowSelectionState,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { dateCellFormatter } from '../../../../libs/utils';
import TableCheckBox from '../../../components/TableCheckBox';
import { IConcept } from '../../../../libs/api/typings';
import { rankItem } from '@tanstack/match-sorter-utils';

import styles from '../styles/concepts.module.scss';
import ConceptStatusBubble from '../../../components/ConceptStatusBubble';
import ConceptMenu from '../../../components/ConceptMenu';
import Icon from '../../../components/Icon';
import Loading from '../../../components/Loading';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../../routes/routes';
import ConceptRowButton from './ConceptRowButton';
import useConceptMenu from '../../../components/ConceptMenu/hooks/useConceptMenu';

const columnHelper = createColumnHelper<IConcept>();

const defaultIconProps = {
  stroke: '#B4BDD0',
  width: 24,
  height: 24,
};

interface IConceptTableProps {
  data: IConcept[];
  isLoading: boolean;
}

const ConceptTable: FunctionComponent<IConceptTableProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const { updateConceptStatus } = useConceptMenu({ conceptId: '' });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [openPopupMenuId, setOpenPopupMenuId] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fuzzyFilter: FilterFn<IConcept> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row?.status, {
        id: 'select',
        size: 50,
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
                  e.stopPropagation();
                  row.getToggleSelectedHandler()(e);
                },
                onClick: (e) => {
                  e.stopPropagation();
                },
              }}
            />
          );
        },
      }),
      columnHelper.accessor('title', {
        id: 'title',
        header: () => <span className={styles.details}>Company</span>,
        size: 150,
        minSize: 150,
        cell: (info) => <div className={styles.company}>{info.getValue()}</div>,
      }),
      columnHelper.accessor((row) => row?.description, {
        id: 'description',
        cell: (info) => (
          <span style={{ flexGrow: 1 }} className={styles.cellDescription}>
            {info.getValue()}
          </span>
        ),
        size: 200,
        minSize: 200,
        header: () => <div style={{ flexGrow: 1 }}>Description</div>,
      }),
      columnHelper.accessor((row) => row.updatedAt, {
        id: 'updatedAt',
        size: 150,
        minSize: 150,
        cell: (info) => dateCellFormatter(info.getValue()),
        header: () => <span>Last Modified</span>,
      }),
      columnHelper.accessor((row) => row?.status, {
        id: 'status',
        size: 200,
        minSize: 200,
        header: () => <span>Status</span>,
        cell: (info) => (
          <span>
            <ConceptStatusBubble status={info.getValue()} />
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.reportStatus, {
        id: 'reportStatus',
        cell: ({ row }) => (
          <ConceptRowButton
            variant={row.original.reportStatus}
            onClick={(e) => {
              if (row.original.reportStatus === 'notStarted') {
                updateConceptStatus('ideating', row.original.uuid);
                e.stopPropagation();
              }
            }}
          />
        ),
        minSize: 120,
        size: 120,
        header: () => {},
      }),
      columnHelper.accessor((row) => row?.uuid, {
        id: 'uuid',
        minSize: 30,
        size: 30,
        header: () => {},
        cell: (info) => (
          <span className={styles.conceptMenu}>
            <button
              className={styles.button}
              onClick={(e) => {
                setOpenPopupMenuId(info.getValue() === openPopupMenuId ? '' : info.getValue());
                e.stopPropagation();
              }}
            >
              <Icon variant="dotstVertical" {...defaultIconProps} />
            </button>
            {info?.getValue() === openPopupMenuId && (
              <span className={styles.popupMenu}>
                <ConceptMenu conceptId={openPopupMenuId} clearConceptMenuId={() => setOpenPopupMenuId('')} />
              </span>
            )}
          </span>
        ),
      }),
    ],
    [openPopupMenuId, updateConceptStatus]
  );

  const table = useReactTable({
    getRowId: (row) => row.uuid,
    data,
    columns,
    enableRowSelection: true,
    state: {
      columnFilters,
      rowSelection,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 50, //enforced during column resizing
      maxSize: 500, //enforced during column resizing
    },
  });

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                style={{ width: header.getSize(), flexGrow: header.column.id === 'description' ? 1 : 0 }}
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {isLoading ? (
        <div className={styles.tableMessageContainer}>
          <Loading />
        </div>
      ) : (
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={(e) => {
                e.stopPropagation();
                const reportStatus = row.getValue('reportStatus');
                if (reportStatus && reportStatus === 'complete') {
                  navigate(AppPath.ConceptOverview.replace(':id', row.id));
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  style={{ width: cell.column.getSize(), flexGrow: cell.column.id === 'description' ? 1 : 0 }}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
};

export default ConceptTable;
