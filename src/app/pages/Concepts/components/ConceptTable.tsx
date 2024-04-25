import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  ColumnFiltersState,
  FilterFn,
  flexRender,
  RowSelectionState,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { IConcept } from '../../../../libs/api/types';
import { rankItem } from '@tanstack/match-sorter-utils';
import styles from '../styles/concepts.module.scss';
import Loading from '../../../components/Loading';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../../routes/routes';
import { useConceptTableColumns } from '../columns.hook';

interface IConceptTableProps {
  data: IConcept[];
  isLoading: boolean;
}

const ConceptTable: FunctionComponent<IConceptTableProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [openPopupMenuId, setOpenPopupMenuId] = useState<string | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);
  const columns = useConceptTableColumns(menuRef, setOpenPopupMenuId, openPopupMenuId);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    if (!openPopupMenuId) {
      return;
    }

    const handleKeyDown = () => {
      setOpenPopupMenuId(undefined);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenPopupMenuId(undefined);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPopupMenuId]);

  const fuzzyFilter: FilterFn<IConcept> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

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
                  style={{
                    width: cell.column.getSize(),
                    flexGrow: cell.column.id === 'description' ? 1 : 0,
                    justifyContent: cell.column.id === 'reportStatus' ? 'flex-end' : 'flex-start',
                  }}
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
