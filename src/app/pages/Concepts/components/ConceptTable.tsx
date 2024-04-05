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
import { ConceptStatus, IConcept } from '../../../../libs/api/typings';
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
  const [excludeIdSet, setExcludeIdSet] = useState(new Set());
  const [isEntireCategorySelected, setIsEntireCategorySelected] = useState(false);
  const [openPopupMenuId, setOpenPopupMenuId] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const addExcludedId = (id: string) => {
    const newExcludedIds = new Set(excludeIdSet);
    newExcludedIds.add(id);
    setExcludeIdSet(newExcludedIds);
  };

  const removeExcludedId = (id: string) => {
    const newExcludedIds = new Set(excludeIdSet);
    newExcludedIds.delete(id);
    setExcludeIdSet(newExcludedIds);
  };

  const modifyExclusionSet = (isRowSelected: boolean, id: string) => {
    if (isRowSelected) {
      addExcludedId(id);
    } else {
      removeExcludedId(id);
    }
  };

  const toggleIsEntireCategorySelectedFlag = (isAllRowsSelected: boolean) => {
    setIsEntireCategorySelected(!isAllRowsSelected);
  };

  const clearPopupMenuId = () => {
    selectPopupMenuId('');
  };

  const selectPopupMenuId = (conceptId: string) => {
    if (conceptId === openPopupMenuId) {
      setOpenPopupMenuId('');
    } else {
      setOpenPopupMenuId(conceptId);
    }
  };

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
                setExcludeIdSet(new Set());
                toggleIsEntireCategorySelectedFlag(table.getIsAllRowsSelected());
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
                  modifyExclusionSet(row.getIsSelected(), row?.id);
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
        size: 200,
        minSize: 200,
        cell: (info) => <span className={styles.company}>{info?.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row?.description, {
        id: 'description',
        cell: (info) => <span className={styles.cellDescription}>{info?.getValue()}</span>,
        size: 300,
        header: () => <span>Description</span>,
      }),
      columnHelper.accessor((row) => row?.updatedAt, {
        id: 'updatedAt',
        size: 150,
        minSize: 150,
        cell: (info) => dateCellFormatter(info.getValue()),
        header: () => <span>Last Modified</span>,
      }),
      columnHelper.accessor((row) => row?.status, {
        id: 'status',
        size: 250,
        minSize: 250,
        header: () => <span>Status</span>,
        cell: (info) => (
          <span>
            <ConceptStatusBubble status={info?.getValue()} />
          </span>
        ),
      }),
      columnHelper.accessor((row) => row?.isGenerated, {
        id: 'isGenerated',
        cell: ({ row }) => (
          <ConceptRowButton
            // TODO change variant to row.original.reportStatus
            variant="complete"
            onClick={(e) => {
              // TODO remove placeholder false condition
              if (false || row.original.reportStatus === 'notStarted') {
                e.stopPropagation();
                updateConceptStatus(ConceptStatus.ideating, row.original.uuid);
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
                e.stopPropagation();
                selectPopupMenuId(info?.getValue());
              }}
            >
              <Icon variant="dotstVertical" {...defaultIconProps} />
            </button>
            {info?.getValue() === openPopupMenuId && (
              <span className={styles.popupMenu}>
                <ConceptMenu conceptId={openPopupMenuId} clearConceptMenuId={clearPopupMenuId} />
              </span>
            )}
          </span>
        ),
      }),
    ],
    [excludeIdSet, isEntireCategorySelected, openPopupMenuId]
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
              <th key={header.id} style={{ width: header.getSize() }}>
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
                // TODO change to reportStatus to prevent opening page
                // remove temp true condition
                const reportStatus = row.getValue('reportStatus');
                if (true || (reportStatus && reportStatus === 'complete')) {
                  navigate(AppPath.ConceptOverview.replace(':id', row.id));
                }
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
  );
};

export default ConceptTable;
