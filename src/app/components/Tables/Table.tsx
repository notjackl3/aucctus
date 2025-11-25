import { Table as TB } from '@components';
import { cn } from '@libs/utils/react';
import { flexRender, Table } from '@tanstack/react-table';
import React from 'react';

interface IAucctusTableProps<T = any>
  extends React.HTMLAttributes<HTMLTableElement> {
  table: Table<T> | undefined;
  selectedRowId?: string;
  handleRowClick?: (rowId: string) => void;
  emptyTableText?: string;
  theadProps?: React.HTMLAttributes<HTMLTableSectionElement>;
  tbodyProps?: React.HTMLAttributes<HTMLTableSectionElement>;
  tfootProps?: React.HTMLAttributes<HTMLTableSectionElement>;
  rowProps?: React.HTMLAttributes<HTMLTableRowElement>;
  headerProps?: React.HTMLAttributes<HTMLTableHeaderCellElement>;
}

const AucctusTable: React.FC<IAucctusTableProps> = <T,>({
  table,
  selectedRowId,
  handleRowClick,
  theadProps,
  tbodyProps,
  tfootProps,
  rowProps,
  headerProps,
  emptyTableText = 'No data available',

  ...props
}: IAucctusTableProps<T>) => {
  return (
    <table
      {...props}
      className={cn('w-full text-gray-600', props.className)}
      style={{
        tableLayout: 'fixed',
        borderCollapse: 'separate',
        borderSpacing: 0,
        ...props.style,
      }}
    >
      <thead
        {...theadProps}
        className={cn(
          'aucctus-bg-primary sticky top-0 z-10',
          theadProps?.className,
        )}
      >
        {table &&
          table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TB.Header {...headerProps} key={header.id} header={header} />
              ))}
            </tr>
          ))}
      </thead>
      <tbody
        {...tbodyProps}
        className={cn(
          'aucctus-bg-secondary-extra-subtle w-full',
          {
            'h-64': !table?.getRowModel().rows.length, // Apply min height when empty
          },
          tbodyProps?.className,
        )}
      >
        {table &&
          table
            .getRowModel()
            .rows.map((row) => (
              <TB.Row
                {...rowProps}
                key={row.id}
                row={row}
                handleClick={handleRowClick}
                isSelected={selectedRowId === row.id}
              />
            ))}
        {/* Display a message if the table is empty */}
        {!table?.getRowModel().rows.length && (
          <tr>
            <td
              colSpan={table?.getHeaderGroups()[0]?.headers.length || 1}
              className='aucctus-text-tertiary py-6 text-center'
            >
              {emptyTableText}
            </td>
          </tr>
        )}
      </tbody>
      <tfoot {...tfootProps}>
        {table &&
          table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
      </tfoot>
    </table>
  );
};

export default AucctusTable;
