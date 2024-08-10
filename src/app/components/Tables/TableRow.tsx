import { Row, flexRender } from '@tanstack/react-table';
import React from 'react';

// Props for the TableHeader component
interface ITableRowProps<T> {
  row: Row<T>;
}

// TableHeader Component
const TableRow: React.FC<ITableRowProps<any>> = <T,>({ row }: ITableRowProps<T>) => {
  return (
    <tr className='h-auto cursor-pointer border-b border-solid border-b-gray-200 px-6 py-3 odd:bg-white' key={row.id}>
      {row.getVisibleCells().map((cell) => (
        <td className='break-words px-3 py-3 text-base font-normal first:pl-6 last:pr-8' key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
