import { flexRender, Row } from '@tanstack/react-table';
import classNames from 'classnames';
import React from 'react';

// Props for the TableHeader component
interface ITableRowProps<T> {
  row: Row<T>;
  handleClick?: (rowId: string) => void;
  isSelected: boolean;
}

// TableHeader Component
const TableRow: React.FC<ITableRowProps<any>> = <T,>({
  row,
  handleClick,
  isSelected = false,
}: ITableRowProps<T>) => {
  return (
    <tr
      className={classNames(
        'table-row h-auto cursor-pointer border-b border-solid border-b-gray-200 ',
        {
          // The from-** styles are used so that the the expandable text can inherit these colors and they are all in one place
          'bg-primary-100 from-primary-100': isSelected,
          'odd:bg-white odd:from-white even:bg-gray-50 even:from-gray-50':
            !isSelected,
        },
      )}
      key={`row-${row.id}`}
      onClick={() => handleClick && handleClick(row.id)}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          className='break-words bg-inherit p-3 text-base font-normal first:pl-6 last:pr-6'
          key={`cell-${cell.id}`}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
