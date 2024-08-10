import { Icon, Loading, Table as TB } from '@components';
import { clamp } from '@libs/utils';
import { flexRender, Table } from '@tanstack/react-table';
import classNames from 'classnames';
import React from 'react';

interface IPagination {
  flipPage: (page: number) => void;
  page: number;
  numberOfPages: number;
}

interface IConceptTableProps<T = any> {
  header?: string | React.ReactNode;
  table: Table<T> | undefined;
  pagination?: IPagination;
  isLoading: boolean;
}

const AucctusTable: React.FC<IConceptTableProps<any>> = <T,>({
  header,
  table,
  pagination,
  isLoading,
}: IConceptTableProps<T>) => {
  const handlePageChange = React.useCallback(
    (page: number) => () => {
      if (!pagination) return;

      const newPage = clamp(page, 0, pagination.numberOfPages);

      if (newPage === pagination.page) return;

      pagination.flipPage(newPage);
    },
    [pagination],
  );

  return (
    <div className='inline-flex h-auto min-h-96 w-full flex-col items-start justify-between rounded-xl border border-gray-300 bg-white shadow'>
      <div className='inline-flex w-full flex-col items-start justify-start'>
        {/* Header */}
        <div className='inline-flex h-[60px] w-full items-center justify-between rounded-t-xl border-b border-gray-300 px-6 py-3'>
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
          <table className='w-full table-auto text-gray-600'>
            <thead className='border-b border-gray-300'>
              {table &&
                table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TB.Header header={header} />
                    ))}
                  </tr>
                ))}
            </thead>
            <tbody
              className={classNames('w-full bg-gray-50', {
                'min-h-96': !table?.getRowModel().rows.length, // Apply min height when empty
              })}
            >
              {table && table.getRowModel().rows.map((row) => <TB.Row row={row} />)}
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
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
            </tfoot>
          </table>
        )}
      </div>
      {/* Footer */}
      {pagination ? (
        <div className='inline-flex h-[68px] w-full items-center justify-between self-end border-t border-gray-300 px-6 pb-4 pt-3'>
          <button
            className='btn btn-light'
            onClick={handlePageChange(pagination.page - 1)}
            aria-label='Previous Page'
            disabled={pagination.page <= 1}
          >
            <Icon variant='arrowleft' width={20} height={20} />
            Previous
          </button>
          <div className=''>...</div>
          <button
            className='btn btn-light'
            onClick={handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.numberOfPages}
            aria-label='Next Page'
          >
            Next
            <Icon variant='arrowright' width={20} height={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AucctusTable;
