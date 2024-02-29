import { FunctionComponent, useState } from 'react';
import styles from './styles/concepts.module.scss';
import { useQuery } from 'react-query';
import api from '../../../libs/api';
import Loading from '../../components/Loading';

import {
  ColumnFiltersState,
  FilterFn,
  createColumnHelper,
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import ConceptStatus from '../../components/ConceptStatus';
import StatusButton from '../../components/StatusButton';
import useConcepts from './hooks/useConcepts';
import { StatusList } from './Concepts.types';
import { Concept as ConceptType } from '../../../libs/api/typings';

const columnHelper = createColumnHelper<ConceptType>();

const Concepts: FunctionComponent = () => {
  const { activeFilter, statusLabelsObj, categoryCount, statusColorObj, category, conceptStatusList, activateFilter } =
    useConcepts();

  const { data, isLoading: isFilteredConceptLoading } = useQuery({
    queryKey: ['concepts', activeFilter, category],
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      return api.concept.getConcepts(activeFilter, category);
    },
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

  const columns = [
    columnHelper.accessor('title', {
      id: 'title',
      header: () => <span className={styles.details}>Company</span>,
      size: 400,
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
      size: 300,
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      header: () => <span>Last Modified</span>,
    }),
    columnHelper.accessor((row) => row?.status, {
      id: 'status',
      size: 300,
      header: () => <span>Status</span>,
      cell: (info) => (
        <div className={styles.reviewConceptLink}>
          <ConceptStatus status={statusLabelsObj[info?.getValue()]} color={statusColorObj[info?.getValue()]} />
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.results || [],
    columns,
    enableRowSelection: true,
    state: {
      columnFilters,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 500, //enforced during column resizing
      maxSize: 500, //enforced during column resizing
    },
  });

  const renderStatusButtons = (statusList: StatusList) => {
    return statusList.map((status, index) => (
      <StatusButton
        key={`status-button-${index}`}
        isActive={activeFilter === status}
        statusName={statusLabelsObj[status]}
        quantity={1}
        activateFilter={() => activateFilter(status)}
      />
    ));
  };

  return (
    <div className={styles.contentList}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <h1>{`${category} Concepts`}</h1>
        </div>
      </div>
      <div className={styles.content}>
        <table>
          {/* TODO move buttons outside <table> */}
          <div className={styles.filters}>
            <StatusButton
              statusName={`All ${category}`}
              quantity={categoryCount}
              isActive={!activeFilter}
              activateFilter={() => {
                setColumnFilters([{ id: 'status', value: '' }]);
                activateFilter('');
              }}
            />
            {renderStatusButtons(conceptStatusList)}
          </div>
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
          {isFilteredConceptLoading ? (
            <div className={styles.tableMessageContainer}>
              <Loading />
            </div>
          ) : (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} onClick={row.getToggleSelectedHandler()}>
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
      </div>
    </div>
  );
};

export default Concepts;
