import { Loading, Table as TB } from '@components';
import { flexRender, Table } from '@tanstack/react-table';
import classNames from 'classnames';
import React from 'react';

interface IConceptTableProps<T = any> {
  header?: React.ReactNode;
  table: Table<T> | undefined;
  isLoading: boolean;
  footer?: React.ReactNode;
}

const AucctusTable: React.FC<IConceptTableProps<any>> = <T,>({
  header,
  table,
  footer,
  isLoading,
}: IConceptTableProps<T>) => {
  return (
    <div className='inline-flex h-auto  min-h-96 w-full flex-col items-start justify-between rounded-xl border border-gray-200 bg-white shadow-sm'>
      <div className='inline-flex w-full flex-col items-start justify-start'>
        {/* Header */}
        <div className='inline-flex h-[60px] w-full items-center justify-between rounded-t-xl border-b border-gray-200 px-6 py-3'>
          {header}
        </div>
        {/* Content */}
        {isLoading ? (
          // Loading Indicator
          <div className='flex h-full w-full items-center justify-center self-stretch align-middle'>
            <Loading />
          </div>
        ) : (
          // Table
          <div className='max-h-[calc(100vh-360px)] w-full overflow-y-scroll'>
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
          </div>
        )}
      </div>
      {/* Footer */}
      <div className='inline-flex h-[68px] w-full items-center justify-between self-end border-t border-gray-200 px-6 pb-4 pt-3'>
        {footer}
      </div>
    </div>
  );
};

export default AucctusTable;
