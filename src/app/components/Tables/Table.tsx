import { Table as TB } from '@components';
import { flexRender, Table } from '@tanstack/react-table';
import classNames from 'classnames';
import React from 'react';

interface IConceptTableProps<T = any> {
  table: Table<T> | undefined;
}

const AucctusTable: React.FC<IConceptTableProps<any>> = <T,>({
  table,
}: IConceptTableProps<T>) => {
  return (
    <table className='w-full table-auto text-gray-600'>
      <thead className='border-b border-gray-200'>
        {table &&
          table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TB.Header key={header.id} header={header} />
              ))}
            </tr>
          ))}
      </thead>
      <tbody
        className={classNames('w-full bg-gray-50', {
          'min-h-96': !table?.getRowModel().rows.length, // Apply min height when empty
        })}
      >
        {table &&
          table
            .getRowModel()
            .rows.map((row) => <TB.Row key={row.id} row={row} />)}
        {/* Display a message if the table is empty */}
        {!table?.getRowModel().rows.length && (
          <tr>
            <td
              colSpan={table?.getHeaderGroups()[0]?.headers.length || 1}
              className='py-6 text-center text-gray-500'
            >
              No data available
            </td>
          </tr>
        )}
      </tbody>
      <tfoot>
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
