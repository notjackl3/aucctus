import { flexRender, Row } from '@tanstack/react-table';
import React from 'react';

// Props for the TableHeader component
interface ITableRowProps<T> {
  row: Row<T>;
}

// TableHeader Component
const TableRow: React.FC<ITableRowProps<any>> = <T,>({
  row,
}: ITableRowProps<T>) => {
  return (
    <tr
      className='table-row h-auto cursor-pointer border-b border-solid border-b-gray-200 odd:bg-white'
      key={row.id}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          className='break-words p-3 text-base font-normal first:pl-6 last:pr-6'
          key={cell.id}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
